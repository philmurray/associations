"use strict";

angular.module('associations.components.data.color', [])
	.factory('ColorService', ['$http', '$rootScope', function($http, $rootScope){
		return {
			getColorList: function(){
				var url = "/rpc/colorList";
				return $http({
					method: 'GET',
					url: url,
					cache: true
				});
			},
			setUserColor: function(){
				var url = "/rpc/color";
				return $http({
					method: 'GET',
					url: url
				}).then(function(response){
					$rootScope.color = response.data;
					return response;
				});
			}
		};
	}]);
