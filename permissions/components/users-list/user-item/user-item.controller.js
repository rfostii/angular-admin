(function() {
  'use strict';

  angular.module('admin.permissions.components.usersList.userItem.userItemController', [])
    .controller('userItemController', UserItemController);

  UserItemController.$inject = ['usersService'];

  function UserItemController(usersService) {
    var vm = this;

    vm.showListOfAllowedFactories = showListOfAllowedFactories;
    vm.saveUser = saveUser;


    //////////////////////////////////////////////

    function saveUser(user) {
      usersService.saveUser(user).then(function(user) {
        vm.user = user;
      });
    }

    function showListOfAllowedFactories() {
      return vm.user.permissions.reduce(function(store, permission) {
          if (permission.allowed === "true") {
              return store.concat(permission.areas);
          }
          return store;
      }, []).join(',');
    }
  }
})();
