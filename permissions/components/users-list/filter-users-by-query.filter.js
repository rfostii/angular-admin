(function() {
  'use strict';

  angular.module('usersList')
    .filter('filterUsersByQuery', filterUsersByQueryFilter);

    function filterUsersByQueryFilter() {
      function isPemissionsMatch(permissions, pattern) {
        return permissions.some(function(permission) {
          return permission.areas && permission.areas.length &&
          (pattern.test(permission.name) || isAreasMatch(permission.areas, pattern));
        });
      }

      function isAreasMatch(areas, pattern) {
        return areas.some(function(area) {
          return pattern.test(area.name);
        });
      }

      return function(users, query) {
        var regex = new RegExp(query, 'gi');
        return users.filter(function(user) {
          return regex.test(user.name) ||
                 regex.test(user.cai) ||
                 isPemissionsMatch(user.permissions, regex);
        });
      };
    }
})();