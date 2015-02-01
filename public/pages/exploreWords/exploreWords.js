"use strict";

angular.module('associations.pages.exploreWords',[
	"associations.components.selectWord",
	"associations.components.diagram"
	])

.controller("ExploreWordsController", ["$scope", function ($scope) {
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
		word:""
	};
	$scope.$watch("selected.word", function(word){
		console.log(word);
	});
}]);
