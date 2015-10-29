'use strict';

import Base from './base.js';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  indexAction(){
    var sid = this.get('sid');
    this.assign({
      sid: sid
    });
    this.display();
  }
  testAction(){
    this.display();
  }
  openAction(){
    console.log('socket opened');

    var ref = this.http.headers.referer;
    var url = require('url');

    var query = url.parse(ref).query;
    //console.log(query);
    var target;

    if(query){
      var qs = require('qs');
      target = qs.parse(query).sid;
    }

    var io = this.http.io,
        socket = this.http.socket;
    
    //console.log(target);
    if(target){
      socket._tid = target;
    }else{
      //对新的server计算一个token，这个token在断线之后恢复连接使用
      function md5(str) {
        return require('crypto').createHash('md5').update(str, 'utf8').digest('hex');
      }

      console.log(this.http.ip(), ref);
      //用ip+ref算md5签名的方式
      var token = md5(this.http.ip() + ref);
      socket._token = token;

      var connected = io.sockets.connected;

      for(var i in connected){
        var s = connected[i];
        if(s._token === token){
          if(s._tid){
            console.log(s._tid + ' reconnected.');
            s._tid = socket.id;
          }
        }
      }
    }

    //console.log(io.sockets);
    this.emit('connected', {err:'', sid: socket.id, tid: target, token: token});
  }
  closeAction(){
    console.log('socket closed');
  }
  eventAction(){
    console.log('event received');
    console.log(this.http.data);

    var data = this.http.data;

    var io = this.http.io,
        socket = this.http.socket;

    var target_id = socket._tid;

    var target = io.sockets.connected[target_id];

    if (target) {
      //console.log(target._token);
      socket._token = target._token;
      target.emit('event', data);
      var type = data.type;
      if(type){
        target.emit(type, data);
      }
    }
  }
}