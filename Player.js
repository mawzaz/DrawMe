function Player(params){  
  params = params || {};
  params.color = params.color || this._generateRandomColor();
  this.name = params.name || this._generateName();

  this.color = this._generateColor(params.color[0],params.color[1],params.color[2]);
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

  _generateColor : function(red,green,blue){
    return 'rgba('+red+','+green+','+blue+',0.8)';
  },

  _generateRandomColor : function(){
    red = Math.floor((Math.random()*255));
    green = Math.floor((Math.random()*255));
    blue = Math.floor((Math.random()*255));
    arr = [red,green,blue];

    return arr;
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