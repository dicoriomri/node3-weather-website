const request = require('request')
const moment = require("moment");

const geocode = (callback) => {
    callback(undefined, {
        dateTime: moment().toISOString(true),
        date: moment().format('MM/DD/YYYY'),
        time: moment().format('HH:mm'),
    })
}

module.exports = geocode