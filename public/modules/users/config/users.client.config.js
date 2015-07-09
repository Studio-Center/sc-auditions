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
		Menus.addMenuItem('topbar', 'Users', 'users', 'dropdown', '/usersedit(/create)?', false, ['admin','producer/auditions director'],4);
		Menus.addSubMenuItem('topbar', 'users', 'List Users', 'usersedit', false, false, ['admin','producer/auditions director']);
		Menus.addSubMenuItem('topbar', 'users', 'Create New User', 'usersedit/create', false, false, ['admin']);
	}
]);