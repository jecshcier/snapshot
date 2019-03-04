import * as puppeteer from 'puppeteer'
import CONFIG from '../config'
const imgUrl = `${CONFIG.STATIC.dir}/${CONFIG.DIR.cacheDir}`

process.on('message', async (m) => {
  console.log(m)
  const browser = await puppeteer.launch()
  try {
    const page = await browser.newPage()
    await page.goto(m.url,{
      timeout:120000,
      waitUntil:'networkidle0'
    })
    const height = await page.$$eval('body', el => el[0].scrollHeight)
    await page.setViewport({
      width:800,
      height:height
    })
    await page.goto(m.url,{
      timeout:120000,
      waitUntil:'networkidle0'
    })
    await page.screenshot({
      path: `${imgUrl}/${m.fileName}`,
      type: 'png',
      fullPage: true,
    })
    process.send({
      flag: true
    })
  } catch (err) {
    console.log(err)
    process.send({
      flag: false,
      err: err
    })
  }
  await browser.close()
})