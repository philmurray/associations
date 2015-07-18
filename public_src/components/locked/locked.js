"use strict";

angular.module('associations.components.locked', [
	'associations.components.data.lock'
])
	.directive('lockSwitch', ['LockService', function(LockService) {
		return {
			controller: [function lockSwitchController() {
				this.cases = {};
			}],
    		link: function(scope, element, attr, lockSwitchController) {
				if (!attr.lock) throw new Error('lockSwitch Requires a lock!');
				LockService.get(attr.lock).then(function(response){
					var selectedTransclude = response.data.locked ? lockSwitchController.cases.lockedTransclude : lockSwitchController.cases.unlockedTransclude;

					scope.data = response.data;
					element.append(selectedTransclude());
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
