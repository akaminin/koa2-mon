import mongoose from './config'

const Schema = mongoose.Schema

const auditSchema = new Schema({
  user: Schema.Types.ObjectId,
  username: String,
  email: String,
  action: String,
  status: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// auditSchema.pre('save', function (next) {
//   if (this.isModified('status')) {
//     return next()
//   }

//   const deadline = new Date()
//   deadline.setDate(deadline.getDate() + 1)
//   this.deadline = deadline
//   next()
// })

export default mongoose.model('Audit', auditSchema)