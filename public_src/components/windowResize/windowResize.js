"use strict";

angular.module("associations.components.windowResize",[])
	.factory('windowResize', ["$window", "$timeout", function($window, $timeout){
		var w = angular.element($window),
			listeners = [],
			prev,
			debounce;

		var getSize = function(){
			return {
				width: w[0].innerWidth,
				height: w[0].innerHeight
			};
		};

		var register = function(listener){
			if (!listeners.length){

				// Browser onresize event
				w.bind('resize', function () {
					if (debounce){
						$timeout.cancel(debounce);
					}
					debounce = $timeout(function(){
						var curr = getSize();
						if (!angular.equals(prev, curr)){
							listeners.forEach(function(listener){
								listener();
							});
						}
						prev = getSize();
						debounce = null;
					}, 100);
				});
			}

			listeners.push(listener);

			return deregister.bind(null, listener);
		};
		var deregister = function(listener){
			var i = listeners.indexOf(listener);
			if (i >=0 ){
				listeners.splice(i,1);
				if (!listeners.length){
					w.unbind('resize');
				}
			}
		};
		return {
			register: register,
			deregister: deregister
		};
	}]);
