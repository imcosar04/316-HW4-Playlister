// THESE ARE NODE APIs WE WISH TO USE
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

// CREATE OUR SERVER
const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '.env') })
const PORT = process.env.PORT || 4000;
const app = express()

// SETUP THE MIDDLEWARE
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// SETUP OUR OWN ROUTERS AS MIDDLEWARE
const authRouter = require('./routes/auth-router')
app.use('/auth', authRouter)
const storeRouter = require('./routes/store-router')
app.use('/store', storeRouter)

// INITIALIZE OUR DATABASE OBJECT
const db = require('./db')
;(async () => {
  try {
    if (typeof db.connect === 'function') {
      await db.connect()
      console.log(`Connected to ${process.env.DB_VENDOR || 'mongo'} database`)
    }
    app.listen(PORT, () => console.log(`Playlister Server running on port ${PORT}`))
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
})()
