(function() {
  'use strict';

  angular.module('admin.permissions.usersList.usersCtrl', [
    'admin.permissions.usersList.filterUsersByQuery',
    'admin.permissions.services.usersService'
  ])
    .controller('usersCtrl', UsersCtrl);

  UsersCtrl.$inject = ['$scope', '$filter','usersService'];

  function UsersCtrl($scope, $filter, usersService) {
    var vm = this;

    vm.searchQuery = '';
    vm.sortInReverseMode = false;
    vm.fields = ['name', 'cai', 'active'];
    vm.selectedField = vm.fields[0];
    vm.users = usersService.users;
    vm.getListOfUsers = getListOfUsers;
    vm.selectField = selectField
    vm.changeReverseMode = changeReverseMode;

    init();

    /////////////////////////////////////

    function changeReverseMode() {
      vm.sortInReverseMode = !vm.sortInReverseMode;
    }

    function selectField(field) {
        vm.selectedField = field;
    }

    function getListOfUsers() {
        return $filter('filterUsersByQuery')(vm.users, vm.searchQuery);
    }

    function init() {
        return usersService.fetchUsers().then(function(users) {
            vm.users = users;
            return users;
        });
    }
  }
})();
