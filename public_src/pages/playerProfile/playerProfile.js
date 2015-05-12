"use strict";

angular.module('associations.pages.playerProfile',[
	'directives.inputMatch',
	'associations.components.data.user',
	'associations.components.data.color',
	'associations.components.data.question'])

.controller("PlayerProfileController", ["$scope", "user", "UserService", "ColorService", "$log", "QuestionService", function ($scope, user, UserService, ColorService, $log, QuestionService) {
	$scope.footer.visible = true;
	$scope.profileUser = angular.extend({},user);
	$scope.accountUser = angular.extend({},user);

	$scope.forms = {};
	$scope.activePage = "Profile";

	ColorService.getColorList().then(function(response){
		$scope.colors = response.data;
	}).catch($log);

	QuestionService.getQuestionList().then(function(response){
		$scope.questionsObj = response.data;
		$scope.initQuestions();
	});

	$scope.saveProfile = function (){
		if ($scope.forms.display.$invalid){
			$scope.forms.display.showErrors = true;
			return;
		}

		UserService.save($scope.profileUser)
			.then(ColorService.setUserColor)
			.then(function(){
				$scope.forms.display.showErrors = false;
				$scope.addAlert({type: "success", msg: "Player profile saved!"});
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
