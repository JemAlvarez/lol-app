const express = require('express')
const router = new express.Router()
const fetch = require('node-fetch')

const fetchOptions = {
    method: 'GET',
    headers: {
        'X-Riot-Token': process.env.LEAGUE
    }
}

router.get('/summoner/:region/:name', async (req, res) => {
    try {
        let summoner = {}
        const summonerResponse = await fetch(`https://${req.params.region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${req.params.name}`, fetchOptions)
        const summonerData = await summonerResponse.json()
        const champMasteryResponse = await fetch(`https://${req.params.region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerData.id}`, fetchOptions)
        const totalMasteryResponse = await fetch(`https://${req.params.region}.api.riotgames.com/lol/champion-mastery/v4/scores/by-summoner/${summonerData.id}`, fetchOptions)
        const rankedStatsResponse = await fetch(`https://${req.params.region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}`, fetchOptions)
        const matchHistoryResponse = await fetch(`https://${req.params.region}.api.riotgames.com/lol/match/v4/matchlists/by-account/${summonerData.accountId}`, fetchOptions)
        const rankedStatsData = await rankedStatsResponse.json()
        const totalMasteryData = await totalMasteryResponse.json()
        let matchHistoryData = await matchHistoryResponse.json()
        let champMasteryData = await champMasteryResponse.json()
        matchHistoryData = matchHistoryData.matches.slice(0, 10)
        champMasteryData = champMasteryData.slice(0, 5)
        champMasteryData.forEach(champ => {
            delete champ.championPointsSinceLastLevel
            delete champ.championPointsUntilNextLevel
            delete champ.chestGranted
            delete champ.tokensEarned
            delete champ.summonerId
        })
        rankedStatsData.forEach(item => {
            delete item.summonerId
            delete item.summonerName
            delete item.veteran
            delete item.inactive
            delete item.freshBlood
        })
        matchHistoryData.forEach(game => {
            delete game.platformId
            delete game.queue
            delete game.season
            delete game.role
            delete game.lane
        })
        summoner = {
            id: summonerData.id,
            accountId: summonerData.accountId,
            name: summonerData.name,
            icon: `http://ddragon.leagueoflegends.com/cdn/9.8.1/img/profileicon/${summonerData.profileIconId}.png`,
            level: summonerData.summonerLevel,
            championMastery: champMasteryData,
            totalMasteryScore: totalMasteryData,
            ranked: rankedStatsData[0],
            matchHistory: matchHistoryData
        }
        res.send(summoner)
    } catch (e) {
        res.status(400).send()
    }
})

router.get('/match/:region/:id', async (req, res) => {
    try {
        const response = await fetch(`https://${req.params.region}.api.riotgames.com/lol/match/v4/matches/${req.params.id}`, fetchOptions)
        const data = await response.json()
        let game = {
            gameId: data.gameId,
            date: data.gameCreation,
            duration: data.gameDuration,
            map: `http://ddragon.leagueoflegends.com/cdn/9.8.1/img/map/map${data.mapId}.png`,
            gameMode: data.gameMode
        }
        // check if won?
        res.send(data)
    } catch (e) {
        res.status(400).send()
    }
})

module.exports = router