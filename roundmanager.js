function RoundManager(){
  var self = this;

  this._nb = 0;
  this._time = 0;
  this._drawer = null;
  this_synchronizectn = null;

  var canvasPos = CoreM.canvasPos;

  var round_ctn = document.createElement('div');
  // document.body.appendChild(round_ctn);
  App.mainCtn.appendChild(round_ctn);

  round_ctn.className = 'round-ctn';

  var round_label = document.createElement('div');
  round_label.className = 'round-label';
  $(round_label).html('round');

  this._round_nb = document.createElement('div');
  this._round_nb.className = 'round-nb-ctn';

  $(round_ctn).append(round_label);
  $(round_ctn).append(this._round_nb);

  var round_timer_ctn = document.createElement('div');
  round_timer_ctn.className = 'round-ctn';
  // document.body.appendChild(round_timer_ctn);
  App.mainCtn.appendChild(round_timer_ctn);

  $(round_timer_ctn).hide();
  $(round_ctn).hide();
  App.deferredWork.push(function(){
    canvasPos = CoreM.getCanvasPos();
    
    $(round_timer_ctn).css({
      top:canvasPos.top + 'px',
      left:canvasPos.left + canvasPos.w - $(round_timer_ctn).width() - 8 + 'px'
    });
    $(round_ctn).css({
      top:canvasPos.top+'px',
      left:canvasPos.left+'px'
    });
    $(round_timer_ctn).show();
    $(round_ctn).show();
  })

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

      this._notify(round);
      
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

  _notify : function(round){
    var div = document.createElement('div');
    div.className = 'drawer-notification';
    document.body.appendChild(div);

    var msg = document.createElement('div');
    msg.id = 'idle-ctn';
    $(msg).height(150);

    if(round.drawer === UM.me.guid){
      $(msg).html('D R A W !');
    }else{
      $(msg).html('G U E S S !');
    }

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
    // document.body.appendChild(wordctn);
    App.mainCtn.appendChild(wordctn);
    $(wordctn).css({
      top: canvasPos.top+'px',
      left: canvasPos.left+'px',
      width: canvasPos.w+'px'
    })

    var colorpalette = document.createElement('div');
    colorpalette.id = 'color-palette-ctn';
    // document.body.appendChild(colorpalette);
    App.mainCtn.appendChild(colorpalette);
    $(colorpalette).css({
      top: canvasPos.top + canvasPos.h - $(colorpalette).height() - 14 +'px',
      left: canvasPos.left+'px',
      width : canvasPos.w-15+'px',
    });

    var selectedMarker = null;

    var marker = function(color){
      var ctn = document.createElement('div');
      ctn.className = 'marker-ctn';
      $(ctn).css('background-color',color);
      $(ctn).click(function(){
        if(selectedMarker){
          selectedMarker.unselect();
        }

        $(ctn).addClass('color-select');
        Page.color = color;
        selectedMarker = ctn;
      });

      ctn.unselect = function(){
        $(ctn).removeClass('color-select');
      }

      ctn.unselect();

      colorpalette.appendChild(ctn);

      return ctn;
    }

    this._drawerui = { wordctn : wordctn, colorpalette : colorpalette};

    var sizectn = document.createElement('div');
    sizectn.id = "size-ctn";
    sizectn.className = 'marker-ctn';
    $(sizectn).css('border','2px solid rgba(0, 0, 0, 0.5)');
    colorpalette.appendChild(sizectn);

    $(sizectn).click(function(event){
      event.stopPropagation();
      $(sizeselect).show();
    });
    $(document.body).click(function(){
      $(sizeselect).hide();
    });

    var sizeselect = document.createElement('div');
    sizeselect.id = 'size-select';
    $(sizeselect).hide();
    colorpalette.appendChild(sizeselect);

    var currentSize;

    var createSizePreview = function(radius){
      var sizepreview = document.createElement('canvas');
      sizepreview.className = 'size-preview-canvas'
      sizepreview.height = $(sizectn).height();
      sizepreview.width = $(sizectn).width();
      sizepreview.radius = radius;

      //get a reference to the canvas
      var ctx = sizepreview.getContext("2d");

      //draw a circle
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.arc($(sizectn).width()/2, $(sizectn).height()/2-2, radius, 0, Math.PI*2, true); 
      ctx.closePath();
      ctx.fill();

      sizepreview.select = function(){
        Page.width = radius;
        sizectn.appendChild(sizepreview);
        currentSize=sizepreview;
      };

      sizepreview.unselect = function(){
        sizeselect.appendChild(sizepreview);
      };

      $(sizepreview).click(function(e){
        if(currentSize && sizepreview.radius !== currentSize.radius){
          $(sizeselect).hide();
          currentSize.unselect();
          sizepreview.select();
        }
      });

      return sizepreview;
    };

    var small = createSizePreview(1);
    var medium = createSizePreview(4);
    var large = createSizePreview(8);
    var xlarge = createSizePreview(12);

    small.select();medium.unselect();large.unselect();xlarge.unselect();

    var black = marker('black');
    var blue = marker('blue');
    var green = marker('green');
    var yellow = marker('yellow');
    var red = marker('red');
    var white = marker('white');

    //add clear button
    var clear = document.createElement('image');
    clear.src = '/images/recycle_bin.png';
    clear.id = 'clear-ctn';
    clear.className = 'marker-ctn';
    $(clear).click(function(){
      Page.clear();
      App.clear();
      Backend.sendStroke({type:"clear"});
    });

    colorpalette.appendChild(clear);

    $(black).click();
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