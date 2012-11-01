var redis = require('redis'),
    fs = require('fs'),
    client = redis.createClient(),
    node_guid = require('node-guid');

client.on("error", function (err) {
    console.log("Error " + err);
});

var _ = new Object();
module.exports = _;

_.put = function(room,data,cb){
  cb = cb || function(){};
  client.rpush(['room:drawing:'+room.guid,JSON.stringify(data)],cb);
};

_.getCurrentDrawing = function(room,cb){
  var key = 'room:drawing:'+room.guid;
  client.llen([key],function(err,length){
    client.lrange([key,0,length-1],function(err,data){
      cb(err,data)
    });
  });
};

_.flush = function(room,cb){
  var key = 'room:drawing:'+room.guid;
  cb = cb || function(){};

  this.getCurrentDrawing(room,function(err,strokes){
    if(strokes && strokes.length){

      var drawing = {
        guid:node_guid.new(),
        author:room.round.drawer,
        strokes:strokes,
        word:room.round.word,
        date: Date(),
        difficulty:1
      };

      fs.writeFile('./drawings/'+drawing.guid+'.json',JSON.stringify(drawing,null,2),function(err){
        if(err){
          console.err(err);
        }else{
          console.log('BACKED UP DRAWING ',drawing.guid);
        }
      });

      client.del([key],function(){});
    }
  })
};
