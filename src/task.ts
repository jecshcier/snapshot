import CONFIG from './config'
import * as fs from 'fs-extra'
import * as path from "path"
import * as schedule from 'node-schedule'

export function createStaticResource() {

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

export function clearStaticResource() {
  schedule.scheduleJob('0 0 0 * * *', () => {
    fs.emptyDir(`${CONFIG.STATIC.dir}/${CONFIG.DIR.cacheDir}`, () => {
      console.log("文件夹清空成功...")
    })
  })
}