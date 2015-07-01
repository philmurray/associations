"use strict";

angular.module('associations.components.levelProgress', [])
	.directive('levelProgress', [function() {
		return {
			restrict: 'EA',
			scope: {
				level: "="
			},
			templateUrl: "components/levelProgress/levelProgress.html",
			link: function($scope, $element, attrs) {

			}
		};
	}]);
