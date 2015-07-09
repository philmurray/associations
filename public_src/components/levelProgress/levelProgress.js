"use strict";

angular.module('associations.components.levelProgress', [])
	.directive('levelProgress', ['$timeout', function($timeout) {
		return {
			restrict: 'EA',
			scope: {
				level: "="
			},
			templateUrl: "components/levelProgress/levelProgress.html",
			link: function($scope, $element, attrs) {
				$scope.resetProgress = true;
				$scope.$watch('level', function(){
					if (!$scope.level) return;
					if (!$scope.current){
						$scope.current = $scope.level;
					} else {
						$scope.resetProgress = false;
						$timeout(addLevel, 100);
					}
				});

				var addLevel = function(){
					if ($scope.current.level === $scope.level.level){
						$scope.current.progress = $scope.level.progress;
						return;
					}

					$scope.current.progress = 100;
					$timeout(function(){
						$scope.resetProgress = true;
						$scope.current.progress = 0;
						$scope.current.level++;

						$timeout(function(){$scope.resetProgress = false;});
						$timeout(addLevel, 100);
					}, 1000);
				};
			}
		};
	}]);
