"use strict";
angular.module('associations.pages.landing.components.pastGamesList', [
	'associations.components.data.game',
	'associations.components.normal',
	'associations.components.locked'
])
	.controller("PastGamesListCtrl", ["$scope", "GameService", "$location", "NormalConverter", function($scope, GameService, $location, NormalConverter){
		var self = this,
			pageLength = 5;

		self.games = [];

		this.getNormal = function (player){
			return NormalConverter.toClass(player.normal);
		};

		this.loadMore = function(clear){
			return GameService.getGames(false,pageLength,self.page,self.multi).then(function(response){
				self.page++;
				if (clear){
					self.games = [];
					self.hasMore = true;
				}

				if (response.data && response.data.length){
					self.games.push.apply(self.games, response.data);
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

		GameService.getHighScore().then(function(response){
			self.highScoreGame = response.data;
		});

		GameService.getMostPicks().then(function(response){
			self.mostPicksGame = response.data;
		});

		this.setMode(true).then(function(){
			if (!self.games.length){
				self.setMode(false);
			}
		});
	}]);
