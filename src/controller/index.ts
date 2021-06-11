import * as Router from 'koa-router'

const router = new Router()
router.prefix('/snapshot/index')

router.get('/', async (ctx:any, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

export default function (app: any) {
  app.use(router.routes(), router.allowedMethods())
}