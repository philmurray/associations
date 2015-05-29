"use strict";

angular.module('associations.components.login', [
	'associations.components.data.user',
	'associations.components.data.color',
	'associations.components.focus-input',
	'ui.bootstrap'
])
.factory('LoginInterceptorService', ['$q', '$location', '$injector', function($q, $location, $injector){
	var loginPromise;
	return {
		responseError: function(response){
			if (response.status === 401 && response.config.url !== '/auth/local' ){
				var LoginService = $injector.get('LoginService'),
					$http = $injector.get('$http');

				if (!loginPromise){
					loginPromise = LoginService.login();
				}

				return loginPromise.then(function(){
					return $http(response.config);
				}).catch(function(err){
					$location.path("/");
					return $q.reject(err);
				}).finally(function(){
					loginPromise = null;
				});
			}
			return $q.reject(response);
		}
	};
}])
.factory('LoginService', ['$modal', 'UserService', function($modal, UserService){
	return {
		login: function(){
			return $modal.open({
				templateUrl: "components/login/login.html",
				controller: "LoginController"
			}).result;
		}
	};
}])
.controller('LoginController', ['$scope', '$http', '$modalInstance', '$window', '$location', 'ColorService', function($scope, $http, $modalInstance, $window, $location, ColorService){
	$scope.submitEmail = function(){
		$scope.badPassword = false;
		$http.post('/auth/local',{
				email: $scope.email,
				password: $scope.password || '-'
			})
			.then(function(){
				ColorService.setUserColor().then($modalInstance.close);
			})
			.catch(function(response){
				if (response.status === 401){
					if ($scope.passwordRequired){
						$scope.badPassword = true;
					} else {
						$scope.passwordRequired = true;
					}
					return;
				}
				$modalInstance.dismiss(response.data);
			});
	};
	$scope.cancel = $modalInstance.dismiss;
	$scope.login = function(provider){
		$window.location.href = "/auth/" + provider + "/login" + $location.path();
	};
}]);
