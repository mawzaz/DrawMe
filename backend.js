function Backend(room){
  var self = this;
  this._socket = io.connect();

  this._socket.on('connect',function(){
    self._socket.emit('room_connect',{room:room,player:UM.me.flatten()},function(data){self.room_connect(data)});
    self._socket.on('on_room_update',function(data){self.processMessage(data)});
    self._socket.on('drawing',function(data){App.processStroke(data)});
  });
}

Backend.prototype = {
  processMessage : function(message){
    switch(message.type){
      case 'chat':
        App.newChatMsg(message.chat);
        break;
      case 'user_add':
        App.addPlayer(message.player,true);
        break;
      case 'user_remove':
        App.removePlayer(message.player);
        break;
      // case 'stroke':
      //   App.addStroke(message.stroke);
      //   break;
      case 'clock':
        console.log('Time left: '+message.round.time);
        CoreM.run('Countdown',message.round);
        break;
      case 'pre_round_start':
        CoreM.run('Pre Round Start',message.round)
        break;
      case 'round_start':
        console.log('Begining round ' + message.round.nb);
        console.log(message.round);
        CoreM.run('Round Start',message.round);
        break;
      case 'round_end':
        console.log('Ending round ' + message.round.nb);
        console.log(message.round);
        CoreM.run('Round End',message.round);
        break;
      case 'results':
        CoreM.run('Results',message);
        break;
      case 'idle':
        App.idle();
        console.log('waiting for 1 more player...');
    } 
  },

  publish : function(message,cb){
    this._socket.emit('room_update',message,cb);
  },

  sendStroke : function(stroke){
    if(stroke)
      this._socket.emit('drawing',stroke);
  },

  room_connect : function(data){
    alert('Welcome to DrawMe! :)');
    //add users and strokes that are in progress
    App.addPlayers(data.users);
    App.pickDrawer(data.round);

    if(!data.round.nb && UM.length() < 2){
      console.log('waiting for 1 more player...');
      App.idle();
    }

    if(data.round.drawer !== UM.me.guid){
      App.showChat();
    }

    if(data.round.drawing){
      App.deferredWork.push(function(){App.addStrokes(data.round.drawing)});
    }

    App.busy = false;
    App.runDeferredWork();
    
  }
}