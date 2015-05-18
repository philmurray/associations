"use strict";

angular.module('associations.components.scroll-bottom', [])
	.directive('scrollBottom', ['$timeout', function($timeout) {
		return {
			priority: 1,
			restrict: 'A',
			link: function($scope, $element, attrs) {
				var element = $element[0],
					isActivated = true;

				$scope.$watch(function(){
					if (isActivated) {
						element.scrollTop = element.scrollHeight;
					}
				});
				$element.bind('scroll', function(){
					isActivated = element.scrollTop + element.clientHeight + 1 >= element.scrollHeight;
                });
			}
		};
	}]);
