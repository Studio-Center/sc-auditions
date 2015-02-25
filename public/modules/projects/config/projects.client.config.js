'use strict';

// Configuring the Articles module
angular.module('projects').run(['Menus', 'Authentication',
	function(Menus, Authentication) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Projects', 'projects', 'dropdown', '/projects(/create)?');
		Menus.addSubMenuItem('topbar', 'projects', 'List Projects', 'projects');
		if(Authentication.user.roles === 'admin' || Authentication.user.roles === 'producer/auditions director'){
			Menus.addSubMenuItem('topbar', 'projects', 'New Project', 'projects/create');
		}
	}
]);