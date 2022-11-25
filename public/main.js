import { updateLastInstr, updateRegisters } from './debug.js';
import { CPU, getInstruction, decodeInstruction } from './CHIP8.js';
import { halt, setHalt } from './input.js';

let FPS = 60
let IPF = 10
let cpu

const display = new Array(64*32).fill(false)
const c = document.getElementById("canvas")
const ctx = c.getContext("2d")
ctx.fillStyle = "#d3d3d3"
ctx.strokeStyle = "#d3d3d3"
c.height = c.width/2
const pLength = c.width / 64

const loop = function () {

    if (!halt) {

        if(cpu.delayTimer > 0)
            cpu.delayTimer--;
        if(cpu.soundTimer > 0)
            cpu.soundTimer--;

        for (let i = 0; i < IPF; i++) {
            let op = getInstruction(cpu);
            let prevInstruction = decodeInstruction(cpu, op, display);

            if(false) {
                updateRegisters(cpu.getRegisters(), cpu.getI(), cpu.getDelay(), cpu.getSound());
                updateLastInstr(prevInstruction[0], prevInstruction[1], prevInstruction[2])
            }
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

    cpu = new CPU(false)

    try {
        let response = await fetch('/ROMS' + romName)
        if (response.ok) {
            let buffer = await response.arrayBuffer();
            loadRom(new Uint8Array(buffer))
        } else {
            alert("Error: " + response.status)
        }
    } catch (error) {
        console.log(error);
    }
}

const loadRom = rom => {
    for(let i = 0; i < rom.length; i++) {
        cpu.memory[0x200 + i] = rom[i]
    }
    setHalt()
}

const rom_select = document.querySelector('#roms')
rom_select.addEventListener('change', (event) => {
    let rom =  event.target.value
    setHalt()
    display.fill(false)
    fetchRom('/' + rom + '.ch8')
})

fetchRom('/opcode test.ch8')
setInterval(loop, 1000/FPS)