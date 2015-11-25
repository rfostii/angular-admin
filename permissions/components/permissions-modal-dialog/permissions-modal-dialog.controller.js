(function() {
  'use strict';

  angular.module('admin.permissions')
    .controller('permissionsModalDialogCtrl', PermissionsModalDialogCtrl);
})();

PermissionsModalDialogCtrl.$inject = ['usersService'];

function PermissionsModalDialogCtrl(usersService) {
  var vm = this;

  if (!vm.user.permissions) {
    vm.user.permissions = [];
  }
  vm.userPermissions = [];

  vm.saveUserData = saveUserData;
  vm.showFactory = showFactory;
  vm.isAreaSelected = isAreaSelected;

  init();
  /////////////////////////////////////////////

  function showFactory(permission) {
    return permission.active && permission.areas.length > 0;
  }

  function isAreaSelected(userPermissions, permission) {
    if (!userPermissions) {
      return;
    }
    return userPermissions.some(function(permissionItem) {
      if (permissionItem === permission.id) {
        permission.selected = true;
        return true;
      }
    });
  }

  function saveUserData() {
    if (vm.userForm.$valid) {
      vm.user.permissions = vm.permissions.reduce(function(store, permission) {
          if (permission.selected) {
            store.push(permission.id);
          }
          return store;
      }, []);
      usersService.saveUser(vm.user);
    }
  }

  function init() {
    return usersService.getPermissions().then(function(response) {
      vm.permissions = response.data;
    });
  }
}
