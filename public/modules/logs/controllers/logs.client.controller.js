'use strict';

// Logs controller
angular.module('logs').controller('LogsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Logs', '$http',
	function($scope, $stateParams, $location, Authentication, Logs, $http ) {
		$scope.authentication = Authentication;

		// used for paginator
		$scope.logCnt = 0;
		$scope.page = 0;
		$scope.searchText = {
			type: ''
		};
		$scope.Math = window.Math;
		$scope.currentPage = 0;
		$scope.filtered = [];
		$scope.limit = 300;
		$scope.searchString = '';
		$scope.range = function(min, max, step){
		    step = step || 1;
		    var input = [];
		    for (var i = min; i <= max; i += step) input.push(i);
		    return input;
		};
    $scope.setPage = function () {
        $scope.currentPage = this.n;

				$scope.listTypeFilter(this.n);
    };
    $scope.changePage = function(page){
    	var curSel = page * $scope.limit;

    	if(curSel < $scope.filtered.length && curSel >= 0){
    		$scope.currentPage = page;
    	}
    };
    // $scope.$watch('filtered', function(val){
    // 	$scope.currentPage = 0;
    // }, true);

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

		// get logs count
		$scope.getLogsCount = function(){

			$http.post('/logs/recCount', {
				filter: $scope.searchText.type,
				searchTxt: $scope.searchString
			}).
			success(function(data, status, headers, config) {
				$scope.logCnt = Number(data);
			});

		};

		// Find a list of Logs
		$scope.find = function() {
			$scope.logs = Logs.query();
		};

		// gather filtered list of logs
		$scope.listFilter = function(listFilter){

			$http.post('/logs/listFilter', {
        filter: listFilter
		  }).
			success(function(data, status, headers, config) {
				$scope.logs = data;
			});

		};
		// gather filtered list of logs
		$scope.listTypeFilter = function(page, filter){

			// gather page data
			if(typeof page === 'undefined'){
				page = $scope.page;
			} else {
				$scope.page = page;
			}

			// gather filter data
			if(typeof filter === 'undefined'){
				filter = $scope.searchText.type;
			}

			// det start val
			var startVal = page * $scope.limit;

			$http.post('/logs/listTypeFilter', {
				startVal: startVal,
				limitVal: $scope.limit,
        filter: filter,
				searchTxt: $scope.searchString
		  }).
			success(function(data, status, headers, config) {
				$scope.logs = [];
				$scope.logs = data;
			});

		};
		// update logs count for paginators
		$scope.$watchCollection('logs', function(val){
			$scope.getLogsCount();
		});

		// Find existing Log
		$scope.findOne = function() {
			$scope.log = Logs.get({
				logId: $stateParams.logId
			});
		};
	}
]);
