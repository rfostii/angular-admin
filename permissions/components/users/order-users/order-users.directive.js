(function() {
  'use strict';

  angular.module('admin.permissions')
    .directive('orderUsers', sortUserDirective);

  function sortUserDirective() {
    return {
          restrict: 'E',
          scope: {},
          controller: 'orderUsersCtrl',
          controllerAs: 'orderUsers',
          templateUrl: 'permissions/components/users/order-users/order-users.template.html',
          bindToController: true,
          link: link
    };

    /////////////////////////////////////////////

    function link($scope, $el, $attr) {

    }
  }
})();
