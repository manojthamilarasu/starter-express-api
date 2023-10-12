let { addMatchResults, addTeam, getAllTeamsByTournament } = require('../database/firebase')

async function saveMatchResults(data) {
    await addMatchResults(data)
    return { created: true }
}

async function addTeamToDB(data) {
    const tournamentId = data.tournamentId;
    const teams = data.teams;
    for (let team of teams){
        await addTeam({tournamentId, name: team });
    }
    return { created: true }
}

async function getTeamsByTournaments(data) {
    const res = await getAllTeamsByTournament(data.tournamentId)
    return res;
}

module.exports = {
    saveMatchResults,
    addTeamToDB,
    getTeamsByTournaments
}