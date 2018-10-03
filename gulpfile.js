var autoprefixer = require('autoprefixer');
var browserSync = require('browser-sync').create();
var changed = require('gulp-changed');
var cleancss = require('gulp-clean-css');
var concat = require('gulp-concat');
var cp = require('child_process');
var critical = require('critical');
var del = require('del');
var fs = require('fs');
var gulp = require('gulp');
var gzip = require('gulp-gzip');
var imagemin = require('gulp-imagemin');
var log = require('fancy-log');
var mozjpeg = require('imagemin-mozjpeg');
var ngrok = require('ngrok');
var postcss = require('gulp-postcss');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var responsive = require('gulp-responsive');
var rev = require('gulp-rev');
var revRewrite = require('gulp-rev-rewrite');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var uncss = require('postcss-uncss');
var webp = require('imagemin-webp');

var paths = require('./_assets/gulp/paths.js');
var platform = process.platform === 'win32' ? 'win' : 'mac';

gulp.task('build:styles:main', function() {
  return gulp
    .src([paths.sassFilesGlob])
    .pipe(
      sass({
        outputStyle: 'compressed'
      })
    )
    .pipe(
      postcss([
        autoprefixer({
          browsers: ['last 2 versions']
        })
      ])
    )
    .pipe(
      cleancss({
        level: {
          1: {
            specialComments: 0
          }
        },
        inline: ['all']
      })
    )
    .pipe(concat('main.css'))
    .pipe(rev())
    .pipe(gulp.dest(paths.jekyllCssFiles))
    .pipe(gulp.dest(paths.siteCssFiles))
    .pipe(
      rev.manifest(paths.gulpFiles + '/rev-manifest.json', {
        base: paths.gulpFiles,
        merge: true
      })
    )
    .pipe(gulp.dest(paths.gulpFiles))
    .pipe(browserSync.stream());
});

gulp.task('build:styles:fancybox', function() {
  return gulp
    .src([paths.fancyboxCssFiles])
    .pipe(
      sass({
        outputStyle: 'compressed'
      })
    )
    .pipe(
      postcss([
        autoprefixer({
          browsers: ['last 2 versions']
        })
      ])
    )
    .pipe(
      cleancss({
        level: {
          1: {
            specialComments: 0
          }
        },
        inline: ['all']
      })
    )
    .pipe(concat('fancybox.css'))
    .pipe(rev())
    .pipe(gulp.dest(paths.jekyllCssFiles))
    .pipe(gulp.dest(paths.siteCssFiles))
    .pipe(
      rev.manifest(paths.gulpFiles + '/rev-manifest.json', {
        base: paths.gulpFiles,
        merge: true
      })
    )
    .pipe(gulp.dest(paths.gulpFiles))
    .pipe(browserSync.stream());
});

function buildStylesCritical() {
  var json = JSON.parse(fs.readFileSync(paths.gulpFiles + '/rev-manifest.json'));

  return critical.generate({
    base: '_site/',
    src: 'index.html', // Extract critical path CSS for index.html
    css: [paths.jekyllCssFiles + '/' + json['main.css']],
    dest: '../_includes/css/critical.css',
    minify: true,
    include: [/^\.no-webp/],
    ignore: ['@font-face']
  });
}

function buildStylesUnCss() {
  var json = JSON.parse(fs.readFileSync(paths.gulpFiles + '/rev-manifest.json'));

  return gulp
    .src(paths.siteCssFiles + '/' + json['main.css'])
    .pipe(
      postcss([
        uncss({
          html: ['./_site/**/*.html'],
          htmlroot: paths.siteDir,
          ignore: [
            /\w\.in/,
            '.fade',
            '.collapse',
            '.collapsing',
            /(#|\.)navbar(\-[a-zA-Z]+)?/,
            /(#|\.)dropdown(\-[a-zA-Z]+)?/,
            /(#|\.)(open)/,
            /\.popover/,
            '.modal',
            '.modal.fade.in',
            '.modal-dialog',
            '.modal-document',
            '.modal-scrollbar-measure',
            '.modal-backdrop.fade',
            '.modal-backdrop.in',
            '.modal.fade.modal-dialog',
            '.modal.in.modal-dialog',
            '.modal-open',
            '.in',
            '.modal-backdrop',
            '.float-right',
            '.no-webp'
          ]
        })
      ])
    )
    .pipe(gulp.dest(paths.jekyllCssFiles))
    .pipe(gulp.dest(paths.siteCssFiles))
    .pipe(browserSync.stream())
    .on('error', log.error);
}

function compressStyles() {
  return gulp
    .src(paths.jekyllCssFiles + '/*.css')
    .pipe(
      gzip({
        append: false
      })
    )
    .pipe(gulp.dest(paths.jekyllCssFiles))
    .pipe(gulp.dest(paths.siteCssFiles));
}

gulp.task('build:scripts:main', function() {
  return gulp
    .src([
      paths.jqueryJsFiles,
      paths.popperJsFiles,
      paths.bootstrapJsFiles,
      paths.fancyboxJsFiles,
      paths.instafeedJsFiles,
      paths.jsFilesGlob
    ])
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest(paths.jekyllJsFiles))
    .pipe(gulp.dest(paths.siteJsFiles))
    .pipe(
      rev.manifest(paths.gulpFiles + '/rev-manifest.json', {
        base: paths.gulpFiles,
        merge: true
      })
    )
    .pipe(gulp.dest(paths.gulpFiles))
    .pipe(browserSync.stream());
});

function compressScripts() {
  return gulp
    .src(paths.jekyllJsFiles + '/*.js')
    .pipe(
      gzip({
        append: false
      })
    )
    .pipe(gulp.dest(paths.jekyllJsFiles))
    .pipe(gulp.dest(paths.siteJsFiles));
}

function buildSitePngImages() {
  return gulp
    .src([paths.imagePngFilesGlob, paths.excludeOriginalPhotoFilesGlob])
    .pipe(changed(paths.jekyllImageFiles))
    .pipe(
      responsive(
        {
          '**/*.png': [
            {
              quality: 100
            }
          ]
        },
        {
          withoutEnlargement: true,
          skipOnEnlargement: false,
          errorOnEnlargement: false,
          errorOnUnusedConfig: false,
          errorOnUnusedImage: false,
          progressive: false,
          compressionLevel: 0,
          quality: 100
        }
      )
    )
    .pipe(
      imagemin(
        [
          imagemin.optipng({
            optimizationLevel: 5
          })
        ],
        {
          progressive: true,
          verbose: true
        }
      )
    )
    .pipe(gulp.dest(paths.jekyllImageFiles))
    .pipe(gulp.dest(paths.siteImageFiles))
    .pipe(
      imagemin(
        [
          webp({
            method: 6
          })
        ],
        {
          progressive: true,
          verbose: true
        }
      )
    )
    .pipe(
      rename({
        extname: '.webp'
      })
    )
    .pipe(gulp.dest(paths.jekyllImageFiles))
    .pipe(gulp.dest(paths.siteImageFiles))
    .pipe(browserSync.stream());
}

function buildSiteImages() {
  return gulp
    .src([paths.imageFilesGlob, paths.excludeOriginalPhotoFilesGlob])
    .pipe(
      changed(paths.jekyllImageFiles, {
        extension: '-2880.jpg'
      })
    )
    .pipe(
      responsive(
        {
          '**/*.jpg': [
            {
              width: 400,
              rename: {
                suffix: '-400'
              }
            },
            {
              width: 750,
              rename: {
                suffix: '-750'
              }
            },
            {
              width: 1100,
              rename: {
                suffix: '-1100'
              }
            },
            {
              width: 1440,
              rename: {
                suffix: '-1440'
              }
            },
            {
              width: 1600,
              rename: {
                suffix: '-1600'
              }
            },
            {
              width: 2880,
              rename: {
                suffix: '-2880'
              }
            }
          ]
        },
        {
          withoutEnlargement: true,
          skipOnEnlargement: false,
          errorOnEnlargement: false,
          errorOnUnusedConfig: false,
          errorOnUnusedImage: false,
          progressive: false,
          compressionLevel: 0,
          quality: 100
        }
      )
    )
    .pipe(
      imagemin(
        [
          imagemin.gifsicle({
            interlaced: true
          }),
          imagemin.svgo({
            plugins: [
              {
                removeDesc: true
              }
            ]
          }),
          mozjpeg({
            quality: 70,
            progressive: true
          })
        ],
        {
          progressive: true,
          verbose: true
        }
      )
    )
    .pipe(gulp.dest(paths.jekyllImageFiles))
    .pipe(gulp.dest(paths.siteImageFiles))
    .pipe(
      imagemin(
        [
          webp({
            method: 6
          })
        ],
        {
          progressive: true,
          verbose: true
        }
      )
    )
    .pipe(
      rename({
        extname: '.webp'
      })
    )
    .pipe(gulp.dest(paths.jekyllImageFiles))
    .pipe(gulp.dest(paths.siteImageFiles))
    .pipe(browserSync.stream());
}

function buildOriginalPhotos() {
  return gulp
    .src(paths.originalPhotoFilesGlob)
    .pipe(changed(paths.jekyllOriginalPhotoFiles))
    .pipe(gulp.dest(paths.jekyllOriginalPhotoFiles))
    .pipe(gulp.dest(paths.siteOriginalPhotoFiles))
    .pipe(browserSync.stream());
}

function buildFavicons() {
  return gulp
    .src(paths.faviconFilesGlob)
    .pipe(gulp.dest(paths.jekyllFaviconFiles))
    .pipe(gulp.dest(paths.siteFaviconFiles))
    .pipe(browserSync.stream());
}

function buildFonts() {
  return gulp
    .src(paths.fontFilesGlob)
    .pipe(
      rename(function(path) {
        path.dirname = '';
      })
    )
    .pipe(gulp.dest(paths.jekyllFontFiles))
    .pipe(gulp.dest(paths.siteFontFiles))
    .pipe(browserSync.stream());
}

gulp.task('clean:styles', function() {
  return del([paths.jekyllCssFiles + '/*.css', paths.siteCssFiles + '/*.css'], {
    force: true
  });
});

gulp.task('clean:scripts', function() {
  return del([paths.jekyllJsFiles + '/*.js', paths.siteJsFiles + '/*.js'], {
    force: true
  });
});

gulp.task('clean:site', function() {
  return del([paths.siteDir], {
    force: true
  });
});

function cleanFonts() {
  return del([paths.jekyllFontFiles, paths.siteFontFiles], {
    force: true
  });
}

function cleanFavicons() {
  return del([paths.jekyllFaviconFiles, paths.siteFaviconFiles], {
    force: true
  });
}

gulp.task(
  'clean',
  gulp.parallel('clean:styles', 'clean:scripts', cleanFonts, cleanFavicons, 'clean:site')
);

function rewriteRev() {
  var manifest = gulp.src('./_assets/gulp/rev-manifest.json');

  return gulp
    .src(paths.siteHtmlFilesGlob)
    .pipe(
      revRewrite({
        manifest
      })
    )
    .pipe(gulp.dest(paths.siteDir));
}

gulp.task('build:jekyll:dev', function() {
  return cp.exec('bundle exec jekyll build --destination ' + paths.siteDir);
});

gulp.task('build:jekyll:prod', function() {
  return cp.exec('JEKYLL_ENV=prod bundle exec jekyll build --destination ' + paths.siteDir);
});

function deployAWS() {
  return cp.spawn('s3_website', ['push'], {
    stdio: 'inherit'
  });
}

var build = gulp.series(
  'clean',
  gulp.parallel(
    'build:scripts:main',
    'build:styles:main',
    'build:styles:fancybox',
    buildSitePngImages,
    buildSiteImages,
    buildOriginalPhotos,
    buildFavicons,
    buildFonts
  )
);

async function ngrokConnect() {
  if (platform === 'win') {
    url = 'http://localhost:3000';
  } else {
    url = await ngrok.connect(3000);
  }
}

function buildSiteUrl() {
  return gulp
    .src('_config.yml', {
      cwd: '.'
    })
    .pipe(replace(/^url\:\s\"(.*)\"$/m, 'url: "' + url + '"'))
    .pipe(gulp.dest('.'));
}

function serve(done) {
  browserSync.init({
    server: {
      baseDir: paths.siteDir
    },
    ghostMode: false,
    open: false,
    notify: false
  });

  log('ngrok forwarding: ' + url);

  done();
}

function reload(done) {
  browserSync.reload();
  done();
}

function watch() {
  gulp.watch(
    paths.imageFilesGlob,
    gulp.series(gulp.parallel(buildSitePngImages, buildSiteImages, buildOriginalPhotos), reload)
  );
  gulp.watch('_config.yml', gulp.series('build:jekyll:dev', reload));
  gulp.watch(
    [paths.bootstrapSassFiles, paths.sassFilesGlob],
    gulp.series(gulp.parallel('build:styles:main', 'build:styles:fancybox'), reload)
  );
  gulp.watch(
    [paths.bootstrapJsFiles, paths.jqueryJsFiles, paths.popperJsFiles, paths.jsFilesGlob],
    gulp.series(gulp.parallel('build:scripts:main'), reload)
  );
  gulp.watch(
    [paths.jekyllPostFilesGlob, paths.jekyllDraftFilesGlob],
    gulp.series('build:jekyll:dev', reload)
  );
  gulp.watch(
    ['**/*.html', paths.jekyllDataFilesGlob, '!_site/**/*.*'],
    gulp.series('build:jekyll:dev', reload)
  );
}

// Default Task: builds site.
gulp.task(
  'default',
  gulp.series(
    ngrokConnect,
    buildSiteUrl,
    build,
    'build:jekyll:dev',
    rewriteRev,
    buildStylesCritical,
    buildStylesUnCss,
    serve,
    watch
  )
);

// Production build task
gulp.task(
  'deploy',
  gulp.series(
    build,
    'build:jekyll:prod',
    rewriteRev,
    buildStylesUnCss,
    gulp.parallel(compressScripts, compressStyles),
    deployAWS
  )
);
