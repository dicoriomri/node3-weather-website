let request = require('request');const { initializeApp } = require('firebase-admin');
const {getMessaging} = require("firebase-admin/messaging");
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
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
    return new Promise(function(resolve, reject) {
        const key = require('../assets/headz-app-firebase-adminsdk-ffml9-8b0eb6d364.json');
        const jwtClient = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            SCOPES,
            null
        );
        jwtClient.authorize(function(err, tokens) {
            if (err) {
                reject(err);
                return;
            }
            resolve(tokens.access_token);
        });
    });
}

const saveDataToGame = async (req, callback) => {
    const command = req.query.command;
    const commandSplit = req.query.command.split('-');
    console.log(command)
    const docRef = db.collection('games').doc(commandSplit[2]);
    await docRef.update({
        lastWatchCommand: command,
    });
    callback(true)

}


module.exports = {saveDataToGame}