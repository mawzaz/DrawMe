var redis = require("redis"),
    client = redis.createClient(),
    crypto = require("crypto"),
    node_guid = require('node-guid');

client.subscribe('randomGame');

var rooms = {};
var availablePorts = [];
var waitingQueue = [];

var MAX_PLAYERS = 5;

for(var i=8001; i < 8100; i++){
  availablePorts.push(i);
}

client.on('message',function(channel,message){
  switch(channel){
    case 'randomGame':
      console.log('Someone wants to play a random game');
      var room = checkAvailableGames();
      if(!room){
        console.log('All rooms are full.');
        //create new room
        room = createGame(function(room){
          console.log('Created a new game... Tell him to join room with guid ',room.guid);
          client.publish('joinGame',room);
        });
      }else{
        console.log('Tell him to join room with guid ',room.guid);
        client.publish('joinGame',room);
      }
      break;

    case 'endGameServer':
      validate(message.token,message.guid,function(room){
        delete rooms[message.guid];
      });
      break;

    case 'playerCount':
      validate(message.token,message.guid,function(room){
        room.players = message.players;
      });
      break;
  }
});

var validate = function(token,guid,cb){
  var guid = message.guid;
  var token = message.token;

  var room = rooms[guid];
  if(room && room.token === token){
    cb(room);
  }
}


var checkAvailableGames = function(){
  console.log('Check for availabe room');
  var playersInGame = 0;
  var room = null;
  for(var i in rooms){
    if(playersInGame < rooms[i].players && rooms[i].players < MAX_PLAYERS){
      playersInGame = rooms[i].players;
      room = rooms[i];
    }
  }

  return room;
}

var createGame = function(cb){
  console.log('Creating new game')
  crypto.randomBytes(48, function(ex, buf) {
    var port = getPort();
    if(port){
      var token = buf.toString('hex');
      var guid = node_guid.new();

      rooms[guid] = {
        token : token,
        players : 0,
        port: port
      }

      require('game-server.js').createGame({token:token,guid:guid,port:port});

      cb(rooms[guid]);
    }else{
      //all ports are taken... put user in queue 
    }
  });
}

var getPort(){
  if(availablePorts.length){
    var index = Math.floor(Math.random()*availablePorts.length);

    return availablePorts.splice(index,1)[0]; 
  }

  return null;
}