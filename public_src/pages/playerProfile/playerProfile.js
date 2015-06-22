"use strict";

angular.module('associations.pages.playerProfile',[
	'directives.inputMatch',
	'associations.components.data.user',
	'associations.components.data.color',
	'associations.components.data.question'])
.controller("PlayerProfileController", ["$scope", "user", "UserService", "ColorService", "$log", "QuestionService", "questions", "colorList", "$timeout", function ($scope, user, UserService, ColorService, $log, QuestionService, questions, colorList, $timeout) {
	$scope.footer.visible = true;
	$scope.profileUser = angular.extend({},user);
	$scope.accountUser = angular.extend({},user);
	$scope.colors = colorList;
	$scope.questionsObj = questions;

	$scope.forms = {};
	$scope.activePage = "Profile";

	$scope.saveProfile = function (){
		if ($scope.forms.display.$invalid){
			$scope.forms.display.showErrors = true;
			return;
		}

		UserService.save($scope.profileUser)
			.then(ColorService.setUserColor)
			.then(function(){
				$scope.forms.display.showErrors = false;
				$scope.showProfileConfirm = true;
				$timeout(function(){$scope.showProfileConfirm = false;}, 2000);
			})
			.catch(function(err){
				$scope.addAlert({type: "danger", msg: "Player profile could not be saved!"});
			});
	};

	$scope.saveAccount = function (){
		if ($scope.forms.local.$invalid){
			$scope.forms.local.showErrors = true;
			return;
		}

		UserService.save($scope.accountUser).then(function(){
			$scope.forms.local.showErrors = false;
			$scope.forms.local.emailTaken = false;
			$scope.showAccountConfirm = true;
			$timeout(function(){$scope.showAccountConfirm = false;}, 2000);
		}).catch(function(err){
			if (err.data.message && err.data.message.match(/email/i)){
				$scope.forms.local.showErrors = true;
				$scope.forms.local.emailTaken = true;
			} else {
				$scope.addAlert({type: "danger", msg: "Player profile could not be saved!"});
			}
		});
	};

	$scope.selectAnswer = function(question, answer){
		angular.forEach(question.question.answers, function(a){
			a.selected = (a === answer);
		});
		var q = {};
		q[question.id] = question.question;
		QuestionService.saveQuestionList(q).then(function(){
			$scope.initQuestions();
		}).catch(function(err){
			$scope.addAlert({type: "danger", msg: "Player survey could not be saved!"});
		});
	};

	$scope.initQuestions = function(){
		var rebuild = false;
		if (!$scope.questions) {
			rebuild = true;
			$scope.questions = [];
		}
		$scope.unansweredQuestions = 0;
		angular.forEach($scope.questionsObj, function(question, questionId){
			var hasAnswer = false;
			angular.forEach(question.answers, function(answer){
				hasAnswer = hasAnswer || answer.selected;
			});
			if (hasAnswer){
				if (rebuild) $scope.questions.push({question:question, id: questionId});
			} else {
				if (rebuild) $scope.questions.unshift({question:question, id: questionId});
				$scope.unansweredQuestions++;
			}
		});
	};
	$scope.initQuestions();
}]);
