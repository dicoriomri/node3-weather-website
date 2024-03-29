const path = require('path')
const express = require('express')
const hbs = require('hbs')
const geocode = require('./utils/geocode')
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


app.listen(port, () => {
    console.log('Server is up on port ' + port)
})