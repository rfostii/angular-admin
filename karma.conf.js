module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],

    frameworks: ['jasmine'],

    plugins: [
     'karma-jasmine',
     'karma-phantomjs-launcher',
     'karma-spec-reporter',
     'karma-ng-html2js-preprocessor'
    ],

    preprocessors: {
      './permissions/**/*.template.html': ['ng-html2js']
    },

    ngHtml2JsPreprocessor: {
      stripPrefix: 'permissions/',
      moduleName: 'admin.permissions.templates'
    },

    reporters: ['spec'],

    specReporter: {
        maxLogLines: 5,         // limit number of lines logged per test
        suppressErrorSummary: false,  // do not print error summary
        suppressFailed: false,  // do not print information about failed tests
        suppressPassed: false,  // do not print information about passed tests
        suppressSkipped: false  // do not print information about skipped tests
      },

    logLevel: config.LOG_INFO,

    colors: true,

    files: [
      "./bower_components/jquery/dist/jquery.min.js",
      "./bower_components/bootstrap/dist/js/bootstrap.min.js",
      "./bower_components/angular/angular.min.js",
      "./bower_components/angular-mocks/angular-mocks.js",
      './permissions/common/*.js',
      './permissions/services/**/*.js',
      './permissions/components/user-modal-dialog/user-modal-dialog.js',
      './permissions/components/user-modal-dialog/user-modal-dialog.controller.js',
      './permissions/components/user-modal-dialog/user-modal-dialog.directive.js',
      './permissions/components/users-list/user-item/user-item.js',
      './permissions/components/users-list/user-item/user-item.controller.js',
      './permissions/components/users-list/user-item/user-item.directive.js',
      './permissions/components/users-list/users-sorting/users-sorting.js',
      './permissions/components/users-list/users-sorting/users-sorting.controller.js',
      './permissions/components/users-list/users-sorting/users-sorting.directive.js',
      './permissions/components/users-list/users-list.js',
      './permissions/components/users-list/users-list.filter.js',
      './permissions/components/users-list/users-list.controller.js',
      './permissions/components/users-list/user-search.directive.js',
      './permissions/components/users-list/users-list.directive.js',
      './permissions/components/**/*.js',
      './permissions/*.js',
      './permissions/**/*.spec.js',
      './permissions/**/*.template.html'
    ],

    phantomjsLauncher: {
      // Have phantomjs exit if a ResourceError is encountered (useful if karma exits without killing phantom)
      exitOnResourceError: true
    }
  });
};
