"use strict";
angular.module('associations.pages.landing.components.pastGamesList', [
	'associations.components.data.game',
	'associations.components.normal',
	'associations.components.locked',
	'associations.components.piechart'
])
	.controller("PastGamesListCtrl", ["$scope", "GameService", "$location", "NormalConverter", function($scope, GameService, $location, NormalConverter){
		var self = this,
			pageLength = 5;

		self.games = [];
		self.pieOptions = {
			size: {
				canvasHeight: 200
			}
		};

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

		this.gotoGame = function(game_id){
			$location.path("/game/"+game_id);
		};

		this.setMode = function(multi){
			self.page = 0;
			self.multi = multi;

			return this.loadMore(true);
		};

		this.showPie = function(stats){
			return stats.multigames > 3;
		};
		this.getPieData = function(stats){
			if (!this.pieData){
				this.pieData = [];

				if (stats.wongames > 0){
					this.pieData.push({
						key: "Won",
						value: stats.wongames,
						color: d3.rgb($scope.color.hex)
					});
				}
				var lostgames = stats.multigames-stats.wongames;
				if (lostgames > 0) {
					this.pieData.push({
						key: "Lost",
						value: lostgames,
						color: d3.rgb($scope.color.hex).darker(3)
					});
				}
			}
			return this.pieData;
		};

		this.setMode(true).then(function(){
			if (!self.games.length){
				self.setMode(false);
			}
		});
	}]);
