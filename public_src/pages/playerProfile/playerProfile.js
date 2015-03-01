"use strict";

angular.module('associations.pages.playerProfile',[
	'directives.inputMatch',
	'associations.components.data.user'])

.controller("PlayerProfileController", ["$scope", "user", "UserService", function ($scope, user, UserService) {
	$scope.user = angular.extend({},user.data);

	$scope.forms = {};
	$scope.activePage = "Profile";

	$scope.save = function (){
		UserService.save($scope.user).then(function(){
			$scope.addAlert({type: "success", msg: "Player profile saved!"});
		}).catch(function(err){
			$scope.addAlert({type: "danger", msg: "Player profile could not be saved!"});
		});
	};
}]);
