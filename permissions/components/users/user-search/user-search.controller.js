(function() {
  'use strict';

  angular.module('admin.permissions')
    .controller('userSearchCtrl', UserSearchCtrl);

  UserSearchCtrl.$inject = ['$scope'];

  function UserSearchCtrl($scope) {
    var vm = this;

    vm.searchQuery = '';
    vm.handleSearchInput = handleSearchInput;

    $scope.$watch('userSearch.searchQuery', handleSearchInput);

    //////////////////////////////////////

    function handleSearchInput(query) {
      $scope.$parent.$broadcast('searchUser', query);
    }
  }
})();
