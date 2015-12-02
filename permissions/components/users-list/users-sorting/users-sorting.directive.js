(function() {
  'use strict';

  angular.module('admin.permissions.usersSorting.usersSortingDirective', [
    'admin.permissions.usersSorting.usersSortingCtrl'
  ]).directive('usersSorting', usersSortingDirective);

  function usersSortingDirective() {
    return {
          restrict: 'E',
          scope: {
            sortInReverseMode: '=',
            fields: '=',
            selectedField: '='
          },
          controller: 'usersSortingCtrl',
          controllerAs: 'usersSorting',
          templateUrl: 'components/users-list/users-sorting/users-sorting.template.html',
          bindToController: true,
          link: link
    };

    /////////////////////////////////////////////

    function link($scope, $el, $attr) {

    }
  }
})();
