import * as Router from 'koa-router'
import * as child from 'child_process'
import * as path from 'path'
import * as uuidv1 from 'uuid/v1'

import CONFIG from '../config'
import SnapshotService from '../service/snapshot.service'
import {IntegerDataType} from "sequelize"

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
    let width = parseInt(ctx.request.body.width, 10)
    let isMobile = ctx.request.body.isMobile
    let userAgent = ctx.request.body.userAgent
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
            'preview_url': `${CONFIG.DOMAIN}${CONFIG.STATIC.prefix}/${CONFIG.DIR.cacheDir}/${fileName}`,
            'img_flag': 0
          })
        } catch (e) {
          console.log(e)
        }
      } else {
        try {
          await snapshotService.createSnapshot({
            'id': key,
            'snap_url': url,
            'file_name': fileName,
            'preview_url': `${CONFIG.DOMAIN}${CONFIG.STATIC.prefix}/${CONFIG.DIR.cacheDir}/${fileName}`,
            'img_flag': 1
          })
        } catch (e) {
          console.log(e)
        }
      }
    })
    console.log("创建截图....")
    p.send({
      url: url,
      fileName: fileName,
      width: width,
      isMobile: !!isMobile,
      userAgent:userAgent || 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'
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
      if (result) {
        //生成失败
        if (result.img_flag === 1) {
          ctx.response.body = app.responseMessage.errorMessage({
            errCode: 2,
            msg: '截图生成失败，请确保网址正确！'
          })
        }
        //这是一个feature
        //被清理
        else if (result.img_flag === 2) {
          ctx.response.body = app.responseMessage.errorMessage({
            errCode: 3,
            msg: '截图已被过期清理！'
          })
        }
        //正常生成
        else {
          ctx.response.body = app.responseMessage.successMessage({
            url: result.preview_url
          })
        }
      } else {
        ctx.response.body = app.responseMessage.errorMessage({
          msg: "未找到图片"
        })
      }
    } catch (err) {
      console.log(err)
      ctx.response.body = app.responseMessage.errorMessage({
        msg: "未找到图片"
      })
    }
  })

  app.use(router.routes(), router.allowedMethods())
}