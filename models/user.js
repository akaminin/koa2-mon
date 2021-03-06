import mongoose from './config'
import { hashSync } from 'bcryptjs'

const Schema = mongoose.Schema

const userSchema = new Schema({
  email: String,
  name: String,
  role: String,
  password: String,
  verify: String,
  status: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
  type: Date,
  default: Date.now
  },
})

/**
 * Use the hash password in database
 */
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next()
  }
  // hash password
  this.password = hashSync(this.password, 10)
  next()
})

userSchema.methods.changePass = function (pass) {
  this.password = pass
  this.updatedAt = Date.now()
  this.save()
}

export default mongoose.model('User', userSchema)
