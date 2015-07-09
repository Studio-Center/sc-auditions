'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'studio-center-auditions';
	var applicationModuleVendorDependencies = ['ngRoute', 'ngResource', 'ngCookies',  'ngAnimate',  'ngTouch',  'ngSanitize',  'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload', 'ngAudio','ui.bootstrap.datetimepicker','rt.encodeuri', 'angularMoment', 'textAngular', 'btford.socket-io'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

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

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

angular.module('core').constant('angularMomentConfig', {
    timezone: 'America/New_York' // e.g. 'Europe/London'
});

moment.tz.setDefault('America/New_York');
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
		});
	}
]);
'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
	function($scope, Authentication, Menus) {
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
	}
]);
'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
	}
]);
'use strict';
angular.module('core').filter('multiTerm', ["$filter", function($filter){
     return function(inputArray, searchText){
        var wordArray = searchText ? searchText.toLowerCase().split(/\s+/) : [];
        var wordCount = wordArray.length;
        for(var i=0;i<wordCount;i++){
            inputArray = $filter('filter')(inputArray, wordArray[i], true);
            console.log(wordArray[i]);
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
angular.module('core').factory('Socket', ['socketFactory',
    function(socketFactory) {
        return socketFactory({
            prefix: '',
            ioSocket: io.connect(location.host)
        });
    }
]);
'use strict';

// Configuring the Articles module
angular.module('projects').run(['Menus', 'Authentication',
	function(Menus, Authentication) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Projects', 'projects', 'dropdown', '/projects(/create)?', false, ['admin', 'producer/auditions director', 'production coordinator', 'talent director', 'client', 'client-client'], 0);
		Menus.addSubMenuItem('topbar', 'projects', 'New Project', 'projects/create', false, false, ['admin','producer/auditions director', 'production coordinator']);
		Menus.addSubMenuItem('topbar', 'projects', 'List Projects', 'projects', false, false, ['admin','producer/auditions director', 'production coordinator', 'talent director']);
		Menus.addSubMenuItem('topbar', 'projects', 'Client Portal', 'projects-client', false);
		Menus.addSubMenuItem('topbar', 'projects', 'Start A New Audition Project', 'projects/new-audition-form', false, false, ['client']);
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
		state('clientListProjects', {
			url: '/projects-client',
			templateUrl: 'modules/projects/views/client-list-projects.client.view.html'
		}).
		state('clientListProjectsSingle', {
			url: '/projects-client/:projectId',
			templateUrl: 'modules/projects/views/client-list-projects.client.view.html'
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
		state('newAuditionProject', {
			url: '/projects/new-audition-form',
			templateUrl: 'modules/projects/views/new-audition-project.client.view.html'
		}).
		state('newAuditionProjectThanks', {
			url: '/projects/new-audition-form/thanks',
			templateUrl: 'modules/projects/views/new-audition-project-thanks.client.view.html'
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
			}
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
'use strict';

// Projects controller
angular.module('projects').controller('ProjectsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Projects', '$upload', 'ngAudio', '$http', '$modal', '$rootScope', 'Socket',
	function($scope, $stateParams, $location, Authentication, Projects, $upload, ngAudio, $http, $modal, $rootScope, Socket ) {
		$scope.authentication = Authentication;

		// rating
		$scope.max = 5;
		$scope.isReadonly = false;
		$scope.ratings = [];
		$scope.ratingsAvg = [];
		// static project options
		$scope.projProgress = [];
		$scope.selCheckVal = 0;
		$scope.client = [];
		$scope.talent = [];
		$scope.showRename = 0;
		$scope.statusOpts = ['In Progress', 'On Hold', 'Booked', 'Canceled', 'ReAuditioned', 'Dead', 'Closed - Pending Client Decision', 'Complete'];
		$scope.priorityOpts = ['None', 'Very low', 'Low', 'Medium', 'High', 'Very high'];
		$scope.phaseStatusOpts = ['in progress','open','complete','suspended'];
		$scope.soundersOpts = ['Sounders', 'No Sounders - Approved By William'];
		$scope.talentStatus = ['Cast', 'Emailed', 'Scheduled', 'Message left', 'Out', 'Received needs to be posted', 'Posted', 'Not Posted (Bad Read)'];
		$scope.loadAudio = 0;
		$scope.audio = '';
		$scope.lastAudioID = 0;
		$scope.audioStatus = 0;
		$scope.newLead = {};
		$scope.referenceFiles = [];
		$scope.scripts = [];
		$scope.newProject = {notifyClient: true};
		$scope.parts = [];
		$scope.toggleRefs = false;
		$scope.selectedMainClients = [];
		$scope.rejFiles = [];
		// projects client portal
		$scope.selectedAuditions = [];
		$scope.hideList = [];

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

		$scope.hoveringOver = function(value,key,object) {
	        $scope.overStar = value;
	        $scope.percent = 100 * (value / $scope.max);
	        $scope.selCheckVal = value;
      	};

      	// book clients modal
      	$scope.bookSelectedAuditions = function(){
      		var modalInstance = $modal.open({
		      animation: true,
		      templateUrl: 'modules/projects/views/book-auditon-modal.client.view.html',
		      controller: 'ProjectsModalController',
		      resolve: {
		      	data: function () {
			        return {
			        	project: $scope.project._id,
			        	auditions: $scope.selectedAuditions
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
			var idx = $scope.selectedAuditions.indexOf(key);
			if (idx > -1){
			    $scope.selectedAuditions.splice(idx, 1);
			}else{
			    $scope.selectedAuditions.push(key);
			}
      	};
      	$scope.selCheck = function(filename){
			for(var i = 0; i < $scope.selectedAuditions.length; ++i){
      			if($scope.selectedAuditions[i] === filename){
      				return true;
      			}
      		}
      	};
      	$scope.hideSelected = true;
      	$scope.hideSelectedAuditions = function(){
      		$scope.hideSelected = !$scope.hideSelected;
      	};
      	$scope.hideAudition = function(filename){
      		$scope.hideList.push(filename);
      	};
      	$scope.showAudition = function(filename){
			var idx = $scope.hideList.indexOf(filename);
			if (idx > -1){
			    $scope.hideList.splice(idx, 1);
			}
      	};
      	$scope.isHidden = function(filename){
      		for(var i = 0; i < $scope.hideList.length; ++i){
      			if($scope.hideList[i] === filename){
      				return false;
      			}
      		}

      		return true;
      	};
      	$scope.isDisplayed = function(filename){
      		if($scope.hideSelected === true){
	      		for(var i = 0; i < $scope.hideList.length; ++i){
	      			if($scope.hideList[i] === filename){
	      				return false;
	      			}
	      		}
      		}

      		return true;
      	};
      	$scope.downloadAllAuditions = function(){

			$http.post('/projects/downloadallauditions', {
		        project: $scope.project
		    }).
			success(function(data, status, headers, config) {
				// send data to users browser
				// wait one second for archive processing on server
				setTimeout(
					function(){
						var link = document.createElement('a');
					    link.download = encodeURIComponent(data.zip);
					    link.href = 'res/archives/' + encodeURIComponent(data.zip);
					    link.click();
					},
				    1000
				);
			});
      	};
      	$scope.bookSelectedShow = function(){
      		var hiddenMatchCnt = 0, idx;

      		for(var i = 0; i < $scope.hideList.length; ++i){
  				idx = $scope.selectedAuditions.indexOf($scope.hideList[i]);
				if (idx > -1){
					++hiddenMatchCnt;
				}
      		}

      		if($scope.selectedAuditions.length > hiddenMatchCnt){
      			return true;
      		}

      	};

      	// compare dates check for within hour
      	$scope.compareDates = function(projDate){
      		var now = new Date();
      		projDate = new Date(projDate);

      		var hours = Math.abs(projDate - now) / 36e5;

      		if(hours < 1){
      			return true;
      		}
      	};
      	$scope.checkPassed = function(projDate){
      		var now = new Date();
      		projDate = new Date(projDate);

      		if(now > projDate){
      			return true;
      		}
      	};

      	// show part field if talent value is not already checked
      	$scope.showPartFld = function(id){
      		if(typeof $scope.project.talent !== 'undefined'){
	      		for(var i = 0; i < $scope.project.talent.length; ++i){
	      			if($scope.project.talent[i].talentId === String(id)){
	      				if($scope.project.talent[i].requested === true || $scope.project.talent[i].regular === true){
	      					return false;
	      				}
	      			}
	      		}
      		}
   			return true;
     	};
     	$scope.showPartString = function(id){
      		for(var i = 0; i < $scope.project.talent.length; ++i){
      			if($scope.project.talent[i].talentId === String(id)){
      				if(typeof $scope.project.talent[i].part !== 'undefined'){
	      				if($scope.project.talent[i].part !== ''){
	      					return $scope.project.talent[i].part;
	      				}
      				}
      			}
      		}
      	};
     	$scope.showCreatePartFld = function(id){
      		for(var i = 0; i < $scope.talent.length; ++i){
      			if($scope.talent[i].talentId === String(id)){
      				if($scope.talent[i].requested === true || $scope.talent[i].regular === true){
      					return false;
      				}
      			}
      		}
   			return true;
     	};

		// verify users
		$scope.permitAdmin = function(){
			var allowRoles = ['admin'];

			for(var i = 0; i < Authentication.user.roles.length; ++i){
				for(var j = 0; j < allowRoles.length; ++j){
					if(Authentication.user.roles[i] === allowRoles[j]) {
						return true;
					}
				}
			}
		};
		$scope.permitAdminDirector = function(){
			var allowRoles = ['admin', 'producer/auditions director'];

			for(var i = 0; i < Authentication.user.roles.length; ++i){
				for(var j = 0; j < allowRoles.length; ++j){
					if(Authentication.user.roles[i] === allowRoles[j]) {
						return true;
					}
				}
			}
		};
		$scope.permitProducers = function(){
			var allowRoles = ['producer/auditions director'];

			for(var i = 0; i < Authentication.user.roles.length; ++i){
				for(var j = 0; j < allowRoles.length; ++j){
					if(Authentication.user.roles[i] === allowRoles[j]) {
						return true;
					}
				}
			}
		};
		$scope.permitAdminTalentDirectorProdCoord = function(){
			var allowRoles = ['admin', 'talent director', 'production coordinator'];

			for(var i = 0; i < Authentication.user.roles.length; ++i){
				for(var j = 0; j < allowRoles.length; ++j){
					if(Authentication.user.roles[i] === allowRoles[j]) {
						return true;
					}
				}
			}
		};
		$scope.permitEveryOneButClients = function(){
			var allowRoles = ['admin', 'producer/auditions director', 'production coordinator', 'talent director'];

			for(var i = 0; i < Authentication.user.roles.length; ++i){
				for(var j = 0; j < allowRoles.length; ++j){
					if(Authentication.user.roles[i] === allowRoles[j]) {
						return true;
					}
				}
			}
		};
		$scope.permitClient = function(){
			var allowRoles = ['client'];

			for(var i = 0; i < Authentication.user.roles.length; ++i){
				for(var j = 0; j < allowRoles.length; ++j){
					if(Authentication.user.roles[i] === allowRoles[j]) {
						return true;
					}
				}
			}
		};
		$scope.permitClientClient = function(){
			var allowRoles = ['client-client'];

			for(var i = 0; i < Authentication.user.roles.length; ++i){
				for(var j = 0; j < allowRoles.length; ++j){
					if(Authentication.user.roles[i] === allowRoles[j]) {
						return true;
					}
				}
			}
		};

		// verify create access
		$scope.userCheck = function(){
			if(Authentication.user.roles[0] !== 'admin' && Authentication.user.roles[0] !== 'producer/auditions director' && Authentication.user.roles[0] !== 'production coordinator'){
				$location.path('/projects');
			}
		};

		// send talent project welcome email
		$scope.sendTalentEmail = function(talent){

			$http.post('/projects/sendtalentemail', {
		        talent: talent,
		        project: $scope.project
		    }).
			success(function(data, status, headers, config) {
				alert('Selected talent has been emailed.');

				// update project store
				$scope.project = data;
			});

		};

		// send various client emails
		$scope.sendClientEmail = function(type){

			$http.post('/projects/sendclientemail', {
		        type: type,
		        project: $scope.project,
		        clients: $scope.selectedMainClients
		    }).
			success(function(data, status, headers, config) {
        		alert('Clients Emailed ' + type + ' Email ');
        		$scope.selectedMainClients = [];

				var note, now = moment(new Date()).format();
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
						note = 'Client Notified of Project Start by ' + Authentication.user.displayName;
					break;
					case 'carryover':
						note = 'Client sent Carryover by ' + Authentication.user.displayName;
					break;
					case 'closing':
						note = 'Client Notified of Project Completion by ' + Authentication.user.displayName;
					break;
        		}

        		// add note to note object
        		item.item = note;

        		// add to project discussion
        		$scope.project.discussion.push(item);

        		// update project store
				$scope.update();
        	}).
			error(function(data, status, headers, config) {
				alert('An error occured while sending client emails. Please contact your administrator.');
			    // called asynchronously if an error occurs
			    // or server returns response with an error status.
			});
		};

		// new project form 
		$scope.lead = function(){

			// Trigger validation flag.
		    $scope.submitted = true;

			$http.post('/projects/lead', {
			        firstName: $scope.newLead.firstName,
			        lastName: $scope.newLead.lastName,
			        company: $scope.newLead.company,
			        phone: $scope.newLead.phone,
			        email: $scope.newLead.email,
			        describe: $scope.newLead.describe
			    }).
				success(function(data, status, headers, config) {
            	$location.path('/projects/new-audition-form/thanks');
        	});
		};
		$scope.leadFormPop = function(){
			if(typeof Authentication.user === 'object'){
				$scope.newLead.firstName = Authentication.user.firstName;
		        $scope.newLead.lastName = Authentication.user.lastName;
		        $scope.newLead.company = Authentication.user.company;
		        $scope.newLead.phone = Authentication.user.phone;
		        $scope.newLead.email = Authentication.user.email;
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
			};
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
				for(var l = 0; l < $scope.project.talent.length; ++l){
					if($scope.project.talent[l].email !== '' && re.test($scope.project.talent[l].email)){
						emailCnt += 1;
						toEmails[emailCnt] = $scope.project.talent[l].email;
					}
				}
			}

			// attach team to email chain
			// grant all team members access to all email communications
			for(var k = 0; k < $scope.project.team.length; ++k){
				if($scope.project.team[k].email !== '' && re.test($scope.project.team[k].email)){
					emailCnt += 1;
					toEmails[emailCnt] = $scope.project.team[k].email;
				}
			}
			// check for accounts associated 
			$scope.email.to = toEmails;
		};

		// update group checkbox selectors
		$scope.checkClientClientUsers = function(userId){
			if(typeof $scope.project === 'object'){
				if(typeof $scope.project.clientClient === 'object'){
					for(var i = 0; i < $scope.project.clientClient.length; ++i){
						if($scope.project.clientClient[i].userId === userId){
							return true;
						}
					}
				}
			}
		};
		$scope.checkClientUsers = function(userId){
			if(typeof $scope.project === 'object'){
				if(typeof $scope.project.client === 'object'){
					for(var i = 0; i < $scope.project.client.length; ++i){
						if($scope.project.client[i].userId === userId){
							return true;
						}
					}
				}
			}
		};
		$scope.checkClientUsersCreate = function(userId){
			for(var i = 0; i < $scope.client.length; ++i){
				if($scope.client[i].userId === userId){
					return true;
				}
			}
		};
		$scope.checkTeam = function(userId){
			if(typeof $scope.project === 'object'){
				if(typeof $scope.project.team === 'object'){
					for(var i = 0; i < $scope.project.team.length; ++i){
						if($scope.project.team[i].userId === userId){
							return true;
						}
					}
				}
			}
		};
		$scope.checkTalent = function(talentId){
			if(typeof $scope.project === 'object'){
				if(typeof $scope.project.talent === 'object'){
					for(var i = 0; i < $scope.project.talent.length; ++i){
						if($scope.project.talent[i].talentId === talentId && $scope.project.talent[i].regular === true){
							return true;
						}
					}
				}
			}
		};
		$scope.checkRequestedTalent = function(talentId){
			if(typeof $scope.project === 'object'){
				if(typeof $scope.project.talent === 'object'){
					for(var i = 0; i < $scope.project.talent.length; ++i){
						if($scope.project.talent[i].talentId === talentId && $scope.project.talent[i].requested === true){
							return true;
						}
					}
				}
			}
		};
		$scope.checkCreateTalent = function(talentId){
			for(var i = 0; i < $scope.talent.length; ++i){
				if($scope.talent[i].talentId === talentId && $scope.talent[i].regular === true){
					return true;
				}
			}
		};
		$scope.checkRequestedCreateTalent = function(talentId){
			for(var i = 0; i < $scope.talent.length; ++i){
				if($scope.talent[i].talentId === talentId && $scope.talent[i].requested === true){
					return true;
				}
			}
		};

		$scope.updateTalent = function(talentId, talentName, email){
			// gen talent object
			var talent = {'talentId': talentId, 'name': talentName, 'email': email, 'booked': false, 'status': 'Cast', part: $scope.parts[talentId] || '', regular: true, requested: false};

			// check for existing item
			var found = 0;
			for(var i = 0; i < $scope.project.talent.length; ++i){
				if($scope.project.talent[i].talentId === talentId){
					// reset requested to false
					if($scope.project.talent[i].requested === true){
						$scope.project.talent[i].requested =  false;
					}
					// update regular status
					if($scope.project.talent[i].regular === true){
						$scope.project.talent[i].regular = false;
					} else {
						$scope.project.talent[i].regular = true;
					}
					// remove talent if no longer selected
					if($scope.project.talent[i].regular === false && $scope.project.talent[i].requested === false){
						$scope.project.talent.splice(i, 1);
					}
					found = 1;
				}
			}

			if(found === 0){
				$scope.project.talent.push(talent);
			}

			// update project store
			$scope.update();
		};
		$scope.updateRequestTalent = function(talentId, talentName, email){
			// gen talent object
			var talent = {'talentId': talentId, 'name': talentName, 'email': email, 'booked': false, 'status': 'Cast', part: $scope.parts[talentId] || '', regular: false, requested: true};

			// check for existing item
			var found = 0;
			for(var i = 0; i < $scope.project.talent.length; ++i){
				if($scope.project.talent[i].talentId === talentId){
					// reset regular talent status
					if($scope.project.talent[i].regular === true){
						$scope.project.talent[i].regular = false;
					}
					// check requested talent status
					if($scope.project.talent[i].requested === true){
						$scope.project.talent[i].requested = false;
					} else {
						$scope.project.talent[i].requested = true;
					}
					// remove talent if no longer selected
					if($scope.project.talent[i].regular === false && $scope.project.talent[i].requested === false){
						$scope.project.talent.splice(i, 1);
					}
					found = 1;
				}
			}

			if(found === 0){
				$scope.project.talent.push(talent);
			}

			// update project store
			$scope.update();
		};
		$scope.updateCreateTalent = function(talentId, talentName, email){
			// gen talent object
			var talent = {'talentId': talentId, 'name': talentName, 'email': email, 'booked': false, 'status': 'Cast', part: $scope.parts[talentId] || '', regular: true, requested: false};

			// check for existing item
			var found = 0;
			for(var i = 0; i < $scope.talent.length; ++i){
				if($scope.talent[i].talentId === talentId){
					// reset requested status
					if($scope.talent[i].requested === true){
						$scope.talent[i].requested = false;
					}
					// set regular status
					if($scope.talent[i].regular === true){
						$scope.talent[i].regular = false;
					} else {
						$scope.talent[i].regular = true;
					}
					// remove talent if no longer selected
					if($scope.talent[i].regular === false && $scope.talent[i].requested === false){
						$scope.talent.splice(i, 1);
					}
					found = 1;
				}
			}

			// add talent if never found
			if(found === 0){
				$scope.talent.push(talent);
			}

		};
		$scope.updateRequestCreateTalent = function(talentId, talentName, email){
			// gen talent object
			var talent = {'talentId': talentId, 'name': talentName, 'email': email, 'booked': false, 'status': 'Cast', part: $scope.parts[talentId] || '', regular: false, requested: true};

			// check for existing item
			var found = 0;
			for(var i = 0; i < $scope.talent.length; ++i){
				if($scope.talent[i].talentId === talentId){
					// reset regular talent if set
					if($scope.talent[i].regular === true){
						$scope.talent[i].regular = false;
					}
					// set requested talent
					if($scope.talent[i].requested === true){
						$scope.talent[i].requested = false;
					} else {
						$scope.talent[i].requested = true;
					}
					// remove talent if no longer selected
					if($scope.talent[i].regular === false && $scope.talent[i].requested === false){
						$scope.talent.splice(i, 1);
					}
					found = 1;
				}
			}

			// add talent if never found
			if(found === 0){
				$scope.talent.push(talent);
			}

		};

		$scope.updateTalentStatus = function(key){

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

			if(found === 0){
				$scope.project.team.push(user);
			}

			// update project store
			$scope.update();
		};

		$scope.updateClientClient = function(userId, displayName, email){
			// gen user object
			var user = {'userId': userId, 'name': displayName, 'email': email};

			// check for existing item
			var found = 0;
			for(var i = 0; i < $scope.project.clientClient.length; ++i){
				if($scope.project.clientClient[i].userId === userId){
					$scope.project.clientClient.splice(i, 1);
					found = 1;
				}
			}

			if(found === 0){
				$scope.project.clientClient.push(user);
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

			if(found === 0){
				$scope.project.client.push(user);
			}

			// update project store
			$scope.update();
		};

		$scope.updateCreateClient = function(userId, displayName, email){
			// gen user object
			var user = {'userId': userId, 'name': displayName, 'email': email};

			// check for existing item
			var found = 0;
			for(var i = 0; i < $scope.client.length; ++i){
				if($scope.client[i].userId === userId){
					$scope.client.splice(i, 1);
					found = 1;
				}
			}

			if(found === 0){
				$scope.client.push(user);
			}

		};

		$scope.toggleBooked = function(key){
			$scope.project.talent[key].booked = !$scope.project.talent[key].booked;

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
				title: $scope.newProject.title,
				estimatedCompletionDate: $scope.newProject.estimatedCompletionDate,
				estimatedTime: $scope.newProject.estimatedTime,
				actualTime: $scope.newProject.actualTime,
				status: 'In Progress',
				sounders: $scope.newProject.sounders,
				scripts: $scope.scripts,
				referenceFiles: $scope.referenceFiles,
				description: $scope.newProject.description,
				client: $scope.client,
				talent: $scope.talent,
				notifyClient: $scope.newProject.notifyClient
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

		// client update

		// update audition rating
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
			$scope.update(redirect);
		};

		// update audition rating
		$scope.updateFavorite = function(path, redirect){
			// determine if update should result in user redirect
			redirect = typeof redirect === 'undefined' ? true : redirect;

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

			// update project store
			$scope.update(redirect);
		};

		// update phase options
		$scope.updateStatus = function(key){

			// send update email
			$scope.gatherToAddresses('updateStatus');
		    $scope.email.subject = $scope.project.title + ' Phase ' + $scope.project.phases[key].name[0].toUpperCase() + $scope.project.phases[key].name.slice(1) + ' Status Update';
		    $scope.email.message += 'Project: ' + $scope.project.title + '<br>';
		    $scope.email.message += 'Phase: ' + $scope.project.phases[key].name[0].toUpperCase() + $scope.project.phases[key].name.slice(1)  + '<br>';
		    $scope.email.message += 'Status: ' + $scope.project.phases[key].status[0].toUpperCase() + $scope.project.phases[key].status.slice(1) + '<br>';
		    $scope.email.message += 'Start Date: ' + $scope.project.phases[key].startDate + '<br>';
		    $scope.email.message += 'End Date: ' + $scope.project.phases[key].endDate + '<br>' + '<br>';
		    $scope.email.message += 'Added by: ' + Authentication.user.displayName + '<br>';
		    $scope.email.message += '<br>' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '<br>';

		    $http.post('/projects/sendemail', {
				email: $scope.email
			});

		    if($scope.project.phases[key].status === 'complete'){
		    	var now = new Date();
		    	$scope.project.phases[key].endDate = now.toJSON();
				// update project status only for "Posting and Publishing" phase
				if($scope.project.phases[key].name === 'Posting and Publishing'){
					// reset overall project status to closed
					$scope.project.status = 'Closed - Pending Client Decision';

					// send closing email
					for(var i = 0; i < $scope.project.client.length; ++i){
						$scope.selectedMainClients[i] = $scope.project.client[i].userId;
					}
					$scope.sendClientEmail('closing');
				}


			}

			// update project store
			$scope.update();
		};

		$scope.updateProjectStatus = function(){

			$scope.gatherToAddresses('updateStatus');
		    $scope.email.subject = $scope.project.title + ' Status Update';
		    $scope.email.message += 'Project: ' + $scope.project.title + '<br>';
		    $scope.email.message += 'Status: ' + $scope.project.status.toUpperCase() + $scope.project.status.slice(1) + '<br>';
		    $scope.email.message += 'Added by: ' + Authentication.user.displayName + '<br>';
		    $scope.email.message += '<br>' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '<br>';

		    $http.post('/projects/sendemail', {
				email: $scope.email
			});

			// // send client email if project status is set to finished
			// if($scope.project.status === 'Complete'){
			// 	// build main clients list
			// 	for(var i = 0; i < $scope.project.client.length; ++i){
			// 		$scope.selectedMainClients[i] = $scope.project.client[i].userId;
			// 	}
			// 	$scope.sendClientEmail('closing');
			// }

			// update project store
			$scope.update();
		};
		// Find a list of Projects
		$scope.find = function() {
			$scope.projects = Projects.query();
		};

		Socket.on('projectsListUpdate', function() {
			$scope.find();
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

		Socket.on('projectUpdate', function(pojectData) {

			if(String(pojectData.id) === String($scope.project._id)){
				$scope.findOne();
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
			this.findOne();

			// enable audio load after watch
			$scope.loadAudio = 0;
		};

		// load audio files into player after project object has finished loading

		$scope.$watch('newProject.estimatedCompletionDate', function(val){
			var now = new Date();

			if($scope.newProject.estimatedCompletionDate < now){
				$scope.dateNotice = 'Date selected passed. Please select a future date and time!';
			} else {
				$scope.dateNotice = '';
			}
		});

		$scope.calcProjectProg = function(curProject){
			if(typeof curProject.phases !== 'undefined'){
				var phaseLngth = curProject.phases.length;
				var complSteps = 0;

				// determine completed steps
				for(var i = 0; i < phaseLngth; ++i){
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

		$scope.$watch('project', function(val){

			if(typeof $scope.project === 'object'){

				// check for values then do things
				$scope.$watch('project.referenceFiles',function(){
					if(typeof $scope.project.referenceFiles === 'object'){
						if($scope.project.referenceFiles.length > 0){
							$scope.toggleRefs = true;
						}
					}
				});

				// load auditions
				// $scope.$watch('project.auditions', function(val){

				// 	if(typeof $scope.project.auditions === 'object'){
				// 		// if($scope.loadAudio === 0){
				// 		// 	$scope.loadAudioPlayer();	
				// 		// 	$scope.loadAudio = 1;
				// 		// }

				// 		// load audition ratings
				// 		for(var i = 0; i < $scope.project.auditions.length; ++i){
				// 			// gather average value 
				// 			$scope.ratingsAvg[i] = 0;
				// 			// gather per user rating
				// 			for(var j = 0; j < $scope.project.auditions[i].rating.length; ++j){
				// 				if($scope.project.auditions[i].rating[j].userId === String(Authentication.user._id)){
				// 					$scope.ratings[i] = $scope.project.auditions[i].rating[j].value;
				// 				}
				// 				$scope.ratingsAvg[i] += $scope.project.auditions[i].rating[j].value;
				// 			}
				// 			$scope.ratingsAvg[i] = $scope.ratingsAvg[i] / $scope.project.auditions[i].rating.length;
				// 		}
				// 	}
				// });

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
		});

		// load audio files
		$scope.loadAudioPlayer = function(){
			if(typeof $scope.project.auditions !== 'undefined'){
				var loadCnt = $scope.project.auditions.length;
				var curVal = 0;
				if($scope.project.auditions.length > 1){
					loadCnt = loadCnt - 1;
				}
				angular.forEach($scope.project.auditions, function(value, key){
					if(value){
						if(typeof value.file !== 'undefined'){
							if(value.file.type === 'audio/mp3' || value.file.type === 'audio/mpeg'){
								var fileName = '/res/auditions/'+$scope.project._id+'/'+value.file.name;
								// only load audio file if needed
								if(typeof $scope.audio[key] === 'object'){
									if($scope.audio[key].id !== fileName){
										$scope.audio[key] = ngAudio.load(fileName);
										$scope.audio[key].unbind();
									}
								} else {
									$scope.audio[key] = ngAudio.load(fileName);
									$scope.audio[key].unbind();
								}
								if($scope.project.auditions.length === 1){
									curVal = 1;
								} else {
									curVal = key;
								}
								$scope.uploadfile = 'loading audio ' + parseInt(100.0 * curVal / loadCnt) + '%';
								$scope.uploadprogress = parseInt(100.0 * curVal / loadCnt);
							}
						}
					}
				});
			}
		};

		$scope.verifyAudio = function(key){
			if(typeof $scope.project.auditions[key] === 'object'){
				if(typeof $scope.project.auditions[key].file === 'object'){
					return true;
				}
			}
			return false;
		};

		$scope.stopAudio = function(){
			if(typeof $scope.audio === 'object'){
				$scope.audio.stop();
				$scope.audioStatus = 2;
			}
		};

		$scope.playAudio = function(key, filename){
			
			// check media file play state
			if(typeof $scope.audio === 'object' && key === $scope.lastAudioID && $scope.audioStatus === 1){
				$scope.audio.pause();
				$scope.audioStatus = 0;
				//console.log('pause');
				return;
			}
			if(typeof $scope.audio === 'object' && key === $scope.lastAudioID && $scope.audioStatus === 0){
				$scope.audio.play();
				$scope.audioStatus = 1;
				//console.log('play');
				return;
			}
			if(typeof $scope.audio === 'object' && key === $scope.lastAudioID && $scope.audioStatus === 2){
				$scope.audio.play();
				$scope.audioStatus = 1;
				//console.log('play');
				return;
			}

			// // disable previous
			// if(typeof $scope.audio === 'object'){
			// 	if(key !== $scope.lastAudioID){
			// 		$scope.audio[$scope.lastAudioID].stop();
			// 	}
			// }

			// assign file name
			var fileName = '/res/auditions/' + $scope.project._id + '/' + filename;

			// if(typeof $scope.audio === 'object'){
			// 	if($scope.audio.id !== fileName){
			// 		$scope.audio = ngAudio.load(fileName);
			// 		$scope.audio.unbind();
			// 		$scope.audioStatus = 1;
			// 	}
			// } else {
				$scope.audio = ngAudio.load(fileName);
				$scope.audio.unbind();
				$scope.audioStatus = 1;	
			// }

			//console.log('load');

			$scope.audio.play();
			$scope.lastAudioID = key;
		};

		// save discussion item
		$scope.saveDiscussion = function(){
			var now = new Date();
			var item = {date: now.toJSON(), userid: Authentication.user._id, username: Authentication.user.displayName, item: this.discussion, deleted: false};

			$scope.project.discussion.push(item);

			// send update email
			$scope.gatherToAddresses('saveDiscussion');
		    $scope.email.subject = $scope.project.title + ' discussion added';
		    $scope.email.message = 'Discussion Item: ' + this.discussion + '<br>';
		    $scope.email.message += 'Project: ' + $scope.project.title + '<br>';
		    $scope.email.message += 'Added by: ' + Authentication.user.displayName + '<br>';
		    $scope.email.message += '<br>' + 'For more information, please visit: ' + $location.protocol() + '://' + $location.host() + ($location.port() !== 80 ? ':' + $location.port() : '') + '/#!/projects/' + $scope.project._id + '<br>';

			$scope.discussion = '';

		    $http.post('/projects/sendemail', {
				email: $scope.email
			});
			// update project store
			$scope.update();
		};

		$scope.deleteDiscussion = function(key){
			// reverse selction id 
			var selVal = ($scope.project.discussion.length - 1) - key;

			// apply to reverse index
			$scope.project.discussion[selVal].deleted = true;

			// update project store
			$scope.update();
		};

		$scope.delScript = function(idx){
			// verify user wants to delete file
			if (confirm('Are you sure?')) {

				var file = '/res/scripts/' + $scope.project._id + '/' + $scope.project.scripts[idx].file.name;

				$http.put('/projects/deletefile', {
			        fileLocation: file
			    });

				$scope.project.scripts.splice(idx, 1);

				// update project store
				$scope.update();
				
			}
		};

		$scope.delTempScript = function(idx){
			var file = '/res/scripts/temp/' + $scope.scripts[idx].file.name;

			$http.post('/projects/deletefile', {
		        fileLocation: file
		    });

		    $scope.scripts.splice(idx, 1);
		};

		$scope.uploadScript = function($files) {
	    //$files: an array of files selected, each file has name, size, and type.

	    for (var i = 0; i < $files.length; i++) {
	      var file = $files[i];

	      performScriptUpload(file, i, $files);
    	 }
	  	};

	  	var performScriptUpload = function(file, i, $files){
	  		$scope.upload = $upload.upload({
	        url: 'projects/uploads/script', //upload.php script, node.js route, or servlet url 
	        //method: 'POST' or 'PUT', 
	        data: {project: $scope.project},
	        file: file, // or list of files ($files) for html5 only 
	      }).progress(function(evt) {
	        $scope.uploadStatus = i + ' of ' + $files.length + ' files uploaded';
	      	$scope.uploadfile = evt.config.file.name;
	        $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
	      }).success(function(data, status, headers, config) {
	        // file is uploaded successfully 
			$scope.project = angular.extend($scope.project, data);
	      });
	  	};

	  	$scope.uploadTempScript = function($files) {
	    //$files: an array of files selected, each file has name, size, and type. 
	    for (var i = 0; i < $files.length; i++) {
	    	var file = $files[i];

	    		performUploadTempScript(file, i, $files);
    		}
	  	};

	  	var performUploadTempScript = function(file, i, $files){
  		  $scope.upload = $upload.upload({
	        url: 'projects/uploads/script/temp', //upload.php script, node.js route, or servlet url 
	        data: {project: $scope.project},
	        file: file, // or list of files ($files) for html5 only 
	      }).progress(function(evt) {
	        $scope.uploadStatus = i + ' of ' + $files.length + ' files uploaded';
	      	$scope.uploadfile = evt.config.file.name;
	        $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
	      }).success(function(data, status, headers, config) {
	        // file is uploaded successfully 
	        //console.log(data);
	        $scope.scripts.push(data[0]);
	      });
	  	};

	  	// set published status
	  	$scope.updatePublished = function(key){
	  		if(this.project.auditions[key].published === false){
	  			$scope.project.auditions[key].published = true;
	  		} else {
	  			$scope.project.auditions[key].published = false;
	  		}

	  		// update project store
			$scope.update();
	  	};

		$scope.uploadReferenceFile = function($files) {
	    //$files: an array of files selected, each file has name, size, and type.

	    for (var i = 0; i < $files.length; i++) {
		    var file = $files[i];

		    	performUploadReferenceFile(file, i, $files);
	    	}
	  	};

	  	var performUploadReferenceFile = function(file, i, $files){
		  	$scope.upload = $upload.upload({
		        url: 'projects/uploads/referenceFile', //upload.php script, node.js route, or servlet url 
		        data: {project: $scope.project},
		        file: file, // or list of files ($files) for html5 only 
		    }).progress(function(evt) {
		        $scope.uploadStatus = i + ' of ' + $files.length + ' files uploaded';
		      	$scope.uploadfile = evt.config.file.name;
		        $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
		    }).success(function(data, status, headers, config) {
				$scope.project = angular.extend($scope.project, data);
		    });
	  	};

	  	$scope.uploadTempReferenceFile = function($files) {
		    //$files: an array of files selected, each file has name, size, and type. 
		    for (var i = 0; i < $files.length; i++) {
		    	var file = $files[i];

			    performUploadTempReferenceFile(file, i, $files);
	    	}
	  	};

	  	var performUploadTempReferenceFile = function(file, i, $files){
	  		$scope.upload = $upload.upload({
		        url: 'projects/uploads/referenceFile/temp', //upload.php script, node.js route, or servlet url 
		        data: {project: $scope.project},
		        file: file, // or list of files ($files) for html5 only 
		    }).progress(function(evt) {
		        $scope.uploadStatus = i + ' of ' + $files.length + ' files uploaded';
		      	$scope.uploadfile = evt.config.file.name;
		        $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
		    }).success(function(data, status, headers, config) {
		        // file is uploaded successfully 
		        //console.log(data);
		        $scope.referenceFiles.push(data[0]);
		    });
	  	};

	  	$scope.delTempReferenceFile = function(idx){
			var file = '/res/referenceFiles/temp/' + $scope.referenceFiles[idx].file.name;

			$http.post('/projects/deletefile', {
		        fileLocation: file
		    });

		    $scope.referenceFiles.splice(idx, 1);
		};

	  	$scope.delReferenceFile = function(idx){
			// verify user wants to delete file
			if (confirm('Are you sure?')) {

				var file = '/res/referenceFiles/' + $scope.project._id + '/' + $scope.project.referenceFiles[idx].file.name;

				$http.post('/projects/deletefile', {
			        fileLocation: file
			    });

				$scope.project.referenceFiles.splice(idx, 1);

				// update project store
				$scope.update();
				
			}
		};

		$scope.delAudition = function(idx){
			// verify user wants to delete file
			if (confirm('Are you sure?')) {

				// tell audio system to reload files
				$scope.loadAudio = 0;

				var file = '/res/auditions/' + $scope.project._id + '/' + $scope.project.auditions[idx].file.name;

			    // delete selected file
				$http.post('/projects/deletefile', {
			        fileLocation: file
			    });

				$scope.project.auditions.splice(idx, 1);

				// update project store
				$scope.update();
				
			}
		};

		$scope.uploadAudition = function($files) {

			// tell audio system to reload files
			$scope.loadAudio = 0;

		    //$files: an array of files selected, each file has name, size, and type. 
		    for (var i = 0; i < $files.length; i++) {
		    	var file = $files[i];
		    
		    	performUploadAudition(file, i, $files);
		    }
		};

		var performUploadAudition = function(file, i, $files){
			$scope.upload = $upload.upload({
		        url: 'projects/uploads/audition', //upload.php script, node.js route, or servlet url 
		        data: {project: $scope.project},
		        file: file, // or list of files ($files) for html5 only 
		    }).progress(function(evt) {
		      	$scope.uploadStatus = i + ' of ' + $files.length + ' files uploaded';
		      	$scope.uploadfile = evt.config.file.name;
		        $scope.uploadprogress = parseInt(100.0 * evt.loaded / evt.total);
		    }).success(function(data, status, headers, config) {
		        // file is uploaded successfully 
		        $scope.project = angular.extend($scope.project, data);
		    });
		};

	}
]);
'use strict';

//Projects service used to communicate Projects REST endpoints
angular.module('projects').factory('Projects', ['$resource',
	function($resource) {
		return $resource('projects-client/:projectId', { projectId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
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
		Menus.addMenuItem('topbar', 'Reports', 'reports', 'dropdown', '/reports(/create)?', false, ['admin','producer/auditions director','talent director'], 2);
		//Menus.addSubMenuItem('topbar', 'reports', 'Generate Reports', 'reports');
		Menus.addSubMenuItem('topbar', 'reports', 'Missing Auditions', 'reports/missing-auditions');
		Menus.addSubMenuItem('topbar', 'reports', 'Auditions Booked', 'reports/auditions-booked');
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
		Menus.addMenuItem('topbar', 'Talent', 'talents', 'dropdown', '/talents(/create)?', false, ['admin','producer/auditions director','talent director'], 3);
		Menus.addSubMenuItem('topbar', 'talents', 'List Talent', 'talents', false, false, ['admin','producer/auditions director','talent director']);
		Menus.addSubMenuItem('topbar', 'talents', 'New Talent', 'talents/create', false, false, ['admin','talent director']);
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
		$scope.typeSelected = [];
		$scope.selTypecasts = [];
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
				unionJoined: this.unionJoinSelected
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
angular.module('talents').controller('TalentsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Talents', '$http', '$rootScope', 'Socket',
	function($scope, $stateParams, $location, Authentication, Talents, $http, $rootScope, Socket) {
		$scope.authentication = Authentication;

		// talent static options
		$scope.typeOptions = ['Email','Phone'];
		$scope.unionOptions = ['union','non-union'];
		$scope.locations = ['Offsite', 'Las Vegas', 'New York', 'Richmond', 'Santa Monica', 'Virginia Beach', 'Washington DC'];
		$scope.exclusivityOpts = ['Non-Union Exclusive', 'Union', 'Non-Union Exclusive and Union', 'Foreign Language Agreement Non-Union', 'Foreign Language Agreement Union', 'Foreign Language Agreement Non-Union and Union', 'ISDN Non-Union', 'ISDN Union', 'ISDN Non-Union and Union', 'Independent Contractor Agreement Non-Union', 'Independent Contractor Agreement Union', 'Independent Contractor Agreement Non-Union and Union'];
		$scope.unionJoinedOpts = ['SAG/AFTRA', 'OTHER'];
		$scope.unionSelected = [];
		$scope.unionJoinSelected = [];
		$scope.typeSelected = 'Email';
		$scope.selTypecasts = [];
		// store talent project data
		$scope.projectTalentIdx = [];
		$scope.talentStatus = ['Cast', 'Emailed', 'Scheduled', 'Message left', 'Out', 'Received needs to be posted', 'Posted', 'Not Posted (Bad Read)'];
		$scope.archived = false;

		// listing filter
		$scope.startsWith = function (actual, expected) {
		    var lowerStr = (actual + '').toLowerCase();
		    return lowerStr.indexOf(expected.toLowerCase()) === 0;
		};

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

		// user access rules
		$scope.permitAdminDirector = function(){
			var allowRoles = ['admin','talent director'];

			for(var i = 0; i < Authentication.user.roles.length; ++i){
				for(var j = 0; j < allowRoles.length; ++j){
					if(Authentication.user.roles[i] === allowRoles[j]) {
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
				unionJoined: this.unionJoinSelected
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

			$scope.$watch('talent._id', function(val){

				$http.post('/projects/filterByTalent', {
			        talentId: $scope.talent._id,
			        archived: $scope.archived
			    }).
				success(function(data, status, headers, config) {
					// store projects data
					$scope.projects = data;

					// gather project talent indexs
					for(var i = 0; i < data.length; ++i){
						// walk through projects assigned talents looking for current selected talent
						for(var j = 0; j < data[i].talent.length; ++j){
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
		Menus.addMenuItem('topbar', 'Tools', 'tools', 'dropdown', '/tools(/create)?', false, ['admin','producer/auditions director', 'production coordinator'], 1);
		Menus.addSubMenuItem('topbar', 'tools', 'Call List', 'tools/call-list');
		Menus.addSubMenuItem('topbar', 'tools', 'Email Talent', 'tools/email-talent');
		Menus.addSubMenuItem('topbar', 'tools', 'Backup/Restore', 'tools/backup-restore');
		Menus.addSubMenuItem('topbar', 'tools', 'Delete Projects', 'tools/delete-projects');
		Menus.addSubMenuItem('topbar', 'tools', 'Talent Import', 'tools/talent-import');
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
		// delete projects vals
		$scope.selectAll = '';
		$scope.projects = [];
		$scope.projectsList = [];

		// spreadsheet processing
		$scope.google = {
			spreadsheetkey: '',
			username: '',
			password: ''
		};

		// alerts
		$scope.closeAlert = function(index) {
		    $scope.alerts.splice(index, 1);
		};

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
				if($scope.talents[i]._id === id){
					return $scope.talents[i].name + ' ' + $scope.talents[i].lastName;
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
			var idx;

			for(var i = 0; i < $scope.verifySelected.length; ++i){
				for(var j = 0; j < $scope.emailClients.length; ++j){					
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
		    	default:
		    		$scope.gatherTalentsToCall();
					$scope.gatherTalentsMessagesLeft();
					$scope.gatherTalentsAlreadyScheduled();
		    	break;
		    }

		});
		// gather list of talents to call
		$scope.talentLookupData = function(id){
			for(var i = 0; i < $scope.talents.length; ++i){
				if(String($scope.talents[i]._id) === String(id)){
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
			var allowRoles = ['admin', 'producer/auditions director','talent director'];

			for(var i = 0; i < Authentication.user.roles.length; ++i){
				for(var j = 0; j < allowRoles.length; ++j){
					if(Authentication.user.roles[i] === allowRoles[j]) {
						return true;
					}
				}
			}
		};

		// Create new Typecast
		$scope.create = function() {
			// Create new Typecast object
			var typecast = new Typecasts ({
				name: this.name
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
		Menus.addMenuItem('topbar', 'Users', 'users', 'dropdown', '/usersedit(/create)?', false, ['admin','producer/auditions director'], 4);
		Menus.addSubMenuItem('topbar', 'users', 'List Users', 'usersedit', false, false, ['admin','producer/auditions director']);
		Menus.addSubMenuItem('topbar', 'users', 'Create New User', 'usersedit/create', false, false, ['admin']);
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
				if($scope.authentication.user.roles[0] === 'admin' || $scope.authentication.user.roles[0] === 'producer/auditions director'){
					$location.path('/projects');
				} else if($scope.authentication.user.roles[0] === 'client' || $scope.authentication.user.roles[0] === 'client-client') {
					$location.path('/projects-client');
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

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// custom arrays
		$scope.roleOpts = ['user', 'admin', 'producer/auditions director', 'talent', 'talent director', 'client', 'agency'];

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

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
angular.module('users').controller('UsersController', ['$scope', '$stateParams', '$location', 'Authentication', 'UsersEdit', 'UsersFind', '$http', '$rootScope',
	function($scope, $stateParams, $location, Authentication, UsersEdit, UsersFind, $http, $rootScope) {
		$scope.authentication = Authentication;

		$scope.roleOpts = ['user', 'admin', 'producer/auditions director', 'production coordinator', 'talent director', 'client', 'client-client'];

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
		$rootScope.$on('refreshFilter', 
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