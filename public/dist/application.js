'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'studio-center-auditions';
	var applicationModuleVendorDependencies = ['ngRoute', 'ngResource', 'ngCookies',  'ngAnimate',  'ngTouch',  'ngSanitize',  'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload', 'ngAudio','ui.bootstrap.datetimepicker','rt.encodeuri', 'angularMoment', 'textAngular', 'btford.socket-io', 'ngCookies', 'base64', 'ngSanitize'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || [])
		// mobile check
		.constant('IS_NOT_MOBILE', (function() {
				var check = false;
				(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
				return !check;
		})());

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('clients');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

angular.module('core').constant('angularMomentConfig', {
    timezone: 'America/New_York' // e.g. 'Europe/London'
});

//moment.tz.setDefault('America/New_York');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('logs');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('projects');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('reports');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('talents');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('tools');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('typecasts');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');

'use strict';

// Configuring the Articles module
angular.module('clients').run(['Menus', 'Authentication',
	function(Menus, Authentication) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Clients', 'clients', 'dropdown', '/clients/projects', false, ['admin', 'producer/auditions director', 'audio intern', 'production coordinator', 'talent director', 'client', 'client-client'], 1);
		Menus.addSubMenuItem('topbar', 'clients', 'Portal', 'clients/projects', false);
		Menus.addSubMenuItem('topbar', 'clients', 'Start A New Audition Project', 'clients/new-audition-form', false);
}
]);

'use strict';

//Setting up route
angular.module('clients').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Projects state routing
		$stateProvider.
		state('clientProjectsList', {
			url: '/clients/projects',
			templateUrl: 'modules/clients/views/client-list-projects.client.view.html'
		}).
		state('clientProjectsSingleList', {
			url: '/clients/projects/:projectId',
			templateUrl: 'modules/clients/views/client-list-projects.client.view.html'
		}).
		state('newAudProject', {
			url: '/clients/new-audition-form',
			templateUrl: 'modules/clients/views/new-audition-project.client.view.html'
		}).
		state('newAudProjectThanks', {
			url: '/clients/new-audition-form/thanks',
			templateUrl: 'modules/clients/views/new-audition-project-thanks.client.view.html'
		});
	}
]);

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

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		}).
		state('error', {
			url: '/404',
			templateUrl: 'modules/core/views/not-found.client.view.html'
		});
	}
]);
'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus', '$window', '$rootScope', '$location', 'Socket',
	function($scope, Authentication, Menus, $window, $rootScope, $location, Socket) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});

		// track page views
		$rootScope.$on('$viewContentLoaded', function(event) {
		  $window.ga('send', 'pageview', { page: $location.url() });
		});

		$scope.connectionCnt = function(){
			//return Socket.sockets.length;
		};

	}
]);

'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$location',
	function($scope, Authentication, $location) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		if(typeof $scope.authentication.user !== 'undefined' && typeof $scope.authentication.user.roles !== 'undefined' && ($scope.authentication.user.roles[0] === 'client' || $scope.authentication.user.roles[0] === 'client-client')) {
			$location.path('/clients/projects');
		}

	}
]);

'use strict';
angular.module('core').filter('multiTerm', ["$filter", function($filter){
     return function(inputArray, searchText){
        var wordArray = searchText ? searchText.toLowerCase().split(/\s+/) : [];
        var wordCount = wordArray.length;
        for(var i=0;i<wordCount;i++){
            inputArray = $filter('filter')(inputArray, wordArray[i], true);
        }
        return inputArray;
    };
}]);
'use strict';
angular.module('core').filter('multiTermFull', ["$filter", function($filter){
     return function(inputArray, searchText){
        var wordArray = searchText ? searchText.toLowerCase().split(/\s+/) : [];
        var wordCount = wordArray.length;
        for(var i=0;i<wordCount;i++){
            inputArray = $filter('filter')(inputArray, wordArray[i], false);
        }
        return inputArray;
    };
}]);
'use strict';
angular.module('core').filter('startFrom', function() {
    return function(input, start) {
    	if (!input || !input.length) { return; }
        start = +start; //parse to int
        return input.slice(start);
    };
});
'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);
'use strict';

//socket factory that provides the socket service
var io;
angular.module('core').factory('Socket', ['socketFactory',
    function(socketFactory) {
        return socketFactory({
            prefix: '',
            ioSocket: io(location.host, {reconnect: true, 'transports': ['websocket', 'polling']})
        });
    }
]);

'use strict';

// Configuring the Articles module
//angular.module('logs').run(['Menus',
//	function(Menus) {
//		// Set top bar menu items
//		Menus.addMenuItem('topbar', 'Logs', 'logs', 'dropdown', '/logs(/create)?', false, ['admin'],10);
//		Menus.addSubMenuItem('topbar', 'logs', 'Browse', 'logs', false, false, ['admin']);
//	}
//]);
'use strict';

//Setting up route
angular.module('logs').config(['$stateProvider',
	function($stateProvider) {
		// Logs state routing
		$stateProvider.
		state('listLogs', {
			url: '/logs',
			templateUrl: 'modules/logs/views/list-logs.client.view.html'
		}).
		state('createLog', {
			url: '/logs/create',
			templateUrl: 'modules/logs/views/create-log.client.view.html'
		}).
		state('viewLog', {
			url: '/logs/:logId',
			templateUrl: 'modules/logs/views/view-log.client.view.html'
		}).
		state('editLog', {
			url: '/logs/:logId/edit',
			templateUrl: 'modules/logs/views/edit-log.client.view.html'
		});
	}
]);
'use strict';

// Logs controller
angular.module('logs').controller('LogsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Logs', '$http',
	function($scope, $stateParams, $location, Authentication, Logs, $http ) {
		$scope.authentication = Authentication;

		// used for paginator
		$scope.logCnt = 0;
		$scope.page = 0;
		$scope.searchText = {
			type: ''
		};
		$scope.Math = window.Math;
		$scope.currentPage = 0;
		$scope.filtered = [];
		$scope.limit = 300;
		$scope.searchString = '';
		$scope.range = function(min, max, step){
		    step = step || 1;
		    var input = [];
		    for (var i = min; i <= max; i += step) input.push(i);
		    return input;
		};
    $scope.setPage = function () {
        $scope.currentPage = this.n;

				$scope.listTypeFilter(this.n);
    };
    $scope.changePage = function(page){
    	var curSel = page * $scope.limit;

    	if(curSel < $scope.filtered.length && curSel >= 0){
    		$scope.currentPage = page;
    	}
    };
    // $scope.$watch('filtered', function(val){
    // 	$scope.currentPage = 0;
    // }, true);

		// Create new Log
		$scope.create = function() {
			// Create new Log object
			var log = new Logs ({
				name: this.name
			});

			// Redirect after save
			log.$save(function(response) {
				$location.path('logs/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Log
		$scope.remove = function( log ) {
			if ( log ) { log.$remove();

				for (var i in $scope.logs ) {
					if ($scope.logs [i] === log ) {
						$scope.logs.splice(i, 1);
					}
				}
			} else {
				$scope.log.$remove(function() {
					$location.path('logs');
				});
			}
		};

		// Update existing Log
		$scope.update = function() {
			var log = $scope.log ;

			log.$update(function() {
				$location.path('logs/' + log._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// get logs count
		$scope.getLogsCount = function(){

			$http.post('/logs/recCount', {
				filter: $scope.searchText.type,
				searchTxt: $scope.searchString
			}).
			success(function(data, status, headers, config) {
				$scope.logCnt = Number(data);
			});

		};

		// Find a list of Logs
		$scope.find = function() {
			$scope.logs = Logs.query();
		};

		// gather filtered list of logs
		$scope.listFilter = function(listFilter){

			$http.post('/logs/listFilter', {
        filter: listFilter
		  }).
			success(function(data, status, headers, config) {
				$scope.logs = data;
			});

		};
		// gather filtered list of logs
		$scope.listTypeFilter = function(page, filter){

			// gather page data
			if(typeof page === 'undefined'){
				page = $scope.page;
			} else {
				$scope.page = page;
			}

			// gather filter data
			if(typeof filter === 'undefined'){
				filter = $scope.searchText.type;
			}

			// det start val
			var startVal = page * $scope.limit;

			$http.post('/logs/listTypeFilter', {
				startVal: startVal,
				limitVal: $scope.limit,
        filter: filter,
				searchTxt: $scope.searchString
		  }).
			success(function(data, status, headers, config) {
				$scope.logs = [];
				$scope.logs = data;
			});

		};
		// update logs count for paginators
		$scope.$watchCollection('logs', function(val){
			$scope.getLogsCount();
		});

		// Find existing Log
		$scope.findOne = function() {
			$scope.log = Logs.get({
				logId: $stateParams.logId
			});
		};
	}
]);

'use strict';

//Logs service used to communicate Logs REST endpoints
angular.module('logs').factory('Logs', ['$resource',
	function($resource) {
		return $resource('logs/:logId', { logId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Configuring the Articles module
angular.module('projects').run(['Menus', 'Authentication',
	function(Menus, Authentication) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Projects', 'projects', 'dropdown', '/projects(/create)?', false, ['admin', 'producer/auditions director', 'audio intern', 'production coordinator', 'talent director'], 0);
		Menus.addSubMenuItem('topbar', 'projects', 'New', 'projects/create', false, false, ['admin', 'production coordinator']);
		Menus.addSubMenuItem('topbar', 'projects', 'Browse', 'projects', false, false, ['admin','producer/auditions director', 'audio intern', 'production coordinator', 'talent director']);
	}
]);

'use strict';

//Setting up route
angular.module('projects').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Projects state routing
		$stateProvider.
		state('listProjects', {
			url: '/projects',
			templateUrl: 'modules/projects/views/list-projects.client.view.html'
		}).
		state('createProject', {
			abstract: true,
			url: '/projects/create',
			controller: 'ProjectsController',
			templateUrl: 'modules/projects/views/create-project.client.view.html'
		}).
		state('createProject.project', {
			url: '',
			parent: 'createProject',
			templateUrl: 'modules/projects/views/create-project/project.client.view.html'
		}).
		state('createProject.talent', {
			url: '/talent',
			parent: 'createProject',
			templateUrl: 'modules/projects/views/create-project/talent.client.view.html'
		}).
		state('createDupProject', {
			abstract: true,
			url: '/projects/create/:projectId',
			controller: 'ProjectsController',
			templateUrl: 'modules/projects/views/create-project.client.view.html'
		}).
		state('createDupProject.project', {
			url: '',
			parent: 'createDupProject',
			templateUrl: 'modules/projects/views/create-project/project.client.view.html'
		}).
		state('createDupProject.talent', {
			url: '/talent',
			parent: 'createDupProject',
			templateUrl: 'modules/projects/views/create-project/talent.client.view.html'
		}).
		state('talentAuditionUploadProject', {
			url: '/projects/talent-upload/:projectId/:talentId',
			templateUrl: 'modules/projects/views/talent-audition-upload.client.view.html'
		}).
		state('viewProject', {
			url: '/projects/:projectId',
			templateUrl: 'modules/projects/views/view-project.client.view.html'
		}).
		state('editProject', {
			url: '/projects/:projectId/edit',
			templateUrl: 'modules/projects/views/edit-project.client.view.html'
		});
	}
]);

'use strict';

// Projects controller
angular.module('projects').controller('ProjectsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Projects', '$upload', 'ngAudio', '$http', '$modal', '$rootScope', 'Socket', '$cookies', 'moment', '$window', 'Talents', 'IS_NOT_MOBILE',
	function($scope, $stateParams, $location, Authentication, Projects, $upload, ngAudio, $http, $modal, $rootScope, Socket, $cookies, moment, $window, Talents, IS_NOT_MOBILE ) {

		$scope.authentication = Authentication;
		$scope.projectsTotalCnt = 0;
		$scope.project = {};
		$scope.discussion = '';
		$scope.watchersObj = {};
		// rating
		$scope.hide = 0;
		$scope.max = 5;
		$scope.isReadonly = false;
		$scope.ratings = [];
		$scope.ratingsAvg = [];
		// file check vars
		$scope.newFileCnt = 0;
		$scope.procCnt = 0;
		$scope.fileCheck = false;
		// static project options
		$scope.showDateEdit = false;
		$scope.showRename = false;
		$scope.addTalent = true;
		$scope.newProjTalentLink = 'createProject.talent';
		$scope.newProjLink = 'createProject.project';
		//ngAudioGlobals.unlock = false;
		$scope.clientNotes = '';
		$scope.auditions = [];
		$scope.projAuditions = [];
		$scope.projProgress = [];
		$scope.selCheckVal = 0;
		$scope.client = [];
		$scope.talent = [];
		$scope.showRename = [];
		$scope.statusOpts = ['In Progress', 'On Hold', 'Booked', 'Canceled', 'ReAuditioned', 'Dead', 'Closed - Pending Client Decision', 'Complete'];
		$scope.priorityOpts = ['None', 'Very low', 'Low', 'Medium', 'High', 'Very high'];
		$scope.phaseStatusOpts = ['in progress','open','complete','suspended'];
		$scope.soundersOpts = ['Sounders', 'No Sounders - Approved By William'];
		$scope.talentStatus = ['Cast', 'Emailed', 'Scheduled', 'Message left', 'Out', 'Received needs to be posted', 'Posted', 'Not Posted (Bad Read)', 'Missed', 'Canceled'];
		//$scope.loadAudio = 0;
		$scope.audio = '';
		$scope.lastAudioID = 0;
		$scope.audioStatus = 0;
		$scope.referenceFiles = [];
		$scope.scripts = [];
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
		$scope.parts = [];
		$scope.toggleRefs = false;
		$scope.selectedMainClients = [];
		$scope.rejFiles = [];
		//$scope.talentStatus = [];
		$scope.talentBooked = [];
		$scope.talentNote = [];
		$scope.verifyFilesList = {};
		// filter vars
		$scope.predicate = '';
		$scope.reverse = '';
		$scope.searchText = {};

		// // on close check
		// $scope.$on('$locationChangeStart', function( event ) {
		//
		// 	// nothing for the moment
		//
		// });

		// clear mem leaks on controller destroy
		$scope.$on('$destroy', function (event) {
			// clear all socket listeners
      Socket.removeAllListeners();

			// // clear all watchers
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

		$scope.toggleShowRename = function(idx){
			if($scope.showRename[idx]) {
				$scope.showRename[idx] = !$scope.showRename;
			} else {
				$scope.showRename[idx] = 1;
			}
		};
		$scope.toggleShowEdit = function(){
			$scope.showDateEdit = !$scope.showDateEdit;
		};

		$scope.updatePred = function(pred){
			$scope.predicate = pred;
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
    // $scope.$watchCollection('filtered', function(val){
    // 	$scope.currentPage = 0;
    // }, true);

		$scope.hoveringOver = function(value,key,object) {
      $scope.overStar = value;
      $scope.percent = 100 * (value / $scope.max);
      $scope.selCheckVal = value;
  	};

  	// create user modals
  	$scope.createClient = function (owner) {

    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'modules/users/views/modal-create.client.view.html',
      controller: 'UsersModalController',
      resolve: {
      	owner: function () {
	      	if(owner === 'client'){
		        return 'client';
		    } else {
		        return 'client-client';
		    }
		}
      }
    });

    // modalInstance.result.then(function (selectedItem) {
    //   //$scope.selected = selectedItem;
    // }, function () {
    //   //$log.info('Modal dismissed at: ' + new Date());

    // });
		};
		// create talent modal
		$scope.createTalent = function(){
			var modalInstance = $modal.open({
		      animation: true,
		      templateUrl: 'modules/talents/views/create-talent-modal.client.view.html',
		      controller: 'TalentsModalController'
		    });

		    modalInstance.result.then(function (selectedItem) {
		      //$scope.selected = selectedItem;
		    }, function () {
		      //$log.info('Modal dismissed at: ' + new Date());
		    });
		};

  	// client portal specific methods
  	$scope.selAudition = function(key){
			var selectedAuditions = $scope.selectedAuditions,
					idx = selectedAuditions.indexOf(key);
			if (idx > -1){
			    selectedAuditions.splice(idx, 1);
			}else{
			    selectedAuditions.push(key);
			}
  	};
  	$scope.selCheck = function(filename){
			var selectedAuditions = $scope.selectedAuditions,
					i = 0;
			for(i = 0; i < selectedAuditions.length; ++i){
  			if(selectedAuditions[i] === filename){
  				return true;
  			}
  		}
  	};

  	$scope.hideAudition = function(filename){
			var auditions = $scope.project.auditions,
					limit = auditions.length;
  		// $scope.hideList.push(filename);
  		// get audition id
  		for(var i = 0; i < limit; ++i){
  			if(auditions[i].file.path === filename){
  				auditions[i].hidden = true;
  				$scope.updateNoRefresh();
  			}
  		}
  	};

  	$scope.isHidden = function(filename){
			var auditions = $scope.project.auditions,
					limit = auditions.length;

  		for(var i = 0; i < limit; ++i){
  			if(auditions[i].file.path === filename){
  				return true;
  			}
  		}

  		return false;
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

  	// show part field if talent value is not already checked
  	$scope.showPartFld = function(id){
			var talent = $scope.project.talent;

			if(talent){

				var limit = talent.length,
						i = 0;

    		for(i = 0; i < limit; ++i){
    			if(talent[i].talentId === String(id) && (talent[i].requested === true || talent[i].regular === true)){
  					return false;
    			}
    		}
  		}
 			return true;
   	};
   	$scope.showPartString = function(id){
			var talent = $scope.project.talent;

			if(talent){

				var	limit = talent.length,
						i = 0;

    		for(i = 0; i < limit; ++i){
    			if(talent[i].talentId === String(id) && typeof talent[i].part !== 'undefined' && talent[i].part !== ''){
  					return talent[i].part;
    			}
    		}
			}
  	};
   	$scope.showCreatePartFld = function(id){

			var talent = $scope.project.talent;

			if(talent){

				var limit = talent.length,
						i = 0;

	  		for(i = 0; i < limit; ++i){
	  			if(talent[i].talentId === String(id) && (talent[i].requested === true || talent[i].regular === true)){
						return false;
	  			}
	  		}
			}
 			return true;
   	};
   	$scope.defaults = function(){
   		var allowRoles = ['producer/auditions director', 'audio intern'],
					limitAllow = allowRoles.length,
					roles = Authentication.user.roles,
					limit = roles.length,
					i = 0,
					j = 0;

			for(i = 0; i < limit; ++i){
				for(j = 0; j < limitAllow; ++j){
					if(roles[i] === allowRoles[j]) {
						$scope.searchText.status = 'In Progress';
					}
				}
			}
   	};
		// verify users
		$scope.isOwner = function(){
			var project = $scope.project,
					authUsr = Authentication.user;

			if(typeof project.user === 'object'){
				if(String(project.owner) === String(authUsr._id) || String(project.user._id) === String(authUsr._id)){
					return true;
				} else {
					return false;
				}
			}
		};
		$scope.permitRoles = function(selRoles){
			var allowLimit = selRoles.length,
					roles = Authentication.user.roles,
					limit = roles.length,
					i = 0,
					j = 0;

			for(i = 0; i < limit; ++i){
				for(j = 0; j < allowLimit; ++j){
					if(roles[i] === selRoles[j]) {
						return true;
					}
				}
			}
		};
		// verify create access
		$scope.userCheck = function(){
			var authRoles = Authentication.user.roles;

			if(authRoles[0] !== 'admin' && authRoles[0] !== 'producer/auditions director' && authRoles[0] !== 'audio intern' && authRoles[0] !== 'production coordinator'){
				$location.path('/projects');
			}
		};

		// send talent project welcome email
		$scope.sendTalentEmail = function(talentId){
			var talents = $scope.project.talent;

			// find selected talent
			angular.forEach(talents, function(talent, key) {

				if(talent.talentId === talentId){

					$http.post('/projects/sendtalentemail', {
			        talent: talent,
			        project: $scope.project,
			        override: true
			    }).
					success(function(data, status, headers, config) {
						alert('Selected talent has been emailed.');

						// update project store
						$scope.project = data;
					});

				}

			});

		};

		// send various client emails
		$scope.sendClientEmail = function(type){
			var selectedMainClients = $scope.selectedMainClients,
				project = $scope.project,
				authUser = Authentication.user;

			if(selectedMainClients.length > 0){

				// update email count
    		if(typeof project.counts === 'undefined'){
    			project.counts = {};
    		}
    		if(typeof project.counts[type] === 'undefined'){
    			project.counts[type] = 0;
    		}
    		project.counts[type] += 1;

			$http.post('/projects/sendclientemail', {
		        type: type,
		        project: project,
		        clients: selectedMainClients,
		        count: project.counts[type]
		    }).
				success(function(data, status, headers, config) {
      		alert('Clients sent ' + type + ' Email ');
      		$scope.selectedMainClients = [];

					var note, now = Date.now();
					var item = {
						date: now,
						userid: '',
						username: 'System',
						item: '',
						deleted: false
					};

      		// add note
      		switch(type){
      			case 'opening':
						note = 'Client Notified of Project Start by ' + authUser.displayName;
					break;
					case 'carryover':
						note = 'Client sent Carryover by ' + authUser.displayName;
					break;
					case 'closing':
						note = 'Client Notified of Project Completion by ' + authUser.displayName;
					break;
      		}

      		// add note to note object
      		item.item = note;

      		// add to project discussion
      		project.discussion.push(item);

      		// update project store
			//$scope.update();
			$scope.updateNoRefresh();
      	}).
				error(function(data, status, headers, config) {
					alert('An error occured while sending client emails. Please contact your administrator.');
			    // called asynchronously if an error occurs
			    // or server returns response with an error status.
				});

			} else {
				alert('Please select clients to email!');
			}
		};

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

			// attach client clients to email chain
			// if(type !== 'updateTeam' && type !== 'updateClient' && type !== 'saveDiscussion'){
			// 	for(var i = 0; i < $scope.project.clientClient.length; ++i){
			// 		if($scope.project.clientClient[i].email !== '' && re.test($scope.project.clientClient[i].email)){
			// 			emailCnt += 1;
			// 			toEmails[emailCnt] = $scope.project.clientClient[i].email;
			// 		}
			// 	}
			// }

			// attach clients to email chain
			// if(type !== 'updateTeam' && type !== 'updateClient' && type !== 'saveDiscussion'){
			// 	for(var j = 0; j < $scope.project.client.length; ++j){
			// 		if($scope.project.client[j].email !== '' && re.test($scope.project.client[j].email)){
			// 			emailCnt += 1;
			// 			toEmails[emailCnt] = $scope.project.client[j].email;
			// 		}
			// 	}
			// }

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

		// update group checkbox selectors
		$scope.checkClientClientUsers = function(userId){
			var project = $scope.project;
			if(typeof project.clientClient === 'object'){
				var	limit = project.clientClient.length,
						i = 0;

				if(typeof project === 'object'){
					for(i = 0; i < limit; ++i){
						if(project.clientClient[i].userId === userId){
							return true;
						}
					}
				}
			}
		};
		$scope.checkClientUsers = function(userId){
			var project = $scope.project;
			if(typeof project.client === 'object'){
				var limit = project.client.length,
						i = 0;

				if(typeof project === 'object'){
					for(i = 0; i < limit; ++i){
						if(project.client[i].userId === userId){
							return true;
						}
					}
				}
			}
		};
		$scope.checkClientUsersCreate = function(userId){
			var project = $scope.newProject;
			if(typeof project.client === 'object'){
				var limit = project.client.length,
						i = 0;

				if(typeof project === 'object'){
					for(i = 0; i < limit; ++i){
						if(project.client[i].userId === userId){
							return true;
						}
					}
				}
			}
		};
		$scope.checkTeam = function(userId){
			var project = $scope.project;
			if(typeof project.team === 'object'){
				var limit = project.team.length,
						i = 0;

				if(typeof project === 'object'){
					for(i = 0; i < limit; ++i){
						if(project.team[i].userId === userId){
							return true;
						}
					}
				}
			}
		};
		$scope.checkTalent = function(talentId){
			var project = $scope.project;
			if(typeof project.talent === 'object'){
				var limit = project.talent.length,
						i = 0;

				if(typeof project === 'object'){
					for(i = 0; i < limit; ++i){
						if(project.talent[i].talentId === talentId && project.talent[i].regular === true){
							return true;
						}
					}
				}
			}
		};
		$scope.checkRequestedTalent = function(talentId){
			var project = $scope.project;
			if(typeof project.talent === 'object'){
				var limit = project.talent.length,
						i = 0;

				if(typeof project === 'object'){
					for(i = 0; i < limit; ++i){
						if(project.talent[i].talentId === talentId && project.talent[i].requested === true){
							return true;
						}
					}
				}
			}
		};
		$scope.checkCreateTalent = function(talentId){
			var project = $scope.newProject;
			if(typeof project.talent === 'object'){
				var limit = project.talent.length,
						i = 0;

				for(i = 0; i < limit; ++i){
					if(project.talent[i].talentId === talentId && project.talent[i].regular === true){
						return true;
					}
				}
			}
		};
		$scope.checkRequestedCreateTalent = function(talentId){
			var project = $scope.newProject;
			if(typeof project.talent === 'object'){
				var limit = project.talent.length,
						i = 0;

				for(i = 0; i < limit; ++i){
					if(project.talent[i].talentId === talentId && project.talent[i].requested === true){
						return true;
					}
				}
			}
		};

		$scope.updateTalent = function(talentId, talentName, email, locationISDN, nameLnmCode){

			var found = 0,
					i = 0,
					talents = $scope.project.talent,
					limit = talents.length;

			// gen talent object
			var log, talent = {
							'talentId': talentId,
							'name': talentName,
							'nameLnmCode': talentName,
							'locationISDN': locationISDN,
							'email': email,
							'booked': false,
							'status': 'Cast',
							'part': $scope.parts[talentId] || '',
							'regular': true,
							'requested': false,
							'added': moment().tz('America/New_York').format()
						};

			$scope.addTalent = false;

			// check for existing item
			for(i = 0; i < limit; ++i){
				if(talents[i].talentId === talentId){
					// reset requested to false
					if(talents[i].requested === true){
						talents[i].requested =  false;
					}
					// update regular status
					if(talents[i].regular === true){
						talents[i].regular = false;
					} else {
						talents[i].regular = true;
					}
					// remove talent if no longer selected
					if(talents[i].regular === false && talents[i].requested === false){

						log = {
							type: 'talent',
							sharedKey: talents[i].talentId,
							description: 'talent ' + talents[i].name + ' removed from  ' + $scope.project.title
						};

						$scope.project.log = log;

						$scope.project.talent.splice(i, 1);

						$scope.updateNoRefresh();

						$scope.addTalent = true;

						return;
					}
					found = 1;
				}
			}

			if(found === 0){
				talents.push(talent);

				log = {
						type: 'talent',
						sharedKey: talent.talentId,
						description: 'talent ' + talent.name + ' added to project  ' + $scope.project.title
					};

				$scope.project.log = log;

				// send talent director email
				$http.post('/projects/sendTalentDirectorsEmail', {
					talent: talent,
					projectId: $scope.project._id
				});

			}

			$http.post('/projects/sendTalentEmail', {
				talent: talent,
				project: $scope.project
			}).
			success(function(data, status, headers, config) {
				$scope.project = angular.extend($scope.project, data);
				$scope.addTalent = true;
			});

			// update project store
			//$scope.update();
		};
		$scope.updateRequestTalent = function(talentId, talentName, email, locationISDN, nameLnmCode){

			var found = 0,
					i = 0,
					talents = $scope.project.talent,
					limit = talents.length;

			// gen talent object
			var log, talent = {
							'talentId': talentId,
							'name': talentName,
							'nameLnmCode': talentName,
							'locationISDN': locationISDN,
							'email': email,
							'booked': false,
							'status': 'Cast',
							'part': $scope.parts[talentId] || '',
							'regular': false,
							'requested': true,
							'added': moment().tz('America/New_York').format()
						};

			$scope.addTalent = false;

			// check for existing item
			for(i = 0; i < limit; ++i){
				if(talents[i].talentId === talentId){
					// reset regular talent status
					if(talents[i].regular === true){
						talents[i].regular = false;
					}
					// check requested talent status
					if(talents[i].requested === true){
						talents[i].requested = false;
					} else {
						talents[i].requested = true;
					}
					// remove talent if no longer selected
					if(talents[i].regular === false && talents[i].requested === false){

						log = {
							type: 'talent',
							sharedKey: talents[i].talentId,
							description: 'REQUESTED talent ' + talents[i].name + ' removed from  ' + $scope.project.title
						};

						$scope.project.log = log;

						$scope.project.talent.splice(i, 1);

						$scope.updateNoRefresh();

						$scope.addTalent = true;

						return;
					}
					found = 1;
				}
			}

			if(found === 0){
				talents.push(talent);

				log = {
							type: 'talent',
							sharedKey: talent.talentId,
							description: 'REQUESTED talent ' + talent.name + ' added to project  ' + $scope.project.title
						};

				$scope.project.log = log;
			}

			$http.post('/projects/sendTalentEmail', {
	        talent: talent,
	        project: $scope.project
	    }).
			success(function(data, status, headers, config) {
				$scope.project = angular.extend($scope.project, data);

				$scope.addTalent = true;
			});

			// update project store
			//$scope.update();
		};
		$scope.updateCreateTalent = function(talentId, talentName, email){

			var found = 0,
					i = 0,
					talents = $scope.newProject.talent,
					limit = talents.length;

			// gen talent object
			var talent = {
							'talentId': talentId,
							'name': talentName,
							'email': email,
							'booked': false,
							'status': 'Cast',
							part: $scope.parts[talentId] || '',
							regular: true,
							requested: false,
							added: moment().tz('America/New_York').format()
						};

			// check for existing item
			for(i = 0; i < limit; ++i){
				if(talents[i].talentId === talentId){
					// reset requested status
					if(talents[i].requested === true){
						talents[i].requested = false;
					}
					// set regular status
					if(talents[i].regular === true){
						talents[i].regular = false;
					} else {
						talents[i].regular = true;
					}
					// remove talent if no longer selected
					if(talents[i].regular === false && talents[i].requested === false){
						talents.splice(i, 1);
					}
					found = 1;
				}
			}

			// add talent if never found
			if(found === 0){
				talents.push(talent);
			}

		};
		$scope.updateRequestCreateTalent = function(talentId, talentName, email){

			var found = 0,
					i = 0,
					talents = $scope.newProject.talent,
					limit = talents.length;

			// gen talent object
			var talent = {
							'talentId': talentId,
							'name': talentName,
							'email': email,
							'booked': false,
							'status': 'Cast',
							part: $scope.parts[talentId] || '',
							regular: false,
							requested: true,
							added: moment().tz('America/New_York').format()
						};

			// check for existing item
			for(i = 0; i < limit; ++i){
				if(talents[i].talentId === talentId){
					// reset regular talent if set
					if(talents[i].regular === true){
						talents[i].regular = false;
					}
					// set requested talent
					if(talents[i].requested === true){
						talents[i].requested = false;
					} else {
						talents[i].requested = true;
					}
					// remove talent if no longer selected
					if(talents[i].regular === false && talents[i].requested === false){
						talents.splice(i, 1);
					}
					found = 1;
				}
			}

			// add talent if never found
			if(found === 0){
				talents.push(talent);
			}

		};

		$scope.updateTalentStatus = function(talentId, status){

			var talents = $scope.project.talent,
					limit = talents.length,
					i = 0;

			for(i = 0; i < limit; ++i){
				if(String(talents[i].talentId) === String(talentId)){
					talents[i].status = status;

					var log = {
						type: 'talent',
						sharedKey: talents[i].talentId,
						description: 'talent ' + talents[i].name + ' status updated to ' + talents[i].status
					};

					$scope.project.log = log;

					// update project store
					//$scope.update();
					$scope.updateNoRefresh();
				}
			}

		};

		$scope.getTalentStatus = function(talentId){

			var talents = $scope.project.talent,
					limit = talents.length,
					i = 0;

			for(i = 0; i < limit; ++i){
				if(String(talents[i].talentId) === String(talentId)){
					 return talents[i].status;
				}
			}
		};

		$scope.updateClientClient = function(userId, displayName, email){

			var clientClients = $scope.project.clientClient,
					limit = clientClients.length,
					i = 0;

			// gen user object
			var found = 0,
				user = {
							'userId': userId,
							'name': displayName,
							'email': email
						};

			// check for existing item
			for(i = 0; i < limit; ++i){
				if(clientClients[i].userId === userId){
					clientClients.splice(i, 1);
					found = 1;
				}
			}

			if(found === 0){
				clientClients.push(user);
			}

			// update project store
			//$scope.update();
			$scope.updateNoRefresh();
		};

		$scope.updateClient = function(userId, displayName, email){

			var clients = $scope.project.client,
					limit = clients.length,
					i = 0;

			// gen user object
			var found = 0, user = {
						'userId': userId,
						'name': displayName,
						'email': email
					};

			// check for existing item
			for(i = 0; i < limit; ++i){
				if(clients[i].userId === userId){
					clients.splice(i, 1);
					found = 1;
				}
			}

			if(found === 0){
				clients.push(user);
			}

			// update project store
			//$scope.update();
			$scope.updateNoRefresh();
		};

		$scope.updateCreateClient = function(userId, displayName, email){

			var clients = $scope.newProject.client,
					limit = clients.length,
					i = 0;

			// gen user object
			var found = 0, user = {
						'userId': userId,
						'name': displayName,
						'email': email
					};

			// check for existing item
			for(i = 0; i < limit; ++i){
				if(clients[i].userId === userId){
					clients.splice(i, 1);
					found = 1;
				}
			}

			if(found === 0){
				clients.push(user);
			}

		};

		$scope.toggleBooked = function(talentId){

			var talents = $scope.project.talent,
					limit = talents.length,
					i = 0;

			for(i = 0; i < limit; ++i){
				if(talents[i].talentId === talentId){

					talents[i].booked = !talents[i].booked;

					var log = {
						type: 'talent',
						sharedKey: talents[i].talentId,
						description: 'talent ' + talents[i].name + ' booked status set to ' + talents[i].booked
					};

					$scope.project.log = log;

					// update project store
					$scope.updateNoRefresh();

				}
			}
		};

		// gather booked data
		$scope.getBooked = function(talentId){

			var talents = $scope.project.talent,
					limit = talents.length,
					i = 0;

			for(i = 0; i < limit; ++i){
				if(talents[i].talentId === talentId){
					if(talents[i].booked === true){
						return true;
					}
				}
			}
		};

		// get talent audition note
		$scope.getTalentNote = function(talentId){

			var talents = $scope.project.talent,
					limit = talents.length,
					i = 0;

			if(typeof $scope.project !== 'undefined' && typeof talents !== 'undefined'){
				for(i = 0; i < limit; ++i){
					if(talents[i].talentId === talentId){

						return talents[i].note;

					}
				}
			}

		};
		// save talent note
		$scope.saveTalentNote = function(talentId){

			var talents = $scope.project.talent,
					limit = talents.length,
					i = 0;

			for(i = 0; i < limit; ++i){
				if(talents[i].talentId === talentId){
					talents[i].note = $scope.talentNote[talentId];
					$scope.updateNoRefresh();
				}
			}

		};

		// Create new Project
		$scope.create = function() {

			// method vars
			var proStatus = 'In Progress',
					id = '',
					newProject = $scope.newProject;

			// update project status, if needed
			if(typeof newProject._id !== 'undefined'){
				id = newProject._id;
				proStatus = 'ReAuditioned';
			}

			// Create new Project object
			var project = new Projects ({
				id: id,
				title: newProject.title,
				estimatedCompletionDate: newProject.estimatedCompletionDate,
				estimatedTime: newProject.estimatedTime,
				actualTime: newProject.actualTime,
				status: proStatus,
				sounders: newProject.sounders,
				scripts: newProject.scripts,
				copiedScripts: newProject.copiedScripts,
				referenceFiles: newProject.referenceFiles,
				copiedReferenceFiles: newProject.copiedReferenceFiles,
				description: newProject.description,
				client: newProject.client,
				talent: newProject.talent,
				notifyClient: newProject.notifyClient
			});

			// Redirect after save
			project.$save(function(response) {
				$location.path('projects/' + response._id);

				// Clear form fields
				$scope.name = '';
				$scope.newProject = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Project
		$scope.remove = function( project ) {
			if(confirm('Are you sure?')){
				if ( project ) {
					project.$remove();

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
			}
		};

		// Update existing Project
		$scope.update = function(redirect) {
			var project = $scope.project;
			// determine if update should result in user redirect
			redirect = typeof redirect === 'undefined' ? true : redirect;


			project.$update(function() {
				if(redirect === true){
					$location.path('projects/' + project._id);
				}
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.updateNoRefresh = function(){

			// merge existing open project with updated project
			$http.post('/projects/updateNoRefresh', {
				project: $scope.project
			}).success(function(data, status, headers, config) {

				// update local project document
				if(data){
					$scope.project = angular.extend($scope.project, data);
				}

				// remove update overlay
				$scope.processing = false;

			});

		};

		// duplicate existing project
		$scope.dupCheck = function(){

			if($stateParams.projectId){

				$http.get('/projects/' + $stateParams.projectId, {})
				.success(function(data, status, headers, config) {
					$scope.newProject = data;

					// reset some defaults
					$scope.newProject.title = $scope.newProject.title + ' ReAudition';
					$scope.newProject.talent = [];

					// copy existing scripts and ref files
					$scope.newProject.copiedScripts = $scope.newProject.scripts;
					$scope.newProject.scripts = [];
					$scope.newProject.copiedReferenceFiles = $scope.newProject.referenceFiles;
					$scope.newProject.referenceFiles = [];
					$scope.newProject.estimatedCompletionDate = '';
				});

				$scope.newProjTalentLink = 'createDupProject.talent';
				$scope.newProjLink = 'createDupProject.project';

			}

		};

		// client update

		// update audition rating
		$scope.updateRating = function(path, redirect){

			var auditions = $scope.project.auditions,
					limit = auditions.length,
					j = 0,
					i = 0,
					rateLimit = 0;

			// determine if update should result in user redirect
			redirect = typeof redirect === 'undefined' ? true : redirect;

			// console.log($scope.rate[key]);
			var key, ratingCnt = 0, avgRating = 0;

			// get key for selected audition
			for(j = 0; j < limit; ++j){
				if(auditions[j].file.path === path){
					key = j;
				}
			}

			// walk through existing ratings
			if(typeof auditions[key] !== 'undefined' && typeof auditions[key].rating !== 'undefined'){
				rateLimit = auditions[key].rating.length;
				for(i = 0; i < rateLimit; ++i){
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

		// update phase options
		$scope.updateStatus = function(key){

			// update change value
			var discussion,
					item,
					project = $scope.project,
					i = 0,
					clientLimit = 0;

			var newDate = moment(new Date()).format('MM/DD/YYYY h:mm a');
			project.phases[key].changeDate = newDate;

			// send email if P&P status set to specified values
			if(String(project.phases[key].name) === 'Posting and Publishing'){
				if(String(project.phases[key].status) === 'Holding for more talent' || String(project.phases[key].status) === 'Holding For Requested Talent'){

					// send update email
					$scope.gatherToAddresses('updateStatus');
			    $scope.email.subject = project.title + ' Phase ' + project.phases[key].name + ' Status Update';
			    $scope.email.message += 'Project: ' + project.title + '<br>';
			    $scope.email.message += 'Phase: ' + project.phases[key].name + '<br>';
			    $scope.email.message += 'Status: ' + project.phases[key].status + '<br>';
			    $scope.email.message += 'Start Date: ' + (project.phases[key].startDate || '') + '<br>';
			    $scope.email.message += 'Change Date: ' + (project.phases[key].changeDate || '') + '<br>' + '<br>';
			    $scope.email.message += 'Added by: ' + Authentication.user.displayName + '<br>';
			    $scope.email.message += '<br>' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 || $location.port() !== 443 ? ':' + $location.port() : '') + '/#!/projects/' + project._id + '<br>';

			    $http.post('/projects/sendemail', {
					email: $scope.email
					});

					discussion = 'Project phase ' + project.phases[key].name + ' status changed to ' + project.phases[key].status + ' on ' + newDate + ' EST by ' + Authentication.user.displayName;
					item = {
						date: newDate,
						userid: '',
						username: 'System',
						item: discussion,
						deleted: false
					};
					project.discussion.push(item);

				} else if(String(project.phases[key].status) === 'Waiting For Clients to Be Added'){

						// send update email
						$scope.gatherToAddresses('updateStatus');
					    $scope.email.subject = 'Please add Clients to ' + project.title;
					    $scope.email.message += 'Project: ' + project.title + '<br>';
					    $scope.email.message += 'Phase: ' + project.phases[key].name + '<br>';
					    $scope.email.message += 'Status: ' + project.phases[key].status + '<br>';
					    $scope.email.message += 'Start Date: ' + (project.phases[key].startDate || '') + '<br>';
					    $scope.email.message += 'Change Date: ' + (project.phases[key].changeDate || '') + '<br>' + '<br>';
					    $scope.email.message += 'Added by: ' + Authentication.user.displayName + '<br>';
					    $scope.email.message += '<br>' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 || $location.port() !== 443 ? ':' + $location.port() : '') + '/#!/projects/' + project._id + '<br>';

					    $http.post('/projects/sendemail', {
							email: $scope.email
						});

						discussion = 'Project phase ' + project.phases[key].name + ' status changed to ' + project.phases[key].status + ' on ' + newDate + ' EST by ' + Authentication.user.displayName;
						item = {
							date: newDate,
							userid: '',
							username: 'System',
							item: discussion,
							deleted: false
						};
						project.discussion.push(item);
				}
			}

	    if(project.phases[key].status === 'complete'){
	    	var now = new Date();
	    	project.phases[key].endDate = now.toJSON();
				// update project status only for "Posting and Publishing" phase
				if(project.phases[key].name === 'Posting and Publishing'){
					// reset overall project status to closed
					project.status = 'Closed - Pending Client Decision';

					// send closing email
					clientLimit = project.client.length;
					for(i = 0; i < clientLimit; ++i){
						$scope.selectedMainClients[i] = project.client[i].userId;
					}
					$scope.sendClientEmail('closing');
				}

			}

			// update project store
			//$scope.update();
			$scope.updateNoRefresh();
		};

		// update and store sounders change note
		$scope.updateSoundersStatus = function(){

			var now = new Date(),
					project = $scope.project;
			var item = {
							date: now,
							userid: '',
							username: 'System',
							item: 'Changed to ' + project.sounders + ' by ' + Authentication.user.displayName,
							deleted: false
						};

			project.discussion.push(item);
			$scope.updateNoRefresh();

		};

		$scope.updateProjectStatus = function(){

			var now = new Date(),
					project = $scope.project;
			var item = {
							date: now,
							userid: '',
							username: 'System',
							item: 'Changed to ' + project.status + ' by ' + Authentication.user.displayName,
							deleted: false
						};

			project.discussion.push(item);

			// update project with new status
			$scope.updateNoRefresh();

			// email associated talent and update talent status
			if(project.status === 'Canceled'){

				$http.post('/projects/sendTalentCanceledEmail', {
			        talents: project.talent,
			        projectId: project._id,
			        override: false
			    }).
				success(function(data, status, headers, config) {
					// update project store
					project = angular.extend(project, data);

					// update project with new status
					$scope.update();
				});

			}

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
			// filter in Progress
			if($scope.searchText.clientEmail){
				filterObj.clientEmail = $scope.searchText.clientEmail;
			}

			return filterObj;
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
		// Find a list of Projects
		$scope.find = function() {
			$scope.projects = Projects.query();
		};
		// find list of projects using set download limiter
		$scope.findLimit = function(){
			$http.post('/projects/findLimit', {
        queryLimit: $scope.queryLimit
	    }).
			success(function(data, status, headers, config) {
				$scope.projects = [];
				$scope.projects = data;

				$scope.getProjectsCnt();
			});
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
			}).error(function (data, status, headers, config) {
                console.log(status);
				console.log(data);
			});

		};
		$scope.updateLimit = function(limit){
			$scope.queryLimit = limit;
			$scope.findLimit();
		};

		// dynamically update project view
		Socket.on('projectsListUpdate', function() {
			$scope.findLimitWithFilter();
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

			// update selected rating
			$scope.curRatings();

		};

		Socket.on('projectUpdate', function(pojectData) {

			var project = $scope.project;

			if(String(pojectData.id) === String(project._id)){
				// merge existing open project with updated project
				$http.post('/projects/getproject', {
					id: project._id
				}).success(function(data, status, headers, config) {
					project = angular.extend(project, data);
				});
			}

		});

		// reload auditions if single aud updated
		Socket.on('auditionUpdate', function(pojectID) {

			var project = $scope.project;

			if(String(pojectID.id) === String(project._id)){

				loadAuditions();

			}

		});

		// Find existing Project
		$scope.findOne = function() {
			$scope.project = Projects.get({
				projectId: $stateParams.projectId
			});
		};

		$rootScope.$on('refreshProject',
			function(event, args) {
				$scope.findOneById(args);
			}
		);

		// load project in view
		$scope.loadProject = function(){

			// load project document
			//this.findOne();

			// check for new file
			$http.post('/projects/loadProject', {
				projectId: $stateParams.projectId
			// file found
			}).success(function(data, status, headers, config) {
				$scope.project = new Projects();
				$scope.project = angular.extend($scope.project, data);
			// file not found
			}).error(function(data, status, headers, config) {
				console.log('Problem loading project.');
			});

			loadAuditions();

		};

		// update project after all auditions file have been checked
		if(typeof $scope.watchersObj.procCnt !== 'object'){
			$scope.watchersObj.procCnt = $scope.$watchCollection('procCnt', function(){
				if($scope.procCnt > 0 && $scope.newFileCnt > 0){
					if($scope.procCnt === $scope.newFileCnt){
						// save project changes
						$scope.updateNoRefresh();
						// reset count vars
						$scope.newFileCnt = 0;
						$scope.procCnt = 0;
					}
				}
			});
		}

		// load audio files into player after project object has finished loading
		if(typeof $scope.watchersObj['newProject.estimatedCompletionDate'] !== 'object'){
			$scope.$watchCollection('newProject.estimatedCompletionDate', function(val){
				var now = new Date();

				if($scope.newProject.estimatedCompletionDate !== '' && $scope.newProject.estimatedCompletionDate < now){
					$scope.dateNotice = 'Date selected passed. Please select a future date and time!';
				} else {
					$scope.dateNotice = '';
				}
			});
		}

		$scope.calcProjectProg = function(curProject){
			if(typeof curProject.phases !== 'undefined'){
				var phaseLngth = curProject.phases.length;
				var complSteps = 0,
						i = 0;

				// determine completed steps
				for(i = 0; i < phaseLngth; ++i){
					if(curProject.phases[i].status === 'complete'){
						complSteps++;
					}
				}

				// configure progress bar values
				var perc = Math.floor((100 / phaseLngth) * complSteps);

				// set progress bar values
				return perc;
			}
		};

		// check files
		$scope.checkFileWalk = function(emitStatus){
			var auditions = $scope.project.auditions;

			if(auditions){
				var fn,
					file,
					limit = auditions.length,
					project = $scope.project;

				angular.forEach(auditions, function(value, key){

					if(typeof value.filecheck === 'undefined' || value.filecheck === 0){

						// increment file count
						$scope.newFileCnt += 1;

						// new file location
						fn = value.file.name;
						file = '/res/auditions/'+project._id+'/'+fn;

						// check for new file
						$http.post('/projects/fileExists', {
							file: file
						// file found
						}).success(function(data, status, headers, config) {
							auditions[key].filecheck = 1;
							auditions[key].filecheckdate = new Date();
							$scope.procCnt += 1;
						// file not found
						}).error(function(data, status, headers, config) {
							auditions[key].filecheck = 2;
							auditions[key].filecheckdate = new Date();
							$scope.procCnt += 1;
						});

					}

					if(key === (limit-1)) {
						$scope.fileCheck = true;

						if(typeof emitStatus !== 'undefined' || emitStatus === 1){
							alert('File check complete.');
						}
					}

				});
			}

		};

		// check all files assigned to project
		$scope.checkAllFiles = function(){

			var auditions = $scope.project.auditions,
					limit = auditions.length,
					i = 0;

			// reset file check status for all files
			for(i = 0; i < limit; ++i){
				auditions[i].filecheck = 0;

				// init file check walk on reset finish
				if((i+1) === limit){
					$scope.checkFileWalk(1);
				}
			}

		};

		if(typeof $scope.watchersObj.project !== 'object'){
			$scope.watchersObj.project = $scope.$watchCollection('project', function(val){

				if(typeof $scope.project === 'object'){

					if(typeof $scope.watchersObj.project.auditions !== 'object'){
						$scope.watchersObj.project.auditions = $scope.$watchCollection('project.auditions',function(){
							// var file;

							// audition file check
							if($scope.fileCheck === false){
								$scope.checkFileWalk();
							}

						});
					}

					// check for values then do things
					if(typeof $scope.watchersObj.project.referenceFiles !== 'object'){
						$scope.watchersObj.project.referenceFiles = $scope.$watchCollection('project.referenceFiles',function(){
							if(typeof $scope.project.referenceFiles === 'object'){
								if($scope.project.referenceFiles.length > 0){
									$scope.toggleRefs = true;
								}
							}
						});
					}

					// update progress bar
					if(typeof $scope.watchersObj.project.phases !== 'object'){
						$scope.watchersObj.project.phases = $scope.$watchCollection('project.phases', function(val){

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

								// if(perc >= 100){
								// 	$scope.project.status = 'Complete';
								// } else {
								// 	//$scope.project.status = 'In Progress';
								// }

								// set progress bar values
								$scope.dynamic = perc;
							}

						});
					}

				}
			});
		}

		// verify audio objects
		$scope.verifyAudio = function(key){
			var auditions = $scope.project.auditions;

			if(typeof auditions[key] === 'object'){
				if(typeof auditions[key].file === 'object'){
					return true;
				}
			}
			return false;
		};

		// check for media file
		$scope.checkForAudio = function(file){

			var fileExt = /(\w{3})$/i.exec(file);

			if(fileExt[1].toLowerCase() === 'mp3'){
				return true;
			}

		};

		$scope.verifyFile = function(file){

			if(typeof $scope.verifyFilesList[file] === 'undefined'){

				if($scope.verifyFilesList[file] !== 'scanning' || $scope.verifyFilesList[file] !== true || $scope.verifyFilesList[file] !== false){

					$scope.verifyFilesList[file] = 'scanning';

					$http.post('/projects/fileExists', {
						file: file
					}).success(function(data, status, headers, config) {
						$scope.verifyFilesList[file] = true;
						return true;
					}).error(function(data, status, headers, config) {
						$scope.verifyFilesList[file] = false;
				        return false;
				    });

				}

			}

		};

		$scope.stopAudio = function(){
			var audio = $scope.audio;

			if(typeof audio === 'object'){
				audio.unbind();
				audio.stop();
				// console.log('stop');
				$scope.audioStatus = 2;
			}
		};

		$scope.playAudioNoTrack = function(key, filename, fileDir){

			var fileName = '';

			// assign file name
			if(typeof fileDir === 'undefined'){
				fileName = '/res/auditions/' + $scope.project._id + '/' + filename;
			} else {
				fileName = fileDir + '/' + filename;
			}

			if(IS_NOT_MOBILE){

				// check media file play state
				// console.log(typeof $scope.audio);
				// console.log($scope.lastAudioID);
				if(key !== $scope.lastAudioID && typeof $scope.audio === 'object'){
					$scope.audio.unbind();
					$scope.audio.stop();
					// console.log('stop');
				}
				if(typeof $scope.audio === 'object' && key === $scope.lastAudioID && $scope.audioStatus === 1){
					$scope.audio.pause();
					$scope.audioStatus = 0;
					//console.log('pause');
					return;
				}
				if(typeof $scope.audio === 'object' && key === $scope.lastAudioID && $scope.audioStatus === 0){
					$scope.audio.play();
					$scope.audioStatus = 1;
					// console.log('play');
					return;
				}
				// if(typeof $scope.audio === 'object' && key === $scope.lastAudioID && $scope.audioStatus === 2){
				// 	$scope.audio.play();
				// 	$scope.audioStatus = 1;
				// 	// console.log('play');
				// 	return;
				// }

				//if($scope.audio = ngAudio.load(fileName)){
					$scope.audio = ngAudio.load(fileName).play();
					$scope.loop = 0;
					//$scope.audio.unbind();
					$scope.audioStatus = 1;

					// store current audio key
					$scope.lastAudioID = key;

					//$scope.audio.play();
				//}

			// mobile and tablet playback
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

		// play audio on load
		// $scope.$watchCollection('audio', function(val){
		// 	if(typeof $scope.audio === 'object'){
		// 		$scope.audio.play();
		// 	}
		// });

		$scope.updateDueDate = function(){

			var project = $scope.project;

			var newDate = moment(new Date(project.estimatedCompletionDate)).format('MM/DD/YYYY h:mm a');
			var newNewDate = moment(new Date()).format('MM/DD/YYYY h:mm a');

			project.estimatedCompletionDate = newDate;

			var discussion = 'Due date and time extended to ' + newDate + ' EST by ' + Authentication.user.displayName;
			var item = {
				date: newNewDate,
				userid: '',
				username: 'System',
				item: discussion,
				deleted: false
			};

			project.discussion.push(item);

			// send update email
			$scope.gatherToAddresses('saveDiscussion');
		    $scope.email.subject = project.title + ' - Audition Due Date and Time Extended';
		    $scope.email.message = 'Project: ' + project.title + '<br>';
		    $scope.email.message += 'Added by: System<br>';
				$scope.email.message += 'Discussion Item: ' + discussion + '<br>';
		    $scope.email.message += '<br>' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 || $location.port() !== 443 ? ':' + $location.port() : '') + '/#!/projects/' + project._id + '<br>';

		    $http.post('/projects/sendemail', {
				email: $scope.email
			});

			// walk through and update phases if project closed to reset phase settings
			if(String(project.status) === 'Closed - Pending Client Decision'){
				var limit = project.phases.length,
						i = 0;

				for(i = 0; i < limit; ++i){
					if(project.phases[i].name === 'Posting and Publishing'){
						project.phases[i].status = 'in progress';
						project.phases[i].endDate = '';
					}
				}
			}

			// reset project status
			project.status = 'In Progress';

			// clear preclose summary bool
			project.preClose = false;

			// update project store
			//$scope.update();
			$scope.updateNoRefresh();

			$scope.showDateEdit = false;
		};

		// save discussion item
		$scope.saveDiscussion = function(){

			var project = $scope.project,
					authUser = Authentication.user;

			if(typeof $scope.discussion !== 'undefined' && this.discussion !== ''){
				var now = new Date();
				var item = {
							date: now.toJSON(),
							userid: authUser._id,
							username: authUser.displayName,
							item: $scope.discussion || this.discussion,
							deleted: false
						};

				project.discussion.push(item);

				// send update email
				$scope.gatherToAddresses('saveDiscussion');
		    $scope.email.subject = project.title + ' discussion added';
		    $scope.email.message = 'Project: ' + project.title + '<br>';
		    $scope.email.message += 'Added by: ' + authUser.displayName + '<br>';
				$scope.email.message += 'Discussion Item: ' + this.discussion + '<br>';
		    $scope.email.message += '<br>' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 || $location.port() !== 443 ? ':' + $location.port() : '') + '/#!/projects/' + project._id + '<br>';

				$scope.discussion = '';
				this.discussion = '';

		    $http.post('/projects/sendemail', {
				email: $scope.email
				});
				// update project store
				//$scope.update();
				$scope.updateNoRefresh();
			}
		};

		$scope.deleteDiscussion = function(key){

			var project = $scope.project;

			// reverse selction id
			var selVal = (project.discussion.length - 1) - key;

			// apply to reverse index
			project.discussion[selVal].deleted = true;

			// update project store
			$scope.updateNoRefresh();
		};

		// update project when audition talent assignment is adjusted
		$scope.updateTalentAssignedStatus = function(selTalent){

			var talents = $scope.project.talent,
				limit = talents.length,
				i = 0;

			// update talents with posted status for uploaded talent
			for(i = 0;i < limit; ++i){
				if(talents[i].talentId === selTalent && talents[i].status !== 'Posted'){
					talents[i].status = 'Posted';
				}
				if(limit === (i+1)){
					// update project store
					$scope.updateNoRefresh();
				}
			}

		};

		$scope.delScript = function(idx){

			var project = $scope.project;

			// verify user wants to delete file
			if (confirm('Are you sure?')) {

				var file = '/res/scripts/' + project._id + '/' + project.scripts[idx].file.name;

				$http.put('/projects/deletefile', {
					fileLocation: file,
					projectId: project._id
				  });

				project.scripts.splice(idx, 1);

				// update project store
				$scope.updateNoRefresh();

			}
		};

		// remove temporary script file
		$scope.delTempScript = function(idx){

			var project = $scope.newProject,
					file = project.scripts[idx].file.name;

			$http.post('/projects/deleteTempScript', {
        fileLocation: file
	    }).success(function(data, status, headers, config) {
				project.scripts.splice(idx, 1);
			});

		};

		// delete copy script file
		$scope.delCopyScript = function(idx){
		    $scope.newProject.copiedScripts.splice(idx, 1);
		};

	var performScriptUpload = function(file, i, $files){

		var project = $scope.project;

		$scope.upload = $upload.upload({
			url: 'projects/uploads/script', //upload.php script, node.js route, or servlet url
			//method: 'POST' or 'PUT',
			data: {projectId: project._id},
			file: file, // or list of files ($files) for html5 only
		  }).progress(function(evt) {
			$scope.uploadStatus = (i + 1) + ' of ' + $files.length + ' files uploaded';
			$scope.uploadfile = evt.config.file.name;
			$scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
			}).success(function(data, status, headers, config) {
			// file is uploaded successfully
			//$scope.project = angular.extend($scope.project, data);

				project.scripts.push(data);

				// save project on finish
				if((i+1) === $files.length){

					// generate new system note
					var now = Date.now();
					var note = 'New scripts uploaded, talent notifed';
					var item = {
						date: now,
						userid: '',
						username: 'System',
						item: note,
						deleted: false
					};

					// add to project discussion
					$scope.project.discussion.push(item);

					// send note email
					$scope.gatherToAddresses('saveDiscussion');
					$scope.email.subject = project.title + ' - ' + note;
					$scope.email.message = 'Project: ' + project.title + '<br>';
					$scope.email.message += 'Added by: System<br>';
						$scope.email.message += 'Discussion Item: ' + note + '<br>';
					$scope.email.message += '<br>' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 || $location.port() !== 443 ? ':' + $location.port() : '') + '/#!/projects/' + project._id + '<br>';

					$http.post('/projects/sendemail', {
						email: $scope.email
					});

					// update project store
					$scope.updateNoRefresh();

					// send out update emails to assigned project talentIds
					$http.post('/projects/sendTalentScriptUpdateEmail', {
						projectId: project._id,
						talents: project.talent,
						chgMade: 'Script'
					});

				}

			});
  	};

  	// upload script file
	$scope.uploadScript = function($files) {
	    angular.forEach($files, function(file, key) {
	      performScriptUpload(file, key, $files);
		});
  	};

	var performUploadTempScript = function(file, i, $files){
		  $scope.upload = $upload.upload({
        url: 'projects/uploads/script/temp', //upload.php script, node.js route, or servlet url
        data: {
					project: $scope.project
				},
        file: file, // or list of files ($files) for html5 only
      }).progress(function(evt) {
        $scope.uploadStatus = (i + 1) + ' of ' + $files.length + ' files uploaded';
      	$scope.uploadfile = evt.config.file.name;
        $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
      }).success(function(data, status, headers, config) {
        // file is uploaded successfully
        $scope.newProject.scripts.push(data[0]);
      });
  	};

  	$scope.uploadTempScript = function($files) {
    	angular.forEach($files, function(file, key) {
    		performUploadTempScript(file, key, $files);
  		});
  	};

  	// set published status
  	$scope.updatePublished = function(key){
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

	// update project when audition talent assignment is adjusted
	$scope.updateTalentAssignedStatusSingle = function(audition){

		var selTalent = audition.talent,
			talents = $scope.project.talent,
			limit = talents.length,
			i = 0;

		// update talents with posted status for uploaded talent
		for(i = 0;i < limit; ++i){
			if(talents[i].talentId === selTalent && talents[i].status !== 'Posted'){
				talents[i].status = 'Posted';
			}
			if(limit === (i+1)){
				// update project store
				saveAudition(audition);
				$scope.updateNoRefresh();
			}
		}

	};

  	// set published status
  	$scope.renameSingle = function(audition){
		saveAudition(audition);
  	};

  	// set published status
  	$scope.updatePublishedSingle = function(audition){
		saveAudition(audition);
  	};

	$scope.delAuditionSingle = function(audition){

		// verify user wants to delete file
		if (confirm('Are you sure?')) {

			// delete selected file
			$http.post('/projects/deleteAudition', {
				audition: audition
			}).success(function(data, status, headers, config) {

				loadAuditions();

			}).error(function(data, status, headers, config) {
				console.log('Problem deleting audition.');
			});


		}
	};

	// update audition rating
	$scope.updateRatingSingle = function(audition, redirect){

		var auditions = $scope.project.auditions,
			j = 0,
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


  	var performUploadReferenceFile = function(file, i, $files){

			var project = $scope.project;

	  	$scope.upload = $upload.upload({
	        url: 'projects/uploads/referenceFile', //upload.php script, node.js route, or servlet url
					data: {projectId: project._id},
	        file: file, // or list of files ($files) for html5 only
	    }).progress(function(evt) {
	        $scope.uploadStatus = (i + 1) + ' of ' + $files.length + ' files uploaded';
	      	$scope.uploadfile = evt.config.file.name;
	        $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
	    }).success(function(data, status, headers, config) {

				project.referenceFiles.push(data);

				// save project on finish
				if((i+1) === $files.length){

					// send out update emails to assigned project talentIds
					$http.post('/projects/sendTalentScriptUpdateEmail', {
						projectId: project._id,
						talents: project.talent,
						chgMade: 'Reference'
					});

					// generate new system note
					var now = Date.now();
					var note = 'New reference files uploaded, talent notifed';
					var item = {
						date: now,
						userid: '',
						username: 'System',
						item: note,
						deleted: false
					};
      		// add to project discussion
      		project.discussion.push(item);

					// send note email
					$scope.gatherToAddresses('saveDiscussion');
			    $scope.email.subject = project.title + ' - ' + note;
			    $scope.email.message = 'Project: ' + project.title + '<br>';
			    $scope.email.message += 'Added by: System<br>';
					$scope.email.message += 'Discussion Item: ' + note + '<br>';
			    $scope.email.message += '<br>' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 || $location.port() !== 443 ? ':' + $location.port() : '') + '/#!/projects/' + project._id + '<br>';

			    $http.post('/projects/sendemail', {
						email: $scope.email
					});

					// update project store
					$scope.updateNoRefresh();
				}

			});
  	};

  	// upload reference files to server
  	$scope.uploadReferenceFile = function($files) {
    //$files: an array of files selected, each file has name, size, and type.

    	angular.forEach($files, function(file, key) {
	    	performUploadReferenceFile(file, key, $files);
    	});
  	};

  	var performUploadTempReferenceFile = function(file, i, $files){
  		$scope.upload = $upload.upload({
	        url: 'projects/uploads/referenceFile/temp', //upload.php script, node.js route, or servlet url
	        data: {project: $scope.project},
	        file: file, // or list of files ($files) for html5 only
	    }).progress(function(evt) {
	        $scope.uploadStatus = (i + 1) + ' of ' + $files.length + ' files uploaded';
	      	$scope.uploadfile = evt.config.file.name;
	        $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
	    }).success(function(data, status, headers, config) {
	        // file is uploaded successfully
	        //console.log(data);
	        $scope.newProject.referenceFiles.push(data[0]);
	    });
  	};

  	$scope.uploadTempReferenceFile = function($files) {
	    //$files: an array of files selected, each file has name, size, and type.
	    angular.forEach($files, function(file, key) {

		    performUploadTempReferenceFile(file, key, $files);

    	});
  	};

	  	// delete temp reference file
  	$scope.delTempReferenceFile = function(idx){

			var file = '/res/referenceFiles/temp/' + $scope.newProject.referenceFiles[idx].file.name,
				project = $scope.project;

			$http.post('/projects/deletefile', {
		        fileLocation: file,
				projectId: project._id
			}).success(function(data, status, headers, config) {
			});

	    $scope.newProject.referenceFiles.splice(idx, 1);

		};

		// delete copy reference file
		$scope.delCopyReferenceFile = function(idx){
		    $scope.newProject.copiedReferenceFiles.splice(idx, 1);
		};

		// delete reference file
  	$scope.delReferenceFile = function(idx){

			var project = $scope.project;

			// verify user wants to delete file
			if (confirm('Are you sure?')) {

				$scope.processing = true;

				var file = '/res/referenceFiles/' + project._id + '/' + project.referenceFiles[idx].file.name;

				$http.post('/projects/deletefile', {
			        fileLocation: file,
					projectId: project._id
				}).success(function(data, status, headers, config) {

					// delete selected file
					project.referenceFiles.splice(idx, 1);

					// update project store
					$scope.updateNoRefresh();

				});

			}
		};

		$scope.delAudition = function(idx){

			var project = $scope.project;

			// verify user wants to delete file
			if (confirm('Are you sure?')) {

				$scope.processing = true;

				if(typeof project.auditions[idx].file !== 'undefined'){
					var file = '/res/auditions/' + project._id + '/' + project.auditions[idx].file.name;

				    // delete selected file
					$http.post('/projects/deletefile', {
						fileLocation: file,
						projectId: project._id
					}).success(function(data, status, headers, config) {

						project.auditions.splice(idx, 1);

						// update project store
						//$scope.update();
						$scope.updateNoRefresh();

					});

				} else {

					project.auditions.splice(idx, 1);

					// update project store
					$scope.updateNoRefresh();

				}

			}
		};

		$scope.newAudUpload = '';
		$scope.audFiles = [];
		$scope.uploadedAuds = [];
		$scope.uploadAudsCnt = 0;
		$scope.audUpComp = 0;
		if(typeof $scope.watchersObj.newAudUpload !== 'object'){
			$scope.$watchCollection('newAudUpload', function(){

				// get curent index
				var i = $scope.uploadedAuds.length;

				// file is uploaded successfully
				$scope.uploadedAuds[i] = $scope.newAudUpload;

				// update talents with posted status for uploaded talent
				if(typeof $scope.project.talent !== 'undefined' && $scope.project.talent.length > 0){
					angular.forEach($scope.project.talent, function(talent, key) {

						if(talent.talentId === $scope.newAudUpload.talent){
							$scope.project.talent[key].status = 'Posted';
						}

						// save on finish loop
						if($scope.project.talent.length === (key+1)){

							// save project on finish
							if($scope.uploadAudsCnt === $scope.uploadedAuds.length){

								//$scope.project.auditions = $scope.project.auditions.concat($scope.uploadedAuds);

								// save with pause, ensure loop finished
								//setTimeout(function(){

								// save project on last file upload
								$scope.verifyFilesList = [];

								// update project store
								$scope.updateNoRefresh();
								loadAuditions();

								// trigger new file check walk
								$scope.fileCheck = false;

								//}, 1500);

							}
						}

					});
				} else {
					// save project on finish
					if($scope.uploadAudsCnt === $scope.uploadedAuds.length){

						//$scope.project.auditions = $scope.project.auditions.concat($scope.uploadedAuds);

						// save with pause, ensure loop finished
						//setTimeout(function(){

						// save project on last file upload
						$scope.verifyFilesList = [];

						// update project store
						$scope.updateNoRefresh();
						loadAuditions();

						// trigger new file check walk
						$scope.fileCheck = false;

						//}, 1500);

					}
				}

			});
		}

	var performUploadAudition = function(file, i, $files){

		$scope.upload = $upload.upload({
			url: 'projects/uploads/audition', //upload.php script, node.js route, or servlet url
			data: {projectId: $scope.project._id},
			file: file // or list of files ($files) for html5 only
		}).progress(function(evt) {
			$scope.uploadStatus = (i + 1) + ' of ' + $files.length + ' files uploaded';
			$scope.uploadfile = evt.config.file.name;
			//$scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
		}).success(function(data, status, headers, config) {
			$scope.newAudUpload = data;
			$scope.audUpComp += 1;
			$scope.uploadprogress = parseInt(100.0 / ($files.length - ($scope.audUpComp - 1)));
		});

	};
	$scope.uploadAudition = function($files) {

		$scope.uploadAudsCnt = 0;

		if(typeof $files !== 'undefined' && $files.length > 0){

			// reset upload counter
			$scope.audUpComp = 0;
			$scope.uploadAudsCnt = $files.length;

			$scope.uploadedAuds = [];
			$scope.audFiles = $files;

			// prevent any other action
			$scope.processing = true;

			//$files: an array of files selected, each file has name, size, and type.
			angular.forEach($files, function(file, key) {

				performUploadAudition(file, key, $files);

			});

		}

	};

	var performUploadTempAuditionFile = function(file, i, $files){
  		$scope.upload = $upload.upload({
	        url: 'projects/uploads/audition/temp', //upload.php script, node.js route, or servlet url
	        data: {project: $scope.project},
	        file: file, // or list of files ($files) for html5 only
	    }).progress(function(evt) {
	        $scope.uploadStatus = (i + 1) + ' of ' + $files.length + ' files uploaded';
	      	$scope.uploadfile = evt.config.file.name;
	        $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
	    }).success(function(data, status, headers, config) {
	        // file is uploaded successfully
	        $scope.auditions.push(data);
	    });
  	};

  	$scope.uploadTempAudition = function($files) {
	    //$files: an array of files selected, each file has name, size, and type.
	    angular.forEach($files, function(file, key) {

    		performUploadTempAuditionFile(file, key, $files);

  		});
  	};

  	// delete uploaded temp audition
  	$scope.delTempAudition = function(key){

			var auditions = $scope.auditions,
				project = $scope.project;

  		var file = '/res/auditions/temp/' + auditions[key].file.name;

			$http.post('/projects/deletefile', {
	        fileLocation: file,
			projectId: project._id
	    });

	    auditions.splice(key, 1);

  	};

	// perform talent audition uploads
	$scope.submitTalentAuditions = function(){
		//console.log($stateParams.talentId);

		if(confirm('Are you sure?') === true){

			$http.post('/projects/uploads/talentAuditions', {
				auditions: $scope.auditions,
				project: $scope.project,
				talent: $stateParams.talentId
			}).success(function(data, status, headers, config) {
				// file is uploaded successfully
				//console.log(data);
				$scope.auditions = [];

				alert('Auditions have been submitted. Thank you!');
			});

		}

	};

	// talent uploads modal
  	$scope.talentSubmissionsModal = function(talent){
  		var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'modules/projects/views/talent-submissions-modal.client.view.html',
      controller: 'ProjectsModalController',
      resolve: {
      	data: function () {
	        return {
	        	talent: talent,
	        	projectId: $scope.project._id
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

	}
]);

'use strict';

//Projects service used to communicate Projects REST endpoints
angular.module('projects').factory('Projects', ['$resource',
	function($resource) {
		return $resource('projects/:projectId', { projectId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Configuring the Articles module
angular.module('reports').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Reports', 'reports', 'dropdown', '/reports(/create)?', false, ['admin','producer/auditions director', 'audio intern','talent director'], 2);
		//Menus.addSubMenuItem('topbar', 'reports', 'Generate Reports', 'reports');
		Menus.addSubMenuItem('topbar', 'reports', 'Missing Auditions', 'reports/missing-auditions');
		Menus.addSubMenuItem('topbar', 'reports', 'Auditions Booked', 'reports/auditions-booked');
		Menus.addSubMenuItem('topbar', 'reports', 'New Project Submissions', 'tools/list-newprojects');
		Menus.addSubMenuItem('topbar', 'reports', 'Auditions Per Producer', 'reports/auds-per-producer');
		Menus.addSubMenuItem('topbar', 'reports', 'Server Stats', 'reports/server-stats');
	}
]);

'use strict';

//Setting up route
angular.module('reports').config(['$stateProvider',
	function($stateProvider) {
		// Reports state routing
		$stateProvider.
		state('listReports', {
			url: '/reports',
			templateUrl: 'modules/reports/views/list-reports.client.view.html'
		}).
		state('missingAuditionsReports', {
			url: '/reports/missing-auditions',
			templateUrl: 'modules/reports/views/missing-auditions-reports.client.view.html'
		}).
		state('missingAuditionsBooked', {
			url: '/reports/auditions-booked',
			templateUrl: 'modules/reports/views/auditions-booked.client.view.html'
		}).
		state('serverStats', {
			url: '/reports/server-stats',
			templateUrl: 'modules/reports/views/server-stats.client.view.html'
		}).
		state('audsPerProducer', {
			url: '/reports/auds-per-producer',
			templateUrl: 'modules/reports/views/auds-per-producer.client.view.html'
		});
		// state('createReport', {
		// 	url: '/reports/create',
		// 	templateUrl: 'modules/reports/views/create-report.client.view.html'
		// }).
		// state('viewReport', {
		// 	url: '/reports/:reportId',
		// 	templateUrl: 'modules/reports/views/view-report.client.view.html'
		// }).
		// state('editReport', {
		// 	url: '/reports/:reportId/edit',
		// 	templateUrl: 'modules/reports/views/edit-report.client.view.html'
		// });
	}
]);

/*global escape: true */
'use strict';

// Reports controller
angular.module('reports').controller('ReportsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Reports', '$http',
	function($scope, $stateParams, $location, Authentication, Reports, $http ) {
		$scope.authentication = Authentication;
		$scope.dateFilter = '';
		$scope.sysstats = {};
		$scope.intervalID = '';

		// find missing auditions report methods
		$scope.findMissingAuditions = function(){

			$http.post('/reports/findMissingAuds',{dateFilter:$scope.dateFilter}).
			success(function(data, status, headers, config) {
				$scope.missingAuditions = data;
			});

		};

		// populate auditions booked report
		$scope.findAuditionsBooked = function(){

			if($scope.dateFilterStart && $scope.dateFilterEnd){

				$http.post('/reports/findAuditionsBooked',
				{
					dateFilterStart: $scope.dateFilterStart,
					dateFilterEnd: $scope.dateFilterEnd
				}).
				success(function(data, status, headers, config) {
					$scope.results = data;
				});

			} else {

				alert('Please select a start and end date!');

			}

		};

		// convert local JSON to CSV for download
		$scope.convertToCSV = function(localDoc){

			if($scope.dateFilterStart && $scope.dateFilterEnd){

				$http.post('/reports/convertToCSV',
				{
					jsonDoc: localDoc
				}).
				success(function(data, status, headers, config) {

					var a         = document.createElement('a');
					a.href        = 'data:attachment/csv,' + escape(data);
					a.target      = '_blank';
					a.download    = 'Auditions-Booked.csv';

					document.body.appendChild(a);
					a.click();

				});

			}

		};

		// gather system information
		$scope.systemInfo = function(){

			// query server
			$http.post('/reports/systemStats',
			{}).
			success(function(data, status, headers, config) {
				$scope.sysstats = data;
			});

			//$scope.intervalID = window.setInterval($scope.systemInfo, 1000);
		};


		// find auditions uploaded per producer
		$scope.findAudsPerProducer = function(){

			$http.post('/reports/findAudsPerProducer',{
                dateFilterStart: $scope.dateFilterStart,
                dateFilterEnd: $scope.dateFilterEnd
            }).
			success(function(data, status, headers, config) {
				$scope.audsPerProducer = data;
			});

		};

	}
]);

'use strict';

//Reports service used to communicate Reports REST endpoints
angular.module('reports').factory('Reports', ['$resource',
	function($resource) {
		return $resource('reports/:reportId', { reportId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Configuring the Articles module
angular.module('talents').run(['Menus', 'Authentication',
	function(Menus, Authentication) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Talent', 'talents', 'dropdown', '/talents(/create)?', false, ['admin', 'producer/auditions director', 'audio intern', 'production coordinator', 'talent director'], 3);
		Menus.addSubMenuItem('topbar', 'talents', 'Browse', 'talents', false, false, ['admin','producer/auditions director', 'audio intern', 'production coordinator', 'talent director']);
		Menus.addSubMenuItem('topbar', 'talents', 'New', 'talents/create', false, false, ['admin', 'talent director','producer/auditions director', 'audio intern', 'production coordinator']);
	}
]);
'use strict';

//Setting up route
angular.module('talents').config(['$stateProvider',
	function($stateProvider) {
		// Talents state routing
		$stateProvider.
		state('listTalents', {
			url: '/talents',
			templateUrl: 'modules/talents/views/list-talents.client.view.html'
		}).
		state('createTalent', {
			url: '/talents/create',
			templateUrl: 'modules/talents/views/create-talent.client.view.html'
		}).
		state('viewTalent', {
			url: '/talents/:talentId',
			templateUrl: 'modules/talents/views/view-talent.client.view.html'
		}).
		state('editTalent', {
			url: '/talents/:talentId/edit',
			templateUrl: 'modules/talents/views/edit-talent.client.view.html'
		});
	}
]);
'use strict';

// Talents controller
angular.module('talents').controller('TalentsModalController', ['$scope', '$stateParams', '$location', 'Authentication', 'Talents', '$http', '$modalInstance', '$rootScope',
	function($scope, $stateParams, $location, Authentication, Talents, $http, $modalInstance, $rootScope) {
		$scope.authentication = Authentication;

		// talent static options
		$scope.typeOptions = ['Email','Phone'];
		$scope.unionOptions = ['union','non-union'];
		$scope.locations = ['Offsite', 'Las Vegas', 'New York', 'Richmond', 'Santa Monica', 'Virginia Beach', 'Washington DC'];
		$scope.exclusivityOpts = ['Non-Union Exclusive', 'Union', 'Non-Union Exclusive and Union', 'Foreign Language Agreement Non-Union', 'Foreign Language Agreement Union', 'Foreign Language Agreement Non-Union and Union', 'ISDN Non-Union', 'ISDN Union', 'ISDN Non-Union and Union', 'Independent Contractor Agreement Non-Union', 'Independent Contractor Agreement Union', 'Independent Contractor Agreement Non-Union and Union'];
		$scope.unionJoinedOpts = ['SAG/AFTRA', 'OTHER'];
		$scope.unionSelected = [];
		$scope.unionJoinSelected = [];
		$scope.prefLangOpts = ['English', 'Spanish'];
		$scope.typeSelected = 'Email';
		$scope.selTypecasts = [];
		$scope.prefLanguage = 'English';
		// store talent project data
		$scope.projectTalentIdx = [];
		$scope.talentStatus = ['Cast', 'Emailed', 'Scheduled', 'Message left', 'Out', 'Received needs to be posted', 'Posted', 'Not Posted (Bad Read)'];
		$scope.archived = false;

		// toggle checkbox options
		$scope.toggleUnion = function(union){
			  var idx = $scope.talent.unionStatus.indexOf(union);
			  if (idx > -1){
			    $scope.talent.unionStatus.splice(idx, 1);
			  }else{
			    $scope.talent.unionStatus.push(union);
			}
		};
		$scope.toggleUnionJoin = function(union){
			  var idx = $scope.talent.unionJoined.indexOf(union);
			  if (idx > -1){
			    $scope.talent.unionJoined.splice(idx, 1);
			  }else{
			    $scope.talent.unionJoined.push(union);
			}
		};
		$scope.toggleType = function(type){
			  var idx = $scope.talent.type.indexOf(type);
			  if (idx > -1){
			    $scope.talent.type.splice(idx, 1);
			  }else{
			    $scope.talent.type.push(type);
			}
		};
		$scope.toggleTypecast = function(typeCast){
			  var idx = $scope.talent.typeCasts.indexOf(typeCast);
			  if (idx > -1){
			    $scope.talent.typeCasts.splice(idx, 1);
			  }else{
			    $scope.talent.typeCasts.push(typeCast);
			}
		};
		// used for creating new talent
		$scope.toggleNewUnion = function(union){
			  var idx = $scope.unionSelected.indexOf(union);
			  if (idx > -1){
			    $scope.unionSelected.splice(idx, 1);
			  }else{
			    $scope.unionSelected.push(union);
			}
		};
		$scope.toggleNewUnionJoin = function(union){
			  var idx = $scope.unionJoinSelected.indexOf(union);
			  if (idx > -1){
			    $scope.unionJoinSelected.splice(idx, 1);
			  }else{
			    $scope.unionJoinSelected.push(union);
			}
		};
		$scope.toggleNewType = function(type){
			  var idx = $scope.typeSelected.indexOf(type);
			  if (idx > -1){
			    $scope.typeSelected.splice(idx, 1);
			  }else{
			    $scope.typeSelected.push(type);
			}
		};
		$scope.toggleNewTypecast = function(typeCast){
			  var idx = $scope.selTypecasts.indexOf(typeCast);
			  if (idx > -1){
			    $scope.selTypecasts.splice(idx, 1);
			  }else{
			    $scope.selTypecasts.push(typeCast);
			}
		};

		$scope.checkUnionStatus = function(unionVals){
			if(typeof unionVals === 'object'){
				for(var i = 0; i < unionVals.length; ++i){
					if(unionVals[i] === 'union'){
						return true;
					}
				}
			}
			return false;
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

		// Create new Talent
		$scope.create = function() {
			// Create new Talent object
			var talent = new Talents ({
				name: this.name,
				lastName: this.lastName,
				email: this.email,
				email2: this.email2,
				phone: this.phone,
				phone2: this.phone2,
				type: this.typeSelected,
				gender: this.gender,
				ageRange: this.ageRange,
				company: this.company,
				unionStatus: this.unionSelected,
				lastNameCode: this.lastNameCode,
				outageTimes: this.outageTimes,
				locationISDN: this.locationISDN,
				ISDNLine1: this.ISDNLine1,
				ISDNLine2: this.ISDNLine2,
				sourceConnectUsername: this.sourceConnectUsername,
				typeCasts: this.selTypecasts,
				exclusivity: this.exclusivity,
				parentName: this.parentName,
				producerOptional: this.producerOptional,
				unionJoined: this.unionJoinSelected,
				demoLink: this.demoLink,
				prefLanguage: this.prefLanguage
			});

			// Redirect after save
			talent.$save(function(response) {
				$modalInstance.close();
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

	}
]);
'use strict';

// Talents controller
angular.module('talents').controller('TalentsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Talents', 'UsersFind', '$http', '$rootScope', 'Socket',
	function($scope, $stateParams, $location, Authentication, Talents, UsersFind, $http, $rootScope, Socket) {
		$scope.authentication = Authentication;

		// talent static options
		$scope.talentsTotalCnt = 0;
		$scope.filter = {};
		$scope.watchersObj = {};
		$scope.typeOptions = ['Email','Phone'];
		$scope.unionOptions = ['union','non-union'];
		$scope.locations = ['Offsite', 'Las Vegas', 'New York', 'Richmond', 'Santa Monica', 'Virginia Beach', 'Washington DC'];
		$scope.exclusivityOpts = ['Non-Union Exclusive', 'Union', 'Non-Union Exclusive and Union', 'Foreign Language Agreement Non-Union', 'Foreign Language Agreement Union', 'Foreign Language Agreement Non-Union and Union', 'ISDN Non-Union', 'ISDN Union', 'ISDN Non-Union and Union', 'Independent Contractor Agreement Non-Union', 'Independent Contractor Agreement Union', 'Independent Contractor Agreement Non-Union and Union'];
		$scope.unionJoinedOpts = ['SAG/AFTRA', 'OTHER'];
		$scope.unionSelected = [];
		$scope.unionJoinSelected = [];
		$scope.prefLangOpts = ['English', 'Spanish'];
		$scope.typeSelected = 'Email';
		$scope.selTypecasts = [];
		$scope.prefLanguage = 'English';
		// store talent project data
		$scope.projectTalentIdx = [];
		$scope.talentStatus = ['Cast', 'Emailed', 'Scheduled', 'Message left', 'Out', 'Received needs to be posted', 'Posted', 'Not Posted (Bad Read)', 'Missed', 'Canceled'];
		$scope.archived = false;
        $scope.producers = [];
        //$scope.producers = UsersFind.query.where('userLevel').in(["producer/auditions director", 'audio intern', "admin"]);
        UsersFind.query({userLevel: "producer/auditions director"}, function(users){
            angular.forEach(users, function(user, key) {
                $scope.producers.push(user);
            });
        });
        UsersFind.query({userLevel: "admin"}, function(users){
            angular.forEach(users, function(user, key) {
                $scope.producers.push(user);
            });

        });
        //$scope.producers += UsersFind.query({userLevel: "admin"});

		// clear mem leaks on controller destroy
		$scope.$on('$destroy', function (event) {
          Socket.removeAllListeners();

                // angular.forEach($scope.watchersObj, function(watcherObj, key) {
                // 	watcherObj();
                // 	delete $scope.watchersObj[key];
                // });
        });

		// listing filter
		$scope.startsWith = function (actual, expected) {
		    var lowerStr = (actual + '').toLowerCase();
		    return lowerStr.indexOf(expected.toLowerCase()) === 0;
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

				// reload list
				$scope.findLimitWithFilter();
    };
    $scope.changePage = function(page){
    	var curSel = page * $scope.limit;

    	if(curSel < $scope.talentsTotalCnt && curSel >= 0){
    		$scope.currentPage = page;
				$scope.findLimitWithFilter();
    	}
    };

		// user access rules
		$scope.permitAdminDirector = function(){
			var allowRoles = ['admin','talent director'],
					i = 0,
					j = 0,
					authRoles = Authentication.user.roles,
					limit = authRoles.length;

			for(i = 0; i < limit; ++i){
				for(j = 0; j < allowRoles.length; ++j){
					if(authRoles[i] === allowRoles[j]) {
						return true;
					}
				}
			}
		};
		// toggle checkbox options
		$scope.toggleUnion = function(union){
			  var idx = $scope.talent.unionStatus.indexOf(union);
			  if (idx > -1){
			    $scope.talent.unionStatus.splice(idx, 1);
			  }else{
			    $scope.talent.unionStatus.push(union);
			}
		};
		$scope.toggleUnionJoin = function(union){
			  var idx = $scope.talent.unionJoined.indexOf(union);
			  if (idx > -1){
			    $scope.talent.unionJoined.splice(idx, 1);
			  }else{
			    $scope.talent.unionJoined.push(union);
			}
		};

		$scope.toggleTypecast = function(typeCast){
			  var idx = $scope.talent.typeCasts.indexOf(typeCast);
			  if (idx > -1){
			    $scope.talent.typeCasts.splice(idx, 1);
			  }else{
			    $scope.talent.typeCasts.push(typeCast);
			}
		};
		// used for creating new talent
		$scope.toggleNewUnion = function(union){
			  var idx = $scope.unionSelected.indexOf(union);
			  if (idx > -1){
			    $scope.unionSelected.splice(idx, 1);
			  }else{
			    $scope.unionSelected.push(union);
			}
		};
		$scope.toggleNewUnionJoin = function(union){
			  var idx = $scope.unionJoinSelected.indexOf(union);
			  if (idx > -1){
			    $scope.unionJoinSelected.splice(idx, 1);
			  }else{
			    $scope.unionJoinSelected.push(union);
			}
		};

		$scope.toggleNewTypecast = function(typeCast){
			  var idx = $scope.selTypecasts.indexOf(typeCast);
			  if (idx > -1){
			    $scope.selTypecasts.splice(idx, 1);
			  }else{
			    $scope.selTypecasts.push(typeCast);
			}
		};

		$scope.checkUnionStatus = function(unionVals){
			if(typeof unionVals === 'object'){
				for(var i = 0; i < unionVals.length; ++i){
					if(unionVals[i] === 'union'){
						return true;
					}
				}
			}
			return false;
		};

		// Create new Talent
		$scope.create = function() {
			// Create new Talent object
			var talent = new Talents ({
				name: this.name,
				lastName: this.lastName,
				email: this.email,
				email2: this.email2,
				phone: this.phone,
				phone2: this.phone2,
				type: this.typeSelected,
				gender: this.gender,
				ageRange: this.ageRange,
				company: this.company,
				unionStatus: this.unionSelected,
				lastNameCode: this.lastNameCode,
				outageTimes: this.outageTimes,
				locationISDN: this.locationISDN,
				ISDNLine1: this.ISDNLine1,
				ISDNLine2: this.ISDNLine2,
				sourceConnectUsername: this.sourceConnectUsername,
				typeCasts: this.selTypecasts,
				exclusivity: this.exclusivity,
				parentName: this.parentName,
				producerOptional: this.producerOptional,
				unionJoined: this.unionJoinSelected,
				demoLink: this.demoLink,
				prefLanguage: this.prefLanguage
			});

			// Redirect after save
			talent.$save(function(response) {
				$location.path('talents/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Talent
		$scope.remove = function( talent ) {
			if(confirm('Are you sure?')){
				if ( talent ) { talent.$remove();

					for (var i in $scope.talents ) {
						if ($scope.talents [i] === talent ) {
							$scope.talents.splice(i, 1);
						}
					}
				} else {
					$scope.talent.$remove(function() {
						$location.path('talents');
					});
				}
			}
		};

		// Update existing Talent
		$scope.update = function() {
			var talent = $scope.talent ;

			talent.$update(function() {
				$location.path('talents/' + talent._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Talents
		$scope.find = function() {
			$scope.talents = Talents.query();
		};

		Socket.on('talentsListUpdate', function() {
			$scope.find();
		});

		// Find existing Talent
		$scope.findOne = function() {
			$scope.talent = Talents.get({
				talentId: $stateParams.talentId
			});
		};

		// load talent assigned projects
		$scope.findTalentProjects = function(){

			$scope.watchersObj['talent._id'] = $scope.$watchCollection('talent._id', function(val){

				$http.post('/projects/filterByTalent', {
			        talentId: $scope.talent._id,
			        archived: $scope.archived
			    }).
				success(function(data, status, headers, config) {
					// store projects data
					$scope.projects = data;

					var i = 0,
							j = 0,
							limit = data.length;

					// gather project talent indexs
					for(i = 0; i < limit; ++i){
						// walk through projects assigned talents looking for current selected talent
						for(j = 0; j < data[i].talent.length; ++j){
							if(data[i].talent[j].talentId === $scope.talent._id){
								$scope.projectTalentIdx[i] = j;
							}
						}
					}
				});

			});

		};

		// send talent project welcome email
		$scope.sendTalentEmail = function(talent, project){

			// reload project to make sure other recent changes are not overwritten
			$http.get('/projects/' + project._id,{}).
			success(function(data, status, headers, config) {

				// send talent email request
				$http.post('/projects/sendtalentemail', {
			        talent: talent,
			        project: data
			    }).
				success(function(data, status, headers, config) {
					alert('Selected talent has been emailed.');

					// update projects listing
					$http.post('/projects/filterByTalent', {
				        talentId: $scope.talent._id,
				        archived: $scope.archived
				    }).
					success(function(data, status, headers, config) {
						// store projects data
						$scope.projects = data;
					});
				});

			});


		};

		// update selected talents project status
		$scope.updateTalentStatus = function(project, talentId){

			// reload project to make sure other recent changes are not overwritten
			$http.get('/projects/' + project._id,{}).
			success(function(data, status, headers, config) {

				data.talent[talentId].status = project.talent[talentId].status;

				$http.post('/projects/updatetalentstatus', {
			        project: data
			    }).
				success(function(data, status, headers, config) {

					// update projects listing
					$http.post('/projects/filterByTalent', {
				        talentId: $scope.talent._id,
				        archived: $scope.archived
				    }).
					success(function(data, status, headers, config) {
						// store projects data
						$scope.projects = data;
					});

				});

			});
		};

		$scope.getOne = function(talentId) {
			$scope.talent = Talents.get({
				talentId: talentId
			});
		};

		// gather filtered list of logs
		$scope.listFilter = function(){

			$scope.watchersObj['talent._id_flt'] = $scope.$watchCollection('talent._id', function(val){

				if(typeof $scope.talent._id !== 'undefined'){

					var listFilter = {
						type: 'talent',
						sharedKey: $scope.talent._id
					};

					//console.log(listFilter);

					$http.post('/logs/listFilter', {
				        filter: listFilter
				    }).
					success(function(data, status, headers, config) {
						$scope.logs = data;
					});

				}

			});

		};

		// gather filter values
		$scope.getFilterVars = function(){
			// det start val
			var filterObj = {};
			// filter by title
			if($scope.filter.fName){
				filterObj.fName = $scope.filter.fName;
			}
			if($scope.filter.lName){
				filterObj.lName = $scope.filter.lName;
			}
			if($scope.filter.email){
				filterObj.email = $scope.filter.email;
			}
			// filter by gender
			if($scope.filter.gender){
				filterObj.gender = $scope.filter.gender;
			}
			// unionStatus
			if($scope.filter.unionStatus){
				filterObj.unionStatus = $scope.filter.unionStatus;
			}
			// type
			if($scope.filter.type){
				filterObj.type = $scope.filter.type;
			}
			// ageRange
			if($scope.filter.ageRange){
				filterObj.ageRange = $scope.filter.ageRange;
			}
			// locationISDN
			if($scope.filter.locationISDN){
				filterObj.locationISDN = $scope.filter.locationISDN;
			}
			// locationISDN
			if($scope.filter.typeCasts){
				filterObj.typeCasts = $scope.filter.typeCasts;
			}

			return filterObj;
		};
		// get count of all projects in db
		$scope.getTalentsCnt = function(){

			// gen filter object
			var filterObj = $scope.getFilterVars();

			$http.post('/talents/recCount', {
				filter: filterObj
			}).
			success(function(data, status, headers, config) {
				$scope.talentsTotalCnt = data;
			});

		};
		// gather filtered list of talents
		$scope.findLimitWithFilter = function(listFilter){

			// det start val
			var startVal = $scope.currentPage * $scope.limit;
			// gather filter objects
			var filterObj = $scope.getFilterVars();

			$http.post('/talents/findLimitWithFilter', {
				startVal: startVal,
				limitVal: $scope.limit,
				filter: filterObj
		  }).
			success(function(data, status, headers, config) {
				$scope.talents = [];
				$scope.talents = data;
				$scope.getTalentsCnt();
			});

		};

	}
]);

'use strict';
angular.module('talents').filter('tel', function () {
    return function (tel) {
        if (!tel) { return ''; }

        var value = tel.toString().trim().replace(/^\+/, '');

        if (value.match(/[^0-9]/)) {
            return tel;
        }

        var country, city, number;

        switch (value.length) {
            case 10: // +1PPP####### -> C (PPP) ###-####
                country = 1;
                city = value.slice(0, 3);
                number = value.slice(3);
                break;

            case 11: // +CPPP####### -> CCC (PP) ###-####
                country = value[0];
                city = value.slice(1, 4);
                number = value.slice(4);
                break;

            case 12: // +CCCPP####### -> CCC (PP) ###-####
                country = value.slice(0, 3);
                city = value.slice(3, 5);
                number = value.slice(5);
                break;

            default:
                return tel;
        }

        if (country === 1) {
            country = '';
        }

        number = number.slice(0, 3) + '-' + number.slice(3);

        return ((country !== '' ? country + '-' : '') + city + '-' + number).trim();
    };
});

'use strict';

//Talents service used to communicate Talents REST endpoints
angular.module('talents').factory('Talents', ['$resource',
	function($resource) {
		return $resource('talents/:talentId', { talentId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Configuring the Articles module
angular.module('tools').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Tools', 'tools', 'dropdown', '/tools(/create)?', false, ['admin','producer/auditions director', 'audio intern', 'production coordinator'], 1);
		Menus.addSubMenuItem('topbar', 'tools', 'Call List', 'tools/call-list');
		Menus.addSubMenuItem('topbar', 'tools', 'Email Talent', 'tools/email-talent');
		Menus.addSubMenuItem('topbar', 'tools', 'Backup/Restore', 'tools/backup-restore');
		Menus.addSubMenuItem('topbar', 'tools', 'Delete Projects', 'tools/delete-projects', false, false, ['admin', 'production coordinator']);
		Menus.addSubMenuItem('topbar', 'tools', 'Talent Import', 'tools/talent-import');
		Menus.addSubMenuItem('topbar', 'tools', 'Logs', 'logs', false, false, ['admin']);
	}
]);

'use strict';

//Setting up route
angular.module('tools').config(['$stateProvider',
	function($stateProvider) {
		// Tools state routing
		$stateProvider.
		state('listTools', {
			url: '/tools',
			templateUrl: 'modules/tools/views/list-tools.client.view.html'
		}).
		state('talentEmailTool', {
			url: '/tools/email-talent',
			templateUrl: 'modules/tools/views/email-talent-tool.client.view.html'
		}).
		state('talentCallList', {
			url: '/tools/call-list',
			templateUrl: 'modules/tools/views/call-list.client.view.html'
		}).
		state('toolDeleteProjects', {
			url: '/tools/delete-projects',
			templateUrl: 'modules/tools/views/delete-projects.client.view.html'
		}).
		state('toolBackupProjects', {
			url: '/tools/backup-restore',
			templateUrl: 'modules/tools/views/backup-projects.client.view.html'
		}).
		state('toolTalentImport', {
			url: '/tools/talent-import',
			templateUrl: 'modules/tools/views/talent-import.client.view.html'
		}).
		state('toolListNewprojects', {
			url: '/tools/list-newprojects',
			templateUrl: 'modules/tools/views/list-newprojects.client.view.html'
		}).
		state('toolNewprojectByID', {
			url: '/tools/new-project-byid/:newprojectId',
			templateUrl: 'modules/tools/views/new-project-byid.client.view.html'
		});
		// state('createTool', {
		// 	url: '/tools/create',
		// 	templateUrl: 'modules/tools/views/create-tool.client.view.html'
		// }).
		// state('viewTool', {
		// 	url: '/tools/:toolId',
		// 	templateUrl: 'modules/tools/views/view-tool.client.view.html'
		// }).
		// state('editTool', {
		// 	url: '/tools/:toolId/edit',
		// 	templateUrl: 'modules/tools/views/edit-tool.client.view.html'
		// });
	}
]);

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

'use strict';

//Tools service used to communicate Tools REST endpoints
angular.module('tools').factory('Tools', ['$resource',
	function($resource) {
		return $resource('tools/:toolId', { toolId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

'use strict';

// Configuring the Articles module
angular.module('typecasts').run(['Menus', 'Authentication',
	function(Menus, Authentication) {
		// Set top bar menu items
		//Menus.addMenuItem('topbar', 'Typecasts', 'typecasts', 'dropdown', '/typecasts(/create)?', false, ['admin']);
		Menus.addSubMenuItem('topbar', 'talents', 'List Typecasts', 'typecasts', false, false, ['admin','talent director']);
		Menus.addSubMenuItem('topbar', 'talents', 'New Typecast', 'typecasts/create', false, false, ['admin','talent director']);
	}
]);
'use strict';

//Setting up route
angular.module('typecasts').config(['$stateProvider',
	function($stateProvider) {
		// Typecasts state routing
		$stateProvider.
		state('listTypecasts', {
			url: '/typecasts',
			templateUrl: 'modules/typecasts/views/list-typecasts.client.view.html'
		}).
		state('createTypecast', {
			url: '/typecasts/create',
			templateUrl: 'modules/typecasts/views/create-typecast.client.view.html'
		}).
		state('viewTypecast', {
			url: '/typecasts/:typecastId',
			templateUrl: 'modules/typecasts/views/view-typecast.client.view.html'
		}).
		state('editTypecast', {
			url: '/typecasts/:typecastId/edit',
			templateUrl: 'modules/typecasts/views/edit-typecast.client.view.html'
		});
	}
]);
'use strict';

// Typecasts controller
angular.module('typecasts').controller('TypecastsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Typecasts', 'Socket',
	function($scope, $stateParams, $location, Authentication, Typecasts, Socket ) {
		$scope.authentication = Authentication;

		// controller level vals
		$scope.newAtrribute = '';

		// clear mem leaks on controller destroy
		$scope.$on('$destroy', function (event) {
        Socket.removeAllListeners();
        // or something like
        // socket.removeListener(this);
    });

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

		$scope.permitAdminDirector = function(){

			var allowRoles = ['admin', 'producer/auditions director', 'audio intern','talent director'],
					i = 0,
					j = 0,
					authRoles = Authentication.user.roles,
					limit = authRoles.length;

			for(i = 0; i < limit; ++i){
				for(j = 0; j < allowRoles.length; ++j){
					if(authRoles[i] === allowRoles[j]) {
						return true;
					}
				}
			}
		};

		// Create new Typecast
		$scope.create = function() {
			// Create new Typecast object
			var typecast = new Typecasts ({
				name: this.name,
				sort: this.sort
			});

			// Redirect after save
			typecast.$save(function(response) {
				$location.path('typecasts/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Typecast
		$scope.remove = function( typecast ) {
			if(confirm('Are you sure?')){
				if ( typecast ) { typecast.$remove();

					for (var i in $scope.typecasts ) {
						if ($scope.typecasts [i] === typecast ) {
							$scope.typecasts.splice(i, 1);
						}
					}
				} else {
					$scope.typecast.$remove(function() {
						$location.path('typecasts');
					});
				}
			}
		};

		// Update existing Typecast
		$scope.update = function() {
			var typecast = $scope.typecast ;

			typecast.$update(function() {
				$location.path('typecasts/' + typecast._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Typecasts
		$scope.find = function() {
			$scope.typecasts = Typecasts.query();
		};

		Socket.on('typecastsListUpdate', function() {
			$scope.find();
		});

		// Find existing Typecast
		$scope.findOne = function() {
			$scope.typecast = Typecasts.get({
				typecastId: $stateParams.typecastId
			});
		};

		// add new attribute to typecase
		$scope.addAttribute = function(){

			if($scope.newAtrribute !== ''){

				var typecast = $scope.typecast;

				typecast.attributes.push($scope.newAtrribute);

				typecast.$update(function() {
					$location.path('typecasts/' + typecast._id);
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

				$scope.newAtrribute = '';

			} else {

				alert('Please enter an attribute name!');

			}

		};

		$scope.removeAttribute = function(key){

			var typecast = $scope.typecast;

			typecast.attributes.splice(key, 1);

			typecast.$update(function() {
				$location.path('typecasts/' + typecast._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});

		};
	}
]);

'use strict';

//Typecasts service used to communicate Typecasts REST endpoints
angular.module('typecasts').factory('Typecasts', ['$resource',
	function($resource) {
		return $resource('typecasts/:typecastId', { typecastId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);

angular.module('users').run(['Menus', 'Authentication',
	function(Menus, Authentication) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Users', 'users', 'dropdown', '/usersedit(/create)?', false, ['admin','producer/auditions director', 'audio intern','production coordinator'], 4);
		Menus.addSubMenuItem('topbar', 'users', 'Browse', 'usersedit', false, false, ['admin','producer/auditions director', 'audio intern','production coordinator']);
		Menus.addSubMenuItem('topbar', 'users', 'New', 'usersedit/create', false, false, ['admin']);
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invlaid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		}).
		state('users', {
			url: '/usersedit',
			templateUrl: 'modules/users/views/list-users.client.view.html'
		}).
		state('newUser', {
			url: '/usersedit/create',
			templateUrl: 'modules/users/views/create.client.view.html'
		}).
		state('viewUser', {
			url: '/usersedit/:userIdEdit',
			templateUrl: 'modules/users/views/view-user.client.view.html'
		}).
		state('editUser', {
			url: '/usersedit/:userIdEdit/edit',
			templateUrl: 'modules/users/views/edit-user.client.view.html'
		});
	}
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect based on user role
				if($scope.authentication.user.roles[0] === 'admin' || $scope.authentication.user.roles[0] === 'producer/auditions director' || $scope.authentication.user.roles[0] === 'audio intern'){
					$location.path('/projects');
				} else if($scope.authentication.user.roles[0] === 'client' || $scope.authentication.user.roles[0] === 'client-client') {
					$location.path('/clients/projects');
				} else {
					$location.path('/');
				}
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication', '$base64',
	function($scope, $http, $location, Users, Authentication, $base64) {
		$scope.user = Authentication.user;

		// custom arrays
		$scope.roleOpts = ['user', 'admin', 'producer/auditions director', 'audio intern', 'talent', 'talent director', 'client', 'agency'];

		$scope.permitEveryOneButClients = function(){
			var allowRoles = ['admin', 'producer/auditions director', 'audio intern', 'production coordinator', 'talent director'];

			for(var i = 0; i < Authentication.user.roles.length; ++i){
				for(var j = 0; j < allowRoles.length; ++j){
					if(Authentication.user.roles[i] === allowRoles[j]) {
						return true;
					}
				}
			}
		};

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		$scope.decodedPass = function(encodedPass){
			var convertedPass = '';
			if(typeof encodedPass !== 'undefined'){
				convertedPass = $base64.decode(encodedPass);
			}

			return convertedPass;
		};

		// Check if there are additional accounts
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid){
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);

'use strict';

// Users controller
angular.module('users').controller('UsersListController', ['$scope', '$stateParams', '$location', 'Authentication', 'UsersEdit', 'UsersFind', '$http', '$rootScope',
	function($scope, $stateParams, $location, Authentication, UsersEdit, UsersFind, $http, $rootScope) {
		$scope.authentication = Authentication;

		$scope.roleOpts = ['client', 'client-client'];

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

		// Find a list of Users
		$scope.find = function() {
			$scope.users = UsersEdit.query();
		};
		$scope.findFilter = function(selUserLevel) {
			$scope.users = UsersFind.query({userLevel: selUserLevel});
		};

		// refresh list of users on refresh emit
		$rootScope.$on('refresh', $scope.find());
		$rootScope.$on('refreshListFilter',
			function(event, args) {
				$scope.findFilter(args);
			}
		);

		// Find existing Users
		$scope.findOne = function() {
			$scope.useredit = UsersEdit.get({
				userIdEdit: $stateParams.userIdEdit
			});
		};
	}
]);
'use strict';

// Users controller
angular.module('users').controller('UsersModalController', ['$scope', '$stateParams', '$location', 'Authentication', 'UsersEdit', 'UsersFind', '$http', '$modalInstance', '$rootScope', 'owner',
	function($scope, $stateParams, $location, Authentication, UsersEdit, UsersFind, $http, $modalInstance, $rootScope, owner) {
		$scope.authentication = Authentication;

		$scope.roleOpts = ['client', 'client-client'];
		$scope.owner = owner;

		// used for paginator
		$scope.Math = window.Math;

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

		$scope.createModel = function() {
			var useredit = {
				firstName: this.firstName,
				lastName: this.lastName,
				displayName: this.displayName,
				company: this.company,
				email: this.email,
				username: this.username,
				phone: this.phone,
				password: this.password,
				notes: this.notes,
				roles: this.roles
			};

			// Redirect after save
			$http.post('/usersedit/create', useredit).
			success(function(data, status, headers, config) {
				if($scope.owner === 'client'){
					$rootScope.$broadcast('refreshFilter', 'client');
				} else {
					$rootScope.$broadcast('refreshListFilter', 'client-client');
				}
				$modalInstance.close();
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

// Users controller
angular.module('users').controller('UsersController', ['$scope', '$stateParams', '$location', 'Authentication', 'UsersEdit', 'UsersFind', '$http', '$rootScope', '$base64',
	function($scope, $stateParams, $location, Authentication, UsersEdit, UsersFind, $http, $rootScope, $base64) {
		$scope.authentication = Authentication;

		$scope.roleOpts = ['user', 'admin', 'producer/auditions director', 'audio intern', 'production coordinator', 'talent director', 'client', 'client-client'];
		$scope.filter = {};
		$scope.filterOverride = '';
		$scope.usersTotalCnt = 0;

		// various values

		// used for paginator
		$scope.loadPass = false;
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

				// reload list
				$scope.findLimitWithFilter();
    };
    $scope.changePage = function(page){
    	var curSel = page * $scope.limit;

    	if(curSel < $scope.usersTotalCnt && curSel >= 0){
    		$scope.currentPage = page;
				$scope.findLimitWithFilter();
    	}
    };
    $scope.$watchCollection('filtered', function(val){
    	$scope.currentPage = 0;
    }, true);

		// Find a list of Users
		$scope.find = function() {
			$scope.users = UsersEdit.query();
		};
		$scope.findFilter = function(selUserLevel) {
			//$scope.users = UsersFind.query({userLevel: selUserLevel});
			$scope.filterOverride = selUserLevel;
			$scope.findLimitWithFilter();
		};

		// refresh list of users on refresh emit
		$rootScope.$on('refresh', $scope.find());
		$rootScope.$on('refreshFilter',
			function(event, args) {
				$scope.findFilter(args);
			}
		);

		$scope.decodedPass = function(encodedPass){
			var convertedPass = '';
			if(typeof encodedPass !== 'undefined'){
				convertedPass = $base64.decode(encodedPass);
			}

			return convertedPass;
		};

		// Find existing Users
		$scope.findOne = function() {
			$scope.useredit = UsersEdit.get({
				userIdEdit: $stateParams.userIdEdit
			});
		};
		$scope.$watchCollection('useredit', function(){
			// check for load password pass
			if($scope.loadPass === false && typeof $scope.useredit !== 'undefined' && typeof $scope.useredit._id !== 'undefined'){
				var storedPW = $scope.decodedPass($scope.useredit.passwordText);
				$scope.useredit.newpassword  = storedPW;
				// ensure password is loaded
				if($scope.useredit.newpassword || storedPW === ''){
					$scope.loadPass = true;
				}
			}
		});

		$scope.getOne = function(userId) {
			$scope.useredit = UsersEdit.get({
				userIdEdit: userId
			});
		};

		// Update existing User
		$scope.update = function(isValid) {
			if (isValid){
				$scope.success = $scope.error = null;
				var user = new UsersEdit($scope.useredit);

				user.edited = Authentication;

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		$scope.remove = function( useredit ) {

			if(confirm('Are you sure?')){
				if ( useredit ) { useredit.$remove();

					for (var i in $scope.users ) {
						if ($scope.users[i] === useredit ) {
							$scope.users.splice(i, 1);
						}
					}
				} else {
					$scope.useredit.$remove(function() {
						$location.path('usersedit');
					});
				}
			}
		};

		$scope.create = function() {
			var useredit = {
				firstName: this.firstName,
				lastName: this.lastName,
				displayName: this.displayName,
				company: this.company,
				email: this.email,
				username: this.username,
				phone: this.phone,
				password: this.password,
				notes: this.notes,
				roles: this.roles
			};

			// Redirect after save
			$http.post('/usersedit/create', useredit).
			success(function(data, status, headers, config) {
				$location.path('/usersedit');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// gather filter values
		$scope.getFilterVars = function(){
			// det start val
			var filterObj = {};
			// filter by title
			if($scope.filter.fName){
				filterObj.fName = $scope.filter.fName;
			}
			if($scope.filter.lName){
				filterObj.lName = $scope.filter.lName;
			}
			if($scope.filter.email){
				filterObj.email = $scope.filter.email;
			}
			if($scope.filter.company){
				filterObj.company = $scope.filter.company;
			}
			// role
			if($scope.filter.roles){
				filterObj.roles = $scope.filter.roles;
			}

			return filterObj;
		};
		// get count of all projects in db
		$scope.getUsersCnt = function(){

			// gen filter object
			var filterObj = $scope.getFilterVars();

			// roles filter override
			if($scope.filterOverride){
					filterObj.roles = $scope.filterOverride;
			}

			$http.post('/users/recCount', {
				filter: filterObj
			}).
			success(function(data, status, headers, config) {
				$scope.usersTotalCnt = data;
			});

		};
		// gather filtered list of talents
		$scope.findLimitWithFilter = function(listFilter){

			// det start val
			var startVal = $scope.currentPage * $scope.limit;
			// gather filter objects
			var filterObj = $scope.getFilterVars();

			// roles filter override
			if($scope.filterOverride){
					filterObj.roles = $scope.filterOverride;
			}

			$http.post('/users/findLimitWithFilter', {
				startVal: startVal,
				limitVal: $scope.limit,
				filter: filterObj
		  }).
			success(function(data, status, headers, config) {
				$scope.users = [];
				$scope.users = data;
				$scope.getUsersCnt();
			});

		};

	}
]);

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [

	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users/:userId', { userId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('UsersEdit', ['$resource',
	function($resource) {
		return $resource('usersedit/:userIdEdit', { userIdEdit: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('UsersFind', ['$resource',
	function($resource) {
		return $resource('usersfind/:userLevel', { userLevel: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
