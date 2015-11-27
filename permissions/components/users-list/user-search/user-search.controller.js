(function() {
  'use strict';

  angular.module('admin.permissions')
    .controller('userSearchCtrl', UserSearchCtrl);

  UserSearchCtrl.$inject = ['$scope'];

  function UserSearchCtrl($scope) {
    var vm = this;
  }
})();
