(function() {
  'use strict';

  //angular.module('admin.permissions').config();
})();

(function() {
  'use strict';

  angular.module('admin.permissions', []);
})();

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
      savePermissions: savePermissions,
      fetchAreas: fetchAreas
    };

    return permissionsService;

    ///////////////////////////////////////////

    function fetchPermissions() {
      //TODO: fetch real data from server using $http service or $resource
      return $http.get('/data/permissions.json').then(function(response) {
        permissionsService.permissions = response.data;
        return response.data;
      });
    }

    function fetchAreas() {
      //TODO: fetch real data from server using $http service or $resource
      return $http.get('/data/areas.json').then(function(response) {
        permissionsService.areas = response.data;
        return response.data;
      });
    }

    function savePermissions(permission) {
      if (permissionsService.permissions.indexOf(permissions) === -1) {
          permissionsService.permissions.push(permissions);
      }
    }
  }
})();

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

(function() {
  'use strict';

  angular.module('admin.permissions')
    .controller('permissionsModalDialogCtrl', PermissionsModalDialogCtrl);
})();

PermissionsModalDialogCtrl.$inject = ['$q', 'usersService', 'permissionsService'];

function PermissionsModalDialogCtrl($q, usersService, permissionsService) {
  var vm = this;  
    
  vm.saveUserData = saveUserData;

  init();
  /////////////////////////////////////////////

  function saveUserData() {        
    usersService.saveUser(vm.user);
  }

  function init() {
    return $q.all([
      permissionsService.fetchPermissions(),
      permissionsService.fetchAreas()  
    ]).then(function(response) {
      vm.permissions = response[0];    
      vm.areas = response[1];      
    });    
  }
}

(function() {
  'use strict';

  angular.module('admin.permissions')
    .directive('permissionsModalDialog', permissionsModalDialogDirective);

permissionsModalDialogDirective.$inject = ['$compile'];

  function permissionsModalDialogDirective($compile) {
    return {
          restrict: 'EA',
          scope: {
              modalTitle: '@',
              user: '='
            },            
            controller: 'permissionsModalDialogCtrl',
            controllerAs: 'permissionsModalDialog',
            bindToController: true,
            link: link
    };

    /////////////////////////////////////////////

    function link($scope, $el, $attr) {

      $el.on('click', showModal);

      $scope.$on('$destroy', function() {
        $el.off('click', showModal);
      });

      /////////////////////////////////////////////////////

      function showModal() {
        $('<div></div>')
          .load('/permissions/components/permissions-modal-dialog/permissions-modal-dialog.template.html', function(modalDialog) {
            var $modalDialog = $($compile(modalDialog)($scope));

            $modalDialog.modal({
              backdrop: false
            });

            $modalDialog.one('hidden.bs.modal', function() {
              $modalDialog.remove();
            })
          });
      }
    }
  }
})();

(function() {
  'use strict';

  angular.module('admin.permissions')
    .controller('usersCtrl', UsersCtrl);

  UsersCtrl.$inject = ['usersService'];

  function UsersCtrl(usersService) {
    var vm = this;

    vm.users = usersService.users;

    init();

    function init() {
        return usersService.fetchUsers().then(function(users) {
            vm.users = users;
            return users;
        });
    }
  }
})();

(function() {
  'use strict';

  angular.module('admin.permissions')
    .directive('usersList', userListDirective);

  function userListDirective() {
    return {
          restrict: 'E',
          scope: {
              users: '='
            },
            controller: 'usersCtrl',
            controllerAs: 'usersList',
            templateUrl: 'permissions/components/users/users-list.template.html',
            bindToController: true,
            link: link
    };

    /////////////////////////////////////////////

    function link($scope, $el, $attr) {

    }
  }
})();

(function() {
  'use strict';

  angular.module('admin.permissions')
    .controller('userItemCtrl', UserItemCtrl);

  function UserItemCtrl() {
    var vm = this;

    vm.showListOfAllowedFactories = showListOfAllowedFactories;


    //////////////////////////////////////////////

    function showListOfAllowedFactories() {
      return vm.user.permissions.reduce(function(store, permission) {
          if (permission.allowed === "true") {
              return store.concat(permission.areas);
          }
          return store;
      }, []).join(',');
    }
  }
})();

(function() {
  'use strict';

  angular.module('admin.permissions')
    .directive('userItem', userItemDirective);

  function userItemDirective() {
    return {
      restrict: 'E',
      scope: {
          user: '='
        },
        controller: 'userItemCtrl',
        controllerAs: 'userItem',
        bindToController: true,
        templateUrl: 'permissions/components/users/user/user-item.template.html',
        link: link
    };

    ///////////////////////////////////

    function link($scope, $el, $attr) {

    }
  }
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBlcm1pc3Npb25zLW1hbmFnZXIuY29uZmlnLmpzIiwicGVybWlzc2lvbnMtbWFuYWdlci5tb2R1bGUuanMiLCJzZXJ2aWNlcy9wZXJtaXNzaW9ucy5zZXJ2aWNlLmpzIiwic2VydmljZXMvdXNlcnMuc2VydmljZS5qcyIsImNvbXBvbmVudHMvcGVybWlzc2lvbnMtbW9kYWwtZGlhbG9nL3Blcm1pc3Npb25zLW1vZGFsLWRpYWxvZy5jb250cm9sbGVyLmpzIiwiY29tcG9uZW50cy9wZXJtaXNzaW9ucy1tb2RhbC1kaWFsb2cvcGVybWlzc2lvbnMtbW9kYWwtZGlhbG9nLmRpcmVjdGl2ZS5qcyIsImNvbXBvbmVudHMvdXNlcnMvdXNlcnMtbGlzdC5jb250cm9sbGVyLmpzIiwiY29tcG9uZW50cy91c2Vycy91c2Vycy1saXN0LmRpcmVjdGl2ZS5qcyIsImNvbXBvbmVudHMvdXNlcnMvdXNlci91c2VyLWl0ZW0uY29udHJvbGxlci5qcyIsImNvbXBvbmVudHMvdXNlcnMvdXNlci91c2VyLWl0ZW0uZGlyZWN0aXZlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy9hbmd1bGFyLm1vZHVsZSgnYWRtaW4ucGVybWlzc2lvbnMnKS5jb25maWcoKTtcclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoJ2FkbWluLnBlcm1pc3Npb25zJywgW10pO1xyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBhbmd1bGFyLm1vZHVsZSgnYWRtaW4ucGVybWlzc2lvbnMnKVxyXG4gICAgLmZhY3RvcnkoJ3Blcm1pc3Npb25zU2VydmljZScsIFBlcm1pc3Npb25zU2VydmljZSk7XHJcblxyXG4gIFBlcm1pc3Npb25zU2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCddO1xyXG5cclxuICBmdW5jdGlvbiBQZXJtaXNzaW9uc1NlcnZpY2UoJGh0dHApIHtcclxuICAgIHZhciBwZXJtaXNzaW9uc1NlcnZpY2UgPSB7XHJcbiAgICAgIHBlcm1pc3Npb25zOiBbXSxcclxuICAgICAgYXJlYXM6IFtdLFxyXG4gICAgICBmZXRjaFBlcm1pc3Npb25zOiBmZXRjaFBlcm1pc3Npb25zLFxyXG4gICAgICBzYXZlUGVybWlzc2lvbnM6IHNhdmVQZXJtaXNzaW9ucyxcclxuICAgICAgZmV0Y2hBcmVhczogZmV0Y2hBcmVhc1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gcGVybWlzc2lvbnNTZXJ2aWNlO1xyXG5cclxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuXHJcbiAgICBmdW5jdGlvbiBmZXRjaFBlcm1pc3Npb25zKCkge1xyXG4gICAgICAvL1RPRE86IGZldGNoIHJlYWwgZGF0YSBmcm9tIHNlcnZlciB1c2luZyAkaHR0cCBzZXJ2aWNlIG9yICRyZXNvdXJjZVxyXG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvZGF0YS9wZXJtaXNzaW9ucy5qc29uJykudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgIHBlcm1pc3Npb25zU2VydmljZS5wZXJtaXNzaW9ucyA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGZldGNoQXJlYXMoKSB7XHJcbiAgICAgIC8vVE9ETzogZmV0Y2ggcmVhbCBkYXRhIGZyb20gc2VydmVyIHVzaW5nICRodHRwIHNlcnZpY2Ugb3IgJHJlc291cmNlXHJcbiAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9kYXRhL2FyZWFzLmpzb24nKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgcGVybWlzc2lvbnNTZXJ2aWNlLmFyZWFzID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2F2ZVBlcm1pc3Npb25zKHBlcm1pc3Npb24pIHtcclxuICAgICAgaWYgKHBlcm1pc3Npb25zU2VydmljZS5wZXJtaXNzaW9ucy5pbmRleE9mKHBlcm1pc3Npb25zKSA9PT0gLTEpIHtcclxuICAgICAgICAgIHBlcm1pc3Npb25zU2VydmljZS5wZXJtaXNzaW9ucy5wdXNoKHBlcm1pc3Npb25zKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoJ2FkbWluLnBlcm1pc3Npb25zJylcclxuICAgIC5mYWN0b3J5KCd1c2Vyc1NlcnZpY2UnLCBVc2Vyc1NlcnZpY2UpO1xyXG5cclxuXHJcbiAgVXNlcnNTZXJ2aWNlLiRpbmplY3QgPSBbJyRodHRwJ107XHJcblxyXG4gIGZ1bmN0aW9uIFVzZXJzU2VydmljZSgkaHR0cCkge1xyXG4gICAgdmFyIHVzZXJTZXJ2aWNlID0ge1xyXG4gICAgICB1c2VyczogW10sXHJcbiAgICAgIGZldGNoVXNlcnM6IGZldGNoVXNlcnMsXHJcbiAgICAgIHNhdmVVc2VyOiBzYXZlVXNlclxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gdXNlclNlcnZpY2U7XHJcblxyXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG5cclxuICAgIGZ1bmN0aW9uIGZldGNoVXNlcnMoKSB7XHJcbiAgICAgIC8vVE9ETzogZmV0Y2ggcmVhbCBkYXRhIGZyb20gc2VydmVyIHVzaW5nICRodHRwIHNlcnZpY2Ugb3IgJHJlc291cmNlXHJcbiAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9kYXRhL3VzZXJzLmpzb24nKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgdXNlclNlcnZpY2UudXNlcnMgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzYXZlVXNlcih1c2VyKSB7XHJcbiAgICAgIGlmICh1c2VyU2VydmljZS51c2Vycy5pbmRleE9mKHVzZXIpID09PSAtMSkge1xyXG4gICAgICAgICAgdXNlclNlcnZpY2UudXNlcnMucHVzaCh1c2VyKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoJ2FkbWluLnBlcm1pc3Npb25zJylcclxuICAgIC5jb250cm9sbGVyKCdwZXJtaXNzaW9uc01vZGFsRGlhbG9nQ3RybCcsIFBlcm1pc3Npb25zTW9kYWxEaWFsb2dDdHJsKTtcclxufSkoKTtcclxuXHJcblBlcm1pc3Npb25zTW9kYWxEaWFsb2dDdHJsLiRpbmplY3QgPSBbJyRxJywgJ3VzZXJzU2VydmljZScsICdwZXJtaXNzaW9uc1NlcnZpY2UnXTtcclxuXHJcbmZ1bmN0aW9uIFBlcm1pc3Npb25zTW9kYWxEaWFsb2dDdHJsKCRxLCB1c2Vyc1NlcnZpY2UsIHBlcm1pc3Npb25zU2VydmljZSkge1xyXG4gIHZhciB2bSA9IHRoaXM7ICBcclxuICAgIFxyXG4gIHZtLnNhdmVVc2VyRGF0YSA9IHNhdmVVc2VyRGF0YTtcclxuXHJcbiAgaW5pdCgpO1xyXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG5cclxuICBmdW5jdGlvbiBzYXZlVXNlckRhdGEoKSB7ICAgICAgICBcclxuICAgIHVzZXJzU2VydmljZS5zYXZlVXNlcih2bS51c2VyKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICByZXR1cm4gJHEuYWxsKFtcclxuICAgICAgcGVybWlzc2lvbnNTZXJ2aWNlLmZldGNoUGVybWlzc2lvbnMoKSxcclxuICAgICAgcGVybWlzc2lvbnNTZXJ2aWNlLmZldGNoQXJlYXMoKSAgXHJcbiAgICBdKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgIHZtLnBlcm1pc3Npb25zID0gcmVzcG9uc2VbMF07ICAgIFxyXG4gICAgICB2bS5hcmVhcyA9IHJlc3BvbnNlWzFdOyAgICAgIFxyXG4gICAgfSk7ICAgIFxyXG4gIH1cclxufVxyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBhbmd1bGFyLm1vZHVsZSgnYWRtaW4ucGVybWlzc2lvbnMnKVxyXG4gICAgLmRpcmVjdGl2ZSgncGVybWlzc2lvbnNNb2RhbERpYWxvZycsIHBlcm1pc3Npb25zTW9kYWxEaWFsb2dEaXJlY3RpdmUpO1xyXG5cclxucGVybWlzc2lvbnNNb2RhbERpYWxvZ0RpcmVjdGl2ZS4kaW5qZWN0ID0gWyckY29tcGlsZSddO1xyXG5cclxuICBmdW5jdGlvbiBwZXJtaXNzaW9uc01vZGFsRGlhbG9nRGlyZWN0aXZlKCRjb21waWxlKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgIG1vZGFsVGl0bGU6ICdAJyxcclxuICAgICAgICAgICAgICB1c2VyOiAnPSdcclxuICAgICAgICAgICAgfSwgICAgICAgICAgICBcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ3Blcm1pc3Npb25zTW9kYWxEaWFsb2dDdHJsJyxcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAncGVybWlzc2lvbnNNb2RhbERpYWxvZycsXHJcbiAgICAgICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgICAgIGxpbms6IGxpbmtcclxuICAgIH07XHJcblxyXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcblxyXG4gICAgZnVuY3Rpb24gbGluaygkc2NvcGUsICRlbCwgJGF0dHIpIHtcclxuXHJcbiAgICAgICRlbC5vbignY2xpY2snLCBzaG93TW9kYWwpO1xyXG5cclxuICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAkZWwub2ZmKCdjbGljaycsIHNob3dNb2RhbCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuXHJcbiAgICAgIGZ1bmN0aW9uIHNob3dNb2RhbCgpIHtcclxuICAgICAgICAkKCc8ZGl2PjwvZGl2PicpXHJcbiAgICAgICAgICAubG9hZCgnL3Blcm1pc3Npb25zL2NvbXBvbmVudHMvcGVybWlzc2lvbnMtbW9kYWwtZGlhbG9nL3Blcm1pc3Npb25zLW1vZGFsLWRpYWxvZy50ZW1wbGF0ZS5odG1sJywgZnVuY3Rpb24obW9kYWxEaWFsb2cpIHtcclxuICAgICAgICAgICAgdmFyICRtb2RhbERpYWxvZyA9ICQoJGNvbXBpbGUobW9kYWxEaWFsb2cpKCRzY29wZSkpO1xyXG5cclxuICAgICAgICAgICAgJG1vZGFsRGlhbG9nLm1vZGFsKHtcclxuICAgICAgICAgICAgICBiYWNrZHJvcDogZmFsc2VcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkbW9kYWxEaWFsb2cub25lKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAkbW9kYWxEaWFsb2cucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoJ2FkbWluLnBlcm1pc3Npb25zJylcclxuICAgIC5jb250cm9sbGVyKCd1c2Vyc0N0cmwnLCBVc2Vyc0N0cmwpO1xyXG5cclxuICBVc2Vyc0N0cmwuJGluamVjdCA9IFsndXNlcnNTZXJ2aWNlJ107XHJcblxyXG4gIGZ1bmN0aW9uIFVzZXJzQ3RybCh1c2Vyc1NlcnZpY2UpIHtcclxuICAgIHZhciB2bSA9IHRoaXM7XHJcblxyXG4gICAgdm0udXNlcnMgPSB1c2Vyc1NlcnZpY2UudXNlcnM7XHJcblxyXG4gICAgaW5pdCgpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHVzZXJzU2VydmljZS5mZXRjaFVzZXJzKCkudGhlbihmdW5jdGlvbih1c2Vycykge1xyXG4gICAgICAgICAgICB2bS51c2VycyA9IHVzZXJzO1xyXG4gICAgICAgICAgICByZXR1cm4gdXNlcnM7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBhbmd1bGFyLm1vZHVsZSgnYWRtaW4ucGVybWlzc2lvbnMnKVxyXG4gICAgLmRpcmVjdGl2ZSgndXNlcnNMaXN0JywgdXNlckxpc3REaXJlY3RpdmUpO1xyXG5cclxuICBmdW5jdGlvbiB1c2VyTGlzdERpcmVjdGl2ZSgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICB1c2VyczogJz0nXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICd1c2Vyc0N0cmwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICd1c2Vyc0xpc3QnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3Blcm1pc3Npb25zL2NvbXBvbmVudHMvdXNlcnMvdXNlcnMtbGlzdC50ZW1wbGF0ZS5odG1sJyxcclxuICAgICAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcclxuICAgICAgICAgICAgbGluazogbGlua1xyXG4gICAgfTtcclxuXHJcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuXHJcbiAgICBmdW5jdGlvbiBsaW5rKCRzY29wZSwgJGVsLCAkYXR0cikge1xyXG5cclxuICAgIH1cclxuICB9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGFuZ3VsYXIubW9kdWxlKCdhZG1pbi5wZXJtaXNzaW9ucycpXHJcbiAgICAuY29udHJvbGxlcigndXNlckl0ZW1DdHJsJywgVXNlckl0ZW1DdHJsKTtcclxuXHJcbiAgZnVuY3Rpb24gVXNlckl0ZW1DdHJsKCkge1xyXG4gICAgdmFyIHZtID0gdGhpcztcclxuXHJcbiAgICB2bS5zaG93TGlzdE9mQWxsb3dlZEZhY3RvcmllcyA9IHNob3dMaXN0T2ZBbGxvd2VkRmFjdG9yaWVzO1xyXG5cclxuXHJcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcblxyXG4gICAgZnVuY3Rpb24gc2hvd0xpc3RPZkFsbG93ZWRGYWN0b3JpZXMoKSB7XHJcbiAgICAgIHJldHVybiB2bS51c2VyLnBlcm1pc3Npb25zLnJlZHVjZShmdW5jdGlvbihzdG9yZSwgcGVybWlzc2lvbikge1xyXG4gICAgICAgICAgaWYgKHBlcm1pc3Npb24uYWxsb3dlZCA9PT0gXCJ0cnVlXCIpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gc3RvcmUuY29uY2F0KHBlcm1pc3Npb24uYXJlYXMpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIHN0b3JlO1xyXG4gICAgICB9LCBbXSkuam9pbignLCcpO1xyXG4gICAgfVxyXG4gIH1cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoJ2FkbWluLnBlcm1pc3Npb25zJylcclxuICAgIC5kaXJlY3RpdmUoJ3VzZXJJdGVtJywgdXNlckl0ZW1EaXJlY3RpdmUpO1xyXG5cclxuICBmdW5jdGlvbiB1c2VySXRlbURpcmVjdGl2ZSgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICB1c2VyOiAnPSdcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbnRyb2xsZXI6ICd1c2VySXRlbUN0cmwnLFxyXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3VzZXJJdGVtJyxcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAncGVybWlzc2lvbnMvY29tcG9uZW50cy91c2Vycy91c2VyL3VzZXItaXRlbS50ZW1wbGF0ZS5odG1sJyxcclxuICAgICAgICBsaW5rOiBsaW5rXHJcbiAgICB9O1xyXG5cclxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcblxyXG4gICAgZnVuY3Rpb24gbGluaygkc2NvcGUsICRlbCwgJGF0dHIpIHtcclxuXHJcbiAgICB9XHJcbiAgfVxyXG59KSgpO1xyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
