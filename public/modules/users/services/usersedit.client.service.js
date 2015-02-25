'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('UsersEdit', ['$resource',
	function($resource) {
		return $resource('usersedit/:userIdEdit', { userIdEdit: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);