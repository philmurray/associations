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

			$scope.wordOptions = [];
			$scope.refreshWords = function(searchTerm){
				WordService.search(searchTerm)
					.then(function(response){
						$scope.wordOptions = response.data || [];
					})
					.catch($log);
			};
		}
	};
}]);
