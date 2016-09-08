var version = '2.1.9', 
    gulp = require('gulp'),
    pkg = require('gulp-packages')(gulp, [
        'autoprefixer',
        'cache',
        'minify-css',
        'minify-html',
        'imagemin',
        'rename',
        'rev',
        'rev-replace',
        'less',
        'uglify',
        'file-includ'
    ]),
    Q = require('q'),
    del = require('del'),
    manifest = 'manifest.json';
function rev(stream) {
    return stream
        .pipe(pkg.rev())
        .pipe(pkg.rename(function (file) {
            file.basename = file.basename.replace(/dashboard-/g, "");
        }))
        .pipe(gulp.dest(version))
        /*.pipe(pkg.rename(function (file) {
            file.extname += '?rev=' + String(new Date().getTime());
        }))*/
        .pipe(pkg.rev.manifest(manifest, {
            merge: true
        }))
        .pipe(gulp.dest(version))
}
gulp.task('del-dist',function () {
    return del([
        version
    ])
});

//打包src
gulp.task('build-dist', ['del-dist'], function () {
    var deferredCss = Q.defer(),
        deferredHtml = Q.defer(),
        deferredJs = Q.defer(),
        deferredImg = Q.defer(),
        //img
        img = gulp.src('src/img/*', {
            base: './src'
        })
            .pipe(pkg.cache(pkg.imagemin({
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
            })))
            .pipe(gulp.dest(version))
            .on('finish', deferredImg.resolve),

        //css
        css = gulp.src('src/style/*.less', {
            base: './src'
        })
            .pipe(pkg.less())
            .pipe(pkg.autoprefixer({
                browsers: ['last 2 versions']
            }))
            .pipe(pkg.minifyCss())
            /*.pipe(pkg.rename({
                suffix: '.min'
            }))*/
            .pipe(gulp.dest(version))
            .on('finish', deferredCss.resolve),

        //html
        html = gulp.src('src/*.html', {
            base: './src'
        })
            .pipe(pkg.minifyHtml({
                empty: true,
                cdata: true,
                conditionals: true,
                spare: true,
                quotes: true
            }))
            /*.pipe(pkg.rename({
                suffix: '.min'
            }))*/
            .pipe(gulp.dest(version))
            .on('finish', deferredHtml.resolve),
        //js
        js = gulp.src('src/script/*.js', {
            base: './src'
        })
            .pipe(pkg.uglify()) //不混淆变量-mangle
            
            .pipe(gulp.dest(version))
            .on('finish', deferredJs.resolve);

    return Q.all([deferredImg.promise, deferredCss.promise, deferredHtml.promise, deferredJs.promise]);
});

//生成hash值
gulp.task('rev-dist', ['build-dist'], function () {
    return rev(gulp.src([version + '/script/*.js', version + '/style/*.css'], {
        base: version
    }))
});

//替换引用文件的hash
gulp.task('dist', ['rev-dist'], function () {
    var deferred = Q.defer();
    gulp.src([version + '/*.html'], {
        base: version
    })
        .pipe(pkg.revReplace({
            manifest: gulp.src(version + '/' + manifest)
        }))
        .pipe(gulp.dest(version))
        .on('finish', deferred.resolve);
    return deferred.promise;
});
gulp.task('default', ['dist']);

/*
 gulp.task('watchFile', function() {
 return gulp.watch('src/!*.*',['dist']);
 });*/
