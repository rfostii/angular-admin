(function() {
  'use strict';

  angular.module('admin.permissions')
    .controller('usersCtrl', UsersCtrl);

  UsersCtrl.$inject = ['usersService'];

  function UsersCtrl(usersService) {
    var vm = this;

    vm.users = usersService.users;

    init();

    function init() {
        return usersService.fetchUsers().then(function(users) {
            vm.users = users;
            return users;
        });
    }
  }
})();
