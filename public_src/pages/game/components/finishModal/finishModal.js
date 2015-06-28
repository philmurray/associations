"use strict";

angular.module('associations.pages.game.components.finishModal', [])

.controller("FinishModalController", ["$scope", "$modalInstance", "showInstructions", function($scope, $modalInstance, showInstructions) {
	$scope.close = $modalInstance.close;
	$scope.instructions = {
		shown: showInstructions
	};

	var titles = [
		"All Done!",
		"Good Job!",
		"Whew!",
		"Nicely done.",
		"Human after all",
		"Close your mind now"
	];
	$scope.title = titles[Math.floor(Math.random()*titles.length)];
}]);
