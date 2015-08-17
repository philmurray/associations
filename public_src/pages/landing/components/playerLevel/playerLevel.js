"use strict";
angular.module('associations.pages.landing.components.playerLevel', [
	'associations.components.data.user'
])
.controller("PlayerLevelCtrl", ["$scope", "UserService", function($scope, UserService){
	var self = this;

	UserService.get().then(function(response){
		self.user = response.data;
	});
}]);
