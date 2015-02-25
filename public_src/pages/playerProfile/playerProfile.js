"use strict";

angular.module('associations.pages.playerProfile',[])

.controller("PlayerProfileController", ["$scope", "user", function ($scope, user) {
	$scope.user = angular.extend({},user.data);
}]);
