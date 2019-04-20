const path = require('path')
const express = require('express')
const router = new express.Router()
const fetch = require('node-fetch')
const sharp = require('sharp')
const getAllChampsArray = require('../utils/getAllChampsArray')
const randomSplashArt = require('../utils/randomSplashArt')

const fetchOptions = {
    method: 'GET',
    headers: {
        'X-Riot-Token': process.env.LEAGUE
    }
}

// All champions array
router.get('/champions', (req, res) => {
    try {
        getAllChampsArray().then(champions => res.send(champions))
    } catch (e) {
        res.status(400).send()
    }
})

// Free champions rotation for new and old players
router.get('/rotation', (req, res) => {
    try {
        fetch('https://na1.api.riotgames.com/lol/platform/v3/champion-rotations', fetchOptions)
            .then(res => res.json())
            .then(data => {
                let rotation = {
                    oldPlayers: [],
                    newPlayers: [],
                    newPlayersLevel: data.maxNewPlayerLevel
                }
                getAllChampsArray().then(champions => {
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
                })
            })
    } catch (e) {
        res.status(400).send()
    }
})

// Random splashart everyday
router.get('/splashart', (req, res) => {
    try {
        res.send(randomSplashArt())
    } catch (e) {
        res.status(400).send()
    }
})

// Random champion selector
router.get('/random-champion', (req, res) => {
    try {
        getAllChampsArray().then(champions => {
            const item = champions[Math.floor(Math.random() * champions.length)]
            res.send(item)
        })
    } catch (e) {
        res.status(400).send()
    }
})

// Random lane selector
router.get('/random-lane', (req, res) => {
    try {
        const lanes = ['bot', 'jungle', 'mid', 'support', 'top']
        const lane = lanes[Math.floor(Math.random() * lanes.length)]
        res.send({
            lane,
            img: `localhost:3000/img/positions/${lane}`
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

module.exports = router