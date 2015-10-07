"use strict";

angular.module('associations.pages.landing.components.links.components.selectPlayer',[
	'associations.components.data.user'
])

.controller("SelectPlayerCtrl", ["$scope", "UserService", "$q", "recentPlayers", "$modalInstance", function ($scope, UserService, $q, recentPlayers, $modalInstance) {
	$scope.foundPlayers = recentPlayers;

	$scope.selectedPlayers = {};
	$scope.searchPlayers = "";

	$scope.$watch("searchPlayers", function(){
		if ($scope.searchPlayers){
			UserService.search($scope.searchPlayers).then(function(response){
				$scope.foundPlayers = response.data.filter(function(player){return !$scope.selectedPlayers[player.id];});
				angular.forEach($scope.selectedPlayers, function(player){
					$scope.foundPlayers.unshift(player);
				});
			});
		} else {
			$scope.foundPlayers = [];
			angular.forEach($scope.selectedPlayers, function(player){
				$scope.foundPlayers.push(player);
			});
			angular.forEach(recentPlayers, function(player){
				if (!$scope.selectedPlayers[player.id]) {
					$scope.foundPlayers.push(player);
				}
			});
		}
	});

	$scope.togglePlayer = function(player) {
		if ($scope.selectedPlayers[player.id]){
			delete $scope.selectedPlayers[player.id];
		} else if (!$scope.full()) {
			$scope.selectedPlayers[player.id] = player;
		}
	};

	$scope.playerSelected = function(player) {
		return $scope.selectedPlayers[player.id];
	};

	$scope.hasPlayers = function() {
		return Object.keys($scope.selectedPlayers).length;
	};

	$scope.full = function () {
		return Object.keys($scope.selectedPlayers).length >= 4;
	};

	$scope.startGame = function() {
		$modalInstance.close(Object.keys($scope.selectedPlayers));
	};

}]);
