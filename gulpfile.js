const gulp = require('gulp')
const ts = require('gulp-typescript')
const uglify = require("gulp-uglify")
const babel = require('gulp-babel')
const fs = require('fs-extra')
const path = require('path')
const tsProject = ts.createProject('tsconfig.json')

const copyViews = async () => {
  try {
    console.log("复制静态资源....")
    await fs.copy(path.join(__dirname, 'src/views'), path.join(__dirname, 'compress/views'))
  } catch (err) {
    console.log(err)
  }
}

const buildTs = () => {
  return tsProject.src()
    .pipe(tsProject()).js
    .pipe(babel({
      presets: ['@babel/preset-env'],
      plugins: [
        ["@babel/proposal-class-properties", {"spec": true}],
        ["@babel/plugin-transform-runtime"]
      ]
    }))
    // .pipe(uglify({
    //   compress: {
    //     drop_debugger: true,
    //     drop_console: true
    //   }
    // }))
    .pipe(gulp.dest('compress'))
}

exports.default = gulp.series(copyViews, buildTs)