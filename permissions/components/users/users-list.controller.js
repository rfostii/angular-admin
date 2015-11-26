(function() {
  'use strict';

  angular.module('admin.permissions')
    .controller('usersCtrl', UsersCtrl);

  UsersCtrl.$inject = ['$scope', '$filter','usersService'];

  function UsersCtrl($scope, $filter, usersService) {
    var vm = this;

    vm.filterQuery = '';
    vm.orderBy = '';
    vm.users = usersService.users;
    vm.getListOfUsers = getListOfUsers;

    $scope.$on('searchUser', function(event, query) {
      vm.filterQuery = query;
    });

    $scope.$on('orderUsers', function(event, orderBy) {
      vm.orderBy = orderBy;
    });

    init();

    /////////////////////////////////////

    function getListOfUsers() {
        return $filter('usersListFilter')(vm.users, vm.filterQuery);
    }

    function init() {
        return usersService.fetchUsers().then(function(users) {
            vm.users = users;
            return users;
        });
    }
  }
})();
