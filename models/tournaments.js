let { getAllTournaments, getMatchesByTournament } = require('../database/firebase')

async function getTournaments() {
    const res = await getAllTournaments()
    return res
}

async function getTournamentMatches(tournamentId) {
    const res = await getMatchesByTournament(tournamentId)
    return res;
}

module.exports = {
    getTournaments,
    getTournamentMatches
}