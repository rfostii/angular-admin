(function() {
	'use strict';

	angular.module('admin.permissions.usersList', [
		'admin.permissions.usersList.filterUsersByQuery',
		'admin.permissions.usersList.usersCtrl',
		'admin.permissions.usersList.userListDirective',
		'admin.permissions.userItem',
		'admin.permissions.userModalDialog'
	]);
})();
