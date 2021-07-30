const { src, dest, task, series, watch, parallel }  = require('gulp')
const rm           = require('gulp-rm')
const sass         = require('gulp-sass')(require('sass'))
const concat       = require('gulp-concat')
const browserSync  = require('browser-sync').create()
const reload       = browserSync.reload
const autoprefixer = require('gulp-autoprefixer')
const gcmq         = require('gulp-group-css-media-queries')
const cleanCss     = require('gulp-clean-css')
const sourcemaps   = require('gulp-sourcemaps')
const babel        = require('gulp-babel')
const uglify       = require('gulp-uglify')
const svgo         = require('gulp-svgo')
const svgSprite    = require('gulp-svg-sprite')
const gulpIf       = require('gulp-if')
const webp         = require('gulp-webp')
const imagemin     = require('gulp-imagemin')
const env          = process.env.NODE_ENV
const fs           = require('fs')
    
const SRC_PATH = 'src'
const DIST_PATH = 'build'
const STYLES_LIBS = []
const JS_LIBS = []

task('create:dirs', () => {
    return src('*.*', {read: false})
        .pipe(dest(`./${DIST_PATH}`))
        .pipe(dest(`./${SRC_PATH}/img`))
        .pipe(dest(`./${SRC_PATH}/svg`))
        .pipe(dest(`./${SRC_PATH}/icons`))
        .pipe(dest(`./${SRC_PATH}/fonts`))
        .pipe(dest(`./${SRC_PATH}/js`))
        .pipe(dest(`./${SRC_PATH}/scss`))
        .pipe(dest(`./${SRC_PATH}/scss/blocks`))
})

const files = [
    `./${SRC_PATH}/index.html`,
    `./${SRC_PATH}/scss/style.scss`,
    `./${SRC_PATH}/scss/_core.scss`,
    `./${SRC_PATH}/scss/_fonts.scss`,
    `./${SRC_PATH}/scss/_mixins.scss`,
    `./${SRC_PATH}/scss/_reset.scss`,
    `./${SRC_PATH}/scss/_variables.scss`,
]

task('create:files', () => {
    files.forEach(filepath => {
        fs.open(filepath, 'w', (err) => {})
    })
})

task('clean', () => {
    return src([
        `${DIST_PATH}/**/*`, 
        `!${DIST_PATH}/img/**/*`,
        `!${DIST_PATH}/fonts/**/*`,
        `!${DIST_PATH}/icons/**/*`,
        `!${DIST_PATH}/svg/**/*`,
    ], {read: false})
        .pipe(rm())
})

task('clean:all', () => {
    return src([
        `${DIST_PATH}/**/*`
    ], {read: false})
        .pipe(rm())
})

task('copy:html', () => {
    return src(`${SRC_PATH}/*.html`)
        .pipe(dest(`${DIST_PATH}`))
        .pipe(reload({stream: true}))
})

task('copy:fonts', () => {
    return src(`${SRC_PATH}/fonts/**/*`)
        .pipe(dest(`${DIST_PATH}/fonts`))
})

task('copy:icons', () => {
    return src(`${SRC_PATH}/icons/**/*`)
        .pipe(dest(`${DIST_PATH}/icons`))
})

task('copy:css', () => {
    return src([...STYLES_LIBS])
        .pipe(dest(`${DIST_PATH}/css`))
})

task('scss', () => {
    return src(`${SRC_PATH}/scss/style.scss`)
        .pipe(gulpIf(env === 'dev', sourcemaps.init()))
        .pipe(concat('style.min.scss'))
        .pipe(sass().on('error', sass.logError))
        .pipe(gulpIf(env === 'prod', autoprefixer({
            browsers: ['last 2 versions'],
            cascade: true
        })))
        .pipe(gulpIf(env === 'prod', gcmq()))
        .pipe(gulpIf(env === 'prod', cleanCss()))
        .pipe(gulpIf(env === 'dev', sourcemaps.write()))
        .pipe(dest(`${DIST_PATH}/css`))
        .pipe(reload({stream: true}))
})

task('copy:js', () => {
    return src([...JS_LIBS])
        .pipe(dest(`${DIST_PATH}/js`))
})

task('js', () => {
    return src(`${SRC_PATH}/js/*.js`)
        .pipe(gulpIf(env === 'dev', sourcemaps.init()))
        .pipe(concat('main.min.js', {newLine: ';'}))
        // .pipe(gulpIf(env === 'prod', babel({
        //     presets: ["@babel/env"]
        // })))
        .pipe(gulpIf(env === 'prod', uglify()))
        .pipe(gulpIf(env === 'dev', sourcemaps.write()))
        .pipe(dest(`${DIST_PATH}/js`))
        .pipe(reload({stream: true}))
})

task('img', () => {
    return src(`${SRC_PATH}/img/**/*.{png,jpg,jpeg}`)
        .pipe(imagemin())
        .pipe(dest(`${DIST_PATH}/img`))
})

task('img:webp', () => {
    return src(`${SRC_PATH}/img/**/*.{png,jpg,jpeg}`)
        .pipe(webp())
        .pipe(dest(`${DIST_PATH}/img`))
})

task('img:svg', () => {
    return src(`${SRC_PATH}/svg/*.svg`)
        .pipe(svgo({
            plugins: [
                {
                    removeAttrs: {
                        attrs: "(fill|stroke|style|width|data.*)"
                    }
                }
            ]
        }))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "../sprite.svg"
                }
            }
        }))
        .pipe(dest(`${DIST_PATH}/icons`))
})

task('server', () => {
    browserSync.init({
        server: {
            baseDir: `./${DIST_PATH}`
        },
        open: false
    })
})

task('watch', () => {
    watch(`./${SRC_PATH}/scss/**/*.scss`, series('scss'))
    watch(`./${SRC_PATH}/js/**/*.js`, series('js'))
    watch(`./${SRC_PATH}/*.html`, series('copy:html'))
})

task('static',
    series(
        'clean:all',
        parallel(
            'img', 
            'img:webp',
            'img:svg', 
            'copy:fonts', 
            'copy:icons', 
            'copy:js'
        )
    )
)

task('default', 
    series(
        'clean', 
        parallel(
            'copy:html', 
            'scss', 
            'js', 
        ), 
        parallel('watch', 'server')
    )
)

task('build', 
    series(
        'clean', 
        parallel(
            'copy:html', 
            'scss', 
            // 'copy:js',
            'js', 
            'img', 
            'img:webp', 
            'copy:fonts', 
            'copy:icons' 
        )
    ) 
)
