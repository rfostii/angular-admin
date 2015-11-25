(function() {
  'use strict';

  angular.module('admin.permissions')
    .controller('permissionsModalDialogCtrl', PermissionsModalDialogCtrl);
})();

PermissionsModalDialogCtrl.$inject = ['$q', 'usersService', 'permissionsService'];

function PermissionsModalDialogCtrl($q, usersService, permissionsService) {
  var vm = this;  
    
  vm.saveUserData = saveUserData;

  init();
  /////////////////////////////////////////////

  function saveUserData() {        
    usersService.saveUser(vm.user);
  }

  function init() {
    return $q.all([
      permissionsService.fetchPermissions(),
      permissionsService.fetchAreas()  
    ]).then(function(response) {
      vm.permissions = response[0];    
      vm.areas = response[1];      
    });    
  }
}
