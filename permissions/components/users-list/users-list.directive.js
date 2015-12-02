(function() {
  'use strict';

  angular.module('usersList')
    .directive('usersList', userListDirective);

  function userListDirective() {
    return {
          restrict: 'E',
          scope: {
            users: '='
          },
          controller: 'usersCtrl',
          controllerAs: 'usersList',
          templateUrl: 'components/users-list/users-list.template.html',
          bindToController: true,
          link: link
    };

    /////////////////////////////////////////////

    function link($scope, $el, $attr) {

    }
  }
})();
