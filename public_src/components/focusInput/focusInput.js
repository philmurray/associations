"use strict";

angular.module('associations.components.focus-input', [])
	.directive('focusInput', ['$timeout', function($timeout) {
		return {
			link: function(scope, element, attrs) {
				scope.$watch(attrs.focusInput, function(value) {
					if (value) {
						$timeout(function() {
                            var uiSelect = angular.element(element[0]).children().controller('uiSelect');
                            if (uiSelect) {
                                uiSelect.activate();
                            } else {
                                element[0].focus();
                            }
						});
					}
				});
			}
		};
	}]);
