'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus', '$window', '$rootScope', '$location',
	function($scope, Authentication, Menus, $window, $rootScope, $location) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});

		// track page views
		$rootScope.$on('$viewContentLoaded', function(event) {
		  $window.ga('send', 'pageview', { page: $location.url() });
		});

	}
]);