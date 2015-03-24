"use strict";

angular.module('associations.pages.game', [
	'associations.components.data.game',
	'ui.bootstrap',
	'associations.pages.game.components.startModal'
])

.controller("GameController", ["$scope", "color", "game", "$modal", "GameService", function($scope, color, game, $modal, GameService) {
	$scope.color = color;
	$scope.game = game;

	if ($scope.game.player){
		if (!$scope.game.player.completed){
			$scope.playing = true;
			if (!$scope.game.player.startTime){
				$modal.open({
					templateUrl: "pages/game/components/startModal/startModal.html",
					controller: "StartModalController",
					size: "sm",
					backdrop: "static",
					resolve: {
						color: function(){ return color;}
					}
				}).result.then(function(){
					return GameService.startGame($scope.game.id);
				}).then(function(response){
					$scope.currentWord = response.data;
					//start timer
				}).catch(function(){
					$scope.addAlert({type: "danger", msg: "Game could not be started"});
				});
			} else {
				// pass current word and get the next one
			}
		}
	}

	$scope.getStatus = function(player){
		if (!player.completed) return "Waiting...";
		//else get their score, etc.
	};
}]);
