var gulp = require('gulp');
var concat = require('gulp-concat');
var browserSync = require('browser-sync').create();
var sourcemaps = require('gulp-sourcemaps');


gulp.task('build', function() {
  return gulp.src('./permissions/**/*.js')
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

gulp.task('dev', ['build', 'build-styles'], function() {
	browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    gulp.watch('./permissions/**/*.js', ['build']).on("change", browserSync.reload);
    gulp.watch('./permissions/**/*.css', ['build-styles']).on("change", browserSync.reload);
});
