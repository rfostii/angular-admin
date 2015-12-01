(function() {
  'use strict';

  angular.module('admin.permissions.components.usersList.userItem.userItemDirective', [])
    .directive('userItem', userItemDirective);

  function userItemDirective() {
    return {
      restrict: 'E',
      scope: {
          user: '='
        },
        controller: 'userItemController',
        controllerAs: 'userItem',
        bindToController: true,
        templateUrl: 'permissions/components/users-list/user-item/user-item.template.html',
        link: link
    };

    ///////////////////////////////////

    function link($scope, $el, $attr) {

    }
  }
})();
