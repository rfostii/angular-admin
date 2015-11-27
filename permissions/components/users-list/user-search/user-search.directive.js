(function() {
  'use strict';

  angular.module('admin.permissions')
    .directive('userSearch', userSearchDirective);

  function userSearchDirective() {
    return {
      restrict: 'EA',
      scope: {
        searchQuery: '='
      },
      template: '<input type="text" ng-model="userSearch.searchQuery" ng-model-options="{debounce: 300}" class="form-control" placeholder="search">',
      controller: 'userSearchCtrl',
      controllerAs: 'userSearch',
      bindToController: true,
      link: link
    };

    ///////////////////////////////////

    function link($scope, $el, $attr) {

    }
  }
})();
