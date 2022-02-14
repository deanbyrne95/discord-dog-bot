const config = require("./package.json");

const {dog_pints: dogPints} = require("./dog.json");
const {wake_symbol: wakeCommand} = require('./config.json')

const discordApiService = require("./discord-api.service");
const utilService = require("./util.service");
const dogApiService = require("./dog-api.service");
const userService = require("./user.service");

async function lonely() {
    let users = await userService.getUsers()
    for (const user of users) {
        await performAction(user, `I'm lonely ${user.username}!`, utilService.getRandomInt(0, 1))
    }
}

async function performAction(user, message, luvs = 0, fun = 0, hunger = 0) {
    console.log(`${message} ${user.username}!`)
    user.dogStatus = dogApiService.downgradeDogStatus(user.dogStatus, luvs, fun, hunger)
    await userService.editUser(user)
}

async function bored() {
    let users = await userService.getUsers()
    for (const user of users) {
        await performAction(user, `I'm bored ${user.username}!`, 0, utilService.getRandomInt(0, 1))
    }
}

async function hunger() {
    let users = await userService.getUsers()
    for (const user of users) {
        await performAction(user, `I'm hungry ${user.username}!`, 0, 0, utilService.getRandomInt(0, 2))
    }
}

function searchCommands(receivedMessage, primaryCommand, arguments, client) {
    let commandKnown = false;

    for (const command in knownCommands) {
        const keywords = knownCommands[command].keyword;
        if (keywords !== undefined && keywords.includes(primaryCommand)) {
            commandKnown = true
            discordApiService.react(receivedMessage)
            knownCommands[command].action(receivedMessage, arguments, client)
            break;
        }
    }
    if (!commandKnown) {
        discordApiService.sendMessage(receivedMessage, `\`${wakeCommand.concat(primaryCommand)}\` is not a known command. Please try \`£help\` to find out all commands`)
    }
}

async function feedCommand(receivedMessage) {
    let user = await userService.userCheck(receivedMessage)
    feed(receivedMessage, user)
    await userService.editUser(user)
    discordApiService.sendMessage(receivedMessage, '... :bone:', true)
}

function feed(receivedMessage, user) {
    console.log(`${user.username} fed me!`)
    user.dogStatus = dogApiService.upgradeDogStatus(user.dogStatus, 1, 0, 1)
}

async function genericBarkCommand(receivedMessage, arguments) {
    let image = null
    try {
        image = await dogApiService.loadImage(receivedMessage.author.id)
        console.log(`Image processed - showing ${image.id}`)
    } catch (error) {
        console.error(`Error - ${error}`)
        image = {
            'url': 'https://digitalsynopsis.com/wp-content/uploads/2016/12/http-status-codes-dogs-404.jpg'
        }
    }
    const barkResponse = utilService.returnBark(receivedMessage, arguments)
    discordApiService.sendMessage(receivedMessage, barkResponse, true, {files: [image.url]})
}

function gitCommand(receivedMessage) {
    discordApiService.sendMessage(receivedMessage, `Woof! My ${config.repository.type} URL is ${config.repository.url.substring(4)}`, false)
}

function helpCommand(receivedMessage, arguments) {
    if (arguments.length === 0) {
        listCommands(receivedMessage)
    } else {
        discordApiService.sendMessage(receivedMessage, `it looks like you need help with ${arguments}. Bark!`, true)
    }
}

async function infoCommand(receivedMessage) {
    let user = await userService.getUser(receivedMessage.author.tag, '-_id -__v -dogStatus');
    discordApiService.privateReply(receivedMessage, user)
}

function listCommands(receivedMessage) {
    let commands = ''
    Object.keys(knownCommands).sort().forEach((command) => {
        if (command !== '') {
            commands = commands.concat(`> \`${wakeCommand}${command}\`${knownCommands[command].arguments ? '*\`[arguments]\`*' : ''} - ${knownCommands[command].desc}\n`)
        }
    })
    discordApiService.sendMessage(receivedMessage, `Arf! Here is a list of all commands.\n${commands}`)
}

async function petCommand(receivedMessage) {
    let user = await userService.userCheck(receivedMessage);
    pet(receivedMessage, user)
    await userService.editUser(user)
    discordApiService.sendMessage(receivedMessage, '... :heart:', true)
}

function pet(receivedMessage, user) {
    console.log(`${user.username} pet me!`)
    user.dogStatus = dogApiService.upgradeDogStatus(user.dogStatus, 1)
}

function pintsCommand(receivedMessage, arguments) {
    discordApiService.sendMessage(receivedMessage, `Woof${arguments.length > 0 ? '??' : '!! :dog:'}`, true, {files: [utilService.getRandomArrayItem(dogPints)]})
}

async function playCommand(receivedMessage) {
    let user = await userService.userCheck(receivedMessage)
    play(receivedMessage, user)
    await userService.editUser(user)
    discordApiService.sendMessage(receivedMessage, 'Woof woof!! :tennis:', true)
}

function play(receivedMessage, user) {
    console.log(`${user.username} played with me!`)
    user.dogStatus = dogApiService.upgradeDogStatus(user.dogStatus, 1, 2)
}

async function statusCommand(receivedMessage, arguments, client) {
    let user = await userService.userCheck(receivedMessage)
    let level = utilService.levelToEmojis(user.dogStatus.level.toString());
    discordApiService.sendMessage(receivedMessage, 'here are your stats:', true, {
        embed: {
            color: 3447003,
            author: {
                name: receivedMessage.author.tag,
                icon_url: receivedMessage.author.avatarURL
            },
            title: 'Dog Status',
            url: '',
            description: `Level: ${level}`,
            fields: [
                {
                    name: `Luvs`,
                    value: dogApiService.processStatus('Luvs', user.dogStatus.luvs)
                },
                {
                    name: 'Fun',
                    value: dogApiService.processStatus('Fun', user.dogStatus.fun)
                },
                {
                    name: 'Hunger',
                    value: dogApiService.processStatus('Hunger', user.dogStatus.hunger)
                },
                {
                    name: 'XP',
                    value: dogApiService.processStatus('XP', user.dogStatus.xp, user.dogStatus.levelProgress)
                },
            ],
            timestamp: new Date(),
            footer: {
                icon_url: client.user.avatarURL,
                text: `Dog API v${config.version}`
            }
        }
    })
}

async function walkCommand(receivedMessage) {
    let user = await userService.userCheck(receivedMessage)
    walk(receivedMessage, user)
    await userService.editUser(user)
    discordApiService.sendMessage(receivedMessage, 'Yip Yip!! :guide_dog:', true)
}

function walk(receivedMessage, user) {
    console.log(`${user.username} brought me for a walk!`)
    user.dogStatus = dogApiService.upgradeDogStatus(user.dogStatus, 1, 1)
}

module.exports = {
    bored,
    hunger,
    lonely,
    searchCommands
}

const knownCommands = {
    'help': {
        'keyword': ['help', 'h'],
        'desc': 'Lists out everything relating to the Mr. Doggo',
        'action': helpCommand,
        'arguments': true
    },
    'git': {
        'keyword': ['git', 'g'],
        'desc': 'Mr. Doggo\'s Git repository information',
        'action': gitCommand,
        'arguments': false
    },
    'pints': {
        'keyword': ['pints', 'p'],
        'desc': 'I do have 45 pints in about two hours. I\'d have a packet of crisps then, and a maybe an old packet of peanuts',
        'action': pintsCommand,
        'arguments': false
    },
    'woof': {
        'keyword': ['play'],
        'desc': 'Say \'Woof\' again, I dare you, I double-dare you buttsniffer, say \'Woof\' one more dogdamn time!',
        'action': genericBarkCommand,
        'arguments': false
    },
    'bark': {
        'keyword': ['bark'],
        'desc': 'You must be barkin\' mad!',
        'action': genericBarkCommand,
        'arguments': false
    },
    'bork': {
        'keyword': ['bork'],
        'desc': 'Borkin\' up the wrong tree!',
        'action': genericBarkCommand,
        'arguments': false
    },
    'growl': {
        'keyword': ['growl'],
        'desc': 'Grrrrrrrrrrr!!',
        'action': genericBarkCommand,
        'arguments': false
    },
    'pet': {
        'keyword': ['pet'],
        'desc': 'Pet me... if you dare',
        'action': petCommand,
        'arguments': false
    },
    'walk': {
        'keyword': ['walk'],
        'desc': 'Walk... WALK?! WWAALLKK?!?!',
        'action': walkCommand,
        'arguments': false
    },
    'play': {
        'keyword': ['play'],
        'desc': 'It\'s playtime',
        'action': playCommand,
        'arguments': false
    },
    'feed': {
        'keyword': ['feed'],
        'desc': 'Get in my belly!',
        'action': feedCommand,
        'arguments': false
    },
    'status': {
        'keyword': ['status', 'stats', 's'],
        'desc': 'See how I feel about you!',
        'action': statusCommand,
        'arguments': false
    },
    'info': {
        'keyword': ['information', 'info', 'i'],
        'desc': 'See what I know about you!',
        'action': infoCommand,
        'arguments': false
    }
}