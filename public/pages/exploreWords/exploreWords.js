"use strict";

angular.module('associations.pages.exploreWords',[
	"ui.select",
	"ngSanitize",
	"associations.components.data.word",
	"associations.components.diagram"
	])

.controller("ExploreWordsController", ["$scope", "WordService", function ($scope, WordService) {
	var word = {
		id: "word",
		initial: {
			x: 0,
			y: 0
		},
		fixed: true
	};
	$scope.model = {nodes:[word], links:[]};

	$scope.config = {};

	$scope.selectedWord = "";

	$scope.wordOptions = [];
	$scope.refreshWords = function(searchTerm){
		WordService.search(searchTerm).then(function(res){
			$scope.wordOptions = res.data || [];
		});
	};

	$scope.$watch("selectedWord", function(word){

	});
}]);
