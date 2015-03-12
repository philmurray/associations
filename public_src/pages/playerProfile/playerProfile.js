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
		$scope.setPlayerColor();
	}).catch($log);

	QuestionService.getQuestionList().then(function(response){
		$scope.questionsObj = response.data;
		$scope.initQuestions();
	});

	$scope.setPlayerColor = function(){
		$scope.colors.forEach(function(color){
			if ((!$scope.color && color.is_default) ||
				color.id === $scope.profileUser.colorId){
				$scope.color = color;
			}
		});
	};

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

	$scope.initQuestions = function(){
		$scope.questions = [];
		$scope.unansweredQuestions = 0;
		angular.forEach($scope.questionsObj, function(question){
			var hasAnswer = false;
			angular.forEach(question.answers, function(answer){
				hasAnswer = hasAnswer || answer.selected;
			});
			if (hasAnswer){
				$scope.questions.push(question);
			} else {
				$scope.questions.unshift(question);
				$scope.unansweredQuestions++;
			}
		});
	};

	$scope.saveSurvey = function(){
		QuestionService.saveQuestionList($scope.questionsObj).then(function(){
			$scope.initQuestions();
			$scope.addAlert({type: "success", msg: "Player survey saved!"});
		}).catch(function(err){
			$scope.addAlert({type: "danger", msg: "Player survey could not be saved!"});
		});
	};
}]);
