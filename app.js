const express = require('express')
const userRouter = require('./routers/user.routes')
const postRouter = require('./routers/post.routes')
const commentRouter = require('./routers/comment.routes')
const lokeRouter = require('./routers/like.routes')
const dotenv = require("dotenv")
const path = require('path');

const app = express()

dotenv.config({ path: ".env" })

const port = process.env.PORT || 8080;

app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/auth', userRouter)
app.use('/api/posts', postRouter)
app.use('/api/comments', commentRouter)
app.use('/api/likes', lokeRouter)

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})