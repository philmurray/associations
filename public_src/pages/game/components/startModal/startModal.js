"use strict";

angular.module('associations.pages.game.components.startModal', [
	'ui.bootstrap'
])

.controller("StartModalController", ["$scope", "$modalInstance", "showInstructions", "$modalStack", function($scope, $modalInstance, showInstructions, $modalStack) {
	$scope.close = $modalInstance.close;
	$scope.instructions = {
		shown: showInstructions
	};

	$scope.slides = [{
		text: "Thinkylinks is all about making free associations.",
		image: "assets/img/instructions_logo.svg"
	}, {
		text: "A free association is when you are given a word, then you type the first word that comes to your head.",
		image: "assets/img/instructions_associations.svg"
	}, {
		text: "The game is to make as many free associations as you can before the timer runs out.",
		image: "assets/img/instructions_game.svg"
	}, {
		text: "Each word is scored based on the free associations of all other Thinkylinks players.",
		image: "assets/img/instructions_other_players.svg"
	}, {
		text: "All valid associations will get you 100 points.",
		image: "assets/img/instructions_score_normal.svg"
	}, {
		text: "You get bonus points if you happen to pick the most commonly associated word.",
		image: "assets/img/instructions_score.svg"
	}, {
		text: "If you make an association that no player has ever made before, you get just get 1 point.",
		image: "assets/img/instructions_score_bad.svg"
	},{
		text: "That's all there is to it! Click on 'Go' to begin!"
	}];

	var titles = [
		"Get Ready",
		"Clear your mind",
		"Empty your thoughts",
		"Brace yourself",
		"Ready, Set ...",
		"Open your mind"
	];
	$scope.title = titles[Math.floor(Math.random()*titles.length)];
}]);
