function app()
{
	var self = this;
	this._init();
	CoreM = new Core();
	// IA = new InputAdapter(); add support for touch devices
	UM = new UserManager();
	Backend = new Backend(1);
	Page = new page();
	RoundM = new RoundManager();

	//attach listeners
	CoreM.listen('Round Start',function(round){self.newRound(round)});
	CoreM.listen('Round End',function(round){self.endRound(round)});
	CoreM.listen('Results',function(round){self.roundResults(round)});

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
			$(label).html('Me: ');
		}else{
			$(label).html(player.name+': ');
		}

		$(div).html(msg.value);
		$(label).css({
			color:player.color
		});

		$(this._chat).append(wrapper);

		$(this._chat).animate({scrollTop:$(this._chat).height()},'fast');

	},

	addStroke : function(stroke){
    var points = stroke.points;
    
    var context = this._context;

    // context.strokeStyle = stroke.color;
    
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

	addPlayer : function(player){
		if(UM.me.guid === player.guid)
			player.name = '*'+player.name;
		var newplayer = new Player(player);
		
		if(UM.add(newplayer))
			this._players.appendChild(newplayer.ui);
	},

	removePlayer : function(guid){
		var player = UM.get(guid);
		player.leave();

		UM.remove(player);
	},

	idle : function(){
		this._idle = document.createElement('div');
		this._idle.id = 'idle-wrapper-ctn';

		var idlectn = document.createElement('div');
		idlectn.id = 'idle-ctn';

		var label = document.createElement('div');
		$(label).html('Waiting for 1 more player');

		// var loader = new Image();
		// loader.src = '/images/5.gif';

		$(this._idle).append(idlectn);

		$(idlectn).append(label);
		// $(idlectn).append(loader);

		document.body.appendChild(this._idle);
	},

	roundResults : function(round){
		var info = document.createElement('div');
		info.className = 'result-round-info-ctn info-ctn';

		var player = UM.get(round.winner);
		$(info).html('The winner is... ' + player.name);
		$(info).css('color','#DD4B39');

		this._chat.appendChild(info);
	},

	endRound : function(round){
		var info = document.createElement('div');
		info.className = 'end-round-info-ctn info-ctn';
		$(info).html('End of round ' + round.nb);

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

		this._chat.appendChild(info);

		Page.clear();
		this._canvas.getContext('2d').clearRect(0,0,this._canvas.width,this._canvas.height);
		// this._chat.appendChild(points);
	},

	newRound : function(round){
		this._canvas.getContext('2d').clearRect(0,0,this._canvas.width,this._canvas.height);
		Page.clear();

		if(this._idle)
			$(this._idle).remove();

		var info = document.createElement('div');
		info.className = 'new-round-info-ctn info-ctn';
		$(info).html('Round '+round.nb+' has begun');

		this._chat.appendChild(info);

		if(round.drawer === UM.me.guid){
			$(this._replybox).hide();
		}else{
			$(this._replybox).show();
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

		var canvas = document.createElement("canvas");
		canvas.id = 'canvas';
		canvas.height = $(document.body).height()-5;
		canvas.width = 720;

		this._canvas = canvas;

		var proxycanvas = document.createElement("canvas");
		proxycanvas.id = 'proxycanvas';
		$(proxycanvas).css('background-color','transparent');
		proxycanvas.height = canvas.height;
		proxycanvas.width = canvas.width;

		this._context = canvas.getContext('2d');

		
		var lobby = document.createElement('div');
		lobby.id='lobby';

		document.body.appendChild(canvas);
		document.body.appendChild(proxycanvas);
		document.body.appendChild(lobby);

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
			if(replybox.value === defaultText)
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
					event.preventDefault();
					Backend.publish({type:'chat',chat:{value:replybox.value, color:UM.me.color, user:UM.me.guid}});
					replybox.value = "";
					$(replybox).blur();
					$(replybox).focus();
				break;
			}
		});
	}
}