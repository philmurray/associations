"use strict";
angular.module('associations.pages.landing.components.alerts', [
	'associations.components.data.user'
])
	.controller("AlertsCtrl", ["$scope", "UserService", function($scope, UserService){
		var self = this;

		UserService.notifications().then(function(response){
			self.notifications = response.data;
		});

	}]);
