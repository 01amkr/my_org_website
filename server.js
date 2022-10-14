const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')
const path = require('path')
const chalk = require('chalk')
const errorHandler = require('./middleware/error')
const session = require('express-session')
const fileupload = require('express-fileupload')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
// const rateLimit = require('express-rate-limit')
const flash = require('connect-flash')
const config = require('config')
const MongoStore = require("connect-mongo")
require('dotenv').config()
const db = config.get('mongoURI')

const app = express()
//Load env variables
dotenv.config({
  path: './config/config.env'
})

//An alternative to bodyParser middleware
app.use(express.json({
  extended: false
}))

//Adding cookie parser middleware
app.use(cookieParser())
app.use(session({
  secret: 'mySecret',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: db,
    ttl: 60*60,
    autoRemove: 'native'
  })
}))

app.use(express.urlencoded({
  extended: true
})) // Parse URL-encoded html

//Template Render Engine
app.set('view engine', 'ejs')
app.use('static', express.static(path.join(__dirname, 'views')))
app.use(express.static('public'))

//Connection with mongoose
connectDB()


//File uploading
app.use(fileupload({
  useTempFiles: true
}))

//Sanitize data
app.use(mongoSanitize())
  
  //prevent xss attacks
  app.use(xss())
  
  app.use(hpp())
  
  app.use(flash())
  //Home page
  app.get('/', (req, res) => {
    res.render('home/index', {isLoggedIn: req.cookies.token, msg: req.flash('message')})
  })

  //Legal Terms
  app.get('/privacy',(req,res)=> {
    res.render('legal/privacy')
  })
  app.get('/terms',(req,res)=> {
    res.render('legal/terms')
  })
  app.get('/refund', (req,res)=> {
    res.render('legal/refund')
  })
  
  
  //Express-routing (Define routes and endpoints)
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/event', require('./routes/api/event'))
app.use('/api/workshop', require('./routes/api/workshop'))
app.use('/api/register', require('./routes/api/register'))
app.use('/api/guest', require('./routes/api/guest'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/contact', require('./routes/api/contact'))
app.use('/api/gallery', require('./routes/api/gallery'))
app.use('/api/exhibition', require('./routes/api/exhibition'))
app.use('/api/webteam', require('./routes/api/webteam'))
app.use('/api/sponsors', require('./routes/api/sponsors'))
app.use('/api/comingSoon', require('./routes/api/comingSoon'))
app.use('/api/campus-ambassador',require('./routes/api/campus_ambassador'))
app.all('*', (req, res) => {
  return res.status(404).render('error/404');
});

app.use(errorHandler)

//Fetching vars from env file
const PORT = process.env.PORT || 5000

const server = app.listen(
  PORT,
  console.log(
    chalk.cyan.bold(
      `Successfully running server in ${process.env.NODE_ENV} mode on port ${PORT}`
    )
  )
)

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Hello unhandled promise here!')
  console.log(`Error: ${err.message}`)
  // Close server & exit process
  server.close(() => process.exit(1))
})
