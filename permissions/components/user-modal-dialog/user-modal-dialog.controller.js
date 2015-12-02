(function() {
  'use strict';

  angular.module('userModalDialog')
    .controller('userModalDialogCtrl', UserModalDialogCtrl);

    UserModalDialogCtrl.$inject = ['$scope', '$q', 'usersService', 'permissionsService'];

    function UserModalDialogCtrl($scope, $q, usersService, permissionsService) {
      var vm = this;
      var selectedPemissionsAreas = [];

      if (!vm.user) {
        vm.user = {};
        vm.isNewUser = true;
      }

      vm.saveUser = saveUser;
      vm.lookupInActiveDirectory = lookupInActiveDirectory;

      init();
      /////////////////////////////////////////////

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

      function lookupInActiveDirectory(cai){
        usersService.lookupInActiveDirectory(cai).then(function(name) {
          vm.user.name = name;
        })
      }

      function cleanForm() {
        if (vm.isNewUser) {
          vm.user = {};
          vm.user.permissions = $.extend(true, [], vm.permissions);
        }
      }

      function saveUser() {
        if (vm.permissionsForm.$valid) {
          $scope.$emit('validFormData');
          usersService.saveUser($.extend(true, {}, vm.user)).then(function(user) {
            if (!vm.isNewUser) {
                vm.user = user;
            }
          });
          cleanForm();
        } else {
          $scope.$emit('invalidFormData');
        }
      }
    }
})();
