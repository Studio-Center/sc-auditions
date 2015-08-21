'use strict';

// Projects controller
angular.module('projects').controller('ProjectsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Projects', '$upload', 'ngAudio', 'ngAudioGlobals', '$http', '$modal', '$rootScope', 'Socket', '$cookies', '$window', 
	function($scope, $stateParams, $location, Authentication, Projects, $upload, ngAudio, ngAudioGlobals, $http, $modal, $rootScope, Socket, $cookies, $window ) {
		$scope.authentication = Authentication;

		$scope.project = {};
		$scope.discussion = '';
		// rating
		$scope.hide = 0;
		$scope.max = 5;
		$scope.isReadonly = false;
		$scope.ratings = [];
		$scope.ratingsAvg = [];
		// static project options
		$scope.newProjTalentLink = 'createProject.talent';
		$scope.newProjLink = 'createProject.project';
		ngAudioGlobals.unlock = false;
		$scope.clientNotes = '';
		$scope.auditions = [];
		$scope.projProgress = [];
		$scope.selCheckVal = 0;
		$scope.client = [];
		$scope.talent = [];
		$scope.showRename = 0;
		$scope.statusOpts = ['In Progress', 'On Hold', 'Booked', 'Canceled', 'ReAuditioned', 'Dead', 'Closed - Pending Client Decision', 'Complete'];
		$scope.priorityOpts = ['None', 'Very low', 'Low', 'Medium', 'High', 'Very high'];
		$scope.phaseStatusOpts = ['in progress','open','complete','suspended'];
		$scope.soundersOpts = ['Sounders', 'No Sounders - Approved By William'];
		//$scope.talentStatus = ['Cast', 'Emailed', 'Scheduled', 'Message left', 'Out', 'Received needs to be posted', 'Posted', 'Not Posted (Bad Read)', 'Missed', 'Canceled'];
		$scope.loadAudio = 0;
		$scope.audio = '';
		$scope.lastAudioID = 0;
		$scope.audioStatus = 0;
		$scope.newLead = {};
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
		$scope.talentStatus = [];
		$scope.talentBooked = [];
		$scope.talentNote = [];
		$scope.verifyFilesList = {};
		// projects client portal
		$scope.selectedAuditions = [];
		$scope.hideList = [];
		// filter vars
		$scope.predicate = '';
		$scope.reverse = '';
		$scope.searchText = {};

		// on close check
		$scope.$on('$locationChangeStart', function( event ) {

			// nothing for the moment

		});

		$scope.updatePred = function(pred){
			$scope.predicate = pred;
		};

		// used for paginator
		$scope.Math = window.Math;
		$scope.currentPage = 0;
		$scope.filtered = [];
		$scope.limit = 0;
		$scope.range = function(min, max, step){
		    step = step || 1;
		    var input = [];
		    for (var i = min; i <= max; i += step) input.push(i);
		    return input;
		};
	    $scope.setPage = function () {
	        $scope.currentPage = this.n;
	    };
	    $scope.changePage = function(page){
	    	var curSel = page * $scope.limit;

	    	if(curSel < $scope.filtered.length && curSel >= 0){
	    		$scope.currentPage = page;
	    	}
	    };
	    $scope.$watch('filtered', function(val){
	    	$scope.currentPage = 0;
	    }, true);

		$scope.hoveringOver = function(value,key,object) {
	        $scope.overStar = value;
	        $scope.percent = 100 * (value / $scope.max);
	        $scope.selCheckVal = value;
      	};

      	// book clients modal
      	$scope.bookSelectedAuditions = function(){
      		var modalInstance = $modal.open({
		      animation: true,
		      templateUrl: 'modules/projects/views/book-auditon-modal.client.view.html',
		      controller: 'ProjectsModalController',
		      resolve: {
		      	data: function () {
			        return {
			        	project: $scope.project._id,
			        	auditions: $scope.selectedAuditions
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
			var idx = $scope.selectedAuditions.indexOf(key);
			if (idx > -1){
			    $scope.selectedAuditions.splice(idx, 1);
			}else{
			    $scope.selectedAuditions.push(key);
			}
      	};
      	$scope.selCheck = function(filename){
			for(var i = 0; i < $scope.selectedAuditions.length; ++i){
      			if($scope.selectedAuditions[i] === filename){
      				return true;
      			}
      		}
      	};
      	$scope.hideSelected = true;
      	$scope.hideSelectedAuditions = function(){
      		$scope.hideSelected = !$scope.hideSelected;
      	};
      	$scope.hideAudition = function(filename){
      		// $scope.hideList.push(filename);
      		// get audition id
      		for(var i = 0; i < $scope.project.auditions.length; ++i){
      			if($scope.project.auditions[i].file.path === filename){
      				$scope.project.auditions[i].hidden = true;
      				$scope.updateNoRefresh();
      			}
      		}
      	};
      	$scope.showAudition = function(filename){
			// var idx = $scope.hideList.indexOf(filename);
			// if (idx > -1){
			//     $scope.hideList.splice(idx, 1);
			// }
			// get audition id
			for(var i = 0; i < $scope.project.auditions.length; ++i){
      			if($scope.project.auditions[i].file.path === filename){
      				$scope.project.auditions[i].hidden = false;
      				$scope.updateNoRefresh();
      			}
      		}
      	};
      	$scope.isHidden = function(filename){

      		for(var i = 0; i < $scope.project.auditions.length; ++i){
      			if($scope.project.auditions[i].file.path === filename){
      				return true;
      			}
      		}

      		return false;
      	};
      	$scope.isDisplayed = function(filename){
      		for(var i = 0; i < $scope.project.auditions.length; ++i){
      			if($scope.project.auditions[i].file.path === filename){
      				if($scope.project.auditions[i].hidden === true && $scope.hideSelected === true){
      					return false;
      				} else {
      					return true;
      				}
      			}
      		}

      		return false;
      	};
      	$scope.hiddenAudsCnt = function(){
      		var hidCnt = 0;

      		for(var i = 0; i < $scope.project.auditions.length; ++i){
  				if($scope.project.auditions[i].hidden === true){
  					hidCnt += 1;
  				}
      		}

      		return hidCnt;
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
      	// download all auditions from project
      	$scope.downloadBookedAuditions = function(){

      		var bookedAuds = [];
      		for(var i = 0; i < $scope.project.auditions.length; ++i){
      			if($scope.project.auditions[i].booked === true){
      				bookedAuds.push($scope.project.auditions[i].file.name);
      			}
      		}

			$http.post('/projects/downloadBookedAuditions', {
				projectId: $scope.project._id,
				projectTitle: $scope.project.title,
		        bookedAuds: bookedAuds
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
      	// download all auditions from project
      	$scope.downloadSelectedAuditions = function(){

      		var selectedAuds = [];
      		for(var i = 0; i < $scope.project.auditions.length; ++i){
      			for(var j = 0; j < $scope.selectedAuditions.length; ++j){
	      			if($scope.project.auditions[i].file.path === $scope.selectedAuditions[j]){
	      				selectedAuds.push($scope.project.auditions[i].file.name);
	      			}
      			}
      		}

			$http.post('/projects/downloadSelectedAuditions', {
		        projectId: $scope.project._id,
		        projectTitle: $scope.project.title,
		        selectedAuds: selectedAuds
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
      	// show booked option for selected auditions
      	$scope.bookSelectedShow = function(){
      		var hiddenMatchCnt = 0, idx;

      		for(var i = 0; i < $scope.hideList.length; ++i){
  				idx = $scope.selectedAuditions.indexOf($scope.hideList[i]);
				if (idx > -1){
					++hiddenMatchCnt;
				}
      		}

      		if($scope.selectedAuditions.length > hiddenMatchCnt){
      			return true;
      		}

      	};
      	// check for booked auditions
      	$scope.bookedShow = function(){

      		for(var i = 0; i < $scope.project.auditions.length; ++i){
      			if($scope.project.auditions[i].booked === true){
      				return true;
      			}
      		}

      		return false;

      	};

      	// compare dates check for within hour
      	$scope.compareDates = function(projDate){
      		var now = new Date();
      		projDate = new Date(projDate);

      		var hours = Math.abs(projDate - now) / 36e5;

      		if(hours < 1){
      			return true;
      		}
      	};
      	$scope.checkPassed = function(projDate){
      		var now = new Date();
      		projDate = new Date(projDate);

      		if(now > projDate){
      			return true;
      		}
      	};

      	// show part field if talent value is not already checked
      	$scope.showPartFld = function(id){
      		if(typeof $scope.project.talent !== 'undefined'){
	      		for(var i = 0; i < $scope.project.talent.length; ++i){
	      			if($scope.project.talent[i].talentId === String(id)){
	      				if($scope.project.talent[i].requested === true || $scope.project.talent[i].regular === true){
	      					return false;
	      				}
	      			}
	      		}
      		}
   			return true;
     	};
     	$scope.showPartString = function(id){
      		for(var i = 0; i < $scope.project.talent.length; ++i){
      			if($scope.project.talent[i].talentId === String(id)){
      				if(typeof $scope.project.talent[i].part !== 'undefined'){
	      				if($scope.project.talent[i].part !== ''){
	      					return $scope.project.talent[i].part;
	      				}
      				}
      			}
      		}
      	};
     	$scope.showCreatePartFld = function(id){
      		for(var i = 0; i < $scope.newProject.talent.length; ++i){
      			if($scope.newProject.talent[i].talentId === String(id)){
      				if($scope.newProject.talent[i].requested === true || $scope.newProject.talent[i].regular === true){
      					return false;
      				}
      			}
      		}
   			return true;
     	};
     	$scope.defaults = function(){
     		var allowRoles = ['producer/auditions director'];

			for(var i = 0; i < Authentication.user.roles.length; ++i){
				for(var j = 0; j < allowRoles.length; ++j){
					if(Authentication.user.roles[i] === allowRoles[j]) {
						$scope.searchText.status = 'In Progress';
					}
				}
			}
     	};
		// verify users
		$scope.isOwner = function(){
			if(String($scope.project.owner) === String(Authentication.user._id) || String($scope.project.user._id) === String(Authentication.user._id)){
				return true;
			} else {
				return false;
			}
		};
		$scope.permitAdmin = function(){
			var allowRoles = ['admin'];

			for(var i = 0; i < Authentication.user.roles.length; ++i){
				for(var j = 0; j < allowRoles.length; ++j){
					if(Authentication.user.roles[i] === allowRoles[j]) {
						return true;
					}
				}
			}
		};
		$scope.permitAdminProductionCoordinator = function(){
			var allowRoles = ['admin','production coordinator'];

			for(var i = 0; i < Authentication.user.roles.length; ++i){
				for(var j = 0; j < allowRoles.length; ++j){
					if(Authentication.user.roles[i] === allowRoles[j]) {
						return true;
					}
				}
			}
		};
		$scope.permitAdminProductionCoordinatorDirector = function(){
			var allowRoles = ['admin', 'producer/auditions director', 'production coordinator'];

			for(var i = 0; i < Authentication.user.roles.length; ++i){
				for(var j = 0; j < allowRoles.length; ++j){
					if(Authentication.user.roles[i] === allowRoles[j]) {
						return true;
					}
				}
			}
		};
		$scope.permitAdminDirector = function(){
			var allowRoles = ['admin', 'producer/auditions director'];

			for(var i = 0; i < Authentication.user.roles.length; ++i){
				for(var j = 0; j < allowRoles.length; ++j){
					if(Authentication.user.roles[i] === allowRoles[j]) {
						return true;
					}
				}
			}
		};
		$scope.permitProducers = function(){
			var allowRoles = ['producer/auditions director'];

			for(var i = 0; i < Authentication.user.roles.length; ++i){
				for(var j = 0; j < allowRoles.length; ++j){
					if(Authentication.user.roles[i] === allowRoles[j]) {
						return true;
					}
				}
			}
		};
		$scope.permitAdminTalentDirectorProdCoord = function(){
			var allowRoles = ['admin', 'talent director', 'production coordinator'];

			for(var i = 0; i < Authentication.user.roles.length; ++i){
				for(var j = 0; j < allowRoles.length; ++j){
					if(Authentication.user.roles[i] === allowRoles[j]) {
						return true;
					}
				}
			}
		};
		$scope.permitEveryOneButClients = function(){
			var allowRoles = ['admin', 'producer/auditions director', 'production coordinator', 'talent director'];

			for(var i = 0; i < Authentication.user.roles.length; ++i){
				for(var j = 0; j < allowRoles.length; ++j){
					if(Authentication.user.roles[i] === allowRoles[j]) {
						return true;
					}
				}
			}
		};
		$scope.permitClient = function(){
			var allowRoles = ['client'];

			for(var i = 0; i < Authentication.user.roles.length; ++i){
				for(var j = 0; j < allowRoles.length; ++j){
					if(Authentication.user.roles[i] === allowRoles[j]) {
						return true;
					}
				}
			}
		};
		$scope.permitClientClient = function(){
			var allowRoles = ['client-client'];

			for(var i = 0; i < Authentication.user.roles.length; ++i){
				for(var j = 0; j < allowRoles.length; ++j){
					if(Authentication.user.roles[i] === allowRoles[j]) {
						return true;
					}
				}
			}
		};

		// verify create access
		$scope.userCheck = function(){
			if(Authentication.user.roles[0] !== 'admin' && Authentication.user.roles[0] !== 'producer/auditions director' && Authentication.user.roles[0] !== 'production coordinator'){
				$location.path('/projects');
			}
		};

		// send talent project welcome email
		$scope.sendTalentEmail = function(talentId){

			// find selected talent
			angular.forEach($scope.project.talent, function(talent, key) {

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

			// update email count
    		if(typeof $scope.project.counts === 'undefined'){
    			$scope.project.counts = {};
    		}
    		if(typeof $scope.project.counts[type] === 'undefined'){
    			$scope.project.counts[type] = 0;
    		}
    		$scope.project.counts[type] += 1;

			$http.post('/projects/sendclientemail', {
		        type: type,
		        project: $scope.project,
		        clients: $scope.selectedMainClients,
		        count: $scope.project.counts[type]
		    }).
			success(function(data, status, headers, config) {
        		alert('Clients Emailed ' + type + ' Email ');
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
						note = 'Client Notified of Project Start by ' + Authentication.user.displayName;
					break;
					case 'carryover':
						note = 'Client sent Carryover by ' + Authentication.user.displayName;
					break;
					case 'closing':
						note = 'Client Notified of Project Completion by ' + Authentication.user.displayName;
					break;
        		}

        		// add note to note object
        		item.item = note;

        		// add to project discussion
        		$scope.project.discussion.push(item);

        		// update project store
				//$scope.update();
				$scope.updateNoRefresh();
        	}).
			error(function(data, status, headers, config) {
				alert('An error occured while sending client emails. Please contact your administrator.');
			    // called asynchronously if an error occurs
			    // or server returns response with an error status.
			});
		};

		// new project form 
		$scope.lead = function(){

			// Trigger validation flag.
		    $scope.submitted = true;

			$http.post('/projects/lead', {
			        firstName: $scope.newLead.firstName,
			        lastName: $scope.newLead.lastName,
			        company: $scope.newLead.company,
			        phone: $scope.newLead.phone,
			        email: $scope.newLead.email,
			        describe: $scope.newLead.describe,
			        scripts: $scope.scripts
			    }).
				success(function(data, status, headers, config) {
            	$location.path('/projects/new-audition-form/thanks');
        	});
		};
		$scope.leadFormPop = function(){
			if(typeof Authentication.user === 'object'){
				$scope.newLead.firstName = Authentication.user.firstName;
		        $scope.newLead.lastName = Authentication.user.lastName;
		        $scope.newLead.company = Authentication.user.company;
		        $scope.newLead.phone = Authentication.user.phone;
		        $scope.newLead.email = Authentication.user.email;
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
			};
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
				for(var l = 0; l < $scope.project.talent.length; ++l){
					if($scope.project.talent[l].email !== '' && re.test($scope.project.talent[l].email)){
						emailCnt += 1;
						toEmails[emailCnt] = $scope.project.talent[l].email;
					}
				}
			}

			// attach team to email chain
			// grant all team members access to all email communications
			// for(var k = 0; k < $scope.project.team.length; ++k){
			// 	if($scope.project.team[k].email !== '' && re.test($scope.project.team[k].email)){
			// 		emailCnt += 1;
			// 		toEmails[emailCnt] = $scope.project.team[k].email;
			// 	}
			// }
			// check for accounts associated 
			$scope.email.to = toEmails;
		};

		// update group checkbox selectors
		$scope.checkClientClientUsers = function(userId){
			if(typeof $scope.project === 'object'){
				if(typeof $scope.project.clientClient === 'object'){
					for(var i = 0; i < $scope.project.clientClient.length; ++i){
						if($scope.project.clientClient[i].userId === userId){
							return true;
						}
					}
				}
			}
		};
		$scope.checkClientUsers = function(userId){
			if(typeof $scope.project === 'object'){
				if(typeof $scope.project.client === 'object'){
					for(var i = 0; i < $scope.project.client.length; ++i){
						if($scope.project.client[i].userId === userId){
							return true;
						}
					}
				}
			}
		};
		$scope.checkClientUsersCreate = function(userId){
			if(typeof $scope.newProject.client === 'object'){
				for(var i = 0; i < $scope.newProject.client.length; ++i){
					if($scope.newProject.client[i].userId === userId){
						return true;
					}
				}
			}
		};
		$scope.checkTeam = function(userId){
			if(typeof $scope.project === 'object'){
				if(typeof $scope.project.team === 'object'){
					for(var i = 0; i < $scope.project.team.length; ++i){
						if($scope.project.team[i].userId === userId){
							return true;
						}
					}
				}
			}
		};
		$scope.checkTalent = function(talentId){
			if(typeof $scope.project === 'object'){
				if(typeof $scope.project.talent === 'object'){
					for(var i = 0; i < $scope.project.talent.length; ++i){
						if($scope.project.talent[i].talentId === talentId && $scope.project.talent[i].regular === true){
							return true;
						}
					}
				}
			}
		};
		$scope.checkRequestedTalent = function(talentId){
			if(typeof $scope.project === 'object'){
				if(typeof $scope.project.talent === 'object'){
					for(var i = 0; i < $scope.project.talent.length; ++i){
						if($scope.project.talent[i].talentId === talentId && $scope.project.talent[i].requested === true){
							return true;
						}
					}
				}
			}
		};
		$scope.checkCreateTalent = function(talentId){
			for(var i = 0; i < $scope.newProject.talent.length; ++i){
				if($scope.newProject.talent[i].talentId === talentId && $scope.newProject.talent[i].regular === true){
					return true;
				}
			}
		};
		$scope.checkRequestedCreateTalent = function(talentId){
			for(var i = 0; i < $scope.newProject.talent.length; ++i){
				if($scope.newProject.talent[i].talentId === talentId && $scope.newProject.talent[i].requested === true){
					return true;
				}
			}
		};

		$scope.updateTalent = function(talentId, talentName, email){
			// gen talent object
			var talent = {'talentId': talentId, 'name': talentName, 'email': email, 'booked': false, 'status': 'Cast', part: $scope.parts[talentId] || '', regular: true, requested: false};

			// check for existing item
			var found = 0, selTalent;
			for(var i = 0; i < $scope.project.talent.length; ++i){
				if($scope.project.talent[i].talentId === talentId){
					// reset requested to false
					if($scope.project.talent[i].requested === true){
						$scope.project.talent[i].requested =  false;
					}
					// update regular status
					if($scope.project.talent[i].regular === true){
						$scope.project.talent[i].regular = false;
					} else {
						$scope.project.talent[i].regular = true;
					}
					// remove talent if no longer selected
					if($scope.project.talent[i].regular === false && $scope.project.talent[i].requested === false){
						$scope.project.talent.splice(i, 1);
						$scope.updateNoRefresh();
						return;
					}
					found = 1;
				}
			}

			if(found === 0){
				$scope.project.talent.push(talent);
			}

			$http.post('/projects/sendTalentEmail', {
		        talent: talent,
		        project: $scope.project
		    }).
			success(function(data, status, headers, config) {
				$scope.project = angular.extend($scope.project, data);
			});

			// update project store
			//$scope.update();
		};
		$scope.updateRequestTalent = function(talentId, talentName, email){
			// gen talent object
			var talent = {'talentId': talentId, 'name': talentName, 'email': email, 'booked': false, 'status': 'Cast', part: $scope.parts[talentId] || '', regular: false, requested: true};

			// check for existing item
			var found = 0;
			for(var i = 0; i < $scope.project.talent.length; ++i){
				if($scope.project.talent[i].talentId === talentId){
					// reset regular talent status
					if($scope.project.talent[i].regular === true){
						$scope.project.talent[i].regular = false;
					}
					// check requested talent status
					if($scope.project.talent[i].requested === true){
						$scope.project.talent[i].requested = false;
					} else {
						$scope.project.talent[i].requested = true;
					}
					// remove talent if no longer selected
					if($scope.project.talent[i].regular === false && $scope.project.talent[i].requested === false){
						$scope.project.talent.splice(i, 1);
						$scope.updateNoRefresh();
						return;
					}
					found = 1;
				}
			}

			if(found === 0){
				$scope.project.talent.push(talent);
			}

			$http.post('/projects/sendTalentEmail', {
		        talent: talent,
		        project: $scope.project
		    }).
			success(function(data, status, headers, config) {
				$scope.project = angular.extend($scope.project, data);
			});

			// update project store
			//$scope.update();
		};
		$scope.updateCreateTalent = function(talentId, talentName, email){
			// gen talent object
			var talent = {'talentId': talentId, 'name': talentName, 'email': email, 'booked': false, 'status': 'Cast', part: $scope.parts[talentId] || '', regular: true, requested: false};

			// check for existing item
			var found = 0;
			for(var i = 0; i < $scope.newProject.talent.length; ++i){
				if($scope.newProject.talent[i].talentId === talentId){
					// reset requested status
					if($scope.newProject.talent[i].requested === true){
						$scope.newProject.talent[i].requested = false;
					}
					// set regular status
					if($scope.newProject.talent[i].regular === true){
						$scope.newProject.talent[i].regular = false;
					} else {
						$scope.newProject.talent[i].regular = true;
					}
					// remove talent if no longer selected
					if($scope.newProject.talent[i].regular === false && $scope.newProject.talent[i].requested === false){
						$scope.newProject.talent.splice(i, 1);
					}
					found = 1;
				}
			}

			// add talent if never found
			if(found === 0){
				$scope.newProject.talent.push(talent);
			}

		};
		$scope.updateRequestCreateTalent = function(talentId, talentName, email){
			// gen talent object
			var talent = {'talentId': talentId, 'name': talentName, 'email': email, 'booked': false, 'status': 'Cast', part: $scope.parts[talentId] || '', regular: false, requested: true};

			// check for existing item
			var found = 0;
			for(var i = 0; i < $scope.newProject.talent.length; ++i){
				if($scope.newProject.talent[i].talentId === talentId){
					// reset regular talent if set
					if($scope.newProject.talent[i].regular === true){
						$scope.newProject.talent[i].regular = false;
					}
					// set requested talent
					if($scope.newProject.talent[i].requested === true){
						$scope.newProject.talent[i].requested = false;
					} else {
						$scope.newProject.talent[i].requested = true;
					}
					// remove talent if no longer selected
					if($scope.newProject.talent[i].regular === false && $scope.newProject.talent[i].requested === false){
						$scope.newProject.talent.splice(i, 1);
					}
					found = 1;
				}
			}

			// add talent if never found
			if(found === 0){
				$scope.newProject.talent.push(talent);
			}

		};

		$scope.updateTalentStatus = function(talentId, status){

			for(var i = 0; i < $scope.project.talent.length; ++i){
				if(String($scope.project.talent[i].talentId) === String(talentId)){
					$scope.project.talent[i].status = status;

					// update project store
					//$scope.update();
					$scope.updateNoRefresh();
				}
			}

			
		};

		$scope.getTalentStatus = function(talentId){

			for(var i = 0; i < $scope.project.talent.length; ++i){
				if(String($scope.project.talent[i].talentId) === String(talentId)){
					 return $scope.project.talent[i].status;
				}
			}

		};

		$scope.updateTeam = function(userId, displayName, email){
			// gen user object
			var user = {'userId': userId, 'name': displayName, 'email': email};

			// check for existing item
			var found = 0;
			for(var i = 0; i < $scope.project.team.length; ++i){
				if($scope.project.team[i].userId === userId){
					$scope.project.team.splice(i, 1);
					found = 1;
				}
			}

			if(found === 0){
				$scope.project.team.push(user);
			}

			// update project store
			//$scope.update();
			$scope.updateNoRefresh();
		};

		$scope.updateClientClient = function(userId, displayName, email){
			// gen user object
			var user = {'userId': userId, 'name': displayName, 'email': email};

			// check for existing item
			var found = 0;
			for(var i = 0; i < $scope.project.clientClient.length; ++i){
				if($scope.project.clientClient[i].userId === userId){
					$scope.project.clientClient.splice(i, 1);
					found = 1;
				}
			}

			if(found === 0){
				$scope.project.clientClient.push(user);
			}

			// update project store
			//$scope.update();
			$scope.updateNoRefresh();
		};

		$scope.updateClient = function(userId, displayName, email){
			// gen user object
			var user = {'userId': userId, 'name': displayName, 'email': email};

			// check for existing item
			var found = 0;
			for(var i = 0; i < $scope.project.client.length; ++i){
				if($scope.project.client[i].userId === userId){
					$scope.project.client.splice(i, 1);
					found = 1;
				}
			}

			if(found === 0){
				$scope.project.client.push(user);
			}

			// update project store
			//$scope.update();
			$scope.updateNoRefresh();
		};

		$scope.updateCreateClient = function(userId, displayName, email){
			// gen user object
			var user = {'userId': userId, 'name': displayName, 'email': email};

			// check for existing item
			var found = 0;
			for(var i = 0; i < $scope.newProject.client.length; ++i){
				if($scope.newProject.client[i].userId === userId){
					$scope.newProject.client.splice(i, 1);
					found = 1;
				}
			}

			if(found === 0){
				$scope.newProject.client.push(user);
			}

		};

		$scope.toggleBooked = function(talentId){

			for(var i = 0; i < $scope.project.talent.length; ++i){
				if($scope.project.talent[i].talentId === talentId){

					$scope.project.talent[i].booked = !$scope.project.talent[i].booked;

					// update project store
					//$scope.update();
					$scope.updateNoRefresh();

				}
			}
		};

		// gather booked data
		$scope.getBooked = function(talentId){

			for(var i = 0; i < $scope.project.talent.length; ++i){
				if($scope.project.talent[i].talentId === talentId){
					if($scope.project.talent[i].booked === true){
						return true;
					}
				}
			}

		};

		// get talent audition note
		$scope.getTalentNote = function(talentId){

			if(typeof $scope.project !== 'undefined'){
				if(typeof $scope.project.talent !== 'undefined'){
					for(var i = 0; i < $scope.project.talent.length; ++i){
						if($scope.project.talent[i].talentId === talentId){

							return $scope.project.talent[i].note;
							
						}
					}
				}
			}

		};
		// save talent note
		$scope.saveTalentNote = function(talentId){

			for(var i = 0; i < $scope.project.talent.length; ++i){
				if($scope.project.talent[i].talentId === talentId){

					$scope.project.talent[i].note = $scope.talentNote[talentId];

					$scope.updateNoRefresh();
					
				}
			}

		};

		// save audition note item
		$scope.saveAudtionNote = function(key){

			var now = new Date();
			var item = {date: now.toJSON(), userid: Authentication.user._id, username: Authentication.user.displayName, item: this.auditions[key].discussion};

			$scope.project.auditions[key].discussion.push(item);

			// update project store
			//$scope.update();
			$scope.updateNoRefresh();
		};

		// update auditions approval status
		$scope.scrApprov = function(key){

			var now = new Date();

			if($scope.project.scripts[key].approved.selected === true){
				$scope.project.scripts[key].approved.selected = false;
				$scope.project.scripts[key].approved.by.userId = '';
				$scope.project.scripts[key].approved.by.name = '';
				$scope.project.scripts[key].approved.by.date = '';
			} else {
				$scope.project.scripts[key].approved.selected = true;
				$scope.project.scripts[key].approved.by.userId = Authentication.user._id;
				$scope.project.scripts[key].approved.by.name = Authentication.user.fdisplayName;
				$scope.project.scripts[key].approved.by.date = now.toJSON();

			}

			// update project store
			//$scope.update();
			$scope.updateNoRefresh();
		};

		// save audition note item
		$scope.saveScriptNote = function(key){

			var now = new Date();
			var item = {date: now.toJSON(), userid: Authentication.user._id, username: Authentication.user.displayName, item: this.scripts[key].discussion};

			$scope.project.scripts[key].discussion.push(item);

			// update project store
			//$scope.update();
			$scope.updateNoRefresh();
		};

		// Create new Project
		$scope.create = function() {

			// method vars
			var proStatus = 'In Progress';
			var id = '';

			// update project status, if needed
			if(typeof $scope.newProject._id !== 'undefined'){
				id = $scope.newProject._id;
				proStatus = 'ReAuditioned';
			}

			// Create new Project object
			var project = new Projects ({
				id: id,
				title: $scope.newProject.title,
				estimatedCompletionDate: $scope.newProject.estimatedCompletionDate,
				estimatedTime: $scope.newProject.estimatedTime,
				actualTime: $scope.newProject.actualTime,
				status: proStatus,
				sounders: $scope.newProject.sounders,
				scripts: $scope.newProject.scripts,
				copiedScripts: $scope.newProject.copiedScripts,
				referenceFiles: $scope.newProject.referenceFiles,
				copiedReferenceFiles: $scope.newProject.copiedReferenceFiles,
				description: $scope.newProject.description,
				client: $scope.newProject.client,
				talent: $scope.newProject.talent,
				notifyClient: $scope.newProject.notifyClient
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
				if ( project ) { project.$remove();

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
				$scope.project = angular.extend($scope.project, data);
			});

		};

		// duplicate existing project
		$scope.dupCheck = function(){

			if($stateParams.projectId){
				// $scope.newProject = Projects.get({ 
				// 	projectId: $stateParams.projectId
				// });

				$http.get('/projects/' + $stateParams.projectId, {})
				.success(function(data, status, headers, config) {
					$scope.newProject = data;

					// reset some defaults
					$scope.newProject.title = $scope.newProject.title + ' ReAudtion';
					$scope.newProject.talent = [];

					// copy existing scripts and ref files
					$scope.newProject.copiedScripts = $scope.newProject.scripts;
					$scope.newProject.scripts = [];
					$scope.newProject.copiedReferenceFiles = $scope.newProject.referenceFiles;
					$scope.newProject.referenceFiles = [];
				});

				$scope.newProjTalentLink = 'createDupProject.talent';
				$scope.newProjLink = 'createDupProject.project';

				// $scope.$watch('newProject', function(){
				// 	// new project adjustments
				// 	$scope.newProject.title = $scope.newProject.title + ' ReAudtion';
				// });
			}
		
		};

		// client update

		// update audition rating
		$scope.curRatings = function(){
			if(typeof $scope.project !== 'undefined' && typeof $scope.project.auditions !== 'undefined'){
				for(var j = 0; j < $scope.project.auditions.length; ++j){
					for(var i = 0; i < $scope.project.auditions[j].rating.length; ++i){
						if($scope.project.auditions[j].rating[i].userId === Authentication.user._id){
							$scope.project.auditions[j].curRating = $scope.project.auditions[j].rating[i].value;
						}
					}
				}
			}
		};
		$scope.lookUpRating = function(key){
			for(var i = 0; i < $scope.project.auditions[key].rating.length; ++i){
				if($scope.project.auditions[key].rating[i].userId === Authentication.user._id){
					return $scope.project.auditions[key].rating[i].value;
				}
			}
		};
		$scope.updateRating = function(path, redirect){
			// determine if update should result in user redirect
			redirect = typeof redirect === 'undefined' ? true : redirect;

			// console.log($scope.rate[key]);
			var key, ratingCnt = 0, avgRating = 0;

			// get key for selected audition
			for(var j = 0; j < $scope.project.auditions.length; ++j){
				if($scope.project.auditions[j].file.path === path){
					key = j;
				}
			}

			// walk through existing ratings
			if(typeof $scope.project.auditions[key] !== 'undefined' && typeof $scope.project.auditions[key].rating !== 'undefined'){
				for(var i = 0; i < $scope.project.auditions[key].rating.length; ++i){
					// toggle existing rating if found
					if($scope.project.auditions[key].rating[i].userId === Authentication.user._id){
						$scope.project.auditions[key].rating.splice(i,1);
						$scope.project.auditions[key].curRating = $scope.selCheckVal;
					} else {
						// gather average rating
						avgRating += $scope.project.auditions[key].rating[i].value;
					}
				}
				ratingCnt += $scope.project.auditions[key].rating.length;
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
			$scope.project.auditions[key].rating.push(rating);

			// merge average rating
			$scope.project.auditions[key].avgRating = avgRating;

			// update project store
			$scope.updateNoRefresh();
		};

		// update audition rating
		$scope.updateFavorite = function(path, redirect){
			// determine if update should result in user redirect
			redirect = typeof redirect === 'undefined' ? true : redirect;

			// console.log($scope.rate[key]);
			var key, favoriteVal = 1;

			// get key for selected audition
			for(var j = 0; j < $scope.project.auditions.length; ++j){
				if($scope.project.auditions[j].file.path === path){
					key = j;
				}
			}

			// determine existing favorite setting
			if(typeof $scope.project.auditions[key].favorite !== 'undefined'){
				if($scope.project.auditions[key].favorite === 1){
					favoriteVal = 0;
				}
			}

			// merge average rating
			$scope.project.auditions[key].favorite = favoriteVal;

			// update project store
			$scope.updateNoRefresh();
		};

		// update phase options
		$scope.updateStatus = function(key){

			// // send update email
			// $scope.gatherToAddresses('updateStatus');
		 //    $scope.email.subject = $scope.project.title + ' Phase ' + $scope.project.phases[key].name[0].toUpperCase() + ' Status Update';
		 //    $scope.email.message += 'Project: ' + $scope.project.title + '<br>';
		 //    $scope.email.message += 'Phase: ' + $scope.project.phases[key].name[0].toUpperCase() + '<br>';
		 //    $scope.email.message += 'Status: ' + $scope.project.phases[key].status[0].toUpperCase() + '<br>';
		 //    $scope.email.message += 'Start Date: ' + $scope.project.phases[key].startDate + '<br>';
		 //    $scope.email.message += 'End Date: ' + $scope.project.phases[key].endDate + '<br>' + '<br>';
		 //    $scope.email.message += 'Added by: ' + Authentication.user.displayName + '<br>';
		 //    $scope.email.message += '<br>' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '<br>';

		 //    $http.post('/projects/sendemail', {
			// 	email: $scope.email
			// });

		    if($scope.project.phases[key].status === 'complete'){
		    	var now = new Date();
		    	$scope.project.phases[key].endDate = now.toJSON();
				// update project status only for "Posting and Publishing" phase
				if($scope.project.phases[key].name === 'Posting and Publishing'){
					// reset overall project status to closed
					$scope.project.status = 'Closed - Pending Client Decision';

					// send closing email
					for(var i = 0; i < $scope.project.client.length; ++i){
						$scope.selectedMainClients[i] = $scope.project.client[i].userId;
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

			var now = new Date();

			var item = {
							date: now, 
							userid: '', 
							username: 'System', 
							item: 'Changed to ' + $scope.project.sounders + ' by ' + Authentication.user.displayName, 
							deleted: false
						};

			$scope.project.discussion.push(item);

			$scope.updateNoRefresh();

		};

		$scope.updateProjectStatus = function(){

			var now = new Date();

			var item = {
							date: now, 
							userid: '', 
							username: 'System', 
							item: 'Changed to ' + $scope.project.status + ' by ' + Authentication.user.displayName, 
							deleted: false
						};

			$scope.project.discussion.push(item);

			// update project with new status
			$scope.updateNoRefresh();

			// email associated talent and update talent status
			if($scope.project.status === 'Canceled'){
				
				$http.post('/projects/sendTalentCanceledEmail', {
			        talents: $scope.project.talent,
			        projectId: $scope.project._id,
			        override: false
			    }).
				success(function(data, status, headers, config) {
					// update project store
					$scope.project = angular.extend($scope.project, data);

					// update project with new status
					$scope.update();
				});

			}

		};
		// Find a list of Projects
		$scope.find = function() {
			$scope.projects = Projects.query();
		};

		// dynamically update project view
		Socket.on('projectsListUpdate', function() {

			$scope.find();

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

			if(String(pojectData.id) === String($scope.project._id)){
				// merge existing open project with updated project
				$http.post('/projects/getproject', {
					id: $scope.project._id
				}).success(function(data, status, headers, config) {
					$scope.project = angular.extend($scope.project, data);
				});
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
			this.findOne();

			// enable audio load after watch
			$scope.loadAudio = 0;
		};

		// load audio files into player after project object has finished loading

		$scope.$watch('newProject.estimatedCompletionDate', function(val){
			var now = new Date();

			if($scope.newProject.estimatedCompletionDate !== '' && $scope.newProject.estimatedCompletionDate < now){
				$scope.dateNotice = 'Date selected passed. Please select a future date and time!';
			} else {
				$scope.dateNotice = '';
			}
		});

		$scope.calcProjectProg = function(curProject){
			if(typeof curProject.phases !== 'undefined'){
				var phaseLngth = curProject.phases.length;
				var complSteps = 0;

				// determine completed steps
				for(var i = 0; i < phaseLngth; ++i){
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

		$scope.$watch('project', function(val){

			if(typeof $scope.project === 'object'){

				// check for values then do things
				$scope.$watch('project.referenceFiles',function(){
					if(typeof $scope.project.referenceFiles === 'object'){
						if($scope.project.referenceFiles.length > 0){
							$scope.toggleRefs = true;
						}
					}
				});

				// load auditions
				// $scope.$watch('project.auditions', function(val){

				// 	if(typeof $scope.project.auditions === 'object'){
				// 		// if($scope.loadAudio === 0){
				// 		// 	$scope.loadAudioPlayer();	
				// 		// 	$scope.loadAudio = 1;
				// 		// }

				// 		// load audition ratings
				// 		for(var i = 0; i < $scope.project.auditions.length; ++i){
				// 			// gather average value 
				// 			$scope.ratingsAvg[i] = 0;
				// 			// gather per user rating
				// 			for(var j = 0; j < $scope.project.auditions[i].rating.length; ++j){
				// 				if($scope.project.auditions[i].rating[j].userId === String(Authentication.user._id)){
				// 					$scope.ratings[i] = $scope.project.auditions[i].rating[j].value;
				// 				}
				// 				$scope.ratingsAvg[i] += $scope.project.auditions[i].rating[j].value;
				// 			}
				// 			$scope.ratingsAvg[i] = $scope.ratingsAvg[i] / $scope.project.auditions[i].rating.length;
				// 		}
				// 	}
				// });

				// update progress bar
				$scope.$watch('project.phases', function(val){

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
		});

		// load audio files
		$scope.loadAudioPlayer = function(){
			if(typeof $scope.project.auditions !== 'undefined'){
				var loadCnt = $scope.project.auditions.length;
				var curVal = 0;
				if($scope.project.auditions.length > 1){
					loadCnt = loadCnt - 1;
				}
				angular.forEach($scope.project.auditions, function(value, key){
					if(value){
						if(typeof value.file !== 'undefined'){
							if(value.file.type === 'audio/mp3' || value.file.type === 'audio/mpeg'){
								var fileName = '/res/auditions/'+$scope.project._id+'/'+value.file.name;
								// only load audio file if needed
								if(typeof $scope.audio[key] === 'object'){
									if($scope.audio[key].id !== fileName){
										$scope.audio[key] = ngAudio.load(fileName);
										$scope.audio[key].unbind();
									}
								} else {
									$scope.audio[key] = ngAudio.load(fileName);
									$scope.audio[key].unbind();
								}
								if($scope.project.auditions.length === 1){
									curVal = 1;
								} else {
									curVal = key;
								}
								$scope.uploadfile = 'loading audio ' + parseInt(100.0 * curVal / loadCnt) + '%';
								$scope.uploadprogress = parseInt(100.0 * curVal / loadCnt);
							}
						}
					}
				});
			}
		};

		$scope.verifyAudio = function(key){
			if(typeof $scope.project.auditions[key] === 'object'){
				if(typeof $scope.project.auditions[key].file === 'object'){
					return true;
				}
			}
			return false;
		};

		$scope.verifyFile = function(file){
			
			//console.log(file);

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
			if(typeof $scope.audio === 'object'){
				$scope.audio.stop();
				$scope.audioStatus = 2;
			}
		};

		$scope.updatePlayCnt = function(filename){
			// set play count
			for(var i = 0; i < $scope.project.auditions.length; ++i){
				if($scope.project.auditions[i].file.name === filename){
					if(typeof $scope.project.auditions[i].playCnt === 'undefined'){
						$scope.project.auditions[i].playCnt = 1;
					} else {
						$scope.project.auditions[i].playCnt += 1;
					}
				}
			}

			$scope.updateNoRefresh();
		};

		$scope.playAudio = function(key, filename, fileDir){

			var fileName = '';
			
			// check media file play state
			if(key !== $scope.lastAudioID && typeof $scope.audio === 'object'){
				$scope.audio.stop();
			}
			if(typeof $scope.audio === 'object' && key === $scope.lastAudioID && $scope.audioStatus === 1 && typeof $scope.audio === 'object'){
				$scope.audio.pause();
				$scope.audioStatus = 0;
				//console.log('pause');
				return;
			}
			if(typeof $scope.audio === 'object' && key === $scope.lastAudioID && $scope.audioStatus === 0 && typeof $scope.audio === 'object'){
				$scope.audio.play();
				$scope.audioStatus = 1;
				$scope.updatePlayCnt(filename);
				//console.log('play');
				return;
			}
			if(typeof $scope.audio === 'object' && key === $scope.lastAudioID && $scope.audioStatus === 2 && typeof $scope.audio === 'object'){
				$scope.audio.play();
				$scope.audioStatus = 1;
				//console.log('play');
				$scope.updatePlayCnt(filename);
				return;
			}

			// // disable previous
			// if(typeof $scope.audio === 'object'){
			// 	if(key !== $scope.lastAudioID){
			// 		$scope.audio[$scope.lastAudioID].stop();
			// 	}
			// }

			// assign file name
			if(typeof fileDir === 'undefined'){
				fileName = '/res/auditions/' + $scope.project._id + '/' + filename;
			} else {
				fileName = fileDir + '/' + filename
			}

			// if(typeof $scope.audio === 'object'){
			// 	if($scope.audio.id !== fileName){
			// 		$scope.audio = ngAudio.load(fileName);
			// 		$scope.audio.unbind();
			// 		$scope.audioStatus = 1;
			// 	}
			// } else {
				$scope.audio = ngAudio.load(fileName);
				$scope.audio.unbind();
				$scope.audioStatus = 1;	
			// }

			//console.log('load');

			$scope.updatePlayCnt(filename);

			// store current audio key
			$scope.lastAudioID = key;

			
		};

		$scope.playAudioNoTrack = function(key, filename, fileDir){

			var fileName = '';
			
			// check media file play state
			if(key !== $scope.lastAudioID && typeof $scope.audio === 'object'){
				$scope.audio.stop();
			}
			if(typeof $scope.audio === 'object' && key === $scope.lastAudioID && $scope.audioStatus === 1 && typeof $scope.audio === 'object'){
				$scope.audio.pause();
				$scope.audioStatus = 0;
				//console.log('pause');
				return;
			}
			if(typeof $scope.audio === 'object' && key === $scope.lastAudioID && $scope.audioStatus === 0 && typeof $scope.audio === 'object'){
				$scope.audio.play();
				$scope.audioStatus = 1;
				//console.log('play');
				return;
			}
			if(typeof $scope.audio === 'object' && key === $scope.lastAudioID && $scope.audioStatus === 2 && typeof $scope.audio === 'object'){
				$scope.audio.play();
				$scope.audioStatus = 1;
				//console.log('play');
				return;
			}

			// assign file name
			if(typeof fileDir === 'undefined'){
				fileName = '/res/auditions/' + $scope.project._id + '/' + filename;
			} else {
				fileName = fileDir + '/' + filename
			}

			$scope.audio = ngAudio.load(fileName);
			$scope.audio.unbind();
			$scope.audioStatus = 1;	

			// store current audio key
			$scope.lastAudioID = key;

			
		};

		// play audio on load
		$scope.$watch('audio', function(val){
			if(typeof $scope.audio === 'object'){
				$scope.audio.play();
			}
		});

		// save discussion item
		$scope.saveDiscussion = function(){

			if(typeof $scope.discussion !== 'undefined' && this.discussion !== ''){
				var now = new Date();
				var item = {date: now.toJSON(), userid: Authentication.user._id, username: Authentication.user.displayName, item: $scope.discussion, deleted: false};

				$scope.project.discussion.push(item);

				// send update email
				$scope.gatherToAddresses('saveDiscussion');
			    $scope.email.subject = $scope.project.title + ' discussion added';
			    $scope.email.message = 'Discussion Item: ' + $scope.discussion + '<br>';
			    $scope.email.message += 'Project: ' + $scope.project.title + '<br>';
			    $scope.email.message += 'Added by: ' + Authentication.user.displayName + '<br>';
			    $scope.email.message += '<br>' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '<br>';

				$scope.discussion = '';

			    $http.post('/projects/sendemail', {
					email: $scope.email
				});
				// update project store
				//$scope.update();
				$scope.updateNoRefresh();
			}
		};

		// save client note
		$scope.saveClientNote = function(){

			if(typeof $scope.clientNotes !== 'undefined' && this.clientNotes !== ''){
				var now = new Date();
				var item = {
							date: now.toJSON(), 
							userid: Authentication.user._id, 
							username: Authentication.user.displayName, 
							item: this.clientNotes, 
							deleted: false
						};

				$scope.project.clientNotes.push(item);

				// send update email
				$scope.gatherToAddresses('saveDiscussion');
			    $scope.email.subject = $scope.project.title + ' client note added';
			    $scope.email.message = 'Client Note Item: ' + this.clientNotes + '<br>';
			    $scope.email.message += 'Project: ' + $scope.project.title + '<br>';
			    $scope.email.message += 'Added by: ' + Authentication.user.displayName + '<br>';
			    $scope.email.message += '<br>' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '<br>';

				this.clientNotes = '';

			    $http.post('/projects/sendemail', {
					email: $scope.email
				});
				// update project store
				//$scope.update();
				$scope.updateNoRefresh();
			}
		};

		$scope.deleteDiscussion = function(key){
			// reverse selction id 
			var selVal = ($scope.project.discussion.length - 1) - key;

			// apply to reverse index
			$scope.project.discussion[selVal].deleted = true;

			// update project store
			//$scope.update();
			$scope.updateNoRefresh();
		};

		$scope.delScript = function(idx){
			// verify user wants to delete file
			if (confirm('Are you sure?')) {

				var file = '/res/scripts/' + $scope.project._id + '/' + $scope.project.scripts[idx].file.name;

				$http.put('/projects/deletefile', {
			        fileLocation: file
			    });

				$scope.project.scripts.splice(idx, 1);

				// update project store
				//$scope.update();
				$scope.updateNoRefresh();
				
			}
		};

		// remove temporary script file
		$scope.delTempScript = function(idx){
			var file = '/res/scripts/temp/' + $scope.newProject.scripts[idx].file.name;

			$http.post('/projects/deletefile', {
		        fileLocation: file
		    });

		    $scope.newProject.scripts.splice(idx, 1);
		};

		// delete copy script file
		$scope.delCopyScript = function(idx){
		    $scope.newProject.copiedScripts.splice(idx, 1);
		};

		// upload script file
		$scope.uploadScript = function($files) {
	    //$files: an array of files selected, each file has name, size, and type.

	    for (var i = 0; i < $files.length; i++) {
	      var file = $files[i];

	      performScriptUpload(file, i, $files);
    	 }
	  	};

	  	var performScriptUpload = function(file, i, $files){
	  		$scope.upload = $upload.upload({
	        url: 'projects/uploads/script', //upload.php script, node.js route, or servlet url 
	        //method: 'POST' or 'PUT', 
	        data: {project: $scope.project},
	        file: file, // or list of files ($files) for html5 only 
	      }).progress(function(evt) {
	        $scope.uploadStatus = (i + 1) + ' of ' + $files.length + ' files uploaded';
	      	$scope.uploadfile = evt.config.file.name;
	        $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
	      }).success(function(data, status, headers, config) {
	        // file is uploaded successfully 
			$scope.project = angular.extend($scope.project, data);
	      });
	  	};

	  	$scope.uploadTempScript = function($files) {
	    //$files: an array of files selected, each file has name, size, and type. 
	    for (var i = 0; i < $files.length; i++) {
	    	var file = $files[i];

	    		performUploadTempScript(file, i, $files);
    		}
	  	};

	  	var performUploadTempScript = function(file, i, $files){
  		  $scope.upload = $upload.upload({
	        url: 'projects/uploads/script/temp', //upload.php script, node.js route, or servlet url 
	        data: {project: $scope.project},
	        file: file, // or list of files ($files) for html5 only 
	      }).progress(function(evt) {
	        $scope.uploadStatus = (i + 1) + ' of ' + $files.length + ' files uploaded';
	      	$scope.uploadfile = evt.config.file.name;
	        $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
	      }).success(function(data, status, headers, config) {
	        // file is uploaded successfully 
	        //console.log(data);
	        $scope.newProject.scripts.push(data[0]);
	      });
	  	};

	  	// set published status
	  	$scope.updatePublished = function(key){
	  		if(this.project.auditions[key].published === false){
	  			$scope.project.auditions[key].published = true;
	  		} else {
	  			$scope.project.auditions[key].published = false;
	  		}

	  		// update project store
			//$scope.update();
			$scope.updateNoRefresh();
	  	};

		$scope.uploadReferenceFile = function($files) {
	    //$files: an array of files selected, each file has name, size, and type.

	    for (var i = 0; i < $files.length; i++) {
		    var file = $files[i];

		    	performUploadReferenceFile(file, i, $files);
	    	}
	  	};

	  	var performUploadReferenceFile = function(file, i, $files){
		  	$scope.upload = $upload.upload({
		        url: 'projects/uploads/referenceFile', //upload.php script, node.js route, or servlet url 
		        data: {project: $scope.project},
		        file: file, // or list of files ($files) for html5 only 
		    }).progress(function(evt) {
		        $scope.uploadStatus = (i + 1) + ' of ' + $files.length + ' files uploaded';
		      	$scope.uploadfile = evt.config.file.name;
		        $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
		    }).success(function(data, status, headers, config) {
				$scope.project = angular.extend($scope.project, data);
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
		    for (var i = 0; i < $files.length; i++) {
		    	var file = $files[i];

			    performUploadTempReferenceFile(file, i, $files);
	    	}
	  	};

	  	// delete temp reference file
	  	$scope.delTempReferenceFile = function(idx){
			var file = '/res/referenceFiles/temp/' + $scope.newProject.referenceFiles[idx].file.name;

			$http.post('/projects/deletefile', {
		        fileLocation: file
		    });

		    $scope.newProject.referenceFiles.splice(idx, 1);
		};

		// delete copy reference file
		$scope.delCopyReferenceFile = function(idx){
		    $scope.newProject.copiedReferenceFiles.splice(idx, 1);
		};

		// delete reference file
	  	$scope.delReferenceFile = function(idx){
			// verify user wants to delete file
			if (confirm('Are you sure?')) {

				var file = '/res/referenceFiles/' + $scope.project._id + '/' + $scope.project.referenceFiles[idx].file.name;

				$http.post('/projects/deletefile', {
			        fileLocation: file
			    });

				$scope.project.referenceFiles.splice(idx, 1);

				// update project store
				//$scope.update();
				$scope.updateNoRefresh();
				
			}
		};

		$scope.delAudition = function(idx){
			// verify user wants to delete file
			if (confirm('Are you sure?')) {

				// tell audio system to reload files
				$scope.loadAudio = 0;

				var file = '/res/auditions/' + $scope.project._id + '/' + $scope.project.auditions[idx].file.name;

			    // delete selected file
				$http.post('/projects/deletefile', {
			        fileLocation: file
			    });

				$scope.project.auditions.splice(idx, 1);

				// update project store
				//$scope.update();
				$scope.updateNoRefresh();
				
			}
		};

		var performUploadAudition = function(file, i, $files){
			$scope.upload = $upload.upload({
		        url: 'projects/uploads/audition', //upload.php script, node.js route, or servlet url 
		        data: {project: $scope.project},
		        file: file, // or list of files ($files) for html5 only 
		    }).progress(function(evt) {
		      	$scope.uploadStatus = (i + 1) + ' of ' + $files.length + ' files uploaded';
		      	$scope.uploadfile = evt.config.file.name;
		        $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
		    }).success(function(data, status, headers, config) {
		        // file is uploaded successfully 
		        $scope.project = angular.extend($scope.project, data);
		    });
		};
		$scope.uploadAudition = function($files) {

			// tell audio system to reload files
			$scope.loadAudio = 0;

		    //$files: an array of files selected, each file has name, size, and type. 
		    for (var i = 0; i < $files.length; i++) {
		    	var file = $files[i];
		    
		    	performUploadAudition(file, i, $files);
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
		        //console.log(data);
		        $scope.auditions.push(data);
		    });
	  	};

	  	$scope.uploadTempAudition = function($files) {
	    //$files: an array of files selected, each file has name, size, and type. 
	    for (var i = 0; i < $files.length; i++) {
	    	var file = $files[i];

	    		performUploadTempAuditionFile(file, i, $files);

    		}
	  	};

	  	// delete uploaded temp audition
	  	$scope.delTempAudition = function(key){

	  		var file = '/res/auditions/temp/' + $scope.auditions[key].file.name;

			$http.post('/projects/deletefile', {
		        fileLocation: file
		    });

		    $scope.auditions.splice(key, 1);

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

			        alert('Auditions have been submitted. Thank you!')
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