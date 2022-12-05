import * as is from './CHIP8.js'

let cpu = new is.CPU(!true)

let op = 0x8016
let O = (op & 0xf000) >> 12;
let X = ((op & 0x0f00) << 4) >> 12;
let Y = ((op & 0x00f0) << 8) >> 12;
let N = ((op & 0x000f) << 12) >> 12;

cpu.registers[0] = 0
cpu.registers[1] = 0xe0
is.VXshiftL(cpu, X, Y)
console.log(`V0: ${cpu.registers[0]}\nV1: ${cpu.registers[1]}\nVF: ${cpu.registers[15]}`)


cpu.registers[0] = 0
cpu.registers[1] = 0
is.VXshiftL(cpu, X, Y)
console.log(`V0: ${cpu.registers[0]}\nV1: ${cpu.registers[1]}\nVF: ${cpu.registers[15]}`)


cpu.registers[0] = 0
cpu.registers[1] = 255
is.VXshiftL(cpu, X, Y)
console.log(`V0: ${cpu.registers[0]}\nV1: ${cpu.registers[1]}\nVF: ${cpu.registers[15]}`)


cpu.registers[0] = 0
cpu.registers[1] = 127
is.VXshiftL(cpu, X, Y)
console.log(`V0: ${cpu.registers[0]}\nV1: ${cpu.registers[1]}\nVF: ${cpu.registers[15]}`)