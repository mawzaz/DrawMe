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
	                            console.log("Error creating user:" +err.err);
	                            callback(err);
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
        this.User.findOne({email:email.toUpperCase()}, {password : 1}, function(err, result){
            bcrypt.compare(password, result.password, function(err, res)
            {   
                if(!err & res == true)
                {
                    console.log("User: \""+email +"\"logged in.");
                }
                callback(err, res);
            });
        });
    }
}
module.exports = new UserDb();