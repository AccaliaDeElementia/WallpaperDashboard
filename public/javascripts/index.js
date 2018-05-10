/* global io */
(() => {
  const setField = (selector, value) => {
    document.querySelector(selector).innerHTML = value
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const updateTime = () => {
    const fmt = v => `0${v}`.slice(-2)
    const now = new Date()
    setField('.datetime .date', `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`)
    setField('.datetime .time', `${fmt(now.getHours())}:${fmt(now.getMinutes())}`)
  }
  updateTime()
  setInterval(updateTime, 1000)

  const updateWeather = (_, weather) => {
    setField('.weather .description', weather.description)
    setField('.weather .fahrenheit', `${Math.round(weather.temperature * 9 / 5 + 32, 2)}&deg;F`)
    setField('.weather .celcius', `${Math.round(weather.temperature, 2)}&deg;C`)
    setField('.weather .humidity .text', `${Math.round(weather.relativeHumidity)}%`)
  }

  let lastUpdate;
  const updateWallpaper = (_, uri, manual) => {
    const now = Date.now()
    if (lastUpdate){
      console.log(`Cycling background after: ${now - lastUpdate}ms (${manual?'manual':'automatic'})`)
    }
    lastUpdate = now

    document.querySelector('img.background').src = uri
    document.querySelector('img.foreground').src = uri
  }

  const updateAlert = (_, data) => {
    const alert = document.querySelector('.alert .body')
    alert.classList.remove('minor')
    alert.classList.remove('moderate')
    alert.classList.remove('severe')
    if (!data.severity) return
    alert.querySelector('.alerttitle').innerHTML = data.title
    alert.querySelector('.alerttext').innerHTML = data.body
    alert.classList.add(data.severity)
  }

  const socket = io.connect('/')
  socket.on('updateWeather', updateWeather)
  socket.on('cyclingWallpaper', updateWallpaper)
  socket.on('updateAlert', updateAlert)
  socket.on('connect', () => {
    socket.emit('getWeather', updateWeather)
    socket.emit('getWallpaper', updateWallpaper)
    socket.emit('getAlert', updateAlert)
  })

  document.addEventListener('keyup', (evt) => {
    if (evt.key === ' ') {
      socket.emit('cycleWallpaper')
    }
  })
})()
