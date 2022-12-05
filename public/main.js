import { updateLastInstr, updateRegisters } from './debug.js';
import { CPU, getInstruction, decodeInstruction } from './CHIP8.js';
import { halt, setHalt } from './input.js';
import { Display } from './display.js'

let display = new Display(document.getElementById("canvas"))
let FPS = 60
let IPF = 10
let cpu

const loop = function (n) {

    if(cpu.delayTimer > 0)
        cpu.delayTimer--;
    if(cpu.soundTimer > 0)
        cpu.soundTimer--;

    let is = 0
    for (let i = 0; i < n; i++) {
        let op = getInstruction(cpu);
        let prevInstruction = decodeInstruction(cpu, op, display.pixels);

        //updateRegisters(cpu.getRegisters(), cpu.getPC(), cpu.getI(), cpu.getDelay(), cpu.getSound());

        if(false) {
            updateLastInstr(prevInstruction[0], prevInstruction[1], prevInstruction[2])
        }
        is++
    }
    display.show()
};

const fetchRom = async romName => {

    cpu = new CPU(!true)

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
    if(halt)
        setHalt()
}

const rom_select = document.querySelector('#roms')
rom_select.addEventListener('change', (event) => {
    let rom =  event.target.value
    if(!halt)
        setHalt()
    display.pixels.fill(false)
    fetchRom('/' + rom + '.ch8')
})

$(function() {
    $("div#pause").click(function () {
        setHalt();
    })
    $("div#step").click(function () {
        if(halt) {
            loop(1)
        }
    })
    $('input[type=range]').on('input', function () {
        IPF = $(this).val()
        console.log(IPF)
    })
})

fetchRom('/opcode test.ch8')
setInterval(() => {
    if(!halt)
        loop(IPF)
}, 1000/FPS)