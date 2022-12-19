import { debug, updateLog, updateRegisters } from './debug.js';
import { CPU, getInstruction, decodeInstruction } from './CHIP8.js';
import { halt, setHalt } from './input.js';
import { Display } from './display.js'

let display = new Display(document.getElementById("canvas"))
let FPS = 60
let IPF = 10
let cpu

let lol = "lol" 

const loop = function (n) {

    if(cpu.delayTimer > 0)
        cpu.delayTimer--;
    if(cpu.soundTimer > 0)
        cpu.soundTimer--;

    for (let i = 0; i < n; i++) {
        let op = getInstruction(cpu);

        let log_vals = decodeInstruction(cpu, op, display.pixels);

        if(debug)
            updateRegisters(cpu.getRegisters(), cpu.getPC(), cpu.getI(), cpu.getDelay(), cpu.getSound(), getInstruction(cpu));
            updateLog(log_vals[0], log_vals[1], log_vals[2], log_vals[3], log_vals[4], log_vals[5], log_vals[6])
    }
    display.show()
};

const fetchRom = async (romName, halt_on_load) => {

    cpu = new CPU(true)

    try {
        let response = await fetch('/ROMS' + romName)
        if (response.ok) {
            let buffer = await response.arrayBuffer();
            loadRom(new Uint8Array(buffer), halt_on_load)
        } else {
            alert("Error: " + response.status)
        }
    } catch (error) {
        console.log(error);
    }
}

const loadRom = (rom, halt_on_load) => {
    for(let i = 0; i < rom.length; i++) {
        cpu.memory[0x200 + i] = rom[i]
    }
    if(!halt_on_load)
        setHalt()
    display.show()
    updateRegisters(cpu.getRegisters(), cpu.pc, cpu.I, cpu.delayTimer, cpu.soundTimer, 0)
}

const rom_select = document.querySelector('#roms')
rom_select.addEventListener('change', (event) => {
    let rom =  event.target.value
    let halt_on_load = halt
    if(!halt)
        setHalt()
    display.pixels.fill(false)
    fetchRom('/' + rom + '.ch8', halt_on_load)
})

$(function() {
    $("#pause").click(function () {
        console.log("pause")
        setHalt();
        halt ? $('#pause').addClass('selected') : $('#pause').removeClass('selected')
    })
    $("#step").click(function () {
        if(halt) {
            loop(1)
        }
    })
    $('input[type=range]').on('input', function () {
        IPF = $(this).val()
    })
})

fetchRom('/opcode test.ch8')
setInterval(() => {
    if(!halt)
        loop(IPF)
}, 1000/FPS)