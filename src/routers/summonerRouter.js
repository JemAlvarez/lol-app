const express = require('express')
const router = new express.Router()
const fetch = require('node-fetch')
const getSummonerSpellsArr = require('../utils/getSummonerSpellsArr')

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
        let ranked = {}
        if (rankedStatsData[0]) {
            ranked = {
                ...rankedStatsData[0],
                winPercent: Math.round((rankedStatsData[0].wins / (rankedStatsData[0].wins + rankedStatsData[0].losses)) * 100),
                rankImg: `${process.env.URL}/img/ranks/${rankedStatsData[0].tier.toLowerCase()}`
            }
        }
        summoner = {
            id: summonerData.id,
            accountId: summonerData.accountId,
            name: summonerData.name,
            icon: `http://ddragon.leagueoflegends.com/cdn/${process.env.VERSION}/img/profileicon/${summonerData.profileIconId}.png`,
            level: summonerData.summonerLevel,
            championMastery: champMasteryData,
            totalMasteryScore: totalMasteryData,
            ranked: ranked,
            matchHistory: matchHistoryData
        }
        res.send(summoner)
    } catch (e) {
        res.status(400).send()
    }
})

router.get('/match/:region/:summoner/:id', async (req, res) => {
    try {
        const spells = await getSummonerSpellsArr()
        const response = await fetch(`https://${req.params.region}.api.riotgames.com/lol/match/v4/matches/${req.params.id}`, fetchOptions)
        const data = await response.json()
        const participantIdentity = data.participantIdentities.find(participant => participant.player.summonerName.toLowerCase() === req.params.summoner)
        const participant = data.participants.find(participant => participant.participantId === participantIdentity.participantId)
        let participantsArr = []
        data.participantIdentities.forEach(part => {
            participantsArr.push({
                summoner: part.player.summonerName,
                icon: `http://ddragon.leagueoflegends.com/cdn/${process.env.VERSION}/img/profileicon/${part.player.profileIcon}.png`
            })
        })
        const spell1 = spells.find(spell => spell.key === `${participant.spell1Id}`)
        const spell2 = spells.find(spell => spell.key === `${participant.spell2Id}`)
        const game = {
            gameId: data.gameId,
            date: data.gameCreation,
            duration: data.gameDuration,
            map: `http://ddragon.leagueoflegends.com/cdn/${process.env.VERSION}/img/map/map${data.mapId}.png`,
            gameMode: data.gameMode,
            spell1,
            spell2,
            team: participant.teamId,
            champion: participant.championId,
            win: participant.stats.win,
            k: participant.stats.kills,
            d: participant.stats.deaths,
            a: participant.stats.assists,
            tripleKills: participant.stats.tripleKills,
            quadraKills: participant.stats.quadraKills,
            pentaKills: participant.stats.pentaKills,
            damageDealt: participant.stats.totalDamageDealt,
            visionScore: participant.stats.visionScore,
            gold: participant.stats.goldEarned,
            cs: participant.stats.totalMinionsKilled,
            champLevel: participant.stats.champLevel,
            firstBlood: participant.stats.firstBloodKill,
            players: participantsArr
        }
        res.send(game)
    } catch (e) {
        res.status(400).send()
    }
})

module.exports = router