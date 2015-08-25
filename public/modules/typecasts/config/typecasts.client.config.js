'use strict';

// Configuring the Articles module
angular.module('typecasts').run(['Menus', 'Authentication',
	function(Menus, Authentication) {
		// Set top bar menu items
		//Menus.addMenuItem('topbar', 'Typecasts', 'typecasts', 'dropdown', '/typecasts(/create)?', false, ['admin']);
		Menus.addSubMenuItem('topbar', 'talents', 'List Typecasts', 'typecasts', false, false, ['admin','talent director']);
		Menus.addSubMenuItem('topbar', 'talents', 'New Typecast', 'typecasts/create', false, false, ['admin','talent director']);
	}
]);