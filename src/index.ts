import express from 'express'
import usersRouter from './routes/users.routes'
import mediasRouter from './routes/medias.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middleware'
import { initFolder } from './utils/file'
import staticRouter from './routes/static.routes'
import tweetsRouter from './routes/tweets.routes'
import bookmarkRouter from './routes/bookmark.routes'
import likeRouter from './routes/like.routes'
import searchRouter from './routes/search.routes'

// import { UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from './constants/dir'
// import { UPLOAD_IMAGE_DIR } from './constants/dir'

databaseService.connect().then(() => {
  databaseService.indexUser()
  databaseService.indexRefreshToken()
  databaseService.indexFollower()
})
const app = express()
const port = 4000

// create uploads folde
initFolder()

app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarkRouter)
app.use('/like', likeRouter)
app.use('/static', staticRouter)
app.use('/search', searchRouter)
// app.use('/static/video', express.static(UPLOAD_VIDEO_TEMP_DIR))

app.use(defaultErrorHandler)
app.listen(port)
