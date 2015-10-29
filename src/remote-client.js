'use strict';

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

var touch = require('../lib/touch.js');

function Client(server, connected){
  if(typeof server === 'function'){
    connected = server;
    server = null;
  }

  var socket = io(server || "http://remote.baomitu.com:9699");
  var self = this;

  socket.on("connected", function(data){
    console.log(data);
    
    self.src = data.sid;
    self.target = data.tid;

    connected && connected(data.err, socket);

    self.trigger('client_connected');
  });

  touch.config.swipeMinDistance = 50;

  touch.on('.panel', 'touchstart', function(ev){
      var target = ev.target.parentNode;
      var id = target.id;
      if(id !== 'center'){
        $(target).css('opacity', 0.5);
        rc.trigger('keydown', {key: id, timeStamp: ev.timeStamp});
      }
  });

  touch.on('.panel', 'touchend', function(ev){
    var target = ev.target.parentNode;
    var id = target.id;
    if(id !== 'center'){
      $(target).css('opacity', 1.0);
      rc.trigger('keyup', {key: id, timeStamp: ev.timeStamp});
    }
  });

  touch.on('.panel', 'tap', function(ev){
    var target = ev.target.parentNode;
    var id = target.id;
    //console.log(ev);
    if(id !== 'center'){
      rc.trigger('keypress', {key: id, timeStamp: ev.timeStamp});  
    }  
  });

  touch.on('#center', 'swipestart swipeend swiping', function(ev){
    var target = ev.target.parentNode;
    //console.log(ev);
    rc.trigger(ev.type, {
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

  touch.on('#center', 'pinchstart pinchend pinch', function(ev){
    var target = ev.target.parentNode;
    //console.log(ev);
    rc.trigger(ev.type, {
      timeStamp: ev.timeStamp,
      direction: ev.direction,
      rotation: ev.rotation,
      scale: ev.scale,
      fingersCount: ev.fingersCount,
      factor: ev.factor
    });    
  });

  touch.on('#center', 'rotate', function(ev){
    var target = ev.target.parentNode;
    rc.trigger('rotate', {
      timeStamp: ev.timeStamp,
      direction: ev.direction,
      rotation: ev.rotation,
    });    
  });

  this.socket = socket;    
}

Client.prototype.trigger = function(event, data){
  var socket = this.socket;
  socket && 
  socket.emit("event", {type: event, src: this.src, data: data});
}

module.exports = {
  RemoteClient: Client
};
