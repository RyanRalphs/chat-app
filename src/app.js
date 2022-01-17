const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()

const server = http.createServer(app)
const io = socketio(server)

let count = 0

app.use(express.static("public"))

io.on('connection', (socket) => {
    socket.emit('welcome', 'Welcome!')
    socket.broadcast.emit('message', 'A new user has joined!')
    socket.on('messageRecieved', (message, callback) => {
        const filter = new Filter()
        if(filter.isProfane(message)) {
           return callback('Bad word detected. Message not sent')
        }
        io.emit('message', `User ${socket.id} says "${message}"`)
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit('message', `User ${socket.id} has sent their location: 'https://google.com/maps?q=${coords.latitude},${coords.longitude}'`)
        callback()
    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user has left')
    })
    
})


module.exports = server