function page(color)
{
	var self = this;
	this.canvas = document.getElementById("proxycanvas");
	
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

		this.beginPath({point:[ev.layerX,ev.layerY],color:this.color});

		Backend.sendStroke({type:"begin",point:[ev.layerX,ev.layerY],color:this.color});
		
		this.canvas.onmousemove = function(ev){self.onMouseMove(ev);}
		this.canvas.onmouseup = function(ev){self.onMouseUp(ev);}
		
	},
	
	onMouseMove:function(ev)
	{		
		this.positions.push([ev.layerX,ev.layerY]);

		this.drawPath({point:[ev.layerX,ev.layerY]});

		Backend.sendStroke({type:"point",point:[ev.layerX,ev.layerY],color:this.color});
	},
	
	onMouseUp:function(ev)
	{
		this.canvas.onmousemove = null;
		this.canvas.onmouseup = null;

		App.addStroke({points:this.positions, color:this.color});
		Backend.sendStroke({type:"end",points:this.positions,color:this.color});

		this.clear();
		
		this.positions = new Array();
	},

	beginPath : function(stroke){
		this.context.strokeStyle = stroke.color;
		this.context.beginPath();
		this.context.moveTo(stroke.point[0], stroke.point[1]);
	},

	drawPath : function(stroke){
		this.clear();
		this.context.lineTo(stroke.point[0], stroke.point[1]);
				
		this.context.stroke();
	},

	clear : function(){
		this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
	},

	disable:function(){
		this.canvas.onmousedown = null;
	},

	enable:function(){
		var self = this;
		this.canvas.onmousedown = function(ev){self.onMouseClick(ev);}
	}
}
