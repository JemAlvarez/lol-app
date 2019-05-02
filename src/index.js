const express = require('express')
const cors = require('cors')
const championsRouter = require('./routers/championsRouter')
const summonerRouter = require('./routers/summonerRouter')

const app = express()
app.use(cors())
app.use(express.json())
app.use(championsRouter)
app.use(summonerRouter)

app.get('/', (req, res) => {
    res.send({
        summonerData: '/summoner/:region/:name',
        findMatchById: '/match/:region/:summoner/:id',
        findChampionById: '/champion/:id',
        allChampions: '/champions',
        randomSplashArt: '/splashart',
        randomLane: '/random-lane',
        randomChampion: '/random-champion',
        randomSkin: '/random-skin/:champion',
        freeChampRotation: '/rotation',
        images: '/img/:folder/:name'
    })
})

const port = process.env.PORT

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})