"use strict";

angular.module('associations.pages.main.components.nav',[])

.directive("mainNavigation", ["$window", function ($window) {
	return {
		restrict: 'EA',
		templateUrl: "pages/main/components/nav.html",
		scope: {},
		link: function(scope, element, attrs) {
			var w = angular.element($window);

			// Browser onresize event
			w.bind('resize', function () {
				scope.$apply();
			});

			// Watch for resize event
			scope.$watch(function() {
				return {
					width: w.width(),
					height: w.height()
				};
			}, function() {
				scope.render();
			},true);

			scope.render = function() {
				debugger;
			};
	}};
}]);
