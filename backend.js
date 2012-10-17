function Backend(room){
  var self = this;
  this._socket = io.connect();

  this._socket.on('connect',function(){
    self._socket.emit('room_connect',{room:room,player:UM.me.flatten()},function(data){self.room_connect(data)});
    self._socket.on('on_room_update',function(data){self.processMessage(data)});
  });


}

Backend.prototype = {
  processMessage : function(message){
    switch(message.type){
      case 'chat':
        App.newChatMsg(message.chat);
        break;
      case 'user_add':
        App.addPlayer(message.player);
        break;
      case 'user_remove':
        App.removePlayer(message.player);
        break;
      case 'stroke':
        App.addStroke(message.stroke)
        break;
    }
  },

  publish : function(message,cb){
    this._socket.emit('room_update',message,cb);
  },

  room_connect : function(data){
    alert('Welcome to DrawMe! :)');
    //add users and strokes that are in progress
    App.addPlayers(data.users);
  }
}