function page(color)
{
	var self = this;
	this.canvas = document.getElementById("proxycanvas");
	
	this.context = this.canvas.getContext('2d');
	this.color = 'black';
	this.width = 1;

	this.positions;
	this.disable();
}

page.prototype =
{
	onMouseClick:function(ev)
	{
		var self = this;

		this.positions = new Array();
		this.positions.push([ev.layerX,ev.layerY]);

		this.beginPath({point:[ev.layerX,ev.layerY],color:this.color, width:this.width});

		Backend.sendStroke({type:"begin",point:[ev.layerX,ev.layerY],color:this.color, width:this.width});
		
		this.canvas.onmousemove = function(ev){self.onMouseMove(ev);}
		this.canvas.onmouseup = function(ev){self.onMouseUp(ev);}
		
	},
	
	onMouseMove:function(ev)
	{		
		this.positions.push([ev.layerX,ev.layerY]);

		this.drawPath({point:[ev.layerX,ev.layerY]});

		Backend.sendStroke({type:"point",point:[ev.layerX,ev.layerY],color:this.color, width:this.width});
	},
	
	onMouseUp:function(ev)
	{
		this.canvas.onmousemove = null;
		this.canvas.onmouseup = null;

		App.addStroke({points:this.positions, color:this.color, width:this.width});
		Backend.sendStroke({type:"end",points:this.positions,color:this.color, width:this.width});

		this.clear();
		
	},

	beginPath : function(stroke){
		this.context.strokeStyle = stroke.color;
		this.context.lineWidth = stroke.width;
		this.context.lineCap = 'round';
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
		this.clear();
		this.canvas.onmousedown = null;
		this.canvas.onmousemove = null;
		this.canvas.onmouseup = null;
	},

	enable:function(){
		var self = this;
		this.canvas.onmousedown = function(ev){self.onMouseClick(ev);}
	}
}
