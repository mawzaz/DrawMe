function Account(data){

	this.maindiv = document.createElement('div');

	$(this.maindiv).css({
    	backgroundColor:'white',
    	height:'200px',
    	width:'200px'
  	});

	document.body.appendChild(this.maindiv);

	var form = document.createElement('form');
	$(form).css({
		height:'800px',
		width:'800px'
	});
	form.action = '/changeAccount';
	form.method = 'POST';
	//==================Nickname menu==================

	var nicknameDiv = document.createElement('div');
	$(nicknameDiv).css({
		backgroundColor:'orange',
		height:'55px',
		width:'800px'
	});
	$(nicknameDiv).html('Your current nickname is: '+data.nickname+'</br> Who do you want to be? ');
	// this.maindiv.appendChild(nicknameDiv);

	var nicknameTextbox = document.createElement('input');
	nicknameTextbox.type = 'text';
	nicknameTextbox.name = 'nickname';
	//==================Nickname menu==================//

	//==================Password menu==================
	var passwordDiv = document.createElement('div');
	$(passwordDiv).css({
		backgroundColor:'green',
		height:'55px',
		width:'800px'
	});
	$(passwordDiv).html('Current password: ');
	this.maindiv.appendChild(passwordDiv);

	var passwordTextbox = document.createElement('input');
	passwordTextbox.type = 'text';
	passwordDiv.appendChild(passwordTextbox);
	passwordTextbox.name = 'password';
	//==================Password menu==================//

	//==================New Password menu==================
	var newPasswordDiv = document.createElement('div');
	$(newPasswordDiv).css({
		backgroundColor:'violet',
		height:'55px',
		width:'800px'
	});
	$(newPasswordDiv).html('New password: ');
	this.maindiv.appendChild(newPasswordDiv);

	var newPasswordTextbox = document.createElement('input');
	newPasswordTextbox.type = 'text';
	newPasswordDiv.appendChild(newPasswordTextbox);
	newPasswordTextbox.name = 'newPassword';

	var passwordConfirmDiv = document.createElement('div');
	$(passwordConfirmDiv).css({
		backgroundColor:'green',
		height:'55px',
		width:'800px'
	});
	$(passwordConfirmDiv).html('Confirm password: ');
	this.maindiv.appendChild(passwordConfirmDiv);

	var passwordConfirmTextbox = document.createElement('input');
	passwordTextbox.type = 'text';
	passwordConfirmDiv.appendChild(passwordConfirmTextbox);
	passwordConfirmTextbox.name = 'passwordConfirmTextbox'
	//==================New Password menu==================//
	form.appendChild(nicknameDiv);
	form.appendChild(nicknameTextbox);
	form.appendChild(passwordDiv);
	form.appendChild(passwordTextbox);
	form.appendChild(newPasswordDiv);
	form.appendChild(newPasswordTextbox);
	form.appendChild(passwordConfirmDiv);
	form.appendChild(passwordConfirmTextbox);


	var submitButton = document.createElement('input');
	submitButton.type = 'button';
	submitButton.value = 'submit';
	$(submitButton).css({
		height:'20px',
		width:'200px'
	});

	submitButton.onclick = function(){
		form.submit();
	}

	form.appendChild(submitButton);

	this.maindiv.appendChild(form);
	// this.maindiv.appendChild(submitButton);

}

Account.prototype = {
	destroy: function(){
		$(this.maindiv).hide();
	},

	post_to_url: function(path, params, method) {
    method = method || "post"; // Set method to post by default, if not specified.

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
         }
    }

    document.body.appendChild(form);
    form.submit();
	},

}

