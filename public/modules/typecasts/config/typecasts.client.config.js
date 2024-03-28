'use strict';

// Configuring the Articles module
angular.module('typecasts').run(['Menus', 'Authentication',
	function(Menus, Authentication) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Typecasts', 'typecasts', 'dropdown', '/talents(/create)?', false, ['admin', 'producer/auditions director','auditions director','audio intern', 'production coordinator', 'talent director'], 5);
		Menus.addSubMenuItem('topbar', 'typecasts', 'List', 'typecasts', false, false, ['admin','talent director']);
		Menus.addSubMenuItem('topbar', 'typecasts', 'New', 'typecasts/create', false, false, ['admin','talent director']);
	}
]);