'use strict';

// Configuring the Articles module
angular.module('talents').run(['Menus', 'Authentication',
	function(Menus, Authentication) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Talent', 'talents', 'dropdown', '/talents(/create)?', false, ['admin','producer/auditions director','talent director']);
		Menus.addSubMenuItem('topbar', 'talents', 'List Talent', 'talents', false, false, ['admin','producer/auditions director','talent director']);
		Menus.addSubMenuItem('topbar', 'talents', 'New Talent', 'talents/create', false, false, ['admin','talent director']);
	}
]);