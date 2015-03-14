"use strict";

angular.module('associations.pages.playMulti',[
	'associations.components.data.user'
])

.controller("PlayMultiController", ["$scope", "user", "color", "UserService", "$q", function ($scope, user, color, UserService, $q) {
	$scope.color = color;

	$scope.foundPlayers = [];
	$scope.recentPlayers = [];

	$scope.selectedPlayers = {};
	$scope.searchPlayers = "";

	$scope.$watch("searchPlayers", function(){
		var defer;
		if ($scope.searchPlayers){
			defer = UserService.search($scope.searchPlayers).then(function(response){
				$scope.foundPlayers = response.data.filter(function(player){return !$scope.selectedPlayers[player.id];});
			});
		} else {
			$scope.foundPlayers = [];
			defer = $q.when();
		}
		defer.then(function(){
			angular.forEach($scope.selectedPlayers, function(player){
				if ($scope.recentPlayers.indexOf(player) === -1){
					$scope.foundPlayers.unshift(player);
				}
			});
		});
	});

	$scope.togglePlayer = function(player) {
		if ($scope.selectedPlayers[player.id]){
			delete $scope.selectedPlayers[player.id];
		} else {
			$scope.selectedPlayers[player.id] = player;
		}
	};

	$scope.playerSelected = function(player) {
		return $scope.selectedPlayers[player.id];
	};

	$scope.hasPlayers = function() {
		return Object.keys($scope.selectedPlayers).length;
	};

	$scope.startGame = function() {

	};

}]);
