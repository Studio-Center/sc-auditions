'use strict';

// Logs controller
angular.module('logs').controller('LogsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Logs',
	function($scope, $stateParams, $location, Authentication, Logs ) {
		$scope.authentication = Authentication;

		// used for paginator
		$scope.Math = window.Math;
		$scope.currentPage = 0;
		$scope.filtered = [];
		$scope.limit = 0;
		$scope.range = function(min, max, step){
		    step = step || 1;
		    var input = [];
		    for (var i = min; i <= max; i += step) input.push(i);
		    return input;
		};
	    $scope.setPage = function () {
	        $scope.currentPage = this.n;
	    };
	    $scope.changePage = function(page){
	    	var curSel = page * $scope.limit;

	    	if(curSel < $scope.filtered.length && curSel >= 0){
	    		$scope.currentPage = page;
	    	}
	    };
	    $scope.$watch('filtered', function(val){
	    	$scope.currentPage = 0;
	    }, true);

		// Create new Log
		$scope.create = function() {
			// Create new Log object
			var log = new Logs ({
				name: this.name
			});

			// Redirect after save
			log.$save(function(response) {
				$location.path('logs/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Log
		$scope.remove = function( log ) {
			if ( log ) { log.$remove();

				for (var i in $scope.logs ) {
					if ($scope.logs [i] === log ) {
						$scope.logs.splice(i, 1);
					}
				}
			} else {
				$scope.log.$remove(function() {
					$location.path('logs');
				});
			}
		};

		// Update existing Log
		$scope.update = function() {
			var log = $scope.log ;

			log.$update(function() {
				$location.path('logs/' + log._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Logs
		$scope.find = function() {
			$scope.logs = Logs.query();
		};

		// Find existing Log
		$scope.findOne = function() {
			$scope.log = Logs.get({ 
				logId: $stateParams.logId
			});
		};
	}
]);