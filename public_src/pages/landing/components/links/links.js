"use strict";
angular.module('associations.pages.landing.components.links', [
	'associations.components.data.game'
])
	.controller("LinksCtrl", ["$scope", "GameService", "$location", function($scope, GameService, $location){
		var self = this;

		this.startSingleGame = function(){
			GameService.createGame()
				.then(function(response){
					$location.path("/game/"+response.data.id);
				})
				.catch(function(err){
					$scope.addAlert({type: "danger", msg: "Game could not be created"});
				});
		};
	}]);
