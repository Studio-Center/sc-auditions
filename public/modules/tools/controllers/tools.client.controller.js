'use strict';

// Tools controller
angular.module('tools').controller('ToolsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Tools', 'Talents', '$http', 'Socket', 'Projects', '$upload',
	function($scope, $stateParams, $location, Authentication, Tools, Talents, $http, Socket, Projects, $upload ) {
		$scope.authentication = Authentication;

		// scope variables
		$scope.projectsTotalCnt = 0;
		$scope.project = {};
		$scope.failed = [];
		$scope.alerts = [];
		$scope.verifySelected = [];
		$scope.rejFiles = [];
		$scope.files = [];
		$scope.emailClients = [];
		$scope.talents = [];
		$scope.email = {
						all: '',
						subject: '',
						body: ''
					};
		$scope.locations = ['Offsite', 'Las Vegas', 'New York', 'Richmond', 'Santa Monica', 'Virginia Beach', 'Washington DC'];

		// call list vals
		$scope.talentStatus = ['Cast', 'Emailed', 'Scheduled', 'Message left', 'Out', 'Received needs to be posted', 'Posted', 'Not Posted (Bad Read)'];
		$scope.callTalents = [];
		$scope.messagedTalents = [];
		$scope.alreadyScheduledTalents = [];
		$scope.talentNote = [];
		// delete projects vals
		$scope.selectAll = '';
		$scope.projects = [];
		$scope.projectsList = [];
		// filter vars
		$scope.predicate = '';
		$scope.reverse = '';
		$scope.searchText = {};

		// spreadsheet processing
		$scope.google = {
			spreadsheetkey: '',
			username: '',
			password: ''
		};

		// clear mem leaks on controller destroy
		$scope.$on('$destroy', function (event) {
        Socket.removeAllListeners();
        // or something like
        // socket.removeListener(this);
    });

		$scope.predicate = '';

		$scope.updatePred = function(pred){
			$scope.predicate = pred;
		};

		// alerts
		$scope.closeAlert = function(index) {
		    $scope.alerts.splice(index, 1);
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


		// toggle checkbox options
		$scope.toggleEmailer = function(id,talent){
			  var idx = $scope.emailClients.indexOf(id);
			  if (idx > -1){
			    $scope.emailClients.splice(idx, 1);
			  }else{
			    $scope.emailClients.push(id);
			}
		};
		$scope.checkToggleEmail = function(talentId){
			var idx = $scope.emailClients.indexOf(talentId);
			if (idx > -1){
				return true;
			} else {
				return false;
			}
		};
		$scope.gatherTalents = function(){
			$scope.talents = Talents.query();
		};
		$scope.talentLookup = function(id){

			var talents = $scope.talents,
					limit = talents.length,
					i = 0;

			for(i = 0; i < limit; ++i){
				if(talents[i]._id === id){
					return talents[i].name + ' ' + talents[i].lastName;
				}
			}
		};

		$scope.toggleEmailTalentList = function(talent){
			var idx = $scope.verifySelected.indexOf(talent);
			if (idx > -1){
			    $scope.verifySelected.splice(idx, 1);
			}else{
			    $scope.verifySelected.push(talent);
			}
		};
		$scope.emailTalentListChk = function(talent){
			for(var i = 0; i < $scope.verifySelected.length; ++i){
				if(String($scope.verifySelected[i]) === String(talent)){
					return true;
				}
			}
		};

		$scope.removeSelectedTalents = function(){
			var idx,
					i = 0,
					j = 0;

			for(i = 0; i < $scope.verifySelected.length; ++i){
				for(j = 0; j < $scope.emailClients.length; ++j){
					if(String($scope.verifySelected[i]) === String($scope.emailClients[j])){
						idx = $scope.emailClients.indexOf($scope.emailClients[j]);
						if (idx > -1){
						    $scope.emailClients.splice(idx, 1);
						}
						idx = $scope.verifySelected.indexOf($scope.emailClients[j]);
						if (idx > -1){
						    $scope.verifySelected.splice(idx, 1);
						}
					}
				}
			}
		};
		$scope.sendTalentEmails = function(){
			var conf = confirm('Are you sure you would like to send the entered email information to your selected talent?');
			if(conf === true){
				if($scope.email.subject !== '' && $scope.email.body !== ''){
					// pass entered values to the server
					$http.post('/tools/sendtalentemails', {
				        email: $scope.email,
				        emailClients: $scope.emailClients
				    }).
					success(function(data, status, headers, config) {
						alert('Talent has been emailed!');
					}).
					error(function(data, status, headers, config){
						alert('An error occured while attempting to email selected clients. ' + String(data.message));
					});

				} else {
					alert('Email subject and message cannot be empty!');
				}
			}
		};

		// call list methods
		Socket.on('callListUpdate', function(talentsData) {

		    switch(talentsData.filter){
		    	case 'Cast':
		    		$scope.callProjects = talentsData.talents;
		    	break;
		    	case 'Message left':
		    		$scope.messagedTalents = talentsData.talents;
		    	break;
		    	case 'Scheduled':
		    		$scope.alreadyScheduledTalents = talentsData.talents;
		    	break;
		    	case 'Emailed':
		    		$scope.emailedTalents = talentsData.talents;
		    	break;
		    	default:
		    		$scope.gatherTalentsToCall();
					$scope.gatherTalentsMessagesLeft();
					$scope.gatherTalentsAlreadyScheduled();
					$scope.gatherEmailedTalent();
		    	break;
		    }

		 //    $scope.gatherTalentsToCall();
			// $scope.gatherTalentsMessagesLeft();
			// $scope.gatherTalentsAlreadyScheduled();
			// $scope.gatherEmailedTalent();

		});
		// gather list of talents to call
		$scope.talentLookupData = function(id){

			var talents = $scope.talents,
					limit = talents.length,
					i = 0;

			for(i = 0; i < limit; ++i){
				if(String(talents[i]._id) === String(id)){
					return talents[i];
				}
			}
		};
		$scope.gatherTalentsToCall = function(){

			$http.post('/tools/gatherTalentsToCall').
			success(function(data, status, headers, config) {
				$scope.callProjects = data;
			});

		};
		// gather talents
		$scope.gatherTalentsMessagesLeft = function(){

			$http.post('/tools/gatherTalentsMessagesLeft').
			success(function(data, status, headers, config) {
				$scope.messagedTalents = data;
			});

		};
		$scope.gatherTalentsAlreadyScheduled = function(){

			$http.post('/tools/gatherTalentsAlreadyScheduled').
			success(function(data, status, headers, config) {
				$scope.alreadyScheduledTalents = data;
			});

		};
		$scope.gatherEmailedTalent = function(){

			$http.post('/tools/gatherEmailedTalent').
			success(function(data, status, headers, config) {
				$scope.emailedTalents = data;
			});

		};
		$scope.emailCallListTalent = function(talent, projectId){

			$http.post('/projects/sendTalentEmailById', {
		        talent: talent,
		        projectId: projectId,
		        override: true
		    }).
			success(function(data, status, headers, config) {
				alert('Selected talent has been emailed.');

				$scope.gatherTalentsToCall();
				$scope.gatherTalentsMessagesLeft();
				$scope.gatherTalentsAlreadyScheduled();
				$scope.gatherEmailedTalent();
			});

		};
		$scope.updateStatus = function(talentId, projectId, status){

			$http.post('/projects/updateSingleTalentStatus', {
		        talentId: talentId,
		        talentStatus: status,
		        projectId: projectId
		    }).
			success(function(data, status, headers, config) {
				$scope.gatherTalentsToCall();
				$scope.gatherTalentsMessagesLeft();
				$scope.gatherTalentsAlreadyScheduled();
				$scope.gatherEmailedTalent();
			});

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

			return filterObj;
		};

		// delete projects methods
		$scope.findProjects = function(){
			$scope.projects = Projects.query();
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
			});

		};

		$scope.toggleProject = function(id){
			  var idx = $scope.projectsList.indexOf(id);
			  if (idx > -1){
			    $scope.projectsList.splice(idx, 1);
			  }else{
			    $scope.projectsList.push(id);
			}
		};
		$scope.checkToggleProject = function(projectId){
			var idx = $scope.projectsList.indexOf(projectId);
			if (idx > -1){
				return true;
			} else {
				return false;
			}
		};
		$scope.selectAllProjects = function(){
			// reset all selected projects
			$scope.projectsList = [];

			if($scope.selectAll === true){
				for(var i = 0; i < $scope.projects.length; ++i){
					$scope.projectsList.push($scope.projects[i]._id);
				}
			}

		};
		$scope.deleteProjects = function(){
			var i = 0,
					limit = $scope.projectsList.length;
			if(limit > 0){
				var con = confirm('Are you sure?');
				if(con === true){
					var concon = confirm('Are you sure you\'re sure?');
					if(concon === true){
						for(i = 0; i < limit; ++i){
							$scope.performDeleteProject(i);
						}
					}
				}
			} else {
				alert('You must first select some projects!');
			}
		};

		$scope.performDeleteProject = function(i){
			$http.post('/projects/deleteProjectById', {
		        projectId: $scope.projectsList[i]
		    }).
			success(function(data, status, headers, config) {
				$scope.projects = Projects.query();
			});
		};

		// backup projects methods
		$scope.backupProjects = function(){
			if($scope.projectsList.length > 0){
				var con = confirm('Are you sure?');
				if(con === true){

					$http.post('/projects/backupProjectsById', {
				        projectList: $scope.projectsList
				    }).
					success(function(data, status, headers, config) {
						// download backup file on completion
						setTimeout(
							function(){
								var link = document.createElement('a');
							    link.download = data.zippedFilename;
							    link.href = 'res/archives/' + encodeURIComponent(data.zippedFilename);
							    link.click();
							},
						    1000
						);
					});
				}
			} else {
				alert('You must first select some projects!');
			}
		};
		$scope.uploadBackupFile = function($files){
			//$files: an array of files selected, each file has name, size, and type.
			var limit = $files.length,
					i = 0;

			for (i = 0; i < limit; i++) {
				var file = $files[i];

				$scope.performUploadBackupFile(file, i, $files);
			}
		};

		$scope.performUploadBackupFile = function(file, i, $files){
			$scope.upload = $upload.upload({
			    url: 'projects/uploadBackup', //upload.php script, node.js route, or servlet url
			    data: {},
			    file: file, // or list of files ($files) for html5 only
			}).progress(function(evt) {
			    $scope.uploadStatus = i + ' of ' + $files.length + ' files uploaded';
			  	$scope.uploadfile = evt.config.file.name;
			    $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
			}).success(function(data, status, headers, config) {
			    // file is uploaded successfully
			});
		};

		$scope.uploadTalentFile = function($files){
			//$files: an array of files selected, each file has name, size, and type.
			var limit = $files.length,
					i = 0;

			for (i = 0; i < limit; i++) {
				var file = $files[i];

				$scope.performUploadTalentFile(file, i, $files);
			}
		};

		$scope.performUploadTalentFile = function(file, i, $files){
			$scope.upload = $upload.upload({
			    url: 'tools/uploadTalentCSV', //upload.php script, node.js route, or servlet url
			    data: {},
			    file: file, // or list of files ($files) for html5 only
			}).progress(function(evt) {
			    $scope.uploadStatus = i + ' of ' + $files.length + ' files uploaded';
			  	$scope.uploadfile = evt.config.file.name;
			    $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
			}).success(function(data, status, headers, config) {
				$scope.failed = data.failed;
			    $scope.alerts.push({type: data.status, msg: 'Updated talents ' + data.updatedTalents + ' - New talents ' + data.newTalents + ' - Failed talents ' + data.failed.length});
			});
		};

		$scope.processGoogleSheet = function(){

			$scope.alerts = [];

			// verify all three required fields are populated
			if($scope.google.spreadsheetkey !== ''){

				$http.post('/tools/processGoogleSheet', {
			        google: $scope.google
			    }).
				success(function(data, status, headers, config) {
					$scope.alerts.push({type: 'success', msg: 'All talents have been imported into the database.'});
				});

			} else {

				$scope.alerts.push({type: 'danger', msg: 'Pelase make sure that you have populated the field!'});

			}

		};

		$scope.saveTalentNote = function(talentId, projectId){

			// new note
			var newNote = $scope.talentNote[talentId][projectId];

			$http.post('/projects/updateTalentNote', {
		        talentId: talentId,
		        projectId: projectId,
		        note: newNote
		    }).
			success(function(data, status, headers, config) {
				//$scope.alerts.push({type: 'success', msg: 'All talents have been imported into the database.'});
			});

		};

		// new project Submissions
		$scope.findNewProjects = function() {
			$http.post('/tools/listNewprojects', {}).
			success(function(data, status, headers, config) {
				$scope.newprojects = data;
			});
		};
		$scope.findNewProjectById = function() {
			$http.post('/tools/newprojectByID', {
				id: $stateParams.newprojectId
			}).
			success(function(data, status, headers, config) {
				$scope.newproject = data;
			});
		};

	}
]);
