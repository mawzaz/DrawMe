var io = require('socket.io'),
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
//    mysql = require('./mysql-db.js'),
    redis = require("redis"),
    passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy,
    util = require("util");
    user = require("./User.js");



io = io.listen(server,{ log: false });
server.listen(8000);

app.use(express.static(__dirname + '/'));
app.use('/images', express.static(__dirname + '/'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({secret : "ECSE FTW"})),
app.use(passport.initialize()),
app.use(passport.session());

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
    console.log("Serializing user: " + user);
    done(null, JSON.stringify({_id : user._id, nickname: user.nickname}) );
});

passport.deserializeUser(function(user, done) {
    console.log("User deserialized, id: "+user);
    done(null, JSON.parse(user));
});


passport.use(new LocalStrategy(
    function(username, password, done)
    {
        user.validateUser(username, password, function(err, user)
        {
            if (err) {return done(err);}
            if (!user)
            {
                console.log(util.format("Unsuccessful login attempt. User: %s, Password: %s", username, password));
                return done(null, false, {message: "Incorrect username/password."});
            }
            console.log(util.format("Successful login attempt. User: %s", username));
            
            return done(null, user);    
            
        });
    }));
    
var requests = {};

var client = redis.createClient();

var channelName = "joinGame";
client.subscribe(channelName);

var client2 = redis.createClient();



client.on('message',function(channel,msg){
    msg = JSON.parse(msg);
    switch(channel){
      case 'joinGame':
        console.log("msg = ",msg);
        var res = requests[msg.guid];
        res.writeHead(200, {
          'Content-Type': 'application/json' 
        });
        res.write(JSON.stringify(msg));
        res.end();

        delete requests[msg.guid];
        break;
    }
});


app.post('/login', 
    passport.authenticate('local'), 
    function (req, res)
    {
        res.redirect("/menu.html");
    //    res.redirect("app.html");                             
    });

app.post("/test", function(res, req)
{
    console.log(req.user);
});

app.post('/random_game', function(req, res)
{
    if (req.user)
    {
        console.log("User logged in, joining random server");
        client2.publish("randomGame", JSON.stringify({playerId : req.user._id, name:req.user.nickname}));
        requests[req.user._id] = res;
    }
    else
    {
        console.log("No user logged in");
    }
});
    


app.post('/register', function(req,res){
    

    res.redirect('/index.html');
});

/*app.post('/playnow',function(req,res){
    //1.get id of the user
        // If not 401
        
        // Otherwise 
    //2.publish to randomGame via redis
    
    
    //requests[id] = res;
    
});*/
