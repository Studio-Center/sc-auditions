'use strict';

//Talents service used to communicate Talents REST endpoints
angular.module('talents').factory('Talents', ['$resource',
	function($resource) {
		return $resource('talents/:talentId', { talentId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);