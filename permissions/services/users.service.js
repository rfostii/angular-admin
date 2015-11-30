(function() {
  'use strict';

  angular.module('admin.permissions')
    .factory('usersService', UsersService);


  UsersService.$inject = ['$http', '$q'];

  function UsersService($http, $q) {
    var userService = {
      users: [],
      fetchUsers: fetchUsers,
      lookupInActiveDirectory: lookupInActiveDirectory,
      saveUser: saveUser
    };

    return userService;

    ///////////////////////////////////////////

    function fetchUsers() {
      //TODO: fetch real data from server using $http service or $resource
      return $http.get('/data/users.json').then(function(response) {
        userService.users = response.data;
        return response.data;
      });
    }

    function lookupInActiveDirectory(cai) {
      var dfr = $q.defer();

      setTimeout(function() {
        dfr.resolve('Petro Petrovych');
      }, 1000);

      return dfr.promise;
    }

    function saveUser(user) {
      //if user is new
      if (!user.id) {
          //TODO: save on the server
          user.id = Math.random();
          userService.users.push(user);
      }
    }
  }
})();
