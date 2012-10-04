function app()
{
}
app.prototype =
{
	init:function()
	{
		var subscription = bayeux.subscribe("/test",function(message)
					{
						var canvas = document.getElementById("canvas");
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
  					alert('Subscription is now active!');
				});
		subscription.errback(function(error) {
  				alert(error.message);
		});
		
		/*
		var publication = bayeux.publish('/test', {text: 'TESTING'});
	
		publication.callback(function() {
  			alert('Message received by server!');
		});

		publication.errback(function(error) {
  			alert('There was a problem: ' + error.message);
		});
		*/
		new page();
	}
	
	
	
}