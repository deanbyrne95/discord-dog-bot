const Discord = require('discord.js')
const r2 = require('r2')

const client = new Discord.Client()

const config = require('./package.json')

const dog_bot_token = process.env.NODE_ENV === 'production' ? process.env.dog_bot_token : require('./config.json').dog_bot_token
const dog_api_token = process.env.NODE_ENV === 'production' ? process.env.dog_api_token : require('./config.json').dog_api_token

const dogEmojis = require('./dog.json').dog_emojis
const dogActivities = require('./dog.json').dog_activities
const dogPints = require('./dog.json').dog_pints

client.on('ready', () => {
    console.log(`Connected as ${client.user.tag}`)
})

client.on('error', error => {
    console.error(`\**Grrrrr*\*\nThere was an error: ${error}`)
})

client.on('message', receivedMessage => {
    if (receivedMessage.author !== client.user) {
        if (receivedMessage.content.startsWith('£')) {
            processCommand(receivedMessage)
        }
    }
})

let dogTimer = setInterval(() => {changeActivity()}, 1800000)

function changeActivity() {
    let randomActivity = getRandomArrayItem(dogActivities)
    console.log(`Changing activity to type '${randomActivity.type}' activity '${randomActivity.name}'`)
    client.user.setActivity(randomActivity.name, {
        type: randomActivity.type,
        url: randomActivity.url
    }).then(
        () => {},
        (error) => console.error(error)
    )
}

function getRandomArrayItem(array) {
    return array[Math.floor(Math.random() * array.length)]
}

function processCommand(receivedMessage) {
    let fullCommand = receivedMessage.content.substring(1)
    let splitCommand = fullCommand.split(' ')
    let primaryCommand = splitCommand[0]
    let arguments = splitCommand.slice(1)

    console.log(`'£${primaryCommand}' command received${arguments.length > 0 ? ` with arguments '${arguments}'` : ''}`)

    searchCommands(receivedMessage, primaryCommand, arguments)
}

function searchCommands(receivedMessage, primaryCommand, arguments) {
    if (primaryCommand in knownCommands) {
        react(receivedMessage)
        knownCommands[primaryCommand].action(receivedMessage, arguments)
    } else {
        sendMessage(receivedMessage, `\`£${primaryCommand}\` is not a known command. Please try \`£help\``)
    }
}

function helpCommand(receivedMessage, arguments) {
    if (arguments.length === 0) {
        commandsCommand(receivedMessage)
    } else {
        sendMessage(receivedMessage, `It looks like you need help with ${arguments}. Bark!`, true)
    }
}

function commandsCommand(receivedMessage) {
    let commands = ''
    Object.keys(knownCommands).sort().forEach((command) => {
        if (command !== '') {
            commands = commands.concat(`> \`£${command}\`${knownCommands[command].arguments ? '*\`[arguments]\`*' : ''} - ${knownCommands[command].desc}\n`)
        }
    })
    sendMessage(receivedMessage, `Arf! Here is a list of all commands.\n${commands}`)

}

function gitCommand(receivedMessage) {
    sendMessage(receivedMessage, `Woof! My ${config.repository.type} URL is ${config.repository.url.substring(4)}`, false)
}

function pintsCommand(receivedMessage, arguments) {
    sendMessage(receivedMessage, `Woof${arguments.length > 0 ? '??' : '!! :dog:'}`, true, {files: [getRandomArrayItem(dogPints)]})
}

function bark(receivedMessage, arguments, options) {
    let bark = returnBark(receivedMessage, arguments)
    sendMessage(receivedMessage, bark, true, options)
}

async function genericBarkCommand(receivedMessage, arguments) {
    let image = null
    try {
        image = await loadImage(receivedMessage.author.id)
        console.log(`Image processed - showing ${image.id}`)
    } catch (error) {
        console.error(`Error - ${error}`)
    }
    bark(receivedMessage, arguments, {files: [image.url]})
}

function returnBark(receivedMessage, arguments) {
    let command = receivedMessage.content.substring(1).split(' ')[0]
    let bark = arguments.length > 0 || command === 'growl' ? command : command.repeat(getRandomInt(1, 5))
    bark = bark.concat(arguments.length > 0 ? '??' : '!!')
    let randomEmoji = getRandomArrayItem(dogEmojis).emoji
    bark = bark.concat(' ').concat(randomEmoji)
    return bark
}

function petCommand(receivedMessage, arguments) {
    // TODO: Future feature
}

function walkCommand(receivedMessage, arguments) {
    // TODO: Future feature
}

function playCommand(receivedMessage, arguments) {
    // TODO: Future feature
}

function statusCommand(receivedMessage, arguments) {
    // TODO: Future feature
}

function feedCommand(receivedMessage, arguments) {
    // TODO: Future feature
}

function levelCommand(receivedMessage, arguments) {
    // TODO: Future feature
}

function react(receivedMessage) {
    let randomReact = getRandomArrayItem(dogEmojis).reaction
    randomReact.forEach(reaction => {
        receivedMessage.react(reaction).then(
            () => console.log(`Reacted to ${receivedMessage.author.tag}'s message`),
            (error) => console.error(`Error - ${error}`)
        )
    })
}

function sendMessage(receivedMessage, message, reply = false, options) {
    if (reply) {
        receivedMessage.reply(message, options)
    } else {
        receivedMessage.channel.send(`${message}`)
    }
}

async function loadImage(username) {
    const headers = {
        'X-API-Key': dog_api_token
    }
    const url = `https://api.thedogapi.com/v1/images/search?sub_id=${username}`
    try {
        const image = await r2.get(url, {headers}).json
        console.log(`Image retrieved - ${JSON.stringify(image)}`)
        return image[0];
    } catch (error) {
        console.error(`Error - ${error}`)
        return null;
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

client.login(dog_bot_token).then(
    () => {
        changeActivity()
    },
    (error) => console.error(`${error}\nToken: ${dog_bot_token}`)
)

const knownCommands = {
    'help': {
        'desc': 'Lists out everything relating to the Mr. Doggo',
        'action': helpCommand,
        'arguments': true
    },
    'git': {
        'desc': 'Mr. Doggo\'s Git repository information',
        'action': gitCommand,
        'arguments': false
    },
    'pints': {
        'desc': 'I do have 45 pints in about two hours. I\'d have a packet of crisps then, and a maybe an old packet of peanuts',
        'action': pintsCommand,
        'arguments': false
    },
    'woof': {
        'desc': 'Say \'Woof\' again, I dare you, I double-dare you buttsniffer, say \'Woof\' one more dogdamn time!',
        'action': genericBarkCommand,
        'arguments': false
    },
    'bark': {
        'desc': 'You must be barkin\' mad!',
        'action': genericBarkCommand,
        'arguments': false
    },
    'bork': {
        'desc': 'Borkin\' up the wrong tree!',
        'action': genericBarkCommand,
        'arguments': false
    },
    'growl': {
        'desc': 'Grrrrrrrrrrr!!',
        'action': genericBarkCommand,
        'arguments': false
    },
    // 'pet': petCommand,
    // 'walk': walkCommand,
    // 'play': playCommand,
    // 'status': statusCommand,
    // 'feed': feedCommand,
    // 'level': levelCommand
}