import * as puppeteer from 'puppeteer'
import CONFIG from '../config'

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
            resolve();
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
  await autoScroll(page)
  // //等待三秒，目的是让页面有时间渲染完成
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
        resolve()
        clearInterval(timer)
      }
      if (count > 20) {
        resolve()
        clearInterval(timer)
      }
    }, 3000)
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
  const browser = await puppeteer.launch()
  try {
    const page = await browser.newPage()
    await page.setViewport({
      width: m.width || 375,
      height: 812,
      deviceScaleFactor: 2,
      isMobile: m.isMobile
    })
    await page.setUserAgent(m.userAgent)
    await page.goto(m.url, {
      timeout: 120000,
      waitUntil: 'networkidle0'
    })
    //设置监听
    await setPageWaiter(page)
    //开始截图
    console.log("开始截图..")
    await page.screenshot({
      path: `${imgUrl}/${m.fileName}`,
      type: 'png',
      fullPage: true,
    })
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