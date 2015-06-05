'use strict';

// Users controller
angular.module('users').controller('UsersModalController', ['$scope', '$stateParams', '$location', 'Authentication', 'UsersEdit', 'UsersFind', '$http', '$modalInstance',
	function($scope, $stateParams, $location, Authentication, UsersEdit, UsersFind, $http, $modalInstance) {
		$scope.authentication = Authentication;

		$scope.roleOpts = ['client', 'client-client'];

		// used for paginator
		$scope.Math = window.Math;

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

		$scope.createModel = function() {
			var useredit = {
				firstName: this.firstName,
				lastName: this.lastName,
				displayName: this.displayName,
				company: this.company,
				email: this.email,
				username: this.username,
				phone: this.phone,
				password: this.password,
				roles: this.roles
			};

			// Redirect after save
			$http.post('/usersedit/create', useredit).
			success(function(data, status, headers, config) {
				$modalInstance.close();
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);