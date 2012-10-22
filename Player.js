function Player(params){  
  params = params || {};
  this.name = params.name || this._generateName();
  this.color = params.color || this._generateColor();
  this.guid = params.guid || this._generateGuid();

  var div = document.createElement('div');
  div.className = 'player-name';
  $(div).html(this.name);
  $(div).css({
    color:this.color
  });

  this.ui = div;

}

Player.prototype = {
  _generateName : function(){
    return firstNames[Math.floor(Math.random()*firstNames.length)]+' '+lastNames[Math.floor(Math.random()*lastNames.length)];+lastNames2[Math.floor(Math.random()*lastNames2.length)];
  },

  _generateColor : function(){
    var red = Math.floor((Math.random()*255));
    var green = Math.floor((Math.random()*255));
    var blue = Math.floor((Math.random()*255));

    return 'rgba('+red+','+green+','+blue+',0.8)';
  },

  _generateGuid : function(){
    var S4 = function ()
    {
        return Math.floor(
                Math.random() * 0x10000 /* 65536 */
            ).toString(16);
    };

    return (
            S4() + S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + S4() + S4()
        );
  },

  leave : function(){
    $(this.ui).remove();
  },

  flatten : function(){
    return {name:this.name.replace('*',''), color:this.color, guid:this.guid};
  }
}