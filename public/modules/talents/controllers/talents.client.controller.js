'use strict';

// Talents controller
angular.module('talents').controller('TalentsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Talents', 
	function($scope, $stateParams, $location, Authentication, Talents) {
		$scope.authentication = Authentication;

		// talent static options
		$scope.unionOptions = ['union','non-union'];
		$scope.unionSelected = [];
		$scope.selTypecasts = [];

		// toggle checkbox options
		$scope.toggleUnion = function(union){
			  var idx = $scope.talent.unionStatus.indexOf(union);
			  if (idx > -1){
			    $scope.talent.unionStatus.splice(idx, 1);
			  }else{
			    $scope.talent.unionStatus.push(union);
			}
		};
		$scope.toggleTypecast = function(typeCast){
			  var idx = $scope.talent.typeCasts.indexOf(typeCast);
			  if (idx > -1){
			    $scope.talent.typeCasts.splice(idx, 1);
			  }else{
			    $scope.talent.typeCasts.push(typeCast);
			}
		};
		// used for creating new talent
		$scope.toggleNewUnion = function(union){
			  var idx = $scope.unionSelected.indexOf(union);
			  if (idx > -1){
			    $scope.unionSelected.splice(idx, 1);
			  }else{
			    $scope.unionSelected.push(union);
			}
		};
		$scope.toggleNewTypecast = function(typeCast){
			  var idx = $scope.selTypecasts.indexOf(typeCast);
			  if (idx > -1){
			    $scope.selTypecasts.splice(idx, 1);
			  }else{
			    $scope.selTypecasts.push(typeCast);
			}
		};

		// Create new Talent
		$scope.create = function() {
			// Create new Talent object
			var talent = new Talents ({
				name: this.name,
				type: this.type,
				gender: this.gender,
				unionStatus: this.unionSelected,
				lastNameCode: this.lastNameCode,
				outageTimes: this.outageTimes,
				locationISDN: this.locationISDN,
				typeCasts: this.selTypecasts
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