import User from '../../models/user'

export default async ctx => {
  const data = {}
  const { user } = ctx.session
  // signed in
  if (user) {
    const result = await User.findById(user)
    !({
      name: data.name,
      email: data.email,
      createdAt: data.createdAt
    } = result)
  } else {
    ctx.redirect('/login')
  }
  ctx.state.user = data
  console.log(ctx.state)
  await ctx.render('index', data)
}
