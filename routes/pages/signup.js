import crypto from 'crypto'

import User from '../../models/user'
import sendEmail from './sendEmail'
import { port, host } from '../../config'

export const renderSignup = async ctx => {
  await ctx.render('signup')
}

const isExist = email => {
  return new Promise(async (resolve, reject) => {
    const user = await User.findOne({ email })
    if (user) {
      reject('Пользователь с указанными данными уже зарегистрирован!')
    } else {
      resolve()
    }
  })
}

export const signup = async (ctx, next) => {
  const { email, username, password } = ctx.request.body

  // Check the email has been registered
  try {
    await isExist(email)
  } catch (error) {
    ctx.throw(400, error)
    return
  }
  // Create hash verify code
  const hmac = crypto.createHmac('sha256', 'signup')
  hmac.update(email + Date.now())
  const hash = hmac.digest('hex')

  const mainhost = /localhost/.test(host) ? `${host}:${port}` : host
  const url = `${mainhost}/activation/${hash}`
  //console.log(url);
  const option = {
    address: email,
    subject: 'Активация пользователя',
    html: `
      <p>Для активации перейдите по ссылке ниже:</p>
      <a href="${url}">${url}</a>
    `
  }
  try {
    const response = await sendEmail(option)

    // После отправки сообщения, записываем данные в базу.
    const user = new User({
      email,
      name: username,
      password,
      verify: hash
    })
    await user.save()

    ctx.body = 'The activation email has sent. Check your new email please.'
  } catch (error) {
    console.log(error)
    ctx.throw(400, 'Your email address is unavailable.')
  }

}

export const active = async ctx => {
  const { verify } = ctx.params

  if (!/^[0-9a-z]{64}$/.test(verify)) {
    ctx.throw(400, 'Ошибка кода активации')
    return
  }
  try {
    const actived = await new Promise(async (resolve, reject) => {
      const result = await User.findOne({ verify })
      if (result) {
        if (!result.status) {
          result.status = true
          await result.save()
          resolve('Пользователь активирован!')
        } else {
          reject('Activation code has been used.')
        }
      } else {
        reject('Activation code is not exist.')
      }
    })
    ctx.body = actived
  } catch (error) {
    ctx.throw(400, error)
  }
}
