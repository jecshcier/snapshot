## 截长图服务端

### 能够根据以下方式截取网页长图
- 屏幕大小
- UA

### 使用方式
通过`yarn`安装依赖
再用`npm run build`打包出compress文件夹，该文件夹为可用服务包。

### 部署
进入compress文件夹，通过`yarn`安装依赖。
`npm run task`创建文件夹监听（包含创建缓存文件夹、定时删除缓存文件）
`npm start`开启截长图服务
配置文件通过config.js可以修改

### 测试地址
http://127.0.0.1:3033/snapshshot
