'use strict';

// Configuring the Articles module
angular.module('agencies').run(['Menus', 'Authentication',
	function(Menus, Authentication) {
		// Set top bar menu items
		if(Authentication.user.role === 'admin' || Authentication.user.role === 'producer/auditions director'){
			Menus.addMenuItem('topbar', 'Agencies', 'agencies', 'dropdown', '/agencies(/create)?');
			Menus.addSubMenuItem('topbar', 'agencies', 'List Agencies', 'agencies');
			Menus.addSubMenuItem('topbar', 'agencies', 'New Agency', 'agencies/create');
		}
	}
]);