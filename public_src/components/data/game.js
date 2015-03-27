"use strict";

angular.module('associations.components.data.game', [])
	.factory('GameService', ['$http', function($http){
		return {
			createGame: function(players){
				var url = "/rpc/game";
				return $http({
					method: 'POST',
					url: url,
					data: {players:players}
				});
			},
			get: function(gameId){
				var url = "/rpc/game/" + gameId;
				return $http({
					method: 'GET',
					url: url
				});
			},
			startGame: function(gameId){
				var url = "/rpc/game/" + gameId + "/start";
				return $http({
					method: 'POST',
					url: url
				});
			},
			stopGame: function(gameId){
				var url = "/rpc/game/" + gameId + "/stop";
				return $http({
					method: 'POST',
					url: url
				});
			},
			getCurrentWord: function(gameId){
				var url = "/rpc/game/" + gameId + "/current";
				return $http({
					method: 'GET',
					url: url
				});
			}
		};
	}]);
