/**
 * New node file
 */

 var db = require("./User.js");
 
db.createUser("test@test.com", "TestCase", "hello", "hello", function(err, call){});
db.createUser("2@test.com", "TestCase", "hello", "hello", function(err, call){});

db.validateUser("test@test.com", "hello", function(err, result){});