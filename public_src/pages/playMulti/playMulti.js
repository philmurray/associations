"use strict";

angular.module('associations.pages.playMulti',[])

.controller("PlayMultiController", ["$scope", "user", "color", function ($scope, user, color) {
	$scope.color = color;

}]);
