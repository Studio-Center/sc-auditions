'use strict';

// Tools controller
angular.module('tools').controller('ToolsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Tools', 'Talents', '$http', 'Socket', 'Projects', '$upload',
	function($scope, $stateParams, $location, Authentication, Tools, Talents, $http, Socket, Projects, $upload ) {
		$scope.authentication = Authentication;

		// scope variables
		$scope.rejFiles = [];
		$scope.files = [];
		$scope.emailClients = [];
		$scope.talents = [];
		$scope.email = {
						all: '',
						subject: '',
						body: ''
					};

		// call list vals
		$scope.talentStatus = ['Cast', 'Emailed', 'Scheduled', 'Message left', 'Out', 'Received needs to be posted', 'Posted', 'Not Posted (Bad Read)'];
		$scope.callTalents = [];
		$scope.messagedTalents = [];
		$scope.alreadyScheduledTalents = [];
		// delete projects vals
		$scope.selectAll = '';
		$scope.projects = [];
		$scope.projectsList = [];

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
			for(var i = 0; i < $scope.talents.length; ++i){
				if($scope.talents[i]._id == id){
					return $scope.talents[i].name + ' ' + $scope.talents[i].lastName;
				}
			}
		};
		$scope.removeSelectedTalents = function(){
			var idx;
			for(var i = 0; i < $scope.verifySelected.length; ++i){
				for(var j = 0; j < $scope.emailClients.length; ++j){
					if($scope.verifySelected[i] == $scope.emailClients[j]){
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
					});
				} else {
					alert('Email subject and message cannot be empty!');
				}
			}
		};
		$scope.$watch('selected', function(verifySelected){
		    // reset to nothing, could use `splice` to preserve non-angular references
		    $scope.verifySelected = [];

		    if( ! verifySelected ){
		        // sometimes selected is null or undefined
		        return;
		    }

		    // here's the magic
		    angular.forEach(verifySelected, function(val){
		        $scope.verifySelected.push( val );
		    });
		});

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
		    }

		});
		// gather list of talents to call
		$scope.talentLookupData = function(id){
			for(var i = 0; i < $scope.talents.length; ++i){
				console.log($scope.talents[i]);
				if($scope.talents[i]._id == id){
					return $scope.talents[i];
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
		$scope.emailCallListTalent = function(talent, projectId){

			$http.post('/projects/sendTalentEmailById', {
		        talent: talent,
		        projectId: projectId
		    }).
			success(function(data, status, headers, config) {
				alert('Selected talent has been emailed.');

				$scope.gatherTalentsToCall();
				$scope.gatherTalentsMessagesLeft();
				$scope.gatherTalentsAlreadyScheduled();
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
			});

		};

		// delete projects methods
		$scope.findProjects = function(){
			$scope.projects = Projects.query();
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
			var i;
			if($scope.projectsList.length > 0){
				var con = confirm('Are you sure?');
				if(con === true){
					var concon = confirm('Are you sure you\'re sure?');
					if(concon === true){
						for(i = 0; i < $scope.projectsList.length; ++i){
							performDeleteProject(i);
						}
					}
				}
			} else {
				alert('You must first select some projects!');
			}
		};

		var performDeleteProject = function(i){
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

			for (var i = 0; i < $files.length; i++) {
				var file = $files[i];

				performUploadBackupFile(file, i, $files);
			}
		};

		var performUploadBackupFile = function(file, i, $files){
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

			for (var i = 0; i < $files.length; i++) {
				var file = $files[i];

				performUploadTalentFile(file, i, $files);
			}
		};

		var performUploadTalentFile = function(file, i, $files){
			$scope.upload = $upload.upload({
			    url: 'tools/uploadTalentCSV', //upload.php script, node.js route, or servlet url 
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

	}
]);