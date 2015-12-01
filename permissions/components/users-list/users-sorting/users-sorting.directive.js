(function() {
  'use strict';

  angular.module('admin.permissions.components.usersList.usersSorting.usersSortingDirective', [])
    .directive('usersSorting', usersSortingDirective);

  function usersSortingDirective() {
    return {
          restrict: 'E',
          scope: {
            sortInReverseMode: '=',
            fields: '=',
            selectedField: '='
          },
          controller: 'usersSortingController',
          controllerAs: 'usersSorting',
          templateUrl: 'permissions/components/users-list/users-sorting/users-sorting.template.html',
          bindToController: true,
          link: link
    };

    /////////////////////////////////////////////

    function link($scope, $el, $attr) {

    }
  }
})();
