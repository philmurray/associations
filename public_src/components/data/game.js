"use strict";

angular.module('associations.components.data.game', [])
	.factory('GameService', ['$http', function($http){
		return {
			getGames: function(pending, pageSize, page, multi){
				var url = "/rpc/games?pageSize=" + pageSize + "&page=" + page;
				if (pending) {
					url += "&pending=" + pending;
				}
				if (multi) {
					url += "&multi=" + multi;
				}
				return $http({
					method: 'GET',
					url: url
				});
			},
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
			declineGame: function(gameId){
				var url = "/rpc/game/" + gameId + "/decline";
				return $http({
					method: 'POST',
					url: url
				});
			},
			resumeGame: function(gameId){
				var url = "/rpc/game/" + gameId + "/resume";
				return $http({
					method: 'GET',
					url: url
				});
			},
			submitWord: function(gameId, wordData){
				var url = "/rpc/game/" + gameId + "/submitWord";
				return $http({
					method: 'POST',
					url: url,
					data: wordData
				});
			},
			submitChat: function(gameId, chat){
				var url = "/rpc/game/" + gameId + "/chat";
				return $http({
					method: 'PUT',
					url: url,
					data: {word: chat}
				});
			},
			getChats: function(gameId) {
				var url = "/rpc/game/" + gameId + "/chats";
				return $http({
					method: 'GET',
					url: url
				});
			}
		};
	}]);
