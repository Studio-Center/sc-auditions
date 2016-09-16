'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		if(typeof $scope.authentication.user !== 'undefined' && ($scope.authentication.user.roles[0] === 'client' || $scope.authentication.user.roles[0] === 'client-client')) {
			$location.path('/clients/projects');
		}

	}
]);
