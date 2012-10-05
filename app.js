function app()
{
	this.players = {};
}
app.prototype =
{
	init:function()
	{
		//TODO:Make a user manager
		var me = new Player();

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

		
		var lobby = document.createElement('div');
		lobby.id='lobby';

		document.body.appendChild(canvas);
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

		var addPlayer = function(player){
			if(me.guid === player.guid)
				player.name = '*'+player.name;
			var newplayer = new Player(player);
			self.players[player.guid]=newplayer;
			playersmainctn.appendChild(newplayer.ui);
		}

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
					bayeux.publish("/test",{chat:replybox.value, color:me.color, user:me.guid});
					replybox.value = "";
					$(replybox).blur();
					$(replybox).focus();
				break;
			}
		});

		var newChatMsg = function(msg){
			var div=document.createElement('div');
			div.className='chat-msg';
			if(msg.user === me.guid)
				msg.chat='*'+msg.chat
			$(div).html(msg.chat);
			$(div).css({
				color:msg.color
			});

			$(chatwrapper).append(div);
		}

		var subscription = bayeux.subscribe("/test",function(message){

			if(message.chat){
				newChatMsg(message);
				return;
			}

			if(message.user){
				if(!self.players[message.user.guid]){
					addPlayer(message.user);
					bayeux.publish("/test",{user:me.flatten()});
				}
				return;
			}

			var context = canvas.getContext('2d');
			var points = JSON.parse(message.points);
			
			context.beginPath();
			context.moveTo(points[0][0],points[0][1]);
			for(var i=1;i<points.length;i++)
			{
				context.lineTo(points[i][0],points[i][1]);
			}
			context.stroke();
		});

		subscription.callback(function() {
			alert('Welcome to DrawMe :)');
			bayeux.publish("/test",{user:me.flatten()});
		});
		subscription.errback(function(error) {
			alert('Something went wrong, refresh your browser.');
		});
		
		new page(me.color);
	}
}