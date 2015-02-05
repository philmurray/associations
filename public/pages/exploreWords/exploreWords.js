"use strict";

angular.module('associations.pages.exploreWords',[
	"associations.components.selectWord",
	"associations.components.diagram",
	"associations.components.data.word"
	])

.controller("ExploreWordsController", ["$scope", "$location", "WordService", "$log", function ($scope, $location, WordService, $log) {
	var searchWord = {
		initial: {
			x: 0,
			y: 0
		},
		fixed: true
	};
	$scope.model = {nodes:{searchWord:searchWord}, links:[]};
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

					delete $scope.model.nodes[word];
					$scope.model.nodes.searchWord = searchWord;

					for (var i = 0, l = $scope.model.links.length; i<l; i++){
						var link = $scope.model.links[i];
						if (link.source.id === word) link.source.id = "searchWord";
						if (link.target.id === word) link.target.id = "searchWord";
					}
				})
				.error($log);
		}
	});
}]);
