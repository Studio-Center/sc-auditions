'use strict';

//Projects service used to communicate Projects REST endpoints
angular.module('projects').factory('Projects', ['$resource',
	function($resource) {
		return $resource('/projects/talent-upload/:projectId/:talentId', { projectId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);