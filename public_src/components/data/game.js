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
			}
		};
	}]);
