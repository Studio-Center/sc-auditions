'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication', 'gRecaptcha',
	function($scope, $http, $location, Authentication, gRecaptcha) {
		$scope.authentication = Authentication;

		$scope.recaptchaPublicKey = '6LetPbYpAAAAAFTe2WW2Ohk9H4QiT8skXNLA5bpu';

		gRecaptcha.initialize({key: $scope.recaptchaPublicKey});

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			gRecaptcha.execute({action: 'signup'})
			.then(function (token) {
				// returns token from Google Recaptcha
				
				$scope.credentials.token = token;

				$http.post('/auth/signup', $scope.credentials).success(function(response) {
					// If successful we assign the response to the global user model
					$scope.authentication.user = response;

					// And redirect to the index page
					$location.path('/');
				}).error(function(response) {
					$scope.error = response.message;
				});
				
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect based on user role
				if(typeof response !== 'undefined' && typeof response.roles !== 'undefined'){
					if(response.roles[0] === 'admin' || response.roles[0] === 'producer/auditions director' || response.roles[0] === 'audio intern' || response.roles[0] === 'auditions director'){
						$location.path('/projects');
					} else if(response.roles[0] === 'client' || response.roles[0] === 'client-client') {
						$location.path('/clients/projects');
					} else {
						$location.path('/');
					}
				} else {
					$location.path('/');
				}
				
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
