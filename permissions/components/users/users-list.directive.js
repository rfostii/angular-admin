(function() {
  'use strict';

  angular.module('admin.permissions')
    .directive('usersList', userListDirective);

  function userListDirective() {
    return {
          restrict: 'E',
          scope: {
              users: '='
            },
            controller: 'usersCtrl',
            controllerAs: 'usersList',
            templateUrl: 'permissions/components/users/users-list.template.html',
            bindToController: true,
            link: link
    };

    /////////////////////////////////////////////

    function link($scope, $el, $attr) {

    }
  }
})();
