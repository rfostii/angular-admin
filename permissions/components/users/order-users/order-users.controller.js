(function() {
  'use strict';

  angular.module('admin.permissions')
    .controller('orderUsersCtrl', OrderUsersCtrl);

  OrderUsersCtrl.$inject = ['$scope'];

  function OrderUsersCtrl($scope) {
    var vm = this;

    vm.orderTypes = [
        { name: 'firstname asc', field: 'firstname',  desc: false},
        { name: 'firstname desc', field: 'firstname', desc: true},
        {name: 'lastname asc', field: 'lastname', desc: false},
        {name: 'lastname desc', field: 'lastname',  desc: true},
        {name: 'cai asc', field: 'cai',  desc: false},
        {name: 'cai desc', field: 'cai',  desc: true},
        {name: 'active', field: 'active'}
    ];
    vm.selectedOrderType = vm.orderTypes[0];
    vm.selectOrderType = selectOrderType;

    //////////////////////////////////////

    function selectOrderType(orderType) {
        vm.selectedOrderType = orderType;
        $scope.$parent.$broadcast('orderUsers', orderType);
    }
  }
})();
