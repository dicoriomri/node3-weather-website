const path = require('path')
const express = require('express')
const hbs = require('hbs')
const admin = require('firebase-admin');
const app = express()

const port = process.env.PORT || 3000
const geocode = require('./utils/geocode')
const forecast = require('./utils/forecast')
const firebase = require('./utils/firebase')

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname,'../public')


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

app.get('/users', (req, res)=> {

    firebase.getUsers('', (error, data) => {
        if (error) {
            return res.send({ error })
        }
        res.send({ data });
    })

})

app.get('/deleteUser', (req , res)=> {

    firebase.deleteUser(req.query.uid, (error, data) => {
        if (error) {
            return res.send({ error })
        }
        res.send({ data });
    })

})


app.listen(port, () => {
    console.log('server is running in port ' + port)
})
