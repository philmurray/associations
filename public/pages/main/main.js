"use strict";

angular.module('associations.pages.main',["associations.pages.main.components.nav"])

.controller("MainController", ["$scope", function ($scope) {
	$scope.nav = {
		words: [
			{id:'Play',text:"Play",initial:{x:0,y:-0.5}},
			{id:'Explore',text:"Explore",initial:{x:-0.5,y:0.5}},
			{id:'Me',text:"Me",initial:{x:0.5,y:0.5}},
		],
		links:[{
			id: "playerProfile",
			href: "#/playerProfile",
			text: "Profile",
			initial:{x:1,y:1}
		},{
			id: "playerStatistics",
			href: "#/playerStatistics",
			text: "Statistics",
			initial:{x:1,y:0.75}
		},{
			id: "exploreWords",
			href: "#/exploreWords",
			text: "Words",
			initial:{x:-1,y:1}
		},{
			id: "exploreStatistics",
			href: "#/globalStatistics",
			text: "Statistics",
			initial:{x:-1,y:0.75}
		},{
			id: "singleGame",
			href: "#/singleGame",
			text: "Single",
			initial:{x:-0.5,y:-0.5}
		},{
			id: "multiGame",
			href: "#/multiGame",
			text: "Multiplayer",
			initial:{x:0.5,y:-0.5}
		}],
		title: {id:"Associations",text:"Associations",initial:{x:0,y:0},fixed:true},
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
				to: "exploreWords"
			},
			{
				from: "Explore",
				to: "exploreStatistics"
			},
			{
				from: "Me",
				to: "playerProfile"
			},
			{
				from: "Me",
				to: "playerStatistics"
			},
			{
				from: "Play",
				to: "singleGame"
			},
			{
				from: "Play",
				to: "multiGame"
			}
		]
	};
}]);
