import { Router } from 'express'
const userRouter = Router()

userRouter.use((req, res, next) => {
  console.log('middelware')
  res.status(400).send('not not ')
})

userRouter.get('/tweets', (req, res) => {
  res.json({
    data: [
      {
        id: 1,
        text: 'Hello world!'
      }
    ]
  })
})

export default userRouter
