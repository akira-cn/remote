# Remote 远程控制SDK

基于socket.io的远程控制SDK，允许你的PC网页被手机终端远程控制

## 快速上手

```html
<script src="http://s4.qhimg.com/static/535dde855bc726e2/socket.io-1.2.0.js"></script>
<script src="http://s8.qhimg.com/!e519dfc4/remote-server.umd.js"></script>
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

3. 在网页打开后按TAB键唤出二维码，手机扫描二维码绑定控制器

4. 用控制器对远程网页进行控制。

## 支持的事件

keydown, keyup, keypress, swipestart, swipeend, swiping, pinchstart, pinchend, pinch, rotate

## 示例

[reveal slide](http://s.h5jun.com/slide)

## 开发者高级功能

*修改服务SDK*

```bash
git clone https://github.com/akira-cn/remote.git
```

1. 获取项目到本地

2. 编辑 src/remote-server.js

3. 使用 [webpack](https://webpack.github.io) 构建项目

4. 发布 dist/remote-server.umd.js

*自定义遥控器*

1. 获取项目到本地

2. 编辑 src/remote-client.js

3. 使用 [webpack](https://webpack.github.io) 构建项目

4. 发布 dist/remote-client.umd.js

5. 在使用服务SDK的时候，修改drawQRCode的参数使得二维码指向新的遥控器路径

```js
rs.drawQRCode(null, "http://my.server/pathname/?sid=?");  //URL必须要带上参数sid
```

*修改或自己部署 socket.io 中转服务*

remote远程控制是基于socket.io的，socket服务基本上只做配对和转发消息的功能，所以一般情况下不需要修改，如果希望消息服务走自己的服务器，可以自己部署。

socket服务在 socketio/server 下，是基于 [thinkJS 2.0](http://new.thinkjs.org/) 的服务，可以参考 thinkJS 文档进行部署。
