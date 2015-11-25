(function() {
  'use strict';

  angular.module('admin.permissions')
    .factory('usersService', UsersService);


  UsersService.$inject = ['$http'];

  function UsersService($http) {
    var userService = {
      users: [],
      fetchUsers: fetchUsers,
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

    function saveUser(user) {
      if (userService.users.indexOf(user) === -1) {
          userService.users.push(user);
      }
    }
  }
})();
