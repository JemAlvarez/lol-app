const express = require('express')
const router = new express.Router()
const fetch = require('node-fetch')
const getChampionById = require('../utils/getChampionById')
const getMatchById = require('../utils/getMatchById')

const fetchOptions = {
    method: 'GET',
    headers: {
        'X-Riot-Token': process.env.LEAGUE
    }
}

router.get('/summoner/:region/:name', async (req, res) => {
    try {
        let summoner = {}
        let masteryChamps = []
        let matchHistory = []
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
        await Promise.all(champMasteryData.map(async champ => {
            const champion = await getChampionById(champ.championId)
            delete champion.idName
            delete champion.title
            delete champion.desc
            delete champion.desc
            delete champion.role
            delete champion.loadingImg
            delete champion.splashImg
            masteryChamps.push({
                ...champion,
                championLevel: champ.championLevel,
                championPoints: champ.championPoints,
                lastPlayTime: champ.lastPlayTime
            })
        }))
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
        await Promise.all(matchHistoryData.map(async game => {
            const match = await getMatchById(req.params.region, req.params.name, game.gameId)
            matchHistory.push({
                ...game,
                ...match
            })
        }))
        let ranked = {}
        if (rankedStatsData[0]) {
            ranked = {
                ...rankedStatsData[0],
                winPercent: Math.round((rankedStatsData[0].wins / (rankedStatsData[0].wins + rankedStatsData[0].losses)) * 100),
                rankImg: `${process.env.URL}/img/ranks/${rankedStatsData[0].tier.toLowerCase()}`,
                border: `https://opgg-static.akamaized.net/images/borders2/${rankedStatsData[0].tier.toLowerCase()}.png`
            }
        } else {
            ranked = {
                tier: 'UNRANKED',
                rankImg: `${process.env.URL}/img/ranks/unranked`
            }
        }
        summoner = {
            id: summonerData.id,
            accountId: summonerData.accountId,
            name: summonerData.name,
            icon: `http://ddragon.leagueoflegends.com/cdn/${process.env.VERSION}/img/profileicon/${summonerData.profileIconId}.png`,
            level: summonerData.summonerLevel,
            championMastery: masteryChamps,
            totalMasteryScore: totalMasteryData,
            ranked: ranked,
            matchHistory: matchHistory
        }
        res.send(summoner)
    } catch (e) {
        res.status(400).send()
    }
})

router.get('/match/:region/:summoner/:id', async (req, res) => {
    try {
        const game = await getMatchById(req.params.region, req.params.summoner, req.params.id)
        res.send(game)
    } catch (e) {
        res.status(400).send()
    }
})

module.exports = router