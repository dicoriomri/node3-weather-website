const path = require('path')
const express = require('express')
const hbs = require('hbs')
const admin = require('firebase-admin');
const app = express()

const port = process.env.PORT || 3000
const geocode = require('./utils/geocode')
const forecast = require('./utils/forecast')
const getUsers = require('./utils/firebase')

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname,'../public')


// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

app.get('', (req, res)=> {
    res.render('index',{
        title: 'Weather',
        name: "Omri"
    })
})

app.get('/weather', (req, res)=> {
    if(!req.query.address) {
        return res.send({
            error: 'Address must be provided'
        })
    }

    geocode(req.query.address, (error, data) => {
        if (error) {
            return res.send({ error })
        }
        forecast(data, (error, response) => {
            if(error) {
                return  res.send({ error })
            }

            return res.send({ response })
        })
    })

})

app.get('/users', (req, res)=> {

    getUsers('', (error, data) => {
        if (error) {
            return res.send({ error })
        }
        res.send({ data });
    })

})


app.listen(port, () => {
    console.log('server is running in port ' + port)
})
