import { keyActive, keyVals, getKey } from './input.js'
import { load_font } from './font.js';
import { play_sound } from './sound.js'

export class CPU {

    constructor(cos) {
        this.stack = []
        this.memory = new Uint8Array(4096)
        this.registers = new Uint8Array(16)
        this.pc = 0x200
        this.I = 0
        this.delayTimer = 0
        this.soundTimer = 0

        // Configurable
        this.cosmac = cos

        load_font(this.memory)
    }

    getDelay = function () {
        return this.delayTimer
    }
    getSound = function () {
        return this.soundTimer
    }
    getI = function () {
        return this.I
    }
    getRegisters = function () {
        return this.registers
    }
    getPC = function () {
        return this.pc
    }
};

export const getInstruction = (cpu) => {
    let instr1 = cpu.memory[cpu.pc];
    let instr2 = cpu.memory[cpu.pc + 1];
    cpu.pc +=2
    return ((0xffff & instr1) << 8) + instr2;
};

export const decodeInstruction = (cpu, op, display) => {
    let O = (op & 0xf000) >> 12;
    let X = ((op & 0x0f00) << 4) >> 12;
    let Y = ((op & 0x00f0) << 8) >> 12;
    let N = ((op & 0x000f) << 12) >> 12;

    let currpc = cpu.pc
    let instruction = ''

    switch (O) {
        case 0:
            if(N === 0xE) {  // Return Subroutine
                instruction = returnSub(cpu)
            } else if (Y === 0xE) { // Clear Screen
                instruction = clearScreen(display)
            }
            break;
        case 0x1: // Jump
            instruction = jump(cpu, op) 
            break;
        case 0x2: // Call Subroutine
            instruction = callSub(cpu, op)
            break;
        case 0x3: // Skip if equal
            instruction = skipIfEqual(cpu, X, op)
            break;
        case 0x4: // Skip if not equal
            instruction = skipIfNotEqual(cpu, X, op)
            break;
        case 0x5: // Skip if registers equal
            instruction = skipIfRegEqual(cpu, X, Y)
            break;
        case 0x6: // set register vx
            instruction = setVX(cpu, X, op)
            break;
        case 0x7: // add value to register vx
            instruction = VXplusN(cpu, X, op)
            break;

        // Logical/Arithmetic opuctions:
        case 0x8:
            switch (N) {
                case 0: // Set
                    instruction = VXeqVY(cpu, X, Y)
                    break;
                case 1: // OR
                    instruction = VXorVY(cpu, X, Y)
                    break;
                case 2: // AND
                    instruction = VXandVY(cpu, X, Y)
                    break;
                case 3: // XOR
                    instruction = VXxorVY(cpu, X, Y)
                    break;
                case 4: // Add
                    instruction = VXplusVY(cpu, X, Y)
                    break;
                case 5: // Subtract (x - y)
                    instruction = VXsubVY(cpu, X, Y)
                    break;
                case 6: // Shift right
                    instruction = VXshiftR(cpu, X, Y)
                    break;
                case 7: // Subtract (y - x)
                    instruction = VYsubVX(cpu, X, Y)
                    break;
                case 0xE: // Shift left
                    instruction = VXshiftL(cpu, X, Y)
                    break;
            }
            break;

        case 0x9: // Skip if registers not equal
            instruction = skipIfRegNotEqual(cpu, X, Y)
            break;
        case 0xA: // Set index register I
            instruction = setIndex(cpu, op)
            break;
        case 0xB: // Jump with offset
            instruction = jumpOffset(cpu, X, op)
            break;
        case 0xC: // Random
            instruction = random(cpu, X, op)
            break;
        case 0xD: // Draw
            instruction = draw(cpu, X, Y, N, display)
            break;
        case 0xE: 
            if(Y === 0x9) {// Skip if key
                instruction = skipIfKey(cpu, X)
            } else if (Y === 0xA) {
                instruction = skipIfNotKey(cpu, X)
            }
            break;

        case 0xF:
            switch ((Y << 4) + N) {

                case 0x07: // Set VX to delay timer
                    instruction = setVX2Delay(cpu, X)
                    break;
                case 0x15: // Set delay timer to VX
                    instruction = setDelay2VX(cpu, X)
                    break;
                case 0x18: // Set sound timer to VX
                    instruction = setSound2VX(cpu, X)
                    break;

                case 0x1E: // Add to index
                    instruction = addIndex(cpu, X)
                    break;
                case 0x0A: // Get key
                    instruction = waitKey(cpu, X)
                    break;
                case 0x29: // Font char
                    instruction = getFont(cpu, X)
                    break;

                case 0x33: // Binary-decimal conversion
                    instruction = bin2dec(cpu, X)
                    break;

                case 0x55: // Store
                    instruction = store(cpu, X)
                    break;
                case 0x65: // Load
                    instruction = load(cpu, X)
                    break;
            }
            break;
    }
    return [currpc, op, instruction]
}

const draw = (cpu, X, Y, N, display) => {

    // get co-ordinates from registers
    let x = cpu.registers[X]; let y = cpu.registers[Y];
    // modulo co-ordinates to fit screen bounds
    x = x % 64;
    y = y % 32;
    // set VF flag to false
    cpu.registers[0xF] = 0;

    // iterate sprite bits and set display pixels to match them
    // h = height (N value) / w = width (8 for byte)
    for (let h = 0; h < N; h++) {
        // retrieve row of sprite data and pad with 0's (must be length 8)
        let sprite = ('00000000' + cpu.memory[cpu.I + h].toString(2)).substr(-8);

        // stop if sprite reaches bottom edge of screens
        if((y + h) === 32){
            return 'Draw'
        }

        for (let w = 0; w < 8; w++) {
            // extract each bit from string
            let bit = sprite.toString(2).slice(w, w+1)
            
            if(bit == 1) {
                let pixel = ((y+h)*64) + x + w;
                if(display[pixel] && (x + w) < 64) {
                    // if pixel already active, turn off and trigger flag
                    display[pixel] = false;
                    cpu.registers[0xF] = 1;
                } else if ((x + w) < 64) {
                    display[pixel] = true;
                }
            }
        }
    }
    return 'Draw'
}

// Instruction Set

//00EE
const returnSub = (cpu) => {
    cpu.pc = cpu.stack.pop()
    return 'Return Subroutine'
}
//00E0
const clearScreen = (display) => {
    display.fill(false)
    return 'Clear Screen'
}
//1nnn
const jump = (cpu, op) => {
    cpu.pc = 0x0fff & op
    return 'Jump'
}
//2nnn
const callSub = (cpu, op) => {
    cpu.stack.push(cpu.pc)
    cpu.pc = 0x0fff & op
    return 'Call Subroutine'
}
//3xnn
const skipIfEqual = (cpu, x, op) => {
    let n = 0x00ff & op
    if(cpu.registers[x] === n) {
        cpu.pc += 2
    }
    return 'Skip E'
}
//4xnn
const skipIfNotEqual = (cpu, x, op) => {
    let n = 0x00ff & op
    if(cpu.registers[x] !== n) {
        cpu.pc += 2
    }
    return 'Skip NE'
}
//5xy0
const skipIfRegEqual = (cpu, x, y) => {
    if(cpu.registers[x] === cpu.registers[y]) {
        cpu.pc += 2
    }
    return 'Skip E'
}
//6xnn
const setVX = (cpu, x, op) => {
    cpu.registers[x] = (0xff & op)
    return 'VX = N'
}
//7xnn
const VXplusN = (cpu, x, op) => {
    cpu.registers[x] += (0xff & op)
    return 'VX + N'
}
//8xy0
const VXeqVY = (cpu, x, y) => {
    cpu.registers[x] = cpu.registers[y]
    return 'VX = VY'
}
//8xy1
const VXorVY = (cpu, x, y) => {
    cpu.registers[x] |= cpu.registers[y]
    return 'VX OR VY'
}
//8xy2
const VXandVY = (cpu, x, y) => {
    cpu.registers[x] &= cpu.registers[y]
    return 'VX AND VY'
}
//8xy3
const VXxorVY = (cpu, x, y) => {
    cpu.registers[x] = cpu.registers[x] ^ cpu.registers[y];
    return 'VX XOR VY'
}
//8xy4
const VXplusVY = (cpu, x, y) => {
    // activate VF flag if result > 255
    cpu.registers[0xf] = (cpu.registers[x] + cpu.registers[y] > 255) ? 1 : 0
    
    cpu.registers[x] += cpu.registers[y]
    return 'VX + VY'
}
//8xy5
const VXsubVY = (cpu, x, y) => { 
    // activate VF flag if VX > VY
    cpu.registers[0xf] = (cpu.registers[x] > cpu.registers[y]) ? 1 : 0
    
    cpu.registers[x] = cpu.registers[x] - cpu.registers[y]
    return 'VX - VY'
}
//8xy7
const VYsubVX = (cpu, x, y) => {
    // activate VF flag if VY > VX
    cpu.registers[0xf] = (cpu.registers[y] > cpu.registers[x]) ? 1 : 0
    
    cpu.registers[x] = cpu.registers[y] - cpu.registers[x]
    return 'VY - VX'
}
//8xy6
export const VXshiftR = (cpu, x, y) => {
    if(!cpu.cosmac) {
        y = x
    }
    cpu.registers[0xf] = cpu.registers[y] & 0x1
    cpu.registers[x] = cpu.registers[y] >>> 1
    return 'Shift Right'
}
//8xyE
export const VXshiftL = (cpu, x, y) => {
    if(!cpu.cosmac) {
        y = x
    }
    cpu.registers[0xf] = (cpu.registers[y] >> 7) & 0x1
    cpu.registers[x] = cpu.registers[y] << 1
    return 'Shift Left'
}
//9xy0
const skipIfRegNotEqual = (cpu, x, y) => {
    if(cpu.registers[x] !== cpu.registers[y]) {
        cpu.pc += 2
    }
}
//Annn
const setIndex = (cpu, op) => {
    cpu.I = 0x0fff & op
    return 'Set Index'
}
//Bnnn
const jumpOffset = (cpu, x, op) => {
    if(cpu.cosmac) {
        cpu.pc = (0x0fff & op) + cpu.registers[0];
    } else {
        cpu.pc = (0x0fff & op) + cpu.registers[x];
    }
    return 'Jump Offset'
}
//Cxnn
const random = (cpu, x, op) => {
    // generate rand 0-255
    let rand = Math.floor(Math.random() * 255) & (0x00ff & op)
    cpu.registers[x] = rand;
    return 'Random'
}
//Ex9E
const skipIfKey = (cpu, x) => {
    let key = getKey(cpu.registers[x])
    cpu.pc += (keyActive[key] ? 2 : 0)
    return 'Skip if key active'
}
//ExA1
const skipIfNotKey = (cpu, x) => {
    let key = getKey(cpu.registers[x])
    cpu.pc += (keyActive[key] ? 0 : 2)
    return 'Skip if key inactive'
}
//Fx07
const setVX2Delay = (cpu, x) => {
    cpu.registers[x] = cpu.delayTimer
    return 'VX = Delay'
}
//Fx15
const setDelay2VX = (cpu, x) => {
    cpu.delayTimer = cpu.registers[x]
    return 'Delay = VX'
}
//Fx18
const setSound2VX = (cpu, x) => {
    cpu.soundTimer = cpu.registers[x]
    play_sound(1000/60 * cpu.soundTimer)
    return 'Sound = VX'
}
//Fx1E
const addIndex = (cpu, x) => {
    if(!cpu.cosmac && cpu.I + cpu.registers[x] > 0xFFF) {
        cpu.registers[0xF] = 1
    }
    cpu.I = cpu.I + cpu.registers[x]
    return 'Index + VX'
}

//Fx0A
//blocks until key press
const waitKey = (cpu, x) => {
    let key = false
    for (let [k, val] of Object.entries(keyActive)) {
        if(val) {
            key = k
        }
    }

    if(cpu.cosmac) {
        // only if key pressed and released
    }
    if(key) {
        cpu.registers[x] = keyVals.get(key)
    } else {
        cpu.pc -= 2
    }
    return 'Wait for Key'
}
//Fx29
const getFont = (cpu, x) => {
    if(cpu.cosmac) {
        cpu.I = 0x050 + (5 * (cpu.registers[x] & 0x0F))
    } else {
        cpu.I = 0x050 + (5 *(cpu.registers[x]))
    }
    return 'Get Font'
}
//Fx33
const bin2dec = (cpu, x) => {
    //console.log('0x0' + cpu.I.toString(16))
    let dec = cpu.registers[x]
    //console.log(dec)

    cpu.memory[cpu.I] = dec / 100
    cpu.memory[cpu.I + 1] = (dec % 100) / 10
    cpu.memory[cpu.I + 2] = dec % 10
    //console.log(Math.floor(dec / 100))
    //console.log(Math.floor((dec % 100) / 10))
    //console.log(dec % 10)
    //console.log('MEM 0x0' + cpu.I.toString(16) + ': ' + cpu.memory[cpu.I])
    //console.log('MEM 0x0' + (cpu.I+1).toString(16) + ': ' + cpu.memory[cpu.I+1])
    //console.log('MEM 0x0' + (cpu.I+2).toString(16) + ': ' + cpu.memory[cpu.I+2])
    return 'Binary-Decimal Conversion'
}
//Fx55
const store = (cpu, x) => {
    for(let i = 0; i < x+1; i++) {
        cpu.memory[cpu.I + i] = cpu.registers[i]
    }
    if(x === 0) {
        cpu.memory[cpu.I] = cpu.registers[0]
    }
    if(cpu.cosmac) {
        cpu.I += (x + 1)
    }
    return 'Store'
}
//Fx65
const load = (cpu, x) => {
    for(let k = 0; k < x+1; k++) {
        cpu.registers[k] = cpu.memory[cpu.I + k]
    }
    if(cpu.cosmac) {
        cpu.I += (x+1)
    }
    return 'Load'
}