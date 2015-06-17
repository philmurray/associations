"use strict";
angular.module('associations.pages.landing.components.pastGamesList', [
	'associations.components.data.game'
])
	.controller("PastGamesListCtrl", ["$scope", "GameService", "$location", function($scope, GameService, $location){
		var self = this,
			pageLength = 5;

		self.games = [];

		this.loadMore = function(clear){
			return GameService.getGames(false,pageLength,self.page,self.multi).then(function(response){
				self.page++;
				if (response.data && response.data.length){
					if (clear){
						self.games = response.data;
						self.hasMore = true;
					} else {
						self.games.push.apply(self.games, response.data);
					}
				} else {
					self.games = [];
				}
				if (!response.data || response.data.length < pageLength) {
					self.hasMore = false;
				}
			});
		};

		this.gotoGame = function(game){
			$location.path("/game/"+game.id);
		};

		this.setMode = function(multi){
			self.page = 0;
			self.multi = multi;

			return this.loadMore(true);
		};

		this.setMode(true).then(function(){
			if (!self.hasMore){
				this.setMode(true);
			}
		});
	}]);
