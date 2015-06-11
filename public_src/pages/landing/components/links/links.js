"use strict";
angular.module('associations.pages.landing.components.links', [
	'associations.components.data.game',
	'associations.pages.landing.components.links.components.selectPlayer',
	'ui.bootstrap'
])
	.controller("LinksCtrl", ["$scope", "GameService", "$location", '$modal', function($scope, GameService, $location, $modal){
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

		this.startMultiGame = function(){
			$modal.open({
				templateUrl: "pages/landing/components/links/components/selectPlayer/selectPlayer.html",
				controller: "SelectPlayerCtrl",
				resolve: {
					recentPlayers: ['UserService', function(UserService){
						return UserService.recentPlayers().then(function(response){return response.data;});
					}]
				}
			}).result.then(function(players){
				GameService.createGame(players)
					.then(function(response){
						$location.path("/game/"+response.data.id);
					})
					.catch(function(err){
						$scope.addAlert({type: "danger", msg: "Game could not be created"});
					});
			});
		};
	}]);
