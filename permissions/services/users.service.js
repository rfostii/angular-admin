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
      return $http.get('/users').then(function(response) {
        userService.users = response.data;
        return response.data;
      });
    }

    function lookupInActiveDirectory(cai) {
      return $http.post('/lookupInActiveDirectory', { cai: cai }).then(function(response) {
        return response.data;
      });
    }

    function saveUser(user) {
      //if user is new
      if (!user.id) {
          return $http.post('/users', user).then(function(response) {
            userService.users.push(response.data);
            return response.data;
          })
      } else {
        return $http.put('/users/' + user.id, user).then(function(response) {
          return response.data;
        });
      }
    }
  }
})();
