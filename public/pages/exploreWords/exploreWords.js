"use strict";

angular.module('associations.pages.exploreWords',[
	"associations.components.selectWord",
	"associations.components.diagram"
	])

.controller("ExploreWordsController", ["$scope", "$location", function ($scope, $location) {
	var word = {
		id: "word",
		initial: {
			x: 0,
			y: 0
		},
		fixed: true
	};
	$scope.model = {nodes:[word], links:[]};
	$scope.diagramConfig = {};

	$scope.selected = {
		word:$location.search().word || ""
	};
	$scope.$watch("selected.word", function(word){
		$location.search("word", word).replace();
		// run webservice call to get words
	});
}]);
