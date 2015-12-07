describe('userItem test::', function() {
  beforeEach(module('admin.permissions.services.usersService'));
  beforeEach(module('admin.permissions.userItem'));
  beforeEach(module('admin.permissions.templates'));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', '/users').respond(users);
    $httpBackend.when('GET', '/permissions').respond(permissions);
    $httpBackend.when('GET', '/areas').respond(areas);
   }));

  describe('userItemDirective test::', function() {
    var $compile, $rootScope;

    beforeEach(inject(function(_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    }));

    it('shoud draw user', function() {
      var element;

      $rootScope.user = users[0];
      element = $compile('<user-item user="user"></user-item>')($rootScope);
      $rootScope.$digest();

      expect(element.find('.user-list-item').length).toEqual(1);
      expect(element.scope().user).toEqual(users[0]);
    });
  });

  describe('userItemCtrl test::', function() {
    var $controller, $rootScope, usersService;

    beforeEach(inject(function(_$controller_, _$rootScope_, _usersService_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      usersService = _usersService_;
    }));

    it('userItemCtrl shoud be defined', function() {
      var userItemCtrl = $controller('userItemCtrl', {
        $scope: $rootScope,
        usersService: usersService
      });

      expect(userItemCtrl).toBeDefined();
    });
  });
});
