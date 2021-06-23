const gulp = require('gulp')
const ts = require('gulp-typescript')
const uglify = require("gulp-uglify")
const fs = require('fs-extra')
const path = require('path')
const tsProject = ts.createProject('tsconfig.json')

const copyViews = async () => {
  try {
    console.log("复制静态资源....")
    await Promise.all([
      fs.copy(path.join(__dirname, 'src/views'), path.join(__dirname, 'compress/views')),
      fs.copy(path.join(__dirname, 'package.json'), path.join(__dirname, 'compress/package.json'))
    ])
  } catch (err) {
    console.log(err)
  }
}

const buildTs = () => {
  return tsProject.src()
    .pipe(tsProject()).js
    .pipe(uglify({
      compress: {
        drop_debugger: true,
        drop_console: true
      }
    }))
    .pipe(gulp.dest('compress'))
}

exports.default = gulp.series(copyViews, buildTs)