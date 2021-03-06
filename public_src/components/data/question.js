"use strict";

angular.module('associations.components.data.question', [])
	.factory('QuestionService', ['$http', function($http){
		return {
			getQuestionList: function(){
				var url = "/rpc/questions";
				return $http({
					method: 'GET',
					url: url,
					cache: true
				});
			},
			saveQuestionList: function(questions){
				var url = "/rpc/questions";
				return $http({
					method: 'POST',
					url: url,
					data: questions
				});
			}
		};
	}]);
