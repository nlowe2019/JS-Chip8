import { getFont } from './font.js';
import { updateRegisters} from './debug.js';

const CPU = {
    stack: new Uint16Array(16),
    memory: new Uint8Array(4096),
    registers: new Uint8Array(16),
    pc: 0x200,
    I: 0,
    sp: -1,
    delayTimer: 0,
    soundTimer: 0,
};
    
let paused = true;
const display = new Array(64*32).fill(false);
const c = document.getElementById("canvas");
const ctx = c.getContext("2d");
ctx.fillStyle = "#d3d3d3";
ctx.strokeStyle = "#d3d3d3";
c.height = c.width/2;
const pLength = c.width / 64;

let f = getFont();
for(let i = 0; i < f.length; i++) {
    CPU.memory[i + 0x050] = f[i];
}

const loop = () => {

    if (paused) {
        return;
    }

    for (let i = 0; i < 3; i++) {
        let instr = getInstruction();
        //console.log("instruction: " + instr.toString(16))
        decodeInstruction(instr);
        executeInstruction();
    }

    show();
    updateRegisters(CPU.registers);
};

const getInstruction = () => {
    let instr1 = CPU.memory[CPU.pc];
    let instr2 = CPU.memory[CPU.pc + 1];
    //console.log("instr 1: " + (instr1 <<8).toString(16) + "    instr2: " + instr2.toString(16))
    CPU.pc +=2
    return ((0xffff & instr1) << 8) + instr2;
};

const decodeInstruction = (instr) => {
    decodetest(instr)
};

const executeInstruction = () => {
    return
};


// Math.floor(i/64) === y coord
// i%64 === x coord
const show = () => {

    ctx.clearRect(0,0,c.width,c.height)
    for(let i = 0; i < display.length; i++) {
        //display[i] = Math.floor(Math.random() * 2) === 1;
        if (display[i]) {
            ctx.fillStyle = "#d3d3d3";
            ctx.fillRect((i%64 * pLength)+1, (Math.floor(i/64) * pLength) +1, pLength-2, pLength-2);
        } else {
            if(((i%64)%2) === ((Math.floor(i/64))%2)){
                ctx.fillStyle = "#131313";
            } else {
                ctx.fillStyle = "#232323";
            }
            ctx.fillRect((i%64 * pLength)+1, (Math.floor(i/64) * pLength) +1, pLength-2, pLength-2);
        }
    }
};

setInterval(loop, 1000/2);


const decodetest = (instr) => {
    let first = (instr & 0xf000) >> 12;
    let second = ((instr & 0x0f00) << 4) >> 12;
    let third = ((instr & 0x00f0) << 8) >> 12;
    let fourth = ((instr & 0x000f) << 12) >> 12;

    switch (first) {
        case 0x0:
            if(instr & 0x00ff === 0x00EE) {
                CPU.pc = CPU.stack.pop();
            // clear screen
            } else {
                display.fill(false);
            }
            break;
        // jump
        case 0x1:
            //console.log("jump")
            CPU.pc = 0x0fff & instr;
            //console.log("pc: " + CPU.pc)
            break;
        // jump and push to stack
        case 0x2:
            CPU.stack.push(CPU.pc);
            CPU.pc = 0x0fff & instr;
        // set register vx
        case 0x6:
            CPU.registers[second] = 0x00ff & instr;
            break;
        // add value to register vx
        case 0x7:
            CPU.registers[second] += (0x00ff & instr);
            break;
        // set index register I
        case 0xA:
            CPU.I = 0x0fff & instr
            break;
        // display draw
        case 0xD:
            draw(second, third, fourth);
            break;
        case 0xF:
            if(third === 0x5) {
                for(let i = 0; i < second; i++) {
                    CPU.memory[CPU.I + i] = CPU.registers[i];
                }
                if(second === 0) {
                    CPU.memory[I] = CPU.registers[0];
                }
            } else if (third === 0x6) {
                for(let i = 0; i < second; i++) {
                    CPU.registers[i] = CPU.memory[CPU.I + i];
                }
            }
            break;
    }
}

const draw = (X, Y, N) => {
    let x = CPU.registers[X] % 64;
    let y = CPU.registers[Y] % 32;
    CPU.registers[0xF] = 0;

    for (let i = 0; i < N; i++) {

        let byte = CPU.memory[CPU.I + i];
        for(let j = 0; j < 8; j++) {
            let bit = (byte << j) >> 7;
            if(bit) {
                let displayX = x + j;
                let displayY = y + i;

                //console.log(`x coord = ${x} + ${j}   |   y coord = ${y} + ${i}}`)
                if(displayY < 32) {
                    let pixel = (64*displayY) + displayX;
                    if(display[pixel]) {
                        CPU.registers[0xF] = 1;
                        display[pixel] = false;
                    } else {
                        if(displayX < 64) {
                            display[pixel] = true;
                        }
                    }
                }
            }
        }
    }
}

const fetchRom = async romName => {
    try {
        let response = await fetch(romName)
        if (response.ok) {
            let buffer = await response.arrayBuffer();
            loadRom(new Uint8Array(buffer))
        } else {
            alert("Error: " + response.status);
        }
    } catch (error) {
        console.log(error);
    }
}

const loadRom = rom => {
    for(let i = 0; i < rom.length; i++) {
        CPU.memory[0x200 + i] = rom[i]
    }
    console.log(CPU.memory)
    paused = false;
}

fetchRom('/logo.ch8');