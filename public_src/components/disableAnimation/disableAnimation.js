"use strict";

angular.module('associations.components.disable-animation', [])
.directive('disableAnimation', ["$animate", function($animate){
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs){
            $attrs.$observe('disableAnimation', function(value){
                $animate.enabled(!value, $element);
            });
        }
    };
}]);
