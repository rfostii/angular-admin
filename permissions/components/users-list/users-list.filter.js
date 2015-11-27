(function() {
  'use strict';

  angular.module('admin.permissions')
    .filter('usersListFilter', usersListFilter);

    function usersListFilter() {
      return function(users, query) {
        var regex = new RegExp(query, 'gi');
        return users.filter(function(user) {
          return regex.test(user.firstname) ||
                 regex.test(user.lastname) ||
                 regex.test(user.cai);
        });
      };
    }
})();
