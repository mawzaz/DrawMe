var mysql = require("mysql");

// mysql.on("error", function (err) {
//     console.log("Error " + err);
// });

var _ = new Object();
module.exports = _;

var connection = mysql.createConnection({
	    database : 'DrawMe',
	    host     : 'localhost',
	    user     : 'root',
	    password : 'root',
	});

_.connect = function(){
  connection.connect();
	console.log("Connected to MYSQLDB");
};

_.disconnect = function(){
	connection.end();
	console.log("Disconnected from MYSQLDB");
};

_.select = function(query,callback){
	connection.query(query,function(err, rows,fields) {
  		if (err) throw err;

  		if(rows){
  			callback(rows);
      }
      
    	console.log("retrieved data succesfully");
	});
}

_.insert = function(query){
	connection.query(query,function(err,rows,fields){
		if(err) throw err;

		console.log("inserted succesfully into DB");
	});
};