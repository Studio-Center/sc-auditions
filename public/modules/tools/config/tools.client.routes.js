'use strict';

//Setting up route
angular.module('tools').config(['$stateProvider',
	function($stateProvider) {
		// Tools state routing
		$stateProvider.
		state('listTools', {
			url: '/tools',
			templateUrl: 'modules/tools/views/list-tools.client.view.html'
		}).
		state('talentEmailTool', {
			url: '/tools/email-talent',
			templateUrl: 'modules/tools/views/email-talent-tool.client.view.html'
		}).
		state('talentCallList', {
			url: '/tools/call-list',
			templateUrl: 'modules/tools/views/call-list.client.view.html'
		}).
		state('toolDeleteProjects', {
			url: '/tools/delete-projects',
			templateUrl: 'modules/tools/views/delete-projects.client.view.html'
		}).
		state('toolBackupProjects', {
			url: '/tools/backup-restore',
			templateUrl: 'modules/tools/views/backup-projects.client.view.html'
		}).
		state('toolTalentImport', {
			url: '/tools/talent-import',
			templateUrl: 'modules/tools/views/talent-import.client.view.html'
		}).
		state('toolListNewprojects', {
			url: '/tools/list-newprojects',
			templateUrl: 'modules/tools/views/list-newprojects.client.view.html'
		}).
		state('toolNewprojectByID', {
			url: '/tools/new-project-byid/:newprojectId',
			templateUrl: 'modules/tools/views/new-project-byid.client.view.html'
		});
		// state('createTool', {
		// 	url: '/tools/create',
		// 	templateUrl: 'modules/tools/views/create-tool.client.view.html'
		// }).
		// state('viewTool', {
		// 	url: '/tools/:toolId',
		// 	templateUrl: 'modules/tools/views/view-tool.client.view.html'
		// }).
		// state('editTool', {
		// 	url: '/tools/:toolId/edit',
		// 	templateUrl: 'modules/tools/views/edit-tool.client.view.html'
		// });
	}
]);
