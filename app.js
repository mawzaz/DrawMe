function app()
{
	App = this;
	var self = this;
	this.deferredWork = new Array();
	this.busy = true; //set to false in backend.js
	this._init();
	CoreM = new Core();
	// IA = new InputAdapter(); add support for touch devices
	UM = new UserManager();
	Backend = new Backend(1);
	Page = new page();
	RoundM = new RoundManager();

	this._preroundtimer = null;


	//attach listeners
	CoreM.listen('Pre Round Start',function(round){self.preNewRound(round)});
	CoreM.listen('Round Start',function(round){self.newRound(round)});
	CoreM.listen('Round End',function(round){self.endRound(round)});
	CoreM.listen('Results',function(round){self.roundResults(round)});
	CoreM.listen('Pre Round Countdown',function(round){self.preRoundCountdown(round)});


}
app.prototype =
{
	newChatMsg : function(msg){
		var wrapper=document.createElement('div');

		var div = document.createElement('div');
		div.className='chat-msg';

		var label = document.createElement('div');
		label.className = 'chat-msg-user';

		$(wrapper).append(label);
		$(wrapper).append(div);

		var player = UM.get(msg.user);

		if(msg.user === UM.me.guid){
			$(label).html('Me');
		}else{
			$(label).html(player.name);
		}

		$(div).html(': '+msg.value);
		$(label).css({
			color:player.color
		});

		$(this._chat).append(wrapper);

		this._focusChat();
	},

	processStroke : function(stroke){
		switch(stroke.type){
			case "begin":
				Page.beginPath(stroke)
				break;
			case "point":
				Page.drawPath(stroke);
				break;
			case "end":
				Page.clear();
				this.addStroke(stroke);
				break;
			case "clear":
				Page.clear();
				this.clear();
				break;
		}
	},

	addStrokes : function(strokes){
		var stroke;
		for(var i in strokes){
			stroke = JSON.parse(strokes[i]);
			this.processStroke(stroke);
		}
	},

	addStroke : function(stroke){
		if(stroke.user === UM.me.guid)
			return;

    var points = stroke.points;
    
    var context = this._context;

    // context.strokeStyle = stroke.color;
    
    context.strokeStyle = stroke.color;
    context.lineWidth = stroke.width;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(points[0][0],points[0][1]);
    for(var i=1;i<points.length;i++)
    {
      context.lineTo(points[i][0],points[i][1]);
    }
    context.stroke();
	},

	addPlayers : function(players){
		for(var i in players){
			this.addPlayer(players[i]);
		}
	},

	addPlayer : function(player,live){
		if(UM.me.guid === player.guid)
			player.name = '*'+player.name;
		var newplayer = new Player(player);
		
		if(UM.add(newplayer)){
			this._players.appendChild(newplayer.ui);
		}

		if(live && player.guid != UM.me.guid){
			var wrapper = document.createElement('div');
			this._chat.appendChild(wrapper);

			var playerDiv = document.createElement('div');
			playerDiv.className = 'inline';
			$(playerDiv).css('color',player.color);
			$(playerDiv).html(player.name);
			wrapper.appendChild(playerDiv);

			this.notify('has joined the game.',{display:'inline-block',marginLeft:'8px'},wrapper);
		}

		this._focusChat();
	},

	pickDrawer : function(round){
		var drawer = UM.get(round.drawer);

		if(!drawer){
			return;
		}

		$('#current-drawer').remove();

		var pencil = document.createElement('div');
		pencil.className = 'current-drawer';
		pencil.id = "current-drawer";
		$(drawer.ui).append(pencil);
	},

	removePlayer : function(guid){
		var player = UM.get(guid);

		var wrapper = document.createElement('div');
		this._chat.appendChild(wrapper);

		var playerDiv = document.createElement('div');
		playerDiv.className = 'inline';
		$(playerDiv).css('color',player.color);
		$(playerDiv).html(player.name);
		wrapper.appendChild(playerDiv);

		var pencil = null;
		if(RoundM.getDrawer() === player.guid){
			pencil = document.createElement('div');
			pencil.className = 'current-drawer';
			wrapper.appendChild(pencil);
		}

		this.notify('has left the game.',{display:'inline-block',marginLeft:'8px'},wrapper);
		
		player.leave();

		UM.remove(player);

		this._focusChat();

	},

	idle : function(){
		this._idle = document.createElement('div');
		this._idle.id = 'idle-wrapper-ctn';

		var idlectn = document.createElement('div');
		idlectn.id = 'idle-ctn';

		var label = document.createElement('div');
		$(label).html('Waiting for 1 more player...');

		// var loader = new Image();
		// loader.src = '/images/5.gif';

		$(this._idle).append(idlectn);

		$(idlectn).append(label);
		// $(idlectn).append(loader);

		document.body.appendChild(this._idle);
	},

	notify : function(msg,css,parent){
		var div = document.createElement('div');
		div.className = 'info-ctn notification';
		$(div).css(css);
		$(div).html(msg);

		if(parent){
			parent.appendChild(div);
		}else
			this._chat.appendChild(div);
	},

	roundResults : function(round){
		var self = this;

		var info = document.createElement('div');
		info.className = 'result-round-info-ctn info-ctn';
		$(info).css('margin-left','20px');
		self._chat.appendChild(info);

		var flash = document.createElement('div');
		flash.className = 'drawer-notification';
		flash.id = "idle-wrapper-ctn";
		$(flash).css({
			'background-color':'rgba(255,0,0,0.5)',
		});
		document.body.appendChild(flash);
		$(flash).fadeOut(1000);

    var flash2 = document.createElement('div');
    $(flash2).height(150);


    $(flash2).css({
    	'color':'white',
    });
    flash2.id = 'idle-ctn';
    flash.appendChild(flash2);

		var msg1 = document.createElement('div');
		$(msg1).css({
			'color':'#DD4B39',
			'font-size':'20px',
		});
    
    if(!round.winner){
			$(msg1).html('TIMES UP!');
    }else if(round.winner === UM.me.guid){
    	$(flash2).html('YOU GUESSED THE WORD!');
    	$(flash2).css('width', '650px');
    	$(flash).css('background-color','rgba(0,255,0,0.5)')
    }else{
	    $(flash2).html('SOMEONE GUESSED THE WORD!');
    	$(flash2).css('width', '660px');
    }

		info.appendChild(msg1);

		this._focusChat();

		this.busy = true;

		$(msg1).fadeOut(1000,function(){
			$(msg1).fadeIn(1000,function(){
				if(!round.winner){
					var msg2 = document.createElement('div');
					$(msg2).html('No one could guess the word '+round.word.toUpperCase());
					$(msg2).css({
						'color':'#DD4B39',
					});
					info.appendChild(msg2);
				}else{
					var player = UM.get(round.winner);
					
					var msg2 = document.createElement('div');
					msg2.className = 'inline';
					$(msg2).css('color',player.color);
					$(msg2).html(player.name);

					info.appendChild(msg2);

					var css = {'display':'inline-block',marginLeft:'8px'};
					self.notify('guessed the word '+round.word.toUpperCase(),css,info);

				}

				self._focusChat();

				self.busy = false;

				self.runDeferredWork();
			});
		});
	},

	runDeferredWork : function(){
		while(this.deferredWork.length){
      this.deferredWork.shift()();
    }
	},

	endRound : function(round){
		// if(round.nb){
			// var info = document.createElement('div');
			// info.className = 'end-round-info-ctn info-ctn';
			// $(info).html('End of round ' + round.nb);
			// this._chat.appendChild(info);
			
			// var points = document.createElement('div');
			// points.className = 'winners-round-info-ctn';
			
			// var player,point_ctn;
			// for(var i in round.points){
			// 	player = UM.get(round.points[i]);

			// 	//TODO: add points to player score
				
			// 	points_ctn = document.createElement('div');
			// 	points_ctn.className = 'player-points';
			// 	$(points_ctn).css('color',player.color);
			// 	$(points_ctn).html(player.name + ' ' + round.points[i]);

			// 	points.appendChild(points_ctn);
			// }

		// }

		Page.clear();
		Page.disable();

		if(this._preroundtimer && (!UM.get(round.drawer) || this._preroundtimer.time > 1)){
			$(this._preroundtimer).html('ABORTED round '+(round.nb ? round.nb : 1));
		}

		this._preroundtimer = null;
		// this._canvas.getContext('2d').clearRect(0,0,this._canvas.width,this._canvas.height);
		// this._chat.appendChild(points);
	},

	preRoundCountdown : function(round){
		if(this._preroundtimer){
			$(this._preroundtimer).html('Starting round '+(round.nb ? round.nb : 1)+'... '+round.time);
			this._preroundtimer.time = round.time;
		}
	},

	preNewRound : function(round){
		var self = this;
		this.hideChat("Waiting for next round...");

		if(this.busy){
			this.deferredWork.push(function(){
				self.preNewRound(round);
			});
			return;
		}

		// this._canvas.getContext('2d').clearRect(0,0,this._canvas.width,this._canvas.height);
		Page.disable();

		if(this._idle)
			$(this._idle).remove();

		var info = document.createElement('div');
		info.className = 'new-round-info-ctn info-ctn';
		$(info).css('font-size','24px');

		var msg1 = document.createElement('div');
		$(msg1).html('Starting round '+(round.nb ? round.nb : 1)+'...');
		info.appendChild(msg1);

		this._preroundtimer = msg1;

		// $(info).html('Starting new round... '+player.name+ 'get ready to DRAW');		

		var player = UM.get(round.drawer);
		if(player){
			var msg2 = document.createElement('div');
			$(msg2).css('display','inline-block');
			$(msg2).css('color',player.color);
			$(msg2).html(player.name);

			var msg3 = document.createElement('div');
			$(msg3).css({
			  'display':'inline-block',
				'margin-left':'8px',
			});
			$(msg3).html('get ready to DRAW');

			info.appendChild(msg2);
			info.appendChild(msg3);

			if(this._chat.innerHTML)
				$(info).css('margin-top','30px');
		}

		this._chat.appendChild(info);

		this._focusChat();
	},

	hideChat : function(msg){
		this._replybox.disabled = true;
		this._replybox.value = msg;
		$(this._replybox).addClass('disable-chat');
	},

	showChat : function(){
		this._replybox.disabled = false;
		this._replybox.value = "";
		$(this._replybox).blur();
		$(this._replybox).removeClass('disable-chat');
	},

	_focusChat : function(){
		$(this._chat).stop();
		$(this._chat).animate({scrollTop:this._chat.scrollHeight},'fast');
	},

	clear : function(){
		this._canvas.getContext('2d').clearRect(0,0,this._canvas.width,this._canvas.height);
	},

	newRound : function(round){
		var self = this;

		if(this.busy){
			this.deferredWork.push(function(){
				self.newRound(round);
			});

			return;
		}

		$(this._preroundtimer).html('STARTED round '+(round.nb ? round.nb : 1)+'...');

		this._canvas.getContext('2d').clearRect(0,0,this._canvas.width,this._canvas.height);
		Page.clear();

		if(this._idle)
			$(this._idle).remove();

		var info = document.createElement('div');
		// info.className = 'new-round-info-ctn info-ctn';
		// $(info).html('Round '+round.nb+' has begun');

		// this._chat.appendChild(info);

		if(round.drawer === UM.me.guid){
			this.hideChat("Your turn to draw!");
		}else{
			this.showChat();
		}

		//add indicator of who's drawing right now
		var drawer = UM.get(round.drawer);

		var currentDrawer = function(){
			self.pickDrawer(round);
			self._focusChat();
		}

		if(!drawer){
			this.deferredWork.push(currentDrawer);
		}else{
			currentDrawer();
		}

	},

	_init:function()
	{
		var self = this;

		var underline = function(underline){
			var div = document.createElement('div');
			$(div).html(underline);
			return div;
		}

		this.mainCtn = document.createElement("div");
		this.mainCtn.id = "main-ctn";

		document.body.appendChild(this.mainCtn);

		var canvas = document.createElement("canvas");
		canvas.id = 'canvas';
		canvas.className = 'drawing-canvas';
		canvas.height = $(document.body).height()-5;
		canvas.width = 720;

		this._canvas = canvas;

		var proxycanvas = document.createElement("canvas");
		proxycanvas.id = 'proxycanvas';
		proxycanvas.className = 'drawing-canvas';
		$(proxycanvas).css('background-color','transparent');
		proxycanvas.height = canvas.height;
		proxycanvas.width = canvas.width;

		this._context = canvas.getContext('2d');

		//bug fix
		this.deferredWork.push(function(){
			canvas.height = 635;
			proxycanvas.height = canvas.height;
		});

		
		var lobby = document.createElement('div');
		lobby.id='lobby';

		// document.body.appendChild(canvas);
		// document.body.appendChild(proxycanvas);
		// document.body.appendChild(lobby);

		this.mainCtn.appendChild(canvas);
		this.mainCtn.appendChild(proxycanvas);
		this.mainCtn.appendChild(lobby);



		//Players
		var playersctn = document.createElement('div');
		playersctn.id = 'players-ctn';
		$(playersctn).height(($(lobby).height()-200)/2);

		var playersCtnLabel = document.createElement('div');
		$(playersCtnLabel).html('Players');
		playersCtnLabel.id = 'players-ctn-label';
		playersctn.appendChild(playersCtnLabel);
		playersctn.appendChild($(underline('----------')).css({
			position: 'absolute',
			left: '5px',
			top: '11px',
			fontSize:'20px'			
		})[0]);

		var playersmainctn = document.createElement('div');
		playersmainctn.id = 'players-main-ctn';
		playersctn.appendChild(playersmainctn);

		this._players = playersmainctn;

		//Chat
		var chatdiv = document.createElement('div');
		chatdiv.id = 'chat-main';
		$(chatdiv).css({
			height:($(lobby).height()+200)/2+'px',
			top:$(playersctn).height()+'px'
		});

		var chatwrapper = document.createElement('div');
		chatwrapper.id = "chat-wrapper";
		chatdiv.appendChild(chatwrapper);

		this._chat = chatwrapper;

		var chatlabel = document.createElement('div');
		$(chatlabel).html('Chalkboard');
		chatlabel.id = 'chat-ctn-label';
		chatdiv.appendChild(chatlabel);
		chatdiv.appendChild($(underline('---------------')).css({
			position: 'absolute',
			left: '5px',
			top: '14px',
			fontSize:'20px'
		})[0]);

		lobby.appendChild(playersctn);
		lobby.appendChild(chatdiv);

		var replyboxctn = document.createElement('div');
		replyboxctn.id = 'replybox-ctn';
		lobby.appendChild(replyboxctn);


		var defaultText = 'Take a guess...'
		var replybox = document.createElement('textarea');
		replybox.id = 'replybox';
		replybox.value = defaultText;

		replyboxctn.appendChild(replybox);

		$(replybox).focus(function(){
			if(replybox.value === defaultText && !replybox.disabled)
				replybox.value= '';
		});

		$(replybox).blur(function(){
			if(replybox.value === '')
				replybox.value= defaultText;
		});

		this._replybox = replybox;

		$(replybox).keypress(function(event){
			switch(event.which || event.keyCode){
				case 13:
					if(replybox.value.isBlank()){
						replybox.value = "";
						$(replybox).blur();
						$(replybox).focus();
						break;
					}
					event.preventDefault();
					Backend.publish({type:'chat',chat:{value:replybox.value, color:UM.me.color, user:UM.me.guid}});
					replybox.value = "";
					$(replybox).blur();
					$(replybox).focus();
				break;
			}
		});

		this.hideChat("Waiting for next round...");
	}
}