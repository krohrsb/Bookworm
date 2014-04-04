/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 3/14/14 3:22 PM
 */
var path = require('path');
var argv = require('minimist')(process.argv.slice(2));
var prod = argv.production;
var gulp = require('gulp');
var runSequence = require('run-sequence');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var header = require('gulp-header');
var jshint = require('gulp-jshint');
var clean = require('gulp-clean');
var bower = require('gulp-bower-files');
var imagemin = require('gulp-imagemin');
var gulpif = require('gulp-if');
var stylus = require('gulp-stylus');
var nodemon = require('gulp-nodemon');
var bump = require('gulp-bump');

var pkg = require('./package.json');

var banner = ['/**',
    ' * ${pkg.name} - ${pkg.description}',
    ' * @version v${pkg.version}',
    ' * @link ${pkg.homepage}',
    ' * @license ${pkg.license}',
    ' */'].join('\n');

var paths = {
    src: {
        client: {
            scripts: ['src/client/js/**/*.js'],
            stylus: ['src/client/css/*.styl'],
            images: ['src/client/img/**'],
            favicon: ['src/client/misc/favicon.ico']
        },
        app: ['bin/*.js', 'src/**/*.js', '!src/client/**'],
        swagger: ['node_modules/swagger-ui/dist/**']
    },
    dest: {
        build: 'build/',
        client: {
            stylus: 'build/client/css/',
            scripts: 'build/client/js/',
            components: 'build/client/components/',
            images: 'build/client/img/',
            favicon: 'build/client/'
        },
        swagger: 'build/swagger/'
    }
};
/**
 * Linting Related Tasks
 */

gulp.task('lint:client', function () {
    return gulp.src(paths.src.client.scripts)
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('lint:app', function () {
    return gulp.src(paths.src.app)
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('lint', ['lint:client', 'lint:app']);

/**
 * Client related tasks
 */
gulp.task('scripts', function () {
    return gulp.src(paths.src.client.scripts)
        .pipe(gulpif(prod, uglify()))
        .pipe(concat(pkg.name + ((prod ? '.min.js': '.js'))))
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest(paths.dest.client.scripts));
});

gulp.task('stylus', function () {
    var options = {};
    if (prod) {
        options.set = ['compress'];
    }
    return gulp.src(paths.src.client.stylus)
        .pipe(stylus(options))
        .pipe(concat(pkg.name + ((prod ? '.min.css': '.css'))))
        .pipe(gulp.dest(paths.dest.client.stylus));
});

gulp.task('images', function () {
    return gulp.src(paths.src.client.images)
        .pipe(imagemin({optimizationLevel: 5}))
        .pipe(gulp.dest(paths.dest.client.images));
});

gulp.task('favicon', function () {
    return gulp.src(paths.src.client.favicon)
        .pipe(gulp.dest(paths.dest.client.favicon));
});

gulp.task('components', function () {
    return bower().pipe(gulp.dest(paths.dest.client.components));
});

gulp.task('client', ['scripts', 'stylus', 'images', 'favicon', 'components']);

/**
 * Misc Tasks
 */
gulp.task('clean', function () {
    return gulp.src(paths.dest.build, {read: false})
        .pipe(clean());
});

gulp.task('swagger', function () {
    return gulp.src(paths.src.swagger)
        .pipe(gulp.dest(paths.dest.swagger));
});

gulp.task('watch', function () {
    gulp.watch(paths.src.client.scripts, ['lint:client', 'scripts']);
    gulp.watch(paths.src.client.stylus, ['stylus']);
    gulp.watch(paths.src.client.images, ['images']);
});

gulp.task('server', ['watch'], function () {
    nodemon({
        script: 'bin/bookworm.js',
        watch: 'src/',
        ignore: 'src/client/',
        env: { 'NODE_ENV': (prod) ? 'production' : 'development'},
        ext: 'js',
        delay: '2.5',
        debug: argv.debug
    })
    .on('change', ['lint:app']);
});

gulp.task('bump', function () {
    gulp.src(['./bower.json', 'package.json'])
    .pipe(bump({type: argv.type || 'patch'}))
    .pipe(gulp.dest('./'));
});


gulp.task('default', function (next) {
    runSequence('clean', 'lint', ['client', 'swagger'], next);
});