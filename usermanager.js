function UserManager(){
  this.players = {};

  this.me = new Player();
}

UserManager.prototype = {
  add : function(player){
    if(!this.players[player.guid])
      this.players[player.guid] = player;
  },
  remove : function(guid){
    delete this.players[guid];
  },

  get : function(guid){
    return this.players[guid];
  }
}