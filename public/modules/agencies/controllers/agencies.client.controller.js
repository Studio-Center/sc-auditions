'use strict';

// Agencies controller
angular.module('agencies').controller('AgenciesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Agencies',
	function($scope, $stateParams, $location, Authentication, Agencies ) {
		$scope.authentication = Authentication;

		// Create new Agency
		$scope.create = function() {
			// Create new Agency object
			var agency = new Agencies ({
				name: this.name
			});

			// Redirect after save
			agency.$save(function(response) {
				$location.path('agencies/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Agency
		$scope.remove = function( agency ) {
			if ( agency ) { agency.$remove();

				for (var i in $scope.agencies ) {
					if ($scope.agencies [i] === agency ) {
						$scope.agencies.splice(i, 1);
					}
				}
			} else {
				$scope.agency.$remove(function() {
					$location.path('agencies');
				});
			}
		};

		// Update existing Agency
		$scope.update = function() {
			var agency = $scope.agency ;

			agency.$update(function() {
				$location.path('agencies/' + agency._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Agencies
		$scope.find = function() {
			$scope.agencies = Agencies.query();
		};

		// Find existing Agency
		$scope.findOne = function() {
			$scope.agency = Agencies.get({ 
				agencyId: $stateParams.agencyId
			});
		};
	}
]);