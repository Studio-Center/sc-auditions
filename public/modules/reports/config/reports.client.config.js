'use strict';

// Configuring the Articles module
angular.module('reports').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Reports', 'reports', 'dropdown', '/reports(/create)?', false, ['admin','producer/auditions director','talent director'],2);
		//Menus.addSubMenuItem('topbar', 'reports', 'Generate Reports', 'reports');
		Menus.addSubMenuItem('topbar', 'reports', 'Missing Auditions', 'reports/missing-auditions');
		Menus.addSubMenuItem('topbar', 'reports', 'Auditions Booked', 'reports/auditions-booked');
	}
]);