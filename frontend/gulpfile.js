var gulp = require('gulp');
var webserver = require('gulp-webserver');
var mainBowerFiles = require('main-bower-files');
var inject =require('gulp-inject');

var paths = {
  temp: 'temp',
  tempIndex: 'app/index.html',
  tempVendor: 'temp/vendor',
  appSrc: ['app/**/*.js', '!app/index.html' ],
  bowerSrc: 'bower_components/**/*',
}

gulp.task('default', ['watch']);

gulp.task('watch', ['serve'], function() {
  gulp.watch(paths.appSrc, ['copyAll']);
  gulp.watch(paths.bowerSrc, ['vendors']);
  gulp.watch(paths.bowerSrc, ['copyAll']);
})

gulp.task('serve', ['copyAll'], function() {
  return gulp.src(paths.temp)
      .pipe(webserver({
        livereload: true,
        proxies: [{
          source: '/api',
          target: 'http://localhost:1337'
        }]
      }));

});


gulp.task('copyAll', function() {
  var tempVendors = gulp.src(mainBowerFiles()).pipe(gulp.dest(paths.tempVendor));
  var appFiles = gulp.src(paths.appSrc).pipe(gulp.dest(paths.temp));

  var tempIndex = gulp.src(paths.tempIndex).pipe(gulp.dest(paths.temp));



  tempIndex.pipe(inject(appFiles, {
    relative:true
  })).pipe(inject(tempVendors,{
    relative:true, name: 'vendorInject'
  })).pipe(gulp.dest(paths.temp))

})
