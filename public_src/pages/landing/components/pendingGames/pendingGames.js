"use strict";
angular.module('associations.pages.landing.components.pendingGames', [
	'associations.components.data.game'
])
	.controller("PendingGamesCtrl", ["$scope", "GameService", "$location", function($scope, GameService, $location){
		var self = this;
		GameService.getGames(true,25,0,true).then(function(response){
			self.games = response.data;
		});

		this.gotoGame = function(game){
			$location.path("/game/"+game.id);
		};

		this.declineGame = function(game){
			GameService.declineGame(game.id)
				.then(function(response){
					var i = self.games.indexOf(game);
					if (i !== -1){
						self.games.splice(i,1);
					}
				})
				.catch(function(err){
					$scope.addAlert({type: "danger", msg: "Game could not be declined"});
				});
		};

	}]);
