'use strict';

// Projects controller
angular.module('projects').controller('ProjectsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Projects', '$upload',
	function($scope, $stateParams, $location, Authentication, Projects, $upload ) {
		$scope.authentication = Authentication;

		// static project options
		$scope.statusOpts = ['Not started', 'Open', 'Client Completed', 'Completed', 'Suspended'];
		$scope.priorityOpts = ['None', 'Very low', 'Low', 'Medium', 'High', 'Very high'];

		// Create new Project
		$scope.create = function() {
			// Create new Project object
			var project = new Projects ({
				title: this.title,
				estimatedCompletionDate: this.estimatedCompletionDate,
				estimatedTime: this.estimatedTime,
				actualTime: this.actualTime,
				status: this.status,
				priority: this.priority,
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
			var project = $scope.project ;

			project.$update(function() {
				$location.path('projects/' + project._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
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

		$scope.onFileSelect = function($files) {
	    //$files: an array of files selected, each file has name, size, and type. 
	    for (var i = 0; i < $files.length; i++) {
	      var file = $files[i];
	      $scope.upload = $upload.upload({
	        url: 'projects/uploads', //upload.php script, node.js route, or servlet url 
	        //method: 'POST' or 'PUT', 
	        //headers: {'header-key': 'header-value'}, 
	        //withCredentials: true, 
	        data: {myObj: $scope.myModelObj},
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

	}
]);