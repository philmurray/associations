"use strict";

angular.module('associations.pages.game.components.startModal', [
	'ui.bootstrap'
])

.controller("StartModalController", ["$scope", "$modalInstance", function($scope, $modalInstance) {
	$scope.close = $modalInstance.close;
}]);
