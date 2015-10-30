var QRCode = require('../lib/qrcode.js');

/**
 * 
    var server = new RemoteServer({
      socket: 'http://myhost/pathname:port',
      eventList: [],
      connected: function(err){
        if(!err){
            ...
            client.trigger(...);
        }else{
            console.log('server error');
        }
      }
    });
    server.drawQRCode();
 */
var handlers = {};
var defaultConfig = {
  socket: 'http://remote.baomitu.com:9699',
  client: 'http://remote.baomitu.com/socketio/?sid=?',
  QRCodeKey: 9, //默认tab键
  eventList: null,  //过滤接收的命令，默认为接收所有命令
};

function Server(config){
  config = config || {};
  for(var i in defaultConfig){
    if(!(i in config)){
      config[i] = defaultConfig[i];
    }
  }
  this.config = config;

  var socket = io(config.socket);
  var self = this;
  
  socket.on("connected", function(ev){
    console.log(ev);
    self.src = ev.sid;
    config.connected && config.connected(ev.err, socket);
  });
  
  this.socket = socket;

  function definedEventKey(type, ev){
    if(ev.type === 'keypress'){
      var data = ev.data;
      if(data.key === type){
        ev.realType = type;
        return true;
      }
    } 
  }

  function definedEventRotate(type, ev){
    if(ev.type === 'rotate'){
      var data = ev.data;
      if(data.direction === type.slice(6)){
        ev.realType = type;
        return true;
      }
    }      
  }

  function definedEventSwipe(type, ev){
    if(ev.type === 'swipeend'){
      var data = ev.data;
      if(data.direction === type.slice(5)){
        ev.realType = type;
        return true;
      }
    }
  }

  //默认的filter
  this.filters = {
    up:     definedEventKey,
    down:   definedEventKey,
    left:   definedEventKey,
    right:  definedEventKey,
    A:      definedEventKey,
    B:      definedEventKey,
    R:      definedEventKey,
    S:      definedEventKey,

    rotateleft: definedEventRotate,
    rotateright: definedEventRotate,
    
    pinchout: function(type, ev){
      if(ev.type === 'pinchend'){
        var data = ev.data;
        if(data.scale > 1.0){
          ev.realType = type;
          return true;
        }
      }        
    },
    pinchin: function(type, ev){
      if(ev.type === 'pinchend'){
        var data = ev.data;
        if(data.scale < 1.0){
          ev.realType = type;
          return true;
        }
      }        
    },

    swipeup: definedEventSwipe,
    swipedown: definedEventSwipe,
    swipeleft: definedEventSwipe,
    swiperight: definedEventSwipe,

    'default': function(type, ev){
      ev.realType = type;
      return type === ev.type;
    }
  };

  var eventListMaps = {
    'up': 'keypress',
    'down': 'keypress',
    'left': 'keypress',
    'right': 'keypress',
    'A': 'keypress',
    'B': 'keypress',
    'C': 'keypress',
    'R': 'keypress',
    'S': 'keypress',

    'rotateleft': 'rotate',
    'rotateright': 'rotate',

    'pinchin': 'pinchend',
    'pinchout': 'pinchend',

    'swipeup': 'swipeend',
    'swipedown': 'swipeend',
    'swipeleft': 'swipeend',
    'swiperight': 'swipeend',
  };

  if(config.eventList != null){
    this.on('client_connected', function(ev){
      var eventList = config.eventList;
      var realEventList = [];

      for(var i = 0; i < eventList.length; i++){
        var event = eventList[i];
        event = eventListMaps[event] || event;

        if(realEventList.indexOf(event) < 0){
          realEventList.push(event);
        }
      }
      //console.log('-->', ev);
      var data = ev.data;
      self.notify(data.sid, {
        config: {
          eventList: realEventList
        }
      });
    });
  }
}

Server.prototype.on = function(type, func){
  var filters = this.filters;

  var handler = function(ev){
    //console.log(type, ev);
    var filter = filters[type] || filters['default'];
    if(filter.call(this, type, ev)){
      func.call(this, ev);
    }
  }

  this.socket.on('event', handler);

  handlers[type] = handlers[type] || [];
  handlers[type].push({handler:handler, func: func});
}

Server.prototype.off = function(type, func){
  var funcs = handlers[type];
  var funcsLeft = [];

  for(var i = 0; i < funcs.length; i++){
    var f = funcs[i];
    if(!func || f.func === func){
      this.socket.off('event', f.handler);
    }else{
      funcsLeft.push(f);
    }
  }
  handlers[type] = funcsLeft;
}

Server.prototype.drawQRCode = function(el, client){
  var config = this.config;
  client = client || config.client;

  if(typeof el === 'string'){
    el = document.getElementById(el);
  }
  if(!el){
    var mask = document.createElement('div');
    mask.style.cssText = 'display:none;position:absolute;width:100%;height:100%;left:0;top:0;background:rgba(0,0,0,0.618);z-index:99999999';
    var el = document.createElement('div');
    el.style.cssText = 'position:absolute;display:inline-block;top:50%;left:50%;margin-top:-128px;margin-left:-128px;'
    mask.appendChild(el);
    document.body.appendChild(mask);
    var QRCodeKey = config.QRCodeKey;
    document.body.onkeydown = function(ev){
      if(ev.keyCode === QRCodeKey){
        mask.style.display = mask.style.display === 'none'?'block':'none';
        ev.preventDefault();
      }
    }
    this.on('client_connected', function(){
        mask.style.display = 'none';
    });
  }
  var self = this;
  if(this.src){
    new QRCode(el, client.replace('=?', '='+this.src));
  }else{
    this.socket.on('connected', function(){
      new QRCode(el, client.replace('=?', '='+self.src));
    });
  }
}

Server.prototype.notify = function(target, data){
  if(typeof target !== 'string'){
    data = target;
    target = undefined;
  }

  var socket = this.socket;
  socket && 
  socket.emit("notify", {type: "notify", src: this.src, data: data, target: target});
}

module.exports = {
  RemoteServer: Server
};