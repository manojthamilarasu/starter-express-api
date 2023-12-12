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

function setDefaultValues(leaderboard, ageGroup, winnerId, loserId, winnerName, loserName, pool, type='quad') {
    !_.get(leaderboard, `${ageGroup}.${pool}.${loserId}.winCount`) ? _.set(leaderboard, `${ageGroup}.${pool}.${loserId}.winCount`, 0) : undefined  // setting default 0 value
    !_.get(leaderboard, `${ageGroup}.${pool}.${winnerId}.loseCount`) ? _.set(leaderboard, `${ageGroup}.${pool}.${winnerId}.loseCount`, 0) : undefined  // setting default 0 value
    //if (type === 'quad') {
    !_.get(leaderboard, `${ageGroup}.${pool}.${winnerId}.drawCount`) ? _.set(leaderboard, `${ageGroup}.${pool}.${winnerId}.drawCount`, 0) : undefined  // setting default 0 value
    !_.get(leaderboard, `${ageGroup}.${pool}.${loserId}.drawCount`) ? _.set(leaderboard, `${ageGroup}.${pool}.${loserId}.drawCount`, 0) : undefined  // setting default 0 value
    //}
    !_.get(leaderboard, `${ageGroup}.${pool}.${winnerId}.name`) ? _.set(leaderboard, `${ageGroup}.${pool}.${winnerId}.name`, winnerName) : undefined
    !_.get(leaderboard, `${ageGroup}.${pool}.${loserId}.name`) ? _.set(leaderboard, `${ageGroup}.${pool}.${loserId}.name`, loserName) : undefined;

}

function groupByWheelType(matchList) {
    try {
        return _.groupBy(matchList, (val) => {
            return val.wheelType;
        })
    } catch (err) {
        throw err;
    }
}

function inlineCalculation(matchList) {
    try {
        const leaderboard = {}
        _.forEach(matchList, (data) => {
            const ageGroup = data.ageGroup;
            const isMatchDraw = data.isMatchDraw;
            const winnerId = data.winner;
            const winnerName = data.winnerName;

            const pool = data.pool;

            const loserId = data.loser;
            const loserName = data.loserName;

            const winnerGoalPlus = parseInt(data.winnerGoalPlus) || 0
            const winnerGoalMinus = parseInt(data.loserGoalPlus) || 0

            const loserGoalPlus = parseInt(data.loserGoalPlus) || 0
            const loserGoalMinus = parseInt(data.winnerGoalPlus) || 0

            console.log(winnerGoalPlus, "winnerGoalPlus")

            leaderboard[ageGroup] = leaderboard[ageGroup] || {}

            _.set(leaderboard, `${ageGroup}.${pool}.${winnerId}.matchesPlayed`, _.get(leaderboard, `${ageGroup}.${pool}.${winnerId}.matchesPlayed`, 0) + 1);
            _.set(leaderboard, `${ageGroup}.${pool}.${loserId}.matchesPlayed`, _.get(leaderboard, `${ageGroup}.${pool}.${loserId}.matchesPlayed`, 0) + 1);

            if (data.noShow) {
                _.set(leaderboard, `${ageGroup}.${pool}.${winnerId}.winsByNoShow`, _.get(leaderboard, `${ageGroup}.${pool}.${winnerId}.winsByNoShow`, 0) + 1);
            }
            if (data.forfiet) {
                _.set(leaderboard, `${ageGroup}.${pool}.${loserId}.forfiet`, _.get(leaderboard, `${ageGroup}.${pool}.${loserId}.forfiet`, 0) + 1);
            }
            if (data.shootOut) {
                _.set(leaderboard, `${ageGroup}.${pool}.${winnerId}.shootOutWin`, _.get(leaderboard, `${ageGroup}.${pool}.${winnerId}.shootOutWin`, 0) + 1);
                _.set(leaderboard, `${ageGroup}.${pool}.${loserId}.shootOutLoss`, _.get(leaderboard, `${ageGroup}.${pool}.${loserId}.shootOutLoss`, 0) + 1);
            }

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

            setDefaultValues(leaderboard, ageGroup, winnerId, loserId, winnerName, loserName, pool, 'inline');

            _.set(leaderboard, `${ageGroup}.${pool}.${winnerId}.winCount`, _.get(leaderboard, `${ageGroup}.${pool}.${winnerId}.winCount`, 0) + 1);
            _.set(leaderboard, `${ageGroup}.${pool}.${loserId}.loseCount`, _.get(leaderboard, `${ageGroup}.${pool}.${loserId}.loseCount`, 0) + 1);
        })

        return leaderboard;
    } catch (err) {
        throw err;
    }
}


async function calculateLeaderBoard(tournamentId) {
    // get all matches for a tournament
    // Seggregate the winners and loser teams count
    // Show the leaderboard based on count
    const matchList = await getMatchesByTournament(tournamentId);
    if (matchList.length === 0) {
        return []
    }
    console.log("MATCHLIST", JSON.stringify(matchList));
    const leaderboard = {}  // QUAD
    const leaderboardMixed = {}  // QUAD MIXED
    let inlineLeaderBoard = {} //INLINE
    const groups = groupByWheelType(matchList);
    const quad = groups.quad;
    const inline = groups.inline;
    const quadMixed = groups.quadMixed;
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

    if (quad) {
        _.forEach(quad, (data) => {
            const ageGroup = data.ageGroup;
            const isMatchDraw = data.isMatchDraw;

            const winnerId = data.winner;
            const winnerName = data.winnerName;

            const pool = data.pool;

            const loserId = data.loser;
            const loserName = data.loserName;

            const winnerGoalPlus = parseInt(data.winnerGoalPlus) || 0
            const winnerGoalMinus = parseInt(data.loserGoalPlus) || 0

            const loserGoalPlus = parseInt(data.loserGoalPlus) || 0
            const loserGoalMinus = parseInt(data.winnerGoalPlus) || 0


            leaderboard[ageGroup] = leaderboard[ageGroup] || {}
            _.set(leaderboard, `${ageGroup}.${pool}.${winnerId}.matchesPlayed`, _.get(leaderboard, `${ageGroup}.${pool}.${winnerId}.matchesPlayed`, 0) + 1);
            _.set(leaderboard, `${ageGroup}.${pool}.${loserId}.matchesPlayed`, _.get(leaderboard, `${ageGroup}.${pool}.${loserId}.matchesPlayed`, 0) + 1);
            if (data.noShow) {
                _.set(leaderboard, `${ageGroup}.${pool}.${winnerId}.winsByNoShow`, _.get(leaderboard, `${ageGroup}.${pool}.${winnerId}.winsByNoShow`, 0) + 1);
                _.set(leaderboard, `${ageGroup}.${pool}.${loserId}.lostByNoShow`, _.get(leaderboard, `${ageGroup}.${pool}.${loserId}.lostByNoShow`, 0) + 1);
            }

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

            _.set(leaderboard, `${ageGroup}.${pool}.${winnerId}.goalRatio`,
                Math.round(_.get(leaderboard, `${ageGroup}.${pool}.${winnerId}.goalPlus`) / _.get(leaderboard, `${ageGroup}.${pool}.${winnerId}.goalMinus`)*100) / 100
            );
            _.set(leaderboard, `${ageGroup}.${pool}.${loserId}.goalRatio`,
                Math.round(_.get(leaderboard, `${ageGroup}.${pool}.${loserId}.goalPlus`) / _.get(leaderboard, `${ageGroup}.${pool}.${loserId}.goalMinus`) * 100) / 100
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
    }
    if (quadMixed) {
        _.forEach(quadMixed, (data) => {
            const ageGroup = data.ageGroup;
            const isMatchDraw = data.isMatchDraw;

            const winnerId = data.winner;
            const winnerName = data.winnerName;

            const pool = data.pool;

            const loserId = data.loser;
            const loserName = data.loserName;

            const winnerGoalPlus = parseInt(data.winnerGoalPlus) || 0
            const winnerGoalMinus = parseInt(data.loserGoalPlus) || 0

            const loserGoalPlus = parseInt(data.loserGoalPlus) || 0
            const loserGoalMinus = parseInt(data.winnerGoalPlus) || 0


            leaderboardMixed[ageGroup] = leaderboardMixed[ageGroup] || {}
            _.set(leaderboardMixed, `${ageGroup}.${pool}.${winnerId}.matchesPlayed`, _.get(leaderboardMixed, `${ageGroup}.${pool}.${winnerId}.matchesPlayed`, 0) + 1);
            _.set(leaderboardMixed, `${ageGroup}.${pool}.${loserId}.matchesPlayed`, _.get(leaderboardMixed, `${ageGroup}.${pool}.${loserId}.matchesPlayed`, 0) + 1);
            if (data.noShow) {
                _.set(leaderboardMixed, `${ageGroup}.${pool}.${winnerId}.winsByNoShow`, _.get(leaderboardMixed, `${ageGroup}.${pool}.${winnerId}.winsByNoShow`, 0) + 1);
                _.set(leaderboardMixed, `${ageGroup}.${pool}.${loserId}.lostByNoShow`, _.get(leaderboardMixed, `${ageGroup}.${pool}.${loserId}.lostByNoShow`, 0) + 1);
            }

            _.set(leaderboardMixed, `${ageGroup}.${pool}.${winnerId}.goalPlus`, _.get(leaderboardMixed, `${ageGroup}.${pool}.${winnerId}.goalPlus`, 0) + winnerGoalPlus);
            _.set(leaderboardMixed, `${ageGroup}.${pool}.${winnerId}.goalMinus`, _.get(leaderboardMixed, `${ageGroup}.${pool}.${winnerId}.goalMinus`, 0) + winnerGoalMinus);

            _.set(leaderboardMixed, `${ageGroup}.${pool}.${loserId}.goalMinus`, _.get(leaderboardMixed, `${ageGroup}.${pool}.${loserId}.goalMinus`, 0) + loserGoalMinus);
            _.set(leaderboardMixed, `${ageGroup}.${pool}.${loserId}.goalPlus`, _.get(leaderboardMixed, `${ageGroup}.${pool}.${loserId}.goalPlus`, 0) + loserGoalPlus);


            _.set(leaderboardMixed, `${ageGroup}.${pool}.${winnerId}.goalAverage`,
                _.get(leaderboardMixed, `${ageGroup}.${pool}.${winnerId}.goalPlus`) - _.get(leaderboardMixed, `${ageGroup}.${pool}.${winnerId}.goalMinus`)
            );
            _.set(leaderboardMixed, `${ageGroup}.${pool}.${loserId}.goalAverage`,
                _.get(leaderboardMixed, `${ageGroup}.${pool}.${loserId}.goalPlus`) - _.get(leaderboardMixed, `${ageGroup}.${pool}.${loserId}.goalMinus`)
            );

            _.set(leaderboardMixed, `${ageGroup}.${pool}.${winnerId}.goalRatio`,
                Math.round(_.get(leaderboardMixed, `${ageGroup}.${pool}.${winnerId}.goalPlus`) / _.get(leaderboardMixed, `${ageGroup}.${pool}.${winnerId}.goalMinus`) * 100) / 100
            );
            _.set(leaderboardMixed, `${ageGroup}.${pool}.${loserId}.goalRatio`,
                Math.round(_.get(leaderboardMixed, `${ageGroup}.${pool}.${loserId}.goalPlus`) / _.get(leaderboardMixed, `${ageGroup}.${pool}.${loserId}.goalMinus`) * 100) / 100
            );




            if (isMatchDraw) {
                // setting default values
                setDefaultDrawValues(leaderboardMixed, ageGroup, winnerId, loserId, winnerName, loserName, pool)
                _.set(leaderboardMixed, `${ageGroup}.${pool}.${winnerId}.drawCount`, _.get(leaderboardMixed, `${ageGroup}.${pool}.${winnerId}.drawCount`, 0) + 1);
                _.set(leaderboardMixed, `${ageGroup}.${pool}.${loserId}.drawCount`, _.get(leaderboardMixed, `${ageGroup}.${pool}.${loserId}.drawCount`, 0) + 1);

                return;
            }

            setDefaultValues(leaderboardMixed, ageGroup, winnerId, loserId, winnerName, loserName, pool);

            _.set(leaderboardMixed, `${ageGroup}.${pool}.${winnerId}.winCount`, _.get(leaderboardMixed, `${ageGroup}.${pool}.${winnerId}.winCount`, 0) + 1);
            _.set(leaderboardMixed, `${ageGroup}.${pool}.${loserId}.loseCount`, _.get(leaderboardMixed, `${ageGroup}.${pool}.${loserId}.loseCount`, 0) + 1);
        })
    }

    if (inline) {
        inlineLeaderBoard = inlineCalculation(inline);
    }



    console.log("LEADERBOARD", JSON.stringify(leaderboard));
    addPointsForQuad(leaderboard);
    addPointsForQuad(leaderboardMixed); // QUAD mixed
    addPointsForInline(inlineLeaderBoard);
    sortByPoints(leaderboard);
    sortByPoints(leaderboardMixed); //QUAD mixed
    sortByPointsInline(inlineLeaderBoard);
    
    const quadAgeGroups = _.keys(leaderboard)
    const quadMixedAgeGroups = _.keys(leaderboardMixed) //QUAD mixed
    const inlineAgeGroups = _.keys(inlineLeaderBoard);
    const quadLeaderBoard = {}
    const quadMixedLeaderBoard = {}
    const inlineFinalLeaderBoard = {}
    for (let qAgeGrp of quadAgeGroups) {
        quadLeaderBoard[`${qAgeGrp} - ROLLERHOCKEY`] = leaderboard[qAgeGrp]
    }

    for (let qMAgeGrp of quadMixedAgeGroups) {
        quadMixedLeaderBoard[`${qMAgeGrp} - RH-MIXED`] = leaderboardMixed[qMAgeGrp]
    }

    for (let IAgeGrp of inlineAgeGroups) {
        inlineFinalLeaderBoard[`${IAgeGrp} - INLINE`] = inlineLeaderBoard[IAgeGrp]
    }

    console.log("LEADERBOARD1", JSON.stringify(leaderboard));
    return { ...quadLeaderBoard, ...inlineFinalLeaderBoard, ...quadMixedLeaderBoard }
}

function addPointsForQuad(leaderboard) {
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

function addPointsForInline(leaderboard) {
    let ageGroups = _.keys(leaderboard)
    for (let ageGroup of ageGroups) {
        let pools = _.keys(leaderboard[ageGroup])
        for (let pool of pools) {
            const teams = _.keys(leaderboard[ageGroup][pool])
            for (let teamId of teams) {
                let winCount = _.get(leaderboard, `${ageGroup}.${pool}.${teamId}.winCount`) - _.get(leaderboard, `${ageGroup}.${pool}.${teamId}.shootOutWin`, 0)
                let shootOutWin = _.get(leaderboard, `${ageGroup}.${pool}.${teamId}.shootOutWin`, 0);
                let shootOutLoss = _.get(leaderboard, `${ageGroup}.${pool}.${teamId}.shootOutLoss`, 0);
                let forfiet = _.get(leaderboard, `${ageGroup}.${pool}.${teamId}.forfiet`, 0);
                let draw = _.get(leaderboard, `${ageGroup}.${pool}.${teamId}.drawCount`, 0)
                let forfietPointToMinus = forfiet * 3 
                leaderboard[ageGroup][pool][teamId]['points'] = ((winCount * 3) + (shootOutWin * 2) + (shootOutLoss * 1) + draw) - (forfietPointToMinus)
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
        
            ageVals.sort((x, y) => {
                const a = _.cloneDeep(x)
                const b = _.cloneDeep(y)
                if (b.points === a.points) {
                    if (b.winsByNoShow) {
                        const pointsToMinus = b.winsByNoShow * 3;
                        const goalsToMinus = b.winsByNoShow * 10
                        b.points -= pointsToMinus;
                        b.goalAverage -= goalsToMinus
                        b.winsByNoShow = 0;
                    }
                    if (a.winsByNoShow) {
                        const pointsToMinus = a.winsByNoShow * 3;
                        const goalsToMinus = a.winsByNoShow * 10;
                        a.points -= pointsToMinus
                        a.goalAverage -= goalsToMinus;
                        a.winsByNoShow = 0
                    }

                    if (b.points === a.points) {
                        if (b.goalAverage === a.goalAverage) {
                            return (b.goalPlus / b.goalMinus) - (a.goalPlus / a.goalMinus)
                        }
                        return b.goalAverage - a.goalAverage;
                    }
                    return b.points - a.points;
                }
                return b.points - a.points
            })

            leaderboard[ageGroup][pool] = ageVals;
        }
    }
}

function sortByPointsInline(leaderboard) {
    let ageGroups = _.keys(leaderboard)
    for (let ageGroup of ageGroups) {

        let pools = _.keys(leaderboard[ageGroup])

        for (const pool of pools) {
            const ageVals = []
            const teams = _.keys(leaderboard[ageGroup][pool])
            for (let teamId of teams) {
                ageVals.push({ ...leaderboard[ageGroup][pool][teamId], teamId, pool })
            }

            ageVals.sort((x, y) => {
                const a = _.cloneDeep(x)
                const b = _.cloneDeep(y)
                if (b.points === a.points) {
                    if (b.winsByNoShow) {
                        const pointsToMinus = b.winsByNoShow * 3;
                        const goalsToMinus = b.winsByNoShow * 10
                        b.points -= pointsToMinus;
                        b.goalAverage -= goalsToMinus
                        b.winsByNoShow = 0;
                    }
                    if (a.winsByNoShow) {
                        const pointsToMinus = a.winsByNoShow * 3;
                        const goalsToMinus = a.winsByNoShow * 10;
                        a.points -= pointsToMinus
                        a.goalAverage -= goalsToMinus;
                        a.winsByNoShow = 0
                    }

                    if (b.points === a.points) {
                        if (b.goalAverage === a.goalAverage) {
                            if (a.goalMinus === b.goalMinus) {
                                return b.goalPlus - a.goalPlus;
                            }
                            return a.goalMinus - b.goalMinus
                        }
                        return b.goalAverage - a.goalAverage;
                    }
                    return b.points - a.points;
                }
                return b.points - a.points
            })
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