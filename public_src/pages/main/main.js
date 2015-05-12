"use strict";

angular.module('associations.pages.main', [])

.controller("MainController", ["$scope", function($scope) {
	$scope.footer.visible = true;

	$scope.links = [
		{
			href: "#/playLanding",
			text: "Play!",
			description: "High intesity malarky. Single or multiplayer."
		},
		{
			href: "#/playerProfile",
			text: "Profile",
			description: "Change your info.  See your Stats."
		},
		{
			href: "#/exploreWords",
			text: "Words",
			description: "oooh! pretty word graphs!  (Works best on large screens)"
		},
		{
			href: "#/globalStatistics",
			text: "Statistics",
			description: "Complex analytics using the datas.  All the datas."
		}
	];
}]);
