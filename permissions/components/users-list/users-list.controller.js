(function() {
  'use strict';

  angular.module('admin.permissions.components.usersList.usersController', [])
    .controller('usersController', UsersController);

  UsersController.$inject = ['$scope', '$filter','usersService'];

  function UsersController($scope, $filter, usersService) {
    var vm = this;

    vm.searchQuery = '';
    vm.sortInReverseMode = false;
    vm.fields = ['name', 'cai', 'active'];
    vm.selectedField = vm.fields[0];
    vm.users = usersService.users;
    vm.getListOfUsers = getListOfUsers;

    init();

    /////////////////////////////////////

    function getListOfUsers() {
        return $filter('usersListFilter')(vm.users, vm.searchQuery);
    }

    function init() {
        return usersService.fetchUsers().then(function(users) {
            vm.users = users;
            return users;
        });
    }
  }
})();
