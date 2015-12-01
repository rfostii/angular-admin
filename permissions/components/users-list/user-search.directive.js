(function() {
  'use strict';

  angular.module('usersList')
    .directive('userSearch', userSearchDirective);

  function userSearchDirective() {
    return {
      restrict: 'EA',
      scope: {
        searchQuery: '='
      },
      template: '<input type="text" ng-model="searchQuery" ng-model-options="{debounce: 300}" class="form-control" placeholder="search">',
      link: link
    };

    ///////////////////////////////////

    function link($scope, $el, $attr) {

    }
  }
})();
