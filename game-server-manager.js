var redis = require("redis"),
    client = redis.createClient(),
    crypto = require("crypto"),
    node_guid = require('node-guid');

client.subscribe('randomGame');
client.subscribe('endGameServer');
client.subscribe('playerCount');


var rooms = {};
var availablePorts = [];
var waitingQueue = [];

var MAX_PLAYERS = 5;

for(var i=8002; i < 8100; i++){
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
        room = createGame();
        console.log('Created a new game... Tell him to join room with guid ',room.guid);
      }else{
        console.log('Tell him to join room with guid ',room.guid);
      }
      room.playerExpectedToJoin(message.playerId);

      client.publish('joinGame',{room:room, playerId:message.playerId});
      break;

    case 'endGameServer':
      validate(message.guid,function(room){
        delete rooms[message.guid];
      });
      break;

    case 'playerCount':
      validate(message.guid,function(room){
        room.players = message.players;
      });
      break;
  }
});

var validate = function(token,guid,cb){
  var guid = message.guid;

  var room = rooms[guid];
  if(room){
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

var createGame = function(){
  console.log('Creating new game')

  var port = getPort();

  if(port){
    var guid = node_guid.new();

    rooms[guid] = {
      players : 0,
      port: port
    }

    require('game-server.js').createGame({guid:guid,port:port});

    return rooms[guid];
  }else{
    //all ports are taken... put user in queue 
    return null;
  }
}

var getPort = function(){
  if(availablePorts.length){
    var index = Math.floor(Math.random()*availablePorts.length);

    return availablePorts.splice(index,1)[0]; 
  }

  return null;
}