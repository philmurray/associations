"use strict";

angular.module('associations.pages.main',["associations.pages.main.components.nav"])

.controller("MainController", ["$scope", function ($scope) {
	$scope.nav = {
		words: [
			'Play',
			'Explore',
			'Me'
		],
		links:[{
			id: "profile",
			href: "#/profile",
			text: "Profile"
		},{
			id: "exploreLink",
			href: "#/explore",
			text: "Explore"
		}],
		title: "Associations",
		connections: [
			{
				from: "Associations",
				to: "Play"
			},
			{
				from: "Associations",
				to: "Explore"
			},
			{
				from: "Associations",
				to: "Me"
			},
			{
				from: "Explore",
				to: "exploreLink"
			},
			{
				from: "Me",
				to: "profile"
			}
		]
	};
}]);
