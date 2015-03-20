"use strict";

angular.module('associations.pages.playLanding',['associations.components.data.game'])

.controller("PlayLandingController", ["$scope", "user", "color", "GameService", "$location", function ($scope, user, color, GameService, $location) {
	$scope.color = color;

	$scope.rematch = function(game, event){
		event.cancelBubble = true;
	};

	$scope.startSingleGame = function(){
		GameService.createGame()
			.then(function(response){
				$location.path("/games/"+response.data.id);
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
