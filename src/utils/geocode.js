const request = require('request')

const geocode = (callback) => {
    const url = 'https://timeapi.io/api/Time/current/zone?timeZone=Asia/Jerusalem'

    request({ url, json: true }, (error, { body }) => {
        if (error) {
            callback('Unable to connect to location services!', undefined)
        } else {
            callback(undefined, {
                dateTime: body.dateTime,
                date: body.date,
                time: body.time,
            })
        }
    })
}

module.exports = geocode