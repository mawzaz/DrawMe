function Account(data){

	this.maindiv = document.createElement('div');

	$(this.maindiv).css({
    	backgroundColor:'white',
    	height:'200px',
    	width:'200px'
  	});

	document.body.appendChild(this.maindiv);

	var accountForm = document.createElement('form');
	$(accountForm).css({
		height:'600px',
		width:'800px'
	});
	accountForm.action = '/changeAccount';
	accountForm.method = 'POST';

	var nicknameForm = document.createElement('form');
	$(nicknameForm).css({
		height:'200px',
		width:'800px'
	});
	nicknameForm.action = '/changeNickname';
	nicknameForm.method = 'POST';
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

	var nicknameSubmitButton = document.createElement('input');
	nicknameSubmitButton.type ='button';
	nicknameSubmitButton.value = 'Submit';
	$(nicknameSubmitButton).css({
		height:'20px',
		width:'200px'
	});
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
	passwordConfirmTextbox.name = 'passwordConfirm';

	var submitButton = document.createElement('input');
	submitButton.type = 'button';
	submitButton.value = 'submit';
	$(submitButton).css({
		height:'20px',
		width:'200px'
	});
	//==================New Password menu==================//
	nicknameForm.appendChild(nicknameDiv);
	nicknameForm.appendChild(nicknameTextbox);

	accountForm.appendChild(passwordDiv);
	accountForm.appendChild(passwordTextbox);
	accountForm.appendChild(newPasswordDiv);
	accountForm.appendChild(newPasswordTextbox);
	accountForm.appendChild(passwordConfirmDiv);
	accountForm.appendChild(passwordConfirmTextbox);


	nicknameSubmitButton.onclick = function(){
		if(validateNicknameForm())
			nicknameForm.submit();
	};

	submitButton.onclick = function(){

		if(validateAccountForm())
			accountForm.submit();
	};

	nicknameForm.appendChild(nicknameSubmitButton);
	accountForm.appendChild(submitButton);

	this.maindiv.appendChild(nicknameForm)
	this.maindiv.appendChild(accountForm);
	// this.maindiv.appendChild(submitButton);

	var validateNicknameForm = function(){
		var a = nicknameForm['nickname'].value;
		if(a==null || a ==''){
			alert('Your nickname cannot be blank');
			return false;
		}
		return true;
	}

	var validateAccountForm = function(){
		var a = accountForm['password'].value;
		var d = accountForm['newPassword'].value;
		var e = accountForm['passwordConfirm'].value;

		if(a == null || a == ''){
			alert('please enter your current password');
			return false;
		}
		if(d==null || d=='' || e==null || e==''){
			alert('Please enter new a password and confirm');
			accountForm['password'].focus();
			return false;
		}

		if(d!=e){
			alert('Passwords do not match');
			accountForm['password'].focus();
			return false;
		}
	};

}

Account.prototype = {
	destroy: function(){
		$(this.maindiv).hide();
	},

}

