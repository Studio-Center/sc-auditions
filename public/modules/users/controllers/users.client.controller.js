'use strict';

// Users controller
angular.module('users').controller('UsersController', ['$scope', '$stateParams', '$location', 'Authentication', 'UsersEdit', 'UsersFind',
	function($scope, $stateParams, $location, Authentication, UsersEdit, UsersFind ) {
		$scope.authentication = Authentication;

		$scope.roleOpts = ['user', 'admin', 'producer/auditions director', 'talent director', 'client', 'client-client'];

		// Find a list of Users
		$scope.find = function() {
			$scope.users = UsersEdit.query();
		};
		$scope.findFilter = function(selUserLevel) {
			$scope.users = UsersFind.query({userLevel: selUserLevel});
		};

		// Find existing Users
		$scope.findOne = function() {
			$scope.useredit = UsersEdit.get({ 
				userIdEdit: $stateParams.userIdEdit
			});
		};

		// Update existing User
		$scope.update = function(isValid) {
			if (isValid){
				$scope.success = $scope.error = null;
				var user = new UsersEdit($scope.useredit);

				user.edited = Authentication;

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		$scope.remove = function( useredit ) {

			if(confirm('Are you sure?')){
				if ( useredit ) { useredit.$remove();

					for (var i in $scope.users ) {
						if ($scope.users[i] === useredit ) {
							$scope.users.splice(i, 1);
						}
					}
				} else {
					$scope.useredit.$remove(function() {
						$location.path('usersedit');
					});
				}
			}
		};
	}
]);