"use strict";

angular.module('associations.pages.playLanding',['associations.components.data.game'])

.controller("PlayLandingController", ["$scope", "authenticated", "GameService", "$location", function ($scope, authenticated, GameService, $location) {
	$scope.color = authenticated.color;

	$scope.rematch = function(game, event){
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

	};

	$scope.formatPlayerNames = function(players){
		return players.map(function(player){return player.alias;}).join(', ');
	};

	$scope.singleGames = [
	];

	$scope.multiGames = [
	];
}]);
