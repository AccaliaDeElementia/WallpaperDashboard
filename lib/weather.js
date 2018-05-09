'use strict'

const request = require('request')

module.exports = (io) => {
  const sourceStation = 'KPWM'
  const sourceCoords = '43.6500,-70.3099'

  const baseWeather = {
    description: '',
    temperature: NaN,
    dewpoint: NaN,
    windDirection: NaN,
    windSpeed: NaN,
    windGust: NaN,
    barometricPressure: NaN,
    seaLevelPressure: NaN,
    relativeHumidity: NaN
  }

  const getApiPage = (uri, cb) => {
    request({
      method: 'GET',
      uri: uri,
      headers: {
        'Accept': 'application/geo+json;version=3',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, (err, _, body) => {
      if (err) return cb(err)
      try {
        cb(null, JSON.parse(body))
      } catch (e) {
        return cb(e)
      }
    })
  }

  let currentWeather = JSON.parse(JSON.stringify(baseWeather))
  const weatherUri = `https://api.weather.gov/stations/${sourceStation}/observations/current`
  const getWeather = () => getApiPage(weatherUri, (err, data) => {
    currentWeather = JSON.parse(JSON.stringify(baseWeather))
    if (err) {
      io.emit('updateWeather', null, currentWeather)
      return
    }
    const parsed = data.properties
    currentWeather.description = parsed.textDescription
    currentWeather.temperature = parsed.temperature.value
    currentWeather.dewpoint = parsed.dewpoint.value
    currentWeather.windDirection = parsed.windDirection.value
    currentWeather.windSpeed = parsed.windSpeed.value
    currentWeather.windGust = parsed.windGust.value
    currentWeather.barometricPressure = parsed.barometricPressure.value
    currentWeather.seaLevelPressure = parsed.seaLevelPressure.value
    currentWeather.relativeHumidity = parsed.relativeHumidity.value
    io.emit('updateWeather', null, currentWeather)
  })

  getWeather()
  setInterval(getWeather, 10 * 60 * 1000)

  const baseAlert = {
    severity: '',
    title: '',
    body: ''
  }
  let currentAlert = JSON.parse(JSON.stringify(baseAlert))
  const alertUri = `https://api.weather.gov/alerts?point=${sourceCoords}&limit=1&active=1`
  const getAlert = () => getApiPage(alertUri, (err, data) => {
    currentAlert = JSON.parse(JSON.stringify(baseAlert))
    if (err || data.features.length < 1) {
      io.emit('updateAlert', null, currentAlert)
      return
    }
    const alert = data.features[0].properties
    currentAlert.severity = alert.severity.toLowerCase()
    currentAlert.title = alert.headline
    currentAlert.body = alert.description.replace(/\n/g, '<br/>')
    io.emit('updateAlert', null, currentAlert)
  })
  getAlert()
  setInterval(getAlert, 2 * 60 * 1000)

  return socket => {
    socket.on('getWeather', cb => cb(null, currentWeather))
    socket.on('getAlert', cb => cb(null, currentAlert))
  }
}
