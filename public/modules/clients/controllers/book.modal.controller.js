'use strict';

// Projects controller
angular.module('clients').controller('BookModalController', ['$scope', '$stateParams', '$location', 'Authentication', 'Projects', '$upload', 'ngAudio', '$http', '$modalInstance', 'data', '$rootScope',
	function($scope, $stateParams, $location, Authentication, Projects, $upload, ngAudio, $http, $modalInstance, data, $rootScope ) {

		var _isNotMobile = (function() {
				var check = false;
				(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
				return !check;
		})();

		$scope.authentication = Authentication;

		// auditions data
		$scope.data = data;
		$scope.selectedAuds = [];
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

		$scope.watchersObj.data = $scope.$watchCollection('data', function(val){
			// load associated project
			if(typeof $scope.data !== 'undefined'){
				$scope.findOneById($scope.data.project);
			}
		});

		// prune unneeded auditions
		$scope.watchersObj.project = $scope.$watchCollection('project', function(val){
			$scope.watchersObj.project.auditions = $scope.$watchCollection('project.auditions', function(val){

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

			// assign file name
			if(typeof fileDir === 'undefined'){
				fileName = '/res/auditions/' + $scope.project._id + '/' + filename;
			} else {
				fileName = fileDir + '/' + filename;
			}

			if(_isNotMobile){

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
				window.location.href = fileName;
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
