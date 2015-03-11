"use strict";

angular.module('associations.pages.playerProfile',[
	'directives.inputMatch',
	'associations.components.data.user',
	'associations.components.data.color',
	'associations.components.data.question'])

.controller("PlayerProfileController", ["$scope", "user", "UserService", "ColorService", "$log", "QuestionService", function ($scope, user, UserService, ColorService, $log, QuestionService) {
	$scope.profileUser = angular.extend({},user.data);
	$scope.accountUser = angular.extend({},user.data);

	$scope.forms = {};
	$scope.activePage = "Profile";

	ColorService.getColorList().then(function(response){
		$scope.colors = response.data;
	}).catch($log);

	QuestionService.getQuestionList().then(function(response){
		$scope.questionsObj = response.data;
		$scope.questions = [];
		angular.forEach($scope.questionsObj, function(question){
			var hasAnswer = false;
			angular.forEach(question.answers, function(answer){
				hasAnswer = hasAnswer || answer.selected;
			});
			if (hasAnswer){
				$scope.questions.push(question);
			} else {
				$scope.questions.unshift(question);
			}
		});
	});

	$scope.saveProfile = function (){
		UserService.save($scope.profileUser).then(function(){
			$scope.addAlert({type: "success", msg: "Player profile saved!"});
		}).catch(function(err){
			$scope.addAlert({type: "danger", msg: "Player profile could not be saved!"});
		});
	};

	$scope.saveAccount = function (){
		UserService.save($scope.accountUser).then(function(){
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
		QuestionService.saveQuestionList($scope.questionsObj).then(function(){
			$scope.addAlert({type: "success", msg: "Player survey saved!"});
		}).catch(function(err){
			$scope.addAlert({type: "danger", msg: "Player survey could not be saved!"});
		});
	};
}]);
