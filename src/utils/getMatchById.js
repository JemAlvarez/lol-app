const fetch = require('node-fetch')
const getSummonerSpellsArr = require('./getSummonerSpellsArr')
const getChampionById = require('./getChampionById')

const fetchOptions = {
    method: 'GET',
    headers: {
        'X-Riot-Token': process.env.LEAGUE
    }
}

const getMatchById = async (region, summoner, id) => {
    const spells = await getSummonerSpellsArr()
    const response = await fetch(`https://${region}.api.riotgames.com/lol/match/v4/matches/${id}`, fetchOptions)
    const data = await response.json()
    const participantIdentity = data.participantIdentities.find(participant => participant.player.summonerName.toLowerCase() === summoner)
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
    return {
        gameId: data.gameId,
        date: data.gameCreation,
        duration: data.gameDuration,
        map: `http://ddragon.leagueoflegends.com/cdn/${process.env.VERSION}/img/map/map${data.mapId}.png`,
        gameMode: data.gameMode,
        spell1,
        spell2,
        team: participant.teamId,
        teamColor: participant.teamId === 100 ? 'blue' : 'red',
        championId: participant.championId,
        champion: await getChampionById(participant.championId),
        win: data.gameDuration < 300 ? null : participant.stats.win,
        k: participant.stats.kills,
        d: participant.stats.deaths,
        a: participant.stats.assists,
        tripleKills: participant.stats.tripleKills,
        quadraKills: participant.stats.quadraKills,
        pentaKills: participant.stats.pentaKills,
        totalDamageDealtToChampions: participant.stats.totalDamageDealtToChampions,
        visionScore: participant.stats.visionScore,
        gold: participant.stats.goldEarned,
        cs: participant.stats.totalMinionsKilled + participant.stats.neutralMinionsKilled,
        champLevel: participant.stats.champLevel,
        firstBlood: participant.stats.firstBloodKill,
        players: participantsArr
    }
}

module.exports = getMatchById