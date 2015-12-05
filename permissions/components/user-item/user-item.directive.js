
(function() {
  'use strict';

  angular.module('admin.permissions.userItem.userItemDirective', [
    'admin.permissions.userItem.userItemCtrl',
    'admin.permissions.userItem.highlightMatchesFilter',
    'admin.permissions.common.checklistModelDirective'
  ]).directive('userItem', userItemDirective);

  function userItemDirective() {
    return {
      restrict: 'E',
      scope: {
          user: '=',
          searchQuery: '=?'
        },
        controller: 'userItemCtrl',
        controllerAs: 'userItem',
        bindToController: true,
        templateUrl: 'components/user-item/user-item.template.html',
        link: link
    };

    ///////////////////////////////////

    function link($scope, $el, $attr) {

    }
  }
})();