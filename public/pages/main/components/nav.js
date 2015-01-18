"use strict";

angular.module('associations.pages.main.components.nav',[])

.directive("MainNavigation", ["$window", function ($window) {
	return {
		restrict: 'EA',
		scope: {},
		link: function(scope, element, attrs) {
			var svg = d3.select(element[0])
					.append('svg')
					.style('width', '100%')
					.style('height', '100%'),
				w = angular.element($window);

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
			});

			scope.render = function() {
				// our custom d3 code
			};
		}};
}]);
