let { getAllTournaments } = require('../database/firebase')

async function getTournaments() {
    const res = await getAllTournaments()
    return res
}

module.exports = {
    getTournaments
}