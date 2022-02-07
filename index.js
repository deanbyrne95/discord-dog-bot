const Discord = require('discord.js')

const client = new Discord.Client()

const dog_bot_token = process.env.NODE_ENV === 'production' ? process.env.dog_bot_token : require('./config.json').dog_bot_token

client.on('ready', () => {
    console.log('Connected as ' + client.user.tag)

    client.user.setActivity('Who Let The Dogs Out', {type: "LISTENING"}).then()

})

client.on('message', (receivedMessage) => {
    if (receivedMessage.author !== client.user) {
        if (receivedMessage.content.startsWith('!')) {
            processCommand(receivedMessage);
        }
    }
})

function processCommand(receivedMessage) {
    let fullCommand = receivedMessage.content.substring(1)
    let splitCommand = fullCommand.split(" ")
    let primaryCommand = splitCommand[0]
    let arguments = splitCommand.slice(1)

    switch (primaryCommand) {
        case 'help':
            helpCommand(arguments, receivedMessage)
            break;
        default:
            receivedMessage.channel.send('Awooo! Unknown command. Try `!help`')
            break;
    }
}

function helpCommand(arguments, receivedMessage) {
    if (arguments.length === 0) {
        receivedMessage.channel.send("Grr! I'm not sure what you need help with. Try `!help [topic]`")
    } else {
        receivedMessage.channel.send(`It looks like you need help with ${arguments}. Bark!`)
    }
}

client.login(dog_bot_token).then(
    () => {},
    (error) => console.error(`${error} - Token: ${dog_bot_token}`)
)