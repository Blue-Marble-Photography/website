var autoprefixer = require('autoprefixer');
var browserSync = require('browser-sync').create();
var changed = require('gulp-changed');
var cleancss = require('gulp-clean-css');
var concat = require('gulp-concat');
var cp = require('child_process');
var del = require('del');
var gulp = require('gulp');
var gzip = require('gulp-gzip');
var log = require('fancy-log');
var ngrok = require('ngrok');
var postcss = require('gulp-postcss');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var rev = require('gulp-rev');
var revRewrite = require('gulp-rev-rewrite');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');

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
    .src([paths.jsFilesGlob])
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

function buildImages() {
  return gulp
    .src(paths.imageFilesGlob)
    .pipe(gulp.dest(paths.jekyllImageFiles))
    .pipe(gulp.dest(paths.siteImageFiles))
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

function cleanImages() {
  return del([paths.jekyllImageFiles, paths.siteImageFiles], {
    force: true
  });
}

gulp.task(
  'clean',
  gulp.parallel('clean:styles', 'clean:scripts', cleanFonts, cleanFavicons, cleanImages, 'clean:site')
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
  return cp.spawn('s3_website', ['push'], { stdio: 'inherit' });
}

var build = gulp.series(
  'clean',
  gulp.parallel(
    'build:scripts:main',
    'build:styles:main',
    buildFavicons,
    buildFonts,
    buildImages
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
  gulp.watch('_config.yml', gulp.series('build:jekyll:dev', reload));
  gulp.watch([paths.sassFilesGlob], gulp.series(gulp.parallel('build:styles:main'), reload));
  gulp.watch([paths.jsFilesGlob], gulp.series(gulp.parallel('build:scripts:main'), reload));
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
  gulp.series(ngrokConnect, buildSiteUrl, build, 'build:jekyll:dev', rewriteRev, serve, watch)
);

// Production build task
gulp.task(
  'deploy',
  gulp.series(
    build,
    'build:jekyll:prod',
    rewriteRev,
    gulp.parallel(compressScripts, compressStyles),
    deployAWS
  )
);
