(function() {
  'use strict';

  angular.module('admin.permissions.components.usersList.usersSorting.usersSortingController', [])
    .controller('usersSortingController', UsersSortingController);

  UsersSortingController.$inject = ['$scope'];

  function UsersSortingController($scope) {
    var vm = this;

    vm.selectField = selectField
    vm.changeReverseMode = changeReverseMode;

    function changeReverseMode() {
      vm.sortInReverseMode = !vm.sortInReverseMode;
    }

    function selectField(field) {
        vm.selectedField = field;
    }
  }
})();
