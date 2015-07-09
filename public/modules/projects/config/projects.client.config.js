'use strict';

// Configuring the Articles module
angular.module('projects').run(['Menus', 'Authentication',
	function(Menus, Authentication) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Projects', 'projects', 'dropdown', '/projects(/create)?', false, ['admin', 'producer/auditions director', 'production coordinator', 'talent director', 'client', 'client-client'], 0);
		Menus.addSubMenuItem('topbar', 'projects', 'New Project', 'projects/create', false, false, ['admin', 'production coordinator']);
		Menus.addSubMenuItem('topbar', 'projects', 'List Projects', 'projects', false, false, ['admin','producer/auditions director', 'production coordinator', 'talent director']);
		Menus.addSubMenuItem('topbar', 'projects', 'Client Portal', 'projects-client', false);
		Menus.addSubMenuItem('topbar', 'projects', 'Start A New Audition Project', 'projects/new-audition-form', false, false, ['client']);
	}
]);