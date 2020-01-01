const request = require('request')

const forecast = (data, callback) => {
    const url = 'https://api.darksky.net/forecast/2575c8d84a8229517088f73ec1b4041f/'+data.lat+','+data.lng+'?units=si'

    request({url: url, json: true}, (error, response) => {
        if(error) {
            callback('unable to connect to weather', undefined)
        } else if (response.body.error) {
            callback('unable to find location', undefined)
        } else {
            const currently = response.body.currently.temperature
            const daily = response.body.daily.data[0].summary;
            const weather = 'the temperature in ' + data.name + ' is ' + currently + ' celcius, ' + daily
            callback(undefined , weather)
        }
    })
}

module.exports = forecast