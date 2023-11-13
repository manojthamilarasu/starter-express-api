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

function setDefaultDrawValues(leaderboard, ageGroup, drawTeamOneId, drawTeamTwoId, drawTeamOneName, drawTeamTwoName, pool) {
    if (!_.get(leaderboard, `${ageGroup}.${pool}.${drawTeamOneId}.drawCount`) || _.get(leaderboard, `${ageGroup}.${pool}.${drawTeamOneId}.drawCount`) < 0) {
        _.set(leaderboard, `${ageGroup}.${pool}.${drawTeamOneId}.winCount`, 0)
        _.set(leaderboard, `${ageGroup}.${pool}.${drawTeamOneId}.loseCount`, 0)
    };
    if (!_.get(leaderboard, `${ageGroup}.${pool}.${drawTeamTwoId}.drawCount`) || _.get(leaderboard, `${ageGroup}.${pool}.${drawTeamTwoId}.drawCount`) < 0) {
        _.set(leaderboard, `${ageGroup}.${pool}.${drawTeamTwoId}.winCount`, 0)
        _.set(leaderboard, `${ageGroup}.${pool}.${drawTeamTwoId}.loseCount`, 0)
    };
    if (!_.get(leaderboard, `${ageGroup}.${pool}.${drawTeamOneId}.name`)) {
        _.set(leaderboard, `${ageGroup}.${pool}.${drawTeamOneId}.name`, drawTeamOneName);
    }
    if (!_.get(leaderboard, `${ageGroup}.${pool}.${drawTeamTwoId}.name`)) {
        _.set(leaderboard, `${ageGroup}.${pool}.${drawTeamTwoId}.name`, drawTeamTwoName);
    }
}

function setDefaultValues(leaderboard, ageGroup, winnerId, loserId, winnerName, loserName, pool) {
    !_.get(leaderboard, `${ageGroup}.${pool}.${loserId}.winCount`) ? _.set(leaderboard, `${ageGroup}.${pool}.${loserId}.winCount`, 0) : undefined  // setting default 0 value
    !_.get(leaderboard, `${ageGroup}.${pool}.${winnerId}.loseCount`) ? _.set(leaderboard, `${ageGroup}.${pool}.${winnerId}.loseCount`, 0) : undefined  // setting default 0 value

    !_.get(leaderboard, `${ageGroup}.${pool}.${winnerId}.drawCount`) ? _.set(leaderboard, `${ageGroup}.${pool}.${winnerId}.drawCount`, 0) : undefined  // setting default 0 value
    !_.get(leaderboard, `${ageGroup}.${pool}.${loserId}.drawCount`) ? _.set(leaderboard, `${ageGroup}.${pool}.${loserId}.drawCount`, 0) : undefined  // setting default 0 value

    !_.get(leaderboard, `${ageGroup}.${pool}.${winnerId}.name`) ? _.set(leaderboard, `${ageGroup}.${pool}.${winnerId}.name`, winnerName) : undefined
    !_.get(leaderboard, `${ageGroup}.${pool}.${loserId}.name`) ? _.set(leaderboard, `${ageGroup}.${pool}.${loserId}.name`, loserName) : undefined;

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
        const ageGroup = data.ageGroup;
        const isMatchDraw = data.isMatchDraw;

        // const drawTeamOneId = data.drawTeamOne;
        // const drawTeamOneName = data.drawTeamOneName;
        // const drawTeamTwoId = data.drawTeamTwo;
        // const drawTeamTwoName = data.drawTeamTwoName;

        const winnerId = data.winner;
        const winnerName = data.winnerName;

        const pool = data.pool;

        const loserId = data.loser;
        const loserName = data.loserName;

        const winnerGoalPlus = parseInt(data.winnerGoalPlus) || 0
        const winnerGoalMinus = parseInt(data.loserGoalPlus) || 0

        const loserGoalPlus = parseInt(data.loserGoalPlus) || 0
        const loserGoalMinus = parseInt(data.winnerGoalPlus) || 0

        console.log(winnerGoalPlus,"winnerGoalPlus")

        leaderboard[ageGroup] = leaderboard[ageGroup] || {}

        _.set(leaderboard, `${ageGroup}.${pool}.${winnerId}.goalPlus`, _.get(leaderboard, `${ageGroup}.${pool}.${winnerId}.goalPlus`, 0) + winnerGoalPlus);
        _.set(leaderboard, `${ageGroup}.${pool}.${winnerId}.goalMinus`, _.get(leaderboard, `${ageGroup}.${pool}.${winnerId}.goalMinus`, 0) + winnerGoalMinus);

        _.set(leaderboard, `${ageGroup}.${pool}.${loserId}.goalMinus`, _.get(leaderboard, `${ageGroup}.${pool}.${loserId}.goalMinus`, 0) + loserGoalMinus);
        _.set(leaderboard, `${ageGroup}.${pool}.${loserId}.goalPlus`, _.get(leaderboard, `${ageGroup}.${pool}.${loserId}.goalPlus`, 0) + loserGoalPlus);
        

        _.set(leaderboard, `${ageGroup}.${pool}.${winnerId}.goalAverage`,
            _.get(leaderboard, `${ageGroup}.${pool}.${winnerId}.goalPlus`) - _.get(leaderboard, `${ageGroup}.${pool}.${winnerId}.goalMinus`)
        );
        _.set(leaderboard, `${ageGroup}.${pool}.${loserId}.goalAverage`,
            _.get(leaderboard, `${ageGroup}.${pool}.${loserId}.goalPlus`) - _.get(leaderboard, `${ageGroup}.${pool}.${loserId}.goalMinus`)
        );

        
        if (isMatchDraw) {
            // setting default values
            setDefaultDrawValues(leaderboard, ageGroup, winnerId, loserId, winnerName, loserName, pool) 
            _.set(leaderboard, `${ageGroup}.${pool}.${winnerId}.drawCount`, _.get(leaderboard, `${ageGroup}.${pool}.${winnerId}.drawCount`, 0) + 1);
            _.set(leaderboard, `${ageGroup}.${pool}.${loserId}.drawCount`, _.get(leaderboard, `${ageGroup}.${pool}.${loserId}.drawCount`, 0) + 1);

            return;
        }

        setDefaultValues(leaderboard, ageGroup, winnerId, loserId, winnerName, loserName, pool);

        _.set(leaderboard, `${ageGroup}.${pool}.${winnerId}.winCount`, _.get(leaderboard, `${ageGroup}.${pool}.${winnerId}.winCount`, 0) + 1);
        _.set(leaderboard, `${ageGroup}.${pool}.${loserId}.loseCount`, _.get(leaderboard, `${ageGroup}.${pool}.${loserId}.loseCount`, 0) + 1);
    })

    console.log("LEADERBOARD", JSON.stringify(leaderboard));
    addPoints(leaderboard)
    sortByPoints(leaderboard);
    
    console.log("LEADERBOARD1", JSON.stringify(leaderboard));
    return leaderboard;
}

function addPoints(leaderboard) {
    let ageGroups = _.keys(leaderboard)
    for (let ageGroup of ageGroups) {
        let pools = _.keys(leaderboard[ageGroup])
        for (let pool of pools) {
            const teams = _.keys(leaderboard[ageGroup][pool])
            for (let teamId of teams) {
                leaderboard[ageGroup][pool][teamId]['points'] = (_.get(leaderboard, `${ageGroup}.${pool}.${teamId}.winCount`) * 3) + (_.get(leaderboard, `${ageGroup}.${pool}.${teamId}.drawCount`, 0));
            }
        }
    }
}

function sortByPoints(leaderboard) {
    let ageGroups = _.keys(leaderboard)
    for (let ageGroup of ageGroups) {
        
        let pools = _.keys(leaderboard[ageGroup])
        
        for (const pool of pools) {
            const ageVals = []
            const teams = _.keys(leaderboard[ageGroup][pool])
            for (let teamId of teams) {
                ageVals.push({ ...leaderboard[ageGroup][pool][teamId], teamId, pool })
            }
            if (ageGroup === 'SENIOR') {
                console.log("SENIOR:::::::::::", ageVals)
            }
        
            ageVals.sort((a, b) => {
                if (b.points === a.points) {
                    if (b.winCount === a.winCount) {
                        if (b.goalPlus === a.goalPlus) {
                            return b.goalAverage - a.goalAverage;
                        }
                        return b.goalPlus - a.goalPlus
                    }
                    return b.winCount - a.winCount
                }
                return b.points - a.points
            }
            )
            leaderboard[ageGroup][pool] = ageVals;
        }
    }
}


module.exports = {
    getTournaments,
    getTournamentMatches,
    deleteMatch,
    leaderBoardCalculation,
    addTournament
}