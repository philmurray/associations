"use strict";
angular.module('associations.pages.landing.components.exploreLink', [
	'associations.components.data.globalStats',
	'associations.components.cloud'
])
	.controller("ExploreLinkCtrl", ["$scope", "GlobalStatsService", function($scope,GlobalStatsService){
		var self = this;
		GlobalStatsService.to(50).then(function(response){
			self.cloudData = response.data;
		});
	}]);
