"use strict";

angular.module('associations.pages.landing', ['associations.components.login'])

.controller("LandingController", ["$scope", "authenticated", "LoginService", function($scope, authenticated, LoginService) {
	$scope.footer.visible = true;
	$scope.authenticated = authenticated;
	$scope.logIn = function(){
		LoginService.login().then(function(){
			$scope.authenticated = true;
		});
	};
}]);
