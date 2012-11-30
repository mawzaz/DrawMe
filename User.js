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
	                           callback(null, true);
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

    getStats : function(nick,callback){
    	console.log('User.js: getStats()');
    	this.User.findOne({nickname:nick},function(err,result){

    		if(result){
    			console.log('Got Stats');
    			callback(null,result);
    		}
    		else
    			callback(err,false);
    	});
    },

    getAccount : function(nick,callback){
    	console.log('User.js: getAccount');
    	this.User.findOne({nickname:nick}, function(err, result){

    		if(result){
    			console.log('Got Account');
    			callback(null,result);
    		}
    		else
    			callback(err,false);
    	});
    },

    changeAccount : function(nick,pass,callback){
    	 console.log('User.js: getAccount');
    	 // this.User.update({nickname:'test1'}, {$inc: {points:1}});

    	 this.User.findOne({nickname:'test1'}, function(err,res){
    	 	if(!res){
    	 		console.log('error getting results');
    	 		callback(err,false);
    	 	}
    	 	else{
    	 		res.update({nickname:nick}, {$set: {nickname:nick}});
    	 		console.log('Changed nickname to: '+nick);
    	 		console.log('Changed password to: '+pass);
    	 		callback(null,res);
    	 	}
    	 })
		
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
    },

}
module.exports = new UserDb();