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

    vm.changeReverseMode = changeReverseMode;
    vm.filterUsers = filterUsers;
    vm.fields = ['name', 'cai', 'active'];
    vm.users = usersService.users;
    vm.searchQuery = '';
    vm.sortInReverseMode = false;
    vm.selectedField = vm.fields[0];
    vm.selectField = selectField

    init();

    /////////////////////////////////////

    function filterUsers(searchQuery) {
      vm.users = $filter('filterUsersByQuery')(usersService.users, searchQuery);
    }

    function changeReverseMode() {
      vm.sortInReverseMode = !vm.sortInReverseMode;
    }

    function selectField(field) {
        vm.selectedField = field;
    }

    function init() {
        return usersService.fetchUsers().then(function(users) {
            vm.users = users;
            return users;
        });
    }
  }
})();
