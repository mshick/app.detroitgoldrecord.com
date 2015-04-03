var Path = require('path'),
    Util = require('util'),
    Gulp = require('gulp'),
    Gutil = require('gulp-util'),
    Less = require('gulp-less'),
    Rename = require('gulp-rename'),
    Plumber = require('gulp-plumber'),
    If = require('gulp-if'),
    Browserify = require('gulp-browserify'),
    Imagemin = require('gulp-imagemin'),
    Uglify = require('gulp-uglify'),
    BrowserSync = require('browser-sync'),
    Reload = BrowserSync.reload,
    Del = require('del'),
    Config = require('./config.json').development;

var devel = false,
    reload = false;

var staticPath = Path.resolve(Config.static.path),
    jsPath = Path.join(staticPath, 'js'),
    cssPath = Path.join(staticPath, 'css'),
    imgPath = Path.join(staticPath, 'img');

var onError = function (err) {
    Gutil.beep();
    Gutil.log(err.message);
    this.emit('end');
};

Gulp.task('clean', function (done) {
    Del([
        jsPath,
        cssPath,
        imgPath
    ], done);
});

Gulp.task('images', function () {
    var out = imgPath;

    return Gulp.src('./images/**/*')
        .pipe(Plumber({errorHandler: onError}))
        .pipe(Imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }]
        }))
        .pipe(Gulp.dest(out));
});

Gulp.task('scripts', function () {
    var out = jsPath;

    return Gulp.src('./scripts/main.js')
        .pipe(Plumber({errorHandler: onError}))
        .pipe(Browserify({
            debug: true
        }))
        // Add transformation tasks to the pipeline here.
        .pipe(Rename('app.js'))
        .pipe(If(!devel, Uglify()))
        .pipe(Gulp.dest(out))
        .pipe(If(reload, Reload({
            stream: true
        })));
});

Gulp.task('styles', function () {
    var out = cssPath;

    return Gulp.src('./styles/main.less')
        .pipe(Plumber({errorHandler: onError}))
        .pipe(Less())
        .pipe(Rename('app.css'))
        .pipe(Gulp.dest(out))
        .pipe(If(reload, Reload({
            stream: true
        })));
});

Gulp.task('iframe-scripts', function () {
    var out = jsPath;

    return Gulp.src('./scripts/iframe.js')
        .pipe(Plumber({errorHandler: onError}))
        .pipe(Browserify({
            debug: true
        }))
        // Add transformation tasks to the pipeline here.
        .pipe(Rename('iframe.js'))
        .pipe(If(!devel, Uglify()))
        .pipe(Gulp.dest(out))
        .pipe(If(reload, Reload({
            stream: true
        })));
});

Gulp.task('iframe-styles', function () {
    var out = cssPath;

    return Gulp.src('./styles/iframe.less')
        .pipe(Plumber({errorHandler: onError}))
        .pipe(Less())
        .pipe(Rename('iframe.css'))
        .pipe(Gulp.dest(out))
        .pipe(If(reload, Reload({
            stream: true
        })));
});

Gulp.task('browser-sync', function () {
    var host = process.env.HOST || Config.server.host,
        port = process.env.PORT || Config.server.port;

    BrowserSync({
        host: 'localhost',
        proxy: Util.format('%s:%s', host, port),
        port: 8080,
        browser: 'google chrome',
        open: 'local',
        online: false,
        notify: false
    });
});

Gulp.task('build', ['clean', 'images', 'styles', 'scripts']);

Gulp.task('build:devel', ['images', 'iframe-styles', 'styles', 'iframe-scripts', 'scripts'], function () {
    devel = true;
});

Gulp.task('devel', ['build:devel', 'browser-sync'], function () {
    reload = true;
    Gulp.watch('images/**/*', ['images']);
    // Gulp.watch('styles/**/*.less', ['styles', 'ifame-styles']);
    Gulp.watch('styles/**/*.less', ['iframe-styles']);
    // Gulp.watch('scripts/**/*.js', ['scripts']);
    Gulp.watch('scripts/**/*.js', ['iframe-scripts']);
});

Gulp.task('default', ['devel']);
