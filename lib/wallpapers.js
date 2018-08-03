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
  let currentIdx
  let nextTimer

  const initPaper = () => {
    currentIdx = -1
    choosePaper(true)
  }

  const choosePaper = (manual = false) => {
    clearTimeout(nextTimer)
    readdir(path.join(__dirname, '../public/images/wallpapers'), (err, files) => {
      if (err) {
        nextTimer = setTimeout(choosePaper, 2 * 60 * 1000)
        return
      }
      wallpapers = files.filter(hasValidExtension)
      if (currentIdx < 0) {
        currentIdx = Math.floor(Math.random() * wallpapers.length)
      }
      currentIdx = (currentIdx + 1) % wallpapers.length
      currentWallpaper = wallpapers[currentIdx]
      io.emit('cyclingWallpaper', null, `/images/wallpapers/${currentWallpaper}`, manual)
      nextTimer = setTimeout(choosePaper, 2 * 60 * 1000)
    })
  }

  initPaper()

  return socket => {
    socket.on('getWallpaper', (cb) => cb(null, `/images/wallpapers/${currentWallpaper}`))
    socket.on('cycleWallpaper', () => choosePaper(true))
    socket.on('randomizeWallpaper', () => initPaper())
  }
}
