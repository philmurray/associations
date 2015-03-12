"use strict";

angular.module('associations.pages.playLanding',[])

.controller("PlayLandingController", ["$scope", "user", "color", function ($scope, user, color) {
	$scope.color = color;

	$scope.multiGames = [
		{
			link: "123456789",
			time: new Date(),
			status: "Pending",
			notifications: 5,
			players: [
				{alias:"George"},
				{alias:"Lucas"},
				{alias:"Frank"}
			]
		},
		{
			link: "123456789",
			time: new Date(),
			status: "Waiting...",
			notifications: 0,
			players: [
				{alias:"Frank"}
			]
		},
		{
			link: "123456789",
			time: new Date(),
			status: "Completed",
			notifications: 2,
			players: [
				{alias:"George"},
				{alias:"Lucas"},
				{alias:"Frank"}
			]
		},
		{
			link: "123456789",
			time: new Date(),
			status: "Completed",
			notifications: 2,
			players: [
				{alias:"George"},
				{alias:"Lucas"},
				{alias:"Frank"}
			]
		},
		{
			link: "123456789",
			time: new Date(),
			status: "Completed",
			notifications: 2,
			players: [
				{alias:"George"},
				{alias:"Lucas"},
				{alias:"Frank"}
			]
		},
		{
			link: "123456789",
			time: new Date(),
			status: "Completed",
			notifications: 2,
			players: [
				{alias:"George"},
				{alias:"Lucas"},
				{alias:"Frank"}
			]
		},
		{
			link: "123456789",
			time: new Date(),
			status: "Completed",
			notifications: 2,
			players: [
				{alias:"George"},
				{alias:"Lucas"},
				{alias:"Frank"}
			]
		},
		{
			link: "123456789",
			time: new Date(),
			status: "Completed",
			notifications: 2,
			players: [
				{alias:"George"},
				{alias:"Lucas"},
				{alias:"Frank"}
			]
		}
	];

	$scope.startSingleGame = function(){

	};
}]);
