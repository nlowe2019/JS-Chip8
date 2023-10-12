let log = []
let reg_base = 2;
export let debug = true
export let settings_open = false;

$("#debug").click(function() {
    debug = !debug
    debug ? $('#debug').addClass('selected') : $('#debug').removeClass('selected')
    if(!debug) {
        $("div.debug").addClass("d-none")
        
        $(".btn-block").removeClass("selected")
        $("div.tabs div.tab-content").removeClass("selected")

        $("#tab3").addClass("selected")
        $("#tab3-content").addClass("selected")

        $(".btn-block.debug").addClass("inactive")
    } else {
        $(".btn-block.debug").removeClass("inactive")
        $("div.debug").removeClass("d-none")

        $(".btn-block").removeClass("selected")
        $("div.tabs div.tab-content").removeClass("selected")
        $("#tab1").addClass("selected")
        $("#tab1-content").addClass("selected")
    }
})

$(".base-btn").click(function() {
    reg_base = $(this).attr("value")
    $(".base-btn").removeClass("selected")
    $(this).addClass("selected")
    reg_base == 2 ? $(".register").addClass("fs-xs") : $(".register").removeClass("fs-xs")
})

export const updateRegisters = (registers, pc, I, delay, sound, op) => {
    for(let i=0; i<registers.length; i++) {
        try{
            if(reg_base == 2)
                document.getElementById(`V${i.toString(16).toUpperCase()}_val`).innerHTML = registers[i].toString(reg_base).padStart(8, '0')
            else if(reg_base == 16)
                document.getElementById(`V${i.toString(16).toUpperCase()}_val`).innerHTML = ('00' + registers[i].toString(reg_base)).substr(-2)
            else
                document.getElementById(`V${i.toString(16).toUpperCase()}_val`).innerHTML = registers[i].toString(reg_base);
        } catch (err) {
            console.log(`V${i.toString(16)}`)
            console.log(err)
        }
    }
    document.getElementById('pc_val').innerHTML = '0x' + ('0000' + pc.toString(16)).substr(-4);
    document.getElementById('index_val').innerHTML = '0x' + ('0000' + I.toString(16)).substr(-4);
    document.getElementById('delay_val').innerHTML = delay;
    document.getElementById('sound_val').innerHTML = sound;
    document.getElementById('opcode_val').innerHTML = '0x' + ('0000' + op.toString(16)).substr(-4);;
}

export const updateLastInstr = (pc, opcode, instr) => {
    pc -= 2;
    document.getElementById("pc").innerHTML = "PC: 0x" + ('000' + (pc).toString(16)).substr(-4);
    document.getElementById("instr").innerHTML = instr;
    document.getElementById("opcode").innerHTML = "Opcode: 0x" + ('0000' + opcode.toString(16)).substr(-4);
    updateLog(pc, opcode, instr)
}

export const updateLog = (pc, opcode, instr, reg, I, delay, sound) => {
    let state = `PC: 0x${('000' + pc.toString(16)).substr(-3)}, OPCODE: 0x${('0000' + opcode.toString(16)).substr(-4)} (${instr}), V0: ${reg[0].toString(16)}, V1: ${reg[1].toString(16)}, V2: ${reg[2].toString(16)}, V3: ${reg[0].toString(16)}, V4: ${reg[1].toString(16)}, V5: ${reg[2].toString(16)}, V6: ${reg[0]}, V7: ${reg[1].toString(16)}, V8: ${reg[2].toString(16)}, V9: ${reg[0].toString(16)}, VA: ${reg[1].toString(16)}, VB: ${reg[2].toString(16)}, VC: ${reg[0].toString(16)}, VD: ${reg[1].toString(16)}, VE: ${reg[2].toString(16)}, VF: ${reg[0].toString(16)}, Index: 0x${('000' + I.toString(16)).substr(-3)}, Delay: ${delay}, Sound: ${sound}`
    log.unshift(state)
    updateLogDOM()
    if(log.length > 49) {
        log.pop()
    }
}

export const updateLogDOM = () => {
    if($('#tab2-content').hasClass("selected")) {
        document.getElementById("log").innerHTML = log.join('<br />')
    }
}

export const openSettings = () => {
    settings_open = !settings_open;
}