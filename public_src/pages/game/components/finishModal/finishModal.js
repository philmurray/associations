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
	$scope.normal = 1;
	$scope.color = player.color.hex;
	$scope.step = 0;

	$scope.$watch('instructions.shown', function(val){
		if (!val) {
			$timeout(function(){
				$scope.step++;
				var incr = player.score/100;
				$interval(function(){
					$scope.score += incr;
				}, 10, 100).then(function(){
					$scope.score = player.score;
				});
			},750);

			$timeout(function(){
				$scope.step++;
				$scope.normal = player.normal;
			},2000);

			$timeout(function(){
				$scope.step++;
				$scope.level = levelProgress.current;
			},3250);
		}
	});
}]);
