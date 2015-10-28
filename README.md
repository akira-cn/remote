# Remote 远程控制SDK

基于socket.io的远程控制SDK，允许你的PC网页被手机终端远程控制

## 快速上手

1. 在你要控制的网页上加上socket.io和remote-server.js

```html
<script src="http://s4.qhimg.com/static/535dde855bc726e2/socket.io-1.2.0.js"></script>
<script src="http://s6.qhimg.com/!b91bd712/remote-server.js"></script>
<script type="text/javascript">
  var rs = new Remote.Server();
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

2. 在网页打开后按TAB键唤出二维码，手机扫描二维码绑定控制器

3. 用控制器对远程网页进行控制。

## 支持的事件

keydown, keyup, keypress, swipestart, swipeend, swiping, pinchstart, pinchend, pinch, rotate

## demo

[reveal slide](http://s.h5jun.com/slide)

