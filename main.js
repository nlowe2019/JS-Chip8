import { loadFont } from './font.js';
import { updateLastInstr, updateRegisters } from './debug.js';
import { CPU, getInstruction, decodeInstruction } from './CHIP8.js';
import { pause, setPause } from './input.js';

let FPS = 60
let IPF = FPS * 10

const display = new Array(64*32).fill(false)
const c = document.getElementById("canvas")
const ctx = c.getContext("2d")
ctx.fillStyle = "#d3d3d3"
ctx.strokeStyle = "#d3d3d3"
c.height = c.width/2
const pLength = c.width / 64

loadFont(CPU.memory)

const loop = () => {

    if (!pause) {

        CPU.delayTimer--;
        CPU.soundTimer--;

        for (let i = 0; i < IPF/FPS; i++) {
            let op = getInstruction();
            let prevInstruction = decodeInstruction(op, display);

            updateRegisters(CPU.getRegisters(), CPU.getI(), CPU.getDelay(), CPU.getSound());
            updateLastInstr(prevInstruction[0], prevInstruction[1], prevInstruction[2])
        }
        show()
    }
};


// Math.floor(i/64) === y coord
// i%64 === x coord
const show = () => {
    ctx.clearRect(0,0,c.width,c.height)
    for(let i = 0; i < display.length; i++) {
        if (display[i]) {
            ctx.fillStyle = "#00ff00"
            ctx.fillRect((i%64 * pLength)+1, (Math.floor(i/64) * pLength) +1, pLength-2, pLength-2)
        } else {
            if(((i%64)%2) === ((Math.floor(i/64))%2)){
                //ctx.fillStyle = "#000"
            } else {
                //ctx.fillStyle = "#121212"
            }
            ctx.fillStyle = "#000"
            ctx.fillRect((i%64 * pLength)+1, (Math.floor(i/64) * pLength) +1, pLength-2, pLength-2)
        }
    }
};

const fetchRom = async romName => {
    try {
        let response = await fetch('/ROMS' + romName)
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
    setPause()
    console.log(CPU.memory)
}

fetchRom('/ufo.ch8');

setInterval(loop, 1000/FPS)