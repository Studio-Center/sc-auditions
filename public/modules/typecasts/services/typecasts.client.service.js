'use strict';

//Typecasts service used to communicate Typecasts REST endpoints
angular.module('typecasts').factory('Typecasts', ['$resource',
	function($resource) {
		return $resource('typecasts/:typecastId', { typecastId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);