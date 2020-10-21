const request = require('request')
const admin = require("firebase-admin");

const serviceAccount = require("../assets/headz-app-firebase-adminsdk-ffml9-1ec8eb087b.json");
let users = []
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://headz-app.firebaseio.com"
});

const getUsers = (data, callback) => {
    admin.auth().listUsers(1000)
        .then(function(listUsersResult) {

            listUsersResult.users.forEach(function(userRecord) {
                users.push(userRecord.toJSON());
            });
            callback(undefined, users);
        })
        .catch(function(error) {
            console.log('Error listing users:', error);
        });
}

module.exports = getUsers
