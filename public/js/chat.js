const socket = io()

const messageinput = document.querySelector('#message-form')
const locationButton = document.querySelector('#send-location')

socket.on('welcome', (message) => {
    console.log(message)
})

socket.on('message', (message) => {
    console.log(message)
})


messageinput.addEventListener('submit', (event) => {
    event.preventDefault()
    const message = event.target.elements.message.value
    console.log('clicked')
        socket.emit('messageRecieved', message ,(error) => {
            if(error) {
            return console.log(error)
            }
            console.log('Message Delivered.')
        })
})

locationButton.addEventListener('click', (event) => {
        event.preventDefault()
        if(!navigator.geolocation) {
            return alert('Your browser is too old.')
        }

        navigator.geolocation.getCurrentPosition(({coords}) => {   
            socket.emit('sendLocation', {
                latitude: coords.latitude,
                longitude: coords.longitude
            }, () => {
                console.log('Location Shared!!')
            })

        })

})



