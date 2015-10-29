/**
 * @fileoverview main基础程序
 * @author dron
 * @date 2010-09-08
 */

void function(){
	/**
	 * configs
	 */
	var roadChangeCurveCoefficientRandomTimeoutMin = GlobalData.roadChangeCurveCoefficientRandomTimeoutMin;
	var roadChangeCurveCoefficientRandomTimeoutMax = GlobalData.roadChangeCurveCoefficientRandomTimeoutMax;
	var roadChangeCurveCoefficientRandomTimeoutDiff = roadChangeCurveCoefficientRandomTimeoutMax -
		roadChangeCurveCoefficientRandomTimeoutMin;
	var maxCurveCoefficient = GlobalData.maxCurveCoefficient;

	var smallCurveCoefficient = 150; // 小弯道界限
	var smallCurveCoefficientRandomNumber = 0.25; // 小弯道机率

	/**
	 * local variables
	 */
	var road = System.nameSpace("{systemName}.modules.road");
	var pathCacher = System.nameSpace("{systemName}.modules.pathCacher");
	var background = System.nameSpace("{systemName}.modules.background");
	var cover = System.nameSpace("{systemName}.modules.cover");
	var timer = System.nameSpace("{systemName}.modules.timer");
	var keymap = System.nameSpace("{systemName}.modules.keymap");
	var car = System.nameSpace("{systemName}.modules.car");
	var dashboard = System.nameSpace("{systemName}.modules.dashboard");
	var speed = System.nameSpace("{systemName}.modules.speed");
	var pause = System.nameSpace("{systemName}.modules.pause");
	var paddle = System.nameSpace("{systemName}.modules.paddle");

	/**
	 * module interface
	 */
	var module = System.nameSpace("{systemName}.modules.main", {

		initialize: function(){
			background.initialize();
			car.initialize();
			road.initialize();
			cover.initialize();
			dashboard.initialize();
			speed.initialize();
			pause.initialize();
			timer.initialize();

			loaderBar.done();
			// “树”的资源是给 vml 使用的，这里延迟，避免出现瞬间的红叉
			cover.showTree.defer(cover, 500);

			this.initPaddle();

		},

		// 加载摇杆
		initPaddle: function(){
			var container = System.getModuleContainer("paddle");
				container = Ucren.Element(container);

			var scene = new paddle.scene({
					container: container,
					width: 120,
					height: 120,
					pic: "images/paddle-scene.gif"
				});
				scene.render();

			var group = new paddle.dragGroup({ limit: 40, itemGlobalConf: { scene: scene } });
		//		group.createItem({ width: 44, height: 44, left: 38, top: 38, moveMultiples:     0, pic: "images/paddle-rods.png" }); // 这个不动的，也不用写
				group.createItem({ width: 44, height: 44, left: 38, top: 38, moveMultiples: 1 / 5, pic: "images/paddle-rods.png" });
				group.createItem({ width: 44, height: 44, left: 38, top: 38, moveMultiples: 2 / 5, pic: "images/paddle-rods.png" });
				group.createItem({ width: 44, height: 44, left: 38, top: 38, moveMultiples: 3 / 5, pic: "images/paddle-rods.png" });
		//		group.createItem({ width: 44, height: 44, left: 38, top: 38, moveMultiples: 4 / 5, pic: "images/paddle-rods.png" }); // 这个看不到
				group.createItem({ width: 78, height: 78, left: 21, top: 21, moveMultiples:     1, pic: "images/paddle-bar.gif", primary: true });

			keymap.initPaddle(group); // 将 group 挂到 keymap 上，在 keymap 上处理事件

			var paddleOption = Ucren.Element("paddle-option");

			var checkbox = Ucren.queryElement("input", paddleOption.dom)[0];
				checkbox = Ucren.Element(checkbox);

			var label = Ucren.queryElement("label", paddleOption.dom)[0];
				label = Ucren.Element(label);

			label.addEvents({
				click: function(){
					checkbox.dom.checked = !checkbox.dom.checked;
					container.display(checkbox.dom.checked);
				}
			});

			checkbox.addEvents({
				click: function(){
					container.display(checkbox.dom.checked);
				}
			});

			Ucren.loadImage([
				"images/paddle-bar.gif",
				"images/paddle-rods.png",
				"images/paddle-scene.gif"
			]);
		},

		// 自由模式
		freeMode: function(){
			keymap.initialize();
			cover.start();
			timer.start();

			/**
			 * 策略说明，备忘：
			 *
			 * + 小弯道指系数小于 smallCurveCoefficient 的弯道
			 * + 小弯道出现机率为 smallCurveCoefficientRandomNumber
			 * + 切换到小弯道完成后，等待 0 秒，进入下一次切换
			 * + 切换到大弯道或直道完成后，等待 randomTimeout 时间，进入下一次切换
			 * + 弯道、直道交替出现
			 *
			 */
			var randomCurveCoefficient;
			void function(){
//				randomCurveCoefficient = -200;
				if(randomCurveCoefficient){
					randomCurveCoefficient = 0;
				}else if(Math.random() > smallCurveCoefficientRandomNumber){ // 大弯道
					randomCurveCoefficient = (Ucren.randomNumber(maxCurveCoefficient - smallCurveCoefficient) + smallCurveCoefficient) * (Ucren.randomNumber(200) < 100 ? 1 : -1);
				}else{ // 小弯道
					randomCurveCoefficient = Ucren.randomNumber(smallCurveCoefficient) * (Ucren.randomNumber(200) < 100 ? 1 : -1);
				}

				var randomTimeout = Ucren.randomNumber(roadChangeCurveCoefficientRandomTimeoutDiff) + roadChangeCurveCoefficientRandomTimeoutMin;
				road.setTargetCurveCoefficient(randomCurveCoefficient, function(){
					setTimeout(this, randomCurveCoefficient < smallCurveCoefficientRandomNumber &&
						randomCurveCoefficient != 0 ? 0 : randomTimeout);
				}.bind(arguments.callee));
			}();

			GlobalData.started = true;
		}

//		test: function(){ // 路径缓存系统测试程序
//			road.draw(230);
//
//			var div = ["<div style='position: relative;'>"];
//			for(var i = 0; i < 100; i ++){
//				var x = pathCacher.getRoadXByY(i);
//				div.push("<div style='position: absolute; width: 1px; height: 1px; left: " +
//					x + "px; top: " +
//					i + "px; overflow: hidden; background: red;'></div>");
//			}
//			div.push("</div>");
//			setTimeout(function(){
//				document.body.innerHTML = div.join("");
//			}, 1000);
//		}

	});

	if(Ucren.isIe)
		document.execCommand("BackgroundImageCache", false, true);

	module.initialize();
	module.freeMode();

}();