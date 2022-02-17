const r2 = require("r2");
const utilService = require("./util.service");
const dog_api_token = process.env.NODE_ENV === 'production' ? process.env.dog_api_token : require('./config.json').dog_api_token

function downgradeDogStatus(dogStatus, luvs = 0, fun = 0, hunger = 0, pints = 0) {
    if (utilService.canDowngrade(dogStatus.luvs, luvs)) {
        console.log(`Downgrading luvs by ${luvs}`)
        dogStatus.luvs = (dogStatus.luvs - luvs) < 0 ? 0 : (dogStatus.luvs - luvs)
    }
    if (utilService.canDowngrade(dogStatus.fun, fun)) {
        console.log(`Downgrading fun by ${fun}`)
        dogStatus.fun = (dogStatus.fun - fun) < 0 ? 0 : (dogStatus.fun - fun)
    }
    if (utilService.canDowngrade(dogStatus.hunger, hunger, true)) {
        console.log(`Downgrading hunger by ${hunger}`)
        dogStatus.hunger = (dogStatus.hunger + hunger) > 10 ? 10 : (dogStatus.hunger + hunger)
    }
    if (utilService.canDowngrade(dogStatus.pints, pints)) {
        console.log(`Downgrading pints by ${pints}`)
        dogStatus.pints = (dogStatus.pints - pints) < 0 ? 0 : (dogStatus.pints - pints)
    }
    return dogStatus
}

function levelUp(dogStatus) {
    dogStatus.level += 1
    dogStatus.levelProgress = Math.floor(dogStatus.levelProgress * 1.5)
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

function processStatus(category, value = 0, limit = 10) {
    let result = `${value}/${limit}\n`;
    switch (category) {
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
        case 'Pints':
            result = result.concat('[').concat(':eyeglasses:'.repeat(value))
                .concat((limit - value) > 0 ? ':dark_sunglasses:'.repeat(limit - value) : '')
                .concat(']')
            break;
        default:
            console.error(`Unknown category: ${category}`)
            result = null;
            break;
    }
    return result;
}

function upgradeDogStatus(dogStatus, luvs = 0, fun = 0, hunger = 0, pints = 0) {
    dogStatus.xp += utilService.getRandomInt(dogStatus.levelProgress / 100, dogStatus.levelProgress / 10)
    if (dogStatus.xp >= dogStatus.levelProgress) {
        dogStatus.xp = 0
        levelUp(dogStatus)
    }
    if (utilService.canUpgrade(dogStatus.luvs, luvs)) {
        console.log(`Upgrading luvs by ${luvs}`)
        dogStatus.luvs = (dogStatus.luvs + luvs) > 10 ? 10 : (dogStatus.luvs + luvs)
    }
    if (utilService.canUpgrade(dogStatus.fun, fun)) {
        console.log(`Upgrading fun by ${fun}`)
        dogStatus.fun = (dogStatus.fun + fun) > 10 ? 10 : (dogStatus.fun + fun)
    }
    if (utilService.canUpgrade(dogStatus.hunger, hunger, true)) {
        console.log(`Upgrading hunger by ${hunger}`)
        dogStatus.hunger -= (dogStatus.hunger - hunger) < 0 ? 0 : (dogStatus.hunger - hunger)
    }
    if (utilService.canUpgrade(dogStatus.pints, pints)) {
        console.log(`Upgrading pints by ${pints}`)
        dogStatus.pints = (dogStatus.pints === undefined ? 0 : dogStatus.pints) + pints > 10 ? 10 : (dogStatus.pints === undefined ? 0 : dogStatus.pints) + pints
    }
    return dogStatus
}

module.exports = {
    downgradeDogStatus,
    loadImage,
    processStatus,
    upgradeDogStatus
}