'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('UsersFind', ['$resource',
	function($resource) {
		return $resource('usersfind/:userLevel', { userLevel: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);