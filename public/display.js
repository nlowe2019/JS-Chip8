export class Display {
    constructor(canvas, color="#0f0") {
        this.canvas = canvas
        this.ctx = canvas.getContext("2d")
        this.pixels = new Array(64*32).fill(false)
        this.pixel_color = color
        this.canvas.height = this.canvas.width / 2
        this.pixel_size = this.canvas.width / 64
    }

    // Math.floor(i/64) === y coord
    // i%64 === x coord
    show = function () {
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height)
        for(let i = 0; i < this.pixels.length; i++) {
            if (this.pixels[i]) {
                this.ctx.fillStyle = this.pixel_color
                this.ctx.fillRect((i%64 * this.pixel_size)+1, (Math.floor(i/64) * this.pixel_size) +1, this.pixel_size-2, this.pixel_size-2)
            } else {
                if(((i%64)%2) === ((Math.floor(i/64))%2)){
                    //ctx.fillStyle = "#000"
                } else {
                    //ctx.fillStyle = "#121212"
                }
                this.ctx.fillStyle = "#000"
                this.ctx.fillRect((i%64 * this.pixel_size)+1, (Math.floor(i/64) * this.pixel_size) +1, this.pixel_size-2, this.pixel_size-2)
            }
        }
    }
}