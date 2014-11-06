'use strict';

//Agencies service used to communicate Agencies REST endpoints
angular.module('agencies').factory('Agencies', ['$resource',
	function($resource) {
		return $resource('agencies/:agencyId', { agencyId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);