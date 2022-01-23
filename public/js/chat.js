const socket = io()
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormSubmit = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-template').innerHTML
const $locationLink = document.querySelector('#location-link')
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const $sidebar = document.querySelector('#sidebar')


const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    //Get last message
    const $newMessage = $messages.lastElementChild
    //Height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    // Visible Height
    const visibleHeight = $messages.offsetHeight
    // Height of all messages in container
    const containerHeight = $messages.scrollHeight
    // How far am i from the top of that container?
    const scrollOffSet = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffSet) {
        $messages.scrollTop = $messages.scrollHeight
    }
    console.log(newMessageMargin)
}

socket.on('welcome', (message) => {
    console.log(message.createdAt + ' ' + message.text)
})

socket.on('message', (message) => {
    const html = Mustache.render($messageTemplate, {
        createdAt: moment(message.createdAt).format('h:mm a'),
        message: message.text,
        username: message.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render($locationTemplate, {
        url: message.url,
        createdAt: moment(location.createdAt).format('h:mm a'),
        username: message.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomUsers', ({ users, room }) => {
    const html = Mustache.render($sidebarTemplate, {
        users,
        room
    })

    $sidebar.innerHTML = html
})


$messageForm.addEventListener('submit', (event) => {
    event.preventDefault()
    $messageFormSubmit.setAttribute('disabled', 'disabled')
    const message = event.target.elements.message.value
    console.log('clicked')
    socket.emit('messageRecieved', message, (error) => {
        if (error) {
            return console.log(error)
        }
        console.log('Message Delivered.')
        $messageFormSubmit.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
    })
})

$locationButton.addEventListener('click', (event) => {
    event.preventDefault()
    if (!navigator.geolocation) {
        return alert('Your browser is too old.')
    }
    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition(({ coords }) => {
        socket.emit('sendLocation', {
            latitude: coords.latitude,
            longitude: coords.longitude
        }, () => {
            $locationButton.removeAttribute('disabled')
            console.log('Location Shared!!')
        })

    })

})



socket.emit('join', {
    username,
    room
}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

