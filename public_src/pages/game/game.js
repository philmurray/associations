"use strict";

angular.module('associations.pages.game', [
	'associations.components.data.game',
	'ui.bootstrap',
	'associations.pages.game.components.startModal',
	'associations.pages.game.components.finishModal',
	'associations.pages.game.components.graph',
	'associations.components.focus-input',
	'associations.components.scroll-bottom'
])

.constant("GAME_TIME", 45)
.controller("GameController", ["$scope", "game", "$modal", "GameService", "$interval", "GAME_TIME", "$timeout", function($scope, game, $modal, GameService, $interval, GAME_TIME, $timeout) {
	$scope.footer.visible = false;
	$scope.game = game;
	$scope.player = $scope.game.players[$scope.game.player];
	$scope.graphConfig = {};
	$scope.chosenWord = {
		word: "",
		placeholderText:"What do you think?"
	};
	$scope.playersExpanded = false;
	$scope.chat = {
		expanded: false,
		currentText: "",
		messages: []
	};

	$scope.$watch("playing.word", function(){
		$scope.wordStart = new Date();
	});
	$scope.$watch("chosenWord.word", function(word){
		if (word){
			$scope.submitWord({word: word, timeTaken: new Date() - $scope.wordStart});
		}
	});

	$scope.updatePlaying = function(newVal){
		$scope.playing = newVal;
		if (typeof newVal === "object" && !newVal.word) {
			$scope.stopGame();
		}
	};

	$scope.submitWord = function(wordData){
		if ($scope.playing){
			GameService.submitWord($scope.game.id, wordData).then(function(response){
				$scope.chosenWord.word = "";
				$scope.player.picks.push(response.data.word);
				$scope.updatePlaying(response.data.game);
			}).catch(function(err){
				$scope.addAlert({type: "danger", msg: "Word could not be submitted"});
				$scope.stopGame();
			});
		}
	};

	$scope.skipWord = function(){
		$scope.submitWord({word: null, timeTaken: new Date() - $scope.wordStart});
	};

	$scope.continueGame = function(){
		$scope.updatePlaying(true);

		$scope.timeLeft = GAME_TIME - Math.floor((new Date() - new Date($scope.player.startTime))/1000);

		if ($scope.timeLeft < 0) {
			$scope.stopGame();
			return;
		}

		GameService.resumeGame($scope.game.id).then(function(response){
			$scope.updatePlaying(response.data);
			$scope.gameTimer = $interval(function(){$scope.timeLeft--;},1000,$scope.timeLeft);
			$scope.gameTimer.then($scope.stopGame);
		}).catch(function(){
			$scope.addAlert({type: "danger", msg: "Game could not be continued"});
			$scope.stopGame();
		});
	};

	$scope.startGame = function(){
		$scope.updatePlaying(true);

		$modal.open({
			templateUrl: "pages/game/components/startModal/startModal.html",
			controller: "StartModalController",
			size: "lg",
			backdrop: "static",
			resolve: {
				showInstructions: function(){
					return !$scope.game.seenInstructions;
				}
			}
		}).result.then(function(){
			return GameService.startGame($scope.game.id);
		}).then(function(response){
			$scope.updatePlaying(response.data);
			$scope.timeLeft = GAME_TIME;
			$scope.gameTimer = $interval(function(){$scope.timeLeft--;},1000,$scope.timeLeft);
			$scope.gameTimer.then($scope.stopGame);
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
		if ($scope.gameTimer) {
			$interval.cancel($scope.gameTimer);
		}
		var showInstructions = !$scope.game.seenInstructions,
			previousLevel = $scope.game.level;
		GameService.stopGame($scope.game.id).then(function(response){
			$scope.updatePlaying(false);
			$scope.game = response.data;
			$scope.player = $scope.game.players[$scope.game.player];
			$scope.activatePlayer($scope.player);
			$timeout(function(){
				$modal.open({
					templateUrl: "pages/game/components/finishModal/finishModal.html",
					controller: "FinishModalController",
					size: "md",
					resolve: {
						showInstructions: function(){
							return showInstructions;
						},
						levelProgress: function(){
							return {
								previous: previousLevel,
								current: $scope.game.level
							};
						},
						player: function(){
							return $scope.player;
						}
					}
				});
			},1000);

		});
	};

	$scope.submitChat = function(){
		GameService.submitChat($scope.game.id, $scope.chat.currentText)
			.then(function (response){
				$scope.chat.messages = response.data;
				$scope.chat.currentText = "";
			});
	};

	$scope.expandChat = function(){
		if (!$scope.chat.loaded) {
			GameService.getChats($scope.game.id)
				.then(function(response){
					$scope.chat.messages = response.data;
					$scope.chat.expanded = true;
					$scope.chat.loaded = true;
					$scope.game.unreadChats = 0;
				});
		} else {
			$scope.chat.expanded = true;
		}
	};

	$scope.getPlayer = function(id){
		for (var i = 0, l = $scope.game.players.length; i<l; i++){
			if ($scope.game.players[i].id === id) return $scope.game.players[i];
		}
	};
	$scope.$on('$destroy', function() {
		if ($scope.gameTimer) {
			$interval.cancel($scope.gameTimer);
		}
	});

	if ($scope.player !== undefined){
		$scope.activatePlayer($scope.player);
		if (!$scope.player.completed){
			if (!$scope.player.startTime){
				$scope.startGame();
			} else {
				$scope.continueGame();
			}
		}
		// for debugging
		// else {
		// 	$scope.stopGame();
		// }
	} else {
		$scope.activatePlayer($scope.game.players[0]);
	}
}]);
