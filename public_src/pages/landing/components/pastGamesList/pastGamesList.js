"use strict";
angular.module('associations.pages.landing.components.pastGamesList', [
	'associations.components.data.game'
])
	.controller("PastGamesListCtrl", ["$scope", "GameService", "$location", function($scope, GameService, $location){
		var self = this;
		GameService.getGames(false,5,0).then(function(response){
			self.games = response.data;
		});

		this.gotoGame = function(game){
			$location.path("/game/"+game.id);
		};

	}]);
