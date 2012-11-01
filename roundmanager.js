function RoundManager(){
  var self = this;

  this._nb = 0;
  this._time = 0;
  this._drawer = null;
  this_synchronizectn = null;

  var canvasPos = CoreM.canvasPos;

  var round_ctn = document.createElement('div');
  document.body.appendChild(round_ctn);
  round_ctn.className = 'round-ctn';
  $(round_ctn).css({
    top:canvasPos.top+'px',
    left:canvasPos.left+'px'
  });

  var round_label = document.createElement('div');
  round_label.className = 'round-label';
  $(round_label).html('round');

  this._round_nb = document.createElement('div');
  this._round_nb.className = 'round-nb-ctn';

  $(round_ctn).append(round_label);
  $(round_ctn).append(this._round_nb);

  var round_timer_ctn = document.createElement('div');
  round_timer_ctn.className = 'round-ctn';
  document.body.appendChild(round_timer_ctn);
  $(round_timer_ctn).css({
    top:canvasPos.top + 'px',
    left:canvasPos.left + canvasPos.w - $(round_timer_ctn).width() - 8 + 'px'
  });

  var round_timer_label = document.createElement('div');
  round_timer_label.className = 'round-label';
  $(round_timer_label).html('time');
  $(round_timer_ctn).append(round_timer_label);

  this._round_timer = document.createElement('div');
  this._round_timer.id = 'round-timer';
  this._round_timer.className = 'round-nb-ctn';
  $(round_timer_ctn).append(this._round_timer);

  //TODO: REMOVE THIS
  $(this._round_nb).html(0);
  $(this._round_timer).html(0);

  //add listeners
  CoreM.listen('Round Start',function(round){self.start(round)});
  CoreM.listen('Round End',function(round){self.end(round)});
  CoreM.listen('Countdown',function(round){self.countdown(round)});

}

RoundManager.prototype = {
  start : function(round){
    this._time = round.time
    this._drawer = round.drawer;
    this._nb = round.nb;
    
    if(this._synchronize(round)){
      $(this._round_nb).removeClass('round-over');
      $(this._round_timer).removeClass('round-over');

      this.countdown(round);
      $(this._round_nb).html(round.nb);

      this._notify();
      
      if(round.drawer === UM.me.guid){
        this._generateUI(round.word);
        Page.enable();
      }
    }
  },

  end : function(round){
    this._time = round.time;
    if(this._synchronize(round)){
      $(this._round_nb).addClass('round-over');
      $(this._round_timer).addClass('round-over');
      this._removeDrawerUi();
      Page.disable();
    }
  },

  countdown : function(round){
    this._time = round.time;
    if(this._synchronize(round)){
      $(this._round_timer).html(round.time);

      if(round.time < 16){
        $(this._round_timer).addClass('round-over');
      }else{
        $(this._round_timer).removeClass('round-over');
      }
    }
  },

  _synchronize : function(round){
    // $(this._synchronize).remove();
    // if(!(round.time === this._time && round.drawer === this._drawer && round.nb == this._nb)){
    //   this._synchronizectn = document.createElement('div');
    //   this._synchronizectn.id = 'synchronize-ctn';
    //   document.body.appendChild(this._synchronizectn);
    //   return false;
    // }
    return true;
  },

  _notify : function(){
    var div = document.createElement('div');
    div.className = 'drawer-notification';
    document.body.appendChild(div);

    var msg = document.createElement('div');
    msg.id = 'idle-ctn';
    $(msg).height(150);

    $(msg).html('D R A W!');

    div.appendChild(msg);

    $(div).fadeOut(1000,function(){
      $(div).remove();
    });
  },

  _generateUI : function(word){
    var canvasPos = CoreM.canvasPos;

    var wordctn = document.createElement('div');
    wordctn.id = 'word-ctn';
    $(wordctn).html(word);
    document.body.appendChild(wordctn);
    $(wordctn).css({
      top: canvasPos.top+'px',
      left: canvasPos.left+'px',
      width: canvasPos.w+'px'
    })

    var colorpalette = document.createElement('div');
    colorpalette.id = 'color-palette-ctn';
    document.body.appendChild(colorpalette);
    $(colorpalette).css({
      top: canvasPos.top + canvasPos.h - $(colorpalette).height() +'px',
      left: canvasPos.left+'px',
      width : canvasPos.w+'px'
    });

    var marker = function(color,image){
      var ctn = document.createElement('image');
      ctn.className = 'marker-ctn';
      $(ctn).click(function(){
        if(selectedMarker){
          selectedMarker.unselect();
        }

        var openImage = image.split('.')[0]+'-open.png';

        $(ctn).css('background-image','url('+openImage+')');
        Page.color = color;
        selectedMarker = ctn;
      });

      ctn.unselect = function(){
        $(ctn).css('background-image','url('+image+')');
      }

      ctn.unselect();

      colorpalette.appendChild(ctn);
    }

    this._drawerui ={ wordctn : wordctn, colorpalette : colorpalette};

    // var bluemarker = marker('blue','/images/blue-marker.png');
    // var greenmarker = marker('green','/images/green-marker.png');
    // var pinkmarker = marker('pink','/images/pink-marker.png');
    // var yellowmarker = marker('yellow','/images/yellow-marker.png');

    // $(bluemarker).click();
  },

  _removeDrawerUi :function(){
    if(this._drawerui){
      $(this._drawerui.wordctn).remove();
      $(this._drawerui.colorpalette).remove();
    }
  },

  getDrawer : function(){
    return this._drawer;
  }
}