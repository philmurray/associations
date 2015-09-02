"use strict";
angular.module('associations.pages.landing.components.exploreLink', [
	'associations.components.data.globalStats',
	'associations.components.cloud'
])
	.controller("ExploreLinkCtrl", ["$scope", "GlobalStatsService", "$location", function($scope,GlobalStatsService,$location){
		var self = this;
		GlobalStatsService.to(75).then(function(response){
			self.cloudData = response.data;
		});

		self.wordClick = function(word) {
			$scope.$apply(function(){
				$location.path("/exploreWords");
				$location.search('word', word);
			});
		};
	}]);
