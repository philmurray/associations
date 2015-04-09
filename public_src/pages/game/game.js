"use strict";

angular.module('associations.pages.game', [
	'associations.components.data.game',
	'ui.bootstrap',
	'associations.pages.game.components.startModal',
	'associations.pages.game.components.pickGraph'
])

.controller("GameController", ["$scope", "color", "game", "$modal", "GameService", "$interval", function($scope, color, game, $modal, GameService, $interval) {
	$scope.color = color;
	$scope.game = game;
	$scope.player = $scope.game.players[$scope.game.player];

	$scope.chosenWord = {
		word: "",
		placeholderText:"What do you think?"
	};

	$scope.$watch("playing.word", function(){
		$scope.wordStart = new Date();
	});
	$scope.$watch("chosenWord.word", function(word){
		if (word && $scope.playing){
			var wordData = {word: word, timeTaken: new Date() - $scope.wordStart};
			GameService.submitWord($scope.game.id, wordData).then(function(response){
				$scope.chosenWord.word = "";
				$scope.player.picks.push(response.data.word);
				$scope.playing = response.data.game;
			}).catch(function(){
				$scope.addAlert({type: "danger", msg: "Word could not be submitted."});
			});
		}
	});

	$scope.continueGame = function(){
		$scope.playing = true;

		$scope.timeLeft = 30 - Math.floor((new Date() - new Date($scope.player.startTime))/1000);

		if ($scope.timeLeft < 0) $scope.stopGame();

		GameService.resumeGame($scope.game.id).then(function(response){
			$scope.playing = response.data;
			$interval(function(){$scope.timeLeft--;},1000,$scope.timeLeft)
				.then($scope.stopGame);
		}).catch(function(){
			$scope.addAlert({type: "danger", msg: "Game could not be continued"});
		});
	};

	$scope.startGame = function(){
		$scope.playing = true;

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
			$scope.playing = response.data;
			$scope.timeLeft = 30;
			$interval(function(){$scope.timeLeft--;},1000,$scope.timeLeft)
				.then($scope.stopGame);
		}).catch(function(){
			$scope.addAlert({type: "danger", msg: "Game could not be started"});
		});
	};

	$scope.activatePlayer = function(player){
		$scope.game.players.forEach(function(p){
			p.active = (player === p);
		});

	};

	$scope.stopGame = function(){
		GameService.stopGame($scope.game.id).then(function(response){
			$scope.playing = false;
			$scope.game = response.data;
			$scope.player = $scope.game.players[$scope.game.player];
			$scope.activatePlayer($scope.player);
		});
	};

	$scope.getStatus = function(player){
		if ($scope.playing){
			if (player === $scope.player){
				return $scope.playing.score;
			}
			return "...";
		}
		if (!player.completed) return "Waiting...";
		return player.score;
	};

	if ($scope.player !== undefined){
		$scope.activatePlayer($scope.player);
		if (!$scope.player.completed){
			if (!$scope.player.startTime){
				$scope.startGame();
			} else {
				$scope.continueGame();
			}
		}
	} else {
		$scope.activatePlayer($scope.game.players[0]);
	}
}]);
