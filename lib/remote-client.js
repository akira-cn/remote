'use strict';
(function(root, factory) {
  if (typeof define === 'function' && (define.amd || define.cmd)) {
    define(factory); //Register as a module.
  } else {
    root.Remote = factory();
  }
}(this, function() {
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
  function Client(server, connected){
    if(typeof server === 'function'){
      connected = server;
      server = null;
    }

    var socket = io(server || "http://www.h5jun.com:8360");
    var self = this;

    socket.on("connected", function(data){
      self.src = data.sid;
      self.target = data.tid;

      connected && connected(data.err, socket);

      self.trigger('client_connected');
    });

    this.socket = socket;    
  }

  Client.prototype.trigger = function(event, data){
    var socket = this.socket;
    socket && 
    socket.emit("event", {target:this.target, type: event, src: this.src, data: data});
  }

  return {
    Client: Client
  };
}));