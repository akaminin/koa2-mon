import mongoose from 'mongoose'

mongoose.set('debug', true)

mongoose.connect('mongodb://localhost:27017/auth', {
  useMongoClient: true
})

mongoose.connection.on('error', console.error)

mongoose.Promise = global.Promise

export default mongoose
