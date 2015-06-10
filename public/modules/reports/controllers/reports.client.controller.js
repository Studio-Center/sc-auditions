'use strict';

// Reports controller
angular.module('reports').controller('ReportsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Reports',
	function($scope, $stateParams, $location, Authentication, Reports ) {
		$scope.authentication = Authentication;

		// find missing auditions report methods
		$scope.findMissingAuditions = function(){

			$http.post('/reports/findMissingAuditions').
			success(function(data, status, headers, config) {
				$scope.projects = data;
			});

		};

	}
]);