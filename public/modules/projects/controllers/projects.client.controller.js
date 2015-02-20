'use strict';

// Projects controller
angular.module('projects').controller('ProjectsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Projects', '$upload', 'ngAudio', '$http',
	function($scope, $stateParams, $location, Authentication, Projects, $upload, ngAudio, $http ) {
		$scope.authentication = Authentication;

		$scope.max = 10;
		$scope.isReadonly = false;

		// static project options
		$scope.statusOpts = ['In Progress', 'On Hold', 'Booked', 'Canceled', 'ReAuditioned'];
		$scope.priorityOpts = ['None', 'Very low', 'Low', 'Medium', 'High', 'Very high'];
		$scope.phaseStatusOpts = ['in progress','open','complete','suspended'];
		$scope.loadAudio = 0;
		$scope.audio = Array;

		// update group checkbox selectors
		$scope.checkClientUsers = function(userId){
			for(var i = 0; i < $scope.project.client.length; ++i){
				if($scope.project.client[i].userId === userId){
					return true
				}
			}
		};
		$scope.checkTeam = function(userId){
			for(var i = 0; i < $scope.project.team.length; ++i){
				if($scope.project.team[i].userId === userId){
					return true
				}
			}
		};
		$scope.checkTalent = function(talentId){
			for(var i = 0; i < $scope.project.talent.length; ++i){
				if($scope.project.talent[i].talentId === talentId){
					return true
				}
			}
		};

		$scope.updateTalent = function(talentId, talentName, email){
			// gen talent object
			var talent = {'talentId': talentId, 'name': talentName, 'email': email, 'booked': false};

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
			}

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

			// add talent if never found
			if(found === 0){
				$scope.project.team.push(user);
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
			}

			// update project store
			$scope.update();
		};

		$scope.toggleBooked = function(key){
			$scope.project.talent[key].booked = !$scope.project.talent[key].booked;
			// update project store
			$scope.update();
		};

		// update auditions approval status
		$scope.audApprov = function(key){

			var now = new Date();

			if($scope.project.auditions[key].approved.selected === true){
				$scope.project.auditions[key].approved.selected = false;
				$scope.project.auditions[key].approved.by.userId = '';
				$scope.project.auditions[key].approved.by.name = '';
				$scope.project.auditions[key].approved.by.date = '';
			} else {
				$scope.project.auditions[key].approved.selected = true;
				$scope.project.auditions[key].approved.by.userId = Authentication.user._id;
				$scope.project.auditions[key].approved.by.name = Authentication.user.displayName;
				$scope.project.auditions[key].approved.by.date = now.toJSON();
			}

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
				title: this.title,
				estimatedCompletionDate: this.estimatedCompletionDate,
				estimatedTime: this.estimatedTime,
				actualTime: this.actualTime,
				status: this.status,
				scripts: this.scripts,
				description: this.description
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

		// update phase options
		$scope.updateStatus = function(idx){
			// update project store
			$scope.update();
		};
		$scope.updateStartDate = function(idx){
			// update project store
			$scope.update();
		};
		$scope.updateEndDate = function(idx){
			// update project store
			$scope.update();
		};

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
			$scope.loadAudio = 1;
		};

		// load audio files into player after project object has finished loading
		$scope.$watch('project.auditions', function(val){
			if($scope.loadAudio === 1){
				$scope.loadAudioPlayer();	
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

				// set progress bar values
				$scope.dynamic = perc;
			}

		});

		// load audio files
		$scope.loadAudioPlayer = function(){
			if(typeof $scope.project.auditions !== 'undefined'){
				for(var i = 0; i < $scope.project.auditions.length; ++i){
					if($scope.project.auditions[i]){
						if($scope.project.auditions[i].file.type === 'audio/mp3'){
							$scope.audio[i] = ngAudio.load('/res/auditions/'+$scope.project._id+'/'+$scope.project.auditions[i].file.name);
						}
					}
				}
			}
		};

		// save discussion item
		$scope.saveDiscussion = function(){
			var now = new Date();
			var item = {date: now.toJSON(), userid: Authentication.user._id, username: Authentication.user.displayName, item: this.discussion};

			$scope.project.discussion.push(item);

			// update project store
			$scope.update();
		};

		// update projects scripts list
		$scope.updateScripts = function(file){
			var script = {
							file: file, 
							discussion: [], 
							rating: '', 
							approved: 
									{
										by: 
										{
											userId: '',date: '', name: ''
										}
									}
							};
			
			// push new script object
			$scope.project.scripts.push(script);

			// update project store
			$scope.update();

		};

		$scope.delScript = function(idx){
			// verify user wants to delete file
			if (confirm('Are you sure?')) {

				var file = '/res/scripts/' + $scope.project._id + '/' + $scope.project.scripts[idx].file.name;

				var delFileCnt = $scope.project.deleteFiles.length;

				$scope.project.deleteFiles[delFileCnt] = file;

				$scope.project.scripts.splice(idx, 1);

				// update project store
				$scope.update();
				
			}
		};

		$scope.uploadScript = function($files) {
	    //$files: an array of files selected, each file has name, size, and type. 
	    for (var i = 0; i < $files.length; i++) {
	      var file = $files[i];
	      $scope.updateScripts(file);
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
	        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
	      }).success(function(data, status, headers, config) {
	        // file is uploaded successfully 
	        console.log(data);
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

	      // add scripts to submitted object
	      var script = {file: file};
		  // push new script object
		  $scope.scripts = [];
		  $scope.scripts.push(script);

	      $scope.upload = $upload.upload({
	        url: 'projects/uploads/script/temp', //upload.php script, node.js route, or servlet url 
	        data: {project: $scope.project},
	        file: file, // or list of files ($files) for html5 only 
	      }).progress(function(evt) {
	        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
	      }).success(function(data, status, headers, config) {
	        // file is uploaded successfully 
	        console.log(data);
	      });
    	 }
	  	};

	  	// update projects scripts list
		$scope.updateAuditions = function(file){
			var audition = {
							file: file, 
							discussion: [], 
							rating: '', 
							approved: 
									{
										by: 
										{
											userId: '',date: '', name: ''
										}
									}
							};
			
			// push new script object
			$scope.project.auditions.push(audition);

			// update project store
			$scope.update();

		};

		$scope.delAudition = function(idx){
			// verify user wants to delete file
			if (confirm('Are you sure?')) {

				var file = '/res/auditions/' + $scope.project._id + '/' + $scope.project.auditions[idx].file.name;

				var delFileCnt = $scope.project.deleteFiles.length;

				$scope.project.deleteFiles[delFileCnt] = file;

				$scope.project.auditions.splice(idx, 1);

				// update project store
				$scope.update();
				
			}
		};

		$scope.uploadAudition = function($files) {
		    //$files: an array of files selected, each file has name, size, and type. 
		    for (var i = 0; i < $files.length; i++) {
		      var file = $files[i];
		      $scope.updateAuditions(file);
		      $scope.upload = $upload.upload({
		        url: 'projects/uploads/audition', //upload.php script, node.js route, or servlet url 
		        data: {project: $scope.project},
		        file: file, // or list of files ($files) for html5 only 
		      }).progress(function(evt) {
		        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
		      }).success(function(data, status, headers, config) {
		        // file is uploaded successfully 
		        console.log(data);
		      });
		    }
		  };

		}
]);