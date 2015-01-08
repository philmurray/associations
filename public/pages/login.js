"use strict";

angular.module('associationsLogin', [])
.controller('LoginController', ['$scope', '$http', '$window', function($scope, $http, $window) {
	$scope.submitEmail = function(){
		if ($scope.email){
			$http.post('/login',{
				email: $scope.email,
				password: $scope.password || "-"
			}).then(function(){
				$window.location = "/";
			}).catch(function(){
				if (!$scope.passwordRequired){
					$scope.passwordRequired = true;
				}
			});
		}
	};
}]);
