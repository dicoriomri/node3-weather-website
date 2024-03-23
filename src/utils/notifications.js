const request = require('request')
const { initializeApp } = require('firebase-admin');
const {getMessaging} = require("firebase-admin/messaging");

let admin = require("firebase-admin");

let serviceAccount = require("../json/headz-app-firebase-adminsdk-ffml9-29700b66b3.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
});

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

const notificationsSend = (req, callback) => {
    const topic = req.query.topic;
    const fcm_server_key = 'AAAAJrVJhUU:APA91bH6INBHtOCS3YZ8_pqsgpsHauwGkboG3H74pxxlqPJ3LNOJrxyrc5M7y7GRi-RFWIo9NUfOX6Uu1fHLdAiZsF4BZNc4z0GYWEV78ZaS6Dl1tuxnbXNWe1SCvwdiZg0Ltv7GNDui';
    const deviceToken = req.query.deviceToken;
    console.log(topic, deviceToken)
    const message = {
        data: {
            title: req.query.title,
            body: req.query.body,
            gameID: req.query.gameID,
            // fcmOptions: {
            //     link: 'https://headz-app.web.app/game/' + req.query.gameID
            // }
        },
        to: 'https://headz-app.web.app/game/' + req.query.gameID,
        // fcmOptions: {
        //     link: 'https://headz-app.web.app/game/' + req.query.gameID
        // },
        topic: topic
    };

    // const url = 'https://iid.googleapis.com/iid/v1/'+ deviceToken +'/rel/topics/' + topic
    getMessaging().send(message).then(((response) => {
        console.log(response)
        callback(response);
    }));
}

module.exports = {notificationsRegister, notificationsSend}