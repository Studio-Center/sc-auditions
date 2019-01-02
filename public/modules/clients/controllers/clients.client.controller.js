'use strict';

// Projects controller
angular.module('clients').controller('ClientsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Projects', '$upload', 'ngAudio', 'ngAudioGlobals', '$http', '$modal', '$rootScope', 'Socket', '$cookies', '$window', 'IS_NOT_MOBILE',
	function($scope, $stateParams, $location, Authentication, Projects, $upload, ngAudio, ngAudioGlobals, $http, $modal, $rootScope, Socket, $cookies, $window, IS_NOT_MOBILE ) {

	$scope.authentication = Authentication;

    // controller vars
    $scope.projectsTotalCnt = 0;
	$scope.project = {};
    $scope.audio = '';
	$scope.lastAudioID = 0;
	$scope.audioStatus = 0;
    $scope.newLead = {};
    ngAudioGlobals.unlock = false;
    $scope.clientNotes = '';
	$scope.projAuditions = [];
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

    // Find existing Project
	$scope.findOne = function() {
      if($stateParams.projectId){
		// gather project data
		$scope.project = Projects.get({
			projectId: $stateParams.projectId
		});
		// gather assigned project auditions
	  	loadAuditions();
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

	// reload auditions if single aud updated
	Socket.on('auditionUpdate', function(pojectID) {

		var project = $scope.project;

		if(String(pojectID.id) === String(project._id)){

			loadAuditions();

		}

	});

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

		var auditions = $scope.project.auditions,
			limit = 0,
			i = 0,
			j = 0;
		
		// update old auds list
		if(typeof $scope.project !== 'undefined' && auditions){
			limit = auditions.length;
			i = 0;
			j = 0;


			for(j = 0; j < limit; ++j){
				for(i = 0; i < auditions[j].rating.length; ++i){
					if(auditions[j].rating[i].userId === Authentication.user._id){
						auditions[j].curRating = auditions[j].rating[i].value;
					}
				}
			}
		}
		
		// update new auds list
		if(typeof $scope.projAuditions !== 'undefined'){
			limit = $scope.projAuditions.length;
			i = 0;
			j = 0;


			for(j = 0; j < limit; ++j){
				for(i = 0; i < $scope.projAuditions[j].rating.length; ++i){
					if($scope.projAuditions[j].rating[i].userId === Authentication.user._id){
						$scope.projAuditions[j].curRating = $scope.projAuditions[j].rating[i].value;
					}
				}
			}
		}
	};
	$scope.lookUpRating = function(key){

		var ratings = $scope.project.auditions[key].rating,
				limit = ratings.length,
				i = 0;

		for(i = 0; i < limit; ++i){
			if(ratings[i].userId === Authentication.user._id){
				return ratings[i].value;
			}
		}
	};
	$scope.updateRating = function(path, redirect){
		// determine if update should result in user redirect
		redirect = typeof redirect === 'undefined' ? true : redirect;

		// console.log($scope.rate[key]);
		var key,
				ratingCnt = 0,
				avgRating = 0,
				auditions = $scope.project.auditions,
				limit = auditions.length,
				j = 0,
				i = 0;

		// get key for selected audition
		for(j = 0; j < limit; ++j){
			if(auditions[j].file.path === path){
				key = j;
			}
		}

		// walk through existing ratings
		if(typeof auditions[key] !== 'undefined' && typeof auditions[key].rating !== 'undefined'){

			var ratingLimit = auditions[key].rating.length;

			for(i = 0; i < ratingLimit; ++i){
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

	// update audition rating
	$scope.updateFavorite = function(path){
		// console.log($scope.rate[key]);
		var key,
				favoriteVal = 1,
				j = 0,
				auditions = $scope.project.auditions,
				limit = auditions.length;

		// get key for selected audition
		for(j = 0; j < limit; ++j){
			if(auditions[j].file.path === path){
				key = j;
			}
		}

		// determine existing favorite setting
		if(typeof auditions[key].favorite !== 'undefined'){
			if(auditions[key].favorite === 1){
				favoriteVal = 0;
			}
		}

		// merge average rating
		auditions[key].favorite = favoriteVal;

		// automatically check favorited
		if(auditions[key].favorite === 1){
			if (auditions[key].selected === false){
				auditions[key].selected = true;
			}
		} else {
			if (auditions[key].selected === true){
				auditions[key].selected = false;
			}
		}

		// update project store
		$scope.updateNoRefresh();

	};

	// update selected status
	$scope.updateSelected = function(path){

		// console.log($scope.rate[key]);
		var key,
				auditions = $scope.project.auditions,
				limit = auditions.length,
				j = 0;

		// get key for selected audition
		for(j = 0; j < limit; ++j){
			if(auditions[j].file.path === path){
				key = j;
			}
		}

		// update selected value
		auditions[key].selected = !auditions[key].selected;

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

	// update selected status
	$scope.updateSelectedSingle = function(audition){
		
		// get key for selected audition
		if(audition.selected === true){
			audition.selected = false;
		} else {
			audition.selected = true;
		}
		
		saveAudition(audition);

	};
		
	
	// update selected status
	$scope.checkSelectedSingle = function(audition){

		// get key for selected audition
		if(audition.selected === true){
			return true;
		}

	};
		
	$scope.lookUpRatingSingle = function(audition){

		var ratings = audition.rating,
			limit = ratings.length,
			i = 0;

		for(i = 0; i < limit; ++i){
			if(ratings[i].userId === Authentication.user._id){
				return ratings[i].value;
			}
		}
		
	};

		
	$scope.hideAuditionSingle = function(audition){

		audition.hidden = true;
		saveAudition(audition);
		
  	};
	
	$scope.showAuditionSingle = function(audition){

		audition.hidden = false;
		saveAudition(audition);

  	};
		
	$scope.isDisplayedSingle = function(audition){

		if(audition.hidden === true && $scope.hideSelected === true){
			return false;
		} else {
			return true;
		}

  		return false;
  	};

	// update audition rating
	$scope.updateFavoriteSingle = function(audition){

		var favoriteVal = 1;

		// determine existing favorite setting
		if(typeof audition.favorite !== 'undefined'){
			if(audition.favorite === 1){
				favoriteVal = 0;
			}
		}

		// merge average rating
		audition.favorite = favoriteVal;

		// automatically check favorited
		if(audition.favorite === 1){
			if (audition.selected === false){
				audition.selected = true;
			}
		} else {
			if (audition.selected === true){
				audition.selected = false;
			}
		}

		// update project store
		saveAudition(audition);

	};
	
	// update audition rating
	$scope.updateRatingSingle = function(audition, redirect){

		var j = 0,
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

	// update selected status
	$scope.checkSelected = function(path){

		var auditions = $scope.project.auditions,
				limit = auditions.length,
				j = 0;

		// get key for selected audition
		for(j = 0; j < limit; ++j){
			if(auditions[j].file.path === path && auditions[j].selected === true){
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

		var auditions = $scope.project.auditions,
			limit = auditions.length,
			i = 0;

  		for(i = 0; i < limit; ++i){
  			if(auditions[i].file.path === filename){
  				return true;
  			}
  		}

  		return false;
  	};
  	$scope.isDisplayed = function(filename){

			var auditions = $scope.project.auditions,
					limit = auditions.length,
					i = 0;

  		for(i = 0; i < limit; ++i){
  			if(auditions[i].file.path === filename){
  				if(auditions[i].hidden === true && $scope.hideSelected === true){
  					return false;
  				} else {
  					return true;
  				}
  			}
  		}

  		return false;
  	};
  	$scope.hiddenAudsCnt = function(){
  		var hidCnt = 0,
			auditions = $scope.project.auditions,
			auditionsNew = $scope.projAuditions,
			limit = auditions.length,
			limitNew = auditionsNew.length,
			i = 0;
		
		// iterate over old listing
  		for(i = 0; i < limit; ++i){
  			if(auditions[i].hidden === true){
  				hidCnt += 1;
  			}
  		}
		
		// iterate over new listing
  		for(i = 0; i < limitNew; ++i){
  			if(auditionsNew[i].hidden === true){
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
		
	// send download booked auds request
	var bookedAudsDL = function(bookedAuds){
		$http.post('/projects/downloadBookedAuditions', {
			projectId: $scope.project._id,
			projectTitle: $scope.project.title,
			bookedAuds: bookedAuds
		}).
		success(function(data, status, headers, config) {
			// send data to users browser
			window.location.href = 'res/archives/' + encodeURIComponent(data.zip);

		});
	};
		
  	// download all auditions from project
  	$scope.downloadBookedAuditions = function(){

  		var bookedAuds = [],
			auditions = $scope.project.auditions,
			auditionsNew = $scope.projAuditions,
			limit = auditions.length,
			limitNew = auditionsNew.length,
			i = 0;

  		for(i = 0; i < limit; ++i){
			// add auds from old system
  			if(auditions[i].booked === true){
  				bookedAuds.push(auditions[i].file.name);
  			}

			// download all booked auditions on final booked audition walk
			if((i+1) === limit){

				for(i = 0; i < limitNew; ++i){
					
					// add auds from new system
					if(auditionsNew[i].booked === true){
						bookedAuds.push(auditionsNew[i].file.name);
					}
					
					if((i+1) === limitNew){
						
						bookedAudsDL(bookedAuds);
						
					}
					
				}

			}
  		}

  	};
		// send download selected auds request
		var audsSelDL = function(selectedAuds){
			$http.post('/projects/downloadSelectedAuditions', {
						projectId: $scope.project._id,
						projectTitle: $scope.project.title,
						selectedAuds: selectedAuds
			}).
			success(function(data, status, headers, config) {
				// send data to users browser
				// wait one second for archive processing on server
				window.location.href = 'res/archives/' + encodeURIComponent(data.zip);

			});
		};

  	// download all auditions from project
  	$scope.downloadSelectedAuditions = function(){

  		var selectedAuds = [],
			auditions = $scope.project.auditions,
			auditionsNew = $scope.projAuditions,
			limit = auditions.length,
			limitNew = auditionsNew.length,
			i = 0;

  		for(i = 0; i < limit; ++i){
  			if(auditions[i].selected === true){
  				selectedAuds.push(auditions[i].file.name);
  			}

			// download all auditions on final audition file walk
			if((i+1) === limit){


				for(i = 0; i < limitNew; ++i){

					// add auds from new system
					if(auditionsNew[i].selected === true){
						console.log(auditionsNew[i].selected);
						selectedAuds.push(auditionsNew[i].file.name);
					}

					if((i+1) === limitNew){

						audsSelDL(selectedAuds);

					}

				}

			}
  		}

  	};
  	// show booked option for selected auditions
  	$scope.bookSelectedShow = function(){

		var auditions = $scope.project.auditions,
			auditionsNew = $scope.projAuditions,
			limit = auditions.length,
			limitNew = auditionsNew.length,
			i = 0;
		
		// check old aud lists
		for(i = 0; i < limit; ++i){
  			if(auditions[i].selected === true){
  				return true;
  			}
  		}
		
		// check new aud lists
		for(i = 0; i < limitNew; ++i){
  			if(auditionsNew[i].selected === true){
  				return true;
  			}
  		}

  		return false;

  	};
	$scope.bookShow = function(){

		var auditions = $scope.project.auditions,
			auditionsNew = $scope.projAuditions,
			limit = auditions.length,
			limitNew = auditionsNew.length,
			i = 0;
		
		// check old list auds
  		for(i = 0; i < limit; ++i){
  			if(auditions[i].selected === true && (typeof auditions[i].booked === 'undefined' || auditions[i].booked === false)){
  				return true;
  			}
  		}
		
		// check new list auds
  		for(i = 0; i < limitNew; ++i){
  			if(auditionsNew[i].selected === true && (typeof auditionsNew[i].booked === 'undefined' || auditionsNew[i].booked === false)){
  				return true;
  			}
  		}

  		return false;

  	};
		// $scope.$watchCollection('selectedAuditions', function(){
		// });
  	// check for booked auditions
  	$scope.bookedShow = function(){

		var auditions = $scope.project.auditions,
			limit = auditions.length,
			i = 0;

  		for(i = 0; i < limit; ++i){
  			if(auditions[i].booked === true){
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

    $scope.verifyAudioSingle = function(audition){

		if(typeof audition.file === 'object'){
			return true;
		}
		
		return false;
	};

    $scope.verifyAudio = function(key){

		var auditions = $scope.project.auditions;

		if(typeof auditions[key] === 'object'){
			if(typeof auditions[key].file === 'object'){
				return true;
			}
		}
		return false;
	};

    $scope.hideAudition = function(filename){

			var auditions = $scope.project.auditions,
					limit = auditions.length,
					i = 0;

  		// $scope.hideList.push(filename);
  		// get audition id
  		for(i = 0; i < limit; ++i){
  			if(auditions[i].file.path === filename){
  				auditions[i].hidden = true;
  				$scope.updateNoRefresh();
  			}
  		}
  	};
  	$scope.showAudition = function(filename){

			var auditions = $scope.project.auditions,
					limit = auditions.length,
					i = 0;

			// var idx = $scope.hideList.indexOf(filename);
			// if (idx > -1){
			//     $scope.hideList.splice(idx, 1);
			// }
			// get audition id
			for(i = 0; i < limit; ++i){
  			if(auditions[i].file.path === filename){
  				auditions[i].hidden = false;
  				$scope.updateNoRefresh();
  			}
  		}
  	};

	$scope.updatePlayCnt = function(filename){

		var auditions = $scope.project.auditions,
			limit = auditions.length,
			i = 0;

		// set play count
		for(i = 0; i < limit; ++i){
			if($scope.project.auditions[i].file.name === filename){
				if(typeof auditions[i].playCnt === 'undefined'){
					auditions[i].playCnt = 1;
				} else {
					auditions[i].playCnt += 1;
				}
			}
		}

		$scope.updateNoRefresh();
	};

	$scope.updatePlayCntSingle = function(audition){

		if(typeof audition.playCnt === 'undefined'){
			audition.playCnt = 1;
		} else {
			audition.playCnt += 1;
		}

		saveAudition(audition);
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

		// assign file name
		if(typeof fileDir === 'undefined'){
			fileName = '/res/auditions/' + $scope.project._id + '/' + filename;
		} else {
			fileName = fileDir + '/' + filename;
		}

		if(IS_NOT_MOBILE){

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

			//if($scope.audio = ngAudio.load(fileName)){
				$scope.audio = ngAudio.load(fileName).play();
				$scope.loop = 0;
				$scope.audioStatus = 1;

				$scope.updatePlayCnt(filename);

				// store current audio key
				$scope.lastAudioID = key;

				//alert($scope.lastAudioID);

				//$scope.audio.play();
			//}

		// download file only on mobile user agents
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

    $scope.playAudioSingle = function(key, audition, fileDir){

		var fileName = '';

		// assign file name
		if(typeof fileDir === 'undefined'){
			fileName = '/res/auditions/' + $scope.project._id + '/' + audition.file.name;
		} else {
			fileName = fileDir + '/' + audition.file.name;
		}

		if(IS_NOT_MOBILE){

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
				$scope.updatePlayCntSingle(audition);
				return;
			}

			$scope.audio = ngAudio.load(fileName).play();
			$scope.loop = 0;
			$scope.audioStatus = 1;

			$scope.updatePlayCntSingle(audition);

			// store current audio key
			$scope.lastAudioID = key;

		// download file only on mobile user agents
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

    $scope.updatePred = function(pred){
		$scope.predicate = pred;
	};

}]);
