import { compareSync } from 'bcryptjs'

import User from '../../models/user'

import Audit from '../../models/audit'


export const renderLogin = async (ctx, next) => {
  if (ctx.session.user) {
    ctx.redirect('/')
  } else {
    await ctx.render('login')
  }
}

const checkInput = (email, pass) => {
  return new Promise(async (resolve, reject) => {
  const audit = new Audit({
    email: email,
    action: 'Log In',
  })
    const user = await User.findOne({ email })
    if (user) {
      const { _id, status, password } = user
      audit.user = user._id
      audit.username = user.name
      if (status) {
        const isIdentical = compareSync(pass, password)
        if (isIdentical) {
          audit.status = 'Succes'
          await audit.save()
          resolve(_id)
        } else {
          audit.status = 'Incorrect password'
          await audit.save()
          reject('Incorrect email or password.')
        }
      } else {
        audit.status = 'The email is not active'
        await audit.save()
        reject('The email is not active.')
      }
    } else {
      audit.status = 'Incorrect email'
      await audit.save()
      reject('Incorrect email or password.')
    }
  })
}

export const login = async (ctx, next) => {
  const { email, password } = ctx.request.body

  try {
    const id = await checkInput(email, password)
    await console.log(ctx.ip)
    ctx.session.user = id
    ctx.state.user = id
    ctx.redirect('/')

  } catch (error) {
    ctx.throw(400, error)
  }
}
