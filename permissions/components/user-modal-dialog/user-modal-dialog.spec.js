describe('userModalDialog test::', function() {
  beforeEach(module('admin.permissions.services.usersService'));
  beforeEach(module('admin.permissions.services.permissionsService'));
  beforeEach(module('admin.permissions.userModalDialog'));
  beforeEach(module('admin.permissions.templates'));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', '/users').respond(users);
    $httpBackend.when('GET', '/permissions').respond(permissions);
    $httpBackend.when('GET', '/areas').respond(areas);
   }));

  describe('userModalDialogDirective test::', function() {
    var $compile, $rootScope, $document;

    beforeEach(inject(function(_$compile_, _$rootScope_, _$document_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $document = _$document_;
    }));

    it('shoud show modal with user data', function() {
      var element;

      $rootScope.user = users[0];
      element = $compile('<user-modal-dialog user="user"></user-modal-dialog>')($rootScope);
      $rootScope.$digest();
      element.click();

      //here we need load template async, so we have to wait some time
      setTimeout(function() {
        expect($document.find('.modal').length).toEqual(1);
        expect(element.scope().user).toEqual(users[0]);
      }, 1000);
    });

    it('shoud show modal without user', function() {
      var element;

      element = $compile('<user-modal-dialog></user-modal-dialog>')($rootScope);
      $rootScope.$digest();
      element.click();

      expect($document.find('.modal .user-data-block').length).toEqual(0);
      expect(element.scope().user).toBeUndefined();
    });
  });

  describe('userModalDialogCtrl test::', function() {
    var $controller, $rootScope, $q, usersService, permissionsService;
    var userModalDialogCtrl;

    beforeEach(inject(function(_$controller_, _$rootScope_, _$q_, _usersService_, _permissionsService_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $q = _$q_;
      usersService = _usersService_;
      permissionsService = _permissionsService_;
    }));

    beforeEach(function() {
      userModalDialogCtrl = $controller('userModalDialogCtrl', {
        $scope: $rootScope,
        $q: $q,
        usersService: usersService,
        permissionsService: permissionsService
      });
    });

    it('userModalDialogCtrl should be defined', function() {
      expect(userModalDialogCtrl).toBeDefined();
    });

    it('userModalDialogCtrl should initialized for new user', function() {
      expect(userModalDialogCtrl.isNewUser).toBeTruthy();
    });
  });
});
