'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$location',
	function($scope, Authentication, $location) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		if(typeof $scope.authentication.user !== 'undefined' && $scope.authentication.user !== null){
			if(typeof $scope.authentication.user.roles !== 'undefined' && $scope.authentication.user.roles !== null && ($scope.authentication.user.roles[0] === 'client' || $scope.authentication.user.roles[0] === 'client-client')) {
				$location.path('/clients/projects');
			}
		}
	}
]);
