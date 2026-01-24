import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'

const app = express()
app.use(express.json())
databaseService.connect()
app.use('/users', usersRouter)
app.listen(3000)
