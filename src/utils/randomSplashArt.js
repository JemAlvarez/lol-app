const cron = require('node-cron')
const getAllChampsArray = require('./getAllChampsArray')

let splashArt = {
    splashArt: 'http://ddragon.leagueoflegends.com/cdn/img/champion/splash/Pyke_0.jpg'
}

cron.schedule('22 1 * * *', () => {
    getAllChampsArray().then(champions => {
        const item = champions[Math.floor(Math.random() * champions.length)]
        splashArt = { splashArt: item.splashImg }
    })
})

const randomSplashArt = () => {
    return splashArt
}

module.exports = randomSplashArt