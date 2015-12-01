(function() {
  'use strict';

  angular.module('usersSorting')
    .controller('usersSortingCtrl', UsersSortingCtrl);

  UsersSortingCtrl.$inject = ['$scope'];

  function UsersSortingCtrl($scope) {
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
