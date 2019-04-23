const cron = require('node-cron')
const getAllChampsArray = require('./getAllChampsArray')

let splashArt = {
    splashArt: 'http://ddragon.leagueoflegends.com/cdn/img/champion/splash/Pyke_0.jpg'
}

cron.schedule('10 0 * * *', () => {
    getAllChampsArray().then(champions => {
        const item = champions[Math.floor(Math.random() * champions.length)]
        splashArt = { splashArt: item.splashImg }
        console.log('cron func', splashArt)
    })
})

const randomSplashArt = () => {
    console.log('random func', splashArt)
    return splashArt
}

module.exports = randomSplashArt