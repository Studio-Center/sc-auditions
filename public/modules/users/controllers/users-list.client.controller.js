'use strict';

// Users controller
angular.module('users').controller('UsersListController', ['$scope', '$stateParams', '$location', 'Authentication', 'UsersEdit', 'UsersFind', '$http', '$rootScope',
	function($scope, $stateParams, $location, Authentication, UsersEdit, UsersFind, $http, $rootScope) {
		$scope.authentication = Authentication;

		$scope.roleOpts = ['client', 'client-client'];

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

		// Find a list of Users
		$scope.find = function() {
			$scope.users = UsersEdit.query();
		};
		$scope.findFilter = function(selUserLevel) {
			$scope.users = UsersFind.query({userLevel: selUserLevel});
		};

		// refresh list of users on refresh emit
		$rootScope.$on('refresh', $scope.find());
		$rootScope.$on('refreshListFilter', 
			function(event, args) { 
				$scope.findFilter(args);
			} 
		);

		// Find existing Users
		$scope.findOne = function() {
			$scope.useredit = UsersEdit.get({ 
				userIdEdit: $stateParams.userIdEdit
			});
		};
	}
]);