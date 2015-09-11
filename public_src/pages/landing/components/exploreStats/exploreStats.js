"use strict";
angular.module('associations.pages.landing.components.exploreStats', [
	'associations.components.data.globalStats',
	'associations.components.piechart',
	'associations.components.barchart'
])
	.controller("ExploreStatsCtrl", ["$scope", "GlobalStatsService", function($scope,GlobalStatsService){
		var self = this;
		self.posData = [];
		self.posConfig = {
			"size": {
				"pieOuterRadius": "75%",
				"canvasHeight": 400
			}
		};

		self.commonData = [];
		self.commonConfig = {
			height: 400
		};

		GlobalStatsService.pos().then(function(response){
			self.posData = response.data.map(function(c){
				return {
					key: c.category,
					value: parseFloat(c.count, 10)
				};
			});
		});
		GlobalStatsService.common().then(function(response){
			self.commonData = response.data.map(function(c){
				return {
					key: c.category,
					value: parseFloat(c.count, 10)
				};
			});
		});
	}]);
