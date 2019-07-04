import * as path from 'path'

export default {
  PORT: '3033',
  REDIS:{

  },
  DB: {
    username: "root",
    password: "123456",
    database: "rms",
    host: '127.0.0.1',
    port: 3306,
    dialect: "mysql",
    define: {
      paranoid: true,
      freezeTableName: true,
    }
  },
  DIR: {
    cacheDir:'cache_img',
    fileDir:'files'
  },
  STATIC:{
    prefix:'/snapshot/static',
    dir:path.join(__dirname, 'public')
  },
  VIEW:{
    dir:path.join(__dirname, 'views')
  },
  DOMAIN: 'http://127.0.0.1:3033'
}