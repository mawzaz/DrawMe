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
		                           console.log("Attempt to create existing user failed, user already exists");
		                           callback(null, false);
		                       }
		                       else
		                       {
		                          console.log(err.err);
		                          callback(err);
		                       }
	                        } // No error
	                        else
	                        {
                            callback(null, newUser);
	                        }
	                    }); //end newUser.save()
	            }
	            }); //end self.Hash()
	    }//endif
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
    }
}
module.exports = new UserDb();
