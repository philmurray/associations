"use strict";

angular.module('associations.pages.game.components.finishModal', [
	'associations.components.levelProgress',
	'associations.components.normal'
])

.controller("FinishModalController", ["$scope", "$modalInstance", "showInstructions", "levelProgress", "$timeout", "$interval", "player", function($scope, $modalInstance, showInstructions,levelProgress, $timeout, $interval, player) {
	$scope.close = $modalInstance.close;
	$scope.instructions = {
		shown: showInstructions
	};

	$scope.level = levelProgress.previous;
	$scope.score = 0;
	$scope.normal = 0;
	$scope.color = player.color.hex;

	$scope.$watch('instructions.shown', function(val){
		if (!val) {
			$timeout(function(){
				$interval(function(){
					$scope.score += 10;
				}, 10, Math.floor(player.score/10)).then(function(){
					$scope.score = player.score;
				});
			},750);

			$timeout(function(){
				$scope.normal = player.normal;
			},1500);

			$timeout(function(){
				$scope.level = levelProgress.current;
			},2250);
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
