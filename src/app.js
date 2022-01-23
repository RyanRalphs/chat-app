const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const Filter = require('bad-words')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()

const server = http.createServer(app)
const io = socketio(server)

let count = 0

app.use(express.static("public"))

io.on('connection', (socket) => {

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({
            id: socket.id,
            username,
            room
        })

        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage(`Welcome, ${user.username}!`, 'Admin'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!!`, 'Admin'))
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()


    })

    socket.on('messageRecieved', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Bad word detected. Message not sent')
        }
        io.to(user.room).emit('message', generateMessage(message, user.username))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`, user.username))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        
        if(user) { 
        io.to(user.room).emit('message', generateMessage(`${user.username} has left!`, 'Admin'))
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        }
    })
})


module.exports = server