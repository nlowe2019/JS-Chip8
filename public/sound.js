let audio_ctx
let oscillator
let gainNode

const type = "square"
let frequency = 200 // Hz
let volume = 0.01

const initialiser = '#roms'

const configure_sound = () => {
    // set parameters
    gainNode.gain.value = volume;
    oscillator.frequency.value = frequency;
    oscillator.type = type;
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
        configure_sound()
    
        gainNode.connect(audio_ctx.destination);

        oscillator.start();
    }
})