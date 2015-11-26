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

    function saveUser(userData) {
      var userIndex;

      userService.users.some(function(userItem, index) {
        if (userItem.id === userData.id) {
          userIndex = index;
          return true;
        }
      });

      if (typeof userIndex === 'undefined') {
          userService.users.push(userData);
      } else {
        userService.users.splice(userIndex, 1, userData);
      }
    }
  }
})();
