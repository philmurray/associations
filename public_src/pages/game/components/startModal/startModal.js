"use strict";

//kind of a hack, but we do what we gotta do...
angular.module("template/carousel/carousel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/carousel/carousel.html",
    "<div ng-mouseenter=\"pause()\" ng-mouseleave=\"play()\" class=\"carousel\" ng-swipe-right=\"prev()\" ng-swipe-left=\"next()\">\n" +
    "    <div class=\"carousel-inner\" ng-transclude></div>\n" +
    "    <a class=\"left carousel-control\" ng-click=\"prev()\" ng-show=\"slides.length > 1 && !isActive(slides[0])\"><span class=\"glyphicon glyphicon-chevron-left\"></span></a>\n" +
    "    <a class=\"right carousel-control\" ng-click=\"next()\" ng-show=\"slides.length > 1 && !isActive(slides[slides.length - 1])\"><span class=\"glyphicon glyphicon-chevron-right\"></span></a>\n" +
    "</div>\n" +
    "");
}]);

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
