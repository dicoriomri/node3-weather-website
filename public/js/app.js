console.log('client js loaded')
const forecastMessage = document.querySelector('#forecast')
const errorMessage = document.querySelector('#errorMessage')
const getForcast = (location) => {
    forecastMessage.textContent = "Loading..."
    errorMessage.textContent = ""
    fetch('http://localhost:3000/weather?address=' + location).then((response) => {
        response.json().then((data) =>{
            if(data.error) {
                forecastMessage.textContent = ""
                errorMessage.textContent = data.error

            } else {
                forecastMessage.textContent = data.response
                errorMessage.textContent = ""
            }
        })
    }).catch((error) => {

    })
}


const weatherForm = document.querySelector('form')
const search = document.querySelector('input')

weatherForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const location = search.value
    getForcast(location)
})
