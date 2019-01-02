/*global escape: true */
'use strict';

// Reports controller
angular.module('reports').controller('ReportsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Reports', '$http',
	function($scope, $stateParams, $location, Authentication, Reports, $http ) {
		$scope.authentication = Authentication;
		$scope.dateFilter = '';
		$scope.sysstats = {};
		$scope.intervalID = '';

		// find missing auditions report methods
		$scope.findMissingAuditions = function(){

			$http.post('/reports/findMissingAuds',{dateFilter:$scope.dateFilter}).
			success(function(data, status, headers, config) {
				$scope.missingAuditions = data;
			});

		};

		// populate auditions booked report
		$scope.findAuditionsBooked = function(){

			if($scope.dateFilterStart && $scope.dateFilterEnd){

				$http.post('/reports/findAuditionsBooked',
				{
					dateFilterStart: $scope.dateFilterStart,
					dateFilterEnd: $scope.dateFilterEnd
				}).
				success(function(data, status, headers, config) {
					$scope.results = data;
				});

			} else {

				alert('Please select a start and end date!');

			}

		};

		// convert local JSON to CSV for download
		$scope.convertToCSV = function(localDoc){

			if($scope.dateFilterStart && $scope.dateFilterEnd){

				$http.post('/reports/convertToCSV',
				{
					jsonDoc: localDoc
				}).
				success(function(data, status, headers, config) {

					var a         = document.createElement('a');
					a.href        = 'data:attachment/csv,' + escape(data);
					a.target      = '_blank';
					a.download    = 'Auditions-Booked.csv';

					document.body.appendChild(a);
					a.click();

				});

			}

		};

		// gather system information
		$scope.systemInfo = function(){

			// query server
			$http.post('/reports/systemStats',
			{}).
			success(function(data, status, headers, config) {
				$scope.sysstats = data;
			});

			//$scope.intervalID = window.setInterval($scope.systemInfo, 1000);
		};
        
        
		// find auditions uploaded per producer
		$scope.findAudsPerProducer = function(){

			$http.post('/reports/findAudsPerProducer',{
                dateFilterStart: $scope.dateFilterStart,
                dateFilterEnd: $scope.dateFilterEnd
            }).
			success(function(data, status, headers, config) {
				$scope.audsPerProducer = data;
			});

		};

	}
]);
