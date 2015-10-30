'use strict';

/**
 * 
    var client = new RemoteClient({
      socket: 'http://myhost/pathname:port',
      connected: function(err){
        if(!err){
            ...
            client.trigger(...);
        }else{
            console.log('server error');
        }
      }
    });
 */

var touch = require('../lib/touch.js');
var defaultConfig = {
  socket: 'http://remote.baomitu.com:9699',
  eventList: null,   //允许发送的事件，null为默认发送全部事件
  orientationThredshold: 5,  //位置变化事件触发的最小度数
  motionThreshold: 0.5 //加速度变化事件触发的最小值
};

function Client(config){
  config = config || {};
  for(var i in defaultConfig){
    if(!(i in config)){
      config[i] = defaultConfig[i];
    }
  }
  this.config = config;

  var socket = io(config.socket);
  var self = this;

  socket.on("connected", function(data){
    //console.log(data);
    
    self.src = data.sid;
    self.target = data.tid;

    config.connected && config.connected(ev.err, socket);

    self.trigger('client_connected', data);
  });

  touch.config.swipeMinDistance = 50;

  touch.on('.panel', 'touchstart', function(ev){
      var target = ev.target.parentNode;
      var id = target.id;

      $(target).css('opacity', 0.5);
      self.trigger('keydown', {key: id, timeStamp: ev.timeStamp});
  });

  touch.on('.panel', 'touchend', function(ev){
    var target = ev.target.parentNode;
    var id = target.id;

    $(target).css('opacity', 1.0);
    self.trigger('keyup', {key: id, timeStamp: ev.timeStamp});
  });

  touch.on('.panel', 'tap', function(ev){
    var target = ev.target.parentNode;
    var id = target.id;
    //console.log(ev);
    self.trigger('keypress', {key: id, timeStamp: ev.timeStamp});  
  });

  touch.on('#C', 'swipestart swipeend swiping', function(ev){
    var target = ev.target.parentNode;
    //console.log(ev);
    self.trigger(ev.type, {
      timeStamp: ev.timeStamp,
      position: ev.position,
      direction: ev.direction,
      distance: ev.distance,
      distanceX : ev.distanceX,
      distanceY : ev.distanceY,
      x : ev.x,
      y : ev.y,
      angle: ev.angle,
      duration: ev.duration,
      fingersCount: ev.fingersCount,
      factor: ev.factor
    });    
  });

  touch.on('#C', 'pinchstart pinchend pinch', function(ev){
    var target = ev.target.parentNode;
    //console.log(ev);
    self.trigger(ev.type, {
      timeStamp: ev.timeStamp,
      direction: ev.direction,
      rotation: ev.rotation,
      scale: ev.scale,
      fingersCount: ev.fingersCount,
      factor: ev.factor
    });    
  });

  touch.on('#C', 'rotate', function(ev){
    var target = ev.target.parentNode;
    self.trigger('rotate', {
      timeStamp: ev.timeStamp,
      direction: ev.direction,
      rotation: ev.rotation,
    });    
  });

  if(window.DeviceOrientationEvent){
    var alpha = 0, beta = 0, gamma = 0;
    window.addEventListener("deviceorientation", function(ev){
      var _alpha = ev.alpha;
      var _beta = ev.beta;
      var _gamma = ev.gamma;

      var threshold = config.orientationThredshold;
      var da = Math.abs(_alpha - alpha),
          db = Math.abs(_beta - beta),
          dg = Math.abs(_gamma - gamma);

      if(da > threshold && Math.abs(da - 360) > threshold
        || db > threshold && Math.abs(db - 360) > threshold
        || dg > threshold && Math.abs(dg - 360) > threshold){
        self.trigger('orientationchange', {
          oldValue: {
            alpha: alpha,
            beta: beta,
            gamma: gamma,
          },
          newValue: {
            alpha: _alpha,
            beta: _beta,
            gamma: _gamma,        
          },
          timeStamp: Date.now()
        });
        alpha = _alpha;
        beta = _beta;
        gamma = _gamma;
      }
    });
    var accelerationX = 0, accelerationY = 0, accelerationZ = -10;
    window.addEventListener("devicemotion", function(ev){
      var x = event.accelerationIncludingGravity.x;
      var y = event.accelerationIncludingGravity.y;
      var z = event.accelerationIncludingGravity.z;  

      var threshold = config.motionThreshold;

      if(Math.abs(x - accelerationX) > threshold
        || Math.abs(y - accelerationY) > threshold
        || Math.abs(z - accelerationZ) > threshold){
        self.trigger('motionchange', {
          oldValue: {
            x: accelerationX,
            y: accelerationY,
            z: accelerationZ,
          },
          newValue: {
            x: x,
            y: y,
            z: z,        
          },
          timeStamp: Date.now()
        }); 
        accelerationX = x;
        accelerationY = y;
        accelerationZ = z;        
      }
    });
  }

  this.socket = socket;

  socket.on('notify', function(ev){
    if(ev && ev.data && ev.data.config){

      var config = ev.data.config;
      for(var i in config){
        self.config[i] = config[i];
      }
    }
  });    
}

Client.prototype.trigger = function(event, data){
  var config = this.config;
  if(config.eventList == null || config.eventList.indexOf(event) >= 0){
    var socket = this.socket;
    socket && 
    socket.emit("event", {type: event, src: this.src, data: data});
  }
}

module.exports = {
  RemoteClient: Client
};
