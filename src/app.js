const path = require('path')
const express = require('express')
const hbs = require('hbs')
const {geocode, getPlace, getWeather, getMapsToken} = require('./utils/geocode')
const {saveDataToGame, getDataFromGame, getUserGames, saveResultFlow} = require('./utils/updatesFromWatch')
const {notificationsRegister, notificationsSend, notificationsScheduled, notificationsUnRegister} = require('./utils/notifications')

const forecast = require('./utils/forecast')

const app = express()
const port = process.env.PORT || 3000

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

// Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))


app.get('/weather', (req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Origin', '*');

    geocode((error, { dateTime, date, time } = {}) => {
        if (error) {
            return res.send({ error })
        }
        return res.send({dateTime, date, time});
    })
})

app.get('/getPlaces', (req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Origin', '*');

    getPlace(req, (error, response = {}) => {
        if (error) {
            return res.send({ error })
        }
        return res.send(response.body);
    })
})
app.get('/getWeather', (req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Origin', '*');

    getWeather(req, (error, response = {}) => {
        if (error) {
            return res.send({ error })
        }
        return res.send(response.body);
    })
})
app.get('/getToken', (req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Origin', '*');

    getMapsToken(req, (error, response = {}) => {
        console.log(response)
        if (error) {
            return res.send({ error })
        }
        return res.send(response);
    })
})


app.get('/version', (req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.send({androidVersion: "4.13", iosVersion: "4.15", version: "4.13"});

})

app.get('/notification/register', (req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Origin', '*');

    notificationsRegister(req, (error, { dateTime, date, time } = {}) => {
        if (error) {
            return res.send({ error })
        }
        return res.send({dateTime, date, time});
    })
})

app.get('/notification/unregister', (req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Origin', '*');

    notificationsUnRegister(req, (error, { dateTime, date, time } = {}) => {
        if (error) {
            return res.send({ error })
        }
        return res.send({dateTime, date, time});
    })
})

app.get('/notification/send', (req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Origin', '*');

    notificationsSend(req, (error, { dateTime, date, time } = {}) => {
        if (error) {
            return res.send({ error })
        }
        return res.send({dateTime, date, time});
    })
})

app.get('/notification/schedule', (req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Origin', '*');

    notificationsScheduled(req, (error, { dateTime, date, time } = {}) => {
        if (error) {
            return res.send({ error })
        }
        return res.send({dateTime, date, time});
    })
})

app.get('/watchResults/set', (req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Origin', '*');

    saveDataToGame(req, (error,  gameData  = {}) => {
        if (error) {
            return res.send(error)
        }
        return res.send(gameData);
    })
})

app.get('/watchResults/get', (req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Origin', '*');

    getDataFromGame(req, (error,  gameData  = {}) => {
        if (gameData) {
            return res.send( gameData )
        }
        return res.send(gameData);
    })
})

app.get('/watchResults/saveResult', (req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Origin', '*');

    saveResultFlow(req, (error,  gameData  = {}) => {
        if (gameData) {
            return res.send( gameData )
        }
        return res.send(gameData);
    })
})

app.get('/createTimer', (req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Origin', '*');

    getDataFromGame(req, (error,  gameData  = {}) => {
        if (gameData) {
            return res.send( gameData )
        }
        return res.send(gameData);
    })
})

app.get('/watchResults/getUserGames', (req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Origin', '*');
    getUserGames(req, (error, { games } = {}) => {
        if (games) {
            return res.send({ games })
        }
        return res.send({games});
    })
})


app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
