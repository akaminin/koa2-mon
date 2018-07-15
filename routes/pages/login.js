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
          audit.status = 'Success'
          await audit.save()
          resolve(_id)
        } else {
           const attempts = await Audit.find({
             email: email,
             status: 'Incorrect password',
             createdAt : {
             '$gte': Date.now() - 120000,
             '$lt': Date.now()
             }
          }).count()
          await console.log(attempts)
          if (attempts > 4) {
            user.status = false
            await user.save()
            audit.status = 'The email is block'
            await audit.save()
          } else {
            audit.status = 'Incorrect password'
            await audit.save()
        }
          reject(`Неверный пароль! До блокировки пользователя осталось попыток:  ${5 - attempts}`)
        }
      } else {
        audit.status = 'The email is not active'
        await audit.save()
        reject('Пользователь заблокирован, обратитесь к администратору!')
      }
    } else {
      audit.status = 'Incorrect email'
      await audit.save()
      reject('Неверный логин или пароль.')
    }
  })
}

export const login = async (ctx, next) => {
  const { email, password } = ctx.request.body

  try {
    const id = await checkInput(email, password)
    await console.log(ctx.ip)
    ctx.session.user = id
    // TODO 
    // ctx.state.user = id
    ctx.redirect('/')

  } catch (error) {
    const data = { error: error}
    await ctx.render('message', data)
   // ctx.throw(400, error)
  }
}
