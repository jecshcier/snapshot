import CONFIG from './config'
import * as fs from 'fs-extra'
import * as path from "path"
import * as schedule from 'node-schedule'

export function createStaticDir() {

  //创建缓存目录

  const cacheDir = `${CONFIG.STATIC.dir}/${CONFIG.DIR.cacheDir}`
  const fileDir = `${CONFIG.STATIC.dir}/${CONFIG.DIR.fileDir}`

  Promise.all([//创建缓存目录
    fs.ensureDir(cacheDir),
    fs.ensureDir(fileDir)]).then((data) => {
    console.log('静态目录创建成功------>')
  }).catch((err) => {
    console.log(err)
  })

}

export function copyStaticResource() {
  Promise.all([
    //复制view
    fs.copy(`${path.join(__dirname, `../src/views`)}`, `${__dirname}/views`, {
      overwrite: true,
      errorOnExist: false
    }),
    fs.copy(`${path.join(__dirname, `../package.json`)}`, `${__dirname}/package.json`, {
      overwrite: true,
      errorOnExist: false
    })]).then((data) => {
    console.log('静态资源复制成功------>')
  }).catch((error) => {
    console.log(error)
  })
}

export function clearStaticResource() {
  schedule.scheduleJob('0 0 0 * * *', () => {
    fs.emptyDir(`${CONFIG.STATIC.dir}/${CONFIG.DIR.cacheDir}`, () => {
      console.log("文件夹清空成功...")
    })
  })
}