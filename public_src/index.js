"use strict";

angular.module('associations',
	[
		'templates',
		'ngAnimate',
		'ngRoute',
		'associations.pages.landing',
		'associations.pages.exploreWords',
		'associations.pages.playerProfile',
		'associations.pages.game',
		'associations.components.login',
		'associations.components.data.color',
		'associations.components.data.user',
		'associations.components.data.game',
		'ui.bootstrap.alert'
	])
	.config(['$routeProvider', '$httpProvider',
	function($routeProvider, $httpProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'pages/landing/landing.html',
				controller: 'LandingController',
				resolve: {
					authenticated: ['UserService', function(UserService){
						return UserService.authenticated().then(function(response){return response.data;});
					}]
				}
			})
			.when('/playerProfile', {
				templateUrl: 'pages/playerProfile/playerProfile.html',
				controller: 'PlayerProfileController',
				resolve: {
					user: ['UserService', function(UserService){
						return UserService.get().then(function(response){return response.data;});
					}],
					questions: ['QuestionService', function(QuestionService){
						return QuestionService.getQuestionList().then(function(response){return response.data;});
					}],
					colorList: ['ColorService', function(ColorService){
						return ColorService.getColorList().then(function(response){return response.data;});
					}]
				}
			})
			.when('/game/:gameId', {
				templateUrl: 'pages/game/game.html',
				controller: 'GameController',
				resolve: {
					game: ['GameService', '$route', function(GameService, $route){
						return GameService.get($route.current.params.gameId).then(function(response){return response.data;});
					}]
				}
			})
			.when('/exploreWords', {
				templateUrl: 'pages/exploreWords/exploreWords.html',
				controller: 'ExploreWordsController',
				reloadOnSearch: false
			})
			.otherwise({redirectTo: '/'});

		$httpProvider.interceptors.push('LoginInterceptorService');
	}])
	.run(['$rootScope', '$modalStack',
		function($rootScope, $modalStack) {
			$rootScope.$on('$locationChangeSuccess', function() {
				var top = $modalStack.getTop();
				if (top) {
					$modalStack.dismiss(top.key);
				}
			});
		}
	])
	.controller("AppController", ["$scope", "$timeout", "ColorService", function($scope, $timeout, ColorService){
		$scope.footer = {visible: true};

		$scope.alerts = [];

		ColorService.setUserColor();

		$scope.addAlert = function(alert) {
			$scope.alerts.push(alert);
			$timeout(function(){
				var i = $scope.alerts.indexOf(alert);
				if (i !== -1){
					$scope.alerts.splice(i,1);
				}
			}, 2500);
		};

		$scope.closeAlert = function(index) {
			$scope.alerts.splice(index, 1);
		};
	}]);
