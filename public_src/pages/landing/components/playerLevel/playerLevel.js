"use strict";
angular.module('associations.pages.landing.components.playerLevel', [
	'associations.components.data.user'
])
.constant("LEVEL_TEXT", [
	{
		min: 0,
		max: 2,
		text: "This is your current analysis level.  Every free association you make in any game will increase your level a little bit.  When your level gets higher, we will be able to show you more stats and give you more interesting personality analysis."
	},
	{
		min: 3,
		max: 4,
		text: "Having fun?  We have collected enough information on you to start showing you some basic statistics and analysis.  Keep playing to unlock more!"
	},
	{
		min: 5,
		max: 6,
		text: "Wow have we got the bead on you!  You have made significant progress and we are now able to provide some more interesting analysis.  Like this game?  Be sure to share it with your friends!  The more people play, the more accurate the game scores and analysis will become."
	},
	{
		min: 7,
		max: 9,
		text: "You are a ThinkyLinks freak!  More fun stuff has been unlocked for you.  You will probably also notice that your previous analyses have become more accurate."
	},
	{
		min: 10,
		text: "Congratulations!  You have attained ThinkyLinks godhood."
	}
])
.controller("PlayerLevelCtrl", ["$scope", "UserService", "LEVEL_TEXT", function($scope, UserService, LEVEL_TEXT){
	var self = this;

	UserService.get().then(function(response){
		self.user = response.data;
		LEVEL_TEXT.forEach(function(level){
			if (self.user.level >= level.min && (!level.max || self.user.level <= level.max)){
				self.levelText = level.text;
			}
		});
	});
}]);
