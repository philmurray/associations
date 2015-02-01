"use strict";

angular.module('associations.components.selectWord', [
	"ui.select",
	"ngSanitize",
	"associations.components.data.word"
])
.directive('selectWord', ["WordService", function (WordService) {
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
				WordService.search(searchTerm).then(function(res){
					$scope.wordOptions = res.data || [];
				});
			};
		}
	};
}]);
