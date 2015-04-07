"use strict";

angular.module('associations.pages.game.components.pickGraph', [])

.constant("pickGraphSettings",{
	rowPadding: 5,
	wordBoxRadius: 5,
	wordBoxPadding: 5,

})
.directive("pickGraph", ["pickGraphSettings", function (pickGraphSettings) {
	return {
		restrict: 'A',
		templateUrl: 'pages/game/components/pickGraph/pickGraph.html',
		scope: {
			model:'=graphModel'
		},
		link: function($scope, $element, attrs) {
			var canvas = $element.find('canvas')[0],
				ctx = canvas.getContext('2d');

			//TODO: handle resizing
			canvas.width = $element[0].clientWidth;
			canvas.height = 0;

			var viewModel,
				createViewModel = function(){
					viewModel = {
						picks: {},
						picksArray: []
					};
					var biggest = [];
					$scope.model.forEach(function(player){
						if (player.picks.length > biggest.length) biggest = player.picks;
						if (player.active) viewModel.active = player;
						player.picks.forEach(function (pick){
							if (!viewModel.picks[pick.from]) viewModel.picks[pick.from] = [];
							viewModel.picks[pick.from] = {
								to: pick.to,
								player: player
							};
						});
					});
					biggest.forEach(function(pick){
						viewModel.picksArray.push({
							from: pick.from,
							value: viewModel.picks[pick.from]
						});
					});
				};

			var render = function(model){
				updateModel();
				renderModel();
			};

			var updateModel = function(){
				if (!$scope.model) return;
				if (!viewModel){
					createViewModel();
				} else {
					//handle changing active player
					//handle adding pick
				}
			};

			var renderModel = function(){
				var height = canvas.height = 0;
				viewModel.picksArray.forEach(function(pick){
					height += rowHeight(pick);
				});
				canvas.height = height;

				ctx.save();
				viewModel.picksArray.forEach(drawRow);
				ctx.restore();
			};

			var rowHeight = function(pick){
				return 50 + pickGraphSettings.rowPadding*2;
			};

			var drawRow = function (pick){
				var height = rowHeight(pick);
				ctx.strokeStyle = "#fff";
				roundedRect(pickGraphSettings.rowPadding,pickGraphSettings.rowPadding, 100, 50, 5);
				ctx.translate(0, height);
			};

			function roundedRect(x,y,width,height,radius){
			  ctx.beginPath();
			  ctx.moveTo(x,y+radius);
			  ctx.lineTo(x,y+height-radius);
			  ctx.quadraticCurveTo(x,y+height,x+radius,y+height);
			  ctx.lineTo(x+width-radius,y+height);
			  ctx.quadraticCurveTo(x+width,y+height,x+width,y+height-radius);
			  ctx.lineTo(x+width,y+radius);
			  ctx.quadraticCurveTo(x+width,y,x+width-radius,y);
			  ctx.lineTo(x+radius,y);
			  ctx.quadraticCurveTo(x,y,x,y+radius);
			  ctx.stroke();
			}

			$scope.$watch('model', render, true);
		}
	};
}]);
