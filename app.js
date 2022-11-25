const http = require('http')
const fs = require('fs')
const path = require('path')
const express = require('express')
const util = require('util')

const app = express()
const port = 3000

app.use(express.static(path.join(__dirname, 'public')))
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "pug")

app.get("/", async (req, res) => {
    res.render("pugtest", roms= await romList())
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

const readdir = util.promisify(fs.readdir)
const romList = async () => {
    let list
    try{
        list = await readdir('./public/ROMS')
    } catch (err) {
        console.log(err)
    }
    list = list.map(rom => {
        return rom.slice(0, -4)
    })
    return list
}

//export api
module.exports = app