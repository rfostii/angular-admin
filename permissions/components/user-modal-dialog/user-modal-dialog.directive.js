(function() {
  'use strict';

  angular.module('admin.permissions')
    .directive('userModalDialog', userModalDialogDirective);

  userModalDialogDirective.$inject = ['$compile', '$http'];

  function userModalDialogDirective($compile, $http) {
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
        $http.get('/permissions/components/user-modal-dialog/user-modal-dialog.template.html')
          .then(function(response) {
            $modalDialog = $($compile(response.data)($scope));

            $modalDialog.modal();

            $modalDialog.one('hidden.bs.modal', function() {
              $modalDialog.remove();
            });
          });
      }
    }
  }
})();
