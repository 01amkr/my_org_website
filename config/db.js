const mongoose = require('mongoose')
const config = require('config')
const db = config.get('mongoURI') //Directly get the file from config folder
const chalk = require('chalk')

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log(
      chalk.magentaBright.bold.underline('Connected to mongoose successfully!')
    )
    
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }
}

module.exports = connectDB
