"use strict";
angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 250);

angular.module('associations.pages.landing', [
	'associations.components.login',
	'associations.pages.landing.components.welcome',
	'associations.pages.landing.components.alerts',
	'associations.pages.landing.components.pendingGames',
	'associations.pages.landing.components.pastGamesList',
	'associations.pages.landing.components.links',
	'associations.pages.landing.components.playerLevel',
	'associations.pages.landing.components.playerNormal',
	'associations.pages.landing.components.playerAnalysis',
	'associations.pages.landing.components.questionAnalysis',
	'associations.pages.landing.components.exploreLink',
	'infinite-scroll'
])

.controller("LandingController", ["$scope", "authenticated", "LoginService", function($scope, authenticated, LoginService) {
	$scope.footer.visible = true;
	$scope.authenticated = {
		value:authenticated
	};
	$scope.logIn = function(){
		LoginService.login().then(function(){
			$scope.authenticated.value = true;
		});
	};

	$scope.page = function(){
		var currentSectionIndex = $scope.sections.length - 1,
			currentSection = $scope.sections[currentSectionIndex],
			added = false;

		if (!currentSection || availableSections[currentSectionIndex].components.length === currentSection.components.length){
			currentSectionIndex++;
			if (!availableSections[currentSectionIndex]) return;

			currentSection = angular.copy(availableSections[currentSectionIndex]);
			currentSection.components = [];
			$scope.sections.push(currentSection);
			added = true;
		}
		var nextComponent = availableSections[currentSectionIndex].components[currentSection.components.length];
		if (nextComponent) {
			currentSection.components.push(nextComponent);
			added = true;
		}

		if (added){
			if (currentSection.authRequired && ! $scope.authenticated.value){
				$scope.page();
			}
		}
	};

	$scope.$watch("sections", function(){
		$scope.$emit("landingSections:update");
	}, true);

	$scope.sections = [];
	$scope.filterSections = function(value){
		return value.visible && ($scope.authenticated.value || !value.authRequired);
	};

	var availableSections = [
		{
			components:[
				"pages/landing/components/welcome/welcome.html",
				"pages/landing/components/alerts/alerts.html",
				"pages/landing/components/links/links.html"
			],
			authRequired:true,
			visible:true
		},
		{
			title: "Games",
			components:[
				"pages/landing/components/pendingGames/pendingGames.html",
				"pages/landing/components/pastGamesList/pastGamesList.html"
			],
			authRequired:true,
			visible:true
		},
		{
			title: "You",
			authRequired: true,
			components: [
				"pages/landing/components/playerLevel/playerLevel.html",
				"break",
				"pages/landing/components/playerNormal/playerNormal.html",
				"break",
				"pages/landing/components/playerAnalysis/playerAnalysis.html",
				"break",
				"pages/landing/components/questionAnalysis/questionAnalysis.html"
			],
			visible: true
		},
		{
			title: "Explore",
			components: ["pages/landing/components/exploreLink/exploreLink.html"],
			visible:true
		}
	];
	$scope.page();

}]);
