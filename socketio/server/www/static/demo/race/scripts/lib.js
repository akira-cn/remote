/**
 * Ucren-Lite
 * FileName: boot.js
 * Author: Dron
 * Date: 2009-03-15
 * Contact: ucren.com
 */


var Ucren;
//
// [基本数据类型扩展]
//

// String.prototype.trim
String.prototype.trim = function(){
	return this.replace(/^\s+|\s+$/, "");
};

// String.prototype.format
String.prototype.format = function(conf){
	var rtn = this, blank = {};
	Ucren.each(conf, function(item, key){
		item = item.toString().replace(/\$/g, "$$$$");
		rtn = rtn.replace(RegExp("@{" + key + "}", "g"), item);
	});
	return rtn.toString();
};

// String.prototype.htmlEncode
String.prototype.htmlEncode = function(){
	var div = document.createElement("div");
	return function(){
		var text;
		div.appendChild(document.createTextNode(this));
		text = div.innerHTML;
		div.innerHTML = "";
		return text;
	};
}();

// String.prototype.byteLength
String.prototype.byteLength = function(){
	return this.replace(/[^\x00-\xff]/g, "--").length;
};

// String.prototype.subByte
String.prototype.subByte = function(len, tail){
	var s = this;
	if(s.byteLength() <= len)
		return s;
	tail = tail || "";
	len -= tail.byteLength();
	return s = s.slice(0, len).replace(/([^\x00-\xff])/g, "$1 ")
		.slice(0, len)
		.replace(/[^\x00-\xff]$/, "")
		.replace(/([^\x00-\xff]) /g, "$1") + tail;
}

// Function.prototype.defer
Function.prototype.defer = function(scope, timeout){
	var me = this;
	var fn = function(){
		me.apply(scope, arguments);
	};
	return setTimeout(fn, timeout);
};


// Function.prototype.bind
Function.prototype.bind = function(scope){
	var me = this;
	return function(){
		return me.apply(scope, arguments);
	}
};

// Function.prototype.pack
Function.prototype.pack = function(fn){
	var org = this;
	return function(){
		return fn.apply(org, arguments);
	};
};

// Function.prototype.saturate
Function.prototype.saturate = function(scope/*, args */){
	var fn = this;
	var args = Array.prototype.slice.call(arguments, 1);
	return function(){
		return fn.apply(scope, args);
	}
};

// Function.prototype.when
Function.prototype.when = function(cond){
	var f = function(x){
		if(x = cond()){
			clearInterval(f.timer);
			return this.call(this, x);
		}
	}.bind(this);
	f.timer = setInterval(f, 100);
};

// Function.prototype.condition
Function.prototype.condition = function(cond){
	var fn = this;
	return function(){
		if(cond.apply(this, arguments)){
			return fn.apply(this, arguments);
		}
	};
};

// Function.prototype.infrequently
Function.prototype.infrequently = function(interval){
	interval = interval || 100;
	var fn = this, last = null;
	return function(){
		var self = this, args = Array.prototype.slice.call(arguments, 0);
		start.call();
		function start(){
			var now = new Date, wait = interval - (now - last);
			if(wait > 0)
				return setTimeout(start, wait);
			last = now;
			fn.apply(self, args);
		}
	}
};

// Function.prototype.concatArguments
Function.prototype.concatArguments = function(scope/*, args */){
	var me = this;
	var outerArg = Array.prototype.slice.call(arguments, 1);
	return function(){
		var innerArg = Array.prototype.slice.call(arguments, 0);
		return me.apply(scope, innerArg.concat(outerArg));
	};
};

// Array.prototype.insertBefore
Array.prototype.insertBefore = function(index, value){
	this.splice(index, 0, value);
};

// Array.prototype.del
Array.prototype.del = function(index){
	this.splice(index, 1);
};

// Number.prototype.pad
Number.prototype.pad = function(length){
	var num = this.toString().split(".")[0];
	if(length - num.length > -1){
		return Array(length - num.length + 1).join("0") + num;
	}else{
		return num;
	}
};

Ucren = {

	//
	// [全局属性]
	//

	// Ucren.isIe
	isIe: /msie/i.test(navigator.userAgent),

	// Ucren.isIe6
	isIe6: /msie 6/i.test(navigator.userAgent),

	// Ucren.isFirefox
	isFirefox: /firefox/i.test(navigator.userAgent),

	// Ucren.isSafari
	isSafari: /safari/i.test(navigator.userAgent),

	// Ucren.isOpera
	isOpera: /opera/i.test(navigator.userAgent),

	// Ucren.isChrome
	isChrome: /chrome/i.test(navigator.userAgent), //todo isChrome = true, isSafari = true

	// Ucren.isStrict
	isStrict: document.compatMode == "CSS1Compat",

	// Ucren.tempDom
	tempDom: document.createElement("div"),

	//
	// [全局方法]
	//

	// Ucren.nul
	nul: function(){
		return false;
	},

	// Ucren.apply
	apply: function(form, to, except){
		if(!to)to = {};
		if(except){
			Ucren.each(form, function(item, key){
				if(key in except){
					return ;
				}
				to[key] = item;
			});
		}else{
			Ucren.each(form, function(item, key){
				to[key] = item;
			});
		}
		return to;
	},

	// Ucren.addEvent
	addEvent: function(target, name, fn){
		var call = function(){
			fn.apply(target, arguments);
		};
		if(target.dom){
			target = target.dom;
		}
		if(window.attachEvent){
			target.attachEvent("on" + name, call);
		}else if(window.addEventListener){
			target.addEventListener(name, call, false);
		}else{
			target["on" + name] = call;
		}
		return call;
	},

	// Ucren.delEvent
	delEvent: function(target, name, fn){
		if(window.detachEvent){
			target.detachEvent("on" + name, fn);
		}else if(window.removeEventListener){
			target.removeEventListener(name, fn, false);
		}else if(target["on" + name] == fn){
			target["on" + name] = null;
		}
	},

	// Ucren.getZIndex
	getZIndex: function(name){
		var callee = arguments.callee;
		switch(name){
			case "window":
				return callee.winIndex = ++ callee.winIndex || 10000;
			case "menu":
				return callee.menuIndex = ++ callee.menuIndex || 20000;
		}
	},

	// Ucren.Class
	Class: function(initialize, methods, befores, afters){
		var fn, prototype, blank;
		initialize = initialize || function(){};
		methods = methods || {};
		blank = {};
		fn = function(){
			this.instanceId = Ucren.id();
			initialize.apply(this, arguments);
		};
		prototype = fn.prototype;
		Ucren.registerClassEvent.call(prototype);
		Ucren.each(methods, function(item, key){
			prototype[key] = function(method, name){
				if(typeof(method) == "function"){
					return function(){
						var args, rtn;
						args = Array.prototype.slice.call(arguments, 0);
						if(befores &&
							befores.apply(this, [name].concat(args)) === false){
							return ;
						}
						this.fireEvent("before" + name, args);
						rtn = method.apply(this, args);
						if(afters)
							afters.apply(this, [name].concat(args));
						this.fireEvent(name, args);
						return rtn;
					};
				}else{
					return method;
				}
			}(item, key);
		});
		return fn;
	},

	//private
	registerClassEvent: function(){
		this.on = function(name, fn){
			var instanceId = this.instanceId;
			Ucren.dispatch(instanceId + name, fn.bind(this));
		};
		this.onbefore = function(name, fn){
			var instanceId = this.instanceId;
			Ucren.dispatch(instanceId + "before" + name, fn.bind(this));
		};
		this.un = function(name, fn){
			//todo
		};
		this.fireEvent = function(name, args){
			var instanceId = this.instanceId;
			Ucren.dispatch(instanceId + name, args);
		};
	},

	// Ucren.createLayer
	createLayer: function(){
		var create = function(){
			var layer = document.createElement("div");
			document.body.appendChild(layer);
			return layer;
		}
		return function(conf){
			var layer;
			conf = Ucren.fixConfig(conf);
			if(conf.id){
				if(layer = document.getElementById(conf.id)){
					return layer;
				}else{
					layer = create();
					layer.id = conf.id;
				}
			}else{
				layer = create();
			}
			return layer;
		};
	}(),

	// Ucren.createFuze
	createFuze: function(){
		var queue, fn, infire;
		queue = [];
		fn = function(process){
			if(infire){
				process();
			}else{
				queue.push(process);
			}
		};
		fn.fire = function(){
			while(queue.length){
				queue.shift()();
			}
			infire = true;
		};
		fn.extinguish = function(){
			infire = false;
		};
		fn.wettish = function(){
			this.fire();
			this.extinguish();
		};
		return fn;
	},

	// Ucren.createIf
	createIf: function(expressionFunction){
		return function(callback){
			var expression = expressionFunction();
			var returnValue = {
				Else: function(callback){
					callback = callback || nul;
					expression || callback();
				}
			};
			callback = callback || nul;
			expression && callback();
			return returnValue;
		};
	},

	// Ucren.dispatch
	dispatch: function(arg1, arg2, arg3){
		var fn, send, incept;

		if(typeof(arg2) == "undefined"){
			arg2 = [];
		}

		fn = arguments.callee;
		if(!fn.map){
			fn.map = {};
		}

		send = function(processId, args, scope){
			var map, processItems;
			map = fn.map;
			if(processItems = map[processId]){
				Ucren.each(processItems, function(item){
					item.apply(scope, args);
				});
			}
		};

		incept = function(processId, fun){
			var map;
			map = fn.map;
			if(!map[processId]){
				map[processId] = [];
			}
			map[processId].push(fun);
		};

		if(typeof(arg2) == "function"){
			incept.apply(this, arguments);
		}else if(arg2 instanceof Array){
			send.apply(this, arguments);
		}
	},

	// Ucren.fixNumber
	fixNumber: function(unknown, defaultValue){
		return typeof(unknown) == "number" ? unknown : defaultValue;
	},

	// Ucren.fixString
	fixString: function(unknown, defaultValue){
		return typeof(unknown) == "string" ? unknown : defaultValue;
	},

	// Ucren.fixConfig
	fixConfig: function(conf){
		var defaultConf;
		defaultConf = {};
		return typeof(conf) == "undefined" ? defaultConf : conf;
	},

	// Ucren.handle
	handle: function(unknown){
		var fn, type, number;
		fn = arguments.callee;
		if(!fn.cache){
			fn.cache = {};
		}
		if(typeof(fn.number) == "undefined"){
			fn.number = 0;
		}
		type = typeof(unknown);
		if(type == "number"){
			return fn.cache[unknown.toString()];
		}else if(type == "object" || type == "function"){
			number = fn.number ++;
			fn.cache[number.toString()] = unknown;
			return number;
		}
	},

	// Ucren.id
	id: function(){
		var id = arguments.callee;
		id.number = ++ id.number || 0;
		return "_" + id.number;
	},

	// Ucren.nameSpace
	nameSpace: function(path){
		if(typeof(path) == "string"){
			var parts, part, rtn;
			parts = path.split(".");
			rtn = window;
			while(parts.length){
				part = parts.shift();
				if(typeof(rtn[part]) != "object" &&
					typeof(rtn[part]) != "function"){
					rtn[part] = {};
				}
				rtn = rtn[part];
			}
			return rtn;
		}
	},

	// Ucren.queryString
	queryString: function(name, sourceString){
		var source, pattern, result;
		source = sourceString || location.href;
		pattern = new RegExp("(\\?|&)" + name + "=([^&#]*)(#|&|$)", "i");
		result = source.match(pattern);
		return result ? result[2] : "";
	},

	// Ucren.randomNumber
	randomNumber: function(num){
		return Math.floor(Math.random() * num);
	},

	// Ucren.randomWord
	randomWord: function(){
		var cw = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
		return function(length, sourceString){
			var words, re = [];
			words = sourceString || cw;
			Ucren.each(length, function(index){
				re[index] = words.charAt(this.randomNumber(words.length));
			}.bind(this));
			return re.join("");
		}
	}(),

	// Ucren.Element
	Element: function(el, returnDom){
		var rtn, handleId;
		if(el && el.isUcrenElement){
			return returnDom ? el.dom : el;
		}
		el = typeof(el) == "string" ? document.getElementById(el) : el;

		if(!el)
			return null;

		if(returnDom)
			return el;

		handleId = el.getAttribute("handleId");
		if(typeof handleId == "string"){
			return Ucren.handle(handleId - 0);
		}else{
			rtn = new Ucren.BasicElement(el);
			handleId = Ucren.handle(rtn);
			el.setAttribute("handleId", handleId + "");
			return rtn;
		}
	},

	// Ucren.Event
	Event: function(e){
		e = e || window.event;

		if(!e){
			var c = arguments.callee.caller;
			while(c){
				e = c.arguments[0];
				if(e && typeof(e.altKey) == "boolean"){ // duck typing
					break;
				}
				c = c.caller;
				e = null;
			}
		}

		return e;
	},

	// Ucren.each
	each: function(unknown, fn){
		if(unknown instanceof Array || (typeof unknown == "object" && unknown.length)){
			if(typeof unknown == "object" && Ucren.isSafari)
				unknown = Array.prototype.slice.call(unknown);
			for(var i = 0, l = unknown.length; i < l; i ++){
				if(fn(unknown[i], i) === false){
					break;
				}
			}
		}else if(typeof(unknown) == "object"){
			var blank = {};
			for(var i in unknown){
				if(blank[i]){
					continue;
				}
				if(fn(unknown[i], i) === false){
					break;
				}
			}
		}else if(typeof(unknown) == "number"){
			for(var i = 0; i < unknown; i ++){
				if(fn(i, i) === false){
					break;
				}
			}
		}else if(typeof(unknown) == "string"){
			for(var i = 0, l = unknown.length; i < l; i ++){
				if(fn(unknown.charAt(i), i) === false){
					break;
				}
			}
		}
	},

	// Ucren.request
	request: function(url, callback){
		request = Ucren.request;
		var xhr = request.xhr;
		if(!request.xhr){
			if(window.XMLHttpRequest){
				xhr = request.xhr = new XMLHttpRequest();
			}else{
				xhr = request.xhr = new ActiveXObject("Microsoft.XMLHTTP");
			}
		}
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4 && xhr.status == 200){
				callback(xhr.responseText);
			}
		};
		xhr.send(null);
	},

	// Ucren.loadImage
	loadImage: function(urls, onLoadComplete){
		var length = urls.length;
		var loaded = 0;
		var check = function(){
			if(loaded == length)
				onLoadComplete && onLoadComplete();
		};
		Ucren.each(urls, function(url){
			var img = document.createElement("img");
			img.onload = img.onerror = function(){
				this.onload = this.onerror = null;
				loaded ++;
				check();
			};
			Ucren.tempDom.appendChild(img);
			img.src = url;
		});
	},

	// Ucren.loadScript
	loadScript: function(){
		var extEval = function(code){
			code = code.replace(/for\((.*?); ?(.+?);\)\{/g, function(s, partA, partB){
				partA = partA || "i";
				return ["for(var ", partA, " = 0, _l = ", partB, "; ", partA, " < _l; ", partA, " ++){"].join("");
			});
			eval(code);
		};
		return function(src, callback){
			Ucren.request(src, function(text){
				extEval(text);
				callback && callback(text);
			});
		};
	}(),

	// Ucren.appendStyle
	appendStyle: function(text){
		var style;
		if(document.createStyleSheet){
			style = document.createStyleSheet();
			style.cssText = text;
		}else{
			style = document.createElement("style");
			style.type = "text/css";
			//style.innerHTML = text; fix Chrome bug
			style.appendChild(document.createTextNode(text));
			document.getElementsByTagName("head")[0].appendChild(style);
		}
	},

	// Ucren.toggle
	toggle: function(args){
		var map = {}, length;
		args = Array.prototype.slice.call(args, 0);
		length = args.length;
		Ucren.each(args, function(value, key){
			map[String(value)] = key;
		});
		return {
			getNext: function(value){
				var index = map[value] + 1;
				if(index == length)
					index = 0;
				return args[index];
			}
		};
	}
};

//
// [全局属性 2]
//

// Ucren.bootFilePath
Ucren.bootFilePath = function(){
	var script, src;
	script = document.getElementsByTagName("script");
	for(var i = 0, r, l = script.length; i < l; i ++){
		r = script[i];
		src = r.getAttribute("src");
		if(/boot\.js/i.test(src)){
			break;
		}
	}
	return src;
}();

// Ucren.appPath
Ucren.appPath = function(){
	var src, index;
	src = Ucren.bootFilePath;
	index = src.indexOf("?");
	if(index == -1){
		index = src.length;
	}
	src = src.slice(0, index - 7);
	return src;
}();

// Ucren.currentSkin
Ucren.currentSkin = function(){
	var skin;
	skin = Ucren.queryString("skin", Ucren.bootFilePath);
	return skin || "default";
}();

// Ucren.currentSkinPath
Ucren.currentSkinPath =
	Ucren.appPath + "resource/skins/" + Ucren.currentSkin + "/";

//
// [动画相关]
//

// Ucren.SimpleAnimation
Ucren.SimpleAnimation = Ucren.Class(
	/* constructor */ function(conf){
		conf = conf || {};

		var defaultFormula = function(start, end){
			var diff = end - start;
			var returnValue = start;
			if(diff){
				returnValue += diff > 0 ?
					Math.ceil(diff / 5) : Math.floor(diff / 5);
			}
			return returnValue;
		};

		this.formula = conf.formula || defaultFormula;
		this.value = conf.value || 0;
		this.callback = conf.callback || Ucren.nul;
		this.timeout = conf.timeout || 20;

		this.start = this.start.bind(this);
	},

	/* methods */ {
		setValue: function(value){
			this.targetValue = value;
			if(!this.timer)
				this.start();
		},

		//private
		start: function(){
			if(this.value != this.targetValue){
				this.value = this.formula(this.value, this.targetValue);
				this.callback(this.value);
				this.timer = setTimeout(this.start, this.timeout);
			}else{
				this.stop();
			}
		},

		//private
		stop: function(){
			clearTimeout(this.timer);
			this.timer = 0;
		}
	}
);

//
// [集中管理器]
//

// Ucren.MenuOperator
Ucren.MenuOperator = {
	cache: [],

	addInstance: function(item){
		this.cache.push(item);
	},

	hideAll: function(){
		var cache = this.cache;
		Ucren.each(cache, function(item, key){
			if(!item){
				return ;
			}
			if(typeof(item.hideMenu) == "function"){
				item.hideMenu();
				return ;
			}
			if(typeof(item.collapse) == "function"){
				item.collapse();
			}
		});
	}
};

//
// [底层操作类]
//

// Ucren.BasicDrag
Ucren.BasicDrag = Ucren.Class(
	/* constructor */ function(conf){
		conf = Ucren.fixConfig(conf);
		this.type = Ucren.fixString(conf.type, "normal");
	},

	/* methods */ {
		bind: function(el, handle){
			el = Ucren.Element(el);
			handle = Ucren.Element(handle) || el;
			handle.addEvents({
				mousedown: function(e){
					e = Ucren.Event(e);
					e.cancelBubble = true;
					e.stopPropagation && e.stopPropagation();
					this.startDrag();
					return e.returnValue = false;;
				}.bind(this)
			});
			this.target = el;
		},

		//private
		startDrag: function(){
			var target, draging, e;
			target = this.target;
			draging = target.draging = {};

			this.isDraging = true;

			draging.x = parseInt(target.getStyle("left"), 10) || 0;
			draging.y = parseInt(target.getStyle("top"), 10) || 0;

			e = Ucren.Event();
			draging.mouseX = e.clientX;
			draging.mouseY = e.clientY;

			this.registerDocumentEvent();
			this.createScope();
		},

		//private
		endDrag: function(){
			this.isDraging = false;
			this.unRegisterDocumentEvent();
			this.removeScope();
		},

		//private
		registerDocumentEvent: function(){
			var target, draging;
			target = this.target;
			draging = target.draging;

			draging.documentSelectStart =
				Ucren.addEvent(document, "selectstart", function(e){
					e = e || event;
					e.stopPropagation && e.stopPropagation();
					e.cancelBubble = true;
					return e.returnValue = false;
				});

			draging.documentMouseMove =
				Ucren.addEvent(document, "mousemove", function(e){
					var ie, nie;
					e = e || event;
					ie = Ucren.isIe && e.button != 1;
					nie = !Ucren.isIe && e.button != 0;
					if(ie || nie)
						this.endDrag();
					draging.newMouseX = e.clientX;
					draging.newMouseY = e.clientY;
				}.bind(this));

			draging.documentMouseUp =
				Ucren.addEvent(document, "mouseup", function(){
					this.endDrag();
				}.bind(this));

			draging.timer = setInterval(function(){
				var x, y, dx, dy;
				if(draging.newMouseX){
					dx = draging.newMouseX - draging.mouseX;
					dy = draging.newMouseY - draging.mouseY;
					x = draging.x + dx;
					y = draging.y + dy;
					if(this.type == "calc"){
						this.returnValue(dx, dy, x, y);
					}else{
						target.left(x).top(y);
					}
				}
			}.bind(this), 10);
		},

		//private
		unRegisterDocumentEvent: function(){
			var draging = this.target.draging;
			Ucren.delEvent(document, "mousemove", draging.documentMouseMove);
			Ucren.delEvent(document, "mouseup", draging.documentMouseUp);
			Ucren.delEvent(document, "selectstart",
				draging.documentSelectStart);
			clearInterval(draging.timer);
		},

		//private
		createScope: function(){
			var scope;
			scope = Ucren.createLayer({
				id: "ucrenlite-dragscope"
			});
			if(!scope.className){
				scope.className = "ucrenlite-dragscope";
				scope.onselectstart = function(){
					return false;
				};
			}
			scope.style.display = "block";
		},

		//private
		removeScope: function(){
			setTimeout(function(){
				var scope;
				scope = document.getElementById("ucrenlite-dragscope");
				if(scope){
					scope.style.display = "none";
				}
			}, 100);
		},

		//private
		returnValue: function(dx, dy){
			//todo something
		}
	}
);

// Ucren.DragDrop
Ucren.DragDrop = Ucren.Class(
	/* constructor */ function(conf){
		conf = Ucren.fixConfig(conf);
	},

	/* methods */ {
		bind: function(el, handle){
			el = Ucren.Element(el);
			handle = Ucren.Element(handle) || el;
			this.disposeDotted(el, handle);
			this.disposeDragDrop(el, handle);
			this.disposeEvents(el, handle);
		},

		//private
		disposeDotted: function(el, handle){
			var dotted;
			dotted = new Ucren.DottedBorder({
				left: parseInt(el.getStyle("left"), 10) || 0,
				top: parseInt(el.getStyle("top"), 10) || 0,
				width: el.width() || parseInt(el.getStyle("width"), 10) || 0,
				height: el.height() || parseInt(el.getStyle("height"), 10) || 0
			});
			dotted.render();
			this.dotted = dotted;
		},

		//private
		disposeDragDrop: function(el, handle){
			var dragdrop;
			dragdrop = new Ucren.BasicDrag({
				type: "calc"
			});
			dragdrop.bind(el, handle);
			this.dragdrop = dragdrop;
		},

		//private
		disposeEvents: function(el, handle){
			var ox, oy, dotted, dragdrop;
			dotted = this.dotted;
			dragdrop = this.dragdrop;
			handle.addEvents({
				mousedown: function(e){
					ox = dotted.left;
					oy = dotted.top;
					dotted.display(true);
					e = e || event;
					e.cancelBubble = true;
					e.stopPropagation && e.stopPropagation();
					return e.returnValue = false;
				}
			});
			dragdrop.on("returnValue", function(dx, dy){
				dotted.moveTo(ox + dx, oy + dy);
			});
			dragdrop.on("endDrag", function(){
				el.left(dotted.left).top(dotted.top);
				dotted.display(false);
			});
		}
	}
);

// Ucren.Template
Ucren.Template = Ucren.Class(
	/* constructor */ function(){
		this.string = Array.prototype.join.call(arguments, "");
	},

	/* methods */ {
		apply: function(conf){
			return this.string.format(conf);
		}
	}
);

// Ucren.BasicElement
Ucren.BasicElement = Ucren.Class(
	/* constructor */ function(el){
		this.dom = el;
	},

	/* methods */ {
		isUcrenElement: true,

		getStyle: function(){
			return Ucren.isIe ?

			function(name){
				return this.dom.currentStyle[name];
			} :

			function(name){
				var style;
				style = document.defaultView.getComputedStyle(this.dom, null);
				return style.getPropertyValue(name);
			};
		}(),

		setClass: function(name){
			if(typeof(name) == "string"){
				this.dom.className = name.trim();
			}
		},

		addClass: function(name){
			var el, className;
			el = this.dom;
			className = " " + el.className + " ";
			if(className.indexOf(" " + name + " ") == -1){
				className += name;
				el.className = className.trim();
			}
			return this;
		},

		delClass: function(name){
			var el, className;
			el = this.dom;
			className = " " + el.className + " ";
			if(className.indexOf(" " + name + " ") > -1){
				className = className.replace(" " + name + " ", " ");
				el.className = className.trim();
			}
			return this;
		},

		html: function(html){
			var el = this.dom;
			if(typeof(html) != "undefined"){
				el.innerHTML = html;
				return this;
			}else{
				return el.innerHTML;
			}
		},

		left: function(number){
			var el = this.dom;
			if(typeof(number) == "number"){
				el.style.left = number + "px";
				return this;
			}else{
				return this.getPos().x;
			}
		},

		top: function(number){
			var el = this.dom;
			if(typeof(number) == "number"){
				el.style.top = number + "px";
				return this;
			}else{
				return this.getPos().y;
			}
		},

		width: function(number){
			var el = this.dom;
			if(typeof(number) == "number"){
				el.style.width = number + "px";
				return this;
			}else{
				return el.clientWidth;
			}
		},

		height: function(number){
			var el = this.dom;
			if(typeof(number) == "number"){
				el.style.height = number + "px";
				return this;
			}else{
				return el.clientHeight;
			}
		},

		border: function(string){
			var el = this.dom;
			string = string || "0";
			el.style.border = string;
			return this;
		},

		lineHeight: function(number){
			var el = this.dom;
			number = Ucren.fixNumber(number, 0);
			el.style.lineHeight = number + "px";
			return this;
		},

		floatLeft: function(){
			var style = this.dom.style;
			style.cssFloat =
			style.styleFloat = "left";
		},

		absolute: function(){
			var style = this.dom.style;
			style.position = "absolute";
			style.left =
			style.top = "0px";
		},

		display: function(bool){
			var dom = this.dom;
			if(typeof(bool) == "boolean"){
				dom.style.display = bool ? "block" : "none";
			}else{
				return this.getStyle("display") != "none";
			}
		},

		first: function(){
			var c = this.dom.firstChild;
			while(c && !c.tagName && c.nextSibling){
				c = c.nextSibling;
			}
			return c;
		},

		add: function(dom){
			var el;
			el = Ucren.Element(dom);
			this.dom.appendChild(el.dom);
		},

		remove: function(){
			var el;
			el = Ucren.Element(dom);
			this.dom.removeChild(el.dom);
		},

		insert: function(dom){
			var tdom;
			tdom = this.dom;
			if(tdom.firstChild){
				tdom.insertBefore(dom, tdom.firstChild);
			}else{
				this.add(dom);
			}
		},

		addEvents: function(conf){
			var blank, el, rtn;
			blank = {};
			rtn = {};
			el = this.dom;
			Ucren.each(conf, function(item, key){
				rtn[key] = Ucren.addEvent(el, key, item);
			});
			return rtn;
		},

		delEvents: function(conf){
			var blank, el;
			blank = {};
			el = this.dom;
			Ucren.each(conf, function(item, key){
				Ucren.delEvent(el, key, item);
			});
		},

		getPos: function(){
			var el, parentNode, pos, box, offset;
			el = this.dom;
			pos = {};

			if(el.getBoundingClientRect){
				box = el.getBoundingClientRect();
				offset = Ucren.isIe ? 2 : 0;
				var doc = document;
				var scrollTop = Math.max(doc.documentElement.scrollTop,
					doc.body.scrollTop);
				var scrollLeft = Math.max(doc.documentElement.scrollLeft,
					doc.body.scrollLeft);
				return {
					x: box.left + scrollLeft - offset,
					y: box.top + scrollTop - offset
				};
			}else{
				pos = {
					x: el.offsetLeft,
					y: el.offsetTop
				};
				parentNode = el.offsetParent;
				if(parentNode != el){
					while(parentNode){
						pos.x += parentNode.offsetLeft;
						pos.y += parentNode.offsetTop;
						parentNode = parentNode.offsetParent;
					}
				}
				if(Ucren.isSafari && this.getStyle("position") == "absolute"){ // safari doubles in some cases
					pos.x -= document.body.offsetLeft;
					pos.y -= document.body.offsetTop;
				}
			}

			if(el.parentNode){
				parentNode = el.parentNode;
			}else{
				parentNode = null;
			}

			while(parentNode && parentNode.tagName.toUpperCase() != "BODY" &&
				parentNode.tagName.toUpperCase() != "HTML"){ // account for any scrolled ancestors
				pos.x -= parentNode.scrollLeft;
				pos.y -= parentNode.scrollTop;
				if(parentNode.parentNode){
					parentNode = parentNode.parentNode;
				}else{
					parentNode = null;
				}
			}

			return pos;
		},

		getSize: function(){
			var size, dom, width, height;
			size = {};
			dom = this.dom;
			width = this.getStyle("width");
			height = this.getStyle("height");

			if(width && width != "auto"){
				size.width = parseInt(width, 10);
			}else{
				size.width = dom.offsetWidth;
			}

			if(height && height != "auto"){
				size.height = parseInt(height, 10);
			}else{
				size.height = dom.offsetHeight;
			}

			return size;
		},

		observe: function(el, fn){
			el = Ucren.Element(el);
			el.on("resize", fn.bind(this));
		},

		usePNGbackground: function(image){
			var dom;
			dom = this.dom;
			if(/\.png$/i.test(image) && Ucren.isIe6){
				dom.style.filter =
					"progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" +
					image + "',sizingMethod='scale');";
			}else{
				dom.style.backgroundImage = "url(" + image + ")";
			}
		},

		formatCover: function(count){
			var result = [];
			this.addClass("ucrenlite-overlap");
			Ucren.each(count, function(index){
				var item = document.createElement("div");
				item.className = "cover";
				item.style.top = "-" + (index * 100) + "%";
				this.add(item);
				result.push(item);
			}.bind(this));
			return result;
		},

		setAlpha: function(n){
			var style = this.dom.style;
			if(Ucren.isIe)
				style.filter = "alpha(opacity=" + n + ")";
			else
				style.opacity = n / 100;
		},

		showIn: function(){
			var f = this.setAlpha.infrequently(10);
			for(var i = 0; i <= 100; i += 10)
				f.call(this, i);
		}
	}
);

// Ucren.DataStack
Ucren.DataStack = Ucren.Class(
	/* constructor */ function(conf){
		conf = Ucren.fixConfig(conf);
		this.fields = conf.fields || [];
		this.records = conf.records || [];
		this.go(0);
	},

	/* methods */ {
		go: function(number){
			this.pointer = Ucren.fixNumber(number, 0);
			this.currentRecord = this.records[this.pointer];
		},

		pos: function(name, value){
			Ucren.each(this.records, function(item, key){
				if(item[name] === value){
					this.go(i);
					return false;
				}
			}.bind(this));
		},

		load: function(records){
			this.records = records || [];
			this.go(0);
		},

		loadFromXml: function(file){
			//todo
		},

		read: function(unknown){
			var type = typeof(unknown);
			switch(type){
				case "number":
					return this.records[unknown];
					break;
				case "string":
					return this.currentRecord[unknown];
					break;
				default:
					return this.currentRecord;
					break;
			}
		},

		append: function(record){
			this.records.push(record);
		},

		insertBefore: function(index, record){
			this.records.insertBefore(index, record);
		},

		del: function(n){
			this.records.del(n);
			this.go(0);
		},

		edit: function(name, value){
			this.currentRecord[name] = value;
		},

		sortBy: function(name, type){
			type = Ucren.fixString(type, "asc");
			switch(type){
				case "asc":
					this.records.sort(function(a, b){
						return a[name] < b[name] ? -1 : 1;
					});
					break;
				case "desc":
					this.records.sort(function(a, b){
						return a[name] > b[name] ? -1 : 1;
					});
					break;
			}
		},

		count: function(){
			return this.records.length;
		},

		each: function(fn){
			Ucren.each(this.records, fn);
		}
	}
);

// Ucren.Timer
Ucren.Timer = Ucren.Class(
	/* constructor */ function(conf){
		conf = Ucren.fixConfig(conf);
		this.interval = Ucren.fixNumber(conf.interval, 100);
	},

	/* methods */ {
		start: function(){
			//private
			clearInterval(this.timer);
			this.timer = setInterval(this.fireEvent.saturate(this, "doing"),
				this.interval);
		},

		stop: function(){
			clearInterval(this.timer);
		}
	}
);

//
// [基础控件]
//

// Ucren.BasicColor
Ucren.BasicColor = Ucren.Class(
	/* constructor */ function(conf){
		conf = Ucren.fixConfig(conf);
		this.startColor = conf.startColor;
		this.endColor = conf.endColor;
		this.maxIndex = conf.maxIndex;
		this.cache = {};
	},

	/* methods */ {
		init: function(){
			this.startColor = this.decode(this.startColor);
			this.endColor = this.decode(this.endColor);
		},

		getColorByIndex: function(){
			var x = function(a, b, i, c){
				return a + Math.round((b - a) * (i / c));
			};

			return function(index){
				var red, green, blue, start, end, pc;

				if(this.cache[index]){
					return this.cache[index];
				}

				pc = this.maxIndex;
				start = this.startColor;
				end = this.endColor;

				var y = x.pack(function(a, b){
					return this.call(this, a, b, index, pc);
				});

				red = y(start.red, end.red);
				green = y(start.green, end.green);
				blue = y(start.blue, end.blue);

				y = this.encode({
					red: red,
					green: green,
					blue: blue
				});

				return this.cache[index] = y;
			}
		}(),

		//private
		decode: function(){
			var r = /^\#?(\w{2})(\w{2})(\w{2})$/;
			var x = function(x){
				return parseInt(x, 16);
			};
			return function(color){
				r.test(color);
				return {
					red: x(RegExp.$1),
					green: x(RegExp.$2),
					blue: x(RegExp.$3)
				};
			}
		}(),

		//private
		encode: function(){
			var x = function(x){
				return x.toString(16);
			};
			x = x.pack(function(x){
				x = this.call(this, x);
				if(x.length == 1){
					return "0" + x;
				}else{
					return x;
				}
			});
			return function(data){
				return ["#", x(data.red), x(data.green), x(data.blue)].join("");
			}
		}()
	}
);

// Ucren.BasicLayer
Ucren.BasicLayer = Ucren.Class(
	/* constructor */ function(conf){
		conf = Ucren.fixConfig(conf);
		this.container = Ucren.Element(conf.container);
		this.type = Ucren.fixString(conf.type, "thickboard").toLowerCase();
		this.width = Ucren.fixNumber(conf.width, 100);
		this.height = Ucren.fixNumber(conf.height, 100);
		this.outsideId = Ucren.id();
		this.insideId = Ucren.id();
		this.mainboardId = Ucren.id();
		this.innerElement = Ucren.Element(conf.innerElement);
	},

	/* methods */ {
		render: function(){
			var container, html, firstdom, mainboard;
			container = this.container;
			html = Ucren.BasicLayer.template.apply({
				outsideId: this.outsideId,
				insideId: this.insideId,
				mainboardId: this.mainboardId
			});

			if(firstdom = container.first()){
				Ucren.tempDom.appendChild(firstdom);
			}

			container.html(html);
			mainboard = Ucren.Element(this.mainboardId);

			if(firstdom){
				mainboard.add(firstdom);
				firstdom.className += " ucrenlite-basiclayer-mainboard-inner";

				//private
				this.innerElement = Ucren.Element(firstdom);
			}else if(this.innerElement){
				mainboard.add(this.innerElement);
				this.innerElement.addClass("ucrenlite-basiclayer-mainboard-inner");
			}

			this.outside = Ucren.Element(this.outsideId);
			this.inside = Ucren.Element(this.insideId);
			this.mainboard = Ucren.Element(this.mainboardId);
			this.changeType(this.type);
			this.adjustSize();
		},

		adjustSize: function(){
			this.outside.width(this.width - 2).height(this.height - 2);
			this.inside.width(this.width - 4).height(this.height - 4);
			this.mainboard.width(this.width - 4).height(this.height - 4);
		},

		changeType: function(name){
			name = name || this.type;
			this.outside.setClass("ucrenlite-basiclayer-border-outside ucrenlite-basiclayer-border-outside_" + name);
			this.inside.setClass("ucrenlite-basiclayer-border-inside ucrenlite-basiclayer-border-inside_" + name);
			this.mainboard.setClass("ucrenlite-basiclayer-mainboard ucrenlite-basiclayer-mainboard_" + name);
		},

		resizeTo: function(width, height){
			this.width = Ucren.fixNumber(width, 4);
			this.height = Ucren.fixNumber(height, 4);
			this.adjustSize();
		}
	}
);

Ucren.BasicLayer.template = new Ucren.Template(
	"<div id='@{outsideId}'>",
		"<div id='@{insideId}'>",
			"<div id='@{mainboardId}'>",
			"</div>",
		"</div>",
	"</div>");

// Ucren.ComplexLayer
Ucren.ComplexLayer = Ucren.Class(
	/* constructor */ function(conf){
		conf = Ucren.fixConfig(conf);
		this.layer = new Ucren.BasicLayer(conf);
		this.events = conf.events;
		this.eventScope = Ucren.Element(conf.eventScope);
		this.disabled = !! conf.disabled;
	},

	/* methods */ {
		render: function(){
			this.layer.render();
			this.registerEvents();
		},

		disabledEvents: function(bool){
			this.disabled = !! bool;
		},

		registerEvents: function(){
			var scope, events;
			scope = this.eventScope;
			events = this.events;

			var callEvent = function(fn, thiz){
				return function(){
					if(thiz.disabled){
						return false;
					}
					return fn.apply(thiz, arguments);
				}
			};

			if(scope && events){
				Ucren.each(events, function(value, key){
					events[key] = callEvent(value, this);
				}.bind(this));
				scope.addEvents(events);
			}
		}
	}
);

// Ucren.DottedBorder
Ucren.DottedBorder = Ucren.Class(
	/* constructor */ function(conf){
		conf = Ucren.fixConfig(conf);
		this.width = Ucren.fixNumber(conf.width, 100);
		this.height = Ucren.fixNumber(conf.height, 100);
		this.left = Ucren.fixNumber(conf.left, 0);
		this.top = Ucren.fixNumber(conf.top, 0);
		this.visible = false;
	},

	/* methods */ {
		render: function(){
			var layer, html;
			layer = Ucren.createLayer();
			layer = Ucren.Element(layer);
			layer.setClass("ucrenlite-dottedborder-outer");
			this.widthId = Ucren.id();
			this.heightId = Ucren.id();
			html = Ucren.DottedBorder.template.apply({
				widthId: this.widthId,
				heightId: this.heightId,
				width: this.width - 8,
				height: this.height - 8
			});
			layer.html(html);
			layer.left(this.left).top(this.top);
			this.layer = layer;
		},

		resizeTo: function(w, h){
			var wel, hel;
			this.width = w;
			this.height = h;
			wel = Ucren.Element(this.widthId);
			hel = Ucren.Element(this.heightId);
			wel.width(w - 8);
			hel.height(h - 8);
		},

		moveTo: function(l, t){
			this.left = l;
			this.top = t;
			this.layer.left(l).top(t);
		},

		display: function(bool){
			this.visible = bool;
			this.layer.display(bool);
		}
	}
);

Ucren.DottedBorder.template = new Ucren.Template(
	"<table cellspacing='0' cellpadding='0' class='ucrenlite-dottedborder-table'>",
		"<tr>",
			"<td class='border' width='4' height='4'></td>",
			"<td class='border' width='@{width}' id='@{widthId}'></td>",
			"<td class='border' width='4'></td>",
		"</tr>",
		"<tr>",
			"<td class='border' height='@{height}' id='@{heightId}'></td>",
			"<td></td>",
			"<td class='border'></td>",
		"</tr>",
		"<tr>",
			"<td class='border' height='4'></td>",
			"<td class='border'></td>",
			"<td class='border'></td>",
		"</tr>",
	"</table>");

// Ucren.BasicSlippage
Ucren.BasicSlippage = Ucren.Class(
	/* constructor */ function(conf){
		conf = Ucren.fixConfig(conf);
		this.container = Ucren.Element(conf.container);
		this.width = Ucren.fixNumber(conf.width, 16);
		this.height = Ucren.fixNumber(conf.height, 16);
		this.image = conf.image;
		this.length = Ucren.fixNumber(conf.length, 1);
		this.direction = Ucren.fixString(conf.direction, "vertical");
		this.position =
		this.defaultPosition = Ucren.fixNumber(conf.defaultPosition, 0);
		this.reviseOffset = Ucren.fixNumber(conf.reviseOffset, 0);

		this.loadingBackgroundColor = Ucren.fixString(conf.loadingBackgroundColor, "");
		this.loadingColor = Ucren.fixString(conf.loadingColor, "");
		this.loadingText = Ucren.fixString(conf.loadingText, "");

		this.enableAnimation = !! conf.enableAnimation;
		this.animationInterval = Ucren.fixNumber(conf.animationInterval, 100);

		this.isVertical = this.direction == "vertical";
		this.isHorizontal = this.direction == "horizontal";
	},

	/* methods */ {
		render: function(){
			var html, innerWidth, innerHeight;
			this.layerId = Ucren.id();
			this.innerId = Ucren.id();
			if(this.isVertical){
				innerWidth = this.width;
				innerHeight = this.height * this.length;
			}else if(this.isHorizontal){
				innerWidth = this.width * this.length;
				innerHeight = this.height;
			}
			html = Ucren.BasicSlippage.template.apply({
				layerId: this.layerId,
				innerId: this.innerId,
				width: this.width,
				height: this.height,
				innerWidth: innerWidth,
				innerHeight: innerHeight,
				loadingText: this.loadingText
			});
			this.container.html(html);
			this.layer = Ucren.Element(this.layerId);
			this.inner = Ucren.Element(this.innerId);
			this.change(this.defaultPosition);
			this.offset();

			var innerStyle = this.inner.dom.style;
				innerStyle.backgroundColor = this.loadingBackgroundColor;
				innerStyle.color = this.loadingColor;
				innerStyle.lineHeight = this.height + "px";

			this.inner.html(this.loadingText);

			Ucren.loadImage([this.image], function(){
				this.inner.dom.style.backgroundColor = "";
				this.inner.html("");
				this.inner.usePNGbackground(this.image);
			}.bind(this));

			if(this.enableAnimation){
				this.disposeAnimation();
			}
		},

		change: function(number){
			var style;
			style = this.inner.dom.style;
			number = Ucren.fixNumber(number, 0);
			this.position = number;
			if(this.isVertical){
				style.marginTop = - this.height * number + "px";
			}else if(this.isHorizontal){
				style.marginLeft = - this.width * number + "px";
			}
		},

		animationTo: function(number){
			var timer;
			number = Ucren.fixNumber(number, 0);
			timer = this.timer;
			timer.stop();
			this.targetPosition = number;
			timer.start();
		},

		//private
		offset: function(){
			if(!this.reviseOffset){
				return false;
			}
			if(this.isVertical){
				this.inner.width(this.width * (this.reviseOffset + 1));
			}else if(this.isHorizontal){
				this.inner.height(this.height * (this.reviseOffset + 1));
			}
			this.reverseDirection();
			this.change(this.reviseOffset);
			this.reverseDirection();
		},

		//private
		reverseDirection: function(){
			this.isVertical = !this.isVertical;
			this.isHorizontal = !this.isHorizontal;
		},

		//private
		disposeAnimation: function(){
			var timer =
			this.timer = new Ucren.Timer({
				interval: this.animationInterval
			});
			this.targetPosition = 0;
			timer.on("doing", function(){
				var position;
				if(this.position < this.targetPosition){
					position = this.position + 1;
				}else if(this.position > this.targetPosition){
					position = this.position - 1;
				}else{
					return timer.stop();
				}
				this.change(position);
			}.bind(this));
		}
	}
);

Ucren.BasicSlippage.template = new Ucren.Template(
	"<div id='@{layerId}' class='ucrenlite-basicslippage-layer' ",
	"style='width: @{width}px; height: @{height}px;'>",
		"<a id='@{innerId}' class='ucrenlite-basicslippage-inner' href='ucren:' onclick='return false;' hidefocus='hidefocus' onfocus='this.blur();' ",
		"style='width: @{innerWidth}px; height: @{innerHeight}px;'>",
			"@{loadingText}",
		"</a>",
	"</div>");

// Ucren.BasicMenuLayer
Ucren.BasicMenuLayer = Ucren.Class(
	/* constructor */ function(conf){
		conf = Ucren.fixConfig(conf);
		this.target = Ucren.Element(conf.target);
		this.direction = Ucren.fixString(conf.direction, "down");
		this.autoAdjustPosition = !! conf.autoAdjustPosition;
		this.width = Ucren.fixNumber(conf.width, 100);
		this.height = Ucren.fixNumber(conf.height, 100);
		this.style = Ucren.fixString(conf.style, "thickboard");
		this.innerElement = Ucren.Element(conf.innerElement);
	},

	/* methods */ {
		render: function(){
			var container = Ucren.createLayer();
			container.className = "ucrenlite-basicmenulayer-container";

			var layer = new Ucren.BasicLayer({
				container: container,
				type: this.style,
				width: this.width,
				height: this.height,
				innerElement: this.innerElement
			});
			layer.render();

			this.container = Ucren.Element(container);
			this.layer = layer;

			this.adjustPosition();
		},

		show: function(){
			this.visible = true;
			this.container.display(true);
		},

		hide: function(){
			this.visible = false;
			this.container.display(false);
		},

		isVisible: function(){
			return !!this.visible;
		},

		//private
		adjustPosition: function(){
			var target, container, pos, size, body;
			target = this.target;
			container = this.container;
			pos = target.getPos();
			size = target.getSize();
			body = document.body;

			switch(this.direction){
				case "right":
					pos.x += size.width;
					break;
				case "down":
					pos.y += size.height;
					break;
			}

			if(this.autoAdjustPosition){
				if(this.width + pos.x > body.clientWidth){
					if(this.direction == "down"){
						pos.x = body.clientWidth - this.width;
					}else{
						pos.x -= this.width + size.width;
					}
				}
				if(this.height + pos.y > body.clientHeight){
					pos.y -= this.height + size.height;
				}
			};

			container.left(pos.x).top(pos.y);
		}
	}
);

//
// [表单控件]
//

// Ucren.Button
Ucren.Button = Ucren.Class(
	/* constructor */ function(conf){
		conf = Ucren.fixConfig(conf);
		this.container = Ucren.Element(conf.container);
		this.width = Ucren.fixNumber(conf.width, 50);
		this.caption = Ucren.fixString(conf.caption, "no name");
		this.disabled = !! conf.disabled;
	},

	/* methods */ {
		render: function(){
			var layer;
			this.buildBasicHtml();
			layer = this.layer = new Ucren.ComplexLayer({
				container: this.focusBorder,
				type: "thickboard",
				width: this.width,
				height: 22,
				events: this.buildEvent(),
				eventScope: this.eventScope
			});
			layer.render();
			this.setCaption(this.caption);
			if(this.disabled){
				this.setDisabled(this.disabled);
			}
		},

		setCaption: function(string){
			this.caption = Ucren.fixString(string, "");
			this.eventScope.html(this.caption);
		},

		setDisabled: function(bool){
			bool = !! bool;
			this.disabled = bool;
			this.layer.disabledEvents(bool);
			if(bool){
				this.eventScope.addClass("ucrenlite-button-eventscope_disabled");
			}else{
				this.eventScope.delClass("ucrenlite-button-eventscope_disabled");
			}
		},

		//private
		buildBasicHtml: function(){
			var template, html;
			template = Ucren.Button.template;
			this.focusBorderId = Ucren.id();
			this.eventScopeId = Ucren.id();
			html = template.apply({
				focusBorderId: this.focusBorderId,
				eventScopeId: this.eventScopeId
			});
			this.container.html(html);
			this.focusBorder = Ucren.Element(this.focusBorderId);
			this.eventScope = Ucren.Element(this.eventScopeId);
			this.focusBorder.width(this.width);
		},

		//private
		buildEvent: function(){
			var rtn;
			rtn = {
				click: function(e){
					this.fireEvent("click");
				}.bind(this),

				mousedown: function(e){
					this.layer.changeType("buttondown");
					this.documentMouseup = Ucren.addEvent(document, "mouseup", function(){
						this.layer.changeType();
						Ucren.delEvent(document, "mouseup", this.documentMouseup);
					}.bind(this));
				},

				mouseout: function(e){
					this.layer.changeType();
				},

				keydown: function(e){
					e = e || event;
					if(e.keyCode == 32){
						this.layer.changeType("buttondown");
					}
				},

				keyup: function(e){
					e = e || event;
					if(e.keyCode == 32){
						this.layer.changeType();
					}
				},

				focus: function(){
					var focusBorder, eventScope;
					this.layer.layer.resizeTo(this.width - 2, 20);
					focusBorder = this.focusBorder;
					eventScope = this.eventScope;
					focusBorder.width(this.width - 2).height(20).border("1px solid").
						addClass("ucrenlite-button-focusborder_focus");
					eventScope.width(this.width - 6).height(16).lineHeight(16);
					this.fireEvent("focus");
				}.bind(this),

				blur: function(){
					var focusBorder, eventScope;
					this.layer.layer.resizeTo(this.width, 22);
					focusBorder = this.focusBorder;
					eventScope = this.eventScope;
					focusBorder.width(this.width).height(22).border("0").
						delClass("ucrenlite-button-focusborder_focus");
					eventScope.width(this.width - 4).height(18).lineHeight(18);
					this.fireEvent("blur");
				}.bind(this)
			};
			return rtn;
		}
	}
);

Ucren.Button.template = new Ucren.Template(
	"<div id='@{focusBorderId}' class='ucrenlite-button-focusborder'>",
		"<a href='' id='@{eventScopeId}' onclick='return false;' ondragstart='return false' class='ucrenlite-button-eventscope'>",
			"@{name}",
		"</a>",
	"</div>");

// Ucren.MiniButton
Ucren.MiniButton = Ucren.Class(
	/* constructor */ function(conf){
		conf = Ucren.fixConfig(conf);
		this.container = Ucren.Element(conf.container);
		this.type = Ucren.fixString(conf.type, "normal");
		this.icon = Ucren.fixString(conf.icon, "");
		this.width = Ucren.fixNumber(conf.width, 20);
		this.height = Ucren.fixNumber(conf.height, 20);
		this.value = !! conf.value;
		this.handler = conf.handler || Ucren.nul;
		this.disabled = conf.disabled;
	},

	/* methods */ {
		render: function(){
			var html, type;

			type = this.type;
			html = Ucren.MiniButton.Template.apply({
				innerId: this.innerId = Ucren.id(),
				innerWidth: this.width - 4,
				innerHeight: this.height - 4
			});
			this.container.html(html);
			this.inner = Ucren.Element(this.innerId);
			this.inner.dom.style.backgroundImage = "url(" + this.icon + ")";

			if(type == "normal"){
				this.renderCommon();
			}else if(type == "flat"){
				this.renderCommon("flat");
			}else if(type == "autoFlat"){
				this.renderAutoFlat();
			}else if(type == "autoFlatRecord"){
				this.renderAutoFlatRecord();
			}
		},

		//private
		renderCommon: function(renderType){
			var layer, type, typedown;

			if(renderType == "flat"){
				type = "thinboard";
				typedown = "thinpond";
				this.inner.addClass("ucrenlite-minibutton-inner_thin");
			}else{
				type = "thickboard";
				typedown = "thickpond";
			}

			layer = new Ucren.ComplexLayer({
				container: this.container,
				type: type,
				width: this.width,
				height: this.height,
				disabled: this.disabled,
				events: {
					mousedown: function(e){
						this.layer.changeType(typedown);
						e = e || event;
						e.cancelBubble = true;
						return false;
					},

					mouseup: function(){
						this.layer.changeType();
					},

					mouseout: function(){
						this.layer.changeType();
					},

					click: function(){
						this.handler();
					}.bind(this)
				},
				eventScope: this.inner
			});
			layer.render();

			this.layer = layer;
		},

		//private
		renderAutoFlat: function(){
			var layer, type, typeover, typedown;

			type = "normal";
			typeover = "thinboard"
			typedown = "thinpond";
			this.inner.addClass("ucrenlite-minibutton-inner_thin");

			layer = new Ucren.ComplexLayer({
				container: this.container,
				type: type,
				width: this.width,
				height: this.height,
				disabled: this.disabled,
				events: {
					mouseover: function(){
						this.layer.changeType(typeover);
					},

					mousedown: function(e){
						this.layer.changeType(typedown);
						e = e || event;
						e.cancelBubble = true;
						return false;
					},

					mouseup: function(){
						this.layer.changeType(typeover);
					},

					mouseout: function(){
						this.layer.changeType();
					},

					click: function(){
						this.handler();
					}.bind(this)
				},
				eventScope: this.inner
			});
			layer.render();

			this.layer = layer;
		},

		//privates
		renderAutoFlatRecord: function(){
			var layer, type, typeover, typedown, value;

			value = this.value;

			type = value ? "thinpond" : "normal";
			typeover = "thinboard"
			typedown = "thinpond";
			this.inner.addClass("ucrenlite-minibutton-inner_thin");


			layer = new Ucren.ComplexLayer({
				container: this.container,
				type: type,
				width: this.width,
				height: this.height,
				disabled: this.disabled,
				events: {
					mouseover: function(){
						if(!value){
							this.layer.changeType(typeover);
						}
					},

					mousedown: function(e){
						if(value){
							this.layer.changeType(typeover);
							value = false;
						}else{
							this.layer.changeType(typedown);
							value = true;
						}
						e = e || event;
						e.cancelBubble = true;
						return false;
					},

					mouseup: function(){
						if(!value){
							this.layer.changeType(typeover);
						}
					},

					mouseout: function(){
						if(!value){
							this.layer.changeType("normal");
						}
					},

					click: function(){
						this.handler();
					}.bind(this)
				},
				eventScope: this.inner
			});
			layer.render();

			this.layer = layer;
		}
	}
);
Ucren.MiniButton.Template = new Ucren.Template(
	"<div class='ucrenlite-minibutton-inner' id='@{innerId}' ",
	"style='width: @{innerWidth}px; height: @{innerHeight}px;'>&nbsp;</div>");

// Ucren.TextField
Ucren.TextField = Ucren.Class(
	/* constructor */ function(conf){
		conf = Ucren.fixConfig(conf);
		this.container = Ucren.Element(conf.container);
		this.width = Ucren.fixNumber(conf.width, 50);
		this.height = Ucren.fixNumber(conf.height, 94); //only for type 'textarea'
		this.value = Ucren.fixString(conf.value, "");
		this.type = Ucren.fixString(conf.type, "text");
		this.disabled = !! conf.disabled;
	},

	/* methods */ {
		render: function(){
			var layer;
			this.buildBasicHtml();
			layer = this.layer = new Ucren.ComplexLayer({
				container: this.container,
				width: this.width,
				height: this.type == "textarea" ? this.height : 22,
				type: "thickpond",
				events: this.buildEvent(),
				eventScope: this.eventScope
			});
			layer.render();
			if(this.disabled){
				this.setDisabled(this.disabled);
			}
		},

		setDisabled: function(bool){
			var eventScope = this.eventScope;
			bool = !! bool;
			this.disabled = bool;
			eventScope.dom.disabled = bool;
			if(bool){
				eventScope.addClass("ucrenlite-textfield-eventscope_disabled");
			}else{
				eventScope.delClass("ucrenlite-textfield-eventscope_disabled");
			}
		},

		focus: function(){
			try{
				this.eventScope.dom.focus();
			}catch(e){
			}
		},

		setValue: function(value){
			value = Ucren.fixString(value, "");
			this.eventScope.dom.value = value;
		},

		getValue: function(){
			return this.eventScope.dom.value;
		},

		//private
		buildBasicHtml: function(){
			var html, template;
			this.eventScopeId = Ucren.id();

			if(this.type == "textarea"){
				template = Ucren.TextField.templateForTextarea;
			}else{
				template = Ucren.TextField.templateForText;
			}

			html = template.apply({
				eventScopeId: this.eventScopeId,
				value: this.value,
				type: this.type
			});

			this.container.html(html);
			this.eventScope = Ucren.Element(this.eventScopeId);

			if(this.type == "textarea"){
				this.eventScope.width(this.width - (Ucren.isFirefox ? 5 : 6));
				this.eventScope.height(this.height - (Ucren.isFirefox ? 4 : 6));
			}else{
				this.eventScope.width(this.width - 4);
			}
		},

		//private
		buildEvent: function(){
			var rtn;
			rtn = {
				focus: function(){
					this.eventScope.dom.select();
				}.bind(this)
			};
			return rtn;
		}
	}
);

Ucren.TextField.templateForText = new Ucren.Template(
	"<input type='@{type}' id='@{eventScopeId}' value='@{value}' class='ucrenlite-textfield-eventscope' />");

Ucren.TextField.templateForTextarea = new Ucren.Template(
	"<textarea id='@{eventScopeId}' class='ucrenlite-textfield-eventscope ucrenlite-textfield-eventscope_textarea'>@{value}</textarea>");

// Ucren.Chooser
Ucren.Chooser = Ucren.Class(
	/* constructor */ function(conf){
		conf = Ucren.fixConfig(conf);
		this.type = Ucren.fixString(conf.type, "checkbox");
		this.caption = Ucren.fixString(conf.caption, "");
		this.container = Ucren.Element(conf.container);
		this.checked = !! conf.checked;
		this.disabled = !! conf.disabled;
	},

	/* methods */ {
		render: function(){
			var position, offset, slippage;

			position = this.getSlippagePosition();
			if(this.type == "checkbox"){
				offset = 0;
			}else if(this.type == "radio"){
				offset = 1;
			}

			slippage = this.slippage = new Ucren.BasicSlippage({
				container: this.container,
				width: 13,
				height: 13,
				image: Ucren.currentSkinPath + "chooseor.gif",
				length: 4,
				direction: "vertical",
				defaultPosition: position,
				reviseOffset: offset
			});
			slippage.render();

			this.eventScope = slippage.layer;
			this.renderName();
			this.registerEvents();
		},

		setValue: function(bool){
			return this.setChecked(bool);
		},

		getValue: function(){
			return this.checked;
		},

		setChecked: function(bool){
			var slippage;
			slippage = this.slippage;
			this.checked = !!bool;
			slippage.change(this.getSlippagePosition());
		},

		setDisabled: function(bool){
			var slippage;
			slippage = this.slippage;
			this.disabled = !!bool;
			slippage.change(this.getSlippagePosition());
		},

		setCaption: function(name){
			name = Ucren.fixString(name, "");
			this.caption.html(name);
		},

		//private
		renderName: function(){
			var a, aid;
			this.eventScope.floatLeft();
			this.eventScope.dom.style.marginRight = "5px";
			a = document.createElement("a");
			aid = Ucren.id();
			a.setAttribute("href", "");
			a.setAttribute("id", aid);
			a.className = "ucrenlite-chooser-name";
			a.onclick = Ucren.nul;
			a.innerHTML = this.caption;
			this.container.add(a);
			this.caption = Ucren.Element(aid);
		},

		//private
		getSlippagePosition: function(){
			var checked, disabled;
			checked = this.checked;
			disabled = this.disabled;
			switch(true){
				case !checked && !disabled:
					return 0;
				case checked && !disabled:
					return 1;
				case !checked && disabled:
					return 2;
				case checked && disabled:
					return 3;
			}
		},

		//private
		registerEvents: function(){
			var events;
			events = {
				click: function(){
					if(this.disabled){
						return false;
					}
					if(this.type == "radio" && this.checked){
						return ;
					}
					this.setChecked(!this.checked);
				}.bind(this)
			};
			this.eventScope.addEvents(events);
			this.caption.addEvents(events);
		}
	}
);

// Ucren.ChooserGroup
Ucren.ChooserGroup = Ucren.Class(
	/* constructor */ function(conf){
		conf = Ucren.fixConfig(conf);
		this.type = Ucren.fixString(conf.type, "checkbox");
		this.metaData = conf.metaData; // [{ caption, container, checked, disabled, value },{..},{..}]
	},

	/* methods */ {
		render: function(){
			var items, item, metaData;
			items = this.items = [];
			metaData = this.metaData;

			Ucren.each(metaData, function(value, key){
				var r = Ucren.apply(value);
				r.type = this.type;
				item = items[key] = new Ucren.Chooser(r);
				item.render();
				item.on("setChecked", function(thiz, index){
					return function(bool){
						thiz.onSetItemChecked(index, bool);
					};
				}(this, key));
			}.bind(this));
		},

		getValue: function(){
			var items, metaData, rtn;
			items = this.items;
			metaData = this.metaData;
			rtn = [];
			Ucren.each(items, function(item, key){
				var value;
				if(item.checked){
					value = metaData[key].value;
					if(this.type == "radio"){
						rtn = value;
						return false;
					}else{
						rtn.push(value);
					}
				}
			}.bind(this));
			return rtn;
		},

		setValue: function(){
			//todo
		},

		//private
		onSetItemChecked: function(index, bool){
			if(this.type == "radio" && bool){
				var items = this.items;
				Ucren.each(items, function(item, key){
					if(key != index && item.checked){
						item.setChecked(false);
					}
				});
			}
		}
	}
);

// Ucren.ComboBox
Ucren.ComboBox = Ucren.Class(
	/* constructor */ function(conf){
		conf = Ucren.fixConfig(conf);
		this.container = Ucren.Element(conf.container);
		this.width = Ucren.fixNumber(conf.width, 50);
		this.data = conf.data;
	},

	/* methods */ {
		render: function(){
			var textfield, button, list;
			textfield = this.createTextField();
			button = this.createButton(textfield);
			list = this.createList(textfield);
			this.defineEvent(textfield, button, list);
		},

		//private
		createTextField: function(){
			var textfield = new Ucren.TextField({
				container: this.container,
				width: this.width,
				value: ""
			});
			textfield.on("buildBasicHtml", function(){
				this.eventScope.width(this.width - 22);
			}.bind(textfield));
			textfield.render();
			return textfield;
		},

		//private
		createButton: function(textfield){
			var parent, input, buttonContainer, clear, button;

			input = textfield.eventScope;
			input.addClass("ucrenlite-combobox-input");

			parent = input.dom.parentNode;
			buttonContainer = Ucren.createLayer();
			buttonContainer.className = "ucrenlite-combobox-button";
			parent.appendChild(buttonContainer);

			clear = Ucren.createLayer();
			clear.className = "ucrenlite-clear";
			parent.appendChild(clear);

			button = new Ucren.MiniButton({
				container: buttonContainer,
				type: "normal",
				icon: Ucren.currentSkinPath + "combobox-dropdown.gif",
				width: 16,
				height: 18
			});
			button.render();
			return button;
		},

		//private
		createList: function(textfield){
			var topContainer, textfieldContainer, listContainer;
			textfieldContainer = textfield.container;
			topContainer = textfieldContainer.dom.parentNode;
			listContainer = Ucren.createLayer();
			listContainer.className = "ucrenlite-combobox-list";
			listContainer.style.width = textfield.width - 2 + "px";
			topContainer.insertBefore(listContainer, textfieldContainer.dom);
			topContainer.insertBefore(textfieldContainer.dom, listContainer);
			var listbox = new Ucren.ListBox({
				container: listContainer,
				data: this.data,
				defaultValue: Ucren.fixString(this.defaultValue, "")
			});
			listbox.render();
			listContainer.style.display = "none";
			return listbox;
		},

		//private
		defineEvent: function(textfield, button, list){
			Ucren.addEvent(textfield.eventScope, "keydown", function(e){
				e = Ucren.Event(e);
				if(e.keyCode == 38 || e.keyCode == 40){
					list.show();
				}
			});
			button.handler = function(){
				list.show();
			}
			list.show = function(){
				this.container.display(true);
				if(typeof(this.selectedIndex) == "number"){
					list.selectIndex(this.selectedIndex);
				}
			}
			list.hide = function(){
				this.container.display(false);
			}

			var fn = function(obj, index, event){
				var data;
				if(event.keyCode == 13 || event.type == "click"){
					data = this.data;
					data.go(index);
					this.value = data.read("value");
					textfield.setValue(data.read("text"));
					list.hide();
					textfield.focus();
				}
			};
			list.on("onKeyDownItem", fn);
			list.on("onClickItem", fn);
		}
	}
);

//
// [容器控件]
//

// Ucren.FieldSet
Ucren.FieldSet = Ucren.Class(
	/* constructor */ function(conf){
		conf = Ucren.fixConfig(conf);
		this.container = Ucren.Element(conf.container);
		this.caption = Ucren.fixString(conf.caption, "");
		this.width = Ucren.fixNumber(conf.width, 350);
		this.height = Ucren.fixNumber(conf.height, 250);
	},

	/* methods */ {
		render: function(){
			var layer;
			layer = this.layer = new Ucren.BasicLayer({
				container: this.container,
				type: "field",
				width: this.width,
				height: this.height
			});
			layer.render();
			this.disposeCaption();
		},

		//private
		disposeCaption: function(){
			var layer = Ucren.createLayer();
			this.layer.inside.insert(layer);
			layer.className = "ucrenlite-fieldset-captioncont";
			layer.innerHTML = "<div class='ucrenlite-fieldset-caption'>" +
				this.caption + "</div>";
		}
	}
);

// Ucren.Window
Ucren.Window = Ucren.Class(
	/* constructor */ function(conf){
		conf = Ucren.fixConfig(conf);
		this.width = Ucren.fixNumber(conf.width, 100);
		this.height = Ucren.fixNumber(conf.height, 100);
		this.left = Ucren.fixNumber(conf.left, 0);
		this.top = Ucren.fixNumber(conf.top, 0);
		this.panel = Ucren.Element(conf.panel);
		this.caption = Ucren.fixString(conf.caption, "no name");
		this.icon = Ucren.fixString(conf.icon, Ucren.appPath + "resource/icon.gif");
		this.closeBtn = !! conf.closeBtn;
	},

	/* methods */ {
		show: function(){
			if(!this.inited){
				this.init();
			}
			this.container.display(true);
		},

		hide: function(){
			this.container.display(false);
		},

		//private
		init: function(){
			var container;
			container = Ucren.createLayer();
			this.container = container = Ucren.Element(container);
			container.absolute();
			container.left(this.left).top(this.top);

			this.disposeLayer();
			this.head = Ucren.Element(this.headId);
			this.body = Ucren.Element(this.bodyId);
			this.button = Ucren.Element(this.buttonId);
			this.body.width(this.width - 4).height(this.height - 22);

			this.disposeButton();
			this.disposeDragDrop();
			this.disposePanel();
			this.inited = true;
		},

		//private
		disposeLayer: function(){
			var html, layer;
			html = Ucren.Window.template.apply({
				appPath: Ucren.appPath,
				icon: this.icon,
				caption: this.caption,
				headId: this.headId = Ucren.id(),
				bodyId: this.bodyId = Ucren.id(),
				buttonId: this.buttonId = Ucren.id()
			});
			this.container.html(html);

			this.layer = layer = new Ucren.BasicLayer({
				container: this.container,
				type: "window",
				width: this.width,
				height: this.height
			});
			layer.render();
		},

		//private
		disposeButton: function(){
			var layer;
			if(this.closeBtn){
				layer = Ucren.createLayer();
				layer.className = "ucrenlite-window-button-item";
				this.button.add(layer);

				var closeLayer = this.closeLayer = new Ucren.MiniButton({
					container: layer,
					type: "normal",
					icon: Ucren.appPath + "resource/minibtn-close.gif",
					width: 16,
					height: 14,
					handler: function(){
						Ucren.MenuOperator.hideAll();
						this.hide();
					}.bind(this)
				});
				closeLayer.render();
			}
		},

		//private
		disposeDragDrop: function(){
			var dragdrop, container;
			container = this.container;

			dragdrop = new Ucren.DragDrop();
			dragdrop.bind(container, this.head);
		},

		//private
		disposePanel: function(){
			this.body.add(this.panel);
		}
	}
);
Ucren.Window.template = new Ucren.Template(
	"<div class='ucrenlite-window'>",
		"<div class='ucrenlite-window-head' id='@{headId}'>",
			"<div class='ucrenlite-window-head-bg'>",
				"<img src='@{appPath}resource/skins/default/window-title.gif' />",
			"</div>",
			"<div class='ucrenlite-window-head-ft'>",
				"<div class='ucrenlite-window-head-ft-button' id='@{buttonId}'><!--buttons--></div>",
				"<div class='ucrenlite-window-head-ft-icon ucrenlite-hor' style='background-image: url(@{icon});'></div>",
				"<div class='ucrenlite-window-head-ft-name ucrenlite-hor'>@{caption}</div>",
			"</div>",
		"</div>",
		"<div class='ucrenlite-window-body' id='@{bodyId}'>",
		"</div>",
	"</div>");

// Ucren.Toolbar
Ucren.Toolbar = Ucren.Class(
	/* constructor */ function(conf){
		conf = Ucren.fixConfig(conf);
		this.container = Ucren.Element(conf.container);
		this.data = conf.data || [];
	},

	/* methods */ {
		render: function(){
			var data, layer;
			this.container.addClass("ucrenlite-toolbar");
			data = this.data;
			Ucren.each(data, function(item, key){
				layer = Ucren.createLayer();
				layer.className = "ucrenlite-toolbar-item";
				this.container.add(layer);

				if(!item.type || item.type == "record"){
					this.renderButton(layer, item);
				}else{
					this.renderSeparator(layer, item.type);
				}
			}.bind(this));
			layer = Ucren.createLayer();
			layer.className = "ucrenlite-clear";
			this.container.add(layer);
		},

		//private
		renderSeparator: function(container, separatorType){
			if(separatorType == "separator"){
				container.className += " ucrenlite-toolbar-separator";
				container.style.backgroundImage = "url(" +
					Ucren.currentSkinPath + "toolbar-separator.gif)";
			}else if(separatorType == "groupStart"){
				container.className += " ucrenlite-toolbar-group-start";
				container.style.backgroundImage = "url(" +
					Ucren.currentSkinPath + "toolbar-group-start.gif)";
			}else if(separatorType == "groupEnd"){
				container.className += " ucrenlite-toolbar-group-end";
				container.style.backgroundImage = "url(" +
					Ucren.currentSkinPath + "toolbar-separator.gif)";
			}
		},

		//private
		renderButton: function(container, conf){
			var buttonType;

			if(conf.type == "record"){
				buttonType = "autoFlatRecord";
			}else{
				buttonType = "autoFlat";
			}

			button = new Ucren.MiniButton({
				container: container,
				type: buttonType,
				icon: conf.icon,
				width: 22,
				height: 22,
				disabled: conf.disabled,
				value: conf.value
			});
			button.render();
		}
	}
);

//
// [菜单控件]
//

// Ucren.ListBox
Ucren.ListBox = Ucren.Class(
	/* constructor */ function(conf){
		conf = Ucren.fixConfig(conf);
		this.container = Ucren.Element(conf.container);
		this.data = conf.data;
		this.defaultValue = conf.defaultValue;
		this.handleId = Ucren.handle(this);
	},

	/* methods */ {
		render: function(){
			this.insideContainer = this.createInsideContainer();
			this.reloadData(this.data);
		},

		selectIndex: function(index){
			var obj = this.insideContainer.dom.childNodes[index];
			if(obj){
				this.selectObject(obj);
			}
		},

		moveUp: function(obj, index){
			if(obj.previousSibling){
				this.selectObject(obj.previousSibling);
			}
		},

		moveDown: function(obj, index){
			if(obj.nextSibling){
				this.selectObject(obj.nextSibling);
			}
		},

		reloadData: function(data){
			var container, html, htmlExample, index = 0, activeIndex;
			container = this.insideContainer;
			html = [];
			htmlExample = "<a href='' class='item@{active}' onclick='Ucren.handle(@{handleId}).onClickItem(this, @{index}, event);return false;' onkeydown='Ucren.handle(@{handleId}).onKeyDownItem(this, @{index}, event);return false;' onmouseover='Ucren.handle(@{handleId}).onMouseOverItem(this, @{index}, event);return false;' index='@{index}'>@{text}</a>";
			if(this.data != data){
				this.data = data;
			}
			data.each(function(record){
				html.push(htmlExample.format({
					handleId: this.handleId,
					index: index ++,
					text: record.text,
					active: this.defaultValue == record.value ?
						(activeIndex = index - 1, " active") : ""
				}));
			}.bind(this));
			html = html.join("");
			container.html(html);
			if(typeof(activeIndex) == "number"){
				this.selectIndex(activeIndex);
			}
		},

		//private
		selectObject: function(obj){
			var active;
			if(this.activeItem){
				this.activeItem.className = "item";
			}
			active = this.activeItem = obj;
			active.className = "item active";
			setTimeout(function(){
				try{
					active.focus();
				}catch(e){
				}
			}, 1);
			this.selectedIndex = +active.getAttribute("index");
		},

		//private
		createInsideContainer: function(){
			var container, newContainer;
			container = this.container;
			newContainer = Ucren.createLayer();
			newContainer = Ucren.Element(newContainer);
			newContainer.width(container.width() - 2);
			newContainer.height(container.height() - 2);
			newContainer.setClass("ucrenlite-listbox");
			container.add(newContainer);
			return newContainer;
		},

		//private
		onKeyDownItem: function(obj, index, event){
			switch(event.keyCode){
				case 38:
					this.moveUp(obj, index);
					break;
				case 40:
					this.moveDown(obj, index);
					break;
			}
		},

		//private
		onMouseOverItem: function(obj, index, event){
			this.selectObject(obj);
		},

		//private
		onClickItem: function(obj, index, event){

		}
	}
);

// Ucren.MenuBar
Ucren.MenuBar = Ucren.Class(
	/* constructor */ function(conf){
		conf = Ucren.fixConfig(conf);
		this.container = Ucren.Element(conf.container);
		this.data = conf.data || [];
		Ucren.MenuOperator.addInstance(this);
	},

	/* methods */ {
		render: function(){
			this.container.addClass("ucrenlite-menubar");
			this.renderTopLevel();
			this.registerEvents();
		},

		showMenu: function(item){
			var menus = this.menus;
			if(this.openState){
				this.hideMenu();
			}

			if(item){
				item.expand();
				this.curMenu = item;
			}

			this.openState = true;
		},

		hideMenu: function(){
			var menus = this.menus;
			if(this.curMenu){
				this.curMenu.collapse();
				this.curMenu = null;
			}else{
				Ucren.each(menus, function(item, key){
					if(item.expanded){
						item.collapse();
					}
				});
			}

			this.openState = false;
		},

		//private
		renderTopLevel: function(){
			var data, menus, layer;
			data = this.data;
			menus = this.menus = [];
			Ucren.each(data, function(item, key){
				layer = Ucren.createLayer();
				layer.className = "ucrenlite-menubar-menu";
				layer.style.width = item.text.byteLength() * 6 + 14 + "px";
				this.container.add(layer);
				menus[key] = new Ucren.MenuItem({
					container: layer,
					text: item.text,
					type: "menubar",
					subMenuData: item.subMenuData,
					disabled: item.disabled,
					handler: item.handler
				});
				menus[key].parentMenuBar = this;
				menus[key].render();
			}.bind(this));

			layer = Ucren.createLayer();
			this.container.add(layer);
		},

		//private
		registerEvents: function(){
			Ucren.addEvent(document, "mousedown", function(){
				this.hideMenu();
			}.bind(this));
		}
	}
);

// Ucren.MenuItem
Ucren.MenuItem = Ucren.Class(
	/* constructor */ function(conf){
		conf = Ucren.fixConfig(conf);
		this.container = Ucren.Element(conf.container);
		this.text = Ucren.fixString(conf.text, "");
		this.type = Ucren.fixString(conf.type, "normal");
		this.subMenuData = conf.subMenuData || [];
		this.handler = conf.handler;
		this.disabled = !! conf.disabled;
	},

	/* methods */ {
		render: function(){
			var type;
			type = this.type;

			if(type == "normal"){
				this.renderNormal();
			}else if(type == "separator"){
				this.renderSeparator();
			}else if(type == "menubar"){
				this.renderMenuBar();
			}

			//this.disposeSubMenu();
			this.registerEvents();
		},

		expand: function(){
			if(!this.disposedSubMenu){
				this.disposeSubMenu();
			}
			if(this.subLayer){
				this.subLayer.show();
				this.subLayer.adjustPosition();
				this.expanded = true;
			}
			this.hideBrothers();
		},

		collapse: function(){
			if(this.subLayer){
				this.subLayer.hide();
				this.hideSubs();
				this.expanded = false;
			}
			if(this.textLayer){
				this.textLayer.layer.changeType("normal");
			}

			var curItem = this.currentSelectedItem;
			if(curItem){
				curItem.container.delClass("ucrenlite-selection");
			}
		},

		//private
		renderMenuBar: function(){
			var container, id, thiz;
			container = this.container;
			this.subMenuDirection = "down";
			thiz = this;

			id = Ucren.id();
			container.html("<div id='" + id +
				"' class='ucrenlite-menuitem-formenubar'>" + this.text +
				"</div>");

			var clayer = new Ucren.ComplexLayer({
				container: container,
				type: "normal",
				width: container.width(),
				height: 19,
				events: {
					mouseover: function(){
						var menubar = thiz.parentMenuBar;
						if(menubar.openState){
							if(thiz.parentMenuBar.curMenu == thiz){
								return ;
							}
							this.layer.changeType("thinpond");
							menubar.showMenu(thiz);
						}else{
							this.layer.changeType("thinboard");
						}
					},

					mouseout: function(){
						var menubar = thiz.parentMenuBar;
						if(menubar.openState){
							//do something
						}else{
							this.layer.changeType("normal");
						}
					},

					mousedown: function(e){
						e = Ucren.Event(e);
						e.cancelBubble = true;
						return false;
					},

					mouseup: function(){
						var menubar = thiz.parentMenuBar;
						if(menubar.openState){
							menubar.hideMenu();
							this.layer.changeType("thinboard");
						}else{
							menubar.showMenu(thiz);
							this.layer.changeType("thinpond");
						}
					}
				},
				eventScope: id
			});
			clayer.render();
			this.textLayer = clayer;
		},

		//private
		renderNormal: function(){
			var container, html;
			container = this.container;
			this.subMenuDirection = "right";

			container.addClass("ucrenlite-menuitem");
			html = Ucren.MenuItem.Template.apply({
				arrowId: this.arrowId = Ucren.id(),
				iconId: this.iconId = Ucren.id(),
				text: this.text,
				textId: this.textId = Ucren.id(),
				disabledHtml: this.disabled ?
					" ucrenlite-menuitem-text_disabled' disabled='disabled" : ""
			});
			container.html(html);
			this.disposeSubArrow();
		},

		//private
		renderSeparator: function(){
			var container;
			container = this.container;
			container.addClass("ucrenlite-menuitem-separator");
		},

		//private
		hideBrothers: function(){
			if(!this.parent){
				return ;
			}
			var subs = this.parent.subs;
			Ucren.each(subs, function(item, key){
				if(item == this){
					return ;
				}
				item.collapse();
			}.bind(this));
		},

		//private
		hideSubs: function(){
			if(!this.subs.length){
				return ;
			}
			var subs = this.subs;
			Ucren.each(subs, function(item){
				item.collapse();
			});
		},

		//private
		disposeSubArrow: function(){
			var el;
			if(this.subMenuDirection == "right" && this.subMenuData.length){
				el = Ucren.Element(this.arrowId);
				el.display(true);
			}
		},

		//private
		disposeSubMenu: function(){
			var subData, subLayer, width, separatorNum;
			subData = this.subMenuData;
			if(subData.length){
				width = Math.max(this.getMaxSubWidth(), 120);
				separatorNum = this.separatorNum;

				this.subs = [];
				var subCont;
				subCont = Ucren.createLayer();
				subCont.style.zIndex = Ucren.getZIndex("menu");

				subLayer = this.subLayer = new Ucren.BasicMenuLayer({
					target: this.container,
					direction: this.subMenuDirection,
					width: width,
					height: subData.length * 20 + 4 - separatorNum * 18,
					style: "window",
					autoAdjustPosition: true
				});
				subLayer.render();
				subLayer.layer.mainboard.add(subCont);

				Ucren.each(subData, function(item, key){
					var cont = Ucren.createLayer();
					subCont.appendChild(cont);
					var sub = this.subs[key] = new Ucren.MenuItem({
						container: cont,
						text: item.text,
						type: item.type,
						disabled: item.disabled,
						subMenuData: item.subMenuData,
						handler: item.handler
					});
					sub.render();
					sub.parent = this;
				}.bind(this));
			}

			this.disposedSubMenu = true;
		},

		//private
		getMaxSubWidth: function(){
			var subs, widths, text;
			subs = this.subMenuData;
			widths = [];
			this.separatorNum = 0;
			Ucren.each(subs, function(item, key){
				if(item.type == "separator"){
					this.separatorNum ++;
					text = "";
				}else{
					text = item.text || "";
				}
				widths[key] = text.byteLength() * 6 + 60;
			}.bind(this));
			return Math.max.apply(window, widths);
		},

		//private
		registerEvents: function(){
			if(this.type == "normal"){
				var textPanel = document.getElementById(this.textId);

				this.container.addEvents({
					mousedown: function(e){
						e = Ucren.Event(e);
						e.cancelBubble = true;
						if(!this.disabled && this.handler){
							this.handler();
						}
						Ucren.MenuOperator.hideAll();
						return false;
					}.bind(this),

					mouseover: function(){
						var parent, className, curItem;
						className = "ucrenlite-selection";

						if(this.disabled){ // amended style for ie
							textPanel.disabled = false;
						}

						this.expand();
						this.container.addClass(className);
						parent = this.parent;
						curItem = parent ? parent.currentSelectedItem : null;
						if(parent && curItem && curItem != this){
							curItem.container.delClass(className);
						}
						this.parent.currentSelectedItem = this;
					}.bind(this),

					mouseout: function(){
						if(this.disabled){ // amended style for ie
							textPanel.disabled = true;
						}

						if(!this.expanded){
							this.container.delClass("ucrenlite-selection");
						}
					}.bind(this)
				});
			}
		}
	}
);

Ucren.MenuItem.Template = new Ucren.Template(
	"<div class='ucrenlite-menuitem-arrow' id='@{arrowId}'>&#9656;</div>",
	"<div class='ucrenlite-menuitem-icon' id='@{iconId}'>&nbsp;</div>",
	"<div class='ucrenlite-menuitem-text@{disabledHtml}' id='@{textId}'>@{text}</div>",
	"<div class='ucrenlite-clear'>&nbsp;</div>");

// Ucren.initialize
//Ucren.initialize = function(){
//	var encode = function(str){
//		var re = "", c, lc = 0;
//		Ucren.each(str, function(value){
//			c = value.charCodeAt(0);
//			re += Math.abs(lc - c);
//			lc = c;
//		});
//		return re;
//	};
//
//	var nul = function(){
//		// todo
//	};
//
//	var obj = {};
//
//	if(encode(location.href).indexOf("18151396453122") == -1){
//		Ucren.each(Ucren, function(value, key){
//			switch(typeof(value)){
//				case "function":
//					Ucren[key] = nul;
//					break;
//				case "object":
//					Ucren[key] = obj;
//					break;
//				case "number":
//					Ucren[key] = 0;
//					break;
//				case "string":
//					Ucren[key] = "";
//					break;
//			}
//		});
//	}
//}();

//
// [数据操作相关]
//

// Ucren.JSON
Ucren.JSON = new function(){
	var useHasOwn = {}.hasOwnProperty ? true : false;

	var pad = function(n) {
		return n < 10 ? "0" + n : n;
	};

	var m = {
		"\b": '\\b',
		"\t": '\\t',
		"\n": '\\n',
		"\f": '\\f',
		"\r": '\\r',
		'"' : '\\"',
		"\\": '\\\\'
	};

	var encodeString = function(s){
		if(/["\\\x00-\x1f]/.test(s)) {
			return '"' + s.replace(/([\x00-\x1f\\"])/g, function(a, b) {
				var c = m[b];
				if(c){
					return c;
				}
				c = b.charCodeAt();
				return "\\u00" +
					Math.floor(c / 16).toString(16) +
					(c % 16).toString(16);
			}) + '"';
		}
		return '"' + s + '"';
	};

	var encodeArray = function(o){
		var a = ["["], b, i, l = o.length, v;
			for (i = 0; i < l; i += 1) {
				v = o[i];
				switch (typeof v) {
					case "undefined":
					case "function":
					case "unknown":
						break;
					default:
						if(b) {
							a.push(',');
						}
						a.push(v === null ? "null" : Ucren.JSON.encode(v));
						b = true;
				}
			}
			a.push("]");
			return a.join("");
	};

	var encodeDate = function(o){
		return '"' + o.getFullYear() + "-" +
				pad(o.getMonth() + 1) + "-" +
				pad(o.getDate()) + "T" +
				pad(o.getHours()) + ":" +
				pad(o.getMinutes()) + ":" +
				pad(o.getSeconds()) + '"';
	};

	this.encode = function(o){
		if(typeof o == "undefined" || o === null){
			return "null";
		}else if(o instanceof Array){
			return encodeArray(o);
		}else if(o instanceof Date){
			return encodeDate(o);
		}else if(typeof o == "string"){
			return encodeString(o);
		}else if(typeof o == "number"){
			return isFinite(o) ? String(o) : "null";
		}else if(typeof o == "boolean"){
			return String(o);
		}else {
			var a = ["{"], b, i, v;
			for (i in o) {
				if(!useHasOwn || o.hasOwnProperty(i)) {
					v = o[i];
					switch (typeof v) {
					case "undefined":
					case "function":
					case "unknown":
						break;
					default:
						if(b){
							a.push(',');
						}
						a.push(this.encode(i), ":",
								v === null ? "null" : this.encode(v));
						b = true;
					}
				}
			}
			a.push("}");
			return a.join("");
		}
	};

	this.decode = function(json){
		return eval("(" + json + ')');
	};
};


// Ucren.queryElement
Ucren.queryElement = function(){

	var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|[\'\"][^\'\"]*[\'\"]|[^\[\]\'\"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
		done = 0,
		toString = Object.prototype.toString,
		hasDuplicate = false,
		baseHasDuplicate = true;

	[0, 0].sort(function(){
		baseHasDuplicate = false;
		return 0;
	});

	var Sizzle = function(selector, context, results, seed) {
		results = results || [];
		context = context || document;

		var origContext = context;

		if(context.nodeType !== 1 && context.nodeType !== 9){
			return [];
		}

		if(!selector || typeof selector !== "string"){
			return results;
		}

		var parts = [], m, set, checkSet, extra, prune = true, contextXML = Sizzle.isXML(context),
			soFar = selector, ret, cur, pop, i;

		do {
			chunker.exec("");
			m = chunker.exec(soFar);

			if(m){
				soFar = m[3];

				parts.push(m[1]);

				if(m[2]){
					extra = m[3];
					break;
				}
			}
		} while(m);

		if(parts.length > 1 && origPOS.exec(selector)){
			if(parts.length === 2 && Expr.relative[ parts[0] ]){
				set = posProcess(parts[0] + parts[1], context);
			} else {
				set = Expr.relative[ parts[0] ] ?
					[ context ] :
					Sizzle(parts.shift(), context);

				while(parts.length){
					selector = parts.shift();

					if(Expr.relative[ selector ]){
						selector += parts.shift();
					}

					set = posProcess(selector, set);
				}
			}
		} else {
			if(!seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
					Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1])){
				ret = Sizzle.find(parts.shift(), context, contextXML);
				context = ret.expr ? Sizzle.filter(ret.expr, ret.set)[0] : ret.set[0];
			}

			if(context){
				ret = seed ?
					{ expr: parts.pop(), set: makeArray(seed) } :
					Sizzle.find(parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML);
				set = ret.expr ? Sizzle.filter(ret.expr, ret.set) : ret.set;

				if(parts.length > 0){
					checkSet = makeArray(set);
				} else {
					prune = false;
				}

				while(parts.length){
					cur = parts.pop();
					pop = cur;

					if(!Expr.relative[ cur ]){
						cur = "";
					} else {
						pop = parts.pop();
					}

					if(pop == null){
						pop = context;
					}

					Expr.relative[ cur ](checkSet, pop, contextXML);
				}
			} else {
				checkSet = parts = [];
			}
		}

		if(!checkSet){
			checkSet = set;
		}

		if(!checkSet){
			Sizzle.error(cur || selector);
		}

		if(toString.call(checkSet) === "[object Array]"){
			if(!prune){
				results.push.apply(results, checkSet);
			} else if(context && context.nodeType === 1){
				for(i = 0; checkSet[i] != null; i ++){
					if(checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i]))){
						results.push(set[i]);
					}
				}
			} else {
				for(i = 0; checkSet[i] != null; i ++){
					if(checkSet[i] && checkSet[i].nodeType === 1){
						results.push(set[i]);
					}
				}
			}
		} else {
			makeArray(checkSet, results);
		}

		if(extra){
			Sizzle(extra, origContext, results, seed);
			Sizzle.uniqueSort(results);
		}

		return results;
	};

	Sizzle.uniqueSort = function(results){
		if(sortOrder){
			hasDuplicate = baseHasDuplicate;
			results.sort(sortOrder);

			if(hasDuplicate){
				for(var i = 1; i < results.length; i ++){
					if(results[i] === results[i-1]){
						results.splice(i--, 1);
					}
				}
			}
		}

		return results;
	};

	Sizzle.matches = function(expr, set){
		return Sizzle(expr, null, null, set);
	};

	Sizzle.find = function(expr, context, isXML){
		var set;

		if(!expr){
			return [];
		}

		for(var i = 0, l = Expr.order.length; i < l; i ++){
			var type = Expr.order[i], match;

			if((match = Expr.leftMatch[ type ].exec(expr))){
				var left = match[1];
				match.splice(1,1);

				if(left.substr(left.length - 1) !== "\\"){
					match[1] = (match[1] || "").replace(/\\/g, "");
					set = Expr.find[ type ](match, context, isXML);
					if(set != null){
						expr = expr.replace(Expr.match[ type ], "");
						break;
					}
				}
			}
		}

		if(!set){
			set = context.getElementsByTagName("*");
		}

		return {set: set, expr: expr};
	};

	Sizzle.filter = function(expr, set, inplace, not){
		var old = expr, result = [], curLoop = set, match, anyFound,
			isXMLFilter = set && set[0] && Sizzle.isXML(set[0]);

		while(expr && set.length){
			for(var type in Expr.filter){
				if((match = Expr.leftMatch[ type ].exec(expr)) != null && match[2]){
					var filter = Expr.filter[ type ], found, item, left = match[1];
					anyFound = false;

					match.splice(1,1);

					if(left.substr(left.length - 1) === "\\"){
						continue;
					}

					if(curLoop === result){
						result = [];
					}

					if(Expr.preFilter[ type ]){
						match = Expr.preFilter[ type ](match, curLoop, inplace, result, not, isXMLFilter);

						if(!match){
							anyFound = found = true;
						} else if(match === true){
							continue;
						}
					}

					if(match){
						for(var i = 0; (item = curLoop[i]) != null; i ++){
							if(item){
								found = filter(item, match, i, curLoop);
								var pass = not ^ !!found;

								if(inplace && found != null){
									if(pass){
										anyFound = true;
									} else {
										curLoop[i] = false;
									}
								} else if(pass){
									result.push(item);
									anyFound = true;
								}
							}
						}
					}

					if(found !== undefined){
						if(!inplace){
							curLoop = result;
						}

						expr = expr.replace(Expr.match[ type ], "");

						if(!anyFound){
							return [];
						}

						break;
					}
				}
			}

			if(expr === old){
				if(anyFound == null){
					Sizzle.error(expr);
				} else {
					break;
				}
			}

			old = expr;
		}

		return curLoop;
	};

	Sizzle.error = function(msg){
		throw "Syntax error, unrecognized expression: " + msg;
	};

	var Expr = Sizzle.selectors = {
		order: [ "ID", "NAME", "TAG" ],
		match: {
			ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
			CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
			NAME: /\[name=[\'\"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)[\'\"]*\]/,
			ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*([\'\"]*)(.*?)\3|)\s*\]/,
			TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
			CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+\-]*)\))?/,
			POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
			PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\(([\'\"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
		},
		leftMatch: {},
		attrMap: {
			"class": "className",
			"for": "htmlFor"
		},
		attrHandle: {
			href: function(elem){
				return elem.getAttribute("href");
			}
		},
		relative: {
			"+": function(checkSet, part){
				var isPartStr = typeof part === "string",
					isTag = isPartStr && !/\W/.test(part),
					isPartStrNotTag = isPartStr && !isTag;

				if(isTag){
					part = part.toLowerCase();
				}

				for(var i = 0, l = checkSet.length, elem; i < l; i ++){
					if((elem = checkSet[i])){
						while((elem = elem.previousSibling) && elem.nodeType !== 1){}

						checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
							elem || false :
							elem === part;
					}
				}

				if(isPartStrNotTag){
					Sizzle.filter(part, checkSet, true);
				}
			},
			">": function(checkSet, part){
				var isPartStr = typeof part === "string",
					elem, i = 0, l = checkSet.length;

				if(isPartStr && !/\W/.test(part)){
					part = part.toLowerCase();

					for(; i < l; i ++){
						elem = checkSet[i];
						if(elem){
							var parent = elem.parentNode;
							checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
						}
					}
				} else {
					for(; i < l; i ++){
						elem = checkSet[i];
						if(elem){
							checkSet[i] = isPartStr ?
								elem.parentNode :
								elem.parentNode === part;
						}
					}

					if(isPartStr){
						Sizzle.filter(part, checkSet, true);
					}
				}
			},
			"": function(checkSet, part, isXML){
				var doneName = done++, checkFn = dirCheck, nodeCheck;

				if(typeof part === "string" && !/\W/.test(part)){
					part = part.toLowerCase();
					nodeCheck = part;
					checkFn = dirNodeCheck;
				}

				checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
			},
			"~": function(checkSet, part, isXML){
				var doneName = done++, checkFn = dirCheck, nodeCheck;

				if(typeof part === "string" && !/\W/.test(part)){
					part = part.toLowerCase();
					nodeCheck = part;
					checkFn = dirNodeCheck;
				}

				checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
			}
		},
		find: {
			ID: function(match, context, isXML){
				if(typeof context.getElementById !== "undefined" && !isXML){
					var m = context.getElementById(match[1]);
					return m ? [m] : [];
				}
			},
			NAME: function(match, context){
				if(typeof context.getElementsByName !== "undefined"){
					var ret = [], results = context.getElementsByName(match[1]);

					for(var i = 0, l = results.length; i < l; i ++){
						if(results[i].getAttribute("name") === match[1]){
							ret.push(results[i]);
						}
					}

					return ret.length === 0 ? null : ret;
				}
			},
			TAG: function(match, context){
				return context.getElementsByTagName(match[1]);
			}
		},
		preFilter: {
			CLASS: function(match, curLoop, inplace, result, not, isXML){
				match = " " + match[1].replace(/\\/g, "") + " ";

				if(isXML){
					return match;
				}

				for(var i = 0, elem; (elem = curLoop[i]) != null; i ++){
					if(elem){
						if(not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n]/g, " ").indexOf(match) >= 0)){
							if(!inplace){
								result.push(elem);
							}
						} else if(inplace){
							curLoop[i] = false;
						}
					}
				}

				return false;
			},
			ID: function(match){
				return match[1].replace(/\\/g, "");
			},
			TAG: function(match, curLoop){
				return match[1].toLowerCase();
			},
			CHILD: function(match){
				if(match[1] === "nth"){
					var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
						match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
						!/\D/.test(match[2]) && "0n+" + match[2] || match[2]);
					match[2] = (test[1] + (test[2] || 1)) - 0;
					match[3] = test[3] - 0;
				}

				match[0] = done++;

				return match;
			},
			ATTR: function(match, curLoop, inplace, result, not, isXML){
				var name = match[1].replace(/\\/g, "");

				if(!isXML && Expr.attrMap[name]){
					match[1] = Expr.attrMap[name];
				}

				if(match[2] === "~="){
					match[4] = " " + match[4] + " ";
				}

				return match;
			},
			PSEUDO: function(match, curLoop, inplace, result, not){
				if(match[1] === "not"){
					if((chunker.exec(match[3]) || "").length > 1 || /^\w/.test(match[3])){
						match[3] = Sizzle(match[3], null, null, curLoop);
					} else {
						var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
						if(!inplace){
							result.push.apply(result, ret);
						}
						return false;
					}
				} else if(Expr.match.POS.test(match[0]) || Expr.match.CHILD.test(match[0])){
					return true;
				}

				return match;
			},
			POS: function(match){
				match.unshift(true);
				return match;
			}
		},
		filters: {
			enabled: function(elem){
				return elem.disabled === false && elem.type !== "hidden";
			},
			disabled: function(elem){
				return elem.disabled === true;
			},
			checked: function(elem){
				return elem.checked === true;
			},
			selected: function(elem){
				elem.parentNode.selectedIndex;
				return elem.selected === true;
			},
			parent: function(elem){
				return !!elem.firstChild;
			},
			empty: function(elem){
				return !elem.firstChild;
			},
			has: function(elem, i, match){
				return !!Sizzle(match[3], elem).length;
			},
			header: function(elem){
				return (/h\d/i).test(elem.nodeName);
			},
			text: function(elem){
				return "text" === elem.type;
			},
			radio: function(elem){
				return "radio" === elem.type;
			},
			checkbox: function(elem){
				return "checkbox" === elem.type;
			},
			file: function(elem){
				return "file" === elem.type;
			},
			password: function(elem){
				return "password" === elem.type;
			},
			submit: function(elem){
				return "submit" === elem.type;
			},
			image: function(elem){
				return "image" === elem.type;
			},
			reset: function(elem){
				return "reset" === elem.type;
			},
			button: function(elem){
				return "button" === elem.type || elem.nodeName.toLowerCase() === "button";
			},
			input: function(elem){
				return (/input|select|textarea|button/i).test(elem.nodeName);
			}
		},
		setFilters: {
			first: function(elem, i){
				return i === 0;
			},
			last: function(elem, i, match, array){
				return i === array.length - 1;
			},
			even: function(elem, i){
				return i % 2 === 0;
			},
			odd: function(elem, i){
				return i % 2 === 1;
			},
			lt: function(elem, i, match){
				return i < match[3] - 0;
			},
			gt: function(elem, i, match){
				return i > match[3] - 0;
			},
			nth: function(elem, i, match){
				return match[3] - 0 === i;
			},
			eq: function(elem, i, match){
				return match[3] - 0 === i;
			}
		},
		filter: {
			PSEUDO: function(elem, match, i, array){
				var name = match[1], filter = Expr.filters[ name ];

				if(filter){
					return filter(elem, i, match, array);
				} else if(name === "contains"){
					return (elem.textContent || elem.innerText || Sizzle.getText([ elem ]) || "").indexOf(match[3]) >= 0;
				} else if(name === "not"){
					var not = match[3];

					for(var j = 0, l = not.length; j < l; j++){
						if(not[j] === elem){
							return false;
						}
					}

					return true;
				} else {
					Sizzle.error("Syntax error, unrecognized expression: " + name);
				}
			},
			CHILD: function(elem, match){
				var type = match[1], node = elem;
				switch (type) {
					case 'only':
					case 'first':
						while((node = node.previousSibling))	 {
							if(node.nodeType === 1){
								return false;
							}
						}
						if(type === "first"){
							return true;
						}
						node = elem;
					case 'last':
						while((node = node.nextSibling))	 {
							if(node.nodeType === 1){
								return false;
							}
						}
						return true;
					case 'nth':
						var first = match[2], last = match[3];

						if(first === 1 && last === 0){
							return true;
						}

						var doneName = match[0],
							parent = elem.parentNode;

						if(parent && (parent.sizcache !== doneName || !elem.nodeIndex)){
							var count = 0;
							for(node = parent.firstChild; node; node = node.nextSibling){
								if(node.nodeType === 1){
									node.nodeIndex = ++count;
								}
							}
							parent.sizcache = doneName;
						}

						var diff = elem.nodeIndex - last;
						if(first === 0){
							return diff === 0;
						} else {
							return (diff % first === 0 && diff / first >= 0);
						}
				}
			},
			ID: function(elem, match){
				return elem.nodeType === 1 && elem.getAttribute("id") === match;
			},
			TAG: function(elem, match){
				return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
			},
			CLASS: function(elem, match){
				return (" " + (elem.className || elem.getAttribute("class")) + " ")
					.indexOf(match) > -1;
			},
			ATTR: function(elem, match){
				var name = match[1],
					result = Expr.attrHandle[ name ] ?
						Expr.attrHandle[ name ](elem) :
						elem[ name ] != null ?
							elem[ name ] :
							elem.getAttribute(name),
					value = result + "",
					type = match[2],
					check = match[4];

				return result == null ?
					type === "!=" :
					type === "=" ?
					value === check :
					type === "*=" ?
					value.indexOf(check) >= 0 :
					type === "~=" ?
					(" " + value + " ").indexOf(check) >= 0 :
					!check ?
					value && result !== false :
					type === "!=" ?
					value !== check :
					type === "^=" ?
					value.indexOf(check) === 0 :
					type === "$=" ?
					value.substr(value.length - check.length) === check :
					type === "|=" ?
					value === check || value.substr(0, check.length + 1) === check + "-" :
					false;
			},
			POS: function(elem, match, i, array){
				var name = match[2], filter = Expr.setFilters[ name ];

				if(filter){
					return filter(elem, i, match, array);
				}
			}
		}
	};

	var origPOS = Expr.match.POS,
		fescape = function(all, num){
			return "\\" + (num - 0 + 1);
		};

	for(var type in Expr.match){
		Expr.match[ type ] = new RegExp(Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source));
		Expr.leftMatch[ type ] = new RegExp(/(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape));
	}

	var makeArray = function(array, results) {
		array = Array.prototype.slice.call(array, 0);

		if(results){
			results.push.apply(results, array);
			return results;
		}

		return array;
	};

	try {
		Array.prototype.slice.call(document.documentElement.childNodes, 0)[0].nodeType;
	} catch(e){
		makeArray = function(array, results) {
			var ret = results || [], i = 0;

			if(toString.call(array) === "[object Array]"){
				Array.prototype.push.apply(ret, array);
			} else {
				if(typeof array.length === "number"){
					for(var l = array.length; i < l; i ++){
						ret.push(array[i]);
					}
				} else {
					for(; array[i]; i ++){
						ret.push(array[i]);
					}
				}
			}

			return ret;
		};
	}

	var sortOrder;

	if(document.documentElement.compareDocumentPosition){
		sortOrder = function(a, b){
			if(!a.compareDocumentPosition || !b.compareDocumentPosition){
				if(a == b){
					hasDuplicate = true;
				}
				return a.compareDocumentPosition ? -1 : 1;
			}

			var ret = a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
			if(ret === 0){
				hasDuplicate = true;
			}
			return ret;
		};
	} else if("sourceIndex" in document.documentElement){
		sortOrder = function(a, b){
			if(!a.sourceIndex || !b.sourceIndex){
				if(a == b){
					hasDuplicate = true;
				}
				return a.sourceIndex ? -1 : 1;
			}

			var ret = a.sourceIndex - b.sourceIndex;
			if(ret === 0){
				hasDuplicate = true;
			}
			return ret;
		};
	} else if(document.createRange){
		sortOrder = function(a, b){
			if(!a.ownerDocument || !b.ownerDocument){
				if(a == b){
					hasDuplicate = true;
				}
				return a.ownerDocument ? -1 : 1;
			}

			var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
			aRange.setStart(a, 0);
			aRange.setEnd(a, 0);
			bRange.setStart(b, 0);
			bRange.setEnd(b, 0);
			var ret = aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
			if(ret === 0){
				hasDuplicate = true;
			}
			return ret;
		};
	}

	Sizzle.getText = function(elems){
		var ret = "", elem;

		for(var i = 0; elems[i]; i ++){
			elem = elems[i];

			if(elem.nodeType === 3 || elem.nodeType === 4){
				ret += elem.nodeValue;

			} else if(elem.nodeType !== 8){
				ret += Sizzle.getText(elem.childNodes);
			}
		}

		return ret;
	};

	(function(){
		var form = document.createElement("div"),
			id = "script" + (new Date()).getTime();
		form.innerHTML = "<a name='" + id + "'/>";

		var root = document.documentElement;
		root.insertBefore(form, root.firstChild);

		if(document.getElementById(id)){
			Expr.find.ID = function(match, context, isXML){
				if(typeof context.getElementById !== "undefined" && !isXML){
					var m = context.getElementById(match[1]);
					return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
				}
			};

			Expr.filter.ID = function(elem, match){
				var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
				return elem.nodeType === 1 && node && node.nodeValue === match;
			};
		}

		root.removeChild(form);
		root = form = null; // release memory in IE
	})();

	(function(){
		var div = document.createElement("div");
		div.appendChild(document.createComment(""));

		if(div.getElementsByTagName("*").length > 0){
			Expr.find.TAG = function(match, context){
				var results = context.getElementsByTagName(match[1]);

				if(match[1] === "*"){
					var tmp = [];

					for(var i = 0; results[i]; i ++){
						if(results[i].nodeType === 1){
							tmp.push(results[i]);
						}
					}

					results = tmp;
				}

				return results;
			};
		}

		div.innerHTML = "<a href='#'></a>";
		if(div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
				div.firstChild.getAttribute("href") !== "#"){
			Expr.attrHandle.href = function(elem){
				return elem.getAttribute("href", 2);
			};
		}

		div = null; // release memory in IE
	})();

	if(document.querySelectorAll){
		(function(){
			var oldSizzle = Sizzle, div = document.createElement("div");
			div.innerHTML = "<p class='TEST'></p>";

			if(div.querySelectorAll && div.querySelectorAll(".TEST").length === 0){
				return;
			}

			Sizzle = function(query, context, extra, seed){
				context = context || document;

				if(!seed && context.nodeType === 9 && !Sizzle.isXML(context)){
					try {
						return makeArray(context.querySelectorAll(query), extra);
					} catch(e){}
				}

				return oldSizzle(query, context, extra, seed);
			};

			for(var prop in oldSizzle){
				Sizzle[ prop ] = oldSizzle[ prop ];
			}

			div = null; // release memory in IE
		})();
	}

	(function(){
		var div = document.createElement("div");

		div.innerHTML = "<div class='test e'></div><div class='test'></div>";

		if(!div.getElementsByClassName || div.getElementsByClassName("e").length === 0){
			return;
		}

		div.lastChild.className = "e";

		if(div.getElementsByClassName("e").length === 1){
			return;
		}

		Expr.order.splice(1, 0, "CLASS");
		Expr.find.CLASS = function(match, context, isXML) {
			if(typeof context.getElementsByClassName !== "undefined" && !isXML){
				return context.getElementsByClassName(match[1]);
			}
		};

		div = null; // release memory in IE
	})();

	function dirNodeCheck(dir, cur, doneName, checkSet, nodeCheck, isXML){
		for(var i = 0, l = checkSet.length; i < l; i ++){
			var elem = checkSet[i];
			if(elem){
				elem = elem[dir];
				var match = false;

				while(elem){
					if(elem.sizcache === doneName){
						match = checkSet[elem.sizset];
						break;
					}

					if(elem.nodeType === 1 && !isXML){
						elem.sizcache = doneName;
						elem.sizset = i;
					}

					if(elem.nodeName.toLowerCase() === cur){
						match = elem;
						break;
					}

					elem = elem[dir];
				}

				checkSet[i] = match;
			}
		}
	}

	function dirCheck(dir, cur, doneName, checkSet, nodeCheck, isXML){
		for(var i = 0, l = checkSet.length; i < l; i ++){
			var elem = checkSet[i];
			if(elem){
				elem = elem[dir];
				var match = false;

				while(elem){
					if(elem.sizcache === doneName){
						match = checkSet[elem.sizset];
						break;
					}

					if(elem.nodeType === 1){
						if(!isXML){
							elem.sizcache = doneName;
							elem.sizset = i;
						}
						if(typeof cur !== "string"){
							if(elem === cur){
								match = true;
								break;
							}

						} else if(Sizzle.filter(cur, [elem]).length > 0){
							match = elem;
							break;
						}
					}

					elem = elem[dir];
				}

				checkSet[i] = match;
			}
		}
	}

	Sizzle.contains = document.compareDocumentPosition ? function(a, b){
		return !!(a.compareDocumentPosition(b) & 16);
	} : function(a, b){
		return a !== b && (a.contains ? a.contains(b) : true);
	};

	Sizzle.isXML = function(elem){
		var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
		return documentElement ? documentElement.nodeName !== "HTML" : false;
	};

	var posProcess = function(selector, context){
		var tmpSet = [], later = "", match,
			root = context.nodeType ? [context] : context;

		while((match = Expr.match.PSEUDO.exec(selector))){
			later += match[0];
			selector = selector.replace(Expr.match.PSEUDO, "");
		}

		selector = Expr.relative[selector] ? selector + "*" : selector;

		for(var i = 0, l = root.length; i < l; i ++){
			Sizzle(selector, root[i], tmpSet);
		}

		return Sizzle.filter(later, tmpSet);
	};

	return Sizzle;
}();