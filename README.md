# Remote SDK

Allowing your PC web page to be remote controlled by mobile device

## Quick start

```html
<script src="http://s4.qhimg.com/static/535dde855bc726e2/socket.io-1.2.0.js"></script>
<script src="http://s7.qhimg.com/!70281da5/remote-server.js"></script>
<script type="text/javascript">
  var rs = new RemoteServer();
  rs.on('keydown', function f(ev){
    var key = ev.data.key;
    if(Reveal[key]){
      Reveal[key](); 
    }
  });
  rs.on('swipeend', function f(ev){
    var key = ev.data.direction;
    if(Reveal[key]){
      Reveal[key](); 
    }
  });
  rs.drawQRCode();
</script>
```

1. Add [socket.io](https://github.com/socketio/socket.io) and [remote-server.js](http://s0.qhimg.com/!a4b912de/remote-server.js) to the web page you want to control.

2. Create a RemoteServer object, registered the events to handle.

3. Call drawQRCode function to draw two-dimensional code, two-dimensional code will be displayed by press **TAB** key on your web page.

4. Scan two-dimensional code on your web page with your mobile device.

5. Control your web page through your device.

## Demo

[reveal slide](http://remote.baomitu.com/static/demo/reveal/index.html)

## Basic Events

* keydown, keyup, keypress

```js
var rs = new RemoteServer();
rs.on('keypress', function(ev){
	console.log('You pressed:' + ev.data.key);
});
```

* swipestart, swipeend, swiping (on `C` key) 

```js
var rs = new RemoteServer();
rs.on('swipeend', function(ev){
	console.log('Swiped:' + ev.data.direction);
});
```

* pinchstart, pinchend, pinch (on `C` key)

```js
var rs = new RemoteServer();
rs.on('pinchend', function(ev){
	console.log('Scale:' + ev.data.scale);
});
```

* rotate (on `C` key)

```js
var rs = new RemoteServer();
rs.on('rotate', function(ev){
	console.log('Rotation:' + ev.data.rotation);
	console.log('Direction:' + ev.data.direction);
});
```

* A, B, C, R, S (named key events)

```js
var rs = new RemoteServer();
rs.on('R', function(){
	console.log('R key pressed');
});
```

* swipeup, swipedown, swipeleft, swiperight (on `C` key)

```js
var rs = new RemoteServer();
rs.on('swipeleft', function(){
	Reveal.left();
});
```

* pinchin, pinchout (on `C` key)

```js
var rs = new RemoteServer();
rs.on('pinchin', function(ev){
	$(myEl).css('transform', 
		'scale(' + ev.data.scale +')');
});
```

* rotateleft, rotateright (on `C` key)

```js
var rs = new RemoteServer();
rs.on('rotateleft', function(ev){
	...
});
```

* orientationchange, motionchange

```js
var rs = new RemoteServer();
rs.on('orientationchange', function(ev){
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

## For developers

**Change displaying mode fo QRCode**

The default two-dimensional code displaying mode is press `TAB` key, pass a html element to the drawQRCode function can be customized to show the code.

```js
var qrcodeEl = document.getElementById('qrcode');
rs.drawQRCode(qrcodeEl);
```

**Filter Events**

```js
var rs = new RemoteServer({
	//Make the remote controller only send keypress and swipeend events
  	eventList: ['keypress', 'swipeend']	
});
```

**Customize SDK**

```bash
git clone https://github.com/akira-cn/remote.git
```

1. Get latest code from github.

2. Edit src/remote-server.js

3. Use [webpack](https://webpack.github.io) to build.

4. Deploy dist/remote-server.umd.js

**Customize Remote Controller**

1. Get laster code from github.

2. Edit src/remote-client.js

3. Use [webpack](https://webpack.github.io) to build.

4. Deploy dist/remote-client.umd.js

5. When calling drawQRCode, passing a new parameter to specify a new url.

```js
rs.drawQRCode(null, "http://my.remote-service/pathname/?sid=?");  //URL必须要带上参数sid
```

**Customize socket.io service**

Remote control is based on socket, socket.io services basically only do the pairing and forwarding message function, so the code of socket.io service does not need to be modified, if you want the message service to run on your own server, you can get and deploy it.

Socket service is based on the [ThinkJS] (http://new.thinkjs.com/) framework, you can refer to the ThinkJS document.

## Thanks

[code.baidu](https://github.com/Clouda-team/touch.code.baidu.com)

[qrcodejs](https://github.com/davidshimjs/qrcodejs)

[mobvii](https://github.com/75team/mobvii/)

[thinkjs](https://github.com/75team/thinkjs/)

## LICENSE
[MIT](LICENSE)

## Chinese README

[中文版](README_cn.md)
