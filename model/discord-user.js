const mongoose = require('mongoose')

module.exports = mongoose.model('DiscordUser', new mongoose.Schema({
    id: {type: String, unique: true},
    username: {type: String, unique: true},
    dogStatus: {
        level: {type: Number},
        xp: {type: Number},
        levelProgress: {type: Number},
        luvs: {type: Number},
        fun: {type: Number},
        hunger: {type: Number},
    }
}))