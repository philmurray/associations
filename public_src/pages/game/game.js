"use strict";

angular.module('associations.pages.game', [
])

.controller("GameController", ["$scope", "color", "game", function($scope, color, game) {

	$scope.color = color;

}]);
