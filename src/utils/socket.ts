import { Server, Socket } from 'socket.io'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/request/User.request'
import Conversation from '~/models/schemas/Conversations'
import databaseService from '~/services/database.services'
import { verifyAccessToken } from './common'

const users: any = {}

export const initSocket = (io: Server) => {
  io.use(async (socket, next) => {
    const { Authorization } = socket.handshake.auth
    const access_token = Authorization?.split(' ')[1]

    try {
      const decode_authorization = await verifyAccessToken(access_token)

      const { verify, user_id } = decode_authorization as TokenPayload

      if (verify !== UserVerifyStatus.Verified) {
        throw new ErrorWithStatus({
          message: USER_MESSAGES.USER_NOT_VERIFIED,
          status: HTTP_STATUS.FORBIDDEN
        })
      }

      socket.handshake.auth._id = user_id
      socket.handshake.auth.access_token = access_token

      next()
    } catch (error) {
      return next(new Error('Unauthorized'))
    }
  })

  io.on('connection', (socket: Socket) => {
    console.log('a user connected', socket.id)

    const userId = socket.handshake.auth._id

    users[userId] = {
      socketId: socket.id
    }

    socket.use(async (_, next) => {
      const access_token = socket.handshake.auth.access_token

      try {
        if (access_token) {
          await verifyAccessToken(access_token)
          return next()
        }
      } catch (error) {
        next(new Error('Unauthorized'))
      }
    })

    socket.on('error', (err) => {
      if (err.message === 'Unauthorized') {
        console.log('User unauthorized, disconnecting socket', socket.id)
        socket.disconnect()
      }
    })

    socket.on('send_message', async (data: any) => {
      const user = users[data.to]

      if (user) {
        socket.to(user.socketId).emit('receive_message', {
          content: data.content,
          from: data.from,
          to: data.to
        })

        await databaseService.conversations.insertOne(
          new Conversation({
            sender_id: new ObjectId(data.from),
            receiver_id: new ObjectId(data.to),
            content: data.content
          })
        )
      }
    })

    socket.on('disconnect', () => {
      console.log('a user disconnected', socket.id)
      delete users[userId]
    })
  })
}
