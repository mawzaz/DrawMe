function Player(params){
  this._firstNames = new Array("Runny", "Buttercup", "Dinky", "Stinky", "Crusty", "Greasy", "Gidget", "Cheesypoof", "Lumpy", "Wacky", "Tiny", "Flunky", "Fluffy", "Zippy", "Doofus", "Gobsmacked", "Slimy", "Grimy", "Salamander", "Oily", "Burrito", "Bumpy", "Loopy", "Snotty", "Irving", "Egbert");
  this._lastNames = new Array("Snicker", "Buffalo", "Gross", "Bubble", "Sheep", "Corset", "Toilet", "Lizard", "Waffle", "Kumquat", "Burger", "Chimp", "Liver", "Gorilla", "Rhino", "Emu", "Pizza", "Toad", "Gerbil", "Pickle", "Tofu", "Chicken", "Potato", "Hamster", "Lemur", "Vermin");
  this._lastNames2 = new Array("face", "dip", "nose", "brain", "head", "breath", "pants", "shorts", "lips", "mouth", "muffin", "butt", "bottom", "elbow", "honker", "toes", "buns", "spew", "kisser", "fanny", "squirt", "chunks", "brains", "wit", "juice", "shower");
  
  params = params || {};
  this.name = params.name || this._generateName();
  this.color = params.color || this._generateColor();
  this.guid = params.guid || this._generateGuid();

  var div = document.createElement('div');
  div.className = 'player-name';
  $(div).html(this.name);
  $(div).css({
    color:this.color
  })

  this.ui = div;

}

Player.prototype = {
  _generateName : function(){
    return this._firstNames[Math.floor(Math.random()*this._firstNames.length)]+' '+this._lastNames[Math.floor(Math.random()*this._lastNames.length)];+this._lastNames2[Math.floor(Math.random()*this._lastNames2.length)];
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