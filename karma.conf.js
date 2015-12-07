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
      moduleName: 'admin.permissions.templates'
    },

    ngJson2JsPreprocessor: {
      stripPrefix: 'test-data/'
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
      "./libs/jquery.min.js",
      "./libs/bootstrap/js/bootstrap.min.js",
      "./libs/angular.min.js",
      "./libs/angular-mocks.js",
      './permissions/common/*.js',
      './permissions/services/**/*.js',
      './permissions/components/user-modal-dialog/user-modal-dialog.controller.js',
      './permissions/components/user-modal-dialog/user-modal-dialog.directive.js',
      './permissions/components/user-modal-dialog/user-modal-dialog.js',
      './permissions/components/user-item/user-item.controller.js',
      './permissions/components/user-item/highlight-matches.filter.js',
      './permissions/components/user-item/user-item.directive.js',
      './permissions/components/user-item/user-item.js',
      './permissions/components/users-list/filter-users-by-query.filter.js',
      './permissions/components/users-list/users-list.controller.js',
      './permissions/components/users-list/user-search.directive.js',
      './permissions/components/users-list/users-list.directive.js',
      './permissions/components/users-list/users-list.js',
      './permissions/components/**/*.js',
      './permissions/*.js',
      './permissions/**/*.template.html',
      './test-data/*.js',
      './permissions/**/*.spec.js'
    ],

    phantomjsLauncher: {
      // Have phantomjs exit if a ResourceError is encountered (useful if karma exits without killing phantom)
      exitOnResourceError: true
    }
  });
};
