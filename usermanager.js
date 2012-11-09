function UserManager(){
  this.players = {};

  this.me = new Player();
}

UserManager.prototype = {
  add : function(player){
    if(!this.players[player.guid]){
      this.players[player.guid] = player;
      return true;
    }
    else
      return false;
  },
  remove : function(player){
    if(player)
      delete this.players[player.guid];
  },

  get : function(guid){
    return this.players[guid];
  },

  length : function(){
    var count = 0;
    for(var i in this.players){
      count++;
    }

    return count;
  }
}