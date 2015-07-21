"use strict";

angular.module('associations.pages.game.components.finishModal', [
	'associations.components.levelProgress',
	'associations.components.normal'
])
.controller("FinishModalController", ["$scope", "$modalInstance", "showInstructions", "levelProgress", "$timeout", "$interval", "player", "game", function($scope, $modalInstance, showInstructions,levelProgress, $timeout, $interval, player, game) {

	$scope.close = $modalInstance.close;
	$scope.show = {
		instruction: showInstructions,
		multi: game.players.length > 1
	};

	$scope.level = levelProgress.previous;
	$scope.score = 0;
	$scope.normal = 1;
	$scope.color = player.color.hex;
	$scope.step = 0;

	if ($scope.show.multi){
		$scope.players = game.players.map(function (player){
			if (!player.completed) $scope.show.multi = false;
			if (player.winner) $scope.winnerScore = player.score;
			return {
				id: player.id,
				score: 0,
				gameScore: player.score,
				alias: player.alias,
				color: player.color,
				winner: player.winner
			};
		});
	}

	$scope.$watch('show', function(val){
		if (!$scope.show.instructions) {
			if ($scope.show.multi) {
				$timeout(function(){
					var incr = $scope.winnerScore/200;
					$interval(function(){
						var finished = true;
						$scope.players.forEach(function(player){
							if (player.score < player.gameScore){
								player.score += incr;
								if (player.score > player.gameScore) {
									player.score = player.gameScore;
								}
							}
						});
					}, 10, 200).then(function(){
						$scope.players.forEach(function(player){
							player.score = player.gameScore;
						});
						$scope.show.winner = true;
					});

				},750);
			} else {
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
				},2750);

				$timeout(function(){
					$scope.step++;
					$scope.level = levelProgress.current;
				},4750);
			}
		}
	}, true);
}]);
