"use strict";

angular.module('associations.components.wordEntry', [
	"associations.components.data.word",
	"ui.bootstrap"
])
.config(['$tooltipProvider', function($tooltipProvider){
	$tooltipProvider.setTriggers({'showPopover': 'hidePopover'});
}])
.directive('wordEntry', ["WordService", "$timeout", function (WordService, $timeout) {
	return {
		restrict: 'E',
		scope: {
			selected:'=',
			placeholderText:'='
		},
		replace: true,
		templateUrl: 'components/wordEntry/wordEntry.html',
		link: function($scope, $element, attrs) {
			$scope.popover = {};

			$scope.selectWord = function(word){
				$scope.selected.word = word;

				$timeout(function(){
					$element.triggerHandler('hidePopover');
				});
			};

			$scope.keypress = function(e){
				$timeout(function(){
					$element.triggerHandler('hidePopover');
				});
				if (e.which === 13){
					WordService.check($scope.current).then(function(response){
						if (response.data && response.data.length){
							if (response.data.length === 1 && response.data[0] === $scope.current.toLowerCase()){
								$scope.selected.word = response.data[0];
								return;
							} else {
								$scope.popover.words = response.data;
								$scope.popover.template = "components/wordEntry/suggest.html";
							}
						} else {
							$scope.popover.template = "components/wordEntry/nowords.html";
						}
						$timeout(function(){
							$element.triggerHandler('showPopover');
						});
					});
				}
			};

			$scope.$watch("selected.word", function(){
				$scope.current = $scope.selected.word;
			});
		}
	};
}]);
