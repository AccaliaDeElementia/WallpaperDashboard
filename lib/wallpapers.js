const { readdir } = require('fs')
const path = require('path')

module.exports = (io) => {
  const validExtensions = exports.validExtensions = ['jpg', 'jpeg', 'png', 'gif']

  const hasValidExtension = file => {
    const ext = (path.extname(file) || '').toLowerCase()
    return validExtensions.some(validExt => validExt === ext)
  }

  let wallpapers = []
  let currentWallpaper

  const choosePaper = () => {
    readdir(path.join(__dirname, '../public/images/wallpapers'), (err, files) => {
      if (err) return
      wallpapers = files.filter(file => hasValidExtension)
      currentWallpaper = wallpapers[Math.floor(Math.random() * wallpapers.length)]
      io.emit('cyclingWallpaper', null, `/images/wallpapers/${currentWallpaper}`)
    })
  }

  choosePaper()
  setInterval(choosePaper, 2 * 60 * 1000)

  return socket => {
    socket.on('getWallpaper', (cb) => cb(null, `/images/wallpapers/${currentWallpaper}`))
    socket.on('cycleWallpaper', choosePaper)
  }
}
