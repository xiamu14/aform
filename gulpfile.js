var gulp = require("gulp");
var postcss = require("gulp-postcss");
var sourcemaps = require("gulp-sourcemaps");
var cssnano = require("cssnano");
// var ts = require("gulp-typescript");

function defaultTask(cb) {
  gulp
    .src("src/**/*.css")
    .pipe(gulp.dest("dist"))
    .pipe(sourcemaps.init())
    .pipe(
      postcss([
        cssnano(),
      ])
    )
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist/"));
  // place code for your default task here
  cb();
}

exports.watch = function watch(cb) {
  gulp.watch("src/**/*.css", defaultTask);
};

exports.default = defaultTask;
