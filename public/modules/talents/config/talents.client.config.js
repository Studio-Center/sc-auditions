'use strict';

// Configuring the Articles module
angular.module('talents').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Talents', 'talents', 'dropdown', '/talents(/create)?');
		Menus.addSubMenuItem('topbar', 'talents', 'List Talents', 'talents');
		Menus.addSubMenuItem('topbar', 'talents', 'New Talent', 'talents/create');
	}
]);