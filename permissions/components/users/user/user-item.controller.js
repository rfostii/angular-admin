(function() {
  'use strict';

  angular.module('admin.permissions')
    .controller('userItemCtrl', UserItemCtrl);

  function UserItemCtrl() {
    var vm = this;

    vm.showListOfAllowedFactories = showListOfAllowedFactories;


    //////////////////////////////////////////////

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
