
export const updateRegisters = registers => {
    for(let i=0; i<registers.length; i++) {
        document.getElementById(`V${i.toString(16)}`).innerHTML = registers[i];
    }
}