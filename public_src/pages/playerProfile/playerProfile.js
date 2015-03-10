"use strict";

angular.module('associations.pages.playerProfile',[
	'directives.inputMatch',
	'associations.components.data.user',
	'associations.components.data.color',
	'associations.components.data.question'])

.controller("PlayerProfileController", ["$scope", "user", "UserService", "ColorService", "$log", "QuestionService", function ($scope, user, UserService, ColorService, $log, QuestionService) {
	$scope.user = angular.extend({},user.data);

	$scope.forms = {};
	$scope.activePage = "Profile";

	ColorService.getColorList().then(function(response){
		$scope.colors = response.data;
	}).catch($log);

	QuestionService.getQuestionList().then(function(response){
		$scope.questions = response.data;
	});

	$scope.saveProfile = function (){
		UserService.save($scope.user).then(function(){
			$scope.addAlert({type: "success", msg: "Player profile saved!"});
		}).catch(function(err){
			$scope.addAlert({type: "danger", msg: "Player profile could not be saved!"});
		});
	};

	$scope.selectAnswer = function(question, answer){
		angular.forEach(question.answers, function(a){
			a.selected = (a === answer);
		});
	};

	$scope.unansweredQuestions = function(){
		var num = 0;
		angular.forEach($scope.questions, function(question){
			var answered = false;
			angular.forEach(question.answers, function(a){
				answered = answered || a.selected;
			});
			if (!answered) {
				num++;
			}
		});
		return num || "";
	};

	$scope.saveSurvey = function(){
		QuestionService.saveQuestionList($scope.questions).then(function(){
			$scope.addAlert({type: "success", msg: "Player survey saved!"});
		}).catch(function(err){
			$scope.addAlert({type: "danger", msg: "Player survey could not be saved!"});
		});
	};
}]);
