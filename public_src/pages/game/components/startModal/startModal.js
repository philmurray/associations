"use strict";

angular.module('associations.pages.game.components.startModal', [
	'ui.bootstrap'
])

.controller("StartModalController", ["$scope", "color", "$modalInstance", function($scope, color, $modalInstance) {
	$scope.color = color;
	$scope.close = $modalInstance.close;
}]);
