export let halt = true;

export const inputHandler = {

    keyPressFunc: function (event) {
        if(event.code === 'KeyT') {
            halt = !halt
        }
    },
    keyDownFunc: function (event) {
        keyActive[event.key.toString()] = true
    },
    keyUpFunc: function (event) {
        keyActive[event.key.toString()] = false
    }
}

const keyPress = document.addEventListener('keypress', inputHandler.keyPressFunc, false)
const keyDown = document.addEventListener('keydown', inputHandler.keyDownFunc, false)
const keyUp = document.addEventListener('keyup', inputHandler.keyUpFunc, false)

export const keyVals = new Map([
    ['1', 0x1],
    ['2', 0x2],
    ['3', 0x3],
    ['4', 0xC],
    ['q', 0x4],
    ['w', 0x5],
    ['e', 0x6],
    ['r', 0xD],
    ['a', 0x7],
    ['s', 0x8],
    ['d', 0x9],
    ['f', 0xE],
    ['z', 0xA],
    ['x', 0x0],
    ['c', 0xB],
    ['v', 0xF]
])

export const keyActive = {
    '1': false,
    '2': false,
    '3': false,
    '4': false,
    'q': false,
    'w': false,
    'e': false,
    'r': false,
    'a': false,
    's': false,
    'd': false,
    'f': false,
    'z': false,
    'x': false,
    'c': false,
    'v': false
}

export const getKey = val => {
    return [...keyVals].find(([key, value]) => val === value)[0];
}

export const setHalt = () => {
    halt = !halt
}