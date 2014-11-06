'use strict';

// Configuring the Articles module
angular.module('agencies').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Agencies', 'agencies', 'dropdown', '/agencies(/create)?');
		Menus.addSubMenuItem('topbar', 'agencies', 'List Agencies', 'agencies');
		Menus.addSubMenuItem('topbar', 'agencies', 'New Agency', 'agencies/create');
	}
]);