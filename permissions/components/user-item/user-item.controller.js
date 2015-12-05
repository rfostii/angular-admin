(function() {
  'use strict';

  angular.module('admin.permissions.userItem.userItemCtrl', [
    'admin.permissions.services.usersService'
  ]).controller('userItemCtrl', UserItemCtrl);

  UserItemCtrl.$inject = ['usersService'];

  function UserItemCtrl(usersService) {
    var vm = this;

    vm.showListOfAllowedFactories = showListOfAllowedFactories;
    vm.saveUser = saveUser;


    //////////////////////////////////////////////

    function saveUser(user) {
      usersService.saveUser(user);
    }

    function showListOfAllowedFactories() {
      return vm.user.permissions.reduce(function(store, permission) {
          if (permission.allowed === 'true') {
              return store.concat(permission.areas);
          }
          return store;
      }, []).join(',');
    }
  }
})();
