const Discord = require('discord.js')
const r2 = require('r2')
require('./model/db')
const DiscordUser = require('./model/discord-user')

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

const lonelyTimer = (getRandomInt(10, 50) * 100000)
let dogLonely = setInterval(async () => {await lonely()}, lonelyTimer)

const boredTimer = (getRandomInt(10, 50) * 100000)
let dogBored = setInterval(async () => {await bored()}, boredTimer)

const hungerTimer = (getRandomInt(10, 50) * 100000)
let dogHunger = setInterval(async () => {await hunger()}, hungerTimer)

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

async function lonely() {
    let users;
    users = await getUsers()
    for (const user of users) {
        console.log(`I'm lonely ${user.username}!`)
        user.dogStatus = downgradeDogStatus(user.dogStatus, getRandomInt(0, 1))
        await editUser(user)
    }
}

async function bored() {
    let users;
    users = await getUsers()
    for (const user of users) {
        console.log(`I'm bored ${user.username}!`)
        user.dogStatus = downgradeDogStatus(user.dogStatus, 0, getRandomInt(0, 1))
        await editUser(user)
    }
}

async function hunger() {
    let users;
    users = await getUsers()
    for (const user of users) {
        console.log(`I'm hungry ${user.username}!`)
        user.dogStatus = downgradeDogStatus(user.dogStatus, 0, 0, getRandomInt(0, 2))
        await editUser(user)
    }
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

async function petCommand(receivedMessage) {
    let user = await userCheck(receivedMessage);
    pet(receivedMessage, user)
    await editUser(user)
    sendMessage(receivedMessage, '... :heart:', true)
}

function pet(receivedMessage, user) {
    console.log(`${user.username} pet me!`)
    user.dogStatus = upgradeDogStatus(user.dogStatus, 1)
}

async function walkCommand(receivedMessage) {
    let user = await userCheck(receivedMessage)
    walk(receivedMessage, user)
    await editUser(user)
    sendMessage(receivedMessage, 'Yip Yip!! :guide_dog:', true)
}

function walk(receivedMessage, user) {
    console.log(`${user.username} brought me for a walk!`)
    user.dogStatus = upgradeDogStatus(user.dogStatus, 1, 1)
}

async function playCommand(receivedMessage) {
    let user = await userCheck(receivedMessage)
    play(receivedMessage, user)
    await editUser(user)
    sendMessage(receivedMessage, 'Woof woof!! :tennis:', true)
}

function play(receivedMessage, user) {
    console.log(`${user.username} played with me!`)
    user.dogStatus = upgradeDogStatus(user.dogStatus, 1, 2)
}

async function feedCommand(receivedMessage) {
    let user = await userCheck(receivedMessage)
    feed(receivedMessage, user)
    await editUser(user)
    sendMessage(receivedMessage, '... :bone:', true)
}

function feed(receivedMessage, user) {
    console.log(`${user.username} fed me!`)
    user.dogStatus = upgradeDogStatus(user.dogStatus, 1, 0, 1)
}

function upgradeDogStatus(dogStatus, luvs = 0, fun = 0, hunger = 0) {
    dogStatus.xp += getRandomInt(dogStatus.levelProgress / 100, dogStatus.levelProgress / 10)
    if (dogStatus.xp >= dogStatus.levelProgress) {
        dogStatus.xp = 0
        levelUp(dogStatus)
    }
    if (dogStatus.luvs < 10 && luvs > 0) {
        console.log(`Upgrading luvs by ${luvs}`)
        dogStatus.luvs += luvs
    }
    if (dogStatus.fun < 10 && fun > 0) {
        console.log(`Upgrading fun by ${fun}`)
        dogStatus.fun = (dogStatus.fun + fun) > 10 ? 10 : (dogStatus.fun + fun)
    }
    if (dogStatus.hunger > 0 && hunger > 0) {
        console.log(`Upgrading hunger by ${hunger}`)
        dogStatus.hunger -= hunger
    }
    return dogStatus
}

function downgradeDogStatus(dogStatus, luvs = 0, fun = 0, hunger = 0) {
    if (dogStatus.luvs > 0 && luvs > 0) {
        console.log(`Downgrading luvs by ${luvs}`)
        dogStatus.luvs -= luvs
    }
    if (dogStatus.fun > 0 && fun > 0) {
        console.log(`Downgrading fun by ${fun}`)
        dogStatus.fun -= fun
    }
    if (dogStatus.hunger < 10 && hunger > 0) {
        console.log(`Downgrading hunger by ${hunger}`)
        dogStatus.hunger = (dogStatus.hunger + hunger) > 10 ? 10 : (dogStatus.hunger + hunger)
    }
    return dogStatus
}

async function statusCommand(receivedMessage) {
    let user = await userCheck(receivedMessage)
    let level = getUserLevel(user.dogStatus.level.toString());
    sendMessage(receivedMessage, 'Here are your stats:', true, {
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
                    value: processStatus('Luvs', user.dogStatus.luvs)
                },
                {
                    name: 'Fun',
                    value: processStatus('Fun', user.dogStatus.fun)
                },
                {
                    name: 'Hunger',
                    value: processStatus('Hunger', user.dogStatus.hunger)
                },
                {
                    name: 'XP',
                    value: processStatus('XP', user.dogStatus.xp, user.dogStatus.levelProgress)
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

async function infoCommand(receivedMessage) {
    let user = await getUser(receivedMessage.author.tag, '-_id -__v -dogStatus');
    sendMessage(receivedMessage, `${user}`, true);
}

function getUserLevel(level) {
    let levelArray = level.split('')
    let levelEmojis = '';
    levelArray.forEach((num) => {
        levelEmojis = levelEmojis.concat(`${numberToWord(parseInt(num))}`)
    })
    return levelEmojis;
}

function numberToWord(number) {
    switch(number) {
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

function processStatus(category, value, limit = 10) {
    let result = `${value}/${limit}\n`;
    switch(category) {
        case 'Luvs':
            result = result.concat('[').concat(':heart:'.repeat(value))
                .concat((limit - value) > 0 ? ':black_heart:'.repeat(limit - value) : '')
                .concat(']')
            break;
        case 'Fun':
            result = result.concat('[').concat(':tennis:'.repeat(value))
                .concat((limit - value) > 0 ? ':black_circle:'.repeat(limit - value) : '')
                .concat(']')
            break;
        case 'Hunger':
            // Hunger is different
            result = result.concat('[')
                .concat((limit - value) > 0 ? ':bone:'.repeat(limit - value) : '')
                .concat(':meat_on_bone:'.repeat(value))
                .concat(']')
            break;
        case 'XP':
            result = result.concat('[').concat(':white_check_mark:'.repeat(Math.floor((value / limit) * 10)))
                .concat((10 - Math.floor((value / limit) * 10)) > 0 ? ':heavy_check_mark:'.repeat(10 - Math.floor((value / limit) * 10)) : '')
                .concat(']')
            break;
        default:
            console.error(`Unknown category: ${category}`)
            result = null;
            break;
    }
    return result;
}

function levelUp(dogStatus) {
    dogStatus.level += 1
    dogStatus.levelProgress = Math.floor(dogStatus.levelProgress * 1.5)
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

async function createUser(receivedMessage) {
    const user = new DiscordUser({
        id: receivedMessage.author.id,
        username: receivedMessage.author.tag,
        dogStatus: {
            level: 1,
            xp: 0,
            levelProgress: 100,
            luvs: 0,
            fun: 0,
            hunger: 10
        }
    })
    await user.save()
    console.log(`Created new user - ${user.toJSON().username}`)
    return getUser(user.toJSON().username);
}

async function editUser(user) {
    await DiscordUser
        .findOneAndUpdate({
            username: user.username
        }, {
            dogStatus: user.dogStatus
        }, {
            new: true,
            runValidators: true
        })
    return getUser(user.username)
}

async function getUser(username, exclusions = '-_id -__v') {
    const user = await DiscordUser.find({"username": username})
        .select(exclusions)
        .then((user) => {
            return user[0]
        });
    if (user !== undefined)
        console.log(`User ${user.username} retrieved`)
    return user;
}

async function getUsers() {
    return await DiscordUser.find()
        .select('-_id -__v')
        .then((user) => {
            return user
        });
}

async function userCheck(receivedMessage) {
    let user
    if (await userExists(receivedMessage.author.tag)) {
        console.log('User exists');
        user = await getUser(receivedMessage.author.tag)
    } else {
        console.log('User does not exist');
        user = await createUser(receivedMessage)
    }
    return user;
}

async function userExists(username) {
    let user = await getUser(username)
    return user !== null && user !== undefined;
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
    'pet': {
        'desc': 'Pet me... if you dare',
        'action': petCommand,
        'arguments': false
    },
    'walk': {
        'desc': 'Walk... WALK?! WWAALLKK?!?!',
        'action': walkCommand,
        'arguments': false
    },
    'play': {
        'desc': 'It\'s playtime',
        'action': playCommand,
        'arguments': false
    },
    'feed': {
        'desc': 'Get in my belly!',
        'action': feedCommand,
        'arguments': false
    },
    'status': {
        'desc': 'See how I feel about you!',
        'action': statusCommand,
        'arguments': false
    },
    'info': {
        'desc': 'See what I know about you!',
        'action': infoCommand,
        'arguments': false
    }
}