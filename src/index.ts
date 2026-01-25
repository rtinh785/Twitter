import express, { Request, Response, NextFunction } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middleware'

const app = express()
app.use(express.json())
databaseService.connect()
app.use('/users', usersRouter)
app.use(defaultErrorHandler)
app.listen(3000)
