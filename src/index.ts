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
import { Server } from 'socket.io'
import cors from 'cors'
import Conversation from './models/schemas/Conversations'
import conversationRouter from './routes/conversation.routes'
import { ObjectId } from 'mongodb'
import { verifyAccessToken } from './utils/common'
import { UserVerifyStatus } from './constants/enum'
import { TokenPayload } from './models/request/User.request'
import { ErrorWithStatus } from './models/Errors'
import { USER_MESSAGES } from './constants/messages'
import HTTP_STATUS from './constants/httpStatus'
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

const users: any = {}

io.use(async (socket, next) => {
  const { Authorization } = socket.handshake.auth
  try {
    const decode_authorization = await verifyAccessToken(Authorization)
    const { verify } = decode_authorization as TokenPayload
    if (verify !== UserVerifyStatus.Verified) {
      throw new ErrorWithStatus({
        message: USER_MESSAGES.USER_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    }
  } catch (error) {
    return next({
      message: 'Unauthorized',
      name: 'UnauthorizedError',
      data: error
    })
  }
})

io.on('connection', (socket) => {
  const userId = socket.handshake.auth._id

  users[userId] = {
    socketId: socket.id
  }

  socket.on('send_message', async (data: any) => {
    const to = data.to

    const user = users[to]

    if (user) {
      socket.to(user.socketId).emit('receive_message', {
        content: data.content,
        from: data.from
      })

      await databaseService.conversations.insertOne(
        new Conversation({
          sender_id: new ObjectId(data.from),
          receiver_id: new ObjectId(data.to),
          content: data.content
        })
      )
    } else {
      console.log('User not online')
      return
    }
  })

  socket.on('disconnect', () => {
    delete users[userId]
  })
})

httpServer.listen(port)
