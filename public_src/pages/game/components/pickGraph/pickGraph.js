"use strict";

angular.module('associations.pages.game.components.pickGraph', [])

.directive("pickGraph", [function () {
	return {
		restrict: 'E',
		templateUrl: 'pages/game/components/pickGraph/pickGraph.html',
		scope: {
			model:'=graphModel'
		},
		link: function($scope, $element, attrs) {
			var canvas = $element.find('canvas')[0],
				ctx = canvas.getContext('2d');

			var render = function(){

			};

			$scope.$watchCollection('model', render);
		}
	};
}]);
