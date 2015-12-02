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
