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
        let resultData = {
            allResults: gameData.allResults,
            table: gameData.table,
            pending: gameData.pending,
            homeTeam: gameData.homeTeam,
            awayTeam: gameData.awayTeam,
            homeScore: gameData.homeScore || 0,
            awayScore: gameData.awayScore || 0,
            showTieBreaker: gameData.showTieBreaker || false,
        }
        if (functionToUse === 'setTeamScore') {
            resultData[variable] = scoreValue
        }
        if (functionToUse === 'addGoalToTeam') {
            console.log(resultData[variable])
            resultData[variable]++
            console.log(resultData[variable])
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
                }
            );
            resultData.pending.push(resultData[variable])
            resultData[variable] = resultData.pending.shift();
            resultData.homeScore = 0;
            resultData.awayScore = 0;
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
                resultData.allResults.pop()
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
                resultData.allResults.pop()
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
                resultData.allResults.pop()
            }
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
            }
        }
        const saveRef = db.collection('games').doc(gameID);
        const result = await saveRef.update({
            allResults: resultData.allResults,
            table: resultData.table,
            pending: resultData.pending,
            homeTeam: resultData.homeTeam,
            awayTeam: resultData.awayTeam,
            homeScore: resultData.homeScore,
            awayScore: resultData.awayScore,
            showTieBreaker: resultData.showTieBreaker,
        })
        callback(false, {
            "field_name": field_name,
            "homeTeam": resultData.homeTeam,
            "awayTeam": resultData.awayTeam,
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
    callback(false, {
        "gameData": {
            "field_name": result.field_name,
            "homeTeam": result.homeTeam,
            "awayTeam": result.awayTeam,
            "awayScore": result.awayScore,
            "homeScore": result.homeScore,
            "showTieBreaker": result.showTieBreaker,
        }
    })
}


module.exports = {saveDataToGame, getDataFromGame}