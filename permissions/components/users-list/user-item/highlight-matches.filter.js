(function() {
  'use strict';

  angular.module('admin.permissions.userItem.highlightMatchesFilter', [])
    .filter('highlightMatches', highlightMatchesFilter);


  highlightMatchesFilter.$inject = ['$sce'];

  function highlightMatchesFilter($sce) {
    return function(text, query) {
      var regex = new RegExp('(' + query + ')', 'gi');

      return $sce.trustAsHtml(text.replace(regex, '<span class="highlight-match">$1</span>'));
    };
  }
})();
