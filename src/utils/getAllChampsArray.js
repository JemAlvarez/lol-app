const fetch = require('node-fetch')

const getAllChampsArray = () => {
    const champs = fetch('http://ddragon.leagueoflegends.com/cdn/9.8.1/data/en_US/champion.json')
        .then(res => res.json())
        .then(async (data) => {
            let champions = []
            const champs = data.data
            await Object.keys(champs).map(val => {
                const obj = champs[val]
                const champ = {
                    name: obj.name,
                    champId: obj.key,
                    title: obj.title,
                    desc: obj.blurb,
                    role: obj.tags,
                    icon: `http://ddragon.leagueoflegends.com/cdn/9.8.1/img/champion/${obj.name.replace(' ', '')}.png`,
                    loadingImg: `http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${obj.name.replace(' ', '')}_0.jpg`,
                    splashImg: `http://ddragon.leagueoflegends.com/cdn/img/champion/splash/${obj.name.replace(' ', '')}_0.jpg`
                }
                champions.push(champ)
            })
            return champions
        })

    return champs
}

module.exports = getAllChampsArray