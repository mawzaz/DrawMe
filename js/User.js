/**
 * New node file
 */
 
 var mongoose = require('mongoose'),
    db = mongoose.createConnection('localhost', "DrawMe"),
    bcrypt = require('bcrypt');
    
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connected");
});
  

function UserDb()
{
    this.userSchema = new mongoose.Schema(
        {
            email: {type: String, index: {unique:true}},
            username: String,
            password: String,
            nickname: String,
            played: Number,   
            wins: Number,
            points: Number
        });

    this.User = db.model("Users", this.userSchema);
    
}
UserDb.prototype = 
{
    hash : function(password, callback)
    {
        bcrypt.genSalt(10, function(err, salt)
        {
            if(err)
            {
               console.log("Error creating salt");
               callback(err);            
            }
            else
            {
                bcrypt.hash(password, 0, function(err, hash)
                {
                    if(err)
                    {
                       console.log("Error generating hash");
                       callback(err);            
                    }
                    else
                    {
                        callback(null, hash);
                    }
                });
             }
        });
    },
    
    createUser : function(email, nickname, pass, pass_confirm, callback)
    {
	    var self = this;
	    if(pass == pass_confirm)
	    {
	        self.hash(pass, function(err, hash){
	            if(err)
	            {
	                callback(err);
	            }
	            else
	            {
	                var newUser = new self.User(
	                    {
	                        email:email.toUpperCase(),
	                        username:email.toUpperCase(),
	                        password:hash, 
	                        nickname:nickname, 
	                        played:0, 
	                        wins:0, 
	                        points:0
	                    });
	                newUser.save(
	                    function(err)
	                    {
	                       if(err)
	                       {
	                           if(err.code == 11000) 
	                           { 	                         
		                           console.log("Attempt to create existing user");
		                           callback(null, false);
		                       }
		                       else
		                       {
		                          console.log(err.err);
		                          callback(err);
		                       }
	                        }
	                        else
	                        {
	                           console.log("New user created");
	                           callback(null, newUser);
	                        }
	                    }); //newUser.save()
	            }
	            }); //self.Hash()
	    }//if
	    else
	    {
	        console.log("Error: input mismatch");
	        callback(-1);    
	    }
	    
    },
    
    validateUser : function(email, password, callback)
    {
        this.User.findOne({email:email.toUpperCase()}, function(err, result){
            if (result)
            {
	            bcrypt.compare(password, result.password, function(err, res)
	            {   
	                if(!err & res == true)
	                {
	                    console.log("User: \""+email +"\"logged in.");
	                    callback(null, result);
	                }
	                else
	                {
	                   callback(err, false);
	                } 
	            });
	        }
	        else
	        {
	           callback(null, false);
	        }
        });
    },

    getUserAccount : function(id,callback){
    	console.log('User.js: getAccount');
    	this.User.findOne({_id:id}, function(err, result){

    		if(result){
    			console.log('Got Account');
    			callback(null,result);
    		}
    		else
    			callback(err,false);
    	});
    },

    changeNickname : function(id,nick,callback){
    	console.log('Changing the users nickname');

    	this.User.findOne({_id:id}, function(err,user){

    		if(user){
    			console.log('changed nickname to'+nick);
    			user.nickname = nick;
    			user.save();
    			callback(null,user);
    		}else{
    			console.log('could not find user');
    			callback(err,false);
    		}
    	});
    },

    changeAccount : function(id,nick,oldpass,newpass,confpass,callback){
    	 console.log('User.js: getAccount');
    	 // this.User.update({nickname:'test1'}, {$inc: {points:1}});

    	 this.User.findOne({_id:id, password:oldpass}, function(err,user){
    	 	if(!user){
    	 		console.log('error getting results');
    	 		callback(err,false);
    	 	}
    	 	else{

    	 		if(oldpass != user.password)
    	 			user.password = newpass;

    	 		console.log('Changed password to: '+newpass);
    	 		user.save();
    	 		callback(null,user);
    	 	}
    	 });
    },
    incrementPoints : function(id, numPoints, callback)
    {
      this.User.update({_id:id}, {$inc : {points : numPoints}}, function(err){});
    },

    incrementPlayed : function(id, callback)
    {
      this.User.update({_id:id}, {$inc : {played : 1}}, function(err){});
    },
		// this.User.update({nickname: nick}, {$set: { nickname:nick}}, function(err,res){
		// 	if(err){
		// 		console.log('could not update');
		// 		callback(err,false);
		// 	}
		// 	else{
		// 		console.log('update succesfull');
		// 		callback(null,true);
		// 	}
		// });
    // },

}
module.exports = new UserDb();
