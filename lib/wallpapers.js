const { readdir } = require('fs')
const path = require('path')

module.exports = (io) => {
  const validExtensions = exports.validExtensions = ['.jpg', '.jpeg', '.png', '.gif']

  const hasValidExtension = file => {
    const ext = (path.extname(file) || '').toLowerCase()
    return validExtensions.some(validExt => validExt === ext)
  }

  let wallpapers = []
  let currentWallpaper
  let nextTimer
  const choosePaper = () => {
    clearTimeout(nextTimer)
    readdir(path.join(__dirname, '../public/images/wallpapers'), (err, files) => {
      if (err) {
        nextTimer = setTimeout(choosePaper, 2 * 60 * 1000)
        return
      }
      wallpapers = files.filter(hasValidExtension)
      currentWallpaper = wallpapers[Math.floor(Math.random() * wallpapers.length)]
      io.emit('cyclingWallpaper', null, `/images/wallpapers/${currentWallpaper}`)
      nextTimer = setTimeout(choosePaper, 2 * 60 * 1000)
    })
  }

  choosePaper()

  return socket => {
    socket.on('getWallpaper', (cb) => cb(null, `/images/wallpapers/${currentWallpaper}`))
    socket.on('cycleWallpaper', choosePaper)
  }
}
