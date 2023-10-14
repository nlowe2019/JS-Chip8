let audio_ctx
let oscillator
let gainNode

const type = "square"
let frequency = 200 // Hz
let volume = 0.015

const initialiser = '#roms'

export const configure_sound = (vol = 40) => {
    // set parameters
    if(audio_ctx) {
        vol = vol/2000;
        volume = vol
        gainNode.gain.value = volume;
        oscillator.frequency.value = frequency;
        oscillator.type = type;
    }
}

export const play_sound = (duration) => {
    // oscillator always outputs signal, only connected...
    // to audio for set duration
    oscillator.connect(gainNode);

    setTimeout(() => {
        oscillator.disconnect();
    }, duration)
}

$(initialiser).click(() => {
    // init audio context if not created
    // must be triggered by user gesture
    if(!audio_ctx) {
        audio_ctx = new(window.AudioContext || window.webkitAudioContext)()
        gainNode = audio_ctx.createGain();
        oscillator = audio_ctx.createOscillator();
        configure_sound(40)
    
        gainNode.connect(audio_ctx.destination);

        oscillator.start();
    }
})