'use strict';

// Projects controller
angular.module('projects').controller('ProjectsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Projects', '$upload', 'ngAudio', '$http',
	function($scope, $stateParams, $location, Authentication, Projects, $upload, ngAudio, $http ) {
		$scope.authentication = Authentication;

		// rating
		$scope.max = 5;
		$scope.isReadonly = false;
		$scope.ratings = [];
		$scope.ratingsAvg = [];
		// static project options
		$scope.projProgress = [];
		$scope.selCheckVal = 0;
		$scope.client = [];
		$scope.talent = [];
		$scope.showRename = 0;
		$scope.statusOpts = ['In Progress', 'On Hold', 'Booked', 'Canceled', 'ReAuditioned', 'Dead', 'Closed - Pending Client Decision', 'Complete'];
		$scope.priorityOpts = ['None', 'Very low', 'Low', 'Medium', 'High', 'Very high'];
		$scope.phaseStatusOpts = ['in progress','open','complete','suspended'];
		$scope.soundersOpts = ['Sounders', 'No Sounders - Approved By William'];
		$scope.talentStatus = ['Cast', 'Emailed', 'Scheduled', 'Message left', 'Out', 'Received needs to be posted', 'Posted', 'Not Posted (Bad Read)'];
		$scope.loadAudio = 0;
		$scope.audio = [];
		$scope.lastAudioID = 0;
		$scope.newLead = {};
		$scope.referenceFiles = [];
		$scope.scripts = [];
		$scope.newProject = {notifyClient: true};
		$scope.parts = [];
		$scope.toggleRefs = false;
		$scope.selectedMainClients = [];
		$scope.rejFiles = [];
		// projects client portal
		$scope.selectedAuditions = [];

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

		$scope.hoveringOver = function(value,key,object) {
	        $scope.overStar = value;
	        $scope.percent = 100 * (value / $scope.max);
	        $scope.selCheckVal = value;
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
      	$scope.hideSelectedAuditions = function(){
      		for(var i = 0; i < project.auditions.length; ++i){

      		}
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
      		for(var i = 0; i < $scope.talent.length; ++i){
      			if($scope.talent[i].talentId === String(id)){
      				if($scope.talent[i].requested === true || $scope.talent[i].regular === true){
      					return false;
      				}
      			}
      		}
   			return true;
     	};

		// verify users
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
		$scope.sendTalentEmail = function(talent){

			$http.post('/projects/sendtalentemail', {
		        talent: talent,
		        project: $scope.project
		    }).
			success(function(data, status, headers, config) {
				alert('Selected talent has been emailed.');

				// update project store
				$scope.update();
			});

		};

		// send various client emails
		$scope.sendClientEmail = function(type){

			$http.post('/projects/sendclientemail', {
		        type: type,
		        project: $scope.project,
		        clients: $scope.selectedMainClients
		    }).
			success(function(data, status, headers, config) {
        		alert('Clients Emailed ' + type + ' Email ');
        		$scope.selectedMainClients = [];

				var note, now = moment(new Date()).format();
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
				$scope.update();
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
			        describe: $scope.newLead.describe
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
			for(var k = 0; k < $scope.project.team.length; ++k){
				if($scope.project.team[k].email !== '' && re.test($scope.project.team[k].email)){
					emailCnt += 1;
					toEmails[emailCnt] = $scope.project.team[k].email;
				}
			}
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
			for(var i = 0; i < $scope.client.length; ++i){
				if($scope.client[i].userId === userId){
					return true;
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
			for(var i = 0; i < $scope.talent.length; ++i){
				if($scope.talent[i].talentId === talentId && $scope.talent[i].regular === true){
					return true;
				}
			}
		};
		$scope.checkRequestedCreateTalent = function(talentId){
			for(var i = 0; i < $scope.talent.length; ++i){
				if($scope.talent[i].talentId === talentId && $scope.talent[i].requested === true){
					return true;
				}
			}
		};

		$scope.updateTalent = function(talentId, talentName, email){
			// gen talent object
			var talent = {'talentId': talentId, 'name': talentName, 'email': email, 'booked': false, 'status': '', part: $scope.parts[talentId] || '', regular: true, requested: false};

			// check for existing item
			var found = 0;
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
					}
					found = 1;
				}
			}

			if(found === 0){
				$scope.project.talent.push(talent);
			}

			// update project store
			$scope.update();
		};
		$scope.updateRequestTalent = function(talentId, talentName, email){
			// gen talent object
			var talent = {'talentId': talentId, 'name': talentName, 'email': email, 'booked': false, 'status': '', part: $scope.parts[talentId] || '', regular: false, requested: true};

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
					}
					found = 1;
				}
			}

			if(found === 0){
				$scope.project.talent.push(talent);
			}

			// update project store
			$scope.update();
		};
		$scope.updateCreateTalent = function(talentId, talentName, email){
			// gen talent object
			var talent = {'talentId': talentId, 'name': talentName, 'email': email, 'booked': false, 'status': '', part: $scope.parts[talentId] || '', regular: true, requested: false};

			// check for existing item
			var found = 0;
			for(var i = 0; i < $scope.talent.length; ++i){
				if($scope.talent[i].talentId === talentId){
					// reset requested status
					if($scope.talent[i].requested === true){
						$scope.talent[i].requested = false;
					}
					// set regular status
					if($scope.talent[i].regular === true){
						$scope.talent[i].regular = false;
					} else {
						$scope.talent[i].regular = true;
					}
					// remove talent if no longer selected
					if($scope.talent[i].regular === false && $scope.talent[i].requested === false){
						$scope.talent.splice(i, 1);
					}
					found = 1;
				}
			}

			// add talent if never found
			if(found === 0){
				$scope.talent.push(talent);
			}

		};
		$scope.updateRequestCreateTalent = function(talentId, talentName, email){
			// gen talent object
			var talent = {'talentId': talentId, 'name': talentName, 'email': email, 'booked': false, 'status': '', part: $scope.parts[talentId] || '', regular: false, requested: true};

			// check for existing item
			var found = 0;
			for(var i = 0; i < $scope.talent.length; ++i){
				if($scope.talent[i].talentId === talentId){
					// reset regular talent if set
					if($scope.talent[i].regular === true){
						$scope.talent[i].regular = false;
					}
					// set requested talent
					if($scope.talent[i].requested === true){
						$scope.talent[i].requested = false;
					} else {
						$scope.talent[i].requested = true;
					}
					// remove talent if no longer selected
					if($scope.talent[i].regular === false && $scope.talent[i].requested === false){
						$scope.talent.splice(i, 1);
					}
					found = 1;
				}
			}

			// add talent if never found
			if(found === 0){
				$scope.talent.push(talent);
			}

		};

		$scope.updateTalentStatus = function(key){

			// update project store
			$scope.update();
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
			$scope.update();
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
			$scope.update();
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
			$scope.update();
		};

		$scope.updateCreateClient = function(userId, displayName, email){
			// gen user object
			var user = {'userId': userId, 'name': displayName, 'email': email};

			// check for existing item
			var found = 0;
			for(var i = 0; i < $scope.client.length; ++i){
				if($scope.client[i].userId === userId){
					$scope.client.splice(i, 1);
					found = 1;
				}
			}

			if(found === 0){
				$scope.client.push(user);
			}

		};

		$scope.toggleBooked = function(key){
			$scope.project.talent[key].booked = !$scope.project.talent[key].booked;

			// update project store
			$scope.update();
		};

		// save audition note item
		$scope.saveAudtionNote = function(key){

			var now = new Date();
			var item = {date: now.toJSON(), userid: Authentication.user._id, username: Authentication.user.displayName, item: this.auditions[key].discussion};

			$scope.project.auditions[key].discussion.push(item);

			// update project store
			$scope.update();
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
			$scope.update();
		};

		// save audition note item
		$scope.saveScriptNote = function(key){

			var now = new Date();
			var item = {date: now.toJSON(), userid: Authentication.user._id, username: Authentication.user.displayName, item: this.scripts[key].discussion};

			$scope.project.scripts[key].discussion.push(item);

			// update project store
			$scope.update();
		};

		// Create new Project
		$scope.create = function() {
			// Create new Project object
			var project = new Projects ({
				title: $scope.newProject.title,
				estimatedCompletionDate: $scope.newProject.estimatedCompletionDate,
				estimatedTime: $scope.newProject.estimatedTime,
				actualTime: $scope.newProject.actualTime,
				status: 'In Progress',
				sounders: $scope.newProject.sounders,
				scripts: $scope.scripts,
				referenceFiles: $scope.referenceFiles,
				description: $scope.newProject.description,
				client: $scope.client,
				talent: $scope.talent,
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
			var redirect = typeof redirect === 'undefined' ? true : redirect;


			project.$update(function() {
				if(redirect === true){
					$location.path('projects/' + project._id);
				}
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// client update

		// update audition rating
		$scope.updateRating = function(path, redirect){
			// determine if update should result in user redirect
			var redirect = typeof redirect === 'undefined' ? true : redirect;

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
			$scope.update(redirect);
		};

		// update audition rating
		$scope.updateFavorite = function(path, redirect){
			// determine if update should result in user redirect
			var redirect = typeof redirect === 'undefined' ? true : redirect;

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
			$scope.update(redirect);
		};

		// update phase options
		$scope.updateStatus = function(key){

			// send update email
			$scope.gatherToAddresses('updateStatus');
		    $scope.email.subject = $scope.project.title + ' Phase ' + $scope.project.phases[key].name[0].toUpperCase() + $scope.project.phases[key].name.slice(1) + ' Status Update';
		    $scope.email.message += 'Project: ' + $scope.project.title + '<br>';
		    $scope.email.message += 'Phase: ' + $scope.project.phases[key].name[0].toUpperCase() + $scope.project.phases[key].name.slice(1)  + '<br>';
		    $scope.email.message += 'Status: ' + $scope.project.phases[key].status[0].toUpperCase() + $scope.project.phases[key].status.slice(1) + '<br>';
		    $scope.email.message += 'Start Date: ' + $scope.project.phases[key].startDate + '<br>';
		    $scope.email.message += 'End Date: ' + $scope.project.phases[key].endDate + '<br>' + '<br>';
		    $scope.email.message += 'Added by: ' + Authentication.user.displayName + '<br>';
		    $scope.email.message += '<br>' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '<br>';

		    $http.post('/projects/sendemail', {
				email: $scope.email
			});

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
			$scope.update();
		};

		$scope.updateProjectStatus = function(){

			$scope.gatherToAddresses('updateStatus');
		    $scope.email.subject = $scope.project.title + ' Status Update';
		    $scope.email.message += 'Project: ' + $scope.project.title + '<br>';
		    $scope.email.message += 'Status: ' + $scope.project.status.toUpperCase() + $scope.project.status.slice(1) + '<br>';
		    $scope.email.message += 'Added by: ' + Authentication.user.displayName + '<br>';
		    $scope.email.message += '<br>' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '<br>';

		    $http.post('/projects/sendemail', {
				email: $scope.email
			});

			// // send client email if project status is set to finished
			// if($scope.project.status === 'Complete'){
			// 	// build main clients list
			// 	for(var i = 0; i < $scope.project.client.length; ++i){
			// 		$scope.selectedMainClients[i] = $scope.project.client[i].userId;
			// 	}
			// 	$scope.sendClientEmail('closing');
			// }

			// update project store
			$scope.update();
		};
		// Find a list of Projects
		$scope.find = function() {
			$scope.projects = Projects.query();
		};

		// find single project by id
		$scope.findOneById = function(id) {

			$stateParams.projectId = id;

			$scope.findOne();

		};

		// Find existing Project
		$scope.findOne = function() {
			$scope.project = Projects.get({ 
				projectId: $stateParams.projectId
			});
		};

		// load project in view
		$scope.loadProject = function(){
			this.findOne();

			// enable audio load after watch
			$scope.loadAudio = 0;
		};

		// load audio files into player after project object has finished loading

		$scope.$watch('newProject.estimatedCompletionDate', function(val){
			var now = new Date();

			if($scope.newProject.estimatedCompletionDate < now){
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
		}

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

		$scope.stopAudio = function(){
			if(typeof $scope.audio[$scope.lastAudioID] === 'object'){
				$scope.audio[$scope.lastAudioID].stop();
			}
		};

		$scope.playAudio = function(key, filename){
			// disable previous
			if(typeof $scope.audio[$scope.lastAudioID] === 'object'){
				if(key !== $scope.lastAudioID){
					$scope.audio[$scope.lastAudioID].stop();
				}
			}

			// assign file name
			var fileName = '/res/auditions/' + $scope.project._id + '/' + filename;

			if(typeof $scope.audio[key] === 'object'){
				if($scope.audio[key].id !== fileName){
					$scope.audio[key] = ngAudio.load(fileName);
					$scope.audio[key].unbind();
				}
			} else {
				$scope.audio[key] = ngAudio.load(fileName);
				$scope.audio[key].unbind();
			}
			//$scope.audio[key].play();
			$scope.lastAudioID = key;
		};

		// save discussion item
		$scope.saveDiscussion = function(){
			var now = new Date();
			var item = {date: now.toJSON(), userid: Authentication.user._id, username: Authentication.user.displayName, item: this.discussion, deleted: false};

			$scope.project.discussion.push(item);

			// send update email
			$scope.gatherToAddresses('saveDiscussion');
		    $scope.email.subject = $scope.project.title + ' discussion added';
		    $scope.email.message = 'Discussion Item: ' + this.discussion + '<br>';
		    $scope.email.message += 'Project: ' + $scope.project.title + '<br>';
		    $scope.email.message += 'Added by: ' + Authentication.user.displayName + '<br>';
		    $scope.email.message += '<br>' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '<br>';

			$scope.discussion = '';

		    $http.post('/projects/sendemail', {
				email: $scope.email
			});
			// update project store
			$scope.update();
		};

		$scope.deleteDiscussion = function(key){
			// reverse selction id 
			var selVal = ($scope.project.discussion.length - 1) - key;

			// apply to reverse index
			$scope.project.discussion[selVal].deleted = true;

			// update project store
			$scope.update();
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
				$scope.update();
				
			}
		};

		$scope.delTempScript = function(idx){
			var file = '/res/scripts/temp/' + $scope.scripts[idx].file.name;

			$http.post('/projects/deletefile', {
		        fileLocation: file
		    });

		    $scope.scripts.splice(idx, 1);
		};

		$scope.uploadScript = function($files) {
	    //$files: an array of files selected, each file has name, size, and type.

	    for (var i = 0; i < $files.length; i++) {
	      var file = $files[i];

	      $scope.upload = $upload.upload({
	        url: 'projects/uploads/script', //upload.php script, node.js route, or servlet url 
	        //method: 'POST' or 'PUT', 
	        //headers: {'header-key': 'header-value'}, 
	        //withCredentials: true, 
	        data: {project: $scope.project},
	        file: file, // or list of files ($files) for html5 only 
	        //fileName: 'doc.jpg' or ['1.jpg', '2.jpg', ...] // to modify the name of the file(s) 
	        // customize file formData name ('Content-Desposition'), server side file variable name.  
	        //fileFormDataName: myFile, //or a list of names for multiple files (html5). Default is 'file'  
	        // customize how data is added to formData. See #40#issuecomment-28612000 for sample code 
	        //formDataAppender: function(formData, key, val){} 
	      }).progress(function(evt) {
	        $scope.uploadStatus = i + ' of ' + $files.length + ' files uploaded';
	      	$scope.uploadfile = evt.config.file.name;
	        $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
	      }).success(function(data, status, headers, config) {
	        // file is uploaded successfully 
	        //console.log(data)
	        // update project store
			$scope.project = angular.extend($scope.project, data);
	      });
	      //.error(...) 
	      //.then(success, error, progress);  
	      // access or attach event listeners to the underlying XMLHttpRequest. 
	      //.xhr(function(xhr){xhr.upload.addEventListener(...)}) 
    	 }
	    /* alternative way of uploading, send the file binary with the file's content-type.
	       Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed. 
	       It could also be used to monitor the progress of a normal http post/put request with large data*/
	    // $scope.upload = $upload.http({...})  see 88#issuecomment-31366487 for sample code. 
	  	};

	  	$scope.uploadTempScript = function($files) {
	    //$files: an array of files selected, each file has name, size, and type. 
	    for (var i = 0; i < $files.length; i++) {
	      var file = $files[i];

	      $scope.upload = $upload.upload({
	        url: 'projects/uploads/script/temp', //upload.php script, node.js route, or servlet url 
	        data: {project: $scope.project},
	        file: file, // or list of files ($files) for html5 only 
	      }).progress(function(evt) {
	        $scope.uploadStatus = i + ' of ' + $files.length + ' files uploaded';
	      	$scope.uploadfile = evt.config.file.name;
	        $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
	      }).success(function(data, status, headers, config) {
	        // file is uploaded successfully 
	        //console.log(data);
	        $scope.scripts.push(data[0]);
	      });
    	 }
	  	};

	  	// set published status
	  	$scope.updatePublished = function(key){
	  		if(this.project.auditions[key].published === false){
	  			$scope.project.auditions[key].published = true;
	  		} else {
	  			$scope.project.auditions[key].published = false;
	  		}

	  		// update project store
			$scope.update();
	  	};

		$scope.uploadReferenceFile = function($files) {
	    //$files: an array of files selected, each file has name, size, and type.

	    for (var i = 0; i < $files.length; i++) {
	      var file = $files[i];

	      $scope.upload = $upload.upload({
	        url: 'projects/uploads/referenceFile', //upload.php script, node.js route, or servlet url 
	        data: {project: $scope.project},
	        file: file, // or list of files ($files) for html5 only 
	      }).progress(function(evt) {
	        $scope.uploadStatus = i + ' of ' + $files.length + ' files uploaded';
	      	$scope.uploadfile = evt.config.file.name;
	        $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
	      }).success(function(data, status, headers, config) {
			$scope.project = angular.extend($scope.project, data);
	      });
    	 }
	  	};

	  	$scope.uploadTempReferenceFile = function($files) {
		    //$files: an array of files selected, each file has name, size, and type. 
		    for (var i = 0; i < $files.length; i++) {
		      var file = $files[i];

			    $scope.upload = $upload.upload({
			        url: 'projects/uploads/referenceFile/temp', //upload.php script, node.js route, or servlet url 
			        data: {project: $scope.project},
			        file: file, // or list of files ($files) for html5 only 
			    }).progress(function(evt) {
			        $scope.uploadStatus = i + ' of ' + $files.length + ' files uploaded';
			      	$scope.uploadfile = evt.config.file.name;
			        $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
			    }).success(function(data, status, headers, config) {
			        // file is uploaded successfully 
			        //console.log(data);
			        $scope.referenceFiles.push(data[0]);
			    });
	    	}
	  	};

	  	$scope.delTempReferenceFile = function(idx){
			var file = '/res/referenceFiles/temp/' + $scope.referenceFiles[idx].file.name;

			$http.post('/projects/deletefile', {
		        fileLocation: file
		    });

		    $scope.referenceFiles.splice(idx, 1);
		};

	  	$scope.delReferenceFile = function(idx){
			// verify user wants to delete file
			if (confirm('Are you sure?')) {

				var file = '/res/referenceFiles/' + $scope.project._id + '/' + $scope.project.referenceFiles[idx].file.name;

				$http.post('/projects/deletefile', {
			        fileLocation: file
			    });

				$scope.project.referenceFiles.splice(idx, 1);

				// update project store
				$scope.update();
				
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
				$scope.update();
				
			}
		};

		$scope.uploadAudition = function($files) {

			// tell audio system to reload files
			$scope.loadAudio = 0;

		    //$files: an array of files selected, each file has name, size, and type. 
		    for (var i = 0; i < $files.length; i++) {
		      var file = $files[i];
		      $scope.upload = $upload.upload({
		        url: 'projects/uploads/audition', //upload.php script, node.js route, or servlet url 
		        data: {project: $scope.project},
		        file: file, // or list of files ($files) for html5 only 
		      }).progress(function(evt) {
		      	$scope.uploadStatus = i + ' of ' + $files.length + ' files uploaded';
		      	$scope.uploadfile = evt.config.file.name;
		        $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
		      }).success(function(data, status, headers, config) {
		        // file is uploaded successfully 
		        $scope.project = angular.extend($scope.project, data);
		      });
		    }
		  };

		}
]);