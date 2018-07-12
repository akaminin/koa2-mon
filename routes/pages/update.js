import { compareSync } from 'bcryptjs'

import User from '../../models/user'

import Audit from '../../models/audit'

export const renderUpdate = async ctx => {
  const data = {}
  const { user } = ctx.session
  // signed in
  if (user) {
    const result = await User.findById(user)
    !({
      name: data.name,
      email: data.email,
      joindate: data.joindate
    } = result)
  } else {
    ctx.redirect('/login')
  }
  await ctx.render('update', data)
}


export const update = async ctx => {
  const { pass, pass1, pass2 } = ctx.request.body
  if (!pass || !pass1 || !pass2 || pass1 !== pass2) {
    ctx.throw(400, 'Input error.')
  } else {
    const user = await User.findById(ctx.session.user)
  const audit = new Audit({
    email: user.email,
    action: 'Password update',
  })
    const isIdentical = compareSync(pass, user.password)
    if (isIdentical) {
      user.changePass(pass1)
      audit.status = 'Succes'
      await audit.save()
      // empty session
      ctx.session = null
      ctx.body = 'The password has been updated, please sign in again.'
    } else {
      audit.status = 'Error. Old Password is incorrect'
      await audit.save()
      ctx.throw(400, 'The old password is incorrect.')
    }
  }
}
