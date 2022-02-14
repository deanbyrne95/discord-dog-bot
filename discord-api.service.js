const {dog_emojis: dogEmojis, dog_activities: dogActivities} = require("./dog.json");

const utilService = require("./util.service");

function changeActivity(client) {
    let randomActivity = utilService.getRandomArrayItem(dogActivities)
    console.log(`Changing activity to type '${randomActivity.type}' activity '${randomActivity.name}'`)
    client.user.setActivity(randomActivity.name, {
        type: randomActivity.type,
        url: randomActivity.url
    }).then(
        () => {},
        (error) => console.error(error)
    )
}

function react(receivedMessage) {
    let randomReact = utilService.getRandomArrayItem(dogEmojis).reaction
    randomReact.forEach(reaction => {
        receivedMessage.react(reaction).then(
            () => console.log(`Reacted to ${receivedMessage.author.tag}'s message`),
            (error) => console.error(`Error - ${error}`)
        )
    })
}

function privateReply(receivedMessage, user) {
    receivedMessage.author.send(`Here is your information requested\n${user}`)
        .then(
            () => console.log(`Sent private message to ${user.username}`),
            (error) => console.error(`Error sending private message - ${error}`)
        )
}

function sendMessage(receivedMessage, message, reply = false, options) {
    if (reply) {
        receivedMessage.reply(message, options)
    } else {
        receivedMessage.channel.send(`${message}`)
    }
}

module.exports = {
    changeActivity,
    privateReply,
    react,
    sendMessage
}