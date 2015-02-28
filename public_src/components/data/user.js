"use strict";

angular.module('associations.components.data.user', [])
	.factory('UserService', ['$http', '$q', function($http, $q){
		return {
			get: function(){
				return $http({
					method: 'GET',
					url: '/rpc/user',
					cache: true
				});
			},
			save: function(user){
				return $http({
					method: 'POST',
					url: '/rpc/user',
					data: user
				});
			}
		};
	}]);
