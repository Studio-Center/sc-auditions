'use strict';

// Projects controller
angular.module('clients').controller('BookModalController', ['$scope', '$stateParams', '$location', 'Authentication', 'Projects', '$upload', 'ngAudio', '$http', '$modalInstance', 'data', '$rootScope',
	function($scope, $stateParams, $location, Authentication, Projects, $upload, ngAudio, $http, $modalInstance, data, $rootScope ) {
		$scope.authentication = Authentication;

		// auditions data
		$scope.data = data;
		$scope.selectedAuds = [];
		// audio playback
		$scope.audio = '';
		$scope.lastAudioID = 0;
		$scope.audioStatus = 0;

		// find single project by id
		$scope.findOneById = function(id) {

			// reset selected params
			$scope.selectedAuditions = [];
			$scope.hideList = [];

			// assigned search id
			$stateParams.projectId = id;

			// retrieve selected project
			$scope.findOne();

		};

		// Find existing Project
		$scope.findOne = function() {
			$scope.project = Projects.get({
				projectId: $stateParams.projectId
			});
		};

		$scope.$watchCollection('data', function(val){
			// load associated project
			if(typeof $scope.data !== 'undefined'){
				$scope.findOneById($scope.data.project);
			}
		});

		// prune unneeded auditions
		$scope.$watchCollection('project', function(val){
			$scope.$watchCollection('project.auditions', function(val){

				$scope.selectedAuds = [];

				if(typeof $scope.project.auditions !== 'undefined'){

					for(var i = 0; i < $scope.project.auditions.length; ++i){
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

				$scope.audio.play();
			}

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
			});

		};
	}
]);
