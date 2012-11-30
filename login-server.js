var io = require('socket.io'),
  express = require('express'),
  app = express(),
  server = require('http').createServer(app),
//  mysql = require('./mysql-db.js'),
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
  done(null, JSON.stringify({_id : user._id, nickname: user.nickname})); 

  }
  );


passport.deserializeUser(function(user, done) {
  console.log("User deserialized, id: " +user);
  done(null, JSON.parse(user));
});


passport.use(new LocalStrategy(function(username, password, done)
{
  user.validateUser(username, password, function(err, user)
  {
    console.log(util.format("Logging in with User: %s, Password: %s", 
                                                      username, password));
    if (err) {return done(err);}
    if (!user)
    {
      console.log(util.format("Unsuccessful login attempt. User: %s, Password: %s", 
        username, password));
        
      //TODO: Notify frontend of unsuccessful login
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
  switch(channel){
    case 'joinGame':
    requests[msg.id].redirect(msg.url)
    break;
  }
});

app.post('/login', passport.authenticate('local',
  { successRedirect: "/menu.html",
    failureRedirect:"/index.html"}));


//app.post('/login', 
//  passport.authenticate('local'), 
//  function (req, res)
//  {
//      res.redirect("/menu.html");
//  });

app.post("/test", function(res, req)
{
  console.log(req.user);
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});



app.post('/random_game', function(req, res)
{
  if (req.user)
  {
    console.log("User logged in, joining random server");
    client2.publish("randomGame", req.user);
  }
  else
  {
    console.log("No user logged in");
  }
});
  


app.post('/register', function(req,result){
  
  var email = req.body.username,
      nickname = req.body.nickname,
      pass = req.body.password,
      pass_confirm = req.body.confirmPassword;
      
  user.createUser(email, nickname, pass, pass_confirm, function(err, res)
  {
    if(err)
    {
      // Something bad happened
      console.log(err);
    }  
    else if (res)
    {
      console.log(res);
      req.login(res, function(err){
        if(err)
        {
          console.error("Error during login redirect");
          console.error(err.stack);
        }
        else
        {
          result.redirect("/menu.html");
        }
      });
      
    }
    else if (!res)
    {
      // User already exists
      //TODO: Notify frontend
      result.redirect("/");
    }
  });
});

/*app.post('/playnow',function(req,res){
  //1.get id of the user
    // If not 401
    
    // Otherwise 
  //2.publish to randomGame via redis
  
  
  //requests[id] = res;
  
});*/
