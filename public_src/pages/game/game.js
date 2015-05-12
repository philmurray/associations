"use strict";

angular.module('associations.pages.game', [
	'associations.components.data.game',
	'ui.bootstrap',
	'associations.pages.game.components.startModal',
	'associations.pages.game.components.graph',
	'associations.components.focus-input'
])

.controller("GameController", ["$scope", "game", "$modal", "GameService", "$interval", function($scope, game, $modal, GameService, $interval) {
	$scope.footer.visible = false;
	$scope.game = game;
	$scope.player = $scope.game.players[$scope.game.player];
	$scope.graphConfig = {};
	$scope.chosenWord = {
		word: "",
		placeholderText:"What do you think?"
	};
	$scope.playersExpanded = false;

	$scope.$watch("playing.word", function(){
		$scope.wordStart = new Date();
	});
	$scope.$watch("chosenWord.word", function(word){
		if (word){
			$scope.submitWord({word: word, timeTaken: new Date() - $scope.wordStart});
		}
	});

	$scope.updatePlaying = function(newVal){
		$scope.playersExpanded = !Boolean(newVal);
		$scope.playing = newVal;
	};

	$scope.submitWord = function(wordData){
		if ($scope.playing){
			GameService.submitWord($scope.game.id, wordData).then(function(response){
				$scope.chosenWord.word = "";
				$scope.player.picks.push(response.data.word);
				$scope.updatePlaying(response.data.game);
			}).catch(function(){
				$scope.addAlert({type: "danger", msg: "Word could not be submitted."});
			});
		}
	};

	$scope.skipWord = function(){
		$scope.submitWord({word: null, timeTaken: new Date() - $scope.wordStart});
	};

	$scope.continueGame = function(){
		$scope.updatePlaying(true);

		$scope.timeLeft = 30 - Math.floor((new Date() - new Date($scope.player.startTime))/1000);

		if ($scope.timeLeft < 0) $scope.stopGame();

		GameService.resumeGame($scope.game.id).then(function(response){
			$scope.updatePlaying(response.data);
			$interval(function(){$scope.timeLeft--;},1000,$scope.timeLeft)
				.then($scope.stopGame);
		}).catch(function(){
			$scope.addAlert({type: "danger", msg: "Game could not be continued"});
		});
	};

	$scope.startGame = function(){
		$scope.updatePlaying(true);

		$modal.open({
			templateUrl: "pages/game/components/startModal/startModal.html",
			controller: "StartModalController",
			size: "sm",
			backdrop: "static"
		}).result.then(function(){
			return GameService.startGame($scope.game.id);
		}).then(function(response){
			$scope.updatePlaying(response.data);
			$scope.timeLeft = 30;
			$interval(function(){$scope.timeLeft--;},1000,$scope.timeLeft)
				.then($scope.stopGame);
		}).catch(function(err){
			if (err) {
				$scope.addAlert({type: "danger", msg: "Game could not be started"});
			}
		});
	};

	$scope.activatePlayer = function(player){
		if (player.active) {
			$scope.playersExpanded = !$scope.playersExpanded;
		}

		$scope.game.players.forEach(function(p){
			p.active = (player === p);
		});

	};

	$scope.getNormal = function (player){
		return Math.floor((1 - player.normal) * 100) + "%";
	};

	$scope.stopGame = function(){
		GameService.stopGame($scope.game.id).then(function(response){
			$scope.updatePlaying(false);
			$scope.game = response.data;
			$scope.player = $scope.game.players[$scope.game.player];
			$scope.activatePlayer($scope.player);
		});
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
