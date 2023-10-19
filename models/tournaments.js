let { getAllTournaments, getMatchesByTournament, deleteMatchInTournament, addTournamentInDB } = require('../database/firebase')
const _ = require('lodash');

async function getTournaments() {
    const res = await getAllTournaments()
    return res
}

async function addTournament(tournamentName) {
    const res = await addTournamentInDB(tournamentName)
    return { created: true }
}

async function getTournamentMatches(tournamentId) {
    const res = await getMatchesByTournament(tournamentId)
    return res;
}

async function deleteMatch(tournamentId, matchId) {
    try {
        await deleteMatchInTournament(tournamentId, matchId)
        return { deleted: true }
    } catch (err) {
        return { deleted: false }
    }
}

async function leaderBoardCalculation(tournamentId) {
    try {
        let res = await calculateLeaderBoard(tournamentId)
        return res;
    } catch (error) {
        return { success: false }
    }
}

function setDefaultDrawValues(leaderboard, ageGroup, drawTeamOneId, drawTeamTwoId, drawTeamOneName, drawTeamTwoName) {
    if (!_.get(leaderboard, `${ageGroup}.${drawTeamOneId}.drawCount`) || _.get(leaderboard, `${ageGroup}.${drawTeamOneId}.drawCount`) < 0) {
        _.set(leaderboard, `${ageGroup}.${drawTeamOneId}.winCount`, 0)
        _.set(leaderboard, `${ageGroup}.${drawTeamOneId}.loseCount`, 0)
    };
    if (!_.get(leaderboard, `${ageGroup}.${drawTeamTwoId}.drawCount`) || _.get(leaderboard, `${ageGroup}.${drawTeamTwoId}.drawCount`) < 0) {
        _.set(leaderboard, `${ageGroup}.${drawTeamTwoId}.winCount`, 0)
        _.set(leaderboard, `${ageGroup}.${drawTeamTwoId}.loseCount`, 0)
    };
    if (!_.get(leaderboard, `${ageGroup}.${drawTeamOneId}.name`)) {
        _.set(leaderboard, `${ageGroup}.${drawTeamOneId}.name`, drawTeamOneName);
    }
    if (!_.get(leaderboard, `${ageGroup}.${drawTeamTwoId}.name`)) {
        _.set(leaderboard, `${ageGroup}.${drawTeamTwoId}.name`, drawTeamTwoName);
    }
}

function setDefaultValues(leaderboard, ageGroup, winnerId, loserId, winnerName, loserName) {
    !_.get(leaderboard, `${ageGroup}.${loserId}.winCount`) ? _.set(leaderboard, `${ageGroup}.${loserId}.winCount`, 0) : undefined  // setting default 0 value
    !_.get(leaderboard, `${ageGroup}.${winnerId}.loseCount`) ? _.set(leaderboard, `${ageGroup}.${winnerId}.loseCount`, 0) : undefined  // setting default 0 value

    !_.get(leaderboard, `${ageGroup}.${winnerId}.name`) ? _.set(leaderboard, `${ageGroup}.${winnerId}.name`, winnerName) : undefined
    !_.get(leaderboard, `${ageGroup}.${loserId}.name`) ? _.set(leaderboard, `${ageGroup}.${loserId}.name`, loserName) : undefined;

}

async function calculateLeaderBoard(tournamentId) {
    // get all matches for a tournament
    // Seggregate the winners and loser teams count
    // Show the leaderboard based on count
    const matchList = await getMatchesByTournament(tournamentId)
    if (matchList.length === 0) {
        return []
    }

    const leaderboard = {}
    
    /*
        AGE GROUP:{
            TEAMID:{
                TEAMNAME: "NAME"
                WINCOUNT:0
                LOSECOUNT:0
                DRAWCOUNT:0
            }
        }

    */

    _.forEach(matchList, (data) => {
        console.log("calculating")
        const ageGroup = data.ageGroup;
        const isMatchDraw = data.isMatchDraw;

        const drawTeamOneId = data.drawTeamOne;
        const drawTeamOneName = data.drawTeamOneName;
        const drawTeamTwoId = data.drawTeamTwo;
        const drawTeamTwoName = data.drawTeamTwoName;

        const winnerId = data.winner;
        const winnerName = data.winnerName;

        const loserId = data.loser;
        const loserName = data.loserName;

        leaderboard[ageGroup] = leaderboard[ageGroup] || {}
        
        if (isMatchDraw) {
            // setting default values
            setDefaultDrawValues(leaderboard, ageGroup, drawTeamOneId, drawTeamTwoId, drawTeamOneName, drawTeamTwoName) 
            _.set(leaderboard, `${ageGroup}.${drawTeamOneId}.drawCount`, _.get(leaderboard, `${ageGroup}.${drawTeamOneId}.drawCount`, 0) + 1);
            _.set(leaderboard, `${ageGroup}.${drawTeamTwoId}.drawCount`, _.get(leaderboard, `${ageGroup}.${drawTeamTwoId}.drawCount`, 0) + 1);

            return // continue
        }

        setDefaultValues(leaderboard, ageGroup, winnerId, loserId, winnerName, loserName);

        _.set(leaderboard, `${ageGroup}.${winnerId}.winCount`, _.get(leaderboard, `${ageGroup}.${winnerId}.winCount`, 0) + 1);
        _.set(leaderboard, `${ageGroup}.${loserId}.loseCount`, _.get(leaderboard, `${ageGroup}.${loserId}.loseCount`, 0) + 1);
    })

    console.log("LEADERBOARD", JSON.stringify(leaderboard));
    addPoints(leaderboard)
    sortByPoints(leaderboard);
    

    return leaderboard;
}

function addPoints(leaderboard) {
    let ageGroups = _.keys(leaderboard)
    for (let ageGroup of ageGroups) {
        let teams = _.keys(leaderboard[ageGroup])
        const ageVals = []
        for (let teamId of teams) {
            leaderboard[ageGroup][teamId]['points'] = (_.get(leaderboard, `${ageGroup}.${teamId}.winCount`) * 5) + (_.get(leaderboard, `${ageGroup}.${teamId}.drawCount`, 0));
        }
    }
}

function sortByPoints(leaderboard) {
    let ageGroups = _.keys(leaderboard)
    for (let ageGroup of ageGroups) {
        let teams = _.keys(leaderboard[ageGroup])
        const ageVals = []
        for (let teamId of teams) {
            ageVals.push({ ...leaderboard[ageGroup][teamId], teamId })
        }
        ageVals.sort((a, b) => b.points - a.points)
        leaderboard[ageGroup] = ageVals;
    }
}


module.exports = {
    getTournaments,
    getTournamentMatches,
    deleteMatch,
    leaderBoardCalculation,
    addTournament
}