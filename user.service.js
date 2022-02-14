const DiscordUser = require('./model/discord-user')

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
    await user.save().then(
        () => console.log(`Created new user - ${user.toJSON().username}`),
        (error) => console.error(`Error creating user:\n${error}`)
    )
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
            runValidators: true,
            useFindAndModify: false
        }).then(
            () => console.log('Updated user'),
            (error) => console.error(`Error updating user:\n${error}`)
        )
    return getUser(user.username)
}

async function getUser(username, exclusions = '-_id -__v') {
    const user = await DiscordUser.find({"username": username})
        .select(exclusions)
        .then(
            (user) => {
                return user[0]
            },
            (error) => console.error(`Error retrieving user:\n${error}`)
        );
    if (user !== undefined)
        console.log(`User ${user.username} retrieved`)
    return user;
}

async function getUsers() {
    return await DiscordUser.find()
        .select('-_id -__v')
        .then(
            (user) => {
                return user
            },
            (error) => {
                console.log(`Error retrieving users\n${error}`)
            }
        );
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

module.exports = {
    editUser,
    getUser,
    getUsers,
    userCheck
}