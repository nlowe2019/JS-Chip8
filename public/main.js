import { debug, settings_open, updateLog, updateLogDOM, updateRegisters, openSettings } from './debug.js';
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
    $("#settings").click(function () {
        console.log("settings")
        openSettings()
        if(settings_open)
        {
            $('#settings').addClass('selected') 
            $('#settings-ui').removeClass('invisible') 
        }
        else
        {
            $('#settings').removeClass('selected')
            $('#settings-ui').addClass('invisible') 
        }
    })
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
    $(".color-pick").click(function () {
        let main_color_name = '--main-color'
        let selected_color = $(this).css('background-color')
        $('.color-pick').removeClass('selected')
        $(this).addClass('selected')
        document.documentElement.style.setProperty(main_color_name, selected_color)
        display.pixel_color = selected_color;
        let svg_color = $(this).attr('value')
        let svg_var_name = '--svg-default'
        document.documentElement.style.setProperty(svg_var_name, 'var(' + svg_color + ')')
        
    })
    $("#render-style").click(function () {

        let style = $(this).hasClass('selected') ? 'solid' : 'grid'
        if(style == 'solid') {
            $(this).removeClass('selected')
            style = 'grid'
        }
        else {
            $(this).addClass('selected')
            style = 'solid'
        }
        display.render_style = style
    })
    
        resizeTabs()
        $(".btn-block").click(function () {
            if(!(!debug && $(this).hasClass("debug"))) {
                let tabId = this.id
                console.log(tabId)
                let contentId = this.id + '-content'
    
                $(".btn-block").removeClass("selected")
                $(".btn-block#" + tabId).addClass("selected")
    
                $("div.tabs div.tab-content").removeClass("selected")
                $("div.tabs div#" + contentId).addClass("selected")
            }
            updateLogDOM()
        })
    
        $(window).resize(resizeTabs)
})

$(window).resize(function() {
    if ($(window).width() >= 576) {
        $('#tab-btns').removeClass('btn-group');
        $('#tab-btns').addClass('btn-group-vertical');
    } else {
        $('#tab-btns').addClass('btn-group');
        $('#tab-btns').removeClass('btn-group-vertical');
    }
})
$(document).ready(function() {
    if ($(window).width() >= 576) {
        $('#tab-btns').removeClass('btn-group');
        $('#tab-btns').addClass('btn-group-vertical');
    } else {
        $('#tab-btns').addClass('btn-group');
        $('#tab-btns').removeClass('btn-group-vertical');
    }
    $(window).resize(resizeTabs)

        
    fetchRom('/CHIP-8 Logo.ch8')
    setInterval(() => {
        if(!halt)
            loop(IPF)
    }, 1000/FPS)
})

function resizeTabs () {
    let arr = $("div.tab-content").toArray().map(x =>
        $(x).height()
    )
    let max = Math.max(...arr)
    $(".tab-content").each(function () {
        $(this).height(max)
    })
    let t1h = $("#tab1-content").height()
    $('#tab3-content').height(t1h)
}
