# Remote 远程控制SDK

基于socket.io的远程控制SDK，允许你的PC网页被手机终端远程控制

## 快速上手

```html
<script src="http://s4.qhimg.com/static/535dde855bc726e2/socket.io-1.2.0.js"></script>
<script src="http://s7.qhimg.com/!70281da5/remote-server.js"></script>
<script type="text/javascript">
  var rs = new RemoteServer();
  rs.on('keydown', function f(ev){
    var key = ev.data.key;
    //console.log(ev);
    if(Reveal[key]){
      Reveal[key](); 
    }
  });
  rs.on('swipeend', function f(ev){
    var key = ev.data.direction;
    //console.log(ev);
    if(Reveal[key]){
      Reveal[key](); 
    }
  });
  rs.drawQRCode();
</script>
```

1. 在你要控制的网页上加上socket.io和remote-server.js

2. 创建RemoteServer()对象，注册要处理的事件方法

3. 调用drawQRCode()绘制二维码，二维码默认用TAB键唤起 

4. 在网页打开后**按TAB键**唤出二维码，手机扫描二维码绑定控制器

5. 用控制器对远程网页进行控制。

## 示例

[reveal slide](http://s.h5jun.com/slide)

[赛车游戏](http://remote.baomitu.com/static/demo/race/index.html)

![扫二维码开启遥控](http://p4.qhimg.com/d/inn/59991f4e/race.jpg)

## 基础事件

* 基础键盘事件
keydown, keyup, keypress

```js
var rs = new RemoteServer();
rs.on('keypress', function(ev){
	console.log('You pressed:' + ev.data.key);
});
```

* 基础滑动手势（在C键上支持手势）
swipestart, swipeend, swiping

```js
var rs = new RemoteServer();
rs.on('swipeend', function(ev){
	console.log('Swiped:' + ev.data.direction);
});
```

* 基础缩放手势
pinchstart, pinchend, pinch

```js
var rs = new RemoteServer();
rs.on('pinchend', function(ev){
	console.log('Scale:' + ev.data.scale);
});
```

* 基础旋转手势
rotate

```js
var rs = new RemoteServer();
rs.on('rotate', function(ev){
	console.log('Rotation:' + ev.data.rotation);
	console.log('Direction:' + ev.data.direction);
});
```

* 高级键盘事件
A, B, C, R, S

```js
var rs = new RemoteServer();
rs.on('R', function(){
	console.log('R key pressed');
});
```

* 高级滑动手势
swipeup, swipedown, swipeleft, swiperight

```js
var rs = new RemoteServer();
rs.on('swipeleft', function(){
	Reveal.left();
});
```

* 高级缩放手势
pinchin, pinchout

```js
var rs = new RemoteServer();
rs.on('pinchin', function(ev){
	$(myEl).css('transform', 
		'scale(' + ev.data.scale +')');
});
```

* 高级旋转手势
rotateleft, rotateright

```js
var rs = new RemoteServer();
rs.on('rotateleft', function(ev){
	...
});
```

**基础事件基于百度 [TOUCH.JS](http://touch.code.baidu.com/)，更详细的可以参考相关说明**

## 其他事件

* 加速度和方向
orientationchange, motionchange

```js
var rs = new RemoteServer();
rs.on('orientationchange', function(ev){
	//console.log(ev);
	var d = ev.data.newValue;
	if(d.beta * (d.gamma > 0 ? 1 : -1) > 20){
		isDirKeyDown = true;
		System.fireEvent("LeftKey");				
	}else if(d.beta * (d.gamma > 0 ? 1 : -1) < -20){
		isDirKeyDown = true;
		System.fireEvent("RightKey");	
	}
});
```

## 开发者高级功能

**修改二维码展现方式**

默认的二维码展现方式是**按TAB键**显示出来，通过给drawQRCode传参的方式可以自定义二维码展现方式。

```js
var qrcodeEl = document.getElementById('qrcode');
rs.drawQRCode(qrcodeEl);
```

**配置遥控器事件列表**

有时候，我们为了节省流量和提升速度，不希望大量不用处理的事件被发送给socket.io中转服务器，在RomoteServer上可以通过构造参数来指定需要发送的事件，这个参数指定的事件列表会在控制端RemoteClient连接建立时**反向推送**到遥控器，这样的话遥控器就可以只发送白名单中的事件（比如在不需要加速度移和方向移的应用中过滤掉这些可能被频繁发送的事件）

```js
var rs = new RemoteServer({
	//让遥控器只发送keypress和swipeend事件
	//其他事件将不会被发送
  	eventList: ['keypress', 'swipeend']	
});
```

**修改服务SDK**

```bash
git clone https://github.com/akira-cn/remote.git
```

1. 获取项目到本地

2. 编辑 src/remote-server.js

3. 使用 [webpack](https://webpack.github.io) 构建项目

4. 发布 dist/remote-server.umd.js

**自定义遥控器**

1. 获取项目到本地

2. 编辑 src/remote-client.js

3. 使用 [webpack](https://webpack.github.io) 构建项目

4. 发布 dist/remote-client.umd.js

5. 在使用服务SDK的时候，修改drawQRCode的参数使得二维码指向新的遥控器路径

```js
rs.drawQRCode(null, "http://my.server/pathname/?sid=?");  //URL必须要带上参数sid
```

**修改或自己部署 socket.io 中转服务**

remote远程控制是基于socket.io的，socket服务基本上只做配对和转发消息的功能，所以一般情况下不需要修改，如果希望消息服务走自己的服务器，可以自己部署。

socket服务在 socketio/server 下，是基于 [thinkJS 2.0](http://new.thinkjs.org/) 的服务，可以参考 thinkJS 文档进行部署。

## Thanks

[code.baidu](https://github.com/Clouda-team/touch.code.baidu.com)

[qrcodejs](https://github.com/davidshimjs/qrcodejs)

[mobvii](https://github.com/75team/mobvii/)

[thinkjs](https://github.com/75team/thinkjs/)

## LICENSE
[MIT](LICENSE)
