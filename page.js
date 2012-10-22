function page(color)
{
	var self = this;
	this.canvas = document.getElementById("proxycanvas");
	
	
	this.canvas.onmousedown = function(ev){self.onMouseClick(ev);}
	
	this.context = this.canvas.getContext('2d');
	this.color = 'black';
	

	this.positions = new Array();
	this.disable();
}

page.prototype =
{
	onMouseClick:function(ev)
	{
		var self = this;
		this.positions.push([ev.layerX,ev.layerY]);
		this.context.beginPath();
		this.context.moveTo(ev.layerX, ev.layerY);
		
		this.canvas.onmousemove = function(ev){self.onMouseMove(ev);}
		this.canvas.onmouseup = function(ev){self.onMouseUp(ev);}
		
	},
	
	onMouseMove:function(ev)
	{
		this.context.strokeStyle = this.color;
		
		this.positions.push([ev.layerX,ev.layerY]);

		this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
		this.context.lineTo(ev.layerX, ev.layerY);
				
		this.context.stroke();
	},
	
	onMouseUp:function(ev)
	{
		this.canvas.onmousemove = null;
		this.canvas.onmouseup = null;
		
		var stroke = {points:this.positions,color:UM.me.color};
		//send to cloud
		Backend.publish({type:'stroke',stroke:stroke});

		this.clear();
		
		this.positions = new Array();
	},

	clear : function(){
		this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
	},

	disable:function(){
		$(this.canvas).hide();
	},

	enable:function(){
		$(this.canvas).show();
	}
}
