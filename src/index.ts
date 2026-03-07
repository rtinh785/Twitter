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
import { createServer } from 'http'
import cors from 'cors'
import conversationRouter from './routes/conversation.routes'
import { Server } from 'socket.io'
import { ne } from '@faker-js/faker'
import { initSocket } from './utils/socket'
// import { UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from './constants/dir'
// import { UPLOAD_IMAGE_DIR } from './constants/dir'

databaseService.connect().then(() => {
  databaseService.indexUser()
  databaseService.indexRefreshToken()
  databaseService.indexFollower()
  databaseService.indexTweets()
})

const app = express()
const httpServer = createServer(app)
const port = 4000

// create uploads folde
initFolder()

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  })
)

app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarkRouter)
app.use('/like', likeRouter)
app.use('/static', staticRouter)
app.use('/search', searchRouter)
app.use('/conversations', conversationRouter)
// app.use('/static/video', express.static(UPLOAD_VIDEO_TEMP_DIR))

app.use(defaultErrorHandler)

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000'
  }
})

initSocket(io)

httpServer.listen(port)
