function app()
{
	this._init();
	UM = new UserManager();
	Backend = new Backend(1);
	Page = new page();

}
app.prototype =
{
	newChatMsg : function(msg){
		var div=document.createElement('div');
		div.className='chat-msg';
		if(msg.user === UM.me.guid)
			msg.value='*'+msg.value
		$(div).html(msg.value);
		$(div).css({
			color:msg.color
		});

		$(this._chat).append(div);
	},

	addStroke : function(stroke){
    var points = stroke.points;
    
    var context = this._context;

    context.strokeStyle = stroke.color;
    
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
		
		UM.add(newplayer);

		this._players.appendChild(newplayer.ui);
	},

	removePlayer : function(guid){
		var player = UM.get(guid);
		player.leave();

		UM.remove(player);
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

		$(replybox).keypress(function(event){
			switch(event.which || event.keyCode){
				case 13:
					event.preventDefault();
					Backend.publish({type:'chat',chat:{value:replybox.value, color:UM.me.color, user:UM.me.guid}},
						function(data){self.newChatMsg(data.chat)});
					replybox.value = "";
					$(replybox).blur();
					$(replybox).focus();
				break;
			}
		});
	}
}