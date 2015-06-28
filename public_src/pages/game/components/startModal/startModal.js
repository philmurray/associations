"use strict";

angular.module('associations.pages.game.components.startModal', [
	'ui.bootstrap'
])

.controller("StartModalController", ["$scope", "$modalInstance", "showInstructions", function($scope, $modalInstance, showInstructions) {
	$scope.close = $modalInstance.close;
	$scope.instructions = {
		shown: showInstructions
	};

	var titles = [
		"Get Ready",
		"Clear your mind",
		"Empty your thoughts",
		"Brace yourself",
		"Ready, Set ...",
		"Open your mind"
	];
	$scope.title = titles[Math.floor(Math.random()*titles.length)];
}]);
