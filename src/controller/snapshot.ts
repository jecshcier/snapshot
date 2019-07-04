import * as Router from 'koa-router'
import * as child from 'child_process'
import * as path from 'path'
import * as uuidv1 from 'uuid/v1'

import CONFIG from '../config'
import SnapshotService from '../service/snapshot.service'
const createSnapshot = path.join(__dirname, '../process/createSnapshot')

const router = new Router()
router.prefix('/snapshot')

export default function (app: any) {
  const snapshotService = new SnapshotService(app)
  router.get('/', async (ctx, next) => {
    await ctx.render('snapshot', {
      title: '截屏工具 V1.0'
    })
  })

  router.post('/getSnapshot', async (ctx, next) => {
    // console.log()
    let url = ctx.request.body.url
    if (!url) {
      ctx.response.body = app.responseMessage.successMessage({
        msg: 'url不能为空',
        key: null
      })
      return false
    }
    let p = child.fork(createSnapshot, [], {})
    let key = uuidv1()
    const fileName = `image${+new Date() + Math.floor(Math.random() * 100000)}.png`
    p.on('message', async (m) => {
      if (m.flag) {
        try {
          await snapshotService.createSnapshot({
            'id': key,
            'snap_url': url,
            'file_name': fileName,
            'preview_url': `${CONFIG.DOMAIN}${CONFIG.STATIC.prefix}/${CONFIG.DIR.cacheDir}/${fileName}`
          })
        } catch (e) {
          console.log(e)
        }
      }
    })
    p.send({
      url: url,
      fileName: fileName
    })
    ctx.response.body = app.responseMessage.successMessage({
      key: key
    })
  })

  router.post('/getSnapshotImg', async (ctx, next) => {
    let key = ctx.request.body.key
    try {
      let result = await snapshotService.getSnapshot(key)
      result = JSON.parse(JSON.stringify(result))
      if(result){
        ctx.response.body = app.responseMessage.successMessage({
          url:result.preview_url
        })
      }else{
        ctx.response.body = app.responseMessage.errorMessage({
          msg: "图片已失效"
        })
      }
    } catch (err) {
      console.log(err)
      ctx.response.body = app.responseMessage.errorMessage({
        msg: "图片已失效"
      })
    }
  })

  app.use(router.routes(), router.allowedMethods())
}