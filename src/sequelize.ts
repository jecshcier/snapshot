import {Sequelize} from 'sequelize-typescript'
import * as Glob from 'glob'
import CONFIG from './config'
import * as util from "util"

const glob = util.promisify(Glob)


const options = Object.assign(CONFIG.DB, {
  modelPaths: [__dirname + '/models/**/*.model.js']
})

const sequelize = new Sequelize(options)
sequelize.sync().then(() => {
  console.log("同步完成....")
})

export default sequelize