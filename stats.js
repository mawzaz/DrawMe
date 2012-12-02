function Stats(data, menuBar){
	this._menuBar = menuBar;
	this.maindiv = document.createElement('div');
	this.maindiv.className = "options-ctn";

	//==================Nickname==================

	var nicknameDiv = document.createElement('div');
	nicknameDiv.className = "label";
	$(nicknameDiv).html(data.nickname);
	//==================Nickname==================//

	//==================Wins==================
	var winsDiv = document.createElement('div');
	winsDiv.className = "label";
	$(winsDiv).html('Wins: '+data.wins);
	this.maindiv.appendChild(winsDiv);
	//==================Wins==================//

	//==================Played==================
	var playedDiv = document.createElement('div');
	playedDiv.className = "label";
	$(playedDiv).html('Played: '+data.played);
	this.maindiv.appendChild(playedDiv);
	//==================Played==================//
	//==================Played==================
	var pointsDiv = document.createElement('div');
	pointsDiv.className = "label";
	$(pointsDiv).html('Points: '+data.points);
	this.maindiv.appendChild(pointsDiv);

	var returnButton = document.createElement('div');
	returnButton.className = "return-button stats button";
	$(returnButton).html('<- Stats');
	var self = this;
	returnButton.onclick = function(){self._destroy();};

	this.maindiv.appendChild(returnButton);
}

Stats.prototype = {
	_destroy: function(){
		$(this.maindiv).remove();
		this._menuBar.show();
	},

}

