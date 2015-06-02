"use strict";

angular.module('associations.pages.playLanding',['associations.components.data.game'])

.controller("PlayLandingController", ["$scope", "GameService", "$location", "games", function ($scope, GameService, $location, games) {
	$scope.footer.visible = true;
	$scope.games = games;

	$scope.startSingleGame = function(){
		GameService.createGame()
			.then(function(response){
				$location.path("/game/"+response.data.id);
			})
			.catch(function(err){
				$scope.addAlert({type: "danger", msg: "Game could not be created"});
			});
	};

	$scope.gotoGame = function(game){
		$location.path("/game/"+game.id);
	};

	$scope.declineGame = function(game){
		GameService.declineGame(game.id)
			.then(function(response){
				var i = $scope.games.multiGames.indexOf(game);
				if (i !== -1){
					$scope.games.multiGames.splice(i,1);
				} else {
					i = $scope.games.singleGames.indexOf(game);
					if (i !== -1){
						$scope.games.singleGames.splice(i,1);
					}
				}
			})
			.catch(function(err){
				$scope.addAlert({type: "danger", msg: "Game could not be declined"});
			});
	};

	$scope.sortGames = function(game){
		return new Date(game.time) * game.status;
	};
}]);
