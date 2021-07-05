import * as puppeteer from 'puppeteer'
import CONFIG from '../config'
import * as fs from "fs-extra";
import * as sharp from 'sharp'

const imgUrl = `${CONFIG.STATIC.dir}/${CONFIG.DIR.cacheDir}`

const sleep = async (time: number) => {
  return new Promise((resolve: any, reject: any) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

const autoScroll = async (page: any) => {
  console.log("start....")
  return page.evaluate(() => {
    return new Promise((resolve: any, reject: any) => {
      //针对图片懒加载
      //先抓到所有懒加载的图片，对它进行一次加载
      //再监听图片加载事件，完成时进行屏幕滚动
      let imgArr = Array.from(document.querySelectorAll('img'))
      let srcImgArr: Array<any> = []
      imgArr.forEach((el, index) => {
        const src = el.getAttribute('data-src')
        if (src) {
          srcImgArr.push(el)
        }
      })
      if (!srcImgArr.length) {
        startInterval()
        return false
      }
      let loadImgCount = 0
      srcImgArr.forEach((el, index) => {
        const src = el.getAttribute('data-src')
        //如果30秒还没加载完/无响应，则自动认为加载完成
        let timer = setTimeout(() => {
          loadImgCount++
        }, 30000)
        el.onload = function () {
          clearTimeout(timer)
          console.log('load....')
          loadImgCount++
          console.log(loadImgCount)
          console.log(srcImgArr.length)
          if (loadImgCount === srcImgArr.length) {
            startInterval()
          }
        }
        el.onerror = function () {
          clearTimeout(timer)
          loadImgCount++
        }
        el.src = src
      })

      function startInterval() {
        //滚动的总高度
        let totalHeight = 0;
        const distance = window.screen.height;
        const scrollHeight = document.body.scrollHeight
        const maxHeight = scrollHeight - window.screen.height

        const timer = setInterval(() => {
          // 滚动条向下滚动distance
          window.scrollBy(0, distance);
          totalHeight += distance;
          console.log(maxHeight)
          console.log(totalHeight)
          // 当滚动的总高度 大于 页面高度 说明滚到底了。
          if (totalHeight >= maxHeight) {
            window.scrollTo(0, 0);
            resolve(scrollHeight);
            clearInterval(timer);
          }
        }, 500);
      }
    })
  })
}

const setPageWaiter = async (page: any) => {
  page.on('console', (msg: any) => {
    for (let i = 0; i < msg.args().length; ++i)
      console.log(`${i}: ${msg.args()[i]}`);
  });
  let requestCount = 0
  let requestFinishedCount = 0
  let requestErrorCount = 0
  page.on('request', () => {
    requestCount++
    console.log(`request - ${requestCount}`)
  })
  page.on('requestfinished', () => {
    requestFinishedCount++
    console.log(`requestfinished - ${requestFinishedCount}`)
  })
  page.on('requestfailed', () => {
    requestErrorCount++
    console.log(`requestfailed - ${requestErrorCount}`)
  })
  let height = await autoScroll(page)
  // //等待三秒，目的是让页面有时间渲染=完成
  console.log("页面滚动底，再等3秒")
  await sleep(3000)
  return new Promise(async (resolve, reject) => {
    let count = 0
    let timer = setInterval(() => {
      count++
      console.log(`第${count}次确认..`)
      console.log(`当前request${requestCount}`)
      console.log(`当前requestFinishedCount${requestFinishedCount}`)
      console.log(`当前requestErrorCount${requestErrorCount}`)
      //当请求都成功时
      if ((requestCount !== 0) && (requestCount === (requestFinishedCount + requestErrorCount))) {
        resolve(height)
        clearInterval(timer)
      }
      if (count > 20) {
        resolve(height)
        clearInterval(timer)
      }
    }, 3000)
  })
}

//利用sharp将截图合成
const createLongImage = async (width: number, height: number, imageList: Array<any>, fileUrl: string) => {
  return new Promise((resolve, reject) => {
    console.log(width)
    console.log(height)
    sharp({
      create: {
        width,
        height,
        channels: 4,
        background: {r: 255, g: 255, b: 255, alpha: 1}
      }
    }).composite(imageList).toFile(fileUrl)
      .then(() => {
        console.log("ok......")
        resolve()
      }).catch((err) => {
      console.log(err)
    })
  })
}


process.on('message', async (m: any) => {
  setTimeout(() => {
    //300秒后进程自动释放
    process.send({
      flag: false,
      err: 'err'
    })
    process.exit(0)
  }, 300000)
  console.log(m)
  const viewPortHeight = 812
  const browser = await puppeteer.launch()
  try {
    const page = await browser.newPage()
    await page.setViewport({
      width: m.width || 375,
      height: viewPortHeight,
      deviceScaleFactor: 2,
      isMobile: m.isMobile
    })
    await page.setUserAgent(m.userAgent)
    await page.goto(m.url, {
      timeout: 120000,
      waitUntil: 'networkidle0'
    })
    //设置监听
    let pageHeight: any = await setPageWaiter(page)
    //开始截图
    let imageArr: Array<any> = []
    console.log(`页面高度 - ${pageHeight}`)
    const fileUrl = `${imgUrl}/${m.fileName}.png`
    const fileDirUrl = `${imgUrl}/${m.fileName}`
    //如果页面高度小于视口高度，则直接以页面高度截图
    if (pageHeight < viewPortHeight) {
      console.log(`共1张截图`)
      console.log(`开始截图...`)
      await page.screenshot({
        path: fileUrl,
        type: 'png',
        clip: {
          x: 0,
          y: 0,
          width: m.width || 375,
          height: pageHeight
        }
      })
    } else {
      await fs.ensureDir(fileDirUrl)
      const shotCount = Math.floor(pageHeight / viewPortHeight)
      const lastShotHeight = pageHeight % viewPortHeight
      console.log(`共${shotCount + 1}张截图`)
      console.log(`末张高${lastShotHeight}..`)
      console.log("开始截图..")
      for (let i = 0; i < shotCount; i++) {
        console.log(`第${i + 1}张截图...`)
        await page.screenshot({
          path: `${fileDirUrl}/${m.fileName}${i}.png`,
          type: 'png',
          clip: {
            x: 0,
            y: i * (viewPortHeight),
            width: m.width || 375,
            height: viewPortHeight
          }
        })
        imageArr.push({
          input: `${fileDirUrl}/${m.fileName}${i}.png`,
          top: 2 * i * (viewPortHeight),
          left: 0
        })
      }
      await page.screenshot({
        path: `${fileDirUrl}/${m.fileName}${shotCount}.png`,
        type: 'png',
        clip: {
          x: 0,
          y: shotCount * (viewPortHeight),
          width: m.width || 375,
          height: lastShotHeight
        }
      })
      imageArr.push({
        input: `${fileDirUrl}/${m.fileName}${shotCount}.png`,
        top: 2 * shotCount * (viewPortHeight),
        left: 0
      })
      console.log(imageArr)
      await createLongImage(2 * m.width || 375, 2 * pageHeight, imageArr, fileUrl)
    }
    console.log("截图完成..")
    process.send({
      flag: true
    })
    process.exit(0)
  } catch (err) {
    console.log(err)
    process.send({
      flag: false,
      err: err
    })
    process.exit(0)
  }
  await browser.close()
})