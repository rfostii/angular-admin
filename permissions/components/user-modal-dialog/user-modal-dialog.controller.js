(function() {
  'use strict';

  angular.module('admin.permissions')
    .controller('userModalDialogCtrl', UserModalDialogCtrl);
})();

UserModalDialogCtrl.$inject = ['$scope', '$q', 'usersService', 'permissionsService'];

function UserModalDialogCtrl($scope, $q, usersService, permissionsService) {
  var vm = this;

  if (!vm.user) {
    vm.user = {};
    vm.isNewUser = true;
  }
  vm.saveUser = saveUser;
  vm.addArea = addArea;

  init();
  /////////////////////////////////////////////

  function cleanForm() {
    if (vm.isNewUser) {
      vm.user = {};
      vm.user.permissions = $.extend(true, [], vm.permissions);
    }
  }

  function saveUser() {
    if (vm.permissionsForm.$valid) {
      $scope.$emit('validFormData');
      usersService.saveUser($.extend(true, {}, vm.user));
      cleanForm();
    } else {
      $scope.$emit('invalidFormData');
    }
  }

  function addArea() {
    
  }

  function init() {
    return $q.all([
      permissionsService.fetchPermissions(),
      permissionsService.fetchAreas()
    ]).then(function(response) {
      vm.permissions = response[0];
      if (!vm.user.permissions) {
        vm.user.permissions = $.extend(true, [], vm.permissions);
      }
      vm.areas = response[1];
    });
  }
}
