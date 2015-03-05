"use strict";

angular.module('associations.pages.playerProfile',[
	'directives.inputMatch',
	'associations.components.data.user',
	'associations.components.data.color'])

.controller("PlayerProfileController", ["$scope", "user", "UserService", "ColorService", "$log", function ($scope, user, UserService, ColorService, $log) {
	$scope.user = angular.extend({},user.data);

	$scope.forms = {};
	$scope.activePage = "Profile";

	ColorService.getColorList().then(function(response){
		$scope.colors = response.data;
	}).catch($log);

	$scope.save = function (){
		UserService.save($scope.user).then(function(){
			$scope.addAlert({type: "success", msg: "Player profile saved!"});
		}).catch(function(err){
			$scope.addAlert({type: "danger", msg: "Player profile could not be saved!"});
		});
	};
}]);
