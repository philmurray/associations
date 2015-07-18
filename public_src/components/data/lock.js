"use strict";

angular.module('associations.components.data.lock', [])
	.factory('LockService', ['$http', function($http){
		return {
			get: function(data){
				var url = "/rpc/lock/" + data;
				return $http({
					method: 'GET',
					url: url
				});
			}
		};
	}]);
