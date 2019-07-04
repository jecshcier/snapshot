import * as Koa from 'koa'
// const Koa = require('koa')
const app = new Koa()
import * as views from 'koa-views'
import * as json from 'koa-json'
import * as bodyparser from 'koa-bodyparser'
import * as logger from 'koa-logger'
import * as path from 'path'
// @ts-ignore
import * as onerror from 'koa-onerror'
import * as koaStatic from 'koa-static'
import * as koaMount from 'koa-mount'
import * as util from 'util'
import * as Glob from 'glob'
import * as fs from 'fs-extra'
import CONFIG from './config'
import sequelize from './sequelize'
import {createStaticDir,copyStaticResource} from './task'
import ResponseMessage from './lib/responseMessage'

const glob = util.promisify(Glob)
// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())

//静态资源访问
app.use(koaMount(CONFIG.STATIC.prefix, koaStatic(CONFIG.STATIC.dir)))

//模板渲染
app.use(views(CONFIG.VIEW.dir, {
  extension: 'ejs'
}))

// logger
app.use(async (ctx: any, next: any) => {
  const start = +new Date()
  await next()
  const ms = +new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// 配置路由
glob(__dirname + '/controller/*.js').then((controllers) => {
  return Promise.all(controllers.map((el) => {
    return import(el)
  }))
}).then((moduleArr) => {
  moduleArr.forEach((el, index) => {
    el.default(app)
  })
}).catch((err) => {
  console.log(err)
})

//处理静态资源
if (process.env.NODE_ENV === 'dev') {
  copyStaticResource()
  createStaticDir()
}

//挂载消息返回处理
const responseMessage = new ResponseMessage()
Object.assign(app, {responseMessage})

//配置数据库连接池
Object.assign(app, {sequelize})


// error-handling
app.on('error', (err: any, ctx: any) => {
  console.error('server error', err, ctx)
})


export default app