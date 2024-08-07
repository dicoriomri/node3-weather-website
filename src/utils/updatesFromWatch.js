let request = require('request');
const {initializeApp} = require('firebase-admin');
const {getMessaging} = require("firebase-admin/messaging");
const {getFirestore, Timestamp, FieldValue, Filter} = require('firebase-admin/firestore');
const schedule = require('node-schedule');
const {google} = require('googleapis');
const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const SCOPES = [MESSAGING_SCOPE];


let admin = require("firebase-admin");

let serviceAccount = require("../json/headz-app-firebase-adminsdk-ffml9-29700b66b3.json");
if (!admin.apps.length) {
    const firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "dB_URL"
    });
}

const moment = require("moment");


const db = getFirestore();

function getAccessToken() {
    return new Promise(function (resolve, reject) {
        const key = require('../assets/headz-app-firebase-adminsdk-ffml9-8b0eb6d364.json');
        const jwtClient = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            SCOPES,
            null
        );
        jwtClient.authorize(function (err, tokens) {
            if (err) {
                reject(err);
                return;
            }
            resolve(tokens.access_token);
        });
    });
}

const saveDataToGame = (req, callback) => {
    const command = req.query.command;
    const commandsData = req.query.command.split('-');
    // alert(commandsData)
    const functionToUse = commandsData[0]
    const variable = commandsData[1]
    const gameID = commandsData[2]
    let scoreValue
    if (commandsData.length > 3) {
        scoreValue = parseInt(commandsData[3])
    }
    const docRef = db.collection('games').doc(gameID);
    docRef.get().then(async (response) => {
        let gameData = response.data()
        const field_name = gameData.field_name;
        const teams = gameData.teams;

        if (!gameData.homeTeam) {
            callback(false, {
                    "field_name": null,
                    "homeTeam": null,
                    "awayTeam": null,
                    "awayScore": null,
                    // "gameFlow": null,
                    "homeScore": null,
                    "showTieBreaker": null
                }
            )
        }

        let resultData = {
            allResults: gameData.allResults,
            table: gameData.table,
            pending: gameData.pending,
            homeTeam: gameData.homeTeam,
            awayTeam: gameData.awayTeam,
            gameFlow: gameData.gameFlow,
            homeScore: gameData.homeScore || 0,
            awayScore: gameData.awayScore || 0,
            showTieBreaker: gameData.showTieBreaker || false,
        }
        if (functionToUse === 'setTeamScore') {
            resultData[variable] = scoreValue
        }
        if (functionToUse === 'addGoalToTeam') {
            resultData[variable]++
        }
        if (functionToUse === 'subGoalToTeam') {
            if (resultData[variable] && resultData[variable] > 0) {
                resultData[variable]--
            }
        }
        if (functionToUse === 'advances') {
            resultData.showTieBreaker = false;
            const homeIndex = resultData.table.findIndex(team => team.teamName === resultData.homeTeam)
            const awayIndex = resultData.table.findIndex(team => team.teamName === resultData.awayTeam)
            if (resultData.awayScore === resultData.homeScore) {
                resultData.table[homeIndex].teamPoints += 1
                resultData.table[awayIndex].teamPoints += 1
                resultData.table[awayIndex].teamDraw += 1
                resultData.table[homeIndex].teamDraw += 1
                resultData.table[homeIndex].teamGames++
                resultData.table[homeIndex].teamFor += resultData.homeScore
                resultData.table[homeIndex].teamAgainst += resultData.awayScore
                resultData.table[awayIndex].teamGames++
                resultData.table[awayIndex].teamFor += resultData.awayScore
                resultData.table[awayIndex].teamAgainst += resultData.homeScore
            }
            resultData.allResults.push(
                {
                    homeTeam: {
                        name: resultData.homeTeam,
                        score: resultData.homeScore,
                        advances: variable !== 'homeTeam'
                    },
                    awayTeam: {
                        name: resultData.awayTeam,
                        score: resultData.awayScore,
                        advances: variable !== 'awayTeam'
                    },
                    gameFlow: resultData.gameFlow
                }
            );
            resultData.pending.push(resultData[variable])
            resultData[variable] = resultData.pending.shift();
            resultData.homeScore = 0;
            resultData.awayScore = 0;
            resultData.gameFlow = []
        }
        if (functionToUse === 'cancelResult') {
            resultData.showTieBreaker = false;
            resultData.homeScore = 0;
            resultData.awayScore = 0;
        }
        if (functionToUse === 'cancelResultAndDelete') {
            const homeTeamToRestore = resultData.allResults[resultData.allResults.length - 1].homeTeam
            const awayTeamToRestore = resultData.allResults[resultData.allResults.length - 1].awayTeam
            const homeIndex = resultData.table.findIndex(team => team.teamName === homeTeamToRestore.name)
            const awayIndex = resultData.table.findIndex(team => team.teamName === awayTeamToRestore.name)
            if (homeTeamToRestore.score > awayTeamToRestore.score) {
                resultData.table[homeIndex].teamPoints -= 3
                resultData.table[homeIndex].teamGames--
                resultData.table[homeIndex].teamFor -= homeTeamToRestore.score
                resultData.table[homeIndex].teamAgainst -= awayTeamToRestore.score
                resultData.table[awayIndex].teamGames--
                resultData.table[awayIndex].teamFor -= awayTeamToRestore.score
                resultData.table[awayIndex].teamAgainst -= homeTeamToRestore.score
                resultData.pending.unshift(resultData.awayTeam)
                resultData.awayTeam = resultData.pending.pop()
            } else if (homeTeamToRestore.score < awayTeamToRestore.score) {
                resultData.table[awayIndex].teamPoints -= 3
                resultData.table[homeIndex].teamGames--
                resultData.table[homeIndex].teamFor -= homeTeamToRestore.score
                resultData.table[homeIndex].teamAgainst -= awayTeamToRestore.score
                resultData.table[awayIndex].teamGames--
                resultData.table[awayIndex].teamFor -= awayTeamToRestore.score
                resultData.table[awayIndex].teamAgainst -= homeTeamToRestore.score
                resultData.pending.unshift(resultData.homeTeam)
                resultData.homeTeam = resultData.pending.pop()
            } else if (homeTeamToRestore.score === awayTeamToRestore.score) {
                resultData.table[homeIndex].teamPoints -= 1
                resultData.table[awayIndex].teamPoints -= 1
                resultData.table[awayIndex].teamDraw -= 1
                resultData.table[homeIndex].teamDraw -= 1
                resultData.table[homeIndex].teamGames--
                resultData.table[homeIndex].teamFor -= homeTeamToRestore.score
                resultData.table[homeIndex].teamAgainst -= awayTeamToRestore.score
                resultData.table[awayIndex].teamGames--
                resultData.table[awayIndex].teamFor -= awayTeamToRestore.score
                resultData.table[awayIndex].teamAgainst -= homeTeamToRestore.score
                if (homeTeamToRestore.advances) {
                    resultData.pending.unshift(resultData.awayTeam)
                    resultData.awayTeam = resultData.pending.pop()
                }
                if (awayTeamToRestore.advances) {
                    resultData.pending.unshift(resultData.homeTeam)
                    resultData.homeTeam = resultData.pending.pop()
                }
            }
            const lastGame = resultData.allResults[resultData.allResults.length - 1]
            if (lastGame && lastGame.gameFlow && lastGame.gameFlow.length > 0) {
                lastGame.gameFlow.forEach((flow) => {
                    if (flow.scorer) {
                        const playerIndex = teams[flow.scorer.teamNumber].teamPlayers.findIndex(player => player.userID == flow.scorer.playerID)
                        if (playerIndex > -1) {
                            if (teams[flow.scorer.teamNumber].teamPlayers[playerIndex].goals && teams[flow.scorer.teamNumber].teamPlayers[playerIndex].goals > 0) {
                                teams[flow.scorer.teamNumber].teamPlayers[playerIndex].goals--
                            }
                        }
                        if (flow.scorer.playerID.length > 5) {
                            updatePlayerGoals({userID: flow.scorer.playerID, action: '-'})
                        }
                    }

                    if (flow.assist) {
                        const playerIndexAssist = teams[flow.assist.teamNumber].teamPlayers.findIndex(player => player.userID == flow.assist.playerID)
                        if (playerIndexAssist > -1) {
                            if (teams[flow.assist.teamNumber].teamPlayers[playerIndexAssist].assists && teams[flow.assist.teamNumber].teamPlayers[playerIndexAssist].assists > 0) {
                                teams[flow.assist.teamNumber].teamPlayers[playerIndexAssist].assists--
                            }
                        }
                        if (flow.assist.playerID.length > 5) {
                            updatePlayerAssists({userID: flow.assist.playerID , action: '-'})
                        }
                    }
                })
            }
            resultData.allResults.pop()
        }
        if (functionToUse === 'saveResult') {
            const homeIndex = resultData.table.findIndex(team => team.teamName === resultData.homeTeam)
            const awayIndex = resultData.table.findIndex(team => team.teamName === resultData.awayTeam)
            if (resultData.homeScore !== resultData.awayScore) {
                resultData.allResults.push(
                    {
                        homeTeam: {
                            name: resultData.homeTeam,
                            score: resultData.homeScore
                        },
                        awayTeam: {
                            name: resultData.awayTeam,
                            score: resultData.awayScore
                        },
                        gameFlow: resultData.gameFlow
                    }
                );
            }
            if (resultData.homeScore > resultData.awayScore) {
                resultData.table[homeIndex].teamPoints += 3
                resultData.table[homeIndex].teamWon += 1
                resultData.table[awayIndex].teamLost += 1
                resultData.table[homeIndex].teamGames++
                resultData.table[homeIndex].teamFor += resultData.homeScore
                resultData.table[homeIndex].teamAgainst += resultData.awayScore
                resultData.table[awayIndex].teamGames++
                resultData.table[awayIndex].teamFor += resultData.awayScore
                resultData.table[awayIndex].teamAgainst += resultData.homeScore
                resultData.pending.push(resultData.awayTeam)
                resultData.awayTeam = resultData.pending.shift()
            }
            if (resultData.awayScore > resultData.homeScore) {
                resultData.table[awayIndex].teamPoints += 3
                resultData.table[awayIndex].teamWon += 1
                resultData.table[homeIndex].teamLost += 1
                resultData.table[homeIndex].teamGames++
                resultData.table[homeIndex].teamFor += resultData.homeScore
                resultData.table[homeIndex].teamAgainst += resultData.awayScore
                resultData.table[awayIndex].teamGames++
                resultData.table[awayIndex].teamFor += resultData.awayScore
                resultData.table[awayIndex].teamAgainst += resultData.homeScore
                resultData.pending.push(resultData.homeTeam)
                resultData.homeTeam = resultData.pending.shift()
            }

            if (resultData.awayScore === resultData.homeScore) {
                resultData.showTieBreaker = true
            } else {
                resultData.awayScore = 0
                resultData.homeScore = 0
                resultData.gameFlow = []
            }
        }

        if (functionToUse === "addGoalToPlayer") {
            if (variable && scoreValue) {
                const playerIndex = gameData.teams[scoreValue - 1].teamPlayers.findIndex(player => player.userID == variable)
                if (playerIndex > -1) {
                    if (gameData.teams[scoreValue - 1].teamPlayers[playerIndex].goals) {
                        gameData.teams[scoreValue - 1].teamPlayers[playerIndex].goals += 1
                    } else {
                        gameData.teams[scoreValue - 1].teamPlayers[playerIndex].goals = 1
                    }
                }
                if (variable.length > 5) {
                    updatePlayerGoals({userID: variable, action: '+'})
                }
            }
        }

        if (functionToUse === "subGoalToPlayer") {
            if (variable && scoreValue > -1) {
                const playerIndex = gameData.teams[scoreValue - 1].teamPlayers.findIndex(player => player.userID == variable)
                if (playerIndex > -1) {
                    if (gameData.teams[scoreValue - 1].teamPlayers[playerIndex].goals && gameData.teams[scoreValue - 1].teamPlayers[playerIndex].goals > 0) {
                        gameData.teams[scoreValue - 1].teamPlayers[playerIndex].goals--
                    }
                }
                if (variable.length > 5) {
                    updatePlayerGoals({userID: variable, action: '-'})
                }
            }
        }


        if (functionToUse === "addAssistToPlayer") {
            if (variable && scoreValue) {
                const playerIndex = gameData.teams[scoreValue - 1].teamPlayers.findIndex(player => player.userID == variable)
                if (playerIndex > -1) {
                    if (gameData.teams[scoreValue - 1].teamPlayers[playerIndex].assists) {
                        gameData.teams[scoreValue - 1].teamPlayers[playerIndex].assists += 1
                    } else {
                        gameData.teams[scoreValue - 1].teamPlayers[playerIndex].assists = 1
                    }
                }
                if (variable.length > 5) {
                    updatePlayerAssists({userID: variable, action: '+'})
                }
            }
        }

        if (functionToUse === "subAssistToPlayer") {
            if (variable && scoreValue > -1) {
                const playerIndex = gameData.teams[scoreValue - 1].teamPlayers.findIndex(player => player.userID == variable)
                if (playerIndex > -1) {
                    if (gameData.teams[scoreValue - 1].teamPlayers[playerIndex].assists && gameData.teams[scoreValue - 1].teamPlayers[playerIndex].assists > 0) {
                        gameData.teams[scoreValue - 1].teamPlayers[playerIndex].assists--
                    }
                }
                if (variable.length > 5) {
                    updatePlayerAssists({userID: variable, action: '-'})
                }
            }
        }

        const saveRef = db.collection('games').doc(gameID);
        const result = await saveRef.update({
            allResults: resultData.allResults,
            table: resultData.table,
            pending: resultData.pending,
            homeTeam: resultData.homeTeam,
            awayTeam: resultData.awayTeam,
            gameFlow: resultData.gameFlow,
            homeScore: resultData.homeScore,
            awayScore: resultData.awayScore,
            showTieBreaker: resultData.showTieBreaker,
            teams: gameData.teams,
        })
        const gameTeams = []
        if (gameData.teams && gameData.teams.length) {
            gameData.teams.forEach((team, teamIndex) => {
                const teamPlayers = [];
                team.teamPlayers.forEach((player, idx) => {
                    teamPlayers.push({
                        fullName: player.first_name + " " + player.last_name,
                        userID: (player.userID).toString(),
                        goals: (player.goals || 0).toString(),
                        assists: (player.assists || 0).toString(),
                        playerIndex: (idx + 1).toString()
                    })
                })
                gameTeams.push({
                    teamPlayers: teamPlayers,
                    teamIndex: (teamIndex + 1).toString(),
                    teamColor: team.teamColor
                })
            })
        }
        callback(false, {
            "gameTeams": gameTeams,
            "field_name": field_name,
            "homeTeam": resultData.homeTeam,
            "awayTeam": resultData.awayTeam,
            // "gameFlow": resultData.gameFlow,
            "awayScore": resultData.awayScore,
            "homeScore": resultData.homeScore,
            "showTieBreaker": resultData.showTieBreaker,
        })
    })
}

const getDataFromGame = async (req, callback) => {
    const gameID = req.query.gameID;
    let result
    const docRef = db.collection('games').doc(gameID);
    result = (await docRef.get()).data()
    const gameTeams = []
    if (result.teams && result.teams.length) {
        result.teams.forEach((team, teamIndex) => {
            const teamPlayers = [];
            team.teamPlayers.forEach((player, idx) => {
                teamPlayers.push({
                    fullName: player.first_name + " " + player.last_name,
                    userID: (player.userID).toString(),
                    goals: (player.goals || 0).toString(),
                    assists: (player.assists || 0).toString(),
                    playerIndex: (idx + 1).toString()
                })
            })
            gameTeams.push({
                teamPlayers: teamPlayers,
                teamIndex: (teamIndex + 1).toString(),
                teamColor: team.teamColor
            })
        })
    }
    callback(false, {
        "gameTeams": gameTeams || [],
        "field_name": result.field_name,
        "homeTeam": result.homeTeam || 0,
        "awayTeam": result.awayTeam || 0,
        // "gameFlow": result.gameFlow || [],
        "awayScore": result.awayScore || 0,
        "homeScore": result.homeScore || 0,
        "showTieBreaker": result.showTieBreaker || false,
    })
}


const saveResultFlow = async (req, callback) => {
    const gameID = req.query.gameID;
    const scorerPlayerName = req.query.scorerPlayerName;
    const scorerValue = req.query.scorerValue;
    const scorerPlayerID = req.query.scorerPlayerID;
    const scorerTeamNumber = req.query.scorerTeamNumber;
    const assistPlayerName = req.query.assistPlayerName;
    const assistValue = req.query.assistValue;
    const assistPlayerID = req.query.assistPlayerID;
    const assistTeamNumber = req.query.assistTeamNumber;
    const homeTeamScore = req.query.homeTeamScore;
    const awayTeamScore = req.query.awayTeamScore;
    const teamScoredFor = req.query.teamScoredFor;

    const data = {
        scorer: {
            playerName: scorerPlayerName,
            value: scorerValue,
            playerID: scorerPlayerID,
            teamNumber: parseInt(scorerTeamNumber)
        },
        assist: {
            playerName: assistPlayerName,
            value: assistValue,
            playerID: assistPlayerID,
            teamNumber: parseInt(assistTeamNumber)
        },
        homeTeamScore: parseInt(homeTeamScore),
        awayTeamScore: parseInt(awayTeamScore),
        teamScoredFor: parseInt(teamScoredFor)
    }
    return new Promise(async (resolve, reject) => {
        const game = db.collection('games').doc(gameID);
        const gameData = (await game.get()).data()
        const field_name = gameData.field_name;
        const teams = gameData.teams;
        let resultData = {
            allResults: gameData.allResults,
            table: gameData.table,
            pending: gameData.pending,
            homeTeam: gameData.homeTeam,
            awayTeam: gameData.awayTeam,
            homeScore: gameData.homeScore || 0,
            awayScore: gameData.awayScore || 0,
            gameFlow: gameData.gameFlow || [],
            showTieBreaker: gameData.showTieBreaker || false,
        }
        resultData.gameFlow.push(
            {
                scorer: data.scorer,
                assist: data.assist,
                homeTeamScore: data.homeTeamScore,
                awayTeamScore: data.awayTeamScore,
                teamScoredFor: data.teamScoredFor,
            }
        )
        resultData.homeScore = data.homeTeamScore
        resultData.awayScore = data.awayTeamScore
        if (data.scorer && data.scorer.playerID !== 0 && data.scorer.playerID !== "0") {
            const playerIndex = teams[data.scorer.teamNumber - 1].teamPlayers.findIndex(player => player.userID == data.scorer.playerID)
            if (playerIndex > -1) {
                if (teams[data.scorer.teamNumber - 1].teamPlayers[playerIndex].goals) {
                    teams[data.scorer.teamNumber - 1].teamPlayers[playerIndex].goals += 1
                } else {
                    teams[data.scorer.teamNumber - 1].teamPlayers[playerIndex].goals = 1
                }
            }
            if (data.scorer.playerID.length > 5) {
                updatePlayerGoals({userID: data.scorer.playerID, action: '+'})
            }
        }
        if (data.assist && data.assist.playerID !== 0 && data.assist.playerID !== "0") {
            const playerIndex = teams[data.assist.teamNumber - 1].teamPlayers.findIndex(player => player.userID == data.assist.playerID)
            if (playerIndex > -1) {
                if (teams[data.assist.teamNumber - 1].teamPlayers[playerIndex].assists) {
                    teams[data.assist.teamNumber - 1].teamPlayers[playerIndex].assists += 1
                } else {
                    teams[data.assist.teamNumber - 1].teamPlayers[playerIndex].assists = 1
                }
            }
            if (data.assist.playerID.length > 5) {
                updatePlayerAssists({userID: data.assist.playerID, action: '+'})
            }
        }
        resultData.teams = teams;

        const result = await game.update({
            allResults: resultData.allResults,
            table: resultData.table,
            pending: resultData.pending,
            homeTeam: resultData.homeTeam,
            awayTeam: resultData.awayTeam,
            homeScore: resultData.homeScore,
            awayScore: resultData.awayScore,
            gameFlow: resultData.gameFlow,
            showTieBreaker: resultData.showTieBreaker,
            teams: teams,
        })
        callback(false, {
            "gameTeams": resultData.teams || [],
            "field_name": field_name,
            "homeTeam": resultData.homeTeam || 0,
            "awayTeam": resultData.awayTeam || 0,
            // "gameFlow": result.gameFlow || [],
            "awayScore": resultData.awayScore || 0,
            "homeScore": resultData.homeScore || 0,
            "showTieBreaker": resultData.showTieBreaker || false,
        })
    })


}

const getUserGames = async (req, callback) => {
    const userID = req.query.userID;
    let result
    const docRef = db.collection('users').doc(userID);
    result = (await docRef.get()).data()
    const gamesToReturn = []
    const promises = []
    result.gamesAdmin.forEach((game) => {
        const gameRef = db.collection('games').doc(game);
        promises.push(
            new Promise(async (resolve) => {
                let gameData = (await gameRef.get()).data()
                gamesToReturn.push({
                    gameID: gameData.gameID,
                    field_name: gameData.field_name,
                    playDate: gameData.playDate
                })
                gamesToReturn.sort((a, b) => {
                    if (moment(a.playDate + '' + a.starttime, 'DD/MM/YYYY HH:mm').isBefore(moment(b.playDate + '' + b.starttime, 'DD/MM/YYYY HH:mm'))) {
                        return -1
                    } else if (moment(b.playDate + '' + b.starttime, 'DD/MM/YYYY HH:mm').isBefore(moment(a.playDate + '' + a.starttime, 'DD/MM/YYYY HH:mm'))) {
                        return 1
                    } else {
                        return 0;
                    }
                })
                resolve()
            })
        )
    })

    Promise.all(promises).then(() => {
        callback(false, {
            "games": gamesToReturn
        })
    })

}


const updatePlayerGoals = async (data) => {
    const playerRef = db.collection('users').doc(data.userID);
    playerRef.get().then(async (response) => {
        let playerData = response.data()
        let goals = playerData && playerData.goals
        if (goals) {
            switch (data.action) {
                case '+':
                    goals++
                    break;
                case '-':
                    if (goals > 0) {
                        goals--
                    }
                    break;
            }
        } else if (data.action === '+') {
            goals = 1
        }
        const result = await playerRef.update({goals})
    })
}

const updatePlayerAssists = async (data) => {
    const playerRef = db.collection('users').doc(data.userID);
    playerRef.get().then(async (response) => {
        let playerData = response.data()
        let assists = playerData && playerData.assists
        if (assists) {
            switch (data.action) {
                case '+':
                    assists++
                    break;
                case '-':
                    if (assists > 0) {
                        assists--
                    }
                    break;
            }
        } else if (data.action === '+') {
            assists = 1
        }
        const result = await playerRef.update({assists})
    })
}


module.exports = {saveDataToGame, getDataFromGame, getUserGames, saveResultFlow}