"use strict";

angular.module('associations.components.selectWord', [
	"ui.select",
	"ngSanitize",
	"associations.components.data.word"
])
.directive('selectWord', ["WordService", "$log", function (WordService, $log) {
	return {
		restrict: 'EA',
		scope: {
			selected:'='
		},
		templateUrl: "components/selectWord/selectWord.html",
		link: function($scope, $element, attrs) {
			$scope.selected = $scope.selected || {word:""};

			var allOptions = [];
			$scope.wordOptions = [];

			$scope.filterWords = function(query) {
				var arr = [];
				for (var i = 0, l = allOptions.length; i<l; i++){
					if (allOptions[i].substr(0, query.length).toUpperCase() == query.toUpperCase()) {
						arr.push(allOptions[i]);
					}
					if (arr.length >= 10) break;
				}
				return arr.sort();
			};

			$scope.refreshWords = function(searchTerm){
				if (searchTerm) {
					var words = $scope.filterWords(searchTerm);
					if (words.length < 10) {
						WordService.search(searchTerm)
							.then(function(response){
								allOptions = response.data || [];
								$scope.wordOptions = $scope.filterWords(searchTerm);
							})
							.catch($log);
					} else {
						$scope.wordOptions = words;
					}
				} else {
					$scope.wordOptions = [];
				}
			};
		}
	};
}]);
