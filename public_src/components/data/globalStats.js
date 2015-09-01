"use strict";

angular.module('associations.components.data.globalStats', [])
	.factory('GlobalStatsService', ['$http', function($http){
		return {
			common: function(){
				var url = "/rpc/globalStats/common";
				return $http({
					method: 'GET',
					url: url,
					cache: true
				});
			},
			pos: function(){
				var url = "/rpc/globalStats/pos";
				return $http({
					method: 'GET',
					url: url,
					cache: true
				});
			},
			to: function(limit){
				var url = "/rpc/globalStats/to";
				if (limit){
					url += "?limit=" + limit;
				}
				return $http({
					method: 'GET',
					url: url,
					cache: true
				});
			}
		};
	}]);
