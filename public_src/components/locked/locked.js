"use strict";

angular.module('associations.components.locked', [])
	.directive('lockSwitch', [function() {
		return {
			scope: {
				lock: "="
			},
			controller: ['$scope', 'LockService', function lockSwitchController($scope, LockService) {
				if (!$scope.lock) throw new Error('lockSwitch Requires a lock!');
				this.cases = {};
				this.promise = LockService.getState($scope.lock);
			}],
    		link: function(scope, element, attr, lockSwitchController) {
				lockSwitchController.promise.then(function(response){
					var selectedTransclude = response.data.locked ? lockSwitchController.cases.lockedTransclude : lockSwitchController.cases.unlockedTransclude;

					selectedTransclude.transclude(function(caseElement, selectedScope) {
						selectedScope.data = response.data;
					});
				});
			}
		};
	}])
	.directive('locked', [function(){
		return {
			transclude: 'element',
			priority: 1200,
			require: '^lockSwitch',
			multiElement: true,
			link: function(scope, element, attrs, ctrl, $transclude) {
				ctrl.cases.lockedTransclude = $transclude;
			}
		};
	}])
	.directive('unlocked', [function(){
		return {
			transclude: 'element',
			priority: 1200,
			require: '^lockSwitch',
			multiElement: true,
			link: function(scope, element, attrs, ctrl, $transclude) {
				ctrl.cases.unlockedTransclude = $transclude;
			}
		};
	}]);
