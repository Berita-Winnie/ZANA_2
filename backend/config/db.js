const mongoose = require('mongoose')

async function connectDB() {
  const uri = process.env.MONGO_URI
  if (!uri) {
    throw new Error('MONGO_URI is not defined')
  }

  await mongoose.connect(uri)
  // eslint-disable-next-line no-console
  console.log('MongoDB connected')
}

module.exports = connectDB

