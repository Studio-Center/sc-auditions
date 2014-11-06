'use strict';

// Configuring the Articles module
angular.module('typecasts').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Typecasts', 'typecasts', 'dropdown', '/typecasts(/create)?');
		Menus.addSubMenuItem('topbar', 'typecasts', 'List Typecasts', 'typecasts');
		Menus.addSubMenuItem('topbar', 'typecasts', 'New Typecast', 'typecasts/create');
	}
]);