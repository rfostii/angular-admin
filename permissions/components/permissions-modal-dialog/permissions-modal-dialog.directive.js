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
              user: '=?'
            },
            controller: 'permissionsModalDialogCtrl',
            controllerAs: 'permissionsModalDialog',
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
        $scope.permissionsModalDialog.permissionsForm.$dirty = true;
      });

      $scope.$on('$destroy', function() {
        $el.off('click', showModal);
      });

      /////////////////////////////////////////////////////

      function showModal() {
        $('<div></div>')
          .load('/permissions/components/permissions-modal-dialog/permissions-modal-dialog.template.html', function(modalDialog) {
            $modalDialog = $($compile(modalDialog)($scope));

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
