(function() {
  'use strict';

  angular.module('admin.permissions')
    .factory('permissionsService', PermissionsService);

  PermissionsService.$inject = ['$http'];

  function PermissionsService($http) {
    var permissionsService = {
      permissions: [],
      areas: [],
      fetchPermissions: fetchPermissions,
      savePermission: savePermission,
      fetchAreas: fetchAreas
    };

    return permissionsService;

    ///////////////////////////////////////////

    function fetchPermissions() {
      //TODO: fetch real data from server using $http service or $resource
      return $http.get('/permissions').then(function(response) {
        permissionsService.permissions = response.data;
        return response.data;
      });
    }

    function fetchAreas() {
      //TODO: fetch real data from server using $http service or $resource
      return $http.get('/areas').then(function(response) {
        permissionsService.areas = response.data;
        return response.data;
      });
    }

    function savePermission(permission) {
      if (permissionsService.permissions.indexOf(permission) === -1) {
          permission.id = Math.random();
          permissionsService.permissions.push(permission);
      }
    }
  }
})();
