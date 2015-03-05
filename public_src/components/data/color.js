"use strict";

angular.module('associations.components.data.color', [])
	.factory('ColorService', ['$http', function($http){
		return {
			getColorList: function(){
				var url = "/rpc/colorList";
				return $http({
					method: 'GET',
					url: url,
					cache: true
				});
			},
			getUserColor: function(){
				var url = "/rpc/color";
				return $http({
					method: 'GET',
					url: url
				});
			}
		};
	}]);
