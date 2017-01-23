var express = require('express');
var http = require("http");
var mysql = require("mysql");


var connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "honeywell",
  database:"cloud"
});

connection.connect(function(error){
  if(!!error){
    console.log(error);
  }else{
    console.log("connected");
  }
});
connection.query("use cloud");
app = express();
var server = http.createServer(app).listen(3000);
require('./requests')(app,connection);

console.log('Your application is running on http://localhost:3000');

