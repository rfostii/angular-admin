(function() {
  'use strict';

  angular.module('admin.permissions')
    .directive('userItem', userItemDirective);

  function userItemDirective() {
    return {
      restrict: 'E',
      scope: {
          user: '='
        },
        controller: 'userItemCtrl',
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
