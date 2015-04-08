"use strict";

angular.module('associations.pages.game.components.pickGraph', [])

.constant("pickGraphSettings",{
	rowPadding: 15,
	wordBoxRadius: 10,
	wordBoxPadding: 10,
	wordStrokeStyle: "#fff",
	wordFillStyle: "#000",
	wordFont: "18px serif",
	wordFontHeight: 14, //needs to be measured :(
	wordLineWidth: 2
})
.directive("pickGraph", ["pickGraphSettings", "$window", function (pickGraphSettings, $window) {
	return {
		restrict: 'A',
		templateUrl: 'pages/game/components/pickGraph/pickGraph.html',
		scope: {
			model:'=graphModel'
		},
		link: function($scope, $element, attrs) {
			var canvas = $element.find('canvas')[0],
				canvasContext = canvas.getContext('2d');

			var w = angular.element($window),
			element = $element[0];

			// Browser onresize event
			w.bind('resize', function () {
				$scope.$apply();
			});

			// Watch for resize event
			$scope.$watch(function() {
				return {
					width: w[0].innerWidth,
					height: w[0].innerHeight
				};
			}, function() {
				canvas.width = $element[0].clientWidth;
				render();
			},true);

			var viewModel,
				createViewModel = function(){
					var vm = {
						picksArray: []
					};
					var picks = {},
						biggest = [];
					$scope.model.forEach(function(player){
						if (player.active) vm.active = player;
						if (!player.picks) return;

						if (player.picks.length > biggest.length) biggest = player.picks;
						player.picks.forEach(function (pick){
							if (!picks[pick.from]) picks[pick.from] = [];
							picks[pick.from].push({
								to: pick.to,
								normal: pick.normal,
								player: player
							});
						});
					});
					biggest.forEach(function(pick){
						vm.picksArray.push({
							from: pick.from,
							value: picks[pick.from]
						});
					});
					return vm;
				};

			var render = function(){
				updateModel();
				renderModel(canvasContext);
			};

			var updateModel = function(){
				if (!$scope.model) return;

				var newViewModel = createViewModel();
				if (viewModel) {
					if (newViewModel.picksArray.length > viewModel.picksArray.length){
						for (var i = viewModel.picksArray.length; i < newViewModel.picksArray.length; i++){
							//do some kind of animation
						}
					}
					if (viewModel.active !== newViewModel.active){

					}
				}
				viewModel = newViewModel;
			};

			var renderModel = function(ctx){
				ctx.save();

				var height = canvas.height = 0;
				viewModel.picksArray.forEach(function(pick){
					height += rowHeight(ctx, pick);
				});
				canvas.height = height;

				viewModel.picksArray.forEach(drawRow.bind(null,ctx));
				ctx.restore();
			};

			var rowHeight = function(ctx, pick){
				return pickGraphSettings.wordFontHeight + pickGraphSettings.wordBoxPadding * 2 + pickGraphSettings.rowPadding * 2;
			};

			var drawRow = function (ctx, pick){
				ctx.font = pickGraphSettings.wordFont;
				ctx.textBaseline = "hanging";

				var fromBox = textBox(ctx, pickGraphSettings.rowPadding*2,pickGraphSettings.rowPadding, pick.from, ctx.measureText(pick.from));

				pick.value.forEach(function(value){
					if (value.player === viewModel.active){
						var toMetrics = ctx.measureText(value.to),
							toBox = textBox(ctx, canvas.width - (toMetrics.width + pickGraphSettings.wordBoxPadding*2 + pickGraphSettings.rowPadding*2),pickGraphSettings.rowPadding, value.to, toMetrics);


						ctx.save();
						ctx.strokeStyle = ctx.fillStyle = value.player.color.hex;
						ctx.lineWidth = Math.min(value.normal ? 50 * value.normal : 2, pickGraphSettings.wordFontHeight);
						if (value.normal === 0){
							ctx.setLineDash([5, 15]);
						}

						drawArrow(ctx, fromBox.right, fromBox.top+fromBox.height/2, toBox.left, toBox.top+toBox.height/2, undefined, Math.max(20, ctx.lineWidth*5));
						ctx.restore();
					}
				});

				ctx.translate(0, rowHeight(ctx, pick));
			};

			var textBox = function(ctx, x, y, text, textMetrics){
				ctx.save();

				var rectWidth = textMetrics.width + pickGraphSettings.wordBoxPadding*2,
					rectHeight = pickGraphSettings.wordFontHeight + pickGraphSettings.wordBoxPadding*2;

				roundedRect(ctx, x,y,rectWidth,rectHeight);

				ctx.fillStyle = pickGraphSettings.wordStrokeStyle;
				ctx.fillText(text, x+pickGraphSettings.wordBoxPadding, y+pickGraphSettings.wordBoxPadding);

				ctx.restore();

				return {
					top:y,
					right:x + rectWidth + pickGraphSettings.wordLineWidth/2,
					bottom:y + rectHeight + pickGraphSettings.wordLineWidth/2,
					left: x,
					width: rectWidth + pickGraphSettings.wordLineWidth,
					height: rectHeight + pickGraphSettings.wordLineWidth
				};
			};

			var roundedRect = function(ctx, x, y, width, height) {
				var radius = pickGraphSettings.wordBoxRadius;

				ctx.save();

				ctx.strokeStyle = pickGraphSettings.wordStrokeStyle;
				ctx.fillStyle = pickGraphSettings.wordFillStyle;
				ctx.lineWidth = pickGraphSettings.wordLineWidth;

				ctx.beginPath();
				ctx.moveTo(x + radius, y);
				ctx.lineTo(x + width - radius, y);
				ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
				ctx.lineTo(x + width, y + height - radius);
				ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
				ctx.lineTo(x + radius, y + height);
				ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
				ctx.lineTo(x, y + radius);
				ctx.quadraticCurveTo(x, y, x + radius, y);
				ctx.closePath();

				ctx.fill();
				ctx.stroke();

				ctx.restore();
			};


			var drawHead = function(ctx, x0, y0, x1, y1, x2, y2) {
				ctx.beginPath();
				ctx.moveTo(x0, y0);
				ctx.lineTo(x1, y1);
				ctx.lineTo(x2, y2);

				//filled head, add the bottom as a quadraticCurveTo curve and fill
				var cpx = (x0 + x1 + x2) / 3;
				var cpy = (y0 + y1 + y2) / 3;
				ctx.quadraticCurveTo(cpx, cpy, x0, y0);
				ctx.fill();
			};

			var drawArrow = function(ctx, x1, y1, x2, y2, angle, d) {

				angle = typeof(angle) != 'undefined' ? angle : Math.PI / 8;
				d = typeof(d) != 'undefined' ? d : 10;

				// For ends with arrow we actually want to stop before we get to the arrow
				// so that wide lines won't put a flat end on the arrow.
				//
				var dist = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
				var ratio = (dist - d / 3) / dist;
				var tox, toy, fromx, fromy;

				tox = Math.round(x1 + (x2 - x1) * ratio);
				toy = Math.round(y1 + (y2 - y1) * ratio);

				fromx = x1;
				fromy = y1;

				// Draw the shaft of the arrow
				ctx.beginPath();
				ctx.moveTo(fromx, fromy);
				ctx.lineTo(tox, toy);
				ctx.stroke();

				// calculate the angle of the line
				var lineangle = Math.atan2(y2 - y1, x2 - x1);
				// h is the line length of a side of the arrow head
				var h = Math.abs(d / Math.cos(angle));

				var angle1, topx, topy, angle2, botx, boty;
				angle1 = lineangle + Math.PI + angle;
				topx = x2 + Math.cos(angle1) * h;
				topy = y2 + Math.sin(angle1) * h;
				angle2 = lineangle + Math.PI - angle;
				botx = x2 + Math.cos(angle2) * h;
				boty = y2 + Math.sin(angle2) * h;
				drawHead(ctx, topx, topy, x2, y2, botx, boty);
			};

			$scope.$watch('model', render, true);
		}
	};
}]);
