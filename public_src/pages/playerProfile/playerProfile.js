"use strict";

angular.module('associations.pages.playerProfile',[
	'directives.inputMatch',
	'associations.components.data.user'])

.controller("PlayerProfileController", ["$scope", "user", "UserService", function ($scope, user, UserService) {
	var blank = "................";

	$scope.user = angular.extend({},user.data);
	$scope.user.password = $scope.passwordConfirm = $scope.user.hasPassword ? blank : "";

	$scope.forms = {};

	$scope.save = function (){

	};
}]);
