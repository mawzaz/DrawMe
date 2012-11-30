function Stats(data){

	this.maindiv = document.createElement('div');

	$(this.maindiv).css({
    	backgroundColor:'white',
    	height:'200px',
    	width:'200px'
  	});

	//==================Nickname==================

	var nicknameDiv = document.createElement('div');
	$(nicknameDiv).css({
		backgroundColor:'orange',
		height:'55px',
		width:'400px'
	});
	$(nicknameDiv).html(data.nickname);
	this.maindiv.appendChild(nicknameDiv);
	//==================Nickname==================//

	//==================Wins==================
	var winsDiv = document.createElement('div');
	$(winsDiv).css({
		backgroundColor:'violet',
		height:'55px',
		width:'400px'
	});
	$(winsDiv).html('Wins: '+data.wins);
	this.maindiv.appendChild(winsDiv);
	//==================Wins==================//

	//==================Played==================
	var playedDiv = document.createElement('div');
	$(playedDiv).css({
		backgroundColor:'green',
		height:'55px',
		width:'400px'
	});
	$(playedDiv).html('Played: '+data.played);
	this.maindiv.appendChild(playedDiv);
	//==================Played==================//
	//==================Played==================
	var pointsDiv = document.createElement('div');
	$(pointsDiv).css({
		backgroundColor:'gray',
		height:'55px',
		width:'400px'
	});
	$(pointsDiv).html('Points: '+data.points);
	this.maindiv.appendChild(pointsDiv);
	//==================Played==================//
	document.body.appendChild(this.maindiv);

}

Stats.prototype = {
	destroy: function(){
		$(this.maindiv).hide();
	},

}

