const path = require('path')
const express = require('express')
const router = new express.Router()
const fetch = require('node-fetch')
const sharp = require('sharp')
const getAllChampsArray = require('../utils/getAllChampsArray')
const getChampionById = require('../utils/getChampionById')

const fetchOptions = {
    method: 'GET',
    headers: {
        'X-Riot-Token': process.env.LEAGUE
    }
}

// All champions array
router.get('/champions', async (req, res) => {
    try {
        const champions = await getAllChampsArray()
        res.send(champions)
    } catch (e) {
        res.status(400).send()
    }
})

// Free champions rotation for new and old players
router.get('/rotation', async (req, res) => {
    try {
        const response = await fetch('https://na1.api.riotgames.com/lol/platform/v3/champion-rotations', fetchOptions)
        const data = await response.json()
        let rotation = {
            oldPlayers: [],
            newPlayers: [],
            newPlayersLevel: data.maxNewPlayerLevel
        }
        const champions = await getAllChampsArray()
        data.freeChampionIds.forEach(id => {
            const found = champions.find(champ => champ.champId === `${id}`)
            delete found.title
            delete found.desc
            delete found.role
            rotation.oldPlayers.push(found)
        })
        data.freeChampionIdsForNewPlayers.forEach(id => {
            const found = champions.find(champ => champ.champId === `${id}`)
            delete found.title
            delete found.desc
            delete found.role
            rotation.newPlayers.push(found)
        })
        res.send(rotation)
    } catch (e) {
        res.status(400).send()
    }
})

// Get champion by id
router.get('/champion/:id', async (req, res) => {
    try {
        const champion = await getChampionById(req.params.id)
        res.send(champion)
    } catch (e) {
        res.status(400).send()
    }
})

// Random splashart everyday
router.get('/splashart', (req, res) => {
    try {
        getAllChampsArray().then(champions => {
            const item = champions[Math.floor(Math.random() * champions.length)]
            res.send({ splashArt: item.splashImg })
        })
    } catch (e) {
        res.status(400).send()
    }
})

// Random champion selector
router.get('/random-champion', async (req, res) => {
    try {
        const champions = await getAllChampsArray()
        const item = champions[Math.floor(Math.random() * champions.length)]
        res.send(item)
    } catch (e) {
        res.status(400).send()
    }
})

// Random lane selector
router.get('/random-lane', (req, res) => {
    try {
        const lanes = ['bot', 'jungle', 'mid', 'support', 'top']
        const lane1 = lanes[Math.floor(Math.random() * lanes.length)]
        let lane2 = lanes[Math.floor(Math.random() * lanes.length)]
        while (lane2 === lane1) {
            lane2 = lanes[Math.floor(Math.random() * lanes.length)]
        }
        res.send({
            primary: {
                lane1,
                img: `${process.env.URL}/img/positions/${lane1}`
            },
            secondary: {
                lane2,
                img: `${process.env.URL}/img/positions/${lane2}`
            }
        })
    } catch (e) {
        res.status(400).send()
    }
})

// Images
router.get('/img/:folder/:name', async (req, res) => {
    try {
        const buffer = await sharp(path.join(__dirname, `../assets/${req.params.folder}/${req.params.name}.png`)).toBuffer()
        res.set('Content-Type', 'image/png')
        res.send(buffer)
    } catch (e) {
        res.status(400).send()
    }
})

// Champion Skin random
router.get('/random-skin/:champion', async (req, res) => {
    try {
        const champion = req.params.champion
        const champRes = await fetch(`http://ddragon.leagueoflegends.com/cdn/${process.env.VERSION}/data/en_US/champion/${champion}.json`)
        const champData = await champRes.json()
        const skins = champData.data[champion].skins
        let randomSkin = skins[Math.floor(Math.random() * skins.length)]
        randomSkin.splashArt = `http://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion}_${randomSkin.num}.jpg`
        res.send(randomSkin)
    } catch (e) {
        res.status(400).send()
    }
})

module.exports = router