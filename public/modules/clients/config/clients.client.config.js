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
