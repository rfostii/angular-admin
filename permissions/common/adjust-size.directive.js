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
