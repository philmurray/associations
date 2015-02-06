"use strict";

angular.module('associations.pages.exploreWords',[
	"associations.components.selectWord",
	"associations.components.diagram",
	"associations.components.data.word",
	"associations.pages.exploreWords.components.graph"
	])

.controller("ExploreWordsController", ["$scope", "$location", "WordService", "$log", function ($scope, $location, WordService, $log) {
	var searchWord = {
		initial: {
			x: 0,
			y: 0
		},
		fixed: true
	};
	$scope.model = {nodes:{}, links:{}};
	$scope.diagramConfig = {};

	$scope.selected = {
		word:$location.search().word || ""
	};
	$scope.$watch("selected.word", function(word){
		if (word){
			$location.search("word", word).replace();
			WordService.getGraph(word)
				.success(function(data){
					$scope.model = data;
					$scope.model.word = word;
				})
				.error($log);
		}
	});
}]);
