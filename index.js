const Discord = require('discord.js')
const client = new Discord.Client()

require('./model/db')

const commandService = require('./command.service')
const discordApiService = require('./discord-api.service')
const utilService = require('./util.service')

const wakeCommand = require('./config.json').wake_symbol

const dog_bot_token = process.env.NODE_ENV === 'production' ? process.env.dog_bot_token : require('./config.json').dog_bot_token

client.on('ready', () => {
    console.log(`Connected as ${client.user.tag}`)
})

client.on('error', error => {
    console.error(`*Grrrrr*\nThere was an error: ${error}`)
})

client.on('message', receivedMessage => {
    if (receivedMessage.author !== client.user) {
        if (receivedMessage.content.startsWith(wakeCommand)) {
            processCommand(receivedMessage)
        }
    }
})

const activityTimer = (utilService.getRandomInt(18, 36) * 100000)
setInterval(() => {discordApiService.changeActivity(client)}, activityTimer);

const lonelyTimer = (utilService.getRandomInt(864, 1728) * 100000)
setInterval(async () => {await commandService.lonely()}, lonelyTimer);

const boredTimer = (utilService.getRandomInt(864, 1728) * 100000)
setInterval(async () => {await commandService.bored()}, boredTimer);

const hungerTimer = (utilService.getRandomInt(864, 1728) * 100000)
setInterval(async () => {await commandService.hunger()}, hungerTimer);

function processCommand(receivedMessage) {
    let fullCommand = receivedMessage.content.substring(1)
    let splitCommand = fullCommand.split(' ')
    let primaryCommand = splitCommand[0]
    let arguments = splitCommand.slice(1)

    console.log(`'${wakeCommand.concat(primaryCommand)}' command received${arguments.length > 0 ? ` with arguments '${arguments}'` : ''}`)

    commandService.searchCommands(receivedMessage, primaryCommand, arguments, client)
}

client.login(dog_bot_token)
    .then(
        () => {
            console.log(`activityTimer(${utilService.convertMilliseconds(activityTimer)}), lonelyTimer(${utilService.convertMilliseconds(lonelyTimer)}), boredTimer(${utilService.convertMilliseconds(boredTimer)}), hungerTimer(${utilService.convertMilliseconds(hungerTimer)})`)
            discordApiService.changeActivity(client)
        },
        (error) => console.error(`${error}\nToken: ${dog_bot_token}`)
    )