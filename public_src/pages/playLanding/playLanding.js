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

	$scope.getStatusText = function(game){
		switch(game.status){
			case 1:
				var winners = game.players.filter(function(player){return player.winner;});
				if (winners.length === 1){
					if (winners[0].id === user.id) return "You Won!";
					else return winners[0].alias + " Won!";
				} else {
					return "Tie!";
				}
				return "Completed.";
			case 2: return "Waiting...";
			case 3: return "You're up!";
		}
	};
}]);
