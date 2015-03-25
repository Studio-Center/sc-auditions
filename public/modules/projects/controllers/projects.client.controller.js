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
		$scope.selCheckVal = 0;
		$scope.client = [];
		$scope.talent = [];
		$scope.showRename = 0;
		$scope.statusOpts = ['In Progress', 'On Hold', 'Booked', 'Canceled', 'ReAuditioned', 'Dead'];
		$scope.priorityOpts = ['None', 'Very low', 'Low', 'Medium', 'High', 'Very high'];
		$scope.phaseStatusOpts = ['in progress','open','complete','suspended'];
		$scope.talentStatus = ['Cast', 'Emailed', 'Scheduled', 'Message left', 'Out', 'Received needs to be posted', 'Posted', 'Not Posted (Bad Read)'];
		$scope.loadAudio = 0;
		$scope.audio = [];
		$scope.lastAudioID = 0;
		$scope.newLead = {};

		$scope.hoveringOver = function(value,key,object) {
	        $scope.overStar = value;
	        $scope.percent = 100 * (value / $scope.max);
	        $scope.selCheckVal = value;
      	};

		// verify users
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
			if(Authentication.user.roles[0] !== 'admin' && Authentication.user.roles[0] !== 'producer/auditions director'){
				$location.path('/projects');
			}
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
					to: [],
					subject: '',
					message: ''
				}
			};
			angular.extend($scope.project, emailObj);

			// send update email
			var toEmails = [];
			var emailCnt = 0;
			// regex validate email
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

			// attach current user to email chain
			toEmails[emailCnt] = Authentication.user.email;

			// attach client clients to email chain
			if(type !== 'updateTeam' && type !== 'updateClient' && type !== 'saveDiscussion'){
				for(var i = 0; i < $scope.project.clientClient.length; ++i){
					if($scope.project.clientClient[i].email !== '' && re.test($scope.project.clientClient[i].email)){
						emailCnt += 1;
						toEmails[emailCnt] = $scope.project.clientClient[i].email;
					}
				}
			}

			// attach clients to email chain
			if(type !== 'updateTeam' && type !== 'updateClient' && type !== 'saveDiscussion'){
				for(var j = 0; j < $scope.project.client.length; ++j){
					if($scope.project.client[j].email !== '' && re.test($scope.project.client[j].email)){
						emailCnt += 1;
						toEmails[emailCnt] = $scope.project.client[j].email;
					}
				}
			}

			// attach talents to email chain
			if(type !== 'updateTalent' && type !== 'updateTeam' && type !== 'updateClientClient' && type !== 'updateClient' && type !== 'saveAudtionNote' && type !== 'saveScriptNote' && type !== 'saveDiscussion'){
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
			$scope.project.email.to = toEmails;
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
						if($scope.project.talent[i].talentId === talentId){
							return true;
						}
					}
				}
			}
		};
		$scope.checkCreateTalent = function(talentId){
			for(var i = 0; i < $scope.talent.length; ++i){
				if($scope.talent[i].talentId === talentId){
					return true;
				}
			}
		};

		$scope.updateTalent = function(talentId, talentName, email){
			// gen talent object
			var talent = {'talentId': talentId, 'name': talentName, 'email': email, 'booked': false, 'status': ''};

			// check for existing item
			var found = 0;
			for(var i = 0; i < $scope.project.talent.length; ++i){
				if($scope.project.talent[i].talentId === talentId){
					$scope.project.talent.splice(i, 1);
					found = 1;
				}
			}

			// add talent if never found
			if(found === 0){
				$scope.project.talent.push(talent);

				// send update email
				$scope.gatherToAddresses('updateTalent');
			    $scope.project.email.subject = $scope.project.title + ' talent ' + talentName + ' added';
			    $scope.project.email.message = 'Talent: ' + talentName + '\n';
			    $scope.project.email.message += 'Project: ' + $scope.project.title + '\n';
			    $scope.project.email.message += 'Added by: ' + Authentication.user.displayName + '\n';
			    $scope.project.email.message += '\n' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '\n';
			}

			// update project store
			$scope.update();
		};
		$scope.updateCreateTalent = function(talentId, talentName, email){
			// gen talent object
			var talent = {'talentId': talentId, 'name': talentName, 'email': email, 'booked': false, 'status': ''};

			// check for existing item
			var found = 0;
			for(var i = 0; i < $scope.talent.length; ++i){
				if($scope.talent[i].talentId === talentId){
					$scope.talent.splice(i, 1);
					found = 1;
				}
			}

			// add talent if never found
			if(found === 0){
				$scope.talent.push(talent);
			}

		};

		$scope.updateTalentStatus = function(key){

			// send update email
			$scope.gatherToAddresses('updateTalent');
		    $scope.project.email.subject = $scope.project.title + ' talent ' + $scope.project.talent[key].name + ' status change';
		    $scope.project.email.message = 'Talent: ' + $scope.project.talent[key].name + '\n';
		    $scope.project.email.message += 'Status: ' + $scope.project.talent[key].status + '\n';
		    $scope.project.email.message += 'Project: ' + $scope.project.title + '\n';
		    $scope.project.email.message += 'Added by: ' + Authentication.user.displayName + '\n';
		    $scope.project.email.message += '\n' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '\n';

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

			// add team member if never found
			if(found === 0){
				$scope.project.team.push(user);

				// send update email
				$scope.gatherToAddresses('updateTeam');
			    $scope.project.email.subject = $scope.project.title + ' team member ' + displayName + ' added';
			    $scope.project.email.message = 'Member: ' + displayName + '\n';
			    $scope.project.email.message += 'Project: ' + $scope.project.title + '\n';
			    $scope.project.email.message += 'Added by: ' + Authentication.user.displayName + '\n';
			    $scope.project.email.message += '\n' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '\n';

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

			// add talent if never found
			if(found === 0){
				$scope.project.clientClient.push(user);

				// send update email
				$scope.gatherToAddresses('updateClientClient');
			    $scope.project.email.subject = $scope.project.title + ' client client ' + displayName + ' added';
			    $scope.project.email.message = 'Client Client: ' + displayName + '\n';
			    $scope.project.email.message += 'Project: ' + $scope.project.title + '\n';
			    $scope.project.email.message += 'Added by: ' + Authentication.user.displayName + '\n';
			    $scope.project.email.message += '\n' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '\n';
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

			// add talent if never found
			if(found === 0){
				$scope.project.client.push(user);
	
				// send update email
				$scope.gatherToAddresses('updateClient');
			    $scope.project.email.subject = $scope.project.title + ' client ' + displayName + ' added';
			    $scope.project.email.message = 'Client: ' + displayName + '\n';
			    $scope.project.email.message += 'Project: ' + $scope.project.title + '\n';
			    $scope.project.email.message += 'Added by: ' + Authentication.user.displayName + '\n';
			    $scope.project.email.message += '\n' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '\n';
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
	
			// send update email
			if($scope.project.talent[key].booked === true){
				$scope.gatherToAddresses('toggleBooked');
			    $scope.project.email.subject = $scope.project.title + ' talent booked ' + $scope.project.talent[key].name + ' added';
			    $scope.project.email.message = 'Talent: ' + $scope.project.talent[key].name + '\n';
			    $scope.project.email.message += 'Project: ' + $scope.project.title + '\n';
			    $scope.project.email.message += 'Added by: ' + Authentication.user.displayName + '\n';
			    $scope.project.email.message += '\n' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '\n';
			}

			// update project store
			$scope.update();
		};

		// save audition note item
		$scope.saveAudtionNote = function(key){

			var now = new Date();
			var item = {date: now.toJSON(), userid: Authentication.user._id, username: Authentication.user.displayName, item: this.auditions[key].discussion};

			$scope.project.auditions[key].discussion.push(item);

			// send update email
			$scope.gatherToAddresses('saveAudtionNote');
		    $scope.project.email.subject = $scope.project.title + ' audition note added';
		    $scope.project.email.message = 'Audition: ' + $scope.project.auditions[key].file.name + '\n';
		    $scope.project.email.message += 'Note: ' + this.auditions[key].discussion + '\n';
		    $scope.project.email.message += 'Project: ' + $scope.project.title + '\n';
		    $scope.project.email.message += 'Added by: ' + Authentication.user.displayName + '\n';
		    $scope.project.email.message += '\n' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '\n';

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

				// send update email
				$scope.gatherToAddresses('scrApprov');
			    $scope.project.email.subject = $scope.project.title + ' script ' + $scope.project.scripts[key].file.name + ' approved';
			    $scope.project.email.message = 'Project: ' + $scope.project.title + '\n';
			    $scope.project.email.message += 'File: ' + $scope.project.scripts[key].file.name + '\n';
			    $scope.project.email.message += 'Approved by: ' + Authentication.user.displayName + '\n';
			    $scope.project.email.message += '\n' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '\n';
			}

			// update project store
			$scope.update();
		};

		// save audition note item
		$scope.saveScriptNote = function(key){

			var now = new Date();
			var item = {date: now.toJSON(), userid: Authentication.user._id, username: Authentication.user.displayName, item: this.scripts[key].discussion};

			$scope.project.scripts[key].discussion.push(item);

			// send update email
			$scope.gatherToAddresses('saveScriptNote');
		    $scope.project.email.subject = $scope.project.title + ' script note added';
		    $scope.project.email.message = 'Audition: ' + $scope.project.scripts[key].file.name + '\n';
		    $scope.project.email.message += 'Note: ' + this.scripts[key].discussion + '\n';
		    $scope.project.email.message += 'Project: ' + $scope.project.title + '\n';
		    $scope.project.email.message += 'Added by: ' + Authentication.user.displayName + '\n';
		    $scope.project.email.message += '\n' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '\n';

			// update project store
			$scope.update();
		};

		// Create new Project
		$scope.create = function() {
			// Create new Project object
			var project = new Projects ({
				title: this.title,
				estimatedCompletionDate: this.estimatedCompletionDate,
				estimatedTime: this.estimatedTime,
				actualTime: this.actualTime,
				status: this.status,
				scripts: this.scripts,
				description: this.description,
				client: this.client,
				talent: this.talent
			});

			// Redirect after save
			project.$save(function(response) {
				$location.path('projects/' + response._id);

				// Clear form fields
				$scope.name = '';
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
		$scope.update = function() {
			var project = $scope.project;

			project.$update(function() {
				$location.path('projects/' + project._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// update audition rating
		$scope.updateRating = function(key){

			// console.log($scope.rate[key]);
			var rating = {
				userId: Authentication.user._id,
				value: $scope.selCheckVal
			};

			// walk through existing ratings
			for(var i = 0; i < $scope.project.auditions[key].rating.length; ++i){
				if($scope.project.auditions[key].rating[i].userId === Authentication.user._id){
					$scope.project.auditions[key].rating.splice(i,1);
				}
			}

			// push new rating
			$scope.project.auditions[key].rating.push(rating);

			// update project store
			$scope.update();
		};

		// update phase options
		$scope.updateStatus = function(key){

			// send update email
			$scope.gatherToAddresses('updateStatus');
		    $scope.project.email.subject = $scope.project.title + ' phase ' + $scope.project.phases[key].name + ' status update';
		    $scope.project.email.message += 'Project: ' + $scope.project.title + '\n';
		    $scope.project.email.message += 'Phase: ' + $scope.project.phases[key].name + '\n';
		    $scope.project.email.message += 'Status: ' + $scope.project.phases[key].status + '\n';
		    $scope.project.email.message += 'Start Date: ' + $scope.project.phases[key].startDate + '\n';
		    $scope.project.email.message += 'End Date: ' + $scope.project.phases[key].endDate + '\n' + '\n';
		    $scope.project.email.message += 'Added by: ' + Authentication.user.displayName + '\n';
		    $scope.project.email.message += '\n' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '\n';

		    if($scope.project.phases[key].status === 'complete'){
		    	var now = new Date();
		    	$scope.project.phases[key].endDate = now.toJSON();
		    }

			// update project store
			$scope.update();
		};

		$scope.updateProjectStatus = function(){

			$scope.gatherToAddresses('updateStatus');
		    $scope.project.email.subject = $scope.project.title + ' status update';
		    $scope.project.email.message += 'Project: ' + $scope.project.title + '\n';
		    $scope.project.email.message += 'Status: ' + $scope.project.status + '\n';
		    $scope.project.email.message += 'Added by: ' + Authentication.user.displayName + '\n';
		    $scope.project.email.message += '\n' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '\n';

			// update project store
			$scope.update();
		}
		// Find a list of Projects
		$scope.find = function() {
			$scope.projects = Projects.query();
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

		$scope.$watch('estimatedCompletionDate', function(val){
			var now = new Date();

			if($scope.estimatedCompletionDate < now){
				$scope.dateNotice = 'Date selected passed. Please select a future date and time!';
			} else {
				$scope.dateNotice = '';
			}
		});

		$scope.$watch('project', function(val){

			if(typeof $scope.project === 'object'){
				// load auditions
				$scope.$watch('project.auditions', function(val){

					if(typeof $scope.project.auditions === 'object'){
						// if($scope.loadAudio === 0){
						// 	$scope.loadAudioPlayer();	
						// 	$scope.loadAudio = 1;
						// }

						// load audition ratings
						for(var i = 0; i < $scope.project.auditions.length; ++i){
							// gather average value 
							$scope.ratingsAvg[i] = 0;
							// gather per user rating
							for(var j = 0; j < $scope.project.auditions[i].rating.length; ++j){
								if($scope.project.auditions[i].rating[j].userId === String(Authentication.user._id)){
									$scope.ratings[i] = $scope.project.auditions[i].rating[j].value;
								}
								$scope.ratingsAvg[i] += $scope.project.auditions[i].rating[j].value;
							}
							$scope.ratingsAvg[i] = $scope.ratingsAvg[i] / $scope.project.auditions[i].rating.length;
						}
					}
				});

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

						if(perc >= 100){
							$scope.project.status = 'complete';
						}

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
		}

		$scope.playAudio = function(key){
			// disable previous
			if(typeof $scope.audio[$scope.lastAudioID] === 'object'){
				if(key !== $scope.lastAudioID){
					$scope.audio[$scope.lastAudioID].stop();
				}
			}

			// assign file name
			var fileName = '/res/auditions/' + $scope.project._id + '/' + $scope.project.auditions[key].file.name;

			if(typeof $scope.audio[key] === 'object'){
				if($scope.audio[key].id !== fileName){
					$scope.audio[key] = ngAudio.load(fileName);
					$scope.audio[key].unbind();
				}
			} else {
				$scope.audio[key] = ngAudio.load(fileName);
				$scope.audio[key].unbind();
			}
			$scope.audio[key].play();
			$scope.lastAudioID = key;
		};

		// save discussion item
		$scope.saveDiscussion = function(){
			var now = new Date();
			var item = {date: now.toJSON(), userid: Authentication.user._id, username: Authentication.user.displayName, item: this.discussion, deleted: false};

			$scope.project.discussion.push(item);

			$scope.discussion = '';

			// send update email
			$scope.gatherToAddresses('saveDiscussion');
		    $scope.project.email.subject = $scope.project.title + ' discussion added';
		    $scope.project.email.message = 'Discussion Item: ' + this.discussion + '\n';
		    $scope.project.email.message += 'Project: ' + $scope.project.title + '\n';
		    $scope.project.email.message += 'Added by: ' + Authentication.user.displayName + '\n';
		    $scope.project.email.message += '\n' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '\n';

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

				// send update email
				$scope.gatherToAddresses('delScript');
			    $scope.project.email.subject = $scope.project.title + ' scripts deleted';
			    $scope.project.email.message = 'Project: ' + $scope.project.title + '\n';
			    $scope.project.email.message += 'File: ' + $scope.project.scripts[idx].file.name + '\n';
			    $scope.project.email.message += 'By: ' + Authentication.user.displayName + '\n';
			    $scope.project.email.message += '\n' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '\n';

				var delFileCnt = $scope.project.deleteFiles.length;

				$scope.project.deleteFiles[delFileCnt] = file;

				$scope.project.scripts.splice(idx, 1);

				// update project store
				$scope.update();
				
			}
		};

		$scope.uploadScript = function($files) {
	    //$files: an array of files selected, each file has name, size, and type.

		// send update email
		$scope.gatherToAddresses('uploadScript');
	    $scope.project.email.subject = $scope.project.title + ' script uploaded';
	    $scope.project.email.message = 'Project: ' + $scope.project.title + '\n';
	    for (var j = 0; j < $files.length; j++) {
	    	$scope.project.email.message += 'File: ' + $files[j].name + '\n';
		}
	    $scope.project.email.message += 'By: ' + Authentication.user.displayName + '\n';
	    $scope.project.email.message += '\n' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '\n';

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

		  $scope.scripts = [];

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
	        $scope.scripts = angular.extend($scope.scripts, data);
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

		// send update email
		$scope.gatherToAddresses('uploadReferenceFile');
	    $scope.project.email.subject = $scope.project.title + ' reference file uploaded';
	    $scope.project.email.message = 'Project: ' + $scope.project.title + '\n';
	    for (var j = 0; j < $files.length; j++) {
	    	$scope.project.email.message += 'File: ' + $files[j].name + '\n';
		}
	    $scope.project.email.message += 'By: ' + Authentication.user.displayName + '\n';
	    $scope.project.email.message += '\n' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '\n';

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

	  	$scope.delReferenceFile = function(idx){
			// verify user wants to delete file
			if (confirm('Are you sure?')) {

				var file = '/res/referenceFiles/' + $scope.project._id + '/' + $scope.project.referenceFiles[idx].file.name;

				// send update email
				$scope.gatherToAddresses('delReferenceFile');
			    $scope.project.email.subject = $scope.project.title + ' reference file deleted';
			    $scope.project.email.message = 'Project: ' + $scope.project.title + '\n';
			    $scope.project.email.message += 'File: ' + $scope.project.referenceFiles[idx].file.name + '\n';
			    $scope.project.email.message += 'By: ' + Authentication.user.displayName + '\n';
			    $scope.project.email.message += '\n' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '\n';

				var delFileCnt = $scope.project.deleteFiles.length;

				$scope.project.deleteFiles[delFileCnt] = file;

				$scope.project.auditions.splice(idx, 1);

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

				// send update email
				$scope.gatherToAddresses('delAudition');
			    $scope.project.email.subject = $scope.project.title + ' audition deleted';
			    $scope.project.email.message = 'Project: ' + $scope.project.title + '\n';
			    $scope.project.email.message += 'File: ' + $scope.project.auditions[idx].file.name + '\n';
			    $scope.project.email.message += 'By: ' + Authentication.user.displayName + '\n';
			    $scope.project.email.message += '\n' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '\n';

				var delFileCnt = $scope.project.deleteFiles.length;

				$scope.project.deleteFiles[delFileCnt] = file;

				$scope.project.auditions.splice(idx, 1);

				// update project store
				$scope.update();
				
			}
		};

		$scope.uploadAudition = function($files) {

			// tell audio system to reload files
			$scope.loadAudio = 0;
	     
			// send update email
			$scope.gatherToAddresses('uploadAudition');
		    $scope.project.email.subject = $scope.project.title + ' auditions uploaded';
		    $scope.project.email.message = 'Project: ' + $scope.project.title + '\n';
		    for (var j = 0; j < $files.length; j++) {
		    	$scope.project.email.message += 'File: ' + $files[j].name + '\n';
			}
		    $scope.project.email.message += 'By: ' + Authentication.user.displayName + '\n';
		    $scope.project.email.message += '\n' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '\n';

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