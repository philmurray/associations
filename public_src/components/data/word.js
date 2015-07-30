"use strict";

angular.module('associations.components.data.word', [])
	.factory('WordService', ['$http', function($http){
		return {
			check: function(searchTerm){
				var url = "/rpc/word/" + searchTerm;
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
			},
			getPath: function(from, to){
				var url = "/rpc/wordPath/" + from + "/" + to;
				return $http({
					method: 'GET',
					url: url,
					cache: true
				});
			}
		};
	}]);
