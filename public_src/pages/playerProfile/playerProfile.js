"use strict";

angular.module('associations.pages.playerProfile',[
	'directives.inputMatch',
	'associations.components.data.user'])

.controller("PlayerProfileController", ["$scope", "user", "UserService", function ($scope, user, UserService) {
	$scope.user = angular.extend({},user.data);

	$scope.forms = {};

	$scope.save = function (){
		UserService.save($scope.user).then(function(){

		}).catch(function(err){

		});
	};
}]);
