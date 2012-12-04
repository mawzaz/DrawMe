var io = require('socket.io'),
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    redis_db = require('./js/redis-db.js'),
    redis_pubsub = require('redis'),
    mongo_db = require('./js/User.js'),
    node_guid = require('node-guid');

app.use('/js',express.static(__dirname + '/js'));
app.use('/css',express.static(__dirname + '/css'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/lib', express.static(__dirname + '/lib'));


io = io.listen(server,{ log: false, reconnect:false });
server.listen(8001);


app.get('/', function (req, res) {
    console.log("GETTING HTML");
    res.sendfile(__dirname + '/app.html');
});

var rooms = {};

var MAX_TIME = 90000; //1 min 30 sec
// var MAX_TIME = 5000;

var WORDS = ["ball", "bat", "bed", "book", "boy", "bun", "can", "cake", "cap", "car", "cat", "cow", "cub", "cup", "dad", "day", "dog", "doll", "dust", "fan", "feet", "girl", "gun", "hall", "hat", "hen", "jar", "kite", "man", "map", "men", "mom", "pan", "pet", "pie", "pig", "pot", "rat", "son", "sun", "toe", "tub", "van", "apple", "arm", "banana", "bike", "bird", "book", "chin", "clam", "class", "clover", "club", "corn", "crayon", "crow", "crown", "crowd", "crib", "desk", "dime", "dirt", "dress", "fang ", "field", "flag", "flower", "fog", "game", "heat", "hill", "home", "horn", "hose", "joke", "juice", "kite", "lake", "maid", "mask", "mice", "milk", "mint", "meal", "meat", "moon", "mother", "morning", "name", "nest", "nose", "pear", "pen", "pencil", "plant", "rain", "river", "road", "rock", "room", "rose", "seed", "shape", "shoe", "shop", "show", "sink", "snail", "snake", "snow", "soda", "sofa", "star", "step", "stew", "stove", "straw", "string", "summer", "swing", "table", "tank", "team", "tent", "test", "toes", "tree", "vest", "water", "wing", "winter", "woman", "women", "alarm", "animal", "aunt", "bait", "balloon", "bath", "bead", "beam", "bean", "bedroom", "boot", "bread", "brick", "brother", "camp", "chicken", "children", "crook", "deer", "dock", "doctor", "downtown", "drum", "dust", "eye", "family", "father", "fight", "flesh", "food", "frog", "goose", "grade", "grandfather", "grandmother", "grape", "grass", "hook", "horse", "jail", "jam", "kiss", "kitten", "light", "loaf", "lock", "lunch", "lunchroom", "meal", "mother", "notebook", "owl", "pail", "parent", "park", "plot", "rabbit", "rake", "robin", "sack", "sail", "scale", "sea", "sister", "soap", "song", "spark", "space", "spoon", "spot", "spy", "summer", "tiger", "toad", "town", "trail", "tramp", "tray", "trick", "trip", "uncle", "vase", "winter", "water", "week", "wheel", "wish", "wool", "yard", "zebra", "actor", "airplane", "airport", "army", "baseball", "beef", "birthday", "boy", "brush", "bushes", "butter ", "cast", "cave", "cent", "cherries", "cherry", "cobweb", "coil", "cracker", "dinner", "eggnog", "elbow", "face", "fireman", "flavor", "gate", "glove", "glue", "goldfish", "goose", "grain", "hair", "haircut", "hobbies", "holiday", "hot", "jellyfish", "ladybug", "mailbox", "number", "oatmeal", "pail", "pancake", "pear", "pest", "popcorn", "queen", "quicksand", "quiet", "quilt", "rainstorm", "scarecrow", "scarf", "stream", "street", "sugar", "throne", "toothpaste", "twig", "volleyball", "wood", "wrench", "advice", "anger", "answer", "apple", "arithmetic", "badge", "basket", "basketball", "battle", "beast", "beetle", "beggar", "brain", "branch", "bubble", "bucket", "cactus", "cannon", "cattle", "celery", "cellar", "cloth", "coach", "coast", "crate", "cream", "daughter", "donkey", "drug", "earthquake", "feast", "fifth", "finger", "flock", "frame", "furniture", "geese", "ghost", "giraffe", "governor", "honey", "hope", "hydrant", "icicle", "income", "island", "jeans", "judge", "lace", "lamp", "lettuce", "marble", "month", "north", "ocean", "patch", "plane", "playground", "poison", "riddle", "rifle", "scale", "seashore", "sheet", "sidewalk", "skate", "slave", "sleet", "smoke", "stage", "station", "thrill", "throat", "throne", "title", "toothbrush", "turkey", "underwear", "vacation", "vegetable", "visitor", "voyage", "year", "able", "achieve", "acoustics", "action", "activity", "aftermath", "afternoon", "afterthought", "apparel", "appliance", "beginner", "believe", "bomb", "border", "boundary", "breakfast", "cabbage", "cable", "calculator", "calendar", "caption", "carpenter", "cemetery", "channel", "circle", "creator", "creature", "education", "faucet", "feather", "friction", "fruit", "fuel", "galley", "guide", "guitar", "health", "heart", "idea", "kitten", "laborer", "language", "lawyer", "linen", "locket", "lumber", "magic", "minister", "mitten", "money", "mountain", "music", "partner", "passenger", "pickle", "picture", "plantation", "plastic", "pleasure", "pocket", "police", "pollution", "railway", "recess", "reward", "route", "scene", "scent", "squirrel", "stranger", "suit", "sweater", "temper", "territory", "texture", "thread", "treatment", "veil", "vein", "volcano", "wealth", "weather", "wilderness", "wren", "wrist", "writer"];


var MAX_PLAYERS = 5;

var publisher_client = redis_pubsub.createClient();

var subscriber_client = redis_pubsub.createClient();
subscriber_client.subscribe('randomGame');

var usersExpectedToJoin = {}

subscriber_client.on('message',function(channel,message){
  message = JSON.parse(message);
  switch(channel){
    case 'randomGame':
      console.log('Player with ID = ',message.playerId,' wants to join a randomGame');
      var room = checkAvailableGames();
      console.log('Tell him to join room with guid = ',room.guid);

      var player = {guid: message.playerId, name: message.name, color:generateColor(room)};
      
      console.log("Expecting user to join:",player);

      usersExpectedToJoin[player.guid] = {room:room, player:player};

      publisher_client.publish('joinGame',JSON.stringify(player));
      break;
  }
});

var generateColor = function(room){
  var red,blue,green,key,arr;
  do{
    red = Math.floor((Math.random()*255));
    green = Math.floor((Math.random()*255));
    blue = Math.floor((Math.random()*255));
    arr = [red,green,blue];
    key = arr.join();
  }while(room.colors[key]);

  room.colors[key] = 1;

  return arr;
};

var checkAvailableGames = function(){
  console.log('Checking for availabe room');
  var playersInGame = 0;
  var room;
  for(var i in rooms){
    if(playersInGame < rooms[i].users_count && rooms[i].users_count < MAX_PLAYERS){
      playersInGame = rooms[i].players;
      room = rooms[i];
    }
  }

  if(!room){
    var guid = node_guid.new();
    //Create a new room
    room = rooms[guid] = {
        guid:guid,
        users:{},
        users_count:0,
        drawer_queue:[],
        round:{timer:0,nb:0,clock:null,drawer:null,word:null},
        colors:{}
    }
  }

  return room;

};


io.sockets.on('connection',function(socket){
    var channel = null;
    var room_nb = null;
    var player = null;

    socket.on('room_connect',function(data,cb){
        console.log('[ '+data.player.name+' IS JOINING A GAME ]');
        if(!data.player){
            return;
        }

        var info = usersExpectedToJoin[data.player.guid];
        if(!info || info.room.users_count >= MAX_PLAYERS){
          return;
        }else{
          player = info.player;
          room =  info.room;
          room_nb = room.guid;
          channel = 'room'+room_nb;
        }


        socket.join(channel);
        if(room.users_count === 1){
          startRound(room);
        }

        //add user
        room.users[player.guid] = player;
        room.users_count++;

        room.drawer_queue.push(player); //push player onto drawer stack

        //let everyone know about it
        broadcast({type:'user_add',player:player});

        redis_db.getCurrentDrawing(room,function(err,strokes){
          cb({users:room.users,round:{nb:room.round.nb, time:room.round.timer, drawer:room.round.drawer ? room.round.drawer.guid : null, drawing:strokes}});
        });
    });

    socket.on('room_update',function(data,cb){
        switch(data.type){
            case 'chat':
                //process guess
                processGuess(data);
                break;
            default:
                broadcast(data);    
        }
        if(cb)
            cb(data);
    });

    socket.on('drawing',function(data){
        redis_db.put(rooms[room_nb],data);
        socket.broadcast.to(channel).emit('drawing',data);
    });

    socket.on('disconnect',function(){
        leaveRoom();
    });

    var leaveRoom = function(){
        if (!player)
        {  
          return;
        }
        console.log('['+player.name+' IS LEAVING ROOM #'+room_nb+']');

        broadcast({type:'user_remove',player:player.guid});
        
        var room = rooms[room_nb];

        if(!room){
            return;
        }

        delete room.users[player.guid];
        room.users_count--;

        delete room.colors[player.color.join()];

        //remove user from drawer queue (if still present)
        for(var i in room.drawer_queue){
            if (room.drawer_queue[i].guid === player.guid)
                room.drawer_queue.splice(i,1);
        }

        if(room.users_count <= 0){
            delete rooms[room_nb];
        }else if(room.users_count === 1 || room.round.drawer.guid === player.guid){
            redis_db.flush(room,true);

            stopRound(room);

            if(!room.drawer_queue.length){
                for(var i in room.users){
                    room.drawer_queue.push(room.users[i]);
                }
            }
        }

        socket.leave(channel);
    }

    var broadcast = function(data){
        io.sockets.to(channel).emit('on_room_update',data);
    }

    var startRound = function(room){
        if(!room){
            return;
        }
        
        room.round.drawer = room.drawer_queue.shift();

        var round = {drawer:room.round.drawer ? room.round.drawer.guid : null, nb:++room.round.nb};
        broadcast({type:'pre_round_start', round:round});

        var countdown = 5;
        room.round.delayInterval = setInterval(function(){
            if(countdown > 0){
                round.time = countdown;
                broadcast({type:'pre_round_countdown', round:round})
                countdown--;
                return;
            }

            clearInterval(room.round.delayInterval);

            room.round.timer = MAX_TIME/1000;
            room.round.word = WORDS[Math.floor(Math.random()*WORDS.length)];

            broadcast({type:'round_start',round:{nb:room.round.nb, time:room.round.timer, drawer:room.round.drawer ? room.round.drawer.guid : null, word:room.round.word}});
            
            //increment games played for all players in the room
            for (var player in room.users){
              mongo_db.incrementPlayed(player, function(){});
            }
            
            room.round.clock = setInterval(function(){
                if(room.round.timer < 0){
                    clearInterval(room.round.clock);
                    return;
                }
                try{
                    room.round.timer--;
                    if(room.round.timer < 1){
                        room.round.time = 0;
                        clearInterval(room.round.clock);
                    }
                    broadcast({type:'clock',round:{nb:room.round.nb, time:room.round.timer, drawer:room.round.drawer.guid}});
                }catch(e){
                    clearInterval(room.round.clock);
                }
            },1000); //decrease countdown

            //reset timer when done
            room.round.stop = setTimeout(function(){
                broadcast({type:'results', winner:null, word:room.round.word});
                redis_db.flush(room);
                stopRound(room);
            },MAX_TIME)
        },1000);
    }

    var stopRound = function(room){
        if(!room){
            return;
        }

        room.round.timer = 0;

        //reset clock
        clearInterval(room.round.clock);
        clearTimeout(room.round.stop);
        clearTimeout(room.round.delayInterval);

        broadcast({type:'round_end',round:{nb:room.round.nb, time:room.round.timer, drawer:room.round.drawer.guid}});

        if(room.users_count > 1){
            var current_drawer = room.round.drawer;
            if(room.users[current_drawer.guid])
                room.drawer_queue.push(current_drawer);
            startRound(room);
        }
        else{
            room.round.nb = 0;
            room.round.clock = null;
            broadcast({type:'idle', round:{nb:room.round.nb, time:room.round.timer, drawer:room.round.drawer.guid}});
        }
    }

    var processGuess = function(msg){
        var room = rooms[room_nb];
        if(!room){
            return;
        }

        broadcast(msg);

        if(msg.chat.value.toLowerCase() === room.round.word){
            redis_db.flush(room);
            
            broadcast({type:'results', winner:msg.chat.user, word:room.round.word});
            mongo_db.incrementPoints(msg.chat.user, 1, function(){});
            stopRound(room);
        }
    }

});

