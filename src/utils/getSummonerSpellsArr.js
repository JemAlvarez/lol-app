const fetch = require('node-fetch')

const getSummonerSpellsArr = async () => {
    const res = await fetch(`http://ddragon.leagueoflegends.com/cdn/${process.env.VERSION}/data/en_US/summoner.json`)
    const data = await res.json()
    let spells = []
    Object.keys(data.data).map(val => {
        const obj = data.data[val]
        const spell = {
            img: `http://ddragon.leagueoflegends.com/cdn/${process.env.VERSION}/img/spell/${obj.id}.png`,
            name: obj.name,
            desc: obj.description,
            key: obj.key
        }
        spells.push(spell)
    })
    return spells
}

module.exports = getSummonerSpellsArr