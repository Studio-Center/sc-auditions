'use strict';

// Configuring the Articles module
angular.module('talents').run(['Menus', 'Authentication',
	function(Menus, Authentication) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Talent', 'talents', 'dropdown', '/talents(/create)?', false, ['admin', 'producer/auditions director', 'audio intern', 'production coordinator', 'talent director'], 3);
		Menus.addSubMenuItem('topbar', 'talents', 'Browse', 'talents', false, false, ['admin','producer/auditions director', 'audio intern', 'production coordinator', 'talent director']);
		Menus.addSubMenuItem('topbar', 'talents', 'New', 'talents/create', false, false, ['admin', 'talent director','producer/auditions director', 'audio intern', 'production coordinator']);
	}
]);