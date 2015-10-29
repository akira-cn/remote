var QRCode = require('../lib/qrcode.js');

/**
 * 
    var client = new Remote.Client(server, function(err){
      if(!err){
          ...
          client.trigger(...);
      }else{
          console.log('server error');
      }
    });
 */
var handlers = {};

function Server(server, connected){
  if(typeof server === 'function'){
    connected = server;
    server = null;
  }

  var socket = io(server || "http://remote.baomitu.com:9699");
  var self = this;
  
  socket.on("connected", function(ev){
    console.log(ev);
    self.src = ev.sid;
    connected && connected(ev.err, socket);
  });
  
  this.socket = socket;

  //默认的filter
  this.filters = {
    'up': function(type, ev){
      if(ev.type === 'keypress'){
        var data = ev.data;
        if(data.key === 'up'){
          ev.realType = type;
          return true;
        }
      }  
    },
    'down': function(type, ev){
      if(ev.type === 'keypress'){
        var data = ev.data;
        if(data.key === 'down'){
          ev.realType = type;
          return true;
        }
      }  
    },
    'left': function(type, ev){
      if(ev.type === 'keypress'){
        var data = ev.data;
        if(data.key === 'left'){
          ev.realType = type;
          return true;
        }
      }  
    },
    'right': function(type, ev){
      if(ev.type === 'keypress'){
        var data = ev.data;
        if(data.key === 'right'){
          ev.realType = type;
          return true;
        }
      }  
    },
    'rotateleft': function(type, ev){
      if(ev.type === 'rotate'){
        var data = ev.data;
        if(data.direction === 'left'){
          ev.realType = type;
          return true;
        }
      }        
    },
    'rotateright': function(type, ev){
      if(ev.type === 'rotate'){
        var data = ev.data;
        if(data.direction === 'right'){
          ev.realType = type;
          return true;
        }
      }        
    },
    'pinchout': function(type, ev){
      if(ev.type === 'pinchend'){
        var data = ev.data;
        if(data.scale > 1.0){
          ev.realType = type;
          return true;
        }
      }        
    },
    'pinchin': function(type, ev){
      if(ev.type === 'pinchend'){
        var data = ev.data;
        if(data.scale < 1.0){
          ev.realType = type;
          return true;
        }
      }        
    },
    'swipeup': function(type, ev){
      if(ev.type === 'swipeend'){
        var data = ev.data;
        if(data.direction === 'up'){
          ev.realType = type;
          return true;
        }
      }
    },
    'swipedown': function(type, ev){
      if(ev.type === 'swipeend'){
        var data = ev.data;
        if(data.direction === 'down'){
          ev.realType = type;
          return true;
        }
      }
    },
    'swipeleft': function(type, ev){
      if(ev.type === 'swipeend'){
        var data = ev.data;
        if(data.direction === 'left'){
          ev.realType = type;
          return true;
        }
      }
    },
    'swiperight': function(type, ev){
      if(ev.type === 'swipeend'){
        var data = ev.data;
        if(data.direction === 'right'){
          ev.realType = type;
          return true;
        }
      }
    },
    'default': function(type, ev){
      ev.realType = type;
      return type === ev.type;
    }
  };

  this.QRCodeKey = 9; //默认tab键
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
  client = client || 'http://remote.baomitu.com/socketio/?sid=?';

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
    var QRCodeKey = this.QRCodeKey;
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

module.exports = {
  RemoteServer: Server
};