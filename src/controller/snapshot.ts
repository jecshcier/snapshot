import * as Router from 'koa-router'
import * as child from 'child_process'
import * as path from 'path'
import * as uuidv1 from 'uuid/v1'
import * as schedule from 'node-schedule'
import * as fs from 'fs-extra'

import CONFIG from '../config'

const createSnapshot = path.join(__dirname, '../service/createSnapshot')

const router = new Router()
router.prefix('/snapshot')

let sourceMap: any = {}

router.get('/', async (ctx, next) => {
  await ctx.render('snapshot', {
    title: '截屏工具 V1.0'
  })
})

router.post('/getSnapshot', async (ctx, next) => {
  let url = ctx.request.body.url
  if(!url){
    ctx.response.body = {
      flag: false,
      key: null
    }
    return false
  }
  let p = child.fork(createSnapshot, [], {})
  let key = uuidv1()
  const fileName = `${+new Date()}.png`
  p.on('message', (m) => {
    if (m.flag) {
      sourceMap[key] = {
        flag: true,
        url: `${CONFIG.DOMAIN}${CONFIG.STATIC.prefix}/${CONFIG.DIR.cacheDir}/${fileName}`
      }
    } else {
      sourceMap[key] = {
        flag: false,
        err: m.err
      }
    }
  })
  p.send({
    url: url,
    fileName: fileName
  })
  ctx.response.body = {
    flag: true,
    key: key
  }
})

router.post('/getSnapshotImg', async (ctx, next) => {
  let key = ctx.request.body.key
  if (sourceMap[key]) {
    ctx.response.body = sourceMap[key]
  } else {
    ctx.response.body = {
      flag: false,
      msg: "图片已失效"
    }
  }
})

schedule.scheduleJob('0 0 0 * * *', () => {
  console.log("开始执行定时任务...!")
  sourceMap = {}
  fs.emptyDir(`${CONFIG.STATIC.dir}/${CONFIG.DIR.cacheDir}`, () => {
    console.log("文件夹清空成功...")
  })
})

export default function (app: any) {
  app.use(router.routes(), router.allowedMethods())
}