'use strict';

// Typecasts controller
angular.module('typecasts').controller('TypecastsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Typecasts', 'Socket',
	function($scope, $stateParams, $location, Authentication, Typecasts, Socket ) {
		$scope.authentication = Authentication;

		// controller level vals
		$scope.newAtrribute = '';

		// clear mem leaks on controller destroy
		$scope.$on('$destroy', function (event) {
        Socket.removeAllListeners();
        // or something like
        // socket.removeListener(this);
    });

		// used for paginator
		$scope.Math = window.Math;
		$scope.currentPage = 0;
		$scope.range = function(min, max, step){
		    step = step || 1;
		    var input = [];
		    for (var i = min; i <= max; i += step) input.push(i);
		    return input;
		};
		$scope.setPage = function () {
	        $scope.currentPage = this.n;
	    };

		$scope.permitAdminDirector = function(){

			var allowRoles = ['admin', 'producer/auditions director', 'audio intern','talent director'],
					i = 0,
					j = 0,
					authRoles = Authentication.user.roles,
					limit = authRoles.length;

			for(i = 0; i < limit; ++i){
				for(j = 0; j < allowRoles.length; ++j){
					if(authRoles[i] === allowRoles[j]) {
						return true;
					}
				}
			}
		};

		// Create new Typecast
		$scope.create = function() {
			// Create new Typecast object
			var typecast = new Typecasts ({
				name: this.name,
				sort: this.sort
			});

			// Redirect after save
			typecast.$save(function(response) {
				$location.path('typecasts/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Typecast
		$scope.remove = function( typecast ) {
			if(confirm('Are you sure?')){
				if ( typecast ) { typecast.$remove();

					for (var i in $scope.typecasts ) {
						if ($scope.typecasts [i] === typecast ) {
							$scope.typecasts.splice(i, 1);
						}
					}
				} else {
					$scope.typecast.$remove(function() {
						$location.path('typecasts');
					});
				}
			}
		};

		// Update existing Typecast
		$scope.update = function() {
			var typecast = $scope.typecast ;

			typecast.$update(function() {
				$location.path('typecasts/' + typecast._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Typecasts
		$scope.find = function() {
			$scope.typecasts = Typecasts.query();
		};

		Socket.on('typecastsListUpdate', function() {
			$scope.find();
		});

		// Find existing Typecast
		$scope.findOne = function() {
			$scope.typecast = Typecasts.get({
				typecastId: $stateParams.typecastId
			});
		};

		// add new attribute to typecase
		$scope.addAttribute = function(){

			if($scope.newAtrribute !== ''){

				var typecast = $scope.typecast;

				typecast.attributes.push($scope.newAtrribute);

				typecast.$update(function() {
					$location.path('typecasts/' + typecast._id);
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

				$scope.newAtrribute = '';

			} else {

				alert('Please enter an attribute name!');

			}

		};

		$scope.removeAttribute = function(key){

			var typecast = $scope.typecast;

			typecast.attributes.splice(key, 1);

			typecast.$update(function() {
				$location.path('typecasts/' + typecast._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});

		};
	}
]);
