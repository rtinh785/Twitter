import express from 'express'
import userRouter from './user.routes'

const app = express()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/user', userRouter)

app.listen(3000, () => {
  console.log('Port 3000')
})
