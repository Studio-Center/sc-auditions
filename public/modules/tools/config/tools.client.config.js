'use strict';

// Configuring the Articles module
angular.module('tools').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Tools', 'tools', 'dropdown', '/tools(/create)?', false, ['admin','producer/auditions director', 'audio intern', 'production coordinator'], 1);
		Menus.addSubMenuItem('topbar', 'tools', 'Call List', 'tools/call-list');
		Menus.addSubMenuItem('topbar', 'tools', 'Email Talent', 'tools/email-talent');
		Menus.addSubMenuItem('topbar', 'tools', 'Backup/Restore', 'tools/backup-restore');
		Menus.addSubMenuItem('topbar', 'tools', 'Delete Projects', 'tools/delete-projects', false, false, ['admin', 'production coordinator']);
		Menus.addSubMenuItem('topbar', 'tools', 'Talent Import', 'tools/talent-import');
		Menus.addSubMenuItem('topbar', 'tools', 'Logs', 'logs', false, false, ['admin']);
	}
]);
