const getAllChampsArray = require('./getAllChampsArray')

const getChampionById = async (id) => {
    const champions = await getAllChampsArray()
    const champion = champions.find(champ => champ.champId === `${id}`)
    return champion
}

module.exports = getChampionById