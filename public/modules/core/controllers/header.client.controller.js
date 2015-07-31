'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus', '$window',
	function($scope, Authentication, Menus, $window) {
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
		$scope.$on('$viewContentLoaded', function(event) {
		  $window._gaq.push(['_trackPageview', $location.url()]);
		});

	}
]);