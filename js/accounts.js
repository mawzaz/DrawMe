function Account(data, menuBar){
	this._menuBar = menuBar;
	this.maindiv = document.createElement('div');
	this.maindiv.className = "options-ctn";

	var returnButton = document.createElement('div');
	returnButton.className = "return-button account button";
	$(returnButton).html('<- Settings');
	var self = this;
	returnButton.onclick = function(){self._destroy();};

	this.maindiv.appendChild(returnButton);


	var createField = function(defaultText,isPassword){
		var div = document.createElement('div');
		div.className = 'input-box-wrapper blur';

		var input = document.createElement('input');

		div.appendChild(input)
		
		if(isPassword){
			input.className = 'password'
			input.type="password";
			var wrappedDiv = document.createElement('div');
			wrappedDiv.className = "blur password-wrapper";
			$(wrappedDiv).html(defaultText);
			$(div).prepend(wrappedDiv);

			$(wrappedDiv).click(function(){onBlurFocusDiv(wrappedDiv,input,defaultText);});

			$(input).blur(function(){
				onBlurFocusDiv(wrappedDiv,input,defaultText,true);
			});


		}else{
			input.value = defaultText;
			input.type = "text";
			input.className = 'blur';

			$(input).blur(function(){onBlur(input,defaultText);});
			$(input).focus(function(){onFocus(input,defaultText);});

		}

		div.setValue = function(text){
			input.value = text;
		}

		div.getValue = function(){
			return input.value
		}


		return div;
	}

	var onBlur = function(ctn,defaultText){
		if(ctn.value === ""){
			ctn.value = defaultText;
			$(ctn).css('text-align','right');
		}
		$(ctn).addClass('blur');
		$(ctn).removeClass('focus');
	}

	var onBlurFocusDiv  = function(ctn,wrappedDiv, defaultText, wrappedDivCaller){
		if($(ctn).html() === "" && wrappedDiv.value === ""){
			$(ctn).css('text-align','right');
			$(ctn).html(defaultText);
			$(ctn).addClass('blur');
			$(ctn).removeClass('focus');
		} else if($(ctn).html() === defaultText && wrappedDiv.value === ""){
			$(ctn).html("");
			$(ctn).removeClass('blur');
			$(ctn).addClass('focus');
			$(wrappedDiv).focus();
		} else if(wrappedDiv.value !== "" && !wrappedDivCaller){
			$(wrappedDiv).focus();
			$(ctn).addClass('focus');
		} else if(wrappedDivCaller){
			$(ctn).removeClass('focus');
			$(ctn).html("");
		}
	};

	var onFocus = function(ctn,defaultText, text){
		if(ctn.value === defaultText){
			ctn.value = "";
			$(ctn).css('text-align','left');
		}	
		$(ctn).removeClass('blur');
		$(ctn).addClass('focus');
	};

	var nickname = createField('Nickname');
	nickname.setValue(data.nickname);
	var oldPassword = createField('Old Password',true);
	var newPassword = createField('New Password',true);
	var confirmPassword = createField('Confirm',true);

	this.maindiv.appendChild(nickname);
	this.maindiv.appendChild(oldPassword);
	this.maindiv.appendChild(newPassword);
	this.maindiv.appendChild(confirmPassword);

	var validateNicknameForm = function(){
		var a = nickname.getValue();
		if(a==null || a ==''){
			alert('Your nickname cannot be blank');
			return false;
		}
		return true;
	}

	var validateAccountForm = function(){
		var a = oldPassword.getValue();
		var d = newPassword.getValue();
		var e = confirmPassword.getValue();

		if(a == null || a == ''){
			alert('please enter your current password');
			return false;
		}
		if(d==null || d=='' || e==null || e==''){
			alert('Please enter new a password and confirm');
			return false;
		}

		if(d!=e){
			alert('Passwords do not match');
			return false;
		}
	};


	var saveButton = document.createElement('div');
	saveButton.className = "stats button";
	$(saveButton).html('Save');
	$(saveButton).click(function(){
		if(validateAccountForm){
			var sendingData = {
				nickname : nickname.getValue() || data.nickname()
			}
			
			$.ajax({
	      type: 'POST',
	      url: '/changeNickname',
	      data: sendingData,
	      success: function(data){
	      	alert('saved nickname');
	      }
	    });
		}
		if(validateNicknameForm()){

			var sendingData = {
				password : oldPassword.getValue(),
				newPassword : newPassword.getValue(),
				confirmPassword : confirmPassword.getValue()
			}
			

			$.ajax({
	      type: 'POST',
	      url: '/changeAccount',
	      data: sendingData,
	      success: function(data){
	      	alert('saved password');
	      }
	    });
		}
	});

	this.maindiv.appendChild(saveButton);
	

/*
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
*/
}

Account.prototype = {
	_destroy: function(){
		$(this.maindiv).remove();
		this._menuBar.show();
	},

}

