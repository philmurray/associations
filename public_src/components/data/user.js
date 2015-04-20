"use strict";

angular.module('associations.components.data.user', [])
	.factory('UserService', ['$http', '$q', function($http, $q){
		return {
			get: function(){
				return $http({
					method: 'GET',
					url: '/rpc/user'
				});
			},
			save: function(user){
				return $http({
					method: 'POST',
					url: '/rpc/user',
					data: user
				});
			},
			search: function(searchTerm){
				var url = "/rpc/users" + (searchTerm ? "?search=" + searchTerm : "");
				return $http({
					method: 'GET',
					url: url,
					cache: true
				});
			},
			recentPlayers: function(){
				var url = "/rpc/recentUsers";
				return $http({
					method: 'GET',
					url: url
				});
			}
		};
	}]);
