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

const lonelyTimer = (utilService.getRandomInt(432, 1728) * 100000)
setInterval(async () => {await commandService.lonely()}, lonelyTimer);

const boredTimer = (utilService.getRandomInt(432, 1728) * 100000)
setInterval(async () => {await commandService.bored()}, boredTimer);

const hungerTimer = (utilService.getRandomInt(432, 1728) * 100000)
setInterval(async () => {await commandService.hunger()}, hungerTimer);

const hangryTimer = (utilService.getRandomInt(432, 1728) * 100000)
setInterval(async () => {await commandService.hangry()}, hangryTimer);

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
            const timers = `activityTimer(${utilService.convertMilliseconds(activityTimer)}), `
                .concat(`lonelyTimer(${utilService.convertMilliseconds(lonelyTimer)}), `)
                .concat(`boredTimer(${utilService.convertMilliseconds(boredTimer)}), `)
                .concat(`hungerTimer(${utilService.convertMilliseconds(hungerTimer)}), `)
                .concat(`hangryTimer(${utilService.convertMilliseconds(hangryTimer)})`)
            console.log(timers)
            discordApiService.changeActivity(client)
        },
        (error) => console.error(`${error}\nToken: ${dog_bot_token}`)
    )