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
    //make a copy to avoid affect user permissions on list of all permisisons
    vm.user.permissions = $.extend(true, [], vm.permissions);
  }

  function saveUser() {
    if (vm.permissionsForm.$valid) {
      $scope.$emit('validFormData');
      usersService.saveUser($.extend({}, vm.user));
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
        //make a copy to avoid affect user permissions on list of all permisisons
        vm.user.permissions = $.extend(true, [], vm.permissions);
      }
      vm.areas = response[1];
    });
  }
}
