"use strict";

angular.module('associations.pages.playLanding',['associations.components.data.game'])

.controller("PlayLandingController", ["$scope", "GameService", "$location", "games", function ($scope, GameService, $location, games) {
	$scope.footer.visible = true;
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
}]);
