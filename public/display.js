export class Display {
    constructor(canvas, color="#23f057") {
        this.canvas = canvas
        this.ctx = canvas.getContext("2d")
        this.frame_buffer_main = new Array(64*32).fill(false)
        this.frame_buffer_second = new Array(64*32).fill(false)
        this.pixel_color = color
        this.canvas.height = this.canvas.width / 2
        this.pixel_size = this.canvas.width / 64
        this.render_style = 'solid';
    }

    // Math.floor(i/64) === y coord
    // i%64 === x coord
    show = function () {
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height)
        for(let i = 0; i < this.frame_buffer_main.length; i++) {
            if (this.frame_buffer_main[i] || this.frame_buffer_second[i] ) {
                this.ctx.fillStyle = this.pixel_color
                if(this.render_style == 'grid')
                    this.ctx.fillRect((i%64 * this.pixel_size) + 1, (Math.floor(i/64) * this.pixel_size) + 1, this.pixel_size - 2, this.pixel_size - 2)
                else if(this.render_style == 'solid')
                    this.ctx.fillRect((i%64 * this.pixel_size), (Math.floor(i/64) * this.pixel_size), this.pixel_size, this.pixel_size)
            } else {
                if(((i%64)%2) === ((Math.floor(i/64))%2)){
                    //ctx.fillStyle = "#000"
                } else {
                    //ctx.fillStyle = "#121212"
                }
                this.ctx.fillStyle = "#000"
                if(this.render_style == 'grid')
                    this.ctx.fillRect((i%64 * this.pixel_size)+1, (Math.floor(i/64) * this.pixel_size) +1, this.pixel_size-2, this.pixel_size-2)
                else if(this.render_style == 'solid')
                    this.ctx.fillRect((i%64 * this.pixel_size), (Math.floor(i/64) * this.pixel_size), this.pixel_size, this.pixel_size)
            }
            this.frame_buffer_second[i] = this.frame_buffer_main[i];
        }
    }
}