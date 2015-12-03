var gulp = require('gulp');
var concat = require('gulp-concat');
var browserSync = require('browser-sync').create();
var sourcemaps = require('gulp-sourcemaps');
var karma = require('karma').Server;
var ngTemplates = require('gulp-ng-templates');


gulp.task('build', function() {
  return gulp.src([
      '!./permissions/**/*.spec.js',
      './permissions/common/*.js',
      './permissions/services/**/*.js',
      './permissions/components/user-modal-dialog/user-modal-dialog.controller.js',
      './permissions/components/user-modal-dialog/user-modal-dialog.directive.js',
      './permissions/components/user-modal-dialog/user-modal-dialog.js',
      './permissions/components/users-list/user-item/user-item.controller.js',
      './permissions/components/users-list/user-item/user-item.directive.js',
      './permissions/components/users-list/user-item/user-item.js',
      './permissions/components/users-list/filter-users-by-query.filter.js',
      './permissions/components/users-list/users-list.controller.js',
      './permissions/components/users-list/user-search.directive.js',
      './permissions/components/users-list/users-list.directive.js',
      './permissions/components/users-list/users-list.js',
      './permissions/components/**/*.js',
      './permissions/*.js',
    ])
    .pipe(sourcemaps.init())
    .pipe(concat('bundle.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('build-styles', function() {
  return gulp.src('./permissions/**/*.css')
    .pipe(sourcemaps.init())
    .pipe(concat('style.css'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('test', function (done) {
  return karma.start({
    configFile: __dirname + '/karma.conf.js',
    action: 'watch',
    showStack: true
    //singleRun: true
  }, function() {
    done();
  });
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('tdd', function (done) {
  return karma.start({
    configFile: __dirname + '/karma.conf.js',
    autoWatch: true
  }, function() {
    done();
  });
});

gulp.task('build-templates', function () {
    return gulp.src('./permissions/**/*.template.html')
        .pipe(ngTemplates({
          standalone: true,
          module: 'admin.permissions.templates',
          filename: 'admin.permissions.templates.js'
        }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('dev', ['build', 'build-templates', 'build-styles'], function() {
	browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    gulp.watch('./permissions/**/*.js', ['build']).on("change", browserSync.reload);
    gulp.watch('./permissions/**/*.css', ['build-styles']).on("change", browserSync.reload);
    gulp.watch('./permissions/**/*.template.html', ['build-templates']).on("change", browserSync.reload);
});
