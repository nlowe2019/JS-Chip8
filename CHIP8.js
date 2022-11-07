import { keyActive, keyVals, getKey } from './input.js'

export const CPU = {
    stack: [],
    memory: new Uint8Array(4096),
    registers: new Uint8Array(16),
    pc: 0x200,
    I: 0,
    delayTimer: 0,
    soundTimer: 0,

    // Configurable
    cosmac: true,

    getDelay: function () {
        return this.delayTimer
    },
    getSound: function () {
        return this.soundTimer
    },
    getI: function () {
        return this.I
    },
    getRegisters: function () {
        return this.registers
    }
};

export const getInstruction = () => {
    let instr1 = CPU.memory[CPU.pc];
    let instr2 = CPU.memory[CPU.pc + 1];
    CPU.pc +=2
    return ((0xffff & instr1) << 8) + instr2;
};

export const decodeInstruction = (op, display) => {
    let O = (op & 0xf000) >> 12;
    let X = ((op & 0x0f00) << 4) >> 12;
    let Y = ((op & 0x00f0) << 8) >> 12;
    let N = ((op & 0x000f) << 12) >> 12;

    let currpc = CPU.pc
    let instruction = ''

    switch (O) {
        case 0:
            if(N === 0xE) {  // Return Subroutine
                instruction = returnSub()
            }
            if (N === 0x0) { // Clear Screen
                instruction = clearScreen(display)
            }
            break;
        case 0x1: // Jump
            instruction = jump(op) 
            break;
        case 0x2: // Call Subroutine
            instruction = callSub(op)
            break;
        case 0x3: // Skip if equal
            instruction = skipIfEqual(X, op)
            break;
        case 0x4: // Skip if not equal
            instruction = skipIfNotEqual(X, op)
            break;
        case 0x5: // Skip if registers equal
            instruction = skipIfRegEqual(X, Y)
            break;
        case 0x6: // set register vx
            instruction = setVX(X, op)
            break;
        case 0x7: // add value to register vx
            instruction = VXplusN(X, op)
            break;

        // Logical/Arithmetic opuctions:
        case 0x8:
            switch (N) {
                case 0: // Set
                    instruction = VXeqVY(X, Y)
                    break;
                case 1: // OR
                    instruction = VXorVY(X, Y)
                    break;
                case 2: // AND
                    instruction = VXandVY(X, Y)
                    break;
                case 3: // XOR
                    instruction = VXxorVY(X, Y)
                    break;
                case 4: // Add
                    instruction = VXplusVY(X, Y)
                    break;
                case 5: // Subtract (x - y)
                    instruction = VXsubVY(X, Y)
                    break;
                case 6: // Shift right
                    instruction = VXshiftL(X, Y)
                    break;
                case 7: // Subtract (y - x)
                    instruction = VYsubVX(X, Y)
                    break;
                case 0xE: // Shift left
                    instruction = VXshiftR(X, Y)
                    break;
            }
            break;

        case 0x9: // Skip if registers not equal
            instruction = skipIfRegNotEqual(X, Y)
            break;
        case 0xA: // Set index register I
            instruction = setIndex(op)
            break;
        case 0xB: // Jump with offset
            instruction = jumpOffset(X, op)
            break;
        case 0xC: // Random
            instruction = random(X, op)
            break;
        case 0xD: // Draw
            instruction = draw(X, Y, N, display)
            break;
        case 0xE: 
            if(Y === 0x9) {// Skip if key
                instruction = skipIfKey(X)
            } else if (Y === 0xA) {
                instruction = skipIfNotKey(X)
            }
            break;

        case 0xF:
            switch ((Y << 4) + N) {

                case 0x07: // Set VX to delay timer
                    instruction = setVX2Delay(X)
                    break;
                case 0x15: // Set delay timer to VX
                    instruction = setDelay2VX(X)
                    break;
                case 0x18: // Set sound timer to VX
                    instruction = setSound2VX(X)
                    break;

                case 0x1E: // Add to index
                    instruction = addIndex(X)
                    break;
                case 0x0A: // Get key
                    instruction = waitKey(X)
                    break;
                case 0x29: // Font char
                    instruction = getFont(X)
                    break;

                case 0x33: // Binary-decimal conversion
                    instruction = bin2dec(X)
                    break;

                case 0x55: // Store
                    instruction = store(X)
                    break;
                case 0x65: // Load
                    instruction = load()
                    break;
            }
            break;
    }
    return [currpc, op, instruction]
}

const draw = (X, Y, N, display) => {

    // get co-ordinates from registers
    let x = CPU.registers[X]; let y = CPU.registers[Y];
    // modulo co-ordinates to fit screen bounds
    x = x % 64;
    y = y % 32;
    // set VF flag to false
    CPU.registers[0xF] = 0;

    // iterate sprite bits and set display pixels to match them
    // h = height (N value) / w = width (8 for byte)
    for (let h = 0; h < N; h++) {
        // retrieve row of sprite data and pad with 0's (must be length 8)
        let sprite = ('00000000' + CPU.memory[CPU.I + h].toString(2)).substr(-8);

        // stop if sprite reaches bottom edge of screens
        if((y + h) === 32){
            return
        }

        for (let w = 0; w < 8; w++) {
            // extract each bit from string
            let bit = sprite.toString(2).slice(w, w+1)
            
            if(bit == 1) {
                let pixel = ((y+h)*64) + x + w;
                if(display[pixel]) {
                    // if pixel already active, turn off and trigger flag
                    display[pixel] = false;
                    CPU.registers[0xF] = 1;
                } else if ((x + w) < 64) {
                    display[pixel] = true;
                }
            }
        }
    }
    return 'Draw'
}

// Instruction Set

const returnSub = () => {
    CPU.pc = CPU.stack.pop()
    return 'Return Subroutine'
}

const clearScreen = (display) => {
    display.fill(false)
    return 'Clear Screen'
}

const jump = (op) => {
    CPU.pc = 0x0fff & op
    return 'Jump'
}

const callSub = (op) => {
    CPU.stack.push(CPU.pc)
    CPU.pc = 0x0fff & op
    return 'Call Subroutine'
}

const skipIfEqual = (x, op) => {
    let n = 0x00ff & op
    if(CPU.registers[x] === n) {
        CPU.pc += 2
    }
    return 'Skip'
}

const skipIfNotEqual = (x, op) => {
    let n = 0x00ff & op
    if(CPU.registers[x] !== n) {
        CPU.pc += 2
    }
    return 'Skip'
}

const skipIfRegEqual = (x, y) => {
    if(CPU.registers[x] === CPU.registers[y]) {
        CPU.pc += 2
    }
    return 'Skip'
}

const setVX = (x, op) => {
    CPU.registers[x] = 0x00ff & op
    return 'VX = N'
}

const VXplusN = (x, op) => {
    CPU.registers[x] += (0x00ff & op)
    return 'VX + N'
}

const VXeqVY = (x, y) => {
    CPU.registers[x] = CPU.registers[y]
    return 'VX = VY'
}

const VXorVY = (x, y) => {
    CPU.registers[x] |= CPU.registers[y]
    return 'VX OR VY'
}

const VXandVY = (x, y) => {
    CPU.registers[x] &= CPU.registers[y]
    return 'VX AND VY'
}

const VXxorVY = (x, y) => {
    CPU.registers[x] = CPU.registers[x] ^ CPU.registers[y];
    return 'VX XOR VY'
}

const VXplusVY = (x, y) => {
    CPU.registers[x] += CPU.registers[y]
    return 'VX + VY'
}

const VXsubVY = (x, y) => {
    CPU.registers[x] = CPU.registers[x] - CPU.registers[y]
    return 'VX - VY'
}

const VYsubVX = (x, y) => {
    CPU.registers[x] = CPU.registers[y] - CPU.registers[x]
    return 'VY - VX'
}

const VXshiftR = (x, y) => {
    if(CPU.cosmac) {
        CPU.registers[x] = CPU.registers[y];
    }
    CPU.registers[0xf] = parseInt(CPU.registers[x].toString(2).slice(-1));
    CPU.registers[x] >> 1
    return 'Shift Right'
}

const VXshiftL = (x, y) => {
    if(CPU.cosmac) {
        CPU.registers[x] = CPU.registers[y];
    }
    CPU.registers[0xf] = parseInt(CPU.registers[x].toString(2)[0]);
    CPU.registers[x] << 1
    return 'Shift Left'
}

const skipIfRegNotEqual = (x, y) => {
    if(CPU.registers[x] !== CPU.registers[y]) {
        CPU.pc += 2
    }
}

const setIndex = (op) => {
    CPU.I = 0x0fff & op
    return 'Set Index'
}

const jumpOffset = (x, op) => {
    if(CPU.cosmac) {
        CPU.pc = (0x0fff & op) + CPU.registers[0];
    } else {
        CPU.pc = (0x0fff & op) + CPU.registers[x];
    }
    return 'Jump Offset'
}

const random = (x, op) => {
    // generate rand 0-255
    let rand = Math.floor(Math.random() * 255) & (0x00ff & op)
    CPU.registers[x] = rand;
    return 'Random'
}

//third = 9
const skipIfKey = (x) => {
    let key = getKey(CPU.registers[x])
    CPU.pc += (keyActive[key] ? 2 : 0)
    return 'Skip if key active'
}
//third = A
const skipIfNotKey = (x) => {
    let key = getKey(CPU.registers[x])
    CPU.pc += (keyActive[key] ? 0 : 2)
    return 'Skip if key inactive'
}

const setVX2Delay = (x) => {
    CPU.registers[x] = CPU.delayTimer
    return 'VX = Delay'
}

const setDelay2VX = (x) => {
    CPU.delayTimer = CPU.registers[x]
    return 'Delay = VX'
}

const setSound2VX = (x) => {
    CPU.soundTimer = CPU.registers[x]
    return 'Sound = VX'
}

const addIndex = (x) => {
    if(CPU.I + CPU.registers[x] > 0xFFF) {
        CPU.registers[0xF] = 1
    }
    CPU.I += CPU.registers[x]
    return 'Index + VX'
}

//blocks until key press
const waitKey = (x) => {
    let key = false
    for (let [k, val] of Object.entries(keyActive)) {
        if(val) {
            key = k
        }
    }

    if(CPU.cosmac) {
        // only if key pressed and released
    }
    if(key) {
        CPU.registers[x] = keyVals.get(key)
    } else {
        CPU.pc -= 2
    }
    return 'Wait for Key'
}

const getFont = (x) => {
    if(CPU.cosmac) {
        CPU.I = 0x050 + (5 * (CPU.registers[x] & 0x0F))
    } else {
        CPU.I = 0x050 + (5 *(CPU.registers[x]))
    }
    return 'Get Font'
}

const bin2dec = (x) => {
    let dec = '000' + CPU.registers[x].toString(10).substr(-3)
    CPU.memory[I] = parseInt(dec[0])
    CPU.memory[I + 1] = parseInt(dec[1])
    CPU.memory[I + 2] = parseInt(dec[2])
    return 'Binary-Decimal Conversion'
}

const store = (x) => {
    for(let i = 0; i < x+1; i++) {
        CPU.memory[CPU.I + i] = CPU.registers[i]
    }
    if(x === 0) {
        CPU.memory[CPU.I] = CPU.registers[0]
    }
    if(cosmac) {
        CPU.I += (x + 1)
    }
}

const load = (x) => {
    for(let i = 0; i < x+1; i++) {
        CPU.registers[i] = CPU.memory[CPU.I + i]
    }
    if(cosmac) {
        CPU.I += (x + 1)
    }
}

//-------------------------
