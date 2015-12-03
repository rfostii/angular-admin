describe('users-list test::', function() {
  var users, permissions, areas;

  beforeEach(module('users.json'));
  beforeEach(module('permissions.json'));
  beforeEach(module('areas.json'));
  beforeEach(module('admin.permissions.services.usersService'));
  beforeEach(module('admin.permissions.usersList'));
  beforeEach(module('admin.permissions.templates'));

  beforeEach(inject(function($injector, _users_, _permissions_, _areas_) {
    users = _users_;
    permissions = _permissions_;
    areas = _areas_;

    $httpBackend = $injector.get('$httpBackend');

     var usersRequestHandler = $httpBackend.when('GET', '/users').respond(users);
     var permissionsRequestHandler = $httpBackend.when('GET', '/permissions').respond(permissions);
     var areasRequestHandler = $httpBackend.when('GET', '/areas').respond(areas);
   }));

  describe('users-list.fitler test::', function() {

    var $filter;
    var searchQuery = '';

    beforeEach(inject(function(_$filter_){
      $filter = _$filter_;
    }));

    afterEach(function() {
      searchQuery = '';
    });

    it('returns all users when empty searchQuery passed', function() {
      var usersListFilter = $filter('filterUsersByQuery');

      expect(usersListFilter(users, searchQuery)).toEqual(users);
    });

    it('returns users that matched searchQuery', function() {
      var usersListFilter = $filter('filterUsersByQuery');

      searchQuery = 'DEF'
      expect(usersListFilter(users, searchQuery).length).toEqual(1);
    });
  });

  describe('users-list test::', function() {
    describe('users-list.controller test::', function() {
      var $controller, $rootScope, $filter, usersService;

      beforeEach(inject(function(_$controller_, _$rootScope_, _$filter_, _usersService_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $filter = _$filter_;
        usersService = _usersService_;
      }));

      it('usersCtrl should be defined', function() {
        var usersCtrl = $controller('usersCtrl', {
          $scope: $rootScope,
          $filter: $filter,
          usersService: usersService
        });

        expect(usersCtrl).toBeDefined();
      });
    });

    describe('users-list.directive test::', function() {
      var $compile, $rootScope;

      beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
      }));

      it('shoud draw list of users', function() {
        var element;

        $rootScope.users = users;
        $httpBackend.expectGET('/users');
        element = $compile('<users-list users="users"></users-list>')($rootScope);
        $rootScope.$digest();
        $httpBackend.flush();

        expect(element.find('user-item').length).toEqual(2);
      });
    });
  });
});
