function page()
{
	var self = this;
	this.canvas = document.getElementById("canvas");
	
	
	this.canvas.onmousedown = function(ev){self.onMouseClick(ev);}
	
	this.context = this.canvas.getContext('2d');
	this.positions = new Array();
}

page.prototype =
{
	onMouseClick:function(ev)
	{
		var self = this;
		this.positions.push([ev.layerX,ev.layerY]);
		this.context.beginPath();		this.context.moveTo(ev.layerX, ev.layerY);
		
		this.canvas.onmousemove = function(ev){self.onMouseMove(ev);}
		this.canvas.onmouseup = function(ev){self.onMouseUp(ev);}
		
	},
	
	onMouseMove:function(ev)
	{
		this.positions.push([ev.layerX,ev.layerY]);
		this.context.lineTo(ev.layerX, ev.layerY);
				
		this.context.stroke();
	},
	
	onMouseUp:function(ev)
	{
		this.canvas.onmousemove = null;
		this.canvas.onmouseup = null;
		
		//send to cloud
		bayeux.publish("/test",{points:JSON.stringify(this.positions)});		
		
		this.positions = new Array();
	}
}
