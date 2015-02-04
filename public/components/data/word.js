"use strict";

angular.module('associations.components.data.word', [])
	.factory('WordService', ['$http', function($http){
		return {
			search: function(searchTerm){
				var url = "/rpc/word" + (searchTerm ? "?text=" + searchTerm : "");
				return $http({
					method: 'GET',
					url: url,
					cache: true
				});
			},
			getGraph: function(word){
				var url = "/rpc/wordGraph/" + word;
				return $http({
					method: 'GET',
					url: url,
					cache: true
				});
			}
		};
	}]);
