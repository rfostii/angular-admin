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
        var modalScope = $scope.$new();
        var modalDialogTmpl =$templateCache
          .get('permissions/components/user-modal-dialog/user-modal-dialog.template.html');

          $modalDialog = $($compile(modalDialogTmpl)(modalScope));
          $modalDialog.modal();
          $modalDialog.one('hidden.bs.modal', function() {
            modalScope.$destroy();
            $modalDialog.remove();
            $modalDialog = null;
          });
      }
    }
  }
})();
