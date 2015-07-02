"use strict";

angular.module('associations.pages.game.components.finishModal', [
	'associations.components.levelProgress'
])

.controller("FinishModalController", ["$scope", "$modalInstance", "showInstructions", "levelProgress", "$timeout", function($scope, $modalInstance, showInstructions,levelProgress, $timeout) {
	$scope.close = $modalInstance.close;
	$scope.instructions = {
		shown: showInstructions
	};

	$scope.level = levelProgress.previous;
	$scope.$watch('instructions.shown', function(val){
		if (!val) {
			$timeout(function(){
				$scope.level = levelProgress.current;
			},750);
		}
	});

	var titles = [
		"All Done!",
		"Good Job!",
		"Whew!",
		"Nicely done.",
		"Human after all",
		"Close your mind now"
	];
	$scope.title = titles[Math.floor(Math.random()*titles.length)];
}]);
