'use strict';

// Projects controller
angular.module('clients').controller('BookModalController', ['$scope', '$stateParams', '$location', 'Authentication', 'Projects', '$upload', 'ngAudio', '$http', '$modalInstance', 'data', '$rootScope', 'IS_NOT_MOBILE',
	function($scope, $stateParams, $location, Authentication, Projects, $upload, ngAudio, $http, $modalInstance, data, $rootScope, IS_NOT_MOBILE ) {

		$scope.authentication = Authentication;

		// auditions data
		$scope.data = data;
		$scope.selectedAuds = [];
		$scope.selectedAudsNew = [];
		$scope.projAuditions = [];
		// audio playback
		$scope.audio = '';
		$scope.lastAudioID = 0;
		$scope.audioStatus = 0;
		$scope.watchersObj = {};

		// clear all watchers
		// clear mem leaks on controller destroy
		$scope.$on('$destroy', function (event) {
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

		// find single project by id
		$scope.findOneById = function(id) {

			// reset selected params
			$scope.selectedAuditions = [];
			$scope.hideList = [];

			// assigned search id
			$stateParams.projectId = id;

			// retrieve selected project
			$scope.findOne();
			
			loadAuditions();

		};

		// Find existing Project
		$scope.findOne = function() {
			$scope.project = Projects.get({
				projectId: $stateParams.projectId
			});
		};

		$scope.watchersObj.data = $scope.$watchCollection('data', function(val){
			// load associated project
			if(typeof $scope.data !== 'undefined'){
				$scope.findOneById($scope.data.project);
			}
		});

		// prune unneeded auditions
		// walk through new list
		$scope.watchersObj.projAuditions = $scope.$watchCollection('projAuditions', function(val){

			$scope.selectedAudsNew = [];
			if(typeof $scope.projAuditions !== 'undefined'){
				var limit = $scope.projAuditions.length,
					i = 0;

				for(i = 0; i < limit; ++i){
					if($scope.projAuditions[i].selected === true && (typeof $scope.projAuditions[i].booked === 'undefined' || $scope.projAuditions[i].booked === false)){
						$scope.selectedAudsNew.push($scope.projAuditions[i]);
					}
				}

			}

		});
		$scope.watchersObj.project = $scope.$watchCollection('project', function(val){
			// walk through old list
			$scope.watchersObj.project.auditions = $scope.$watchCollection('project.auditions', function(val){

				$scope.selectedAuds = [];
				if(typeof $scope.project.auditions !== 'undefined'){
					var limit = $scope.project.auditions.length,
						i = 0;

					for(i = 0; i < limit; ++i){
						if($scope.project.auditions[i].selected === true && (typeof $scope.project.auditions[i].booked === 'undefined' || $scope.project.auditions[i].booked === false)){
							$scope.selectedAuds.push($scope.project.auditions[i]);
						}
					}

				}

			});
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
		$scope.cancel = function () {
			if(typeof $scope.audio === 'object'){
				$scope.audio.stop();
			}
			$modalInstance.dismiss('cancel');
		};
		
		$scope.verifyAudioSingle = function(audition){

			if(typeof audition.file === 'object'){
				return true;
			}

			return false;
		};

		$scope.verifyAudio = function(key){
			if(typeof $scope.project.auditions[key] === 'object'){
				if(typeof $scope.project.auditions[key].file === 'object'){
					return true;
				}
			}
			return false;
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

		$scope.updatePlayCntSingle = function(audition){

			if(typeof audition.playCnt === 'undefined'){
				audition.playCnt = 1;
			} else {
				audition.playCnt += 1;
			}

			saveAudition(audition);
		};

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
				// if(typeof $scope.audio === 'object' && key === $scope.lastAudioID && $scope.audioStatus === 2 && typeof $scope.audio === 'object'){
				// 	$scope.audio.play();
				// 	$scope.audioStatus = 1;
				// 	//console.log('play');
				// 	$scope.updatePlayCnt(filename);
				// 	return;
				// }

				// // disable previous
				// if(typeof $scope.audio === 'object'){
				// 	if(key !== $scope.lastAudioID){
				// 		$scope.audio[$scope.lastAudioID].stop();
				// 	}
				// }

				//if($scope.audio = ngAudio.load(fileName)){
					$scope.audio = ngAudio.load(fileName).play();
					$scope.loop = 0;
					$scope.audioStatus = 1;

					$scope.updatePlayCnt(filename);

					// store current audio key
					$scope.lastAudioID = key;

					//$scope.audio.play();
				//}

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

		// // play audio on load
		// $scope.$watchCollection('audio', function(val){
		// 	if(typeof $scope.audio === 'object'){
		// 		$scope.audio.play();
		// 	}
		// });

		// assign selected items as booked then send out appropriate emails
		$scope.bookSelected = function(){

			$http.post('/projects/bookAuditions', {
				data: $scope.data
			}).
			success(function(data, status, headers, config) {
				$rootScope.$broadcast('refreshProject', $scope.data.project);
				//console.log('finished');
				$modalInstance.close();
			}).error(function(data, status, headers, config) {
				console.log('Problem booking auditions.');
			});


		};
	}
]);
