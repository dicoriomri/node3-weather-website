let request = require('request');const { initializeApp } = require('firebase-admin');
const {getMessaging} = require("firebase-admin/messaging");
const schedule = require('node-schedule');
const {google} = require('googleapis');
const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const SCOPES = [MESSAGING_SCOPE];


let admin = require("firebase-admin");

let serviceAccount = require("../json/headz-app-firebase-adminsdk-ffml9-29700b66b3.json");
const moment = require("moment");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
});
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

const notificationsRegister = (req, callback) => {
    const topic = req.query.topic;
    const fcm_server_key = 'AAAAJrVJhUU:APA91bH6INBHtOCS3YZ8_pqsgpsHauwGkboG3H74pxxlqPJ3LNOJrxyrc5M7y7GRi-RFWIo9NUfOX6Uu1fHLdAiZsF4BZNc4z0GYWEV78ZaS6Dl1tuxnbXNWe1SCvwdiZg0Ltv7GNDui';
    const deviceToken = req.query.deviceToken;
    console.log(topic, deviceToken)

    // const url = 'https://iid.googleapis.com/iid/v1/'+ deviceToken +'/rel/topics/' + topic
    getMessaging().subscribeToTopic(deviceToken, topic).then(((response) => {
        console.log(response)
        callback(response);
    }));
}

const notificationsUnRegister = (req, callback) => {
    const topic = req.query.topic;
    const fcm_server_key = 'AAAAJrVJhUU:APA91bH6INBHtOCS3YZ8_pqsgpsHauwGkboG3H74pxxlqPJ3LNOJrxyrc5M7y7GRi-RFWIo9NUfOX6Uu1fHLdAiZsF4BZNc4z0GYWEV78ZaS6Dl1tuxnbXNWe1SCvwdiZg0Ltv7GNDui';
    const deviceToken = req.query.deviceToken;
    console.log(topic, deviceToken)

    // const url = 'https://iid.googleapis.com/iid/v1/'+ deviceToken +'/rel/topics/' + topic
    getMessaging().unsubscribeFromTopic(deviceToken, topic).then(((response) => {
        console.log(response)
        callback(response);
    }));
}

const notificationsSend = (req, callback) => {
    const topic = req.query.topic;
    const authToken = getAccessToken().then((response) => {
        const message = { message: {
                data: {
                    title: req.query.title,
                    body: req.query.body,
                    gameID: req.query.gameID,
                    // fcmOptions: {
                    //     link: 'https://headz-app.web.app/game/' + req.query.gameID
                    // }
                },
                notification : {
                    body : req.query.body,
                    title: req.query.title,
                },
                topic: topic
            }
        };

        // const url = 'https://iid.googleapis.com/iid/v1/'+ deviceToken +'/rel/topics/' + topic
        let options = {
            'method': 'POST',
            'url': 'https://fcm.googleapis.com/v1/projects/headz-app/messages:send',
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + response
            },
            body: message,
            json: true

        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            callback(true);
        });
    })

}

const notificationsScheduled = (req, callback) => {
    const topic = req.query.topic;
    const reqDate = req.query.date;
    const authToken = getAccessToken().then((response) => {
        const message = { message: {
                data: {
                    title: req.query.title,
                    body: req.query.body,
                    gameID: req.query.gameID,
                    // fcmOptions: {
                    //     link: 'https://headz-app.web.app/game/' + req.query.gameID
                    // }
                },
                notification : {
                    body : req.query.body,
                    title: req.query.title,
                },
                topic: topic
            }
        };

        // const url = 'https://iid.googleapis.com/iid/v1/'+ deviceToken +'/rel/topics/' + topic
        let options = {
            'method': 'POST',
            'url': 'https://fcm.googleapis.com/v1/projects/headz-app/messages:send',
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + response
            },
            body: message,
            json: true

        };
        // const url = 'https://iid.googleapis.com/iid/v1/'+ deviceToken +'/rel/topics/' + topic
        const date = moment(reqDate, 'DD-MM-YYYY-HH-mm-ss').toISOString();
        const job = schedule.scheduleJob(date, () => {
            console.log('printed')
            request(options, function (error, response) {
                if (error) throw new Error(error);
            });
        });
        callback(true);
    })
}


module.exports = {notificationsRegister, notificationsUnRegister, notificationsSend, notificationsScheduled}