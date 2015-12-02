
(function() {
  'use strict';

  angular.module('userItem')
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
        templateUrl: 'components/users-list/user-item/user-item.template.html',
        link: link
    };

    ///////////////////////////////////

    function link($scope, $el, $attr) {

    }
  }
})();
