describe('usersSorting test::', function() {
  beforeEach(module('users.json'));
  beforeEach(module('permissions.json'));
  beforeEach(module('areas.json'));
  beforeEach(module('admin.permissions.usersSorting'));
  beforeEach(module('admin.permissions.templates'));

  beforeEach(inject(function($injector, _users_, _permissions_, _areas_) {
    users = _users_;
    permissions = _permissions_;
    areas = _areas_;

    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', '/users').respond(users);
    $httpBackend.when('GET', '/permissions').respond(permissions);
    $httpBackend.when('GET', '/areas').respond(areas);
  }));

  describe('usersSortingDirective test::', function() {
    var $compile, $rootScope;

    beforeEach(inject(function(_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    }));

    it('shoud draw users sorting tools', function() {
      var element;

      $rootScope.user = users[0];
      element = $compile('<users-sorting></users-sorting>')($rootScope);
      $rootScope.$digest();

      expect(element.find('.users-sorting .users-sorting-tool').length).toEqual(2);
    });
  });

  describe('usersSortingCtrl test::', function() {
    var $controller, $rootScope;

    beforeEach(inject(function(_$controller_, _$rootScope_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
    }));

    it('usersSortingCtrl shoud be defined', function() {
      var usersSortingCtrl = $controller('usersSortingCtrl', {
        $scope: $rootScope
      });

      expect(usersSortingCtrl).toBeDefined();
    });
  });
});
