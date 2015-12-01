(function() {
  'use strict';

  angular.module('admin.permissions.components.usersList.userListDirective', [])
    .directive('usersList', userListDirective);

  function userListDirective() {
    return {
          restrict: 'E',
          scope: {
            users: '='
          },
          controller: 'usersController',
          controllerAs: 'usersList',
          templateUrl: 'permissions/components/users-list/users-list.template.html',
          bindToController: true,
          link: link
    };

    /////////////////////////////////////////////

    function link($scope, $el, $attr) {

    }
  }
})();
