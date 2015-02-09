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

	$scope.selectedWord = {
		word:$location.search().word || ""
	};
	$scope.selectedOtherWord = {
		word:$location.search().otherWord || ""
	};
	$scope.mode = $scope.selectedWord.word && $scope.selectedOtherWord.word ? 2 : 1;


	$scope.$watch("mode", function(n,o){
		if (n !== o){
			$scope.selectedWord.word = "";
			$scope.selectedOtherWord.word = "";
			$scope.model = {nodes:{}, links:{}};
		}
	});
	$scope.$watch("selectedWord.word", function(word){
		$location.search("word", word).replace();
		if (word){
			if ($scope.mode === 1){
				$scope.getGraph();
			} else {
				$scope.getPaths();
			}
		}
	});
	$scope.$watch("selectedOtherWord.word", function(word){
		$location.search("otherWord", word).replace();
		if (word){
			$scope.getPaths();
		}
	});
	$scope.getPaths = function(){
		var word = $scope.selectedWord.word,
			otherWord = $scope.selectedOtherWord.word;
		if (word && otherWord){

		}
	};
	$scope.getGraph = function(){
		var word = $scope.selectedWord.word;
		WordService.getGraph(word)
			.success(function(data){
				$scope.model = data;
				$scope.model.word = word;
			})
			.error($log);
	};
	$scope.onGraphClick = function(word){
		$scope.selectedWord.word = word;
		$scope.$digest();
	};
}]);
