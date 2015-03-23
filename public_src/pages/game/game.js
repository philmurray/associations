"use strict";

angular.module('associations.pages.game', [
])

.controller("GameController", ["$scope", "color", "game", function($scope, color, game) {
	$scope.color = color;

	$scope.game = game;

	$scope.getStatus = function(player){
		if (!player.completed) return "Waiting...";
		//else get their score, etc.
	};
}]);
