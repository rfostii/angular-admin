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
      //if user is new
      if (!user.id) {
          //TODO: save on the server
          user.id = Math.random();
          user.cai = (user.firstname[0] + user.lastname.slice(0, 2)).toUpperCase();
          userService.users.push(user);
      }
    }
  }
})();
