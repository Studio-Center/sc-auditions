'use strict';

// Reports controller
angular.module('reports').controller('ReportsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Reports', '$http',
	function($scope, $stateParams, $location, Authentication, Reports, $http ) {
		$scope.authentication = Authentication;
		$scope.dateFilter = '';

		// find missing auditions report methods
		$scope.findMissingAuditions = function(){

			$http.post('/reports/findMissingAuds',{dateFilter:$scope.dateFilter}).
			success(function(data, status, headers, config) {
				$scope.missingAuditions = data;
			});

		};

	}
]);