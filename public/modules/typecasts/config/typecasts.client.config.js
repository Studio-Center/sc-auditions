'use strict';

// Configuring the Articles module
angular.module('typecasts').run(['Menus', 'Authentication',
	function(Menus, Authentication) {
		// Set top bar menu items
		if(Authentication.user.role === 'admin' || Authentication.user.role === 'producer/auditions director'){
			//Menus.addMenuItem('topbar', 'Typecasts', 'typecasts', 'dropdown', '/typecasts(/create)?');
			Menus.addSubMenuItem('topbar', 'talents', 'List Typecasts', 'typecasts');
			Menus.addSubMenuItem('topbar', 'talents', 'New Typecast', 'typecasts/create');
		}
	}
]);