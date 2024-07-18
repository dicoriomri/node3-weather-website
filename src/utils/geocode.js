const request = require('request')
const moment = require("moment");

const geocode = (callback) => {
    callback(undefined, {
        dateTime: moment().toISOString(true),
        date: moment().format('MM/DD/YYYY'),
        time: moment().format('HH:mm'),
    })
}

const getPlace = (req, callback) => {
    const placeID = req.query.placeID;
    const lang = req.query.lang;
    // https://maps.googleapis.com/maps/api/place/details/json?placeid=++&language=he-IL&key=AIzaSyDIvZu54YTDopUSFw2fIp6XnMixHiIveCI
    const url = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=' + placeID + '&language=' + lang + '&key=AIzaSyDIvZu54YTDopUSFw2fIp6XnMixHiIveCI'

    let options = {
        'method': 'GET',
        'url': url,
        json: true

    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        callback(null, response);
    });

}

module.exports = {geocode, getPlace}