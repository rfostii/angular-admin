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
