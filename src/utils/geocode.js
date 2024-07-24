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
const getWeather = (req, callback) => {
    const q = req.query.q;
    const dt = req.query.dt;
    const isFuture = req.query.isFuture;
    const playHour = req.query.playHour;
    const days = req.query.days;
    // https://maps.googleapis.com/maps/api/place/details/json?placeid=++&language=he-IL&key=AIzaSyDIvZu54YTDopUSFw2fIp6XnMixHiIveCI
    let url = ''
    if (!isFuture) {
        url = 'http://api.weatherapi.com/v1/future.json?key=12b7a45856014d2889661515242407&q='+ q +'&dt=' + dt

    } else {
        url = 'http://api.weatherapi.com/v1/forecast.json?key=12b7a45856014d2889661515242407&q='+ q +'&days=' + days
    }
    console.log(url)

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

module.exports = {geocode, getPlace, getWeather}