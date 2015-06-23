'use strict';

// Projects controller
angular.module('projects').controller('ProjectsModalController', ['$scope', '$stateParams', '$location', 'Authentication', 'Projects', '$upload', 'ngAudio', '$http', '$modalInstance', 'data', '$rootScope',
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

		$scope.$watch('data', function(val){
			// load associated project
			if(typeof $scope.data !== 'undefined'){
				$scope.findOneById($scope.data.project);
			};
		});

		// prune unneeded auditions
		$scope.$watch('project', function(val){
			$scope.$watch('project.auditions', function(val){

				if(typeof $scope.project.auditions !== 'undefined'){

					for(var i = 0; i < $scope.project.auditions.length; ++i){
						for(var j = 0; j < $scope.data.auditions.length; ++j){
							if($scope.data.auditions[j] === $scope.project.auditions[i].file.path){
								$scope.selectedAuds.push($scope.project.auditions[i]);
							}
						}
					}

				}

			});
		});

		$scope.cancel = function () {
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

		$scope.playAudio = function(key, filename){
			
			// check media file play state
			if(typeof $scope.audio === 'object' && key === $scope.lastAudioID && $scope.audioStatus === 1){
				$scope.audio.pause();
				$scope.audioStatus = 0;
				return;
			}
			if(typeof $scope.audio === 'object' && key === $scope.lastAudioID && $scope.audioStatus === 0){
				$scope.audio.play();
				$scope.audioStatus = 1;
				return;
			}
			if(typeof $scope.audio === 'object' && key === $scope.lastAudioID && $scope.audioStatus === 2){
				$scope.audio.play();
				$scope.audioStatus = 1;
				return;
			}

			// assign file name
			var fileName = '/res/auditions/' + $scope.project._id + '/' + filename;

			$scope.audio = ngAudio.load(fileName);
			$scope.audio.unbind();
			$scope.audioStatus = 1;	

			$scope.audio.play();
			$scope.lastAudioID = key;
		};

		// assign selected items as booked then send out appropriate emails
		$scope.bookSelected = function(){

			$http.post('/projects/bookAuditions', {
		        data: $scope.data
		    }).
			success(function(data, status, headers, config) {
				$rootScope.$broadcast('refreshProject', $scope.data.project);
				$modalInstance.close();
			});

		};
	}
]);