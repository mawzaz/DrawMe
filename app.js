function app()
{
}
app.prototype =
{
	init:function()
	{
		var chatdiv = document.createElement('div');
		chatdiv.id = 'chat-main';

		var canvas = document.createElement("canvas");
		canvas.id = 'canvas';

		var replyboxctn = document.createElement('div');
		replyboxctn.id = 'replybox-ctn'

		var replybox = document.createElement('textarea');
		replybox.id = 'replybox'

		replyboxctn.appendChild(replybox);

		document.body.appendChild(canvas);
		document.body.appendChild(chatdiv);
		document.body.appendChild(replyboxctn);


		$(replybox).keypress(function(event){
			switch(event.which || event.keyCode){
				case 13:
					bayeux.publish("/test",{chat:replybox.value});		
				break;
			}
		});

		var newChatMsg = function(msg){
			var div=document.createElement('div');
			div.className='chat-msg';
			$(div).html(msg)
		}

		var subscription = bayeux.subscribe("/test",function(message){

			if(message.chat){

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
		});
		subscription.errback(function(error) {
			alert('Something went wrong, refresh your browser.');
		});
		
		new page();
	}
	
	
	
}