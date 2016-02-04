'use strict';

// Projects controller
angular.module('clients').controller('ClientsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Projects', '$upload', 'ngAudio', 'ngAudioGlobals', '$http', '$modal', '$rootScope', 'Socket', '$cookies', '$window',
	function($scope, $stateParams, $location, Authentication, Projects, $upload, ngAudio, ngAudioGlobals, $http, $modal, $rootScope, Socket, $cookies, $window ) {

    // controller vars
    $scope.projectsTotalCnt = 0;
		$scope.project = {};
    $scope.audio = '';
		$scope.lastAudioID = 0;
		$scope.audioStatus = 0;
    $scope.newLead = {};
    ngAudioGlobals.unlock = false;
    $scope.clientNotes = '';
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
    // filter vars
    $scope.predicate = '';
    // rating
		$scope.hide = 0;
		$scope.max = 5;
		$scope.isReadonly = false;
		$scope.ratings = [];
		$scope.ratingsAvg = [];
		// projects client portal
		$scope.selectedAuditions = [];
		$scope.hideList = [];

		// clear mem leaks on controller destroy
		$scope.$on('$destroy', function (event) {
        Socket.removeAllListeners();
    });

    $scope.updateNoRefresh = function(){

			// merge existing open project with updated project
			$http.post('/projects/updateNoRefresh', {
				project: $scope.project
			}).success(function(data, status, headers, config) {

				// update local project document
				$scope.project = angular.extend($scope.project, data);

				// remove update overlay
				$scope.processing = false;

			});

		};

    // Find a list of Projects
		$scope.find = function() {
			$scope.projects = Projects.query();
		};

    // Find existing Project
		$scope.findOne = function() {
      if($stateParams.projectId){
  			$scope.project = Projects.get({
  				projectId: $stateParams.projectId
  			});
      }
		};

    // referesh project on update
		$rootScope.$on('refreshProject',
			function(event, args) {
				$scope.findOneById(args);
			}
		);

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

    // new project form
		$scope.lead = function(){

				// Trigger validation flag.
		    $scope.submitted = true;

				$http.post('/projects/lead', {
	        firstName: $scope.newLead.firstName || '',
	        lastName: $scope.newLead.lastName || '',
	        company: $scope.newLead.company || '',
	        phone: $scope.newLead.phone || '',
	        email: $scope.newLead.email || '',
	        describe: $scope.newLead.describe || '',
	        scripts: $scope.newProject.scripts || ''
		    }).
				success(function(data, status, headers, config) {
        	$location.path('/clients/new-audition-form/thanks');
      	});

		};
		$scope.leadFormPop = function(){
			if(typeof Authentication.user === 'object'){
				$scope.newLead.firstName = Authentication.user.firstName || '';
        $scope.newLead.lastName = Authentication.user.lastName || '';
        $scope.newLead.company = Authentication.user.company || '';
        $scope.newLead.phone = Authentication.user.phone || '';
        $scope.newLead.email = Authentication.user.email || '';
			}
		};

    var performUploadTempScript = function(file, i, $files){
      $scope.upload = $upload.upload({
        url: 'projects/uploads/script/temp', //upload.php script, node.js route, or servlet url
        data: {project: $scope.project},
        file: file // or list of files ($files) for html5 only
      }).progress(function(evt) {
        $scope.uploadStatus = (i + 1) + ' of ' + $files.length + ' files uploaded';
        $scope.uploadfile = evt.config.file.name;
        $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
      }).success(function(data, status, headers, config) {
        // file is uploaded successfully
        //console.log(data[0]);
        $scope.newProject.scripts.push(data[0]);
      });
    };

    $scope.uploadTempScript = function($files) {
      angular.forEach($files, function(file, key) {
        performUploadTempScript(file, key, $files);
      });
    };

    // update audition rating
    $scope.hoveringOver = function(value,key,object) {
      $scope.overStar = value;
      $scope.percent = 100 * (value / $scope.max);
      $scope.selCheckVal = value;
  	};
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
		$scope.updateFavorite = function(path){
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

			// automatically check favorited
			if($scope.project.auditions[key].favorite === 1){
				if ($scope.project.auditions[key].selected === false){
				    $scope.project.auditions[key].selected = true;
				}
			} else {
				if ($scope.project.auditions[key].selected === true){
				    $scope.project.auditions[key].selected = false;
				}
			}

			// update project store
			$scope.updateNoRefresh();

		};

		// update selected status
		$scope.updateSelected = function(path){

			// console.log($scope.rate[key]);
			var key;

			// get key for selected audition
			for(var j = 0; j < $scope.project.auditions.length; ++j){
				if($scope.project.auditions[j].file.path === path){
					key = j;
				}
			}

			// update selected value
			$scope.project.auditions[key].selected = !$scope.project.auditions[key].selected;

			// update project store
			$scope.updateNoRefresh();

		};

		// update selected status
		$scope.checkSelected = function(path){

			// get key for selected audition
			for(var j = 0; j < $scope.project.auditions.length; ++j){
				if($scope.project.auditions[j].file.path === path && $scope.project.auditions[j].selected === true){
					return true;
				}
			}

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

				// download all booked auditions on final booked audition walk
				if((i+1) === $scope.project.auditions.length){

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

				}
  		}

  	};
  	// download all auditions from project
  	$scope.downloadSelectedAuditions = function(){

  		var selectedAuds = [];
  		for(var i = 0; i < $scope.project.auditions.length; ++i){
  			if($scope.project.auditions[i].selected === true){
  				selectedAuds.push($scope.project.auditions[i].file.name);
  			}

				// download all auditions on final audition file walk
				if((i+1) === $scope.project.auditions.length){

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

				}
  		}

  	};
  	// show booked option for selected auditions
  	$scope.bookSelectedShow = function(){

			for(var i = 0; i < $scope.project.auditions.length; ++i){
  			if($scope.project.auditions[i].selected === true){
  				return true;
  			}
  		}

  		return false;

  	};
		$scope.bookShow = function(){

  		for(var i = 0; i < $scope.project.auditions.length; ++i){
  			if($scope.project.auditions[i].selected === true && (typeof $scope.project.auditions[i].booked === 'undefined' || $scope.project.auditions[i].booked === false)){
  				return true;
  			}
  		}

  		return false;

  	};
		// $scope.$watchCollection('selectedAuditions', function(){
		// });
  	// check for booked auditions
  	$scope.bookedShow = function(){

  		for(var i = 0; i < $scope.project.auditions.length; ++i){
  			if($scope.project.auditions[i].booked === true){
  				return true;
  			}
  		}

  		return false;

  	};

    $scope.hideSelected = true;
    $scope.hideSelectedAuditions = function(){
          $scope.hideSelected = !$scope.hideSelected;
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

    // book clients modal
  	$scope.bookSelectedAuditions = function(){
  		var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'modules/clients/views/book-auditon-modal.client.view.html',
        controller: 'BookModalController',
        resolve: {
        	data: function () {
  	        return {
  	        	project: $scope.project._id
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

    $scope.verifyAudio = function(key){
			if(typeof $scope.project.auditions[key] === 'object'){
				if(typeof $scope.project.auditions[key].file === 'object'){
					return true;
				}
			}
			return false;
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

		// // play audio on load
		// $scope.$watchCollection('audio', function(val){
		// 	if(typeof $scope.audio === 'object'){
		// 		$scope.audio.play();
		// 	}
		// });

		$scope.stopAudio = function(){
			if(typeof $scope.audio === 'object'){
				$scope.audio.unbind();
				$scope.audio.stop();
				$scope.audioStatus = 2;
			}
		};

    $scope.playAudio = function(key, filename, fileDir){

			var fileName = '';

			// check media file play state
			if(key !== $scope.lastAudioID && typeof $scope.audio === 'object'){
				$scope.audio.unbind();
				$scope.audio.stop();
			}
			if(typeof $scope.audio === 'object' && key === $scope.lastAudioID && $scope.audioStatus === 1){
				$scope.audio.pause();
				$scope.audioStatus = 0;
				return;
			}
			if(typeof $scope.audio === 'object' && key === $scope.lastAudioID && $scope.audioStatus === 0){
				$scope.audio.play();
				$scope.audioStatus = 1;
				$scope.updatePlayCnt(filename);
				return;
			}
			// if(typeof $scope.audio === 'object' && key === $scope.lastAudioID && $scope.audioStatus === 2 && typeof $scope.audio === 'object'){
			// 	$scope.audio.play();
			// 	$scope.audioStatus = 1;
			// 	$scope.updatePlayCnt(filename);
			// 	return;
			// }

			// assign file name
			if(typeof fileDir === 'undefined'){
				fileName = '/res/auditions/' + $scope.project._id + '/' + filename;
			} else {
				fileName = fileDir + '/' + filename;
			}

			if($scope.audio = ngAudio.load(fileName)){
				$scope.loop = 0;
				$scope.audioStatus = 1;

				$scope.updatePlayCnt(filename);

				// store current audio key
				$scope.lastAudioID = key;

				//alert($scope.lastAudioID);

				$scope.audio.play();
			}

		};

    $scope.updatePred = function(pred){
			$scope.predicate = pred;
		};

}]);
