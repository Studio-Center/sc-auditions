'use strict';

// Users controller
angular.module('users').controller('UsersController', ['$scope', '$stateParams', '$location', 'Authentication', 'UsersEdit', 'UsersFind', '$http', '$rootScope', '$base64',
	function($scope, $stateParams, $location, Authentication, UsersEdit, UsersFind, $http, $rootScope, $base64) {
		$scope.authentication = Authentication;

		$scope.roleOpts = ['user', 'admin', 'producer/auditions director', 'audio intern', 'production coordinator', 'talent director', 'client', 'client-client'];
		$scope.filter = {};
		$scope.filterOverride = '';
		$scope.usersTotalCnt = 0;

		// various values

		// used for paginator
		$scope.loadPass = false;
		$scope.Math = window.Math;
		$scope.currentPage = 0;
		$scope.filtered = [];
		$scope.limit = 20;
		$scope.queryLimit = 50;
		$scope.range = function(min, max, step){
		    step = step || 1;
		    var input = [];
		    for (var i = min; i <= max; i += step) input.push(i);
		    return input;
		};
		$scope.setPage = function () {
        $scope.currentPage = this.n;

				// reload list
				$scope.findLimitWithFilter();
    };
    $scope.changePage = function(page){
    	var curSel = page * $scope.limit;

    	if(curSel < $scope.usersTotalCnt && curSel >= 0){
    		$scope.currentPage = page;
				$scope.findLimitWithFilter();
    	}
    };
    $scope.$watchCollection('filtered', function(val){
    	$scope.currentPage = 0;
    }, true);

		// Find a list of Users
		$scope.find = function() {
			$scope.users = UsersEdit.query();
		};
		$scope.findFilter = function(selUserLevel) {
			//$scope.users = UsersFind.query({userLevel: selUserLevel});
			$scope.filterOverride = selUserLevel;
			$scope.findLimitWithFilter();
		};

		// refresh list of users on refresh emit
		$rootScope.$on('refresh', $scope.find());
		$rootScope.$on('refreshFilter',
			function(event, args) {
				$scope.findFilter(args);
			}
		);

		$scope.decodedPass = function(encodedPass){
			var convertedPass = '';
			if(typeof encodedPass !== 'undefined'){
				convertedPass = $base64.decode(encodedPass);
			}

			return convertedPass;
		};

		// Find existing Users
		$scope.findOne = function() {
			$scope.useredit = UsersEdit.get({
				userIdEdit: $stateParams.userIdEdit
			});
		};
		$scope.$watchCollection('useredit', function(){
			// check for load password pass
			if($scope.loadPass === false && typeof $scope.useredit !== 'undefined' && typeof $scope.useredit._id !== 'undefined'){
				var storedPW = $scope.decodedPass($scope.useredit.passwordText);
				$scope.useredit.newpassword  = storedPW;
				// ensure password is loaded
				if($scope.useredit.newpassword || storedPW === ''){
					$scope.loadPass = true;
				}
			}
		});

		$scope.getOne = function(userId) {
			$scope.useredit = UsersEdit.get({
				userIdEdit: userId
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

		$scope.create = function() {
			var useredit = {
				firstName: this.firstName,
				lastName: this.lastName,
				displayName: this.displayName,
				company: this.company,
				email: this.email,
				username: this.username,
				phone: this.phone,
				password: this.password,
				notes: this.notes,
				roles: this.roles
			};

			// Redirect after save
			$http.post('/usersedit/create', useredit).
			success(function(data, status, headers, config) {
				$location.path('/usersedit');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// gather filter values
		$scope.getFilterVars = function(){
			// det start val
			var filterObj = {};
			// filter by title
			if($scope.filter.fName){
				filterObj.fName = $scope.filter.fName;
			}
			if($scope.filter.lName){
				filterObj.lName = $scope.filter.lName;
			}
			if($scope.filter.email){
				filterObj.email = $scope.filter.email;
			}
			if($scope.filter.company){
				filterObj.company = $scope.filter.company;
			}
			// role
			if($scope.filter.roles){
				filterObj.roles = $scope.filter.roles;
			}

			return filterObj;
		};
		// get count of all projects in db
		$scope.getUsersCnt = function(){

			// gen filter object
			var filterObj = $scope.getFilterVars();
			
			// roles filter override
			if($scope.filterOverride){
					filterObj.roles = $scope.filterOverride;
			}

			$http.post('/users/recCount', {
				filter: filterObj
			}).
			success(function(data, status, headers, config) {
				$scope.usersTotalCnt = data;
			});

		};
		// gather filtered list of talents
		$scope.findLimitWithFilter = function(listFilter){

			// det start val
			var startVal = $scope.currentPage * $scope.limit;
			// gather filter objects
			var filterObj = $scope.getFilterVars();

			// roles filter override
			if($scope.filterOverride){
					filterObj.roles = $scope.filterOverride;
			}

			$http.post('/users/findLimitWithFilter', {
				startVal: startVal,
				limitVal: $scope.limit,
				filter: filterObj
		  }).
			success(function(data, status, headers, config) {
				$scope.users = [];
				$scope.users = data;
				$scope.getUsersCnt();
			});

		};

	}
]);
