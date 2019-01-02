'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect based on user role
				if($scope.authentication.user.roles[0] === 'admin' || $scope.authentication.user.roles[0] === 'producer/auditions director' || $scope.authentication.user.roles[0] === 'audio intern'){
					$location.path('/projects');
				} else if($scope.authentication.user.roles[0] === 'client' || $scope.authentication.user.roles[0] === 'client-client') {
					$location.path('/clients/projects');
				} else {
					$location.path('/');
				}
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
