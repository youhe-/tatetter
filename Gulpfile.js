var gulp         = require('gulp');
var htmlhint     = require("gulp-htmlhint");
var sass         = require('gulp-ruby-sass');
var minifyCSS    = require('gulp-minify-css');
var coffeeScript = require('gulp-coffee');
var typeScript   = require('gulp-typescript');
var uglify       = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');
var concat       = require('gulp-concat');
var rename       = require('gulp-rename');
var plumber      = require('gulp-plumber');
var notify       = require('gulp-notify');
var imagemin     = require('gulp-imagemin');
var sprite       = require('gulp.spritesmith');
var browserSync  = require('browser-sync');

/**************************************
  config
  パスや設定の記述
  基本的にここしか編集しない
**************************************/
var public_pass = './public/',
  src_pass = './src/';
  path = {
    htmlhint   : src_pass + '.htmlhintrc',
    sass       : src_pass + 'sass/',
    typeScript : src_pass + 'ts/',
    sprite     : src_pass + 'sprite/',
    html       : public_pass,
    css        : public_pass + 'css/',
    js         : public_pass + 'js/',
    img        : public_pass + 'img/',
    proxy      : 'localhost:8888',
  },
  prefixBrowsers = ['last 4 versions'];
var type = {
  main: [
    path.typeScript + 'main.ts'
  ]
};

/**************************************
  js sass img の圧縮タスク
**************************************/
gulp.task('min', function() {
  gulp.src([path.js+'*.js', '!'+path.js+'lib/*.js'])
    .pipe(plumber({
        errorHandler: notify.onError('Error: &lt;%= error.message %&gt;')
    }))
    .pipe(uglify())
    .pipe(gulp.dest(path.js));

  gulp.src([path.css+'*.css', '!'+path.css+'lib/*.css'])
    .pipe(minifyCSS())
    .pipe(gulp.dest(path.css));

  gulp.src(path.img+'**/*')
    .pipe(imagemin())
    .pipe(gulp.dest(path.img));
});

/**************************************
  sprite画像生成タスク
**************************************/
gulp.task('sprite',function() {
  var spriteOptions = {
    imgName: 'sprite.png',
		imgPath: path.img+'sprite.png',
    cssName: '_sprite.scss',
		padding: 10
  }
  var spriteData = gulp.src(path.sprite+'*.png')
    .pipe(sprite(spriteOptions));
  spriteData.css
    .pipe(gulp.dest(path.sass+'/base/'));
  spriteData.img
    .pipe(gulp.dest(path.img));
});

/**************************************
  html コンパイルタスク
**************************************/
gulp.task('html', function() {
	gulp.src([
			root+'**/*.html',
			root+'**/*.php',
			'!'+root+'/_docs/*.html'
		])
		.pipe(plumber({
			errorHandler: notify.onError('Error: <%= error.message %>;')
		}))
		.pipe(htmlhint(path.htmlhint))
		.pipe(htmlhint.reporter());
});

/**************************************
  sass コンパイルタスク
**************************************/
gulp.task('sass',function(){
  sass(path.sass,{
    style           : 'expanded',
    'sourcemap=none': true,
    compass         : true
  })
  .pipe(autoprefixer({
    browsers: prefixBrowsers
  }))
  .pipe(minifyCSS())
  .pipe(gulp.dest(path.css));
});

/**************************************
  coffeeScript コンパイルタスク
**************************************/
gulp.task('coffee', function() {
  for (key in coffee) {
    val = coffee[key];
    gulp.src(val)
      .pipe(plumber({
      	errorHandler: notify.onError('Error: <%= error.message %>;')
      }))
      .pipe(concat(key+'.coffee'))
      .pipe(coffeeScript())
      .pipe(uglify())
      .pipe(gulp.dest(path.js));
  }
});

/**************************************
  typeScript コンパイルタスク
**************************************/
gulp.task('type', function() {
	for (key in type) {
    var op = typeScript.createProject({
      out: key+'.js',
      target:'es5',
      removeComments: true
    });
    val = type[key];
    gulp.src(val)
      .pipe(plumber({
      	errorHandler: notify.onError('Error: <%= error.message %>;')
      }))
      .pipe(concat(key+'.ts'))
      .pipe(typeScript())
      .pipe(uglify())
      .pipe(gulp.dest(path.js));
  }
});

/**************************************
  ブラウザの更新タスク
**************************************/
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: root
    }
  });
});
gulp.task('browser-sync_y', function() {
  browserSync({
    proxy: path.proxy,
    ghostMode: {
      location: true
    }
  });
});

/**************************************
  watch　タスク
**************************************/
gulp.task('watch',function(){
  gulp.watch(path.html+'**/*.html',['html']);
  gulp.watch(path.sass+'**/*.scss',['sass']);
  gulp.watch(path.coffee+'**/*',['coffee']);
  gulp.watch(path.typeScript+'**/*',['type']);

  gulp.watch([path.html+'**/*.html',path.html+'**/*.php'], function(event){
    gulp.src([path.html+'*.html', path.html+'**/*.php'])
      .pipe(browserSync.reload({stream: true}));
  });
  gulp.watch(path.css+'*.css', function(event){
    gulp.src([path.css+'*.css'])
      .pipe(browserSync.reload({stream: true}));
  });
});

/**************************************
  実行タスク
**************************************/
gulp.task('default', ['watch', 'browser-sync']);
gulp.task('y', ['watch', 'browser-sync_y']);
