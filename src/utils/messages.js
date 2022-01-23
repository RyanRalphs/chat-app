const generateMessage = (text, username) => {

    const createdAt = new Date().getTime()
    return {
        text,
        createdAt,
        username
    }
}

const generateLocationMessage = (url, username) => {

    const createdAt = new Date().getTime()
    return {
        url,
        createdAt,
        username
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}