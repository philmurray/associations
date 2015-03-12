"use strict";

angular.module('associations',
	[
		'templates',
		'ngAnimate',
		'ngRoute',
		'associations.pages.main',
		'associations.pages.exploreWords',
		'associations.pages.playerProfile',
		'associations.pages.playLanding',
		'associations.pages.playMulti',
		'associations.components.login',
		'associations.components.data.color',
		'ui.bootstrap.alert'
	])
	.config(['$routeProvider', '$httpProvider',
	function($routeProvider, $httpProvider) {
		var authenticatedRoute = ["LoginService", function(LoginService){
				return LoginService.isLoggedIn();
			}],
			userColor = ["ColorService", function(ColorService){
				return ColorService.getUserColor().then(function(response){
					return response.data;
				});
			}]
		;

		$routeProvider
			.when('/', {
				templateUrl: 'pages/main/main.html',
				controller: 'MainController',
				resolve: {
					color: userColor
				}
			})
			.when('/playerProfile', {
				templateUrl: 'pages/playerProfile/playerProfile.html',
				controller: 'PlayerProfileController',
				resolve: {
					user: authenticatedRoute
				}
			})
			.when('/playLanding', {
				templateUrl: 'pages/playLanding/playLanding.html',
				controller: 'PlayLandingController',
				resolve: {
					user: authenticatedRoute,
					color: userColor
				}
			})
			.when('/playMulti', {
				templateUrl: 'pages/playMulti/playMulti.html',
				controller: 'PlayMultiController',
				resolve: {
					user: authenticatedRoute,
					color: userColor
				}
			})
			.when('/exploreWords', {
				templateUrl: 'pages/exploreWords/exploreWords.html',
				controller: 'ExploreWordsController',
				reloadOnSearch: false,
				resolve: {
					color: userColor
				}
			})
			.otherwise({redirectTo: '/'});

		$httpProvider.interceptors.push('LoginInterceptorService');
	}])
	.controller("AppController", ["$scope", "$timeout", function($scope, $timeout){
		$scope.alerts = [];

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
