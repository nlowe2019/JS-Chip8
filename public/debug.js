export const log = []

export const updateRegisters = (registers, I, delay, sound) => {
    for(let i=0; i<registers.length; i++) {
        try{
            document.getElementById(`V${i.toString(16)}`).innerHTML = registers[i];
        } catch (err) {
            console.log(`V${i.toString(16)}`)
            console.log(err)
        }
    }
    document.getElementById('I').innerHTML = '0x' + ('0000' + I.toString(16)).substr(-4);
    document.getElementById('Delay').innerHTML = delay;
    document.getElementById('Sound').innerHTML = sound;
}

export const updateLastInstr = (pc, opcode, instr) => {
    pc -= 2;
    document.getElementById("pc").innerHTML = "PC: 0x" + ('0000' + (pc).toString(16)).substr(-4);
    document.getElementById("instr").innerHTML = instr;
    document.getElementById("opcode").innerHTML = "Opcode: 0x" + ('0000' + opcode.toString(16)).substr(-4);
    updateLog(pc, opcode, instr)
}

export const updateLog = (pc, opcode, instr) => {
    log.unshift(`PC: 0x${(pc).toString(16)} - 0x${('0000' + opcode.toString(16)).substr(-4)} (${instr})`)
    document.getElementById("log").innerHTML = log.join('<br />')
    if(log.length > 99) {
        log.pop()
    }
}