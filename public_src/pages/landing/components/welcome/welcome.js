"use strict";
angular.module('associations.pages.landing.components.welcome', [
	'associations.components.data.user'
])
	.controller("WelcomeCtrl", ["$scope", "UserService", function($scope, UserService){
		var self = this;

		UserService.get().then(function(response){
			self.user = response.data;
		});

	}]);
