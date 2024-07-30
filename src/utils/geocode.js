const request = require('request')
const moment = require("moment");


const jwt = require("jsonwebtoken"); // For generating the JWT and signing it


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

const getMapsToken = (req, callback) => {

    const privateKey = `
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgTdzR+ipWuA367OkG
afT4PPHQ6fcdGdPkAnP6wXBLpiKgCgYIKoZIzj0DAQehRANCAARnRsvl85pOAlrr
ZnKMln0sRPHL8fEPeuhrDbavoXR2DV4WYT44r9Pe7QV3J3yGW3uIOhxNmGty4/aS
5KxGek7s
-----END PRIVATE KEY-----
`;
    const teamId = 'SR63PDZABU';
    const keyId = 'ZM8NYCT782';

    const payload = {
        iss: teamId /* Issuer: Your Apple Developer Team ID */,
        iat: Date.now() / 1000 /* Issued at: Current time in seconds */,
        exp: Date.now() / 1000 + 315360000 /* Expiration: Time to expire in seconds. This one is set to expire in 10 years. */
    };

    const header = {
        kid: keyId /* Key Id: Your MapKit JS Key ID */,
        typ: "JWT",
        alg: "ES256"
    };

    let token = jwt.sign(payload, privateKey, { header });
    callback(null, token);

    // const placeID = req.query.placeID;
    // const lang = req.query.lang;
    // // https://maps.googleapis.com/maps/api/place/details/json?placeid=++&language=he-IL&key=AIzaSyDIvZu54YTDopUSFw2fIp6XnMixHiIveCI
    // const url = 'https://maps-api.apple.com/v1/token'
    //
    // let options = {
    //     'method': 'GET',
    //     'url': url,
    //     'headers': {
    //         'Authorization': 'Bearer eyJraWQiOiI5R0M2TVIzRkFSIiwidHlwIjoiSldUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJTUjYzUERaQUJVIiwiaWF0IjoxNzIyMzE3NjgwLCJleHAiOjE3MjI5Mjc1OTl9.rx3zejvBjC1vBVwoih1pmDgdHMQXYfdmg50OLkCZudI-9FvqJuolg3td-GW0RJ24ojc0BUaIHEsRLPXLwbF84g'
    //     },
    //     json: true
    //
    // };
    // request(options, function (error, response) {
    //     if (error) throw new Error(error);
    //     callback(null, response);
    // });

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

module.exports = {geocode, getPlace, getWeather, getMapsToken}