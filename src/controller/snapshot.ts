import * as Router from 'koa-router'
import * as child from 'child_process'
import * as path from 'path'
import CONFIG from '../config'

const createSnapshot = path.join(__dirname, '../service/createSnapshot')

const router = new Router()
router.prefix('/snapshot')

router.get('/', async (ctx, next) => {
  await ctx.render('snapshot', {
    title: '截屏工具 V1.0'
  })
})

router.post('/getSnapshot', async (ctx, next) => {
  let url = ctx.request.body.url
  let p = child.fork(createSnapshot, [], {})
  const fileName = `${+new Date()}.png`
  ctx.response.body = {
    flag: true,
    url: `${CONFIG.DOMAIN}${CONFIG.STATIC.prefix}/${CONFIG.DIR.cacheDir}/${fileName}`
  }
  p.on('message', (m) => {
    console.log(m)
  })
  p.send({
    url: url,
    fileName: fileName
  })
})

export default function (app: any) {
  app.use(router.routes(), router.allowedMethods())
}