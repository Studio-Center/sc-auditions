'use strict';

// Projects controller
angular.module('projects').controller('ProjectsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Projects', '$upload', 'ngAudio', '$http', '$modal', '$rootScope', 'Socket', '$cookies', 'moment', '$window', 'Talents', 'IS_NOT_MOBILE',
	function($scope, $stateParams, $location, Authentication, Projects, $upload, ngAudio, $http, $modal, $rootScope, Socket, $cookies, moment, $window, Talents, IS_NOT_MOBILE ) {

		$scope.authentication = Authentication;
		$scope.projectsTotalCnt = 0;
		$scope.project = {};
		$scope.discussion = '';
		$scope.watchersObj = {};
		// rating
		$scope.hide = 0;
		$scope.max = 5;
		$scope.isReadonly = false;
		$scope.ratings = [];
		$scope.ratingsAvg = [];
		// file check vars
		$scope.newFileCnt = 0;
		$scope.procCnt = 0;
		$scope.fileCheck = false;
		// static project options
		$scope.showDateEdit = false;
		$scope.showRename = false;
		$scope.addTalent = true;
		$scope.newProjTalentLink = 'createProject.talent';
		$scope.newProjLink = 'createProject.project';
		//ngAudioGlobals.unlock = false;
		$scope.clientNotes = '';
		$scope.auditions = [];
		$scope.projAuditions = [];
		$scope.projProgress = [];
		$scope.selCheckVal = 0;
		$scope.client = [];
		$scope.talent = [];
		$scope.showRename = [];
		$scope.statusOpts = ['In Progress', 'On Hold', 'Booked', 'Canceled', 'ReAuditioned', 'Dead', 'Closed - Pending Client Decision', 'Complete'];
		$scope.priorityOpts = ['None', 'Very low', 'Low', 'Medium', 'High', 'Very high'];
		$scope.phaseStatusOpts = ['in progress','open','complete','suspended'];
		$scope.soundersOpts = ['Sounders', 'No Sounders - Approved By William'];
		$scope.talentStatus = ['Cast', 'Emailed', 'Scheduled', 'Message left', 'Out', 'Received needs to be posted', 'Posted', 'Not Posted (Bad Read)', 'Missed', 'Canceled'];
		//$scope.loadAudio = 0;
		$scope.audio = '';
		$scope.lastAudioID = 0;
		$scope.audioStatus = 0;
		$scope.referenceFiles = [];
		$scope.scripts = [];
		$scope.newProject = {
			title: '',
			estimatedCompletionDate: '',
			notifyClient: true,
			client: [],
			scripts: [],
			copiedScripts: [],
			referenceFiles: [],
			copiedReferenceFiles: [],
			talent: []
		};
		$scope.parts = [];
		$scope.toggleRefs = false;
		$scope.selectedMainClients = [];
		$scope.rejFiles = [];
		//$scope.talentStatus = [];
		$scope.talentBooked = [];
		$scope.talentNote = [];
		$scope.verifyFilesList = {};
		// filter vars
		$scope.predicate = '';
		$scope.reverse = '';
		$scope.searchText = {};

		// // on close check
		// $scope.$on('$locationChangeStart', function( event ) {
		//
		// 	// nothing for the moment
		//
		// });

		// clear mem leaks on controller destroy
		$scope.$on('$destroy', function (event) {
			// clear all socket listeners
      Socket.removeAllListeners();

			// // clear all watchers
			// angular.forEach($scope.watchersObj, function(watcherObj, key) {
			// 	watcherObj();
			// 	delete $scope.watchersObj[key];
			// });
    });

		var loadAuditions = function(){

			// load project audition files
			$http.post('/projects/loadAuditions', {
				projectId: $stateParams.projectId
			// file found
			}).success(function(data, status, headers, config) {
				$scope.projAuditions = data;
			// file not found
			}).error(function(data, status, headers, config) {
				console.log('Problem loading project auditions.');
			});

		};

		$scope.toggleShowRename = function(idx){
			if($scope.showRename[idx]) {
				$scope.showRename[idx] = !$scope.showRename;
			} else {
				$scope.showRename[idx] = 1;
			}
		};
		$scope.toggleShowEdit = function(){
			$scope.showDateEdit = !$scope.showDateEdit;
		};

		$scope.updatePred = function(pred){
			$scope.predicate = pred;
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

				// reload list of projects
				$scope.findLimitWithFilter();
    };
    $scope.changePage = function(page){
    	var curSel = page * $scope.limit;

    	if(curSel < $scope.projectsTotalCnt && curSel >= 0){
    		$scope.currentPage = page;

				$scope.findLimitWithFilter();
    	}
    };
    // $scope.$watchCollection('filtered', function(val){
    // 	$scope.currentPage = 0;
    // }, true);

		$scope.hoveringOver = function(value,key,object) {
      $scope.overStar = value;
      $scope.percent = 100 * (value / $scope.max);
      $scope.selCheckVal = value;
  	};

  	// create user modals
  	$scope.createClient = function (owner) {

    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'modules/users/views/modal-create.client.view.html',
      controller: 'UsersModalController',
      resolve: {
      	owner: function () {
	      	if(owner === 'client'){
		        return 'client';
		    } else {
		        return 'client-client';
		    }
		}
      }
    });

    // modalInstance.result.then(function (selectedItem) {
    //   //$scope.selected = selectedItem;
    // }, function () {
    //   //$log.info('Modal dismissed at: ' + new Date());

    // });
		};
		// create talent modal
		$scope.createTalent = function(){
			var modalInstance = $modal.open({
		      animation: true,
		      templateUrl: 'modules/talents/views/create-talent-modal.client.view.html',
		      controller: 'TalentsModalController'
		    });

		    modalInstance.result.then(function (selectedItem) {
		      //$scope.selected = selectedItem;
		    }, function () {
		      //$log.info('Modal dismissed at: ' + new Date());
		    });
		};

  	// client portal specific methods
  	$scope.selAudition = function(key){
			var selectedAuditions = $scope.selectedAuditions,
					idx = selectedAuditions.indexOf(key);
			if (idx > -1){
			    selectedAuditions.splice(idx, 1);
			}else{
			    selectedAuditions.push(key);
			}
  	};
  	$scope.selCheck = function(filename){
			var selectedAuditions = $scope.selectedAuditions,
					i = 0;
			for(i = 0; i < selectedAuditions.length; ++i){
  			if(selectedAuditions[i] === filename){
  				return true;
  			}
  		}
  	};

  	$scope.hideAudition = function(filename){
			var auditions = $scope.project.auditions,
					limit = auditions.length;
  		// $scope.hideList.push(filename);
  		// get audition id
  		for(var i = 0; i < limit; ++i){
  			if(auditions[i].file.path === filename){
  				auditions[i].hidden = true;
  				$scope.updateNoRefresh();
  			}
  		}
  	};

  	$scope.isHidden = function(filename){
			var auditions = $scope.project.auditions,
					limit = auditions.length;

  		for(var i = 0; i < limit; ++i){
  			if(auditions[i].file.path === filename){
  				return true;
  			}
  		}

  		return false;
  	};

  	// download all auditions from project
  	$scope.downloadAllAuditions = function(){

		$http.post('/projects/downloadallauditions', {
			project: $scope.project
		}).
		success(function(data, status, headers, config) {
			// send data to users browser
			// wait one second for archive processing on server
			setTimeout(
				function(){
					window.location.href = 'res/archives/' + encodeURIComponent(data.zip);
				},
				1000
			);
		});
  	};

  	// compare dates check for within hour
  	$scope.compareDates = function(projDate){
  		var now = new Date();
  		projDate = new Date(projDate);

  		var hours = Math.abs(projDate - now) / 36e5;

  		if(hours <= 1){
  			return true;
  		} else {
 			return false;
  		}
  	};
  	$scope.compareDatesDay = function(projDate){
  		var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds

  		var now = new Date();
  		projDate = new Date(projDate);

  		var diffDays = Math.round(Math.abs((projDate.getTime() - now.getTime())/(oneDay)));


  		if(Number(diffDays) >= 1){
  			return true;
  		} else {
 			return false;
  		}
  	};
  	$scope.checkPassed = function(projDate){
  		var now = new Date();
  		projDate = new Date(projDate);

  		if(now > projDate){
  			return true;
  		} else {
  			return false;
  		}
  	};

  	// show part field if talent value is not already checked
  	$scope.showPartFld = function(id){
			var talent = $scope.project.talent;

			if(talent){

				var limit = talent.length,
						i = 0;

    		for(i = 0; i < limit; ++i){
    			if(talent[i].talentId === String(id) && (talent[i].requested === true || talent[i].regular === true)){
  					return false;
    			}
    		}
  		}
 			return true;
   	};
   	$scope.showPartString = function(id){
			var talent = $scope.project.talent;

			if(talent){

				var	limit = talent.length,
						i = 0;

    		for(i = 0; i < limit; ++i){
    			if(talent[i].talentId === String(id) && typeof talent[i].part !== 'undefined' && talent[i].part !== ''){
  					return talent[i].part;
    			}
    		}
			}
  	};
   	$scope.showCreatePartFld = function(id){

			var talent = $scope.project.talent;

			if(talent){

				var limit = talent.length,
						i = 0;

	  		for(i = 0; i < limit; ++i){
	  			if(talent[i].talentId === String(id) && (talent[i].requested === true || talent[i].regular === true)){
						return false;
	  			}
	  		}
			}
 			return true;
   	};
   	$scope.defaults = function(){
   		var allowRoles = ['producer/auditions director', 'audio intern'],
					limitAllow = allowRoles.length,
					roles = Authentication.user.roles,
					limit = roles.length,
					i = 0,
					j = 0;

			for(i = 0; i < limit; ++i){
				for(j = 0; j < limitAllow; ++j){
					if(roles[i] === allowRoles[j]) {
						$scope.searchText.status = 'In Progress';
					}
				}
			}
   	};
		// verify users
		$scope.isOwner = function(){
			var project = $scope.project,
					authUsr = Authentication.user;

			if(typeof project.user === 'object'){
				if(String(project.owner) === String(authUsr._id) || String(project.user._id) === String(authUsr._id)){
					return true;
				} else {
					return false;
				}
			}
		};
		$scope.permitRoles = function(selRoles){
			var allowLimit = selRoles.length,
					roles = Authentication.user.roles,
					limit = roles.length,
					i = 0,
					j = 0;

			for(i = 0; i < limit; ++i){
				for(j = 0; j < allowLimit; ++j){
					if(roles[i] === selRoles[j]) {
						return true;
					}
				}
			}
		};
		// verify create access
		$scope.userCheck = function(){
			var authRoles = Authentication.user.roles;

			if(authRoles[0] !== 'admin' && authRoles[0] !== 'producer/auditions director' && authRoles[0] !== 'audio intern' && authRoles[0] !== 'production coordinator'){
				$location.path('/projects');
			}
		};

		// send talent project welcome email
		$scope.sendTalentEmail = function(talentId){
			var talents = $scope.project.talent;

			// find selected talent
			angular.forEach(talents, function(talent, key) {

				if(talent.talentId === talentId){

					$http.post('/projects/sendtalentemail', {
			        talent: talent,
			        project: $scope.project,
			        override: true
			    }).
					success(function(data, status, headers, config) {
						alert('Selected talent has been emailed.');

						// update project store
						$scope.project = data;
					});

				}

			});

		};

		// send various client emails
		$scope.sendClientEmail = function(type){
			var selectedMainClients = $scope.selectedMainClients,
				project = $scope.project,
				authUser = Authentication.user;

			if(selectedMainClients.length > 0){

				// update email count
    		if(typeof project.counts === 'undefined'){
    			project.counts = {};
    		}
    		if(typeof project.counts[type] === 'undefined'){
    			project.counts[type] = 0;
    		}
    		project.counts[type] += 1;

			$http.post('/projects/sendclientemail', {
		        type: type,
		        project: project,
		        clients: selectedMainClients,
		        count: project.counts[type]
		    }).
				success(function(data, status, headers, config) {
      		alert('Clients sent ' + type + ' Email ');
      		$scope.selectedMainClients = [];

					var note, now = Date.now();
					var item = {
						date: now,
						userid: '',
						username: 'System',
						item: '',
						deleted: false
					};

      		// add note
      		switch(type){
      			case 'opening':
						note = 'Client Notified of Project Start by ' + authUser.displayName;
					break;
					case 'carryover':
						note = 'Client sent Carryover by ' + authUser.displayName;
					break;
					case 'closing':
						note = 'Client Notified of Project Completion by ' + authUser.displayName;
					break;
      		}

      		// add note to note object
      		item.item = note;

      		// add to project discussion
      		project.discussion.push(item);

      		// update project store
			//$scope.update();
			$scope.updateNoRefresh();
      	}).
				error(function(data, status, headers, config) {
					alert('An error occured while sending client emails. Please contact your administrator.');
			    // called asynchronously if an error occurs
			    // or server returns response with an error status.
				});

			} else {
				alert('Please select clients to email!');
			}
		};

		// gathers to field addresses for emails
		$scope.gatherToAddresses = function(type){

			// create mail object
			var emailObj = {
					email: {
						projectId: $scope.project._id,
						to: [],
						bcc: [],
						subject: '',
						message: ''
					}
				},
				project = $scope.project,
				l = 0,
				limit = project.talent.length;

			angular.extend($scope, emailObj);

			// send update email
			var toEmails = [];
			var emailCnt = 0;
			// regex validate email
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

			// attach current user to email chain
			toEmails[emailCnt] = Authentication.user.email;

			// attach client clients to email chain
			// if(type !== 'updateTeam' && type !== 'updateClient' && type !== 'saveDiscussion'){
			// 	for(var i = 0; i < $scope.project.clientClient.length; ++i){
			// 		if($scope.project.clientClient[i].email !== '' && re.test($scope.project.clientClient[i].email)){
			// 			emailCnt += 1;
			// 			toEmails[emailCnt] = $scope.project.clientClient[i].email;
			// 		}
			// 	}
			// }

			// attach clients to email chain
			// if(type !== 'updateTeam' && type !== 'updateClient' && type !== 'saveDiscussion'){
			// 	for(var j = 0; j < $scope.project.client.length; ++j){
			// 		if($scope.project.client[j].email !== '' && re.test($scope.project.client[j].email)){
			// 			emailCnt += 1;
			// 			toEmails[emailCnt] = $scope.project.client[j].email;
			// 		}
			// 	}
			// }

			// attach talents to email chain
			if(type !== 'updateTalent' && type !== 'updateTeam' && type !== 'updateClientClient' && type !== 'updateClient' && type !== 'saveAudtionNote' && type !== 'saveScriptNote' && type !== 'saveDiscussion' && type !== 'updateStatus'){
				for(l = 0; l < limit; ++l){
					if(project.talent[l].email !== '' && re.test(project.talent[l].email)){
						emailCnt += 1;
						toEmails[emailCnt] = project.talent[l].email;
					}
				}
			}

			// check for accounts associated
			$scope.email.to = toEmails;
		};

		// update group checkbox selectors
		$scope.checkClientClientUsers = function(userId){
			var project = $scope.project;
			if(typeof project.clientClient === 'object'){
				var	limit = project.clientClient.length,
						i = 0;

				if(typeof project === 'object'){
					for(i = 0; i < limit; ++i){
						if(project.clientClient[i].userId === userId){
							return true;
						}
					}
				}
			}
		};
		$scope.checkClientUsers = function(userId){
			var project = $scope.project;
			if(typeof project.client === 'object'){
				var limit = project.client.length,
						i = 0;

				if(typeof project === 'object'){
					for(i = 0; i < limit; ++i){
						if(project.client[i].userId === userId){
							return true;
						}
					}
				}
			}
		};
		$scope.checkClientUsersCreate = function(userId){
			var project = $scope.newProject;
			if(typeof project.client === 'object'){
				var limit = project.client.length,
						i = 0;

				if(typeof project === 'object'){
					for(i = 0; i < limit; ++i){
						if(project.client[i].userId === userId){
							return true;
						}
					}
				}
			}
		};
		$scope.checkTeam = function(userId){
			var project = $scope.project;
			if(typeof project.team === 'object'){
				var limit = project.team.length,
						i = 0;

				if(typeof project === 'object'){
					for(i = 0; i < limit; ++i){
						if(project.team[i].userId === userId){
							return true;
						}
					}
				}
			}
		};
		$scope.checkTalent = function(talentId){
			var project = $scope.project;
			if(typeof project.talent === 'object'){
				var limit = project.talent.length,
						i = 0;

				if(typeof project === 'object'){
					for(i = 0; i < limit; ++i){
						if(project.talent[i].talentId === talentId && project.talent[i].regular === true){
							return true;
						}
					}
				}
			}
		};
		$scope.checkRequestedTalent = function(talentId){
			var project = $scope.project;
			if(typeof project.talent === 'object'){
				var limit = project.talent.length,
						i = 0;

				if(typeof project === 'object'){
					for(i = 0; i < limit; ++i){
						if(project.talent[i].talentId === talentId && project.talent[i].requested === true){
							return true;
						}
					}
				}
			}
		};
		$scope.checkCreateTalent = function(talentId){
			var project = $scope.newProject;
			if(typeof project.talent === 'object'){
				var limit = project.talent.length,
						i = 0;

				for(i = 0; i < limit; ++i){
					if(project.talent[i].talentId === talentId && project.talent[i].regular === true){
						return true;
					}
				}
			}
		};
		$scope.checkRequestedCreateTalent = function(talentId){
			var project = $scope.newProject;
			if(typeof project.talent === 'object'){
				var limit = project.talent.length,
						i = 0;

				for(i = 0; i < limit; ++i){
					if(project.talent[i].talentId === talentId && project.talent[i].requested === true){
						return true;
					}
				}
			}
		};

		$scope.updateTalent = function(talentId, talentName, email, locationISDN, nameLnmCode){

			var found = 0,
					i = 0,
					talents = $scope.project.talent,
					limit = talents.length;

			// gen talent object
			var log, talent = {
							'talentId': talentId,
							'name': talentName,
							'nameLnmCode': talentName,
							'locationISDN': locationISDN,
							'email': email,
							'booked': false,
							'status': 'Cast',
							'part': $scope.parts[talentId] || '',
							'regular': true,
							'requested': false,
							'added': moment().tz('America/New_York').format()
						};

			$scope.addTalent = false;

			// check for existing item
			for(i = 0; i < limit; ++i){
				if(talents[i].talentId === talentId){
					// reset requested to false
					if(talents[i].requested === true){
						talents[i].requested =  false;
					}
					// update regular status
					if(talents[i].regular === true){
						talents[i].regular = false;
					} else {
						talents[i].regular = true;
					}
					// remove talent if no longer selected
					if(talents[i].regular === false && talents[i].requested === false){

						log = {
							type: 'talent',
							sharedKey: talents[i].talentId,
							description: 'talent ' + talents[i].name + ' removed from  ' + $scope.project.title
						};

						$scope.project.log = log;

						$scope.project.talent.splice(i, 1);

						$scope.updateNoRefresh();

						$scope.addTalent = true;

						return;
					}
					found = 1;
				}
			}

			if(found === 0){
				talents.push(talent);

				log = {
						type: 'talent',
						sharedKey: talent.talentId,
						description: 'talent ' + talent.name + ' added to project  ' + $scope.project.title
					};

				$scope.project.log = log;

				// send talent director email
				$http.post('/projects/sendTalentDirectorsEmail', {
					talent: talent,
					projectId: $scope.project._id
				});

			}

			$http.post('/projects/sendTalentEmail', {
				talent: talent,
				project: $scope.project
			}).
			success(function(data, status, headers, config) {
				$scope.project = angular.extend($scope.project, data);
				$scope.addTalent = true;
			});

			// update project store
			//$scope.update();
		};
		$scope.updateRequestTalent = function(talentId, talentName, email, locationISDN, nameLnmCode){

			var found = 0,
					i = 0,
					talents = $scope.project.talent,
					limit = talents.length;

			// gen talent object
			var log, talent = {
							'talentId': talentId,
							'name': talentName,
							'nameLnmCode': talentName,
							'locationISDN': locationISDN,
							'email': email,
							'booked': false,
							'status': 'Cast',
							'part': $scope.parts[talentId] || '',
							'regular': false,
							'requested': true,
							'added': moment().tz('America/New_York').format()
						};

			$scope.addTalent = false;

			// check for existing item
			for(i = 0; i < limit; ++i){
				if(talents[i].talentId === talentId){
					// reset regular talent status
					if(talents[i].regular === true){
						talents[i].regular = false;
					}
					// check requested talent status
					if(talents[i].requested === true){
						talents[i].requested = false;
					} else {
						talents[i].requested = true;
					}
					// remove talent if no longer selected
					if(talents[i].regular === false && talents[i].requested === false){

						log = {
							type: 'talent',
							sharedKey: talents[i].talentId,
							description: 'REQUESTED talent ' + talents[i].name + ' removed from  ' + $scope.project.title
						};

						$scope.project.log = log;

						$scope.project.talent.splice(i, 1);

						$scope.updateNoRefresh();

						$scope.addTalent = true;

						return;
					}
					found = 1;
				}
			}

			if(found === 0){
				talents.push(talent);

				log = {
							type: 'talent',
							sharedKey: talent.talentId,
							description: 'REQUESTED talent ' + talent.name + ' added to project  ' + $scope.project.title
						};

				$scope.project.log = log;
			}

			$http.post('/projects/sendTalentEmail', {
	        talent: talent,
	        project: $scope.project
	    }).
			success(function(data, status, headers, config) {
				$scope.project = angular.extend($scope.project, data);

				$scope.addTalent = true;
			});

			// update project store
			//$scope.update();
		};
		$scope.updateCreateTalent = function(talentId, talentName, email){

			var found = 0,
					i = 0,
					talents = $scope.newProject.talent,
					limit = talents.length;

			// gen talent object
			var talent = {
							'talentId': talentId,
							'name': talentName,
							'email': email,
							'booked': false,
							'status': 'Cast',
							part: $scope.parts[talentId] || '',
							regular: true,
							requested: false,
							added: moment().tz('America/New_York').format()
						};

			// check for existing item
			for(i = 0; i < limit; ++i){
				if(talents[i].talentId === talentId){
					// reset requested status
					if(talents[i].requested === true){
						talents[i].requested = false;
					}
					// set regular status
					if(talents[i].regular === true){
						talents[i].regular = false;
					} else {
						talents[i].regular = true;
					}
					// remove talent if no longer selected
					if(talents[i].regular === false && talents[i].requested === false){
						talents.splice(i, 1);
					}
					found = 1;
				}
			}

			// add talent if never found
			if(found === 0){
				talents.push(talent);
			}

		};
		$scope.updateRequestCreateTalent = function(talentId, talentName, email){

			var found = 0,
					i = 0,
					talents = $scope.newProject.talent,
					limit = talents.length;

			// gen talent object
			var talent = {
							'talentId': talentId,
							'name': talentName,
							'email': email,
							'booked': false,
							'status': 'Cast',
							part: $scope.parts[talentId] || '',
							regular: false,
							requested: true,
							added: moment().tz('America/New_York').format()
						};

			// check for existing item
			for(i = 0; i < limit; ++i){
				if(talents[i].talentId === talentId){
					// reset regular talent if set
					if(talents[i].regular === true){
						talents[i].regular = false;
					}
					// set requested talent
					if(talents[i].requested === true){
						talents[i].requested = false;
					} else {
						talents[i].requested = true;
					}
					// remove talent if no longer selected
					if(talents[i].regular === false && talents[i].requested === false){
						talents.splice(i, 1);
					}
					found = 1;
				}
			}

			// add talent if never found
			if(found === 0){
				talents.push(talent);
			}

		};

		$scope.updateTalentStatus = function(talentId, status){

			var talents = $scope.project.talent,
					limit = talents.length,
					i = 0;

			for(i = 0; i < limit; ++i){
				if(String(talents[i].talentId) === String(talentId)){
					talents[i].status = status;

					var log = {
						type: 'talent',
						sharedKey: talents[i].talentId,
						description: 'talent ' + talents[i].name + ' status updated to ' + talents[i].status
					};

					$scope.project.log = log;

					// update project store
					//$scope.update();
					$scope.updateNoRefresh();
				}
			}

		};

		$scope.getTalentStatus = function(talentId){

			var talents = $scope.project.talent,
					limit = talents.length,
					i = 0;

			for(i = 0; i < limit; ++i){
				if(String(talents[i].talentId) === String(talentId)){
					 return talents[i].status;
				}
			}
		};

		$scope.updateClientClient = function(userId, displayName, email){

			var clientClients = $scope.project.clientClient,
					limit = clientClients.length,
					i = 0;

			// gen user object
			var found = 0,
				user = {
							'userId': userId,
							'name': displayName,
							'email': email
						};

			// check for existing item
			for(i = 0; i < limit; ++i){
				if(clientClients[i].userId === userId){
					clientClients.splice(i, 1);
					found = 1;
				}
			}

			if(found === 0){
				clientClients.push(user);
			}

			// update project store
			//$scope.update();
			$scope.updateNoRefresh();
		};

		$scope.updateClient = function(userId, displayName, email){

			var clients = $scope.project.client,
					limit = clients.length,
					i = 0;

			// gen user object
			var found = 0, user = {
						'userId': userId,
						'name': displayName,
						'email': email
					};

			// check for existing item
			for(i = 0; i < limit; ++i){
				if(clients[i].userId === userId){
					clients.splice(i, 1);
					found = 1;
				}
			}

			if(found === 0){
				clients.push(user);
			}

			// update project store
			//$scope.update();
			$scope.updateNoRefresh();
		};

		$scope.updateCreateClient = function(userId, displayName, email){

			var clients = $scope.newProject.client,
					limit = clients.length,
					i = 0;

			// gen user object
			var found = 0, user = {
						'userId': userId,
						'name': displayName,
						'email': email
					};

			// check for existing item
			for(i = 0; i < limit; ++i){
				if(clients[i].userId === userId){
					clients.splice(i, 1);
					found = 1;
				}
			}

			if(found === 0){
				clients.push(user);
			}

		};

		$scope.toggleBooked = function(talentId){

			var talents = $scope.project.talent,
					limit = talents.length,
					i = 0;

			for(i = 0; i < limit; ++i){
				if(talents[i].talentId === talentId){

					talents[i].booked = !talents[i].booked;

					var log = {
						type: 'talent',
						sharedKey: talents[i].talentId,
						description: 'talent ' + talents[i].name + ' booked status set to ' + talents[i].booked
					};

					$scope.project.log = log;

					// update project store
					$scope.updateNoRefresh();

				}
			}
		};

		// gather booked data
		$scope.getBooked = function(talentId){

			var talents = $scope.project.talent,
					limit = talents.length,
					i = 0;

			for(i = 0; i < limit; ++i){
				if(talents[i].talentId === talentId){
					if(talents[i].booked === true){
						return true;
					}
				}
			}
		};

		// get talent audition note
		$scope.getTalentNote = function(talentId){

			var talents = $scope.project.talent,
					limit = talents.length,
					i = 0;

			if(typeof $scope.project !== 'undefined' && typeof talents !== 'undefined'){
				for(i = 0; i < limit; ++i){
					if(talents[i].talentId === talentId){

						return talents[i].note;

					}
				}
			}

		};
		// save talent note
		$scope.saveTalentNote = function(talentId){

			var talents = $scope.project.talent,
					limit = talents.length,
					i = 0;

			for(i = 0; i < limit; ++i){
				if(talents[i].talentId === talentId){
					talents[i].note = $scope.talentNote[talentId];
					$scope.updateNoRefresh();
				}
			}

		};

		// Create new Project
		$scope.create = function() {

			// method vars
			var proStatus = 'In Progress',
					id = '',
					newProject = $scope.newProject;

			// update project status, if needed
			if(typeof newProject._id !== 'undefined'){
				id = newProject._id;
				proStatus = 'ReAuditioned';
			}

			// Create new Project object
			var project = new Projects ({
				id: id,
				title: newProject.title,
				estimatedCompletionDate: newProject.estimatedCompletionDate,
				estimatedTime: newProject.estimatedTime,
				actualTime: newProject.actualTime,
				status: proStatus,
				sounders: newProject.sounders,
				scripts: newProject.scripts,
				copiedScripts: newProject.copiedScripts,
				referenceFiles: newProject.referenceFiles,
				copiedReferenceFiles: newProject.copiedReferenceFiles,
				description: newProject.description,
				client: newProject.client,
				talent: newProject.talent,
				notifyClient: newProject.notifyClient
			});

			// Redirect after save
			project.$save(function(response) {
				$location.path('projects/' + response._id);

				// Clear form fields
				$scope.name = '';
				$scope.newProject = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Project
		$scope.remove = function( project ) {
			if(confirm('Are you sure?')){
				if ( project ) {
					project.$remove();

					for (var i in $scope.projects ) {
						if ($scope.projects [i] === project ) {
							$scope.projects.splice(i, 1);
						}
					}
				} else {
					$scope.project.$remove(function() {
						$location.path('projects');
					});
				}
			}
		};

		// Update existing Project
		$scope.update = function(redirect) {
			var project = $scope.project;
			// determine if update should result in user redirect
			redirect = typeof redirect === 'undefined' ? true : redirect;


			project.$update(function() {
				if(redirect === true){
					$location.path('projects/' + project._id);
				}
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.updateNoRefresh = function(){

			// merge existing open project with updated project
			$http.post('/projects/updateNoRefresh', {
				project: $scope.project
			}).success(function(data, status, headers, config) {

				// update local project document
				if(data){
					$scope.project = angular.extend($scope.project, data);
				}

				// remove update overlay
				$scope.processing = false;

			});

		};

		// duplicate existing project
		$scope.dupCheck = function(){

			if($stateParams.projectId){

				$http.get('/projects/' + $stateParams.projectId, {})
				.success(function(data, status, headers, config) {
					$scope.newProject = data;

					// reset some defaults
					$scope.newProject.title = $scope.newProject.title + ' ReAudition';
					$scope.newProject.talent = [];

					// copy existing scripts and ref files
					$scope.newProject.copiedScripts = $scope.newProject.scripts;
					$scope.newProject.scripts = [];
					$scope.newProject.copiedReferenceFiles = $scope.newProject.referenceFiles;
					$scope.newProject.referenceFiles = [];
					$scope.newProject.estimatedCompletionDate = '';
				});

				$scope.newProjTalentLink = 'createDupProject.talent';
				$scope.newProjLink = 'createDupProject.project';

			}

		};

		// client update

		// update audition rating
		$scope.updateRating = function(path, redirect){

			var auditions = $scope.project.auditions,
					limit = auditions.length,
					j = 0,
					i = 0,
					rateLimit = 0;

			// determine if update should result in user redirect
			redirect = typeof redirect === 'undefined' ? true : redirect;

			// console.log($scope.rate[key]);
			var key, ratingCnt = 0, avgRating = 0;

			// get key for selected audition
			for(j = 0; j < limit; ++j){
				if(auditions[j].file.path === path){
					key = j;
				}
			}

			// walk through existing ratings
			if(typeof auditions[key] !== 'undefined' && typeof auditions[key].rating !== 'undefined'){
				rateLimit = auditions[key].rating.length;
				for(i = 0; i < rateLimit; ++i){
					// toggle existing rating if found
					if(auditions[key].rating[i].userId === Authentication.user._id){
						auditions[key].rating.splice(i,1);
						auditions[key].curRating = $scope.selCheckVal;
					} else {
						// gather average rating
						avgRating += auditions[key].rating[i].value;
					}
				}
				ratingCnt += auditions[key].rating.length;
			}

			avgRating += $scope.selCheckVal;

			// average rating values
			avgRating /= ratingCnt + 1;

			// generate new rating object
			var rating = {
				userId: Authentication.user._id,
				value: $scope.selCheckVal
			};

			// push new rating
			auditions[key].rating.push(rating);

			// merge average rating
			auditions[key].avgRating = avgRating;

			// update project store
			$scope.updateNoRefresh();
		};

		// update phase options
		$scope.updateStatus = function(key){

			// update change value
			var discussion,
					item,
					project = $scope.project,
					i = 0,
					clientLimit = 0;

			var newDate = moment(new Date()).format('MM/DD/YYYY h:mm a');
			project.phases[key].changeDate = newDate;

			// send email if P&P status set to specified values
			if(String(project.phases[key].name) === 'Posting and Publishing'){
				if(String(project.phases[key].status) === 'Holding for more talent' || String(project.phases[key].status) === 'Holding For Requested Talent'){

					// send update email
					$scope.gatherToAddresses('updateStatus');
			    $scope.email.subject = project.title + ' Phase ' + project.phases[key].name + ' Status Update';
			    $scope.email.message += 'Project: ' + project.title + '<br>';
			    $scope.email.message += 'Phase: ' + project.phases[key].name + '<br>';
			    $scope.email.message += 'Status: ' + project.phases[key].status + '<br>';
			    $scope.email.message += 'Start Date: ' + (project.phases[key].startDate || '') + '<br>';
			    $scope.email.message += 'Change Date: ' + (project.phases[key].changeDate || '') + '<br>' + '<br>';
			    $scope.email.message += 'Added by: ' + Authentication.user.displayName + '<br>';
			    $scope.email.message += '<br>' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 || $location.port() !== 443 ? ':' + $location.port() : '') + '/#!/projects/' + project._id + '<br>';

			    $http.post('/projects/sendemail', {
					email: $scope.email
					});

					discussion = 'Project phase ' + project.phases[key].name + ' status changed to ' + project.phases[key].status + ' on ' + newDate + ' EST by ' + Authentication.user.displayName;
					item = {
						date: newDate,
						userid: '',
						username: 'System',
						item: discussion,
						deleted: false
					};
					project.discussion.push(item);

				} else if(String(project.phases[key].status) === 'Waiting For Clients to Be Added'){

						// send update email
						$scope.gatherToAddresses('updateStatus');
					    $scope.email.subject = 'Please add Clients to ' + project.title;
					    $scope.email.message += 'Project: ' + project.title + '<br>';
					    $scope.email.message += 'Phase: ' + project.phases[key].name + '<br>';
					    $scope.email.message += 'Status: ' + project.phases[key].status + '<br>';
					    $scope.email.message += 'Start Date: ' + (project.phases[key].startDate || '') + '<br>';
					    $scope.email.message += 'Change Date: ' + (project.phases[key].changeDate || '') + '<br>' + '<br>';
					    $scope.email.message += 'Added by: ' + Authentication.user.displayName + '<br>';
					    $scope.email.message += '<br>' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 || $location.port() !== 443 ? ':' + $location.port() : '') + '/#!/projects/' + project._id + '<br>';

					    $http.post('/projects/sendemail', {
							email: $scope.email
						});

						discussion = 'Project phase ' + project.phases[key].name + ' status changed to ' + project.phases[key].status + ' on ' + newDate + ' EST by ' + Authentication.user.displayName;
						item = {
							date: newDate,
							userid: '',
							username: 'System',
							item: discussion,
							deleted: false
						};
						project.discussion.push(item);
				}
			}

	    if(project.phases[key].status === 'complete'){
	    	var now = new Date();
	    	project.phases[key].endDate = now.toJSON();
				// update project status only for "Posting and Publishing" phase
				if(project.phases[key].name === 'Posting and Publishing'){
					// reset overall project status to closed
					project.status = 'Closed - Pending Client Decision';

					// send closing email
					clientLimit = project.client.length;
					for(i = 0; i < clientLimit; ++i){
						$scope.selectedMainClients[i] = project.client[i].userId;
					}
					$scope.sendClientEmail('closing');
				}

			}

			// update project store
			//$scope.update();
			$scope.updateNoRefresh();
		};

		// update and store sounders change note
		$scope.updateSoundersStatus = function(){

			var now = new Date(),
					project = $scope.project;
			var item = {
							date: now,
							userid: '',
							username: 'System',
							item: 'Changed to ' + project.sounders + ' by ' + Authentication.user.displayName,
							deleted: false
						};

			project.discussion.push(item);
			$scope.updateNoRefresh();

		};

		$scope.updateProjectStatus = function(){

			var now = new Date(),
					project = $scope.project;
			var item = {
							date: now,
							userid: '',
							username: 'System',
							item: 'Changed to ' + project.status + ' by ' + Authentication.user.displayName,
							deleted: false
						};

			project.discussion.push(item);

			// update project with new status
			$scope.updateNoRefresh();

			// email associated talent and update talent status
			if(project.status === 'Canceled'){

				$http.post('/projects/sendTalentCanceledEmail', {
			        talents: project.talent,
			        projectId: project._id,
			        override: false
			    }).
				success(function(data, status, headers, config) {
					// update project store
					project = angular.extend(project, data);

					// update project with new status
					$scope.update();
				});

			}

		};
		// gather filter values
		$scope.getFilterVars = function(){
			// det start val
			var filterObj = {};
			// filter by title
			if($scope.searchText.title){
				filterObj.title = $scope.searchText.title;
			}
			if($scope.searchText.description){
				filterObj.description = $scope.searchText.description;
			}
			// filter sort options
			if($scope.sortText){
				filterObj.sortOrder = $scope.sortText;
			} else {
				filterObj.sortOrder = 'created';
			}
			// filter data order
			if($scope.sortTextOrder){
				filterObj.ascDesc = $scope.sortTextOrder;
			} else {
				filterObj.ascDesc = 'desc';
			}
			// filter out users projects
			if($scope.searchText.user){
				filterObj.myProjects = true;
			} else {
				filterObj.myProjects = false;
			}
			// filter in Progress
			if($scope.searchText.status){
				filterObj.status = 'In Progress';
			}
			// filter in Progress
			if($scope.searchText.clientEmail){
				filterObj.clientEmail = $scope.searchText.clientEmail;
			}

			return filterObj;
		};
		// get count of all projects in db
		$scope.getProjectsCnt = function(){

			// gen filter object
			var filterObj = $scope.getFilterVars();

			$http.post('/projects/getProjectsCnt', {
				filter: filterObj
			}).
			success(function(data, status, headers, config) {
				$scope.projectsTotalCnt = data;
			});

		};
		// Find a list of Projects
		$scope.find = function() {
			$scope.projects = Projects.query();
		};
		// find list of projects using set download limiter
		$scope.findLimit = function(){
			$http.post('/projects/findLimit', {
        queryLimit: $scope.queryLimit
	    }).
			success(function(data, status, headers, config) {
				$scope.projects = [];
				$scope.projects = data;

				$scope.getProjectsCnt();
			});
		};
		// retrieve set number of projects with server side filtration
		$scope.findLimitWithFilter = function(){

			// det start val
			var startVal = $scope.currentPage * $scope.limit;
			// gather filter objects
			var filterObj = $scope.getFilterVars();

			$http.post('/projects/findLimitWithFilter', {
				startVal: startVal,
				limitVal: $scope.limit,
				filter: filterObj
			}).
			success(function(data, status, headers, config) {
				$scope.projects = [];
				$scope.projects = data;
				$scope.getProjectsCnt();
			}).error(function (data, status, headers, config) {
                console.log(status);
				console.log(data);
			});

		};
		$scope.updateLimit = function(limit){
			$scope.queryLimit = limit;
			$scope.findLimit();
		};

		// dynamically update project view
		Socket.on('projectsListUpdate', function() {
			$scope.findLimitWithFilter();
		});

		// find single project by id
		$scope.findOneById = function(id) {

			// reset selected params
			$scope.selectedAuditions = [];
			$scope.hideList = [];

			// assigned search id
			$stateParams.projectId = id;

			// retrieve selected project
			$scope.findOne();

			// update selected rating
			$scope.curRatings();

		};

		Socket.on('projectUpdate', function(pojectData) {

			var project = $scope.project;

			if(String(pojectData.id) === String(project._id)){
				// merge existing open project with updated project
				$http.post('/projects/getproject', {
					id: project._id
				}).success(function(data, status, headers, config) {
					project = angular.extend(project, data);
				});
			}

		});

		// reload auditions if single aud updated
		Socket.on('auditionUpdate', function(pojectID) {

			var project = $scope.project;

			if(String(pojectID.id) === String(project._id)){

				loadAuditions();

			}

		});

		// Find existing Project
		$scope.findOne = function() {
			$scope.project = Projects.get({
				projectId: $stateParams.projectId
			});
		};

		$rootScope.$on('refreshProject',
			function(event, args) {
				$scope.findOneById(args);
			}
		);

		// load project in view
		$scope.loadProject = function(){

			// load project document
			//this.findOne();

			// check for new file
			$http.post('/projects/loadProject', {
				projectId: $stateParams.projectId
			// file found
			}).success(function(data, status, headers, config) {
				$scope.project = new Projects();
				$scope.project = angular.extend($scope.project, data);
			// file not found
			}).error(function(data, status, headers, config) {
				console.log('Problem loading project.');
			});

			loadAuditions();

		};

		// update project after all auditions file have been checked
		if(typeof $scope.watchersObj.procCnt !== 'object'){
			$scope.watchersObj.procCnt = $scope.$watchCollection('procCnt', function(){
				if($scope.procCnt > 0 && $scope.newFileCnt > 0){
					if($scope.procCnt === $scope.newFileCnt){
						// save project changes
						$scope.updateNoRefresh();
						// reset count vars
						$scope.newFileCnt = 0;
						$scope.procCnt = 0;
					}
				}
			});
		}

		// load audio files into player after project object has finished loading
		if(typeof $scope.watchersObj['newProject.estimatedCompletionDate'] !== 'object'){
			$scope.$watchCollection('newProject.estimatedCompletionDate', function(val){
				var now = new Date();

				if($scope.newProject.estimatedCompletionDate !== '' && $scope.newProject.estimatedCompletionDate < now){
					$scope.dateNotice = 'Date selected passed. Please select a future date and time!';
				} else {
					$scope.dateNotice = '';
				}
			});
		}

		$scope.calcProjectProg = function(curProject){
			if(typeof curProject.phases !== 'undefined'){
				var phaseLngth = curProject.phases.length;
				var complSteps = 0,
						i = 0;

				// determine completed steps
				for(i = 0; i < phaseLngth; ++i){
					if(curProject.phases[i].status === 'complete'){
						complSteps++;
					}
				}

				// configure progress bar values
				var perc = Math.floor((100 / phaseLngth) * complSteps);

				// set progress bar values
				return perc;
			}
		};

		// check files
		$scope.checkFileWalk = function(emitStatus){
			var auditions = $scope.project.auditions;

			if(auditions){
				var fn,
					file,
					limit = auditions.length,
					project = $scope.project;

				angular.forEach(auditions, function(value, key){

					if(typeof value.filecheck === 'undefined' || value.filecheck === 0){

						// increment file count
						$scope.newFileCnt += 1;

						// new file location
						fn = value.file.name;
						file = '/res/auditions/'+project._id+'/'+fn;

						// check for new file
						$http.post('/projects/fileExists', {
							file: file
						// file found
						}).success(function(data, status, headers, config) {
							auditions[key].filecheck = 1;
							auditions[key].filecheckdate = new Date();
							$scope.procCnt += 1;
						// file not found
						}).error(function(data, status, headers, config) {
							auditions[key].filecheck = 2;
							auditions[key].filecheckdate = new Date();
							$scope.procCnt += 1;
						});

					}

					if(key === (limit-1)) {
						$scope.fileCheck = true;

						if(typeof emitStatus !== 'undefined' || emitStatus === 1){
							alert('File check complete.');
						}
					}

				});
			}

		};

		// check all files assigned to project
		$scope.checkAllFiles = function(){

			var auditions = $scope.project.auditions,
					limit = auditions.length,
					i = 0;

			// reset file check status for all files
			for(i = 0; i < limit; ++i){
				auditions[i].filecheck = 0;

				// init file check walk on reset finish
				if((i+1) === limit){
					$scope.checkFileWalk(1);
				}
			}

		};

		if(typeof $scope.watchersObj.project !== 'object'){
			$scope.watchersObj.project = $scope.$watchCollection('project', function(val){

				if(typeof $scope.project === 'object'){

					if(typeof $scope.watchersObj.project.auditions !== 'object'){
						$scope.watchersObj.project.auditions = $scope.$watchCollection('project.auditions',function(){
							// var file;

							// audition file check
							if($scope.fileCheck === false){
								$scope.checkFileWalk();
							}

						});
					}

					// check for values then do things
					if(typeof $scope.watchersObj.project.referenceFiles !== 'object'){
						$scope.watchersObj.project.referenceFiles = $scope.$watchCollection('project.referenceFiles',function(){
							if(typeof $scope.project.referenceFiles === 'object'){
								if($scope.project.referenceFiles.length > 0){
									$scope.toggleRefs = true;
								}
							}
						});
					}

					// update progress bar
					if(typeof $scope.watchersObj.project.phases !== 'object'){
						$scope.watchersObj.project.phases = $scope.$watchCollection('project.phases', function(val){

							if(typeof $scope.project.phases !== 'undefined'){
								var phaseLngth = $scope.project.phases.length;
								var complSteps = 0;

								// determine completed steps
								for(var i = 0; i < phaseLngth; ++i){
									if($scope.project.phases[i].status === 'complete'){
										complSteps++;
									}
								}

								// configure progress bar values
								var perc = Math.floor((100 / phaseLngth) * complSteps);

								// if(perc >= 100){
								// 	$scope.project.status = 'Complete';
								// } else {
								// 	//$scope.project.status = 'In Progress';
								// }

								// set progress bar values
								$scope.dynamic = perc;
							}

						});
					}

				}
			});
		}

		// verify audio objects
		$scope.verifyAudio = function(key){
			var auditions = $scope.project.auditions;

			if(typeof auditions[key] === 'object'){
				if(typeof auditions[key].file === 'object'){
					return true;
				}
			}
			return false;
		};

		// check for media file
		$scope.checkForAudio = function(file){

			var fileExt = /(\w{3})$/i.exec(file);

			if(fileExt[1].toLowerCase() === 'mp3'){
				return true;
			}

		};

		$scope.verifyFile = function(file){

			if(typeof $scope.verifyFilesList[file] === 'undefined'){

				if($scope.verifyFilesList[file] !== 'scanning' || $scope.verifyFilesList[file] !== true || $scope.verifyFilesList[file] !== false){

					$scope.verifyFilesList[file] = 'scanning';

					$http.post('/projects/fileExists', {
						file: file
					}).success(function(data, status, headers, config) {
						$scope.verifyFilesList[file] = true;
						return true;
					}).error(function(data, status, headers, config) {
						$scope.verifyFilesList[file] = false;
				        return false;
				    });

				}

			}

		};

		$scope.stopAudio = function(){
			var audio = $scope.audio;

			if(typeof audio === 'object'){
				audio.unbind();
				audio.stop();
				// console.log('stop');
				$scope.audioStatus = 2;
			}
		};

		$scope.playAudioNoTrack = function(key, filename, fileDir){

			var fileName = '';

			// assign file name
			if(typeof fileDir === 'undefined'){
				fileName = '/res/auditions/' + $scope.project._id + '/' + filename;
			} else {
				fileName = fileDir + '/' + filename;
			}

			if(IS_NOT_MOBILE){

				// check media file play state
				// console.log(typeof $scope.audio);
				// console.log($scope.lastAudioID);
				if(key !== $scope.lastAudioID && typeof $scope.audio === 'object'){
					$scope.audio.unbind();
					$scope.audio.stop();
					// console.log('stop');
				}
				if(typeof $scope.audio === 'object' && key === $scope.lastAudioID && $scope.audioStatus === 1){
					$scope.audio.pause();
					$scope.audioStatus = 0;
					//console.log('pause');
					return;
				}
				if(typeof $scope.audio === 'object' && key === $scope.lastAudioID && $scope.audioStatus === 0){
					$scope.audio.play();
					$scope.audioStatus = 1;
					// console.log('play');
					return;
				}
				// if(typeof $scope.audio === 'object' && key === $scope.lastAudioID && $scope.audioStatus === 2){
				// 	$scope.audio.play();
				// 	$scope.audioStatus = 1;
				// 	// console.log('play');
				// 	return;
				// }

				//if($scope.audio = ngAudio.load(fileName)){
					$scope.audio = ngAudio.load(fileName).play();
					$scope.loop = 0;
					//$scope.audio.unbind();
					$scope.audioStatus = 1;

					// store current audio key
					$scope.lastAudioID = key;

					//$scope.audio.play();
				//}

			// mobile and tablet playback
			} else {
				if ((typeof $scope.audio.paused === 'undefined' || typeof $scope.audio.filename === 'undefined') || ($scope.audio.paused && $scope.audio.currentTime > 0 && !$scope.audio.ended)) {
					$scope.audio = new Audio(fileName);
					$scope.audio.play();
					$scope.audio.filename = fileName;
					$scope.audioStatus = 1;
					$scope.lastAudioID = key;
					$scope.audio.mobile = true;
				} else {
					if($scope.audio.filename !== fileName){
						$scope.audio.pause();
						$scope.audio = new Audio(fileName);
						$scope.audio.play();
						$scope.audio.filename = fileName;
						$scope.audioStatus = 1;
						$scope.lastAudioID = key;
					} else {
						$scope.audio.pause();
						$scope.audioStatus = 0;
					}
			 }
			}

		};

		// play audio on load
		// $scope.$watchCollection('audio', function(val){
		// 	if(typeof $scope.audio === 'object'){
		// 		$scope.audio.play();
		// 	}
		// });

		$scope.updateDueDate = function(){

			var project = $scope.project;

			var newDate = moment(new Date(project.estimatedCompletionDate)).format('MM/DD/YYYY h:mm a');
			var newNewDate = moment(new Date()).format('MM/DD/YYYY h:mm a');

			project.estimatedCompletionDate = newDate;

			var discussion = 'Due date and time extended to ' + newDate + ' EST by ' + Authentication.user.displayName;
			var item = {
				date: newNewDate,
				userid: '',
				username: 'System',
				item: discussion,
				deleted: false
			};

			project.discussion.push(item);

			// send update email
			$scope.gatherToAddresses('saveDiscussion');
		    $scope.email.subject = project.title + ' - Audition Due Date and Time Extended';
		    $scope.email.message = 'Project: ' + project.title + '<br>';
		    $scope.email.message += 'Added by: System<br>';
				$scope.email.message += 'Discussion Item: ' + discussion + '<br>';
		    $scope.email.message += '<br>' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 || $location.port() !== 443 ? ':' + $location.port() : '') + '/#!/projects/' + project._id + '<br>';

		    $http.post('/projects/sendemail', {
				email: $scope.email
			});

			// walk through and update phases if project closed to reset phase settings
			if(String(project.status) === 'Closed - Pending Client Decision'){
				var limit = project.phases.length,
						i = 0;

				for(i = 0; i < limit; ++i){
					if(project.phases[i].name === 'Posting and Publishing'){
						project.phases[i].status = 'in progress';
						project.phases[i].endDate = '';
					}
				}
			}

			// reset project status
			project.status = 'In Progress';

			// clear preclose summary bool
			project.preClose = false;

			// update project store
			//$scope.update();
			$scope.updateNoRefresh();

			$scope.showDateEdit = false;
		};

		// save discussion item
		$scope.saveDiscussion = function(){

			var project = $scope.project,
					authUser = Authentication.user;

			if(typeof $scope.discussion !== 'undefined' && this.discussion !== ''){
				var now = new Date();
				var item = {
							date: now.toJSON(),
							userid: authUser._id,
							username: authUser.displayName,
							item: $scope.discussion || this.discussion,
							deleted: false
						};

				project.discussion.push(item);

				// send update email
				$scope.gatherToAddresses('saveDiscussion');
		    $scope.email.subject = project.title + ' discussion added';
		    $scope.email.message = 'Project: ' + project.title + '<br>';
		    $scope.email.message += 'Added by: ' + authUser.displayName + '<br>';
				$scope.email.message += 'Discussion Item: ' + this.discussion + '<br>';
		    $scope.email.message += '<br>' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 || $location.port() !== 443 ? ':' + $location.port() : '') + '/#!/projects/' + project._id + '<br>';

				$scope.discussion = '';
				this.discussion = '';

		    $http.post('/projects/sendemail', {
				email: $scope.email
				});
				// update project store
				//$scope.update();
				$scope.updateNoRefresh();
			}
		};

		$scope.deleteDiscussion = function(key){

			var project = $scope.project;

			// reverse selction id
			var selVal = (project.discussion.length - 1) - key;

			// apply to reverse index
			project.discussion[selVal].deleted = true;

			// update project store
			$scope.updateNoRefresh();
		};

		// update project when audition talent assignment is adjusted
		$scope.updateTalentAssignedStatus = function(selTalent){

			var talents = $scope.project.talent,
				limit = talents.length,
				i = 0;

			// update talents with posted status for uploaded talent
			for(i = 0;i < limit; ++i){
				if(talents[i].talentId === selTalent && talents[i].status !== 'Posted'){
					talents[i].status = 'Posted';
				}
				if(limit === (i+1)){
					// update project store
					$scope.updateNoRefresh();
				}
			}

		};

		$scope.delScript = function(idx){

			var project = $scope.project;

			// verify user wants to delete file
			if (confirm('Are you sure?')) {

				var file = '/res/scripts/' + project._id + '/' + project.scripts[idx].file.name;

				$http.put('/projects/deletefile', {
					fileLocation: file,
					projectId: project._id
				  });

				project.scripts.splice(idx, 1);

				// update project store
				$scope.updateNoRefresh();

			}
		};

		// remove temporary script file
		$scope.delTempScript = function(idx){

			var project = $scope.newProject,
					file = project.scripts[idx].file.name;

			$http.post('/projects/deleteTempScript', {
        fileLocation: file
	    }).success(function(data, status, headers, config) {
				project.scripts.splice(idx, 1);
			});

		};

		// delete copy script file
		$scope.delCopyScript = function(idx){
		    $scope.newProject.copiedScripts.splice(idx, 1);
		};

	var performScriptUpload = function(file, i, $files){

		var project = $scope.project;

		$scope.upload = $upload.upload({
			url: 'projects/uploads/script', //upload.php script, node.js route, or servlet url
			//method: 'POST' or 'PUT',
			data: {projectId: project._id},
			file: file, // or list of files ($files) for html5 only
		  }).progress(function(evt) {
			$scope.uploadStatus = (i + 1) + ' of ' + $files.length + ' files uploaded';
			$scope.uploadfile = evt.config.file.name;
			$scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
			}).success(function(data, status, headers, config) {
			// file is uploaded successfully
			//$scope.project = angular.extend($scope.project, data);

				project.scripts.push(data);

				// save project on finish
				if((i+1) === $files.length){

					// generate new system note
					var now = Date.now();
					var note = 'New scripts uploaded, talent notifed';
					var item = {
						date: now,
						userid: '',
						username: 'System',
						item: note,
						deleted: false
					};

					// add to project discussion
					$scope.project.discussion.push(item);

					// send note email
					$scope.gatherToAddresses('saveDiscussion');
					$scope.email.subject = project.title + ' - ' + note;
					$scope.email.message = 'Project: ' + project.title + '<br>';
					$scope.email.message += 'Added by: System<br>';
						$scope.email.message += 'Discussion Item: ' + note + '<br>';
					$scope.email.message += '<br>' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 || $location.port() !== 443 ? ':' + $location.port() : '') + '/#!/projects/' + project._id + '<br>';

					$http.post('/projects/sendemail', {
						email: $scope.email
					});

					// update project store
					$scope.updateNoRefresh();

					// send out update emails to assigned project talentIds
					$http.post('/projects/sendTalentScriptUpdateEmail', {
						projectId: project._id,
						talents: project.talent,
						chgMade: 'Script'
					});

				}

			});
  	};

  	// upload script file
	$scope.uploadScript = function($files) {
	    angular.forEach($files, function(file, key) {
	      performScriptUpload(file, key, $files);
		});
  	};

	var performUploadTempScript = function(file, i, $files){
		  $scope.upload = $upload.upload({
        url: 'projects/uploads/script/temp', //upload.php script, node.js route, or servlet url
        data: {
					project: $scope.project
				},
        file: file, // or list of files ($files) for html5 only
      }).progress(function(evt) {
        $scope.uploadStatus = (i + 1) + ' of ' + $files.length + ' files uploaded';
      	$scope.uploadfile = evt.config.file.name;
        $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
      }).success(function(data, status, headers, config) {
        // file is uploaded successfully
        $scope.newProject.scripts.push(data[0]);
      });
  	};

  	$scope.uploadTempScript = function($files) {
    	angular.forEach($files, function(file, key) {
    		performUploadTempScript(file, key, $files);
  		});
  	};

  	// set published status
  	$scope.updatePublished = function(key){
  		// update project store
			$scope.updateNoRefresh();
  	};

	// save modified audition
	var saveAudition = function(audition){

		$http.post('/projects/saveAudition', {
			audition: audition
		// file found
		}).success(function(data, status, headers, config) {
			// reload auditions
			loadAuditions();
		// file not saved
		}).error(function(data, status, headers, config) {
			console.log('Problem saving audition.');
		});

	};

	// update project when audition talent assignment is adjusted
	$scope.updateTalentAssignedStatusSingle = function(audition){

		var selTalent = audition.talent,
			talents = $scope.project.talent,
			limit = talents.length,
			i = 0;

		// update talents with posted status for uploaded talent
		for(i = 0;i < limit; ++i){
			if(talents[i].talentId === selTalent && talents[i].status !== 'Posted'){
				talents[i].status = 'Posted';
			}
			if(limit === (i+1)){
				// update project store
				saveAudition(audition);
				$scope.updateNoRefresh();
			}
		}

	};

  	// set published status
  	$scope.renameSingle = function(audition){
		saveAudition(audition);
  	};

  	// set published status
  	$scope.updatePublishedSingle = function(audition){
		saveAudition(audition);
  	};

	$scope.delAuditionSingle = function(audition){

		// verify user wants to delete file
		if (confirm('Are you sure?')) {

			// delete selected file
			$http.post('/projects/deleteAudition', {
				audition: audition
			}).success(function(data, status, headers, config) {

				loadAuditions();

			}).error(function(data, status, headers, config) {
				console.log('Problem deleting audition.');
			});


		}
	};

	// update audition rating
	$scope.updateRatingSingle = function(audition, redirect){

		var auditions = $scope.project.auditions,
			j = 0,
			i = 0,
			rateLimit = 0;

		// determine if update should result in user redirect
		redirect = typeof redirect === 'undefined' ? true : redirect;

		// console.log($scope.rate[key]);
		var key, ratingCnt = 0, avgRating = 0;

		// walk through existing ratings
		if(typeof audition.rating !== 'undefined'){
			rateLimit = audition.rating.length;
			for(i = 0; i < rateLimit; ++i){
				// toggle existing rating if found
				if(audition.rating[i].userId === Authentication.user._id){
					audition.rating.splice(i,1);
					audition.curRating = $scope.selCheckVal;
				} else {
					// gather average rating
					avgRating += audition.rating[i].value;
				}
			}
			ratingCnt += audition.rating.length;
		}

		avgRating += $scope.selCheckVal;

		// average rating values
		avgRating /= ratingCnt + 1;

		// generate new rating object
		var rating = {
			userId: Authentication.user._id,
			value: $scope.selCheckVal
		};

		// push new rating
		audition.rating.push(rating);

		// merge average rating
		audition.avgRating = avgRating;

		// update audition store
		saveAudition(audition);
	};


  	var performUploadReferenceFile = function(file, i, $files){

			var project = $scope.project;

	  	$scope.upload = $upload.upload({
	        url: 'projects/uploads/referenceFile', //upload.php script, node.js route, or servlet url
					data: {projectId: project._id},
	        file: file, // or list of files ($files) for html5 only
	    }).progress(function(evt) {
	        $scope.uploadStatus = (i + 1) + ' of ' + $files.length + ' files uploaded';
	      	$scope.uploadfile = evt.config.file.name;
	        $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
	    }).success(function(data, status, headers, config) {

				project.referenceFiles.push(data);

				// save project on finish
				if((i+1) === $files.length){

					// send out update emails to assigned project talentIds
					$http.post('/projects/sendTalentScriptUpdateEmail', {
						projectId: project._id,
						talents: project.talent,
						chgMade: 'Reference'
					});

					// generate new system note
					var now = Date.now();
					var note = 'New reference files uploaded, talent notifed';
					var item = {
						date: now,
						userid: '',
						username: 'System',
						item: note,
						deleted: false
					};
      		// add to project discussion
      		project.discussion.push(item);

					// send note email
					$scope.gatherToAddresses('saveDiscussion');
			    $scope.email.subject = project.title + ' - ' + note;
			    $scope.email.message = 'Project: ' + project.title + '<br>';
			    $scope.email.message += 'Added by: System<br>';
					$scope.email.message += 'Discussion Item: ' + note + '<br>';
			    $scope.email.message += '<br>' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 || $location.port() !== 443 ? ':' + $location.port() : '') + '/#!/projects/' + project._id + '<br>';

			    $http.post('/projects/sendemail', {
						email: $scope.email
					});

					// update project store
					$scope.updateNoRefresh();
				}

			});
  	};

  	// upload reference files to server
  	$scope.uploadReferenceFile = function($files) {
    //$files: an array of files selected, each file has name, size, and type.

    	angular.forEach($files, function(file, key) {
	    	performUploadReferenceFile(file, key, $files);
    	});
  	};

  	var performUploadTempReferenceFile = function(file, i, $files){
  		$scope.upload = $upload.upload({
	        url: 'projects/uploads/referenceFile/temp', //upload.php script, node.js route, or servlet url
	        data: {project: $scope.project},
	        file: file, // or list of files ($files) for html5 only
	    }).progress(function(evt) {
	        $scope.uploadStatus = (i + 1) + ' of ' + $files.length + ' files uploaded';
	      	$scope.uploadfile = evt.config.file.name;
	        $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
	    }).success(function(data, status, headers, config) {
	        // file is uploaded successfully
	        //console.log(data);
	        $scope.newProject.referenceFiles.push(data[0]);
	    });
  	};

  	$scope.uploadTempReferenceFile = function($files) {
	    //$files: an array of files selected, each file has name, size, and type.
	    angular.forEach($files, function(file, key) {

		    performUploadTempReferenceFile(file, key, $files);

    	});
  	};

	  	// delete temp reference file
  	$scope.delTempReferenceFile = function(idx){

			var file = '/res/referenceFiles/temp/' + $scope.newProject.referenceFiles[idx].file.name,
				project = $scope.project;

			$http.post('/projects/deletefile', {
		        fileLocation: file,
				projectId: project._id
			}).success(function(data, status, headers, config) {
			});

	    $scope.newProject.referenceFiles.splice(idx, 1);

		};

		// delete copy reference file
		$scope.delCopyReferenceFile = function(idx){
		    $scope.newProject.copiedReferenceFiles.splice(idx, 1);
		};

		// delete reference file
  	$scope.delReferenceFile = function(idx){

			var project = $scope.project;

			// verify user wants to delete file
			if (confirm('Are you sure?')) {

				$scope.processing = true;

				var file = '/res/referenceFiles/' + project._id + '/' + project.referenceFiles[idx].file.name;

				$http.post('/projects/deletefile', {
			        fileLocation: file,
					projectId: project._id
				}).success(function(data, status, headers, config) {

					// delete selected file
					project.referenceFiles.splice(idx, 1);

					// update project store
					$scope.updateNoRefresh();

				});

			}
		};

		$scope.delAudition = function(idx){

			var project = $scope.project;

			// verify user wants to delete file
			if (confirm('Are you sure?')) {

				$scope.processing = true;

				if(typeof project.auditions[idx].file !== 'undefined'){
					var file = '/res/auditions/' + project._id + '/' + project.auditions[idx].file.name;

				    // delete selected file
					$http.post('/projects/deletefile', {
						fileLocation: file,
						projectId: project._id
					}).success(function(data, status, headers, config) {

						project.auditions.splice(idx, 1);

						// update project store
						//$scope.update();
						$scope.updateNoRefresh();

					});

				} else {

					project.auditions.splice(idx, 1);

					// update project store
					$scope.updateNoRefresh();

				}

			}
		};

		$scope.newAudUpload = '';
		$scope.audFiles = [];
		$scope.uploadedAuds = [];
		$scope.uploadAudsCnt = 0;
		$scope.audUpComp = 0;
		if(typeof $scope.watchersObj.newAudUpload !== 'object'){
			$scope.$watchCollection('newAudUpload', function(){

				// get curent index
				var i = $scope.uploadedAuds.length;

				// file is uploaded successfully
				$scope.uploadedAuds[i] = $scope.newAudUpload;

				// update talents with posted status for uploaded talent
				if(typeof $scope.project.talent !== 'undefined' && $scope.project.talent.length > 0){
					angular.forEach($scope.project.talent, function(talent, key) {

						if(talent.talentId === $scope.newAudUpload.talent){
							$scope.project.talent[key].status = 'Posted';
						}

						// save on finish loop
						if($scope.project.talent.length === (key+1)){

							// save project on finish
							if($scope.uploadAudsCnt === $scope.uploadedAuds.length){

								//$scope.project.auditions = $scope.project.auditions.concat($scope.uploadedAuds);

								// save with pause, ensure loop finished
								//setTimeout(function(){

								// save project on last file upload
								$scope.verifyFilesList = [];

								// update project store
								$scope.updateNoRefresh();
								loadAuditions();

								// trigger new file check walk
								$scope.fileCheck = false;

								//}, 1500);

							}
						}

					});
				} else {
					// save project on finish
					if($scope.uploadAudsCnt === $scope.uploadedAuds.length){

						//$scope.project.auditions = $scope.project.auditions.concat($scope.uploadedAuds);

						// save with pause, ensure loop finished
						//setTimeout(function(){

						// save project on last file upload
						$scope.verifyFilesList = [];

						// update project store
						$scope.updateNoRefresh();
						loadAuditions();

						// trigger new file check walk
						$scope.fileCheck = false;

						//}, 1500);

					}
				}

			});
		}

	var performUploadAudition = function(file, i, $files){

		$scope.upload = $upload.upload({
			url: 'projects/uploads/audition', //upload.php script, node.js route, or servlet url
			data: {projectId: $scope.project._id},
			file: file // or list of files ($files) for html5 only
		}).progress(function(evt) {
			$scope.uploadStatus = (i + 1) + ' of ' + $files.length + ' files uploaded';
			$scope.uploadfile = evt.config.file.name;
			//$scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
		}).success(function(data, status, headers, config) {
			$scope.newAudUpload = data;
			$scope.audUpComp += 1;
			$scope.uploadprogress = parseInt(100.0 / ($files.length - ($scope.audUpComp - 1)));
		});

	};
	$scope.uploadAudition = function($files) {

		$scope.uploadAudsCnt = 0;

		if(typeof $files !== 'undefined' && $files.length > 0){

			// reset upload counter
			$scope.audUpComp = 0;
			$scope.uploadAudsCnt = $files.length;

			$scope.uploadedAuds = [];
			$scope.audFiles = $files;

			// prevent any other action
			$scope.processing = true;

			//$files: an array of files selected, each file has name, size, and type.
			angular.forEach($files, function(file, key) {

				performUploadAudition(file, key, $files);

			});

		}

	};

	var performUploadTempAuditionFile = function(file, i, $files){
  		$scope.upload = $upload.upload({
	        url: 'projects/uploads/audition/temp', //upload.php script, node.js route, or servlet url
	        data: {project: $scope.project},
	        file: file, // or list of files ($files) for html5 only
	    }).progress(function(evt) {
	        $scope.uploadStatus = (i + 1) + ' of ' + $files.length + ' files uploaded';
	      	$scope.uploadfile = evt.config.file.name;
	        $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
	    }).success(function(data, status, headers, config) {
	        // file is uploaded successfully
	        $scope.auditions.push(data);
	    });
  	};

  	$scope.uploadTempAudition = function($files) {
	    //$files: an array of files selected, each file has name, size, and type.
	    angular.forEach($files, function(file, key) {

    		performUploadTempAuditionFile(file, key, $files);

  		});
  	};

  	// delete uploaded temp audition
  	$scope.delTempAudition = function(key){

			var auditions = $scope.auditions,
				project = $scope.project;

  		var file = '/res/auditions/temp/' + auditions[key].file.name;

			$http.post('/projects/deletefile', {
	        fileLocation: file,
			projectId: project._id
	    });

	    auditions.splice(key, 1);

  	};

	// perform talent audition uploads
	$scope.submitTalentAuditions = function(){
		//console.log($stateParams.talentId);

		if(confirm('Are you sure?') === true){

			$http.post('/projects/uploads/talentAuditions', {
				auditions: $scope.auditions,
				project: $scope.project,
				talent: $stateParams.talentId
			}).success(function(data, status, headers, config) {
				// file is uploaded successfully
				//console.log(data);
				$scope.auditions = [];

				alert('Auditions have been submitted. Thank you!');
			});

		}

	};

	// talent uploads modal
  	$scope.talentSubmissionsModal = function(talent){
  		var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'modules/projects/views/talent-submissions-modal.client.view.html',
      controller: 'ProjectsModalController',
      resolve: {
      	data: function () {
	        return {
	        	talent: talent,
	        	projectId: $scope.project._id
	        };
		}
      }
    });

    modalInstance.result.then(function (selectedItem) {
      //$scope.selected = selectedItem;
    }, function () {
      //$log.info('Modal dismissed at: ' + new Date());

    });
	};

	}
]);
