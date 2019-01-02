'use strict';

// Talents controller
angular.module('talents').controller('TalentsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Talents', 'UsersFind', '$http', '$rootScope', 'Socket',
	function($scope, $stateParams, $location, Authentication, Talents, UsersFind, $http, $rootScope, Socket) {
		$scope.authentication = Authentication;

		// talent static options
		$scope.talentsTotalCnt = 0;
		$scope.filter = {};
		$scope.watchersObj = {};
		$scope.typeOptions = ['Email','Phone'];
		$scope.unionOptions = ['union','non-union'];
		$scope.locations = ['Offsite', 'Las Vegas', 'New York', 'Richmond', 'Santa Monica', 'Virginia Beach', 'Washington DC'];
		$scope.exclusivityOpts = ['Non-Union Exclusive', 'Union', 'Non-Union Exclusive and Union', 'Foreign Language Agreement Non-Union', 'Foreign Language Agreement Union', 'Foreign Language Agreement Non-Union and Union', 'ISDN Non-Union', 'ISDN Union', 'ISDN Non-Union and Union', 'Independent Contractor Agreement Non-Union', 'Independent Contractor Agreement Union', 'Independent Contractor Agreement Non-Union and Union'];
		$scope.unionJoinedOpts = ['SAG/AFTRA', 'OTHER'];
		$scope.unionSelected = [];
		$scope.unionJoinSelected = [];
		$scope.prefLangOpts = ['English', 'Spanish'];
		$scope.typeSelected = 'Email';
		$scope.selTypecasts = [];
		$scope.prefLanguage = 'English';
		// store talent project data
		$scope.projectTalentIdx = [];
		$scope.talentStatus = ['Cast', 'Emailed', 'Scheduled', 'Message left', 'Out', 'Received needs to be posted', 'Posted', 'Not Posted (Bad Read)', 'Missed', 'Canceled'];
		$scope.archived = false;
        $scope.producers = [];
        //$scope.producers = UsersFind.query.where('userLevel').in(["producer/auditions director", 'audio intern', "admin"]);
        UsersFind.query({userLevel: "producer/auditions director"}, function(users){
            angular.forEach(users, function(user, key) {
                $scope.producers.push(user);
            });
        });
        UsersFind.query({userLevel: "admin"}, function(users){
            angular.forEach(users, function(user, key) {
                $scope.producers.push(user);
            });
            
        });
        //$scope.producers += UsersFind.query({userLevel: "admin"});

		// clear mem leaks on controller destroy
		$scope.$on('$destroy', function (event) {
          Socket.removeAllListeners();

                // angular.forEach($scope.watchersObj, function(watcherObj, key) {
                // 	watcherObj();
                // 	delete $scope.watchersObj[key];
                // });
        });

		// listing filter
		$scope.startsWith = function (actual, expected) {
		    var lowerStr = (actual + '').toLowerCase();
		    return lowerStr.indexOf(expected.toLowerCase()) === 0;
		};

		// used for paginator
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

    	if(curSel < $scope.talentsTotalCnt && curSel >= 0){
    		$scope.currentPage = page;
				$scope.findLimitWithFilter();
    	}
    };

		// user access rules
		$scope.permitAdminDirector = function(){
			var allowRoles = ['admin','talent director'],
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
		// toggle checkbox options
		$scope.toggleUnion = function(union){
			  var idx = $scope.talent.unionStatus.indexOf(union);
			  if (idx > -1){
			    $scope.talent.unionStatus.splice(idx, 1);
			  }else{
			    $scope.talent.unionStatus.push(union);
			}
		};
		$scope.toggleUnionJoin = function(union){
			  var idx = $scope.talent.unionJoined.indexOf(union);
			  if (idx > -1){
			    $scope.talent.unionJoined.splice(idx, 1);
			  }else{
			    $scope.talent.unionJoined.push(union);
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
		$scope.toggleNewUnionJoin = function(union){
			  var idx = $scope.unionJoinSelected.indexOf(union);
			  if (idx > -1){
			    $scope.unionJoinSelected.splice(idx, 1);
			  }else{
			    $scope.unionJoinSelected.push(union);
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

		$scope.checkUnionStatus = function(unionVals){
			if(typeof unionVals === 'object'){
				for(var i = 0; i < unionVals.length; ++i){
					if(unionVals[i] === 'union'){
						return true;
					}
				}
			}
			return false;
		};

		// Create new Talent
		$scope.create = function() {
			// Create new Talent object
			var talent = new Talents ({
				name: this.name,
				lastName: this.lastName,
				email: this.email,
				email2: this.email2,
				phone: this.phone,
				phone2: this.phone2,
				type: this.typeSelected,
				gender: this.gender,
				ageRange: this.ageRange,
				company: this.company,
				unionStatus: this.unionSelected,
				lastNameCode: this.lastNameCode,
				outageTimes: this.outageTimes,
				locationISDN: this.locationISDN,
				ISDNLine1: this.ISDNLine1,
				ISDNLine2: this.ISDNLine2,
				sourceConnectUsername: this.sourceConnectUsername,
				typeCasts: this.selTypecasts,
				exclusivity: this.exclusivity,
				parentName: this.parentName,
				producerOptional: this.producerOptional,
				unionJoined: this.unionJoinSelected,
				demoLink: this.demoLink,
				prefLanguage: this.prefLanguage
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
			if(confirm('Are you sure?')){
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

		Socket.on('talentsListUpdate', function() {
			$scope.find();
		});

		// Find existing Talent
		$scope.findOne = function() {
			$scope.talent = Talents.get({
				talentId: $stateParams.talentId
			});
		};

		// load talent assigned projects
		$scope.findTalentProjects = function(){

			$scope.watchersObj['talent._id'] = $scope.$watchCollection('talent._id', function(val){

				$http.post('/projects/filterByTalent', {
			        talentId: $scope.talent._id,
			        archived: $scope.archived
			    }).
				success(function(data, status, headers, config) {
					// store projects data
					$scope.projects = data;

					var i = 0,
							j = 0,
							limit = data.length;

					// gather project talent indexs
					for(i = 0; i < limit; ++i){
						// walk through projects assigned talents looking for current selected talent
						for(j = 0; j < data[i].talent.length; ++j){
							if(data[i].talent[j].talentId === $scope.talent._id){
								$scope.projectTalentIdx[i] = j;
							}
						}
					}
				});

			});

		};

		// send talent project welcome email
		$scope.sendTalentEmail = function(talent, project){

			// reload project to make sure other recent changes are not overwritten
			$http.get('/projects/' + project._id,{}).
			success(function(data, status, headers, config) {

				// send talent email request
				$http.post('/projects/sendtalentemail', {
			        talent: talent,
			        project: data
			    }).
				success(function(data, status, headers, config) {
					alert('Selected talent has been emailed.');

					// update projects listing
					$http.post('/projects/filterByTalent', {
				        talentId: $scope.talent._id,
				        archived: $scope.archived
				    }).
					success(function(data, status, headers, config) {
						// store projects data
						$scope.projects = data;
					});
				});

			});


		};

		// update selected talents project status
		$scope.updateTalentStatus = function(project, talentId){

			// reload project to make sure other recent changes are not overwritten
			$http.get('/projects/' + project._id,{}).
			success(function(data, status, headers, config) {

				data.talent[talentId].status = project.talent[talentId].status;

				$http.post('/projects/updatetalentstatus', {
			        project: data
			    }).
				success(function(data, status, headers, config) {

					// update projects listing
					$http.post('/projects/filterByTalent', {
				        talentId: $scope.talent._id,
				        archived: $scope.archived
				    }).
					success(function(data, status, headers, config) {
						// store projects data
						$scope.projects = data;
					});

				});

			});
		};

		$scope.getOne = function(talentId) {
			$scope.talent = Talents.get({
				talentId: talentId
			});
		};

		// gather filtered list of logs
		$scope.listFilter = function(){

			$scope.watchersObj['talent._id_flt'] = $scope.$watchCollection('talent._id', function(val){

				if(typeof $scope.talent._id !== 'undefined'){

					var listFilter = {
						type: 'talent',
						sharedKey: $scope.talent._id
					};

					//console.log(listFilter);

					$http.post('/logs/listFilter', {
				        filter: listFilter
				    }).
					success(function(data, status, headers, config) {
						$scope.logs = data;
					});

				}

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
			// filter by gender
			if($scope.filter.gender){
				filterObj.gender = $scope.filter.gender;
			}
			// unionStatus
			if($scope.filter.unionStatus){
				filterObj.unionStatus = $scope.filter.unionStatus;
			}
			// type
			if($scope.filter.type){
				filterObj.type = $scope.filter.type;
			}
			// ageRange
			if($scope.filter.ageRange){
				filterObj.ageRange = $scope.filter.ageRange;
			}
			// locationISDN
			if($scope.filter.locationISDN){
				filterObj.locationISDN = $scope.filter.locationISDN;
			}
			// locationISDN
			if($scope.filter.typeCasts){
				filterObj.typeCasts = $scope.filter.typeCasts;
			}

			return filterObj;
		};
		// get count of all projects in db
		$scope.getTalentsCnt = function(){

			// gen filter object
			var filterObj = $scope.getFilterVars();

			$http.post('/talents/recCount', {
				filter: filterObj
			}).
			success(function(data, status, headers, config) {
				$scope.talentsTotalCnt = data;
			});

		};
		// gather filtered list of talents
		$scope.findLimitWithFilter = function(listFilter){

			// det start val
			var startVal = $scope.currentPage * $scope.limit;
			// gather filter objects
			var filterObj = $scope.getFilterVars();

			$http.post('/talents/findLimitWithFilter', {
				startVal: startVal,
				limitVal: $scope.limit,
				filter: filterObj
		  }).
			success(function(data, status, headers, config) {
				$scope.talents = [];
				$scope.talents = data;
				$scope.getTalentsCnt();
			});

		};

	}
]);
