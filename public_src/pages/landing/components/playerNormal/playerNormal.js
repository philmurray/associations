"use strict";
angular.module('associations.pages.landing.components.playerNormal', [
	'associations.components.normal',
	'associations.components.locked'
])
.controller("PlayerNormalCtrl", ["$scope", "NormalConverter", function($scope, NormalConverter){
	var self = this;

	self.converter = NormalConverter;
}]);
