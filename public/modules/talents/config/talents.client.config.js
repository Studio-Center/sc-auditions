'use strict';

// Configuring the Articles module
angular.module('talents').run(['Menus', 'Authentication',
	function(Menus, Authentication) {
		// Set top bar menu items
		if(Authentication.user.roles === 'admin' || Authentication.user.roles === 'producer/auditions director'){
			Menus.addMenuItem('topbar', 'Talents', 'talents', 'dropdown', '/talents(/create)?');
			Menus.addSubMenuItem('topbar', 'talents', 'List Talents', 'talents');
			Menus.addSubMenuItem('topbar', 'talents', 'New Talent', 'talents/create');
		}
	}
]);