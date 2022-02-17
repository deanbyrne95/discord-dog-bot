const {dog_emojis: dogEmojis} = require("./dog.json");

function canDowngrade(status = 0, value = 0, hunger = false, min = 0, max = 10) {
    return hunger ? status < max && value > min : status > min && value > min;
}

function canUpgrade(status = 0, value = 0, hunger = false, min = 0, max = 10) {
    return hunger ? status > min && value > min : status < max && value > min;
}

function convertMilliseconds(ms) {
    const minutes = Math.round((ms / 60000))
    if (minutes >= 60) {
        return Math.round((minutes / 60)).toString().concat(' hour(s)')
    } else {
        return minutes.toString().concat(' minutes')
    }
}

function numberToWord(number) {
    switch (number) {
        case 1:
            return ':one:'
        case 2:
            return ':two:'
        case 3:
            return ':three:'
        case 4:
            return ':four:'
        case 5:
            return ':five:'
        case 6:
            return ':six:'
        case 7:
            return ':seven:'
        case 8:
            return ':eight:'
        case 9:
            return ':nine:'
        case 0:
            return ':nine:'
        default:
            return ''
    }
}

function getRandomArrayItem(array) {
    return array[Math.floor(Math.random() * array.length)]
}

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function levelToEmojis(level) {
    let levelArray = level.split('')
    let levelEmojis = '';
    levelArray.forEach((num) => {
        levelEmojis = levelEmojis.concat(`${numberToWord(parseInt(num))}`)
    })
    return levelEmojis;
}

function returnBark(receivedMessage, arguments) {
    let command = receivedMessage.content.substring(1).split(' ')[0]
    let bark = arguments.length > 0 || command === 'growl' ? command : command.repeat(getRandomInt(1, 5))
    bark = bark.concat(arguments.length > 0 ? '??' : '!!')
    let randomEmoji = getRandomArrayItem(dogEmojis).emoji
    bark = bark.concat(' ').concat(randomEmoji)
    return bark
}

module.exports = {
    canDowngrade,
    canUpgrade,
    convertMilliseconds,
    getRandomArrayItem,
    getRandomInt,
    levelToEmojis,
    returnBark
}