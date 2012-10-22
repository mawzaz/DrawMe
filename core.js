function Core(){
  this._events = {};
  this.canvasPos = $('#canvas').offset();
  this.canvasPos.w = $('#canvas').width();
  this.canvasPos.h = $('#canvas').height();
}

Core.prototype = {
  listen : function(evhandler,fn){
    if(typeof(fn) != 'function'){
      return;
    }

    if(!this._events[evhandler]){
      this._events[evhandler] = [];
    }

    this._events[evhandler].push(fn);
  },

  run : function(evhandler,data){
    for(var i in this._events[evhandler]){
      this._events[evhandler][i](data);
    }
  },

}