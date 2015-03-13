"use strict";

angular.module('associations.pages.playLanding',[])

.controller("PlayLandingController", ["$scope", "user", "color", function ($scope, user, color) {
	$scope.color = color;

	$scope.rematch = function(game, event){
		event.cancelBubble = true;
	};

	$scope.gotoGame = function(game){

	};

	$scope.formatPlayerNames = function(players){
		return players.map(function(player){return player.alias;}).join(', ');
	};

	$scope.singleGames = [
		{
			status: "Completed",
			link: "123456789",
			time: new Date()
		}
	];

	$scope.multiGames = [
		{
			link: "123456789",
			time: new Date(),
			status: "Pending",
			statusText: "Waiting for you",
			notifications: 5,
			winner: null,
			players: [
				{alias:"George", id:12345},
				{alias:"Lucas", id:12346},
				{alias:"Frank", id:12347}
			]
		},
		{
			link: "123456789",
			time: new Date(),
			status: "Waiting",
			statusText: "Waiting for them",
			notifications: 0,
			winner: null,
			players: [
				{alias:"Frank", id:1234}
			]
		},
		{
			link: "123456789",
			time: new Date(),
			status: "Completed",
			notifications: 2,
			winner: 1234,
			players: [
				{alias:"George colbrecth", id:1234},
				{alias:"Lucas do matchor", id:12345},
				{alias:"Franky mansion", id:12346}
			]
		},
		{
			link: "123456789",
			time: new Date(),
			status: "Completed",
			notifications: 2,
			winner: 1234,
			players: [
				{alias:"George", id:12345},
				{alias:"Lucas", id:1234},
				{alias:"Frank", id:12346}
			]
		},
		{
			link: "123456789",
			time: new Date(),
			status: "Completed",
			notifications: 2,
			winner: 1234,
			players: [
				{alias:"George", id:12346},
				{alias:"Lucas", id:1234},
				{alias:"Frank", id:12345}
			]
		},
		{
			link: "123456789",
			time: new Date(),
			status: "Completed",
			notifications: 2,
			winner: 1234,
			players: [
				{alias:"George", id:1234},
				{alias:"Lucas", id:12345},
				{alias:"Frank", id:12346}
			]
		}
	];
}]);
