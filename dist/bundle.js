(function() {
  'use strict';

  angular.module('checklistModel', [])
    .directive('checklistModel', ['$parse', '$compile', function($parse, $compile) {

      function contains(arr, item, comparator) {
        if (angular.isArray(arr)) {
          for (var i = arr.length; i--;) {
            if (comparator(arr[i], item)) {
              return true;
            }
          }
        }
        return false;
      }

      function add(arr, item, comparator) {
        arr = angular.isArray(arr) ? arr : [];
          if(!contains(arr, item, comparator)) {
              arr.push(item);
          }
        return arr;
      }

      function remove(arr, item, comparator) {
        if (angular.isArray(arr)) {
          for (var i = arr.length; i--;) {
            if (comparator(arr[i], item)) {
              arr.splice(i, 1);
              break;
            }
          }
        }
        return arr;
      }

      function postLinkFn($scope, $elem, $attrs) {
        var checklistModel = $attrs.checklistModel;
        var getter = $parse(checklistModel);
        var setter = getter.assign;
        var value = $attrs.checklistValue ? $parse($attrs.checklistValue)($scope.$parent) : $attrs.value;
        var comparator = angular.equals;

        $attrs.$set("checklistModel", null);
        $compile($elem)($scope);
        $attrs.$set("checklistModel", checklistModel);

        $scope.$watch($attrs.ngModel, function(newValue, oldValue) {
          if (newValue !== oldValue) {
            setValueInChecklistModel(value, newValue);
          }
        });

        function setValueInChecklistModel(value, checked) {
          var current = getter($scope.$parent);
          if (angular.isFunction(setter)) {
            if (checked === true) {
              setter($scope.$parent, add(current, value, comparator));
            } else {
              setter($scope.$parent, remove(current, value, comparator));
            }
          }
        }

        function setChecked(newArr, oldArr) {
          $scope[$attrs.ngModel] = contains(newArr, value, comparator);
        }

        $scope.$parent.$watchCollection(checklistModel, setChecked);
      }

      return {
        restrict: 'A',
        scope: true,
        compile: function($element, $attrs) {
          if (!$attrs.checklistValue && !$attrs.value) {
            throw 'You should provide `value` or `checklist-value`.';
          }

          if (!$attrs.ngModel) {
            $attrs.$set("ngModel", "checked");
          }

          return postLinkFn;
        }
      };
    }]);
})();

(function() {
  'use strict';

  angular.module('permissionsService', [])
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

(function() {
  'use strict';

  angular.module('usersService', [])
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

(function() {
	'use strict';

	angular.module('userModalDialog', []);
})();

(function() {
  'use strict';

  angular.module('userModalDialog')
    .controller('userModalDialogCtrl', UserModalDialogCtrl);

    UserModalDialogCtrl.$inject = ['$scope', '$q', 'usersService', 'permissionsService'];

    function UserModalDialogCtrl($scope, $q, usersService, permissionsService) {
      var vm = this;
      var selectedPemissionsAreas = [];

      if (!vm.user) {
        vm.user = {};
        vm.isNewUser = true;
      }

      vm.saveUser = saveUser;
      vm.lookupInActiveDirectory = lookupInActiveDirectory;

      init();
      /////////////////////////////////////////////

      function init() {
        return $q.all([
          permissionsService.fetchPermissions(),
          permissionsService.fetchAreas()
        ]).then(function(response) {
          vm.permissions = response[0];
          if (!vm.user.permissions) {
            vm.user.permissions = $.extend(true, [], vm.permissions);
          }
          vm.areas = response[1];
        });
      }

      function lookupInActiveDirectory(cai){
        usersService.lookupInActiveDirectory(cai).then(function(name) {
          vm.user.name = name;
        })
      }

      function cleanForm() {
        if (vm.isNewUser) {
          vm.user = {};
          vm.user.permissions = $.extend(true, [], vm.permissions);
        }
      }

      function saveUser() {
        if (vm.permissionsForm.$valid) {
          $scope.$emit('validFormData');
          usersService.saveUser($.extend(true, {}, vm.user)).then(function(user) {
            if (!vm.isNewUser) {
                vm.user = user;
            }
          });
          cleanForm();
        } else {
          $scope.$emit('invalidFormData');
        }
      }
    }
})();

(function() {
  'use strict';

  angular.module('userModalDialog')
    .directive('userModalDialog', userModalDialogDirective);

  userModalDialogDirective.$inject = ['$compile', '$http', '$templateCache'];

  function userModalDialogDirective($compile, $http, $templateCache) {
    return {
          restrict: 'EA',
          scope: {
              modalTitle: '@',
              user: '=?'
            },
            controller: 'userModalDialogCtrl',
            controllerAs: 'userModalDialog',
            bindToController: true,
            link: link
    };

    /////////////////////////////////////////////

    function link($scope, $el, $attr) {
      var $modalDialog;

      $el.on('click', showModal);

      $scope.$on('validFormData', function() {
        $modalDialog.modal('hide');
      });

      $scope.$on('invalidFormData', function() {
        $scope.userModalDialog.permissionsForm.$dirty = true;
      });

      $scope.$on('$destroy', function() {
        $el.off('click', showModal);
      });

      /////////////////////////////////////////////////////

      function showModal() {
        var modalDialogTmpl =$templateCache
          .get('components/user-modal-dialog/user-modal-dialog.template.html');

          $modalDialog = $($compile(modalDialogTmpl)($scope));
          $modalDialog.modal();
          $modalDialog.one('hidden.bs.modal', function() {
            $modalDialog.remove();
          });
      }
    }
  }
})();

(function() {
	'use strict';

	angular.module('userItem', []);
})();

(function() {
  'use strict';

  angular.module('userItem')
    .controller('userItemCtrl', UserItemCtrl);

  UserItemCtrl.$inject = ['usersService'];

  function UserItemCtrl(usersService) {
    var vm = this;

    vm.showListOfAllowedFactories = showListOfAllowedFactories;
    vm.saveUser = saveUser;


    //////////////////////////////////////////////

    function saveUser(user) {
      usersService.saveUser(user).then(function(user) {
        vm.user = user;
      });
    }

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

  angular.module('userItem')
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
        templateUrl: 'components/users-list/user-item/user-item.template.html',
        link: link
    };

    ///////////////////////////////////

    function link($scope, $el, $attr) {

    }
  }
})();

(function() {
	'use strict';

	angular.module('usersSorting', []);
})();

(function() {
  'use strict';

  angular.module('usersSorting')
    .controller('usersSortingCtrl', UsersSortingCtrl);

  UsersSortingCtrl.$inject = ['$scope'];

  function UsersSortingCtrl($scope) {
    var vm = this;

    vm.selectField = selectField
    vm.changeReverseMode = changeReverseMode;

    function changeReverseMode() {
      vm.sortInReverseMode = !vm.sortInReverseMode;
    }

    function selectField(field) {
        vm.selectedField = field;
    }
  }
})();

(function() {
  'use strict';

  angular.module('usersSorting')
    .directive('usersSorting', usersSortingDirective);

  function usersSortingDirective() {
    return {
          restrict: 'E',
          scope: {
            sortInReverseMode: '=',
            fields: '=',
            selectedField: '='
          },
          controller: 'usersSortingCtrl',
          controllerAs: 'usersSorting',
          templateUrl: 'components/users-list/users-sorting/users-sorting.template.html',
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

	angular.module('usersList', [
		'userModalDialog',
		'userItem',
		'usersSorting',
		'usersService',
		'permissionsService'
	]);
})();

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

(function() {
  'use strict';

  angular.module('usersList')
    .controller('usersCtrl', UsersCtrl);

  UsersCtrl.$inject = ['$scope', '$filter','usersService'];

  function UsersCtrl($scope, $filter, usersService) {
    var vm = this;

    vm.searchQuery = '';
    vm.sortInReverseMode = false;
    vm.fields = ['name', 'cai', 'active'];
    vm.selectedField = vm.fields[0];
    vm.users = usersService.users;
    vm.getListOfUsers = getListOfUsers;

    init();

    /////////////////////////////////////

    function getListOfUsers() {
        return $filter('filterUsersByQuery')(vm.users, vm.searchQuery);
    }

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

  angular.module('usersList')
    .directive('userSearch', userSearchDirective);

  function userSearchDirective() {
    return {
      restrict: 'EA',
      scope: {
        searchQuery: '='
      },
      template: '<input type="text" ng-model="searchQuery" ng-model-options="{debounce: 300}" class="form-control" placeholder="search">',
      link: link
    };

    ///////////////////////////////////

    function link($scope, $el, $attr) {

    }
  }
})();

(function() {
  'use strict';

  angular.module('usersList')
    .directive('usersList', userListDirective);

  function userListDirective() {
    return {
          restrict: 'E',
          scope: {
            users: '='
          },
          controller: 'usersCtrl',
          controllerAs: 'usersList',
          templateUrl: 'components/users-list/users-list.template.html',
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

  //angular.module('admin.permissions').config();
})();

(function() {
  'use strict';

  angular.module('admin.permissions', [
      'ngMockE2E',
      'admin.permissions.templates',
      'checklistModel',
      'usersList'
    ])
    .run(runPermissionsModule);

  runPermissionsModule.$inject = ['$httpBackend', '$http'];

  function runPermissionsModule($httpBackend, $http) {
    var areas = [
      { id: 1, name: 'XYZ' },
      { id: 2, name:'ABC' },
      { id: 3, name:'DEF' },
      { id: 4, name: 'all' }
    ];
    var permissions = [
      { id: 1, name: 'CD Edit',   active: true },
      { id: 2, name: 'CD Create', active: false },
      { id: 3, name: 'PRI Edit',  active: false },
      { id: 4, name: 'DPR Edit',  active: true },
      { id: 5, name: 'EXEC Edit', active: true },
      { id: 6, name: 'OPER Edit', active: false }
    ];
    var users = [
      { id: 1, name: 'User1', cai: 'TUSER3', active: true, permissions: [
          { id: 1, name: 'CD Edit', active: true, areas: [] },
          { id: 2, name: 'CD Create', active: false, areas: [] },
          { id: 3, name: 'PRI Edit', active: false, areas: [
              { id: 2, name:'ABC' }
            ]
          },
          { id: 4, name: 'DPR Edit', active: true, areas: [
              { id: 3, name:'DEF' }
            ]
          },
          { id: 5, name: 'EXEC Edit', active: true, areas: [
              { id: 4, name: 'all' }
            ]
          },
          { id: 6, name: 'OPER Edit', active: false, areas: [] }
        ]
      },
      { id: 2, name: 'User2', cai: 'TUSER1', active: true, permissions: [
          { id: 1, name: 'CD Edit', active: true, areas: [
              { id: 1, name: 'XYZ' }
            ]
          },
          { id: 2, name: 'CD Create', active: false, areas: []
          },
          { id: 3, name: 'PRI Edit', active: false, areas: [] },
          { id: 4, name: 'DPR Edit', active: true, areas: [
              { id: 3, name:'DEF' }
            ]
          },
          { id: 5, name: 'EXEC Edit', active: true, areas: [
              { id: 4, name: 'all' }
            ]
          },
          { id: 6, name: 'OPER Edit', active: false, areas: [] }
        ]
      }
    ];


    $httpBackend.whenGET(/\.template\.html/).passThrough();

    $httpBackend.whenGET('/users').respond(users);

    $httpBackend.whenPOST('/lookupInActiveDirectory').respond('User3');

    $httpBackend.whenPOST('/users').respond(function(method, url, user) {
        user = JSON.parse(user);
        user.id = Math.random();
        users.push(user);
        return [201, user, {}];
    });

    $httpBackend.whenPUT(/users\/\d+/).respond(function(method, url, user) {
      var userIndex;
      var oldUserData;

      user = JSON.parse(user);
      oldUserData = users.find(function(userItem, index) {
        if (userItem.id === user.id) {
          userIndex = index;
          return true;
        }
      });

      if (oldUserData) {
        users.splice(userIndex, 1, user);
        return [200, user, {}];
      }
    });

    $httpBackend.whenGET('/areas').respond(areas);

    $httpBackend.whenGET('/permissions').respond(permissions);
  }
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNoZWNrbGlzdC1tb2RlbC5kaXJlY3RpdmUuanMiLCJwZXJtaXNzaW9ucy5zZXJ2aWNlLmpzIiwidXNlcnMuc2VydmljZS5qcyIsInVzZXItbW9kYWwtZGlhbG9nLmpzIiwidXNlci1tb2RhbC1kaWFsb2cuY29udHJvbGxlci5qcyIsInVzZXItbW9kYWwtZGlhbG9nLmRpcmVjdGl2ZS5qcyIsInVzZXItaXRlbS5qcyIsInVzZXItaXRlbS5jb250cm9sbGVyLmpzIiwidXNlci1pdGVtLmRpcmVjdGl2ZS5qcyIsInVzZXJzLXNvcnRpbmcuanMiLCJ1c2Vycy1zb3J0aW5nLmNvbnRyb2xsZXIuanMiLCJ1c2Vycy1zb3J0aW5nLmRpcmVjdGl2ZS5qcyIsInVzZXJzLWxpc3QuanMiLCJmaWx0ZXItdXNlcnMtYnktcXVlcnkuZmlsdGVyLmpzIiwidXNlcnMtbGlzdC5jb250cm9sbGVyLmpzIiwidXNlci1zZWFyY2guZGlyZWN0aXZlLmpzIiwidXNlcnMtbGlzdC5kaXJlY3RpdmUuanMiLCJwZXJtaXNzaW9ucy1tYW5hZ2VyLmNvbmZpZy5qcyIsInBlcm1pc3Npb25zLW1hbmFnZXIubW9kdWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoJ2NoZWNrbGlzdE1vZGVsJywgW10pXHJcbiAgICAuZGlyZWN0aXZlKCdjaGVja2xpc3RNb2RlbCcsIFsnJHBhcnNlJywgJyRjb21waWxlJywgZnVuY3Rpb24oJHBhcnNlLCAkY29tcGlsZSkge1xyXG5cclxuICAgICAgZnVuY3Rpb24gY29udGFpbnMoYXJyLCBpdGVtLCBjb21wYXJhdG9yKSB7XHJcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNBcnJheShhcnIpKSB7XHJcbiAgICAgICAgICBmb3IgKHZhciBpID0gYXJyLmxlbmd0aDsgaS0tOykge1xyXG4gICAgICAgICAgICBpZiAoY29tcGFyYXRvcihhcnJbaV0sIGl0ZW0pKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBhZGQoYXJyLCBpdGVtLCBjb21wYXJhdG9yKSB7XHJcbiAgICAgICAgYXJyID0gYW5ndWxhci5pc0FycmF5KGFycikgPyBhcnIgOiBbXTtcclxuICAgICAgICAgIGlmKCFjb250YWlucyhhcnIsIGl0ZW0sIGNvbXBhcmF0b3IpKSB7XHJcbiAgICAgICAgICAgICAgYXJyLnB1c2goaXRlbSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFycjtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gcmVtb3ZlKGFyciwgaXRlbSwgY29tcGFyYXRvcikge1xyXG4gICAgICAgIGlmIChhbmd1bGFyLmlzQXJyYXkoYXJyKSkge1xyXG4gICAgICAgICAgZm9yICh2YXIgaSA9IGFyci5sZW5ndGg7IGktLTspIHtcclxuICAgICAgICAgICAgaWYgKGNvbXBhcmF0b3IoYXJyW2ldLCBpdGVtKSkge1xyXG4gICAgICAgICAgICAgIGFyci5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFycjtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gcG9zdExpbmtGbigkc2NvcGUsICRlbGVtLCAkYXR0cnMpIHtcclxuICAgICAgICB2YXIgY2hlY2tsaXN0TW9kZWwgPSAkYXR0cnMuY2hlY2tsaXN0TW9kZWw7XHJcbiAgICAgICAgdmFyIGdldHRlciA9ICRwYXJzZShjaGVja2xpc3RNb2RlbCk7XHJcbiAgICAgICAgdmFyIHNldHRlciA9IGdldHRlci5hc3NpZ247XHJcbiAgICAgICAgdmFyIHZhbHVlID0gJGF0dHJzLmNoZWNrbGlzdFZhbHVlID8gJHBhcnNlKCRhdHRycy5jaGVja2xpc3RWYWx1ZSkoJHNjb3BlLiRwYXJlbnQpIDogJGF0dHJzLnZhbHVlO1xyXG4gICAgICAgIHZhciBjb21wYXJhdG9yID0gYW5ndWxhci5lcXVhbHM7XHJcblxyXG4gICAgICAgICRhdHRycy4kc2V0KFwiY2hlY2tsaXN0TW9kZWxcIiwgbnVsbCk7XHJcbiAgICAgICAgJGNvbXBpbGUoJGVsZW0pKCRzY29wZSk7XHJcbiAgICAgICAgJGF0dHJzLiRzZXQoXCJjaGVja2xpc3RNb2RlbFwiLCBjaGVja2xpc3RNb2RlbCk7XHJcblxyXG4gICAgICAgICRzY29wZS4kd2F0Y2goJGF0dHJzLm5nTW9kZWwsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG4gICAgICAgICAgaWYgKG5ld1ZhbHVlICE9PSBvbGRWYWx1ZSkge1xyXG4gICAgICAgICAgICBzZXRWYWx1ZUluQ2hlY2tsaXN0TW9kZWwodmFsdWUsIG5ld1ZhbHVlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0VmFsdWVJbkNoZWNrbGlzdE1vZGVsKHZhbHVlLCBjaGVja2VkKSB7XHJcbiAgICAgICAgICB2YXIgY3VycmVudCA9IGdldHRlcigkc2NvcGUuJHBhcmVudCk7XHJcbiAgICAgICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNldHRlcikpIHtcclxuICAgICAgICAgICAgaWYgKGNoZWNrZWQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICBzZXR0ZXIoJHNjb3BlLiRwYXJlbnQsIGFkZChjdXJyZW50LCB2YWx1ZSwgY29tcGFyYXRvcikpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHNldHRlcigkc2NvcGUuJHBhcmVudCwgcmVtb3ZlKGN1cnJlbnQsIHZhbHVlLCBjb21wYXJhdG9yKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldENoZWNrZWQobmV3QXJyLCBvbGRBcnIpIHtcclxuICAgICAgICAgICRzY29wZVskYXR0cnMubmdNb2RlbF0gPSBjb250YWlucyhuZXdBcnIsIHZhbHVlLCBjb21wYXJhdG9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS4kcGFyZW50LiR3YXRjaENvbGxlY3Rpb24oY2hlY2tsaXN0TW9kZWwsIHNldENoZWNrZWQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgc2NvcGU6IHRydWUsXHJcbiAgICAgICAgY29tcGlsZTogZnVuY3Rpb24oJGVsZW1lbnQsICRhdHRycykge1xyXG4gICAgICAgICAgaWYgKCEkYXR0cnMuY2hlY2tsaXN0VmFsdWUgJiYgISRhdHRycy52YWx1ZSkge1xyXG4gICAgICAgICAgICB0aHJvdyAnWW91IHNob3VsZCBwcm92aWRlIGB2YWx1ZWAgb3IgYGNoZWNrbGlzdC12YWx1ZWAuJztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAoISRhdHRycy5uZ01vZGVsKSB7XHJcbiAgICAgICAgICAgICRhdHRycy4kc2V0KFwibmdNb2RlbFwiLCBcImNoZWNrZWRcIik7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHBvc3RMaW5rRm47XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfV0pO1xyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBhbmd1bGFyLm1vZHVsZSgncGVybWlzc2lvbnNTZXJ2aWNlJywgW10pXHJcbiAgICAuZmFjdG9yeSgncGVybWlzc2lvbnNTZXJ2aWNlJywgUGVybWlzc2lvbnNTZXJ2aWNlKTtcclxuXHJcbiAgUGVybWlzc2lvbnNTZXJ2aWNlLiRpbmplY3QgPSBbJyRodHRwJ107XHJcblxyXG4gIGZ1bmN0aW9uIFBlcm1pc3Npb25zU2VydmljZSgkaHR0cCkge1xyXG4gICAgdmFyIHBlcm1pc3Npb25zU2VydmljZSA9IHtcclxuICAgICAgcGVybWlzc2lvbnM6IFtdLFxyXG4gICAgICBhcmVhczogW10sXHJcbiAgICAgIGZldGNoUGVybWlzc2lvbnM6IGZldGNoUGVybWlzc2lvbnMsXHJcbiAgICAgIHNhdmVQZXJtaXNzaW9uOiBzYXZlUGVybWlzc2lvbixcclxuICAgICAgZmV0Y2hBcmVhczogZmV0Y2hBcmVhc1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gcGVybWlzc2lvbnNTZXJ2aWNlO1xyXG5cclxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuXHJcbiAgICBmdW5jdGlvbiBmZXRjaFBlcm1pc3Npb25zKCkge1xyXG4gICAgICAvL1RPRE86IGZldGNoIHJlYWwgZGF0YSBmcm9tIHNlcnZlciB1c2luZyAkaHR0cCBzZXJ2aWNlIG9yICRyZXNvdXJjZVxyXG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvcGVybWlzc2lvbnMnKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgcGVybWlzc2lvbnNTZXJ2aWNlLnBlcm1pc3Npb25zID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZmV0Y2hBcmVhcygpIHtcclxuICAgICAgLy9UT0RPOiBmZXRjaCByZWFsIGRhdGEgZnJvbSBzZXJ2ZXIgdXNpbmcgJGh0dHAgc2VydmljZSBvciAkcmVzb3VyY2VcclxuICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FyZWFzJykudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgIHBlcm1pc3Npb25zU2VydmljZS5hcmVhcyA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNhdmVQZXJtaXNzaW9uKHBlcm1pc3Npb24pIHtcclxuICAgICAgaWYgKHBlcm1pc3Npb25zU2VydmljZS5wZXJtaXNzaW9ucy5pbmRleE9mKHBlcm1pc3Npb24pID09PSAtMSkge1xyXG4gICAgICAgICAgcGVybWlzc2lvbi5pZCA9IE1hdGgucmFuZG9tKCk7XHJcbiAgICAgICAgICBwZXJtaXNzaW9uc1NlcnZpY2UucGVybWlzc2lvbnMucHVzaChwZXJtaXNzaW9uKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoJ3VzZXJzU2VydmljZScsIFtdKVxyXG4gICAgLmZhY3RvcnkoJ3VzZXJzU2VydmljZScsIFVzZXJzU2VydmljZSk7XHJcblxyXG5cclxuICBVc2Vyc1NlcnZpY2UuJGluamVjdCA9IFsnJGh0dHAnLCAnJHEnXTtcclxuXHJcbiAgZnVuY3Rpb24gVXNlcnNTZXJ2aWNlKCRodHRwLCAkcSkge1xyXG4gICAgdmFyIHVzZXJTZXJ2aWNlID0ge1xyXG4gICAgICB1c2VyczogW10sXHJcbiAgICAgIGZldGNoVXNlcnM6IGZldGNoVXNlcnMsXHJcbiAgICAgIGxvb2t1cEluQWN0aXZlRGlyZWN0b3J5OiBsb29rdXBJbkFjdGl2ZURpcmVjdG9yeSxcclxuICAgICAgc2F2ZVVzZXI6IHNhdmVVc2VyXHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiB1c2VyU2VydmljZTtcclxuXHJcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcblxyXG4gICAgZnVuY3Rpb24gZmV0Y2hVc2VycygpIHtcclxuICAgICAgcmV0dXJuICRodHRwLmdldCgnL3VzZXJzJykudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgIHVzZXJTZXJ2aWNlLnVzZXJzID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbG9va3VwSW5BY3RpdmVEaXJlY3RvcnkoY2FpKSB7XHJcbiAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvbG9va3VwSW5BY3RpdmVEaXJlY3RvcnknLCB7IGNhaTogY2FpIH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2F2ZVVzZXIodXNlcikge1xyXG4gICAgICAvL2lmIHVzZXIgaXMgbmV3XHJcbiAgICAgIGlmICghdXNlci5pZCkge1xyXG4gICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy91c2VycycsIHVzZXIpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgdXNlclNlcnZpY2UudXNlcnMucHVzaChyZXNwb25zZS5kYXRhKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5wdXQoJy91c2Vycy8nICsgdXNlci5pZCwgdXNlcikudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXIubW9kdWxlKCd1c2VyTW9kYWxEaWFsb2cnLCBbXSk7XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGFuZ3VsYXIubW9kdWxlKCd1c2VyTW9kYWxEaWFsb2cnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ3VzZXJNb2RhbERpYWxvZ0N0cmwnLCBVc2VyTW9kYWxEaWFsb2dDdHJsKTtcclxuXHJcbiAgICBVc2VyTW9kYWxEaWFsb2dDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckcScsICd1c2Vyc1NlcnZpY2UnLCAncGVybWlzc2lvbnNTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gVXNlck1vZGFsRGlhbG9nQ3RybCgkc2NvcGUsICRxLCB1c2Vyc1NlcnZpY2UsIHBlcm1pc3Npb25zU2VydmljZSkge1xyXG4gICAgICB2YXIgdm0gPSB0aGlzO1xyXG4gICAgICB2YXIgc2VsZWN0ZWRQZW1pc3Npb25zQXJlYXMgPSBbXTtcclxuXHJcbiAgICAgIGlmICghdm0udXNlcikge1xyXG4gICAgICAgIHZtLnVzZXIgPSB7fTtcclxuICAgICAgICB2bS5pc05ld1VzZXIgPSB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2bS5zYXZlVXNlciA9IHNhdmVVc2VyO1xyXG4gICAgICB2bS5sb29rdXBJbkFjdGl2ZURpcmVjdG9yeSA9IGxvb2t1cEluQWN0aXZlRGlyZWN0b3J5O1xyXG5cclxuICAgICAgaW5pdCgpO1xyXG4gICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICAgICAgcmV0dXJuICRxLmFsbChbXHJcbiAgICAgICAgICBwZXJtaXNzaW9uc1NlcnZpY2UuZmV0Y2hQZXJtaXNzaW9ucygpLFxyXG4gICAgICAgICAgcGVybWlzc2lvbnNTZXJ2aWNlLmZldGNoQXJlYXMoKVxyXG4gICAgICAgIF0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgIHZtLnBlcm1pc3Npb25zID0gcmVzcG9uc2VbMF07XHJcbiAgICAgICAgICBpZiAoIXZtLnVzZXIucGVybWlzc2lvbnMpIHtcclxuICAgICAgICAgICAgdm0udXNlci5wZXJtaXNzaW9ucyA9ICQuZXh0ZW5kKHRydWUsIFtdLCB2bS5wZXJtaXNzaW9ucyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB2bS5hcmVhcyA9IHJlc3BvbnNlWzFdO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBsb29rdXBJbkFjdGl2ZURpcmVjdG9yeShjYWkpe1xyXG4gICAgICAgIHVzZXJzU2VydmljZS5sb29rdXBJbkFjdGl2ZURpcmVjdG9yeShjYWkpLnRoZW4oZnVuY3Rpb24obmFtZSkge1xyXG4gICAgICAgICAgdm0udXNlci5uYW1lID0gbmFtZTtcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBjbGVhbkZvcm0oKSB7XHJcbiAgICAgICAgaWYgKHZtLmlzTmV3VXNlcikge1xyXG4gICAgICAgICAgdm0udXNlciA9IHt9O1xyXG4gICAgICAgICAgdm0udXNlci5wZXJtaXNzaW9ucyA9ICQuZXh0ZW5kKHRydWUsIFtdLCB2bS5wZXJtaXNzaW9ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBzYXZlVXNlcigpIHtcclxuICAgICAgICBpZiAodm0ucGVybWlzc2lvbnNGb3JtLiR2YWxpZCkge1xyXG4gICAgICAgICAgJHNjb3BlLiRlbWl0KCd2YWxpZEZvcm1EYXRhJyk7XHJcbiAgICAgICAgICB1c2Vyc1NlcnZpY2Uuc2F2ZVVzZXIoJC5leHRlbmQodHJ1ZSwge30sIHZtLnVzZXIpKS50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcclxuICAgICAgICAgICAgaWYgKCF2bS5pc05ld1VzZXIpIHtcclxuICAgICAgICAgICAgICAgIHZtLnVzZXIgPSB1c2VyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGNsZWFuRm9ybSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkc2NvcGUuJGVtaXQoJ2ludmFsaWRGb3JtRGF0YScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBhbmd1bGFyLm1vZHVsZSgndXNlck1vZGFsRGlhbG9nJylcclxuICAgIC5kaXJlY3RpdmUoJ3VzZXJNb2RhbERpYWxvZycsIHVzZXJNb2RhbERpYWxvZ0RpcmVjdGl2ZSk7XHJcblxyXG4gIHVzZXJNb2RhbERpYWxvZ0RpcmVjdGl2ZS4kaW5qZWN0ID0gWyckY29tcGlsZScsICckaHR0cCcsICckdGVtcGxhdGVDYWNoZSddO1xyXG5cclxuICBmdW5jdGlvbiB1c2VyTW9kYWxEaWFsb2dEaXJlY3RpdmUoJGNvbXBpbGUsICRodHRwLCAkdGVtcGxhdGVDYWNoZSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICBtb2RhbFRpdGxlOiAnQCcsXHJcbiAgICAgICAgICAgICAgdXNlcjogJz0/J1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAndXNlck1vZGFsRGlhbG9nQ3RybCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3VzZXJNb2RhbERpYWxvZycsXHJcbiAgICAgICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgICAgIGxpbms6IGxpbmtcclxuICAgIH07XHJcblxyXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcblxyXG4gICAgZnVuY3Rpb24gbGluaygkc2NvcGUsICRlbCwgJGF0dHIpIHtcclxuICAgICAgdmFyICRtb2RhbERpYWxvZztcclxuXHJcbiAgICAgICRlbC5vbignY2xpY2snLCBzaG93TW9kYWwpO1xyXG5cclxuICAgICAgJHNjb3BlLiRvbigndmFsaWRGb3JtRGF0YScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRtb2RhbERpYWxvZy5tb2RhbCgnaGlkZScpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgICRzY29wZS4kb24oJ2ludmFsaWRGb3JtRGF0YScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS51c2VyTW9kYWxEaWFsb2cucGVybWlzc2lvbnNGb3JtLiRkaXJ0eSA9IHRydWU7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAkZWwub2ZmKCdjbGljaycsIHNob3dNb2RhbCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuXHJcbiAgICAgIGZ1bmN0aW9uIHNob3dNb2RhbCgpIHtcclxuICAgICAgICB2YXIgbW9kYWxEaWFsb2dUbXBsID0kdGVtcGxhdGVDYWNoZVxyXG4gICAgICAgICAgLmdldCgnY29tcG9uZW50cy91c2VyLW1vZGFsLWRpYWxvZy91c2VyLW1vZGFsLWRpYWxvZy50ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG4gICAgICAgICAgJG1vZGFsRGlhbG9nID0gJCgkY29tcGlsZShtb2RhbERpYWxvZ1RtcGwpKCRzY29wZSkpO1xyXG4gICAgICAgICAgJG1vZGFsRGlhbG9nLm1vZGFsKCk7XHJcbiAgICAgICAgICAkbW9kYWxEaWFsb2cub25lKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJG1vZGFsRGlhbG9nLnJlbW92ZSgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXIubW9kdWxlKCd1c2VySXRlbScsIFtdKTtcclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoJ3VzZXJJdGVtJylcclxuICAgIC5jb250cm9sbGVyKCd1c2VySXRlbUN0cmwnLCBVc2VySXRlbUN0cmwpO1xyXG5cclxuICBVc2VySXRlbUN0cmwuJGluamVjdCA9IFsndXNlcnNTZXJ2aWNlJ107XHJcblxyXG4gIGZ1bmN0aW9uIFVzZXJJdGVtQ3RybCh1c2Vyc1NlcnZpY2UpIHtcclxuICAgIHZhciB2bSA9IHRoaXM7XHJcblxyXG4gICAgdm0uc2hvd0xpc3RPZkFsbG93ZWRGYWN0b3JpZXMgPSBzaG93TGlzdE9mQWxsb3dlZEZhY3RvcmllcztcclxuICAgIHZtLnNhdmVVc2VyID0gc2F2ZVVzZXI7XHJcblxyXG5cclxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuXHJcbiAgICBmdW5jdGlvbiBzYXZlVXNlcih1c2VyKSB7XHJcbiAgICAgIHVzZXJzU2VydmljZS5zYXZlVXNlcih1c2VyKS50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcclxuICAgICAgICB2bS51c2VyID0gdXNlcjtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2hvd0xpc3RPZkFsbG93ZWRGYWN0b3JpZXMoKSB7XHJcbiAgICAgIHJldHVybiB2bS51c2VyLnBlcm1pc3Npb25zLnJlZHVjZShmdW5jdGlvbihzdG9yZSwgcGVybWlzc2lvbikge1xyXG4gICAgICAgICAgaWYgKHBlcm1pc3Npb24uYWxsb3dlZCA9PT0gXCJ0cnVlXCIpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gc3RvcmUuY29uY2F0KHBlcm1pc3Npb24uYXJlYXMpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIHN0b3JlO1xyXG4gICAgICB9LCBbXSkuam9pbignLCcpO1xyXG4gICAgfVxyXG4gIH1cclxufSkoKTtcclxuIiwiXHJcbihmdW5jdGlvbigpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGFuZ3VsYXIubW9kdWxlKCd1c2VySXRlbScpXHJcbiAgICAuZGlyZWN0aXZlKCd1c2VySXRlbScsIHVzZXJJdGVtRGlyZWN0aXZlKTtcclxuXHJcbiAgZnVuY3Rpb24gdXNlckl0ZW1EaXJlY3RpdmUoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICBzY29wZToge1xyXG4gICAgICAgICAgdXNlcjogJz0nXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb250cm9sbGVyOiAndXNlckl0ZW1DdHJsJyxcclxuICAgICAgICBjb250cm9sbGVyQXM6ICd1c2VySXRlbScsXHJcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2NvbXBvbmVudHMvdXNlcnMtbGlzdC91c2VyLWl0ZW0vdXNlci1pdGVtLnRlbXBsYXRlLmh0bWwnLFxyXG4gICAgICAgIGxpbms6IGxpbmtcclxuICAgIH07XHJcblxyXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuXHJcbiAgICBmdW5jdGlvbiBsaW5rKCRzY29wZSwgJGVsLCAkYXR0cikge1xyXG5cclxuICAgIH1cclxuICB9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXIubW9kdWxlKCd1c2Vyc1NvcnRpbmcnLCBbXSk7XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGFuZ3VsYXIubW9kdWxlKCd1c2Vyc1NvcnRpbmcnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ3VzZXJzU29ydGluZ0N0cmwnLCBVc2Vyc1NvcnRpbmdDdHJsKTtcclxuXHJcbiAgVXNlcnNTb3J0aW5nQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnXTtcclxuXHJcbiAgZnVuY3Rpb24gVXNlcnNTb3J0aW5nQ3RybCgkc2NvcGUpIHtcclxuICAgIHZhciB2bSA9IHRoaXM7XHJcblxyXG4gICAgdm0uc2VsZWN0RmllbGQgPSBzZWxlY3RGaWVsZFxyXG4gICAgdm0uY2hhbmdlUmV2ZXJzZU1vZGUgPSBjaGFuZ2VSZXZlcnNlTW9kZTtcclxuXHJcbiAgICBmdW5jdGlvbiBjaGFuZ2VSZXZlcnNlTW9kZSgpIHtcclxuICAgICAgdm0uc29ydEluUmV2ZXJzZU1vZGUgPSAhdm0uc29ydEluUmV2ZXJzZU1vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2VsZWN0RmllbGQoZmllbGQpIHtcclxuICAgICAgICB2bS5zZWxlY3RlZEZpZWxkID0gZmllbGQ7XHJcbiAgICB9XHJcbiAgfVxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBhbmd1bGFyLm1vZHVsZSgndXNlcnNTb3J0aW5nJylcclxuICAgIC5kaXJlY3RpdmUoJ3VzZXJzU29ydGluZycsIHVzZXJzU29ydGluZ0RpcmVjdGl2ZSk7XHJcblxyXG4gIGZ1bmN0aW9uIHVzZXJzU29ydGluZ0RpcmVjdGl2ZSgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgc29ydEluUmV2ZXJzZU1vZGU6ICc9JyxcclxuICAgICAgICAgICAgZmllbGRzOiAnPScsXHJcbiAgICAgICAgICAgIHNlbGVjdGVkRmllbGQ6ICc9J1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGNvbnRyb2xsZXI6ICd1c2Vyc1NvcnRpbmdDdHJsJyxcclxuICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3VzZXJzU29ydGluZycsXHJcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2NvbXBvbmVudHMvdXNlcnMtbGlzdC91c2Vycy1zb3J0aW5nL3VzZXJzLXNvcnRpbmcudGVtcGxhdGUuaHRtbCcsXHJcbiAgICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgICAgbGluazogbGlua1xyXG4gICAgfTtcclxuXHJcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuXHJcbiAgICBmdW5jdGlvbiBsaW5rKCRzY29wZSwgJGVsLCAkYXR0cikge1xyXG5cclxuICAgIH1cclxuICB9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXIubW9kdWxlKCd1c2Vyc0xpc3QnLCBbXHJcblx0XHQndXNlck1vZGFsRGlhbG9nJyxcclxuXHRcdCd1c2VySXRlbScsXHJcblx0XHQndXNlcnNTb3J0aW5nJyxcclxuXHRcdCd1c2Vyc1NlcnZpY2UnLFxyXG5cdFx0J3Blcm1pc3Npb25zU2VydmljZSdcclxuXHRdKTtcclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoJ3VzZXJzTGlzdCcpXHJcbiAgICAuZmlsdGVyKCdmaWx0ZXJVc2Vyc0J5UXVlcnknLCBmaWx0ZXJVc2Vyc0J5UXVlcnlGaWx0ZXIpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGZpbHRlclVzZXJzQnlRdWVyeUZpbHRlcigpIHtcclxuICAgICAgZnVuY3Rpb24gaXNQZW1pc3Npb25zTWF0Y2gocGVybWlzc2lvbnMsIHBhdHRlcm4pIHtcclxuICAgICAgICByZXR1cm4gcGVybWlzc2lvbnMuc29tZShmdW5jdGlvbihwZXJtaXNzaW9uKSB7XHJcbiAgICAgICAgICByZXR1cm4gcGVybWlzc2lvbi5hcmVhcyAmJiBwZXJtaXNzaW9uLmFyZWFzLmxlbmd0aCAmJlxyXG4gICAgICAgICAgKHBhdHRlcm4udGVzdChwZXJtaXNzaW9uLm5hbWUpIHx8IGlzQXJlYXNNYXRjaChwZXJtaXNzaW9uLmFyZWFzLCBwYXR0ZXJuKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGlzQXJlYXNNYXRjaChhcmVhcywgcGF0dGVybikge1xyXG4gICAgICAgIHJldHVybiBhcmVhcy5zb21lKGZ1bmN0aW9uKGFyZWEpIHtcclxuICAgICAgICAgIHJldHVybiBwYXR0ZXJuLnRlc3QoYXJlYS5uYW1lKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHVzZXJzLCBxdWVyeSkge1xyXG4gICAgICAgIHZhciByZWdleCA9IG5ldyBSZWdFeHAocXVlcnksICdnaScpO1xyXG4gICAgICAgIHJldHVybiB1c2Vycy5maWx0ZXIoZnVuY3Rpb24odXNlcikge1xyXG4gICAgICAgICAgcmV0dXJuIHJlZ2V4LnRlc3QodXNlci5uYW1lKSB8fFxyXG4gICAgICAgICAgICAgICAgIHJlZ2V4LnRlc3QodXNlci5jYWkpIHx8XHJcbiAgICAgICAgICAgICAgICAgaXNQZW1pc3Npb25zTWF0Y2godXNlci5wZXJtaXNzaW9ucywgcmVnZXgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9O1xyXG4gICAgfVxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBhbmd1bGFyLm1vZHVsZSgndXNlcnNMaXN0JylcclxuICAgIC5jb250cm9sbGVyKCd1c2Vyc0N0cmwnLCBVc2Vyc0N0cmwpO1xyXG5cclxuICBVc2Vyc0N0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJyRmaWx0ZXInLCd1c2Vyc1NlcnZpY2UnXTtcclxuXHJcbiAgZnVuY3Rpb24gVXNlcnNDdHJsKCRzY29wZSwgJGZpbHRlciwgdXNlcnNTZXJ2aWNlKSB7XHJcbiAgICB2YXIgdm0gPSB0aGlzO1xyXG5cclxuICAgIHZtLnNlYXJjaFF1ZXJ5ID0gJyc7XHJcbiAgICB2bS5zb3J0SW5SZXZlcnNlTW9kZSA9IGZhbHNlO1xyXG4gICAgdm0uZmllbGRzID0gWyduYW1lJywgJ2NhaScsICdhY3RpdmUnXTtcclxuICAgIHZtLnNlbGVjdGVkRmllbGQgPSB2bS5maWVsZHNbMF07XHJcbiAgICB2bS51c2VycyA9IHVzZXJzU2VydmljZS51c2VycztcclxuICAgIHZtLmdldExpc3RPZlVzZXJzID0gZ2V0TGlzdE9mVXNlcnM7XHJcblxyXG4gICAgaW5pdCgpO1xyXG5cclxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRMaXN0T2ZVc2VycygpIHtcclxuICAgICAgICByZXR1cm4gJGZpbHRlcignZmlsdGVyVXNlcnNCeVF1ZXJ5Jykodm0udXNlcnMsIHZtLnNlYXJjaFF1ZXJ5KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgICAgIHJldHVybiB1c2Vyc1NlcnZpY2UuZmV0Y2hVc2VycygpLnRoZW4oZnVuY3Rpb24odXNlcnMpIHtcclxuICAgICAgICAgICAgdm0udXNlcnMgPSB1c2VycztcclxuICAgICAgICAgICAgcmV0dXJuIHVzZXJzO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoJ3VzZXJzTGlzdCcpXHJcbiAgICAuZGlyZWN0aXZlKCd1c2VyU2VhcmNoJywgdXNlclNlYXJjaERpcmVjdGl2ZSk7XHJcblxyXG4gIGZ1bmN0aW9uIHVzZXJTZWFyY2hEaXJlY3RpdmUoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgc2NvcGU6IHtcclxuICAgICAgICBzZWFyY2hRdWVyeTogJz0nXHJcbiAgICAgIH0sXHJcbiAgICAgIHRlbXBsYXRlOiAnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmctbW9kZWw9XCJzZWFyY2hRdWVyeVwiIG5nLW1vZGVsLW9wdGlvbnM9XCJ7ZGVib3VuY2U6IDMwMH1cIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIHBsYWNlaG9sZGVyPVwic2VhcmNoXCI+JyxcclxuICAgICAgbGluazogbGlua1xyXG4gICAgfTtcclxuXHJcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG5cclxuICAgIGZ1bmN0aW9uIGxpbmsoJHNjb3BlLCAkZWwsICRhdHRyKSB7XHJcblxyXG4gICAgfVxyXG4gIH1cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoJ3VzZXJzTGlzdCcpXHJcbiAgICAuZGlyZWN0aXZlKCd1c2Vyc0xpc3QnLCB1c2VyTGlzdERpcmVjdGl2ZSk7XHJcblxyXG4gIGZ1bmN0aW9uIHVzZXJMaXN0RGlyZWN0aXZlKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICB1c2VyczogJz0nXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgY29udHJvbGxlcjogJ3VzZXJzQ3RybCcsXHJcbiAgICAgICAgICBjb250cm9sbGVyQXM6ICd1c2Vyc0xpc3QnLFxyXG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICdjb21wb25lbnRzL3VzZXJzLWxpc3QvdXNlcnMtbGlzdC50ZW1wbGF0ZS5odG1sJyxcclxuICAgICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgICBsaW5rOiBsaW5rXHJcbiAgICB9O1xyXG5cclxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG5cclxuICAgIGZ1bmN0aW9uIGxpbmsoJHNjb3BlLCAkZWwsICRhdHRyKSB7XHJcblxyXG4gICAgfVxyXG4gIH1cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy9hbmd1bGFyLm1vZHVsZSgnYWRtaW4ucGVybWlzc2lvbnMnKS5jb25maWcoKTtcclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoJ2FkbWluLnBlcm1pc3Npb25zJywgW1xyXG4gICAgICAnbmdNb2NrRTJFJyxcclxuICAgICAgJ2FkbWluLnBlcm1pc3Npb25zLnRlbXBsYXRlcycsXHJcbiAgICAgICdjaGVja2xpc3RNb2RlbCcsXHJcbiAgICAgICd1c2Vyc0xpc3QnXHJcbiAgICBdKVxyXG4gICAgLnJ1bihydW5QZXJtaXNzaW9uc01vZHVsZSk7XHJcblxyXG4gIHJ1blBlcm1pc3Npb25zTW9kdWxlLiRpbmplY3QgPSBbJyRodHRwQmFja2VuZCcsICckaHR0cCddO1xyXG5cclxuICBmdW5jdGlvbiBydW5QZXJtaXNzaW9uc01vZHVsZSgkaHR0cEJhY2tlbmQsICRodHRwKSB7XHJcbiAgICB2YXIgYXJlYXMgPSBbXHJcbiAgICAgIHsgaWQ6IDEsIG5hbWU6ICdYWVonIH0sXHJcbiAgICAgIHsgaWQ6IDIsIG5hbWU6J0FCQycgfSxcclxuICAgICAgeyBpZDogMywgbmFtZTonREVGJyB9LFxyXG4gICAgICB7IGlkOiA0LCBuYW1lOiAnYWxsJyB9XHJcbiAgICBdO1xyXG4gICAgdmFyIHBlcm1pc3Npb25zID0gW1xyXG4gICAgICB7IGlkOiAxLCBuYW1lOiAnQ0QgRWRpdCcsICAgYWN0aXZlOiB0cnVlIH0sXHJcbiAgICAgIHsgaWQ6IDIsIG5hbWU6ICdDRCBDcmVhdGUnLCBhY3RpdmU6IGZhbHNlIH0sXHJcbiAgICAgIHsgaWQ6IDMsIG5hbWU6ICdQUkkgRWRpdCcsICBhY3RpdmU6IGZhbHNlIH0sXHJcbiAgICAgIHsgaWQ6IDQsIG5hbWU6ICdEUFIgRWRpdCcsICBhY3RpdmU6IHRydWUgfSxcclxuICAgICAgeyBpZDogNSwgbmFtZTogJ0VYRUMgRWRpdCcsIGFjdGl2ZTogdHJ1ZSB9LFxyXG4gICAgICB7IGlkOiA2LCBuYW1lOiAnT1BFUiBFZGl0JywgYWN0aXZlOiBmYWxzZSB9XHJcbiAgICBdO1xyXG4gICAgdmFyIHVzZXJzID0gW1xyXG4gICAgICB7IGlkOiAxLCBuYW1lOiAnVXNlcjEnLCBjYWk6ICdUVVNFUjMnLCBhY3RpdmU6IHRydWUsIHBlcm1pc3Npb25zOiBbXHJcbiAgICAgICAgICB7IGlkOiAxLCBuYW1lOiAnQ0QgRWRpdCcsIGFjdGl2ZTogdHJ1ZSwgYXJlYXM6IFtdIH0sXHJcbiAgICAgICAgICB7IGlkOiAyLCBuYW1lOiAnQ0QgQ3JlYXRlJywgYWN0aXZlOiBmYWxzZSwgYXJlYXM6IFtdIH0sXHJcbiAgICAgICAgICB7IGlkOiAzLCBuYW1lOiAnUFJJIEVkaXQnLCBhY3RpdmU6IGZhbHNlLCBhcmVhczogW1xyXG4gICAgICAgICAgICAgIHsgaWQ6IDIsIG5hbWU6J0FCQycgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgeyBpZDogNCwgbmFtZTogJ0RQUiBFZGl0JywgYWN0aXZlOiB0cnVlLCBhcmVhczogW1xyXG4gICAgICAgICAgICAgIHsgaWQ6IDMsIG5hbWU6J0RFRicgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgeyBpZDogNSwgbmFtZTogJ0VYRUMgRWRpdCcsIGFjdGl2ZTogdHJ1ZSwgYXJlYXM6IFtcclxuICAgICAgICAgICAgICB7IGlkOiA0LCBuYW1lOiAnYWxsJyB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7IGlkOiA2LCBuYW1lOiAnT1BFUiBFZGl0JywgYWN0aXZlOiBmYWxzZSwgYXJlYXM6IFtdIH1cclxuICAgICAgICBdXHJcbiAgICAgIH0sXHJcbiAgICAgIHsgaWQ6IDIsIG5hbWU6ICdVc2VyMicsIGNhaTogJ1RVU0VSMScsIGFjdGl2ZTogdHJ1ZSwgcGVybWlzc2lvbnM6IFtcclxuICAgICAgICAgIHsgaWQ6IDEsIG5hbWU6ICdDRCBFZGl0JywgYWN0aXZlOiB0cnVlLCBhcmVhczogW1xyXG4gICAgICAgICAgICAgIHsgaWQ6IDEsIG5hbWU6ICdYWVonIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHsgaWQ6IDIsIG5hbWU6ICdDRCBDcmVhdGUnLCBhY3RpdmU6IGZhbHNlLCBhcmVhczogW11cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7IGlkOiAzLCBuYW1lOiAnUFJJIEVkaXQnLCBhY3RpdmU6IGZhbHNlLCBhcmVhczogW10gfSxcclxuICAgICAgICAgIHsgaWQ6IDQsIG5hbWU6ICdEUFIgRWRpdCcsIGFjdGl2ZTogdHJ1ZSwgYXJlYXM6IFtcclxuICAgICAgICAgICAgICB7IGlkOiAzLCBuYW1lOidERUYnIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHsgaWQ6IDUsIG5hbWU6ICdFWEVDIEVkaXQnLCBhY3RpdmU6IHRydWUsIGFyZWFzOiBbXHJcbiAgICAgICAgICAgICAgeyBpZDogNCwgbmFtZTogJ2FsbCcgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgeyBpZDogNiwgbmFtZTogJ09QRVIgRWRpdCcsIGFjdGl2ZTogZmFsc2UsIGFyZWFzOiBbXSB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICBdO1xyXG5cclxuXHJcbiAgICAkaHR0cEJhY2tlbmQud2hlbkdFVCgvXFwudGVtcGxhdGVcXC5odG1sLykucGFzc1Rocm91Z2goKTtcclxuXHJcbiAgICAkaHR0cEJhY2tlbmQud2hlbkdFVCgnL3VzZXJzJykucmVzcG9uZCh1c2Vycyk7XHJcblxyXG4gICAgJGh0dHBCYWNrZW5kLndoZW5QT1NUKCcvbG9va3VwSW5BY3RpdmVEaXJlY3RvcnknKS5yZXNwb25kKCdVc2VyMycpO1xyXG5cclxuICAgICRodHRwQmFja2VuZC53aGVuUE9TVCgnL3VzZXJzJykucmVzcG9uZChmdW5jdGlvbihtZXRob2QsIHVybCwgdXNlcikge1xyXG4gICAgICAgIHVzZXIgPSBKU09OLnBhcnNlKHVzZXIpO1xyXG4gICAgICAgIHVzZXIuaWQgPSBNYXRoLnJhbmRvbSgpO1xyXG4gICAgICAgIHVzZXJzLnB1c2godXNlcik7XHJcbiAgICAgICAgcmV0dXJuIFsyMDEsIHVzZXIsIHt9XTtcclxuICAgIH0pO1xyXG5cclxuICAgICRodHRwQmFja2VuZC53aGVuUFVUKC91c2Vyc1xcL1xcZCsvKS5yZXNwb25kKGZ1bmN0aW9uKG1ldGhvZCwgdXJsLCB1c2VyKSB7XHJcbiAgICAgIHZhciB1c2VySW5kZXg7XHJcbiAgICAgIHZhciBvbGRVc2VyRGF0YTtcclxuXHJcbiAgICAgIHVzZXIgPSBKU09OLnBhcnNlKHVzZXIpO1xyXG4gICAgICBvbGRVc2VyRGF0YSA9IHVzZXJzLmZpbmQoZnVuY3Rpb24odXNlckl0ZW0sIGluZGV4KSB7XHJcbiAgICAgICAgaWYgKHVzZXJJdGVtLmlkID09PSB1c2VyLmlkKSB7XHJcbiAgICAgICAgICB1c2VySW5kZXggPSBpbmRleDtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAob2xkVXNlckRhdGEpIHtcclxuICAgICAgICB1c2Vycy5zcGxpY2UodXNlckluZGV4LCAxLCB1c2VyKTtcclxuICAgICAgICByZXR1cm4gWzIwMCwgdXNlciwge31dO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAkaHR0cEJhY2tlbmQud2hlbkdFVCgnL2FyZWFzJykucmVzcG9uZChhcmVhcyk7XHJcblxyXG4gICAgJGh0dHBCYWNrZW5kLndoZW5HRVQoJy9wZXJtaXNzaW9ucycpLnJlc3BvbmQocGVybWlzc2lvbnMpO1xyXG4gIH1cclxufSkoKTtcclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
