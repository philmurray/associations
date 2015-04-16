"use strict";

angular.module('associations.pages.playLanding',['associations.components.data.game'])

.controller("PlayLandingController", ["$scope", "user", "GameService", "$location", "games", function ($scope, user, GameService, $location, games) {
	$scope.color = user.color;
	$scope.games = games;

	$scope.rematch = function(game, event){
		GameService.createGame(game.players.map(function(player){return player.id;}))
			.then(function(response){
				$location.path("/game/"+response.data.id);
			})
			.catch(function(err){
				$scope.addAlert({type: "danger", msg: "Game could not be created"});
			});
		event.cancelBubble = true;
	};

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

	$scope.sortGames = function(game){
		return new Date(game.time) * game.status;
	};

	$scope.getViewButtonText = function(game){
		for (var i = 0, l = game.players.length; i<l; i++){
			if (game.players[i].id === user.id){
				return game.players[i].completed ? "View": "Play!";
			}
		}
		return "View";
	};
}]);
