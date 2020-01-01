const request = require('request')

const getGeoCode = (location, callback) => {
    const geocodeUrl = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + location + ".json?access_token=pk.eyJ1Ijoib21yaWRpY29yaSIsImEiOiJjazR0dHJ5bzQwYXRyM2pwanh2OW5ycmUzIn0.EHh0IEeupnEzJmUmAzG0Zg"

    request({url: geocodeUrl, json: true}, (error, response) => {
        if(error) {
            callback('unable to connect to mapbox', undefined)
        } else if (response.body.features.length === 0) {
            callback('unable to find location', undefined)
        } else {
            const features = response.body.features[0]
            const lat = features.center[1]
            const lng = features.center[0]
            const name = features.place_name
            const data = {
                lat: lat,
                lng: lng,
                name: name
            }
            callback(undefined, data)
        }
    })
}

module.exports = getGeoCode