(function() {
  'use strict';

  angular.module('admin.permissions')
    .controller('permissionsModalDialogCtrl', PermissionsModalDialogCtrl);
})();

PermissionsModalDialogCtrl.$inject = ['$scope', '$q', 'usersService', 'permissionsService'];

function PermissionsModalDialogCtrl($scope, $q, usersService, permissionsService) {
  var vm = this;

  if (!vm.user) {
    vm.user = {};
    vm.isNewUser = true;
  }
  vm.saveUser = saveUser;

  init();
  /////////////////////////////////////////////

  function cleanForm() {
    vm.user.firstname = '';
    vm.user.lastname = '';
  }

  function saveUser() {
    if (vm.permissionsForm.$valid) {
      $scope.$emit('validFormData');
      usersService.saveUser(vm.user);
      cleanForm();
    } else {
      $scope.$emit('invalidFormData');
    }
  }

  function init() {
    return $q.all([
      permissionsService.fetchPermissions(),
      permissionsService.fetchAreas()
    ]).then(function(response) {
      vm.permissions = response[0];
      if (!vm.user.permissions) {
        vm.user.permissions = vm.permissions;
      }
      vm.areas = response[1];
    });
  }
}
