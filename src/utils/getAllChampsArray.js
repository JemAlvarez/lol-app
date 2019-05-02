const fetch = require('node-fetch')

const getAllChampsArray = async () => {
    const champsRes = await fetch(`http://ddragon.leagueoflegends.com/cdn/${process.env.VERSION}/data/en_US/champion.json`)
    const champsData = await champsRes.json()
    let champions = []
    const champs = champsData.data
    Object.keys(champs).map(val => {
        const obj = champs[val]
        const champ = {
            name: obj.name,
            idName: obj.id,
            champId: obj.key,
            title: obj.title,
            desc: obj.blurb,
            role: obj.tags,
            icon: `http://ddragon.leagueoflegends.com/cdn/${process.env.VERSION}/img/champion/${obj.id}.png`,
            loadingImg: `http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${obj.id}_0.jpg`,
            splashImg: `http://ddragon.leagueoflegends.com/cdn/img/champion/splash/${obj.id}_0.jpg`
        }
        champions.push(champ)
    })
    return champions
}

module.exports = getAllChampsArray