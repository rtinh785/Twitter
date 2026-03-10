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
import { initSocket } from './utils/socket'
import { envConfig, isProduction } from './constants/config'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
// import { ne } from '@faker-js/faker'
// import { UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from './constants/dir'
// import { UPLOAD_IMAGE_DIR } from './constants/dir'

databaseService.connect().then(() => {
  databaseService.indexUser()
  databaseService.indexRefreshToken()
  databaseService.indexFollower()
  databaseService.indexTweets()
})

const app = express()

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  limit: 100, // Giới hạn mỗi IP ở 100 yêu cầu mỗi `window` (ở đây, mỗi 15 phút).
  standardHeaders: 'draft-8', // draft-6: tiêu đề `RateLimit-*`; draft-7 & draft-8: tiêu đề `RateLimit` kết hợp
  legacyHeaders: false, // Vô hiệu hóa tiêu đề `X-RateLimit-*`.
  ipv6Subnet: 56 // Đặt thành 60 hoặc 64 để ít mạnh mẽ hơn, hoặc 52 hoặc 48 để mạnh mẽ hơn
  // store: ... , // Redis, Memcached, v.v. Xem bên dưới.
})
app.use(limiter)
app.use(helmet())
app.use(
  cors({
    origin: isProduction ? envConfig.urlClientHost : '*'
  })
)
const httpServer = createServer(app)
const port = Number(envConfig.port)

// create uploads folder
initFolder()

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

console.log(`Server is running on port ${port}`)
httpServer.listen(port)
