'use strict';

// Configuring the Articles module
angular.module('talents').run(['Menus', 'Authentication',
	function(Menus, Authentication) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Talents', 'talents', 'dropdown', '/talents(/create)?', false, ['admin','producer/auditions director','talent director']);
		Menus.addSubMenuItem('topbar', 'talents', 'List Talents', 'talents', false, ['admin','producer/auditions director','talent director']);
		Menus.addSubMenuItem('topbar', 'talents', 'New Talent', 'talents/create', false, ['admin','producer/auditions director','talent director']);
	}
]);