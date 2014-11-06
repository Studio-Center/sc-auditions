'use strict';

// Talents controller
angular.module('talents').controller('TalentsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Talents',
	function($scope, $stateParams, $location, Authentication, Talents ) {
		$scope.authentication = Authentication;

		// Create new Talent
		$scope.create = function() {
			// Create new Talent object
			var talent = new Talents ({
				name: this.name
			});

			// Redirect after save
			talent.$save(function(response) {
				$location.path('talents/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Talent
		$scope.remove = function( talent ) {
			if ( talent ) { talent.$remove();

				for (var i in $scope.talents ) {
					if ($scope.talents [i] === talent ) {
						$scope.talents.splice(i, 1);
					}
				}
			} else {
				$scope.talent.$remove(function() {
					$location.path('talents');
				});
			}
		};

		// Update existing Talent
		$scope.update = function() {
			var talent = $scope.talent ;

			talent.$update(function() {
				$location.path('talents/' + talent._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Talents
		$scope.find = function() {
			$scope.talents = Talents.query();
		};

		// Find existing Talent
		$scope.findOne = function() {
			$scope.talent = Talents.get({ 
				talentId: $stateParams.talentId
			});
		};
	}
]);