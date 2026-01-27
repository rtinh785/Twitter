import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middleware'

databaseService.connect()
const app = express()
app.use(express.json())
app.use('/users', usersRouter)
app.use(defaultErrorHandler)
app.listen(3000)
