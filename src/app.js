const path = require('path')
const express = require('express')
const hbs = require('hbs')
const app = express()

const geocode = require('./utils/geocode')
const forecast = require('./utils/forecast')

// Define paths for Express config
const viewPath = path.join(__dirname,'../templates/views')
const publicDirectoryPath = path.join(__dirname,'../public')
const partialsPath = path.join(__dirname,'../templates/partials')

// Setup Handlebars engine and templates location
app.set('view engine', 'hbs')
app.set('views', viewPath)
hbs.registerPartials(partialsPath)

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

app.get('', (req, res)=> {
    res.render('index',{
        title: 'Weather',
        name: "Omri"
    })
})

app.get('/about', (req, res)=> {
    res.render('about',{
        title: 'About',
        name: "Omri"
    })
})

app.get('/help', (req, res)=> {
    res.render('about',{
        title: 'Help page',
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

app.get('/help/*', (req, res)=> {
    res.render('404',{
        title: '404',
        errorMsg: 'Page Not Found',
        name: "Omri"
    })
})


app.get('*', (req, res)=> {
    res.render('404',{
        title: '404',
        errorMsg: 'Help Article Not Found',
        name: "Omri"
    })
})

app.listen(3000, () => {
    console.log('server is running in port 3000')
})