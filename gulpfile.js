const gulp = require("gulp");
const ts = require("gulp-typescript");
const through2 = require("through2");
const taro = require("./codemod/taro");
const jscodeshift = require("jscodeshift");

const { src, dest } = gulp;

function transform() {
  return through2.obj(function (file, _, cb) {
    const out = taro(
      { path: file.path, source: file.contents.toString() },
      { jscodeshift }
    );

    file.contents = Buffer.from(out);
    cb(null, file);
  });
}

function buildTaro(cb) {
  const tsProject = ts.createProject("tsconfig.json", {
    rootDir: ".cache/taro",
    outDir: "./taro",
  });
  src("src/**/*.{tsx,ts}")
    .pipe(transform())
    .pipe(dest(".cache/taro"))
    .pipe(src(".cache/**/*.{tsx,ts}"))
    .pipe(tsProject())
    .pipe(dest("dist/"));
  cb();
}

exports.taro = gulp.series(buildTaro);
