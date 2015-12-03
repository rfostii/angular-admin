(function() {
  'use strict';

  angular.module('admin.permissions.common.adjustSizeDirective', [])
    .directive('adjustSize', adjustSizeDirective);

  
  adjustSizeDirective.$inject = ['$window'];

  function adjustSizeDirective($window) {
    return {
      restrict: 'A',
      scope: true,
      link: link
    };

    ///////////////////////////////

    function debounce(func, delay) {
      var timer;

      return function() {
        if (timer) {
          clearTimeout(timer);
        }         
        timer = setTimeout(func, delay)
      }
    }

    function link(scope, element, attrs) {
      var $element = $(element)
      var elementWidth = $element.width();

      $window.onresize = debounce(onResize, 300);

      scope.$on('$destroy', function() {
        $window.onresize = null;
      });

      function onResize(event) {
        if (elementWidth >= $window.innerWidth) {
          $element.width($window.innerWidth);
        } else {
          $element.width(elementWidth);
        }
      }
    }
  }    
})();

(function() {
  'use strict';

  angular.module('admin.permissions.common.checklistModelDirective', [])
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

  angular.module('admin.permissions.services.permissionsService', [])
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

  angular.module('admin.permissions.services.usersService', [])
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

  angular.module('admin.permissions.userModalDialog.userModalDialogCtrl', [
    'admin.permissions.services.usersService',
    'admin.permissions.services.permissionsService'
  ]).controller('userModalDialogCtrl', UserModalDialogCtrl);

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

  angular.module('admin.permissions.userModalDialog.userModalDialogDirective', [
    'admin.permissions.userModalDialog.userModalDialogCtrl'
  ]).directive('userModalDialog', userModalDialogDirective);

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

	angular.module('admin.permissions.userModalDialog', [
		'admin.permissions.userModalDialog.userModalDialogCtrl',
		'admin.permissions.userModalDialog.userModalDialogDirective'
	]);
})();

(function() {
  'use strict';

  angular.module('admin.permissions.userItem.userItemCtrl', [
    'admin.permissions.services.usersService'
  ]).controller('userItemCtrl', UserItemCtrl);

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

  angular.module('admin.permissions.userItem.userItemDirective', [
    'admin.permissions.userItem.userItemCtrl',
    'admin.permissions.common.checklistModelDirective'
  ]).directive('userItem', userItemDirective);

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

	angular.module('admin.permissions.userItem', [
		'admin.permissions.userItem.userItemCtrl',
		'admin.permissions.userItem.userItemDirective'
	]);
})();

(function() {
  'use strict';

  angular.module('admin.permissions.usersSorting.usersSortingCtrl', [])
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

  angular.module('admin.permissions.usersSorting.usersSortingDirective', [
    'admin.permissions.usersSorting.usersSortingCtrl'
  ]).directive('usersSorting', usersSortingDirective);

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

	angular.module('admin.permissions.usersSorting', [
		'admin.permissions.usersSorting.usersSortingDirective',
    	'admin.permissions.usersSorting.usersSortingCtrl'
	]);
})();

(function() {
  'use strict';

  angular.module('admin.permissions.usersList.filterUsersByQuery', [])
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

  angular.module('admin.permissions.usersList.usersCtrl', [
    'admin.permissions.usersList.filterUsersByQuery',
    'admin.permissions.services.usersService'
  ])
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

  angular.module('admin.permissions.usersList.userSearchDirective', [])
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

  angular.module('admin.permissions.usersList.userListDirective', [
    'admin.permissions.usersList.usersCtrl'
  ]).directive('usersList', userListDirective);

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

	angular.module('admin.permissions.usersList', [
		'admin.permissions.usersList.userSearchDirective',
		'admin.permissions.usersList.filterUsersByQuery',
		'admin.permissions.usersList.usersCtrl',
		'admin.permissions.usersList.userListDirective',
		'admin.permissions.userItem',
		'admin.permissions.usersSorting',
		'admin.permissions.userModalDialog'
	]);
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
      'admin.permissions.common.adjustSizeDirective',
      'admin.permissions.usersList'
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFkanVzdC1zaXplLmRpcmVjdGl2ZS5qcyIsImNoZWNrbGlzdC1tb2RlbC5kaXJlY3RpdmUuanMiLCJwZXJtaXNzaW9ucy5zZXJ2aWNlLmpzIiwidXNlcnMuc2VydmljZS5qcyIsInVzZXItbW9kYWwtZGlhbG9nLmNvbnRyb2xsZXIuanMiLCJ1c2VyLW1vZGFsLWRpYWxvZy5kaXJlY3RpdmUuanMiLCJ1c2VyLW1vZGFsLWRpYWxvZy5qcyIsInVzZXItaXRlbS5jb250cm9sbGVyLmpzIiwidXNlci1pdGVtLmRpcmVjdGl2ZS5qcyIsInVzZXItaXRlbS5qcyIsInVzZXJzLXNvcnRpbmcuY29udHJvbGxlci5qcyIsInVzZXJzLXNvcnRpbmcuZGlyZWN0aXZlLmpzIiwidXNlcnMtc29ydGluZy5qcyIsImZpbHRlci11c2Vycy1ieS1xdWVyeS5maWx0ZXIuanMiLCJ1c2Vycy1saXN0LmNvbnRyb2xsZXIuanMiLCJ1c2VyLXNlYXJjaC5kaXJlY3RpdmUuanMiLCJ1c2Vycy1saXN0LmRpcmVjdGl2ZS5qcyIsInVzZXJzLWxpc3QuanMiLCJwZXJtaXNzaW9ucy1tYW5hZ2VyLmNvbmZpZy5qcyIsInBlcm1pc3Npb25zLW1hbmFnZXIubW9kdWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGFuZ3VsYXIubW9kdWxlKCdhZG1pbi5wZXJtaXNzaW9ucy5jb21tb24uYWRqdXN0U2l6ZURpcmVjdGl2ZScsIFtdKVxyXG4gICAgLmRpcmVjdGl2ZSgnYWRqdXN0U2l6ZScsIGFkanVzdFNpemVEaXJlY3RpdmUpO1xyXG5cclxuICBcclxuICBhZGp1c3RTaXplRGlyZWN0aXZlLiRpbmplY3QgPSBbJyR3aW5kb3cnXTtcclxuXHJcbiAgZnVuY3Rpb24gYWRqdXN0U2l6ZURpcmVjdGl2ZSgkd2luZG93KSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICBzY29wZTogdHJ1ZSxcclxuICAgICAgbGluazogbGlua1xyXG4gICAgfTtcclxuXHJcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcblxyXG4gICAgZnVuY3Rpb24gZGVib3VuY2UoZnVuYywgZGVsYXkpIHtcclxuICAgICAgdmFyIHRpbWVyO1xyXG5cclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICh0aW1lcikge1xyXG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcclxuICAgICAgICB9ICAgICAgICAgXHJcbiAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmMsIGRlbGF5KVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KVxyXG4gICAgICB2YXIgZWxlbWVudFdpZHRoID0gJGVsZW1lbnQud2lkdGgoKTtcclxuXHJcbiAgICAgICR3aW5kb3cub25yZXNpemUgPSBkZWJvdW5jZShvblJlc2l6ZSwgMzAwKTtcclxuXHJcbiAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAkd2luZG93Lm9ucmVzaXplID0gbnVsbDtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBmdW5jdGlvbiBvblJlc2l6ZShldmVudCkge1xyXG4gICAgICAgIGlmIChlbGVtZW50V2lkdGggPj0gJHdpbmRvdy5pbm5lcldpZHRoKSB7XHJcbiAgICAgICAgICAkZWxlbWVudC53aWR0aCgkd2luZG93LmlubmVyV2lkdGgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkZWxlbWVudC53aWR0aChlbGVtZW50V2lkdGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gICAgXHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGFuZ3VsYXIubW9kdWxlKCdhZG1pbi5wZXJtaXNzaW9ucy5jb21tb24uY2hlY2tsaXN0TW9kZWxEaXJlY3RpdmUnLCBbXSlcclxuICAgIC5kaXJlY3RpdmUoJ2NoZWNrbGlzdE1vZGVsJywgWyckcGFyc2UnLCAnJGNvbXBpbGUnLCBmdW5jdGlvbigkcGFyc2UsICRjb21waWxlKSB7XHJcblxyXG4gICAgICBmdW5jdGlvbiBjb250YWlucyhhcnIsIGl0ZW0sIGNvbXBhcmF0b3IpIHtcclxuICAgICAgICBpZiAoYW5ndWxhci5pc0FycmF5KGFycikpIHtcclxuICAgICAgICAgIGZvciAodmFyIGkgPSBhcnIubGVuZ3RoOyBpLS07KSB7XHJcbiAgICAgICAgICAgIGlmIChjb21wYXJhdG9yKGFycltpXSwgaXRlbSkpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGFkZChhcnIsIGl0ZW0sIGNvbXBhcmF0b3IpIHtcclxuICAgICAgICBhcnIgPSBhbmd1bGFyLmlzQXJyYXkoYXJyKSA/IGFyciA6IFtdO1xyXG4gICAgICAgICAgaWYoIWNvbnRhaW5zKGFyciwgaXRlbSwgY29tcGFyYXRvcikpIHtcclxuICAgICAgICAgICAgICBhcnIucHVzaChpdGVtKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYXJyO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiByZW1vdmUoYXJyLCBpdGVtLCBjb21wYXJhdG9yKSB7XHJcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNBcnJheShhcnIpKSB7XHJcbiAgICAgICAgICBmb3IgKHZhciBpID0gYXJyLmxlbmd0aDsgaS0tOykge1xyXG4gICAgICAgICAgICBpZiAoY29tcGFyYXRvcihhcnJbaV0sIGl0ZW0pKSB7XHJcbiAgICAgICAgICAgICAgYXJyLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYXJyO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBwb3N0TGlua0ZuKCRzY29wZSwgJGVsZW0sICRhdHRycykge1xyXG4gICAgICAgIHZhciBjaGVja2xpc3RNb2RlbCA9ICRhdHRycy5jaGVja2xpc3RNb2RlbDtcclxuICAgICAgICB2YXIgZ2V0dGVyID0gJHBhcnNlKGNoZWNrbGlzdE1vZGVsKTtcclxuICAgICAgICB2YXIgc2V0dGVyID0gZ2V0dGVyLmFzc2lnbjtcclxuICAgICAgICB2YXIgdmFsdWUgPSAkYXR0cnMuY2hlY2tsaXN0VmFsdWUgPyAkcGFyc2UoJGF0dHJzLmNoZWNrbGlzdFZhbHVlKSgkc2NvcGUuJHBhcmVudCkgOiAkYXR0cnMudmFsdWU7XHJcbiAgICAgICAgdmFyIGNvbXBhcmF0b3IgPSBhbmd1bGFyLmVxdWFscztcclxuXHJcbiAgICAgICAgJGF0dHJzLiRzZXQoXCJjaGVja2xpc3RNb2RlbFwiLCBudWxsKTtcclxuICAgICAgICAkY29tcGlsZSgkZWxlbSkoJHNjb3BlKTtcclxuICAgICAgICAkYXR0cnMuJHNldChcImNoZWNrbGlzdE1vZGVsXCIsIGNoZWNrbGlzdE1vZGVsKTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiR3YXRjaCgkYXR0cnMubmdNb2RlbCwgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XHJcbiAgICAgICAgICBpZiAobmV3VmFsdWUgIT09IG9sZFZhbHVlKSB7XHJcbiAgICAgICAgICAgIHNldFZhbHVlSW5DaGVja2xpc3RNb2RlbCh2YWx1ZSwgbmV3VmFsdWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRWYWx1ZUluQ2hlY2tsaXN0TW9kZWwodmFsdWUsIGNoZWNrZWQpIHtcclxuICAgICAgICAgIHZhciBjdXJyZW50ID0gZ2V0dGVyKCRzY29wZS4kcGFyZW50KTtcclxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2V0dGVyKSkge1xyXG4gICAgICAgICAgICBpZiAoY2hlY2tlZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgIHNldHRlcigkc2NvcGUuJHBhcmVudCwgYWRkKGN1cnJlbnQsIHZhbHVlLCBjb21wYXJhdG9yKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgc2V0dGVyKCRzY29wZS4kcGFyZW50LCByZW1vdmUoY3VycmVudCwgdmFsdWUsIGNvbXBhcmF0b3IpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0Q2hlY2tlZChuZXdBcnIsIG9sZEFycikge1xyXG4gICAgICAgICAgJHNjb3BlWyRhdHRycy5uZ01vZGVsXSA9IGNvbnRhaW5zKG5ld0FyciwgdmFsdWUsIGNvbXBhcmF0b3IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLiRwYXJlbnQuJHdhdGNoQ29sbGVjdGlvbihjaGVja2xpc3RNb2RlbCwgc2V0Q2hlY2tlZCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICBzY29wZTogdHJ1ZSxcclxuICAgICAgICBjb21waWxlOiBmdW5jdGlvbigkZWxlbWVudCwgJGF0dHJzKSB7XHJcbiAgICAgICAgICBpZiAoISRhdHRycy5jaGVja2xpc3RWYWx1ZSAmJiAhJGF0dHJzLnZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRocm93ICdZb3Ugc2hvdWxkIHByb3ZpZGUgYHZhbHVlYCBvciBgY2hlY2tsaXN0LXZhbHVlYC4nO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICghJGF0dHJzLm5nTW9kZWwpIHtcclxuICAgICAgICAgICAgJGF0dHJzLiRzZXQoXCJuZ01vZGVsXCIsIFwiY2hlY2tlZFwiKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gcG9zdExpbmtGbjtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9XSk7XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGFuZ3VsYXIubW9kdWxlKCdhZG1pbi5wZXJtaXNzaW9ucy5zZXJ2aWNlcy5wZXJtaXNzaW9uc1NlcnZpY2UnLCBbXSlcclxuICAgIC5mYWN0b3J5KCdwZXJtaXNzaW9uc1NlcnZpY2UnLCBQZXJtaXNzaW9uc1NlcnZpY2UpO1xyXG5cclxuICBQZXJtaXNzaW9uc1NlcnZpY2UuJGluamVjdCA9IFsnJGh0dHAnXTtcclxuXHJcbiAgZnVuY3Rpb24gUGVybWlzc2lvbnNTZXJ2aWNlKCRodHRwKSB7XHJcbiAgICB2YXIgcGVybWlzc2lvbnNTZXJ2aWNlID0ge1xyXG4gICAgICBwZXJtaXNzaW9uczogW10sXHJcbiAgICAgIGFyZWFzOiBbXSxcclxuICAgICAgZmV0Y2hQZXJtaXNzaW9uczogZmV0Y2hQZXJtaXNzaW9ucyxcclxuICAgICAgc2F2ZVBlcm1pc3Npb246IHNhdmVQZXJtaXNzaW9uLFxyXG4gICAgICBmZXRjaEFyZWFzOiBmZXRjaEFyZWFzXHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBwZXJtaXNzaW9uc1NlcnZpY2U7XHJcblxyXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG5cclxuICAgIGZ1bmN0aW9uIGZldGNoUGVybWlzc2lvbnMoKSB7XHJcbiAgICAgIC8vVE9ETzogZmV0Y2ggcmVhbCBkYXRhIGZyb20gc2VydmVyIHVzaW5nICRodHRwIHNlcnZpY2Ugb3IgJHJlc291cmNlXHJcbiAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9wZXJtaXNzaW9ucycpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICBwZXJtaXNzaW9uc1NlcnZpY2UucGVybWlzc2lvbnMgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBmZXRjaEFyZWFzKCkge1xyXG4gICAgICAvL1RPRE86IGZldGNoIHJlYWwgZGF0YSBmcm9tIHNlcnZlciB1c2luZyAkaHR0cCBzZXJ2aWNlIG9yICRyZXNvdXJjZVxyXG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXJlYXMnKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgcGVybWlzc2lvbnNTZXJ2aWNlLmFyZWFzID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2F2ZVBlcm1pc3Npb24ocGVybWlzc2lvbikge1xyXG4gICAgICBpZiAocGVybWlzc2lvbnNTZXJ2aWNlLnBlcm1pc3Npb25zLmluZGV4T2YocGVybWlzc2lvbikgPT09IC0xKSB7XHJcbiAgICAgICAgICBwZXJtaXNzaW9uLmlkID0gTWF0aC5yYW5kb20oKTtcclxuICAgICAgICAgIHBlcm1pc3Npb25zU2VydmljZS5wZXJtaXNzaW9ucy5wdXNoKHBlcm1pc3Npb24pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBhbmd1bGFyLm1vZHVsZSgnYWRtaW4ucGVybWlzc2lvbnMuc2VydmljZXMudXNlcnNTZXJ2aWNlJywgW10pXHJcbiAgICAuZmFjdG9yeSgndXNlcnNTZXJ2aWNlJywgVXNlcnNTZXJ2aWNlKTtcclxuXHJcblxyXG4gIFVzZXJzU2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICckcSddO1xyXG5cclxuICBmdW5jdGlvbiBVc2Vyc1NlcnZpY2UoJGh0dHAsICRxKSB7XHJcbiAgICB2YXIgdXNlclNlcnZpY2UgPSB7XHJcbiAgICAgIHVzZXJzOiBbXSxcclxuICAgICAgZmV0Y2hVc2VyczogZmV0Y2hVc2VycyxcclxuICAgICAgbG9va3VwSW5BY3RpdmVEaXJlY3Rvcnk6IGxvb2t1cEluQWN0aXZlRGlyZWN0b3J5LFxyXG4gICAgICBzYXZlVXNlcjogc2F2ZVVzZXJcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHVzZXJTZXJ2aWNlO1xyXG5cclxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuXHJcbiAgICBmdW5jdGlvbiBmZXRjaFVzZXJzKCkge1xyXG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvdXNlcnMnKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgdXNlclNlcnZpY2UudXNlcnMgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBsb29rdXBJbkFjdGl2ZURpcmVjdG9yeShjYWkpIHtcclxuICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9sb29rdXBJbkFjdGl2ZURpcmVjdG9yeScsIHsgY2FpOiBjYWkgfSkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzYXZlVXNlcih1c2VyKSB7XHJcbiAgICAgIC8vaWYgdXNlciBpcyBuZXdcclxuICAgICAgaWYgKCF1c2VyLmlkKSB7XHJcbiAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL3VzZXJzJywgdXNlcikudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICB1c2VyU2VydmljZS51c2Vycy5wdXNoKHJlc3BvbnNlLmRhdGEpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuICRodHRwLnB1dCgnL3VzZXJzLycgKyB1c2VyLmlkLCB1c2VyKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoJ2FkbWluLnBlcm1pc3Npb25zLnVzZXJNb2RhbERpYWxvZy51c2VyTW9kYWxEaWFsb2dDdHJsJywgW1xyXG4gICAgJ2FkbWluLnBlcm1pc3Npb25zLnNlcnZpY2VzLnVzZXJzU2VydmljZScsXHJcbiAgICAnYWRtaW4ucGVybWlzc2lvbnMuc2VydmljZXMucGVybWlzc2lvbnNTZXJ2aWNlJ1xyXG4gIF0pLmNvbnRyb2xsZXIoJ3VzZXJNb2RhbERpYWxvZ0N0cmwnLCBVc2VyTW9kYWxEaWFsb2dDdHJsKTtcclxuXHJcbiAgICBVc2VyTW9kYWxEaWFsb2dDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckcScsICd1c2Vyc1NlcnZpY2UnLCAncGVybWlzc2lvbnNTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gVXNlck1vZGFsRGlhbG9nQ3RybCgkc2NvcGUsICRxLCB1c2Vyc1NlcnZpY2UsIHBlcm1pc3Npb25zU2VydmljZSkge1xyXG4gICAgICB2YXIgdm0gPSB0aGlzO1xyXG4gICAgICB2YXIgc2VsZWN0ZWRQZW1pc3Npb25zQXJlYXMgPSBbXTtcclxuXHJcbiAgICAgIGlmICghdm0udXNlcikge1xyXG4gICAgICAgIHZtLnVzZXIgPSB7fTtcclxuICAgICAgICB2bS5pc05ld1VzZXIgPSB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2bS5zYXZlVXNlciA9IHNhdmVVc2VyO1xyXG4gICAgICB2bS5sb29rdXBJbkFjdGl2ZURpcmVjdG9yeSA9IGxvb2t1cEluQWN0aXZlRGlyZWN0b3J5O1xyXG5cclxuICAgICAgaW5pdCgpO1xyXG4gICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICAgICAgcmV0dXJuICRxLmFsbChbXHJcbiAgICAgICAgICBwZXJtaXNzaW9uc1NlcnZpY2UuZmV0Y2hQZXJtaXNzaW9ucygpLFxyXG4gICAgICAgICAgcGVybWlzc2lvbnNTZXJ2aWNlLmZldGNoQXJlYXMoKVxyXG4gICAgICAgIF0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgIHZtLnBlcm1pc3Npb25zID0gcmVzcG9uc2VbMF07XHJcbiAgICAgICAgICBpZiAoIXZtLnVzZXIucGVybWlzc2lvbnMpIHtcclxuICAgICAgICAgICAgdm0udXNlci5wZXJtaXNzaW9ucyA9ICQuZXh0ZW5kKHRydWUsIFtdLCB2bS5wZXJtaXNzaW9ucyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB2bS5hcmVhcyA9IHJlc3BvbnNlWzFdO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBsb29rdXBJbkFjdGl2ZURpcmVjdG9yeShjYWkpe1xyXG4gICAgICAgIHVzZXJzU2VydmljZS5sb29rdXBJbkFjdGl2ZURpcmVjdG9yeShjYWkpLnRoZW4oZnVuY3Rpb24obmFtZSkge1xyXG4gICAgICAgICAgdm0udXNlci5uYW1lID0gbmFtZTtcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBjbGVhbkZvcm0oKSB7XHJcbiAgICAgICAgaWYgKHZtLmlzTmV3VXNlcikge1xyXG4gICAgICAgICAgdm0udXNlciA9IHt9O1xyXG4gICAgICAgICAgdm0udXNlci5wZXJtaXNzaW9ucyA9ICQuZXh0ZW5kKHRydWUsIFtdLCB2bS5wZXJtaXNzaW9ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBzYXZlVXNlcigpIHtcclxuICAgICAgICBpZiAodm0ucGVybWlzc2lvbnNGb3JtLiR2YWxpZCkge1xyXG4gICAgICAgICAgJHNjb3BlLiRlbWl0KCd2YWxpZEZvcm1EYXRhJyk7XHJcbiAgICAgICAgICB1c2Vyc1NlcnZpY2Uuc2F2ZVVzZXIoJC5leHRlbmQodHJ1ZSwge30sIHZtLnVzZXIpKS50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcclxuICAgICAgICAgICAgaWYgKCF2bS5pc05ld1VzZXIpIHtcclxuICAgICAgICAgICAgICAgIHZtLnVzZXIgPSB1c2VyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGNsZWFuRm9ybSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkc2NvcGUuJGVtaXQoJ2ludmFsaWRGb3JtRGF0YScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBhbmd1bGFyLm1vZHVsZSgnYWRtaW4ucGVybWlzc2lvbnMudXNlck1vZGFsRGlhbG9nLnVzZXJNb2RhbERpYWxvZ0RpcmVjdGl2ZScsIFtcclxuICAgICdhZG1pbi5wZXJtaXNzaW9ucy51c2VyTW9kYWxEaWFsb2cudXNlck1vZGFsRGlhbG9nQ3RybCdcclxuICBdKS5kaXJlY3RpdmUoJ3VzZXJNb2RhbERpYWxvZycsIHVzZXJNb2RhbERpYWxvZ0RpcmVjdGl2ZSk7XHJcblxyXG4gIHVzZXJNb2RhbERpYWxvZ0RpcmVjdGl2ZS4kaW5qZWN0ID0gWyckY29tcGlsZScsICckaHR0cCcsICckdGVtcGxhdGVDYWNoZSddO1xyXG5cclxuICBmdW5jdGlvbiB1c2VyTW9kYWxEaWFsb2dEaXJlY3RpdmUoJGNvbXBpbGUsICRodHRwLCAkdGVtcGxhdGVDYWNoZSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICBtb2RhbFRpdGxlOiAnQCcsXHJcbiAgICAgICAgICAgICAgdXNlcjogJz0/J1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAndXNlck1vZGFsRGlhbG9nQ3RybCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3VzZXJNb2RhbERpYWxvZycsXHJcbiAgICAgICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgICAgIGxpbms6IGxpbmtcclxuICAgIH07XHJcblxyXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcblxyXG4gICAgZnVuY3Rpb24gbGluaygkc2NvcGUsICRlbCwgJGF0dHIpIHtcclxuICAgICAgdmFyICRtb2RhbERpYWxvZztcclxuXHJcbiAgICAgICRlbC5vbignY2xpY2snLCBzaG93TW9kYWwpO1xyXG5cclxuICAgICAgJHNjb3BlLiRvbigndmFsaWRGb3JtRGF0YScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRtb2RhbERpYWxvZy5tb2RhbCgnaGlkZScpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgICRzY29wZS4kb24oJ2ludmFsaWRGb3JtRGF0YScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS51c2VyTW9kYWxEaWFsb2cucGVybWlzc2lvbnNGb3JtLiRkaXJ0eSA9IHRydWU7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAkZWwub2ZmKCdjbGljaycsIHNob3dNb2RhbCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuXHJcbiAgICAgIGZ1bmN0aW9uIHNob3dNb2RhbCgpIHtcclxuICAgICAgICB2YXIgbW9kYWxEaWFsb2dUbXBsID0kdGVtcGxhdGVDYWNoZVxyXG4gICAgICAgICAgLmdldCgnY29tcG9uZW50cy91c2VyLW1vZGFsLWRpYWxvZy91c2VyLW1vZGFsLWRpYWxvZy50ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG4gICAgICAgICAgJG1vZGFsRGlhbG9nID0gJCgkY29tcGlsZShtb2RhbERpYWxvZ1RtcGwpKCRzY29wZSkpO1xyXG4gICAgICAgICAgJG1vZGFsRGlhbG9nLm1vZGFsKCk7XHJcbiAgICAgICAgICAkbW9kYWxEaWFsb2cub25lKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJG1vZGFsRGlhbG9nLnJlbW92ZSgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXIubW9kdWxlKCdhZG1pbi5wZXJtaXNzaW9ucy51c2VyTW9kYWxEaWFsb2cnLCBbXHJcblx0XHQnYWRtaW4ucGVybWlzc2lvbnMudXNlck1vZGFsRGlhbG9nLnVzZXJNb2RhbERpYWxvZ0N0cmwnLFxyXG5cdFx0J2FkbWluLnBlcm1pc3Npb25zLnVzZXJNb2RhbERpYWxvZy51c2VyTW9kYWxEaWFsb2dEaXJlY3RpdmUnXHJcblx0XSk7XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGFuZ3VsYXIubW9kdWxlKCdhZG1pbi5wZXJtaXNzaW9ucy51c2VySXRlbS51c2VySXRlbUN0cmwnLCBbXHJcbiAgICAnYWRtaW4ucGVybWlzc2lvbnMuc2VydmljZXMudXNlcnNTZXJ2aWNlJ1xyXG4gIF0pLmNvbnRyb2xsZXIoJ3VzZXJJdGVtQ3RybCcsIFVzZXJJdGVtQ3RybCk7XHJcblxyXG4gIFVzZXJJdGVtQ3RybC4kaW5qZWN0ID0gWyd1c2Vyc1NlcnZpY2UnXTtcclxuXHJcbiAgZnVuY3Rpb24gVXNlckl0ZW1DdHJsKHVzZXJzU2VydmljZSkge1xyXG4gICAgdmFyIHZtID0gdGhpcztcclxuXHJcbiAgICB2bS5zaG93TGlzdE9mQWxsb3dlZEZhY3RvcmllcyA9IHNob3dMaXN0T2ZBbGxvd2VkRmFjdG9yaWVzO1xyXG4gICAgdm0uc2F2ZVVzZXIgPSBzYXZlVXNlcjtcclxuXHJcblxyXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG5cclxuICAgIGZ1bmN0aW9uIHNhdmVVc2VyKHVzZXIpIHtcclxuICAgICAgdXNlcnNTZXJ2aWNlLnNhdmVVc2VyKHVzZXIpLnRoZW4oZnVuY3Rpb24odXNlcikge1xyXG4gICAgICAgIHZtLnVzZXIgPSB1c2VyO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzaG93TGlzdE9mQWxsb3dlZEZhY3RvcmllcygpIHtcclxuICAgICAgcmV0dXJuIHZtLnVzZXIucGVybWlzc2lvbnMucmVkdWNlKGZ1bmN0aW9uKHN0b3JlLCBwZXJtaXNzaW9uKSB7XHJcbiAgICAgICAgICBpZiAocGVybWlzc2lvbi5hbGxvd2VkID09PSBcInRydWVcIikge1xyXG4gICAgICAgICAgICAgIHJldHVybiBzdG9yZS5jb25jYXQocGVybWlzc2lvbi5hcmVhcyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gc3RvcmU7XHJcbiAgICAgIH0sIFtdKS5qb2luKCcsJyk7XHJcbiAgICB9XHJcbiAgfVxyXG59KSgpO1xyXG4iLCJcclxuKGZ1bmN0aW9uKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoJ2FkbWluLnBlcm1pc3Npb25zLnVzZXJJdGVtLnVzZXJJdGVtRGlyZWN0aXZlJywgW1xyXG4gICAgJ2FkbWluLnBlcm1pc3Npb25zLnVzZXJJdGVtLnVzZXJJdGVtQ3RybCcsXHJcbiAgICAnYWRtaW4ucGVybWlzc2lvbnMuY29tbW9uLmNoZWNrbGlzdE1vZGVsRGlyZWN0aXZlJ1xyXG4gIF0pLmRpcmVjdGl2ZSgndXNlckl0ZW0nLCB1c2VySXRlbURpcmVjdGl2ZSk7XHJcblxyXG4gIGZ1bmN0aW9uIHVzZXJJdGVtRGlyZWN0aXZlKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgIHVzZXI6ICc9J1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY29udHJvbGxlcjogJ3VzZXJJdGVtQ3RybCcsXHJcbiAgICAgICAgY29udHJvbGxlckFzOiAndXNlckl0ZW0nLFxyXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdjb21wb25lbnRzL3VzZXJzLWxpc3QvdXNlci1pdGVtL3VzZXItaXRlbS50ZW1wbGF0ZS5odG1sJyxcclxuICAgICAgICBsaW5rOiBsaW5rXHJcbiAgICB9O1xyXG5cclxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcblxyXG4gICAgZnVuY3Rpb24gbGluaygkc2NvcGUsICRlbCwgJGF0dHIpIHtcclxuXHJcbiAgICB9XHJcbiAgfVxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyLm1vZHVsZSgnYWRtaW4ucGVybWlzc2lvbnMudXNlckl0ZW0nLCBbXHJcblx0XHQnYWRtaW4ucGVybWlzc2lvbnMudXNlckl0ZW0udXNlckl0ZW1DdHJsJyxcclxuXHRcdCdhZG1pbi5wZXJtaXNzaW9ucy51c2VySXRlbS51c2VySXRlbURpcmVjdGl2ZSdcclxuXHRdKTtcclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoJ2FkbWluLnBlcm1pc3Npb25zLnVzZXJzU29ydGluZy51c2Vyc1NvcnRpbmdDdHJsJywgW10pXHJcbiAgICAuY29udHJvbGxlcigndXNlcnNTb3J0aW5nQ3RybCcsIFVzZXJzU29ydGluZ0N0cmwpO1xyXG5cclxuICBVc2Vyc1NvcnRpbmdDdHJsLiRpbmplY3QgPSBbJyRzY29wZSddO1xyXG5cclxuICBmdW5jdGlvbiBVc2Vyc1NvcnRpbmdDdHJsKCRzY29wZSkge1xyXG4gICAgdmFyIHZtID0gdGhpcztcclxuXHJcbiAgICB2bS5zZWxlY3RGaWVsZCA9IHNlbGVjdEZpZWxkXHJcbiAgICB2bS5jaGFuZ2VSZXZlcnNlTW9kZSA9IGNoYW5nZVJldmVyc2VNb2RlO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNoYW5nZVJldmVyc2VNb2RlKCkge1xyXG4gICAgICB2bS5zb3J0SW5SZXZlcnNlTW9kZSA9ICF2bS5zb3J0SW5SZXZlcnNlTW9kZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzZWxlY3RGaWVsZChmaWVsZCkge1xyXG4gICAgICAgIHZtLnNlbGVjdGVkRmllbGQgPSBmaWVsZDtcclxuICAgIH1cclxuICB9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGFuZ3VsYXIubW9kdWxlKCdhZG1pbi5wZXJtaXNzaW9ucy51c2Vyc1NvcnRpbmcudXNlcnNTb3J0aW5nRGlyZWN0aXZlJywgW1xyXG4gICAgJ2FkbWluLnBlcm1pc3Npb25zLnVzZXJzU29ydGluZy51c2Vyc1NvcnRpbmdDdHJsJ1xyXG4gIF0pLmRpcmVjdGl2ZSgndXNlcnNTb3J0aW5nJywgdXNlcnNTb3J0aW5nRGlyZWN0aXZlKTtcclxuXHJcbiAgZnVuY3Rpb24gdXNlcnNTb3J0aW5nRGlyZWN0aXZlKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICBzb3J0SW5SZXZlcnNlTW9kZTogJz0nLFxyXG4gICAgICAgICAgICBmaWVsZHM6ICc9JyxcclxuICAgICAgICAgICAgc2VsZWN0ZWRGaWVsZDogJz0nXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgY29udHJvbGxlcjogJ3VzZXJzU29ydGluZ0N0cmwnLFxyXG4gICAgICAgICAgY29udHJvbGxlckFzOiAndXNlcnNTb3J0aW5nJyxcclxuICAgICAgICAgIHRlbXBsYXRlVXJsOiAnY29tcG9uZW50cy91c2Vycy1saXN0L3VzZXJzLXNvcnRpbmcvdXNlcnMtc29ydGluZy50ZW1wbGF0ZS5odG1sJyxcclxuICAgICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgICBsaW5rOiBsaW5rXHJcbiAgICB9O1xyXG5cclxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG5cclxuICAgIGZ1bmN0aW9uIGxpbmsoJHNjb3BlLCAkZWwsICRhdHRyKSB7XHJcblxyXG4gICAgfVxyXG4gIH1cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhci5tb2R1bGUoJ2FkbWluLnBlcm1pc3Npb25zLnVzZXJzU29ydGluZycsIFtcclxuXHRcdCdhZG1pbi5wZXJtaXNzaW9ucy51c2Vyc1NvcnRpbmcudXNlcnNTb3J0aW5nRGlyZWN0aXZlJyxcclxuICAgIFx0J2FkbWluLnBlcm1pc3Npb25zLnVzZXJzU29ydGluZy51c2Vyc1NvcnRpbmdDdHJsJ1xyXG5cdF0pO1xyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBhbmd1bGFyLm1vZHVsZSgnYWRtaW4ucGVybWlzc2lvbnMudXNlcnNMaXN0LmZpbHRlclVzZXJzQnlRdWVyeScsIFtdKVxyXG4gICAgLmZpbHRlcignZmlsdGVyVXNlcnNCeVF1ZXJ5JywgZmlsdGVyVXNlcnNCeVF1ZXJ5RmlsdGVyKTtcclxuXHJcbiAgICBmdW5jdGlvbiBmaWx0ZXJVc2Vyc0J5UXVlcnlGaWx0ZXIoKSB7XHJcbiAgICAgIGZ1bmN0aW9uIGlzUGVtaXNzaW9uc01hdGNoKHBlcm1pc3Npb25zLCBwYXR0ZXJuKSB7XHJcbiAgICAgICAgcmV0dXJuIHBlcm1pc3Npb25zLnNvbWUoZnVuY3Rpb24ocGVybWlzc2lvbikge1xyXG4gICAgICAgICAgcmV0dXJuIHBlcm1pc3Npb24uYXJlYXMgJiYgcGVybWlzc2lvbi5hcmVhcy5sZW5ndGggJiZcclxuICAgICAgICAgIChwYXR0ZXJuLnRlc3QocGVybWlzc2lvbi5uYW1lKSB8fCBpc0FyZWFzTWF0Y2gocGVybWlzc2lvbi5hcmVhcywgcGF0dGVybikpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBpc0FyZWFzTWF0Y2goYXJlYXMsIHBhdHRlcm4pIHtcclxuICAgICAgICByZXR1cm4gYXJlYXMuc29tZShmdW5jdGlvbihhcmVhKSB7XHJcbiAgICAgICAgICByZXR1cm4gcGF0dGVybi50ZXN0KGFyZWEubmFtZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBmdW5jdGlvbih1c2VycywgcXVlcnkpIHtcclxuICAgICAgICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKHF1ZXJ5LCAnZ2knKTtcclxuICAgICAgICByZXR1cm4gdXNlcnMuZmlsdGVyKGZ1bmN0aW9uKHVzZXIpIHtcclxuICAgICAgICAgIHJldHVybiByZWdleC50ZXN0KHVzZXIubmFtZSkgfHxcclxuICAgICAgICAgICAgICAgICByZWdleC50ZXN0KHVzZXIuY2FpKSB8fFxyXG4gICAgICAgICAgICAgICAgIGlzUGVtaXNzaW9uc01hdGNoKHVzZXIucGVybWlzc2lvbnMsIHJlZ2V4KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfTtcclxuICAgIH1cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoJ2FkbWluLnBlcm1pc3Npb25zLnVzZXJzTGlzdC51c2Vyc0N0cmwnLCBbXHJcbiAgICAnYWRtaW4ucGVybWlzc2lvbnMudXNlcnNMaXN0LmZpbHRlclVzZXJzQnlRdWVyeScsXHJcbiAgICAnYWRtaW4ucGVybWlzc2lvbnMuc2VydmljZXMudXNlcnNTZXJ2aWNlJ1xyXG4gIF0pXHJcbiAgICAuY29udHJvbGxlcigndXNlcnNDdHJsJywgVXNlcnNDdHJsKTtcclxuXHJcbiAgVXNlcnNDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckZmlsdGVyJywndXNlcnNTZXJ2aWNlJ107XHJcblxyXG4gIGZ1bmN0aW9uIFVzZXJzQ3RybCgkc2NvcGUsICRmaWx0ZXIsIHVzZXJzU2VydmljZSkge1xyXG4gICAgdmFyIHZtID0gdGhpcztcclxuXHJcbiAgICB2bS5zZWFyY2hRdWVyeSA9ICcnO1xyXG4gICAgdm0uc29ydEluUmV2ZXJzZU1vZGUgPSBmYWxzZTtcclxuICAgIHZtLmZpZWxkcyA9IFsnbmFtZScsICdjYWknLCAnYWN0aXZlJ107XHJcbiAgICB2bS5zZWxlY3RlZEZpZWxkID0gdm0uZmllbGRzWzBdO1xyXG4gICAgdm0udXNlcnMgPSB1c2Vyc1NlcnZpY2UudXNlcnM7XHJcbiAgICB2bS5nZXRMaXN0T2ZVc2VycyA9IGdldExpc3RPZlVzZXJzO1xyXG5cclxuICAgIGluaXQoKTtcclxuXHJcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0TGlzdE9mVXNlcnMoKSB7XHJcbiAgICAgICAgcmV0dXJuICRmaWx0ZXIoJ2ZpbHRlclVzZXJzQnlRdWVyeScpKHZtLnVzZXJzLCB2bS5zZWFyY2hRdWVyeSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdCgpIHtcclxuICAgICAgICByZXR1cm4gdXNlcnNTZXJ2aWNlLmZldGNoVXNlcnMoKS50aGVuKGZ1bmN0aW9uKHVzZXJzKSB7XHJcbiAgICAgICAgICAgIHZtLnVzZXJzID0gdXNlcnM7XHJcbiAgICAgICAgICAgIHJldHVybiB1c2VycztcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGFuZ3VsYXIubW9kdWxlKCdhZG1pbi5wZXJtaXNzaW9ucy51c2Vyc0xpc3QudXNlclNlYXJjaERpcmVjdGl2ZScsIFtdKVxyXG4gICAgLmRpcmVjdGl2ZSgndXNlclNlYXJjaCcsIHVzZXJTZWFyY2hEaXJlY3RpdmUpO1xyXG5cclxuICBmdW5jdGlvbiB1c2VyU2VhcmNoRGlyZWN0aXZlKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgc2VhcmNoUXVlcnk6ICc9J1xyXG4gICAgICB9LFxyXG4gICAgICB0ZW1wbGF0ZTogJzxpbnB1dCB0eXBlPVwidGV4dFwiIG5nLW1vZGVsPVwic2VhcmNoUXVlcnlcIiBuZy1tb2RlbC1vcHRpb25zPVwie2RlYm91bmNlOiAzMDB9XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBwbGFjZWhvbGRlcj1cInNlYXJjaFwiPicsXHJcbiAgICAgIGxpbms6IGxpbmtcclxuICAgIH07XHJcblxyXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuXHJcbiAgICBmdW5jdGlvbiBsaW5rKCRzY29wZSwgJGVsLCAkYXR0cikge1xyXG5cclxuICAgIH1cclxuICB9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGFuZ3VsYXIubW9kdWxlKCdhZG1pbi5wZXJtaXNzaW9ucy51c2Vyc0xpc3QudXNlckxpc3REaXJlY3RpdmUnLCBbXHJcbiAgICAnYWRtaW4ucGVybWlzc2lvbnMudXNlcnNMaXN0LnVzZXJzQ3RybCdcclxuICBdKS5kaXJlY3RpdmUoJ3VzZXJzTGlzdCcsIHVzZXJMaXN0RGlyZWN0aXZlKTtcclxuXHJcbiAgZnVuY3Rpb24gdXNlckxpc3REaXJlY3RpdmUoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgIHVzZXJzOiAnPSdcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBjb250cm9sbGVyOiAndXNlcnNDdHJsJyxcclxuICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3VzZXJzTGlzdCcsXHJcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2NvbXBvbmVudHMvdXNlcnMtbGlzdC91c2Vycy1saXN0LnRlbXBsYXRlLmh0bWwnLFxyXG4gICAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcclxuICAgICAgICAgIGxpbms6IGxpbmtcclxuICAgIH07XHJcblxyXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcblxyXG4gICAgZnVuY3Rpb24gbGluaygkc2NvcGUsICRlbCwgJGF0dHIpIHtcclxuXHJcbiAgICB9XHJcbiAgfVxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyLm1vZHVsZSgnYWRtaW4ucGVybWlzc2lvbnMudXNlcnNMaXN0JywgW1xyXG5cdFx0J2FkbWluLnBlcm1pc3Npb25zLnVzZXJzTGlzdC51c2VyU2VhcmNoRGlyZWN0aXZlJyxcclxuXHRcdCdhZG1pbi5wZXJtaXNzaW9ucy51c2Vyc0xpc3QuZmlsdGVyVXNlcnNCeVF1ZXJ5JyxcclxuXHRcdCdhZG1pbi5wZXJtaXNzaW9ucy51c2Vyc0xpc3QudXNlcnNDdHJsJyxcclxuXHRcdCdhZG1pbi5wZXJtaXNzaW9ucy51c2Vyc0xpc3QudXNlckxpc3REaXJlY3RpdmUnLFxyXG5cdFx0J2FkbWluLnBlcm1pc3Npb25zLnVzZXJJdGVtJyxcclxuXHRcdCdhZG1pbi5wZXJtaXNzaW9ucy51c2Vyc1NvcnRpbmcnLFxyXG5cdFx0J2FkbWluLnBlcm1pc3Npb25zLnVzZXJNb2RhbERpYWxvZydcclxuXHRdKTtcclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy9hbmd1bGFyLm1vZHVsZSgnYWRtaW4ucGVybWlzc2lvbnMnKS5jb25maWcoKTtcclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoJ2FkbWluLnBlcm1pc3Npb25zJywgW1xyXG4gICAgICAnbmdNb2NrRTJFJyxcclxuICAgICAgJ2FkbWluLnBlcm1pc3Npb25zLnRlbXBsYXRlcycsICAgICAgXHJcbiAgICAgICdhZG1pbi5wZXJtaXNzaW9ucy5jb21tb24uYWRqdXN0U2l6ZURpcmVjdGl2ZScsXHJcbiAgICAgICdhZG1pbi5wZXJtaXNzaW9ucy51c2Vyc0xpc3QnXHJcbiAgICBdKVxyXG4gICAgLnJ1bihydW5QZXJtaXNzaW9uc01vZHVsZSk7XHJcblxyXG4gIHJ1blBlcm1pc3Npb25zTW9kdWxlLiRpbmplY3QgPSBbJyRodHRwQmFja2VuZCcsICckaHR0cCddO1xyXG5cclxuICBmdW5jdGlvbiBydW5QZXJtaXNzaW9uc01vZHVsZSgkaHR0cEJhY2tlbmQsICRodHRwKSB7XHJcbiAgICB2YXIgYXJlYXMgPSBbXHJcbiAgICAgIHsgaWQ6IDEsIG5hbWU6ICdYWVonIH0sXHJcbiAgICAgIHsgaWQ6IDIsIG5hbWU6J0FCQycgfSxcclxuICAgICAgeyBpZDogMywgbmFtZTonREVGJyB9LFxyXG4gICAgICB7IGlkOiA0LCBuYW1lOiAnYWxsJyB9XHJcbiAgICBdO1xyXG4gICAgdmFyIHBlcm1pc3Npb25zID0gW1xyXG4gICAgICB7IGlkOiAxLCBuYW1lOiAnQ0QgRWRpdCcsICAgYWN0aXZlOiB0cnVlIH0sXHJcbiAgICAgIHsgaWQ6IDIsIG5hbWU6ICdDRCBDcmVhdGUnLCBhY3RpdmU6IGZhbHNlIH0sXHJcbiAgICAgIHsgaWQ6IDMsIG5hbWU6ICdQUkkgRWRpdCcsICBhY3RpdmU6IGZhbHNlIH0sXHJcbiAgICAgIHsgaWQ6IDQsIG5hbWU6ICdEUFIgRWRpdCcsICBhY3RpdmU6IHRydWUgfSxcclxuICAgICAgeyBpZDogNSwgbmFtZTogJ0VYRUMgRWRpdCcsIGFjdGl2ZTogdHJ1ZSB9LFxyXG4gICAgICB7IGlkOiA2LCBuYW1lOiAnT1BFUiBFZGl0JywgYWN0aXZlOiBmYWxzZSB9XHJcbiAgICBdO1xyXG4gICAgdmFyIHVzZXJzID0gW1xyXG4gICAgICB7IGlkOiAxLCBuYW1lOiAnVXNlcjEnLCBjYWk6ICdUVVNFUjMnLCBhY3RpdmU6IHRydWUsIHBlcm1pc3Npb25zOiBbXHJcbiAgICAgICAgICB7IGlkOiAxLCBuYW1lOiAnQ0QgRWRpdCcsIGFjdGl2ZTogdHJ1ZSwgYXJlYXM6IFtdIH0sXHJcbiAgICAgICAgICB7IGlkOiAyLCBuYW1lOiAnQ0QgQ3JlYXRlJywgYWN0aXZlOiBmYWxzZSwgYXJlYXM6IFtdIH0sXHJcbiAgICAgICAgICB7IGlkOiAzLCBuYW1lOiAnUFJJIEVkaXQnLCBhY3RpdmU6IGZhbHNlLCBhcmVhczogW1xyXG4gICAgICAgICAgICAgIHsgaWQ6IDIsIG5hbWU6J0FCQycgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgeyBpZDogNCwgbmFtZTogJ0RQUiBFZGl0JywgYWN0aXZlOiB0cnVlLCBhcmVhczogW1xyXG4gICAgICAgICAgICAgIHsgaWQ6IDMsIG5hbWU6J0RFRicgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgeyBpZDogNSwgbmFtZTogJ0VYRUMgRWRpdCcsIGFjdGl2ZTogdHJ1ZSwgYXJlYXM6IFtcclxuICAgICAgICAgICAgICB7IGlkOiA0LCBuYW1lOiAnYWxsJyB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7IGlkOiA2LCBuYW1lOiAnT1BFUiBFZGl0JywgYWN0aXZlOiBmYWxzZSwgYXJlYXM6IFtdIH1cclxuICAgICAgICBdXHJcbiAgICAgIH0sXHJcbiAgICAgIHsgaWQ6IDIsIG5hbWU6ICdVc2VyMicsIGNhaTogJ1RVU0VSMScsIGFjdGl2ZTogdHJ1ZSwgcGVybWlzc2lvbnM6IFtcclxuICAgICAgICAgIHsgaWQ6IDEsIG5hbWU6ICdDRCBFZGl0JywgYWN0aXZlOiB0cnVlLCBhcmVhczogW1xyXG4gICAgICAgICAgICAgIHsgaWQ6IDEsIG5hbWU6ICdYWVonIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHsgaWQ6IDIsIG5hbWU6ICdDRCBDcmVhdGUnLCBhY3RpdmU6IGZhbHNlLCBhcmVhczogW11cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7IGlkOiAzLCBuYW1lOiAnUFJJIEVkaXQnLCBhY3RpdmU6IGZhbHNlLCBhcmVhczogW10gfSxcclxuICAgICAgICAgIHsgaWQ6IDQsIG5hbWU6ICdEUFIgRWRpdCcsIGFjdGl2ZTogdHJ1ZSwgYXJlYXM6IFtcclxuICAgICAgICAgICAgICB7IGlkOiAzLCBuYW1lOidERUYnIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHsgaWQ6IDUsIG5hbWU6ICdFWEVDIEVkaXQnLCBhY3RpdmU6IHRydWUsIGFyZWFzOiBbXHJcbiAgICAgICAgICAgICAgeyBpZDogNCwgbmFtZTogJ2FsbCcgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgeyBpZDogNiwgbmFtZTogJ09QRVIgRWRpdCcsIGFjdGl2ZTogZmFsc2UsIGFyZWFzOiBbXSB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICBdO1xyXG5cclxuXHJcbiAgICAkaHR0cEJhY2tlbmQud2hlbkdFVCgvXFwudGVtcGxhdGVcXC5odG1sLykucGFzc1Rocm91Z2goKTtcclxuXHJcbiAgICAkaHR0cEJhY2tlbmQud2hlbkdFVCgnL3VzZXJzJykucmVzcG9uZCh1c2Vycyk7XHJcblxyXG4gICAgJGh0dHBCYWNrZW5kLndoZW5QT1NUKCcvbG9va3VwSW5BY3RpdmVEaXJlY3RvcnknKS5yZXNwb25kKCdVc2VyMycpO1xyXG5cclxuICAgICRodHRwQmFja2VuZC53aGVuUE9TVCgnL3VzZXJzJykucmVzcG9uZChmdW5jdGlvbihtZXRob2QsIHVybCwgdXNlcikge1xyXG4gICAgICAgIHVzZXIgPSBKU09OLnBhcnNlKHVzZXIpO1xyXG4gICAgICAgIHVzZXIuaWQgPSBNYXRoLnJhbmRvbSgpO1xyXG4gICAgICAgIHVzZXJzLnB1c2godXNlcik7XHJcbiAgICAgICAgcmV0dXJuIFsyMDEsIHVzZXIsIHt9XTtcclxuICAgIH0pO1xyXG5cclxuICAgICRodHRwQmFja2VuZC53aGVuUFVUKC91c2Vyc1xcL1xcZCsvKS5yZXNwb25kKGZ1bmN0aW9uKG1ldGhvZCwgdXJsLCB1c2VyKSB7XHJcbiAgICAgIHZhciB1c2VySW5kZXg7XHJcbiAgICAgIHZhciBvbGRVc2VyRGF0YTtcclxuXHJcbiAgICAgIHVzZXIgPSBKU09OLnBhcnNlKHVzZXIpO1xyXG4gICAgICBvbGRVc2VyRGF0YSA9IHVzZXJzLmZpbmQoZnVuY3Rpb24odXNlckl0ZW0sIGluZGV4KSB7XHJcbiAgICAgICAgaWYgKHVzZXJJdGVtLmlkID09PSB1c2VyLmlkKSB7XHJcbiAgICAgICAgICB1c2VySW5kZXggPSBpbmRleDtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAob2xkVXNlckRhdGEpIHtcclxuICAgICAgICB1c2Vycy5zcGxpY2UodXNlckluZGV4LCAxLCB1c2VyKTtcclxuICAgICAgICByZXR1cm4gWzIwMCwgdXNlciwge31dO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAkaHR0cEJhY2tlbmQud2hlbkdFVCgnL2FyZWFzJykucmVzcG9uZChhcmVhcyk7XHJcblxyXG4gICAgJGh0dHBCYWNrZW5kLndoZW5HRVQoJy9wZXJtaXNzaW9ucycpLnJlc3BvbmQocGVybWlzc2lvbnMpO1xyXG4gIH1cclxufSkoKTtcclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
