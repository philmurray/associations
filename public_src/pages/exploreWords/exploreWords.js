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

	$scope.loading = false;
	$scope.selectedWord = {
		word:$location.search().word || "",
		placeholderText:"Enter a Word"
	};
	$scope.selectedOtherWord = {
		word:$location.search().otherWord || "",
		placeholderText:"'To' word"
	};
	$scope.mode = $scope.selectedWord.word && $scope.selectedOtherWord.word ? 2 : 1;


	$scope.$watch("mode", function(n,o){
		$scope.selectedWord.placeholderText = (n === 1) ? "Enter a Word" : "'From' word";
		if (n !== o){
			$scope.noData = false;
			$scope.model = {nodes:{}, links:{}};
			if (n === 1) {
				$scope.selectedWord.word = "";
				$scope.selectedOtherWord.word = "";
			}
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
			$scope.loading = true;
			$scope.noData = false;
			WordService.getPath(word, otherWord)
				.success(function(data){
					$scope.loading = false;
					$scope.model = data;
					$scope.noData = !(Object.keys($scope.model.nodes).length);
					angular.forEach($scope.model.nodes, function(val,key){
						if (val === word) $scope.model.word = key;
						else if (val === otherWord) $scope.model.otherWord = key;
					});
				})
				.error($log);
		}
	};
	$scope.getGraph = function(){
		var word = $scope.selectedWord.word;
		$scope.loading = true;
		$scope.noData = false;
		WordService.getGraph(word)
			.success(function(data){
				$scope.loading = false;
				$scope.model = data;
				$scope.noData = !(Object.keys($scope.model.nodes).length);
				angular.forEach($scope.model.nodes, function(val,key){
					if (val === word) $scope.model.word = key;
				});
			})
			.error($log);
	};
	$scope.onGraphClick = function(word){
		if ($scope.mode === 1) {
			$scope.selectedWord.word = word;
		} else {
			$scope.selectedOtherWord.word = word;
		}

		$scope.$digest();
	};
}]);