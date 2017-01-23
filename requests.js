var bodyParser = require("body-parser");
var mysql = require("mysql");
var express = require('express');
var fs = require("fs");
var path = require("path");

module.exports = function(app,connection){

    app.use(bodyParser.json());

    app.use(bodyParser.urlencoded({ extended: false }));

    app.use(function(req, res, next) {
      //loging the requests made to server by clients
	    console.log(`${req.method} request for '${req.url}' - ${JSON.stringify(req.body)}`);
	    next();
    });
       
    //to serve the categories that are present
    app.get("/category",function(req,res){
    	var strQuery = "SELECT category FROM category ";
        console.log(strQuery);
        connection.query(strQuery,function(err,result){
            if(err){
            	console.log(err)
                res.end("something wrong happened");
            }else{
                res.json(result);
            }
        });
    });

    // to delete category
    app.delete("/categorydelete/:dcat",function(req,res){
        connection.query("DELETE FROM category WHERE category=?",[req.params.dcat],function(err,result){
            if(err){
                console.log(err)
                res.end("something wrong happened");
            }else{
                res.json("successfull");
            }
        });
    });

   ///////////////////////// //to serve the books under one category
    app.get("/books/data/:category", function(req, res) {
	    var cate = req.params.category.toLowerCase();
	    var strQuery = "SELECT name,price,description FROM books b,category c WHERE c.category=\'"+cate+"\' AND c.id=b.category";
        //console.log(strQuery);
        connection.query(strQuery,function(err,result){
            if(err){
            	console.log(err)
                res.end("something wrong happened");
            }else{
                res.json(result);
            }
        });
    });
  

    //to add new category of books
    app.put("/addCategory",function(req,res){
            var newCategory = String(req.body.newCategory);

            var items = {
                ID: 6,
                category:req.body.newCategory 
            };
            console.log(items);
            connection.query('INSERT INTO category SET ?',items,function(err, result) {
                if (err) {
                    console.log(err);
                    res.end("Oops! something went wrong");
                }
                console.log(result);
                res.end("successfull");
            });
    });
    

    //to get the price of the book via book name
    app.get("/bookPrice/data/:bName", function(req, res){
    	var Name = req.params.bName.toLowerCase();
    	var strQuery = "SELECT name,price,description,copies FROM books WHERE name =\'"+Name+"\'";
            console.log(strQuery);
            connection.query(strQuery,function(err,result){
            if(err){
            	console.log(err)
                res.end("something wrong happened");
            }else{
                res.json(result);
            }
        });
    });

    //modify the price of the book
    app.put("/changePrice/data",function(req,res){
    	var Name = req.body.bName.toLowerCase();
    	var Price = req.body.bPrice;
    	var strQuery = connection.query('UPDATE books SET price= ? WHERE name = ?',[Price,Name], function (err, result) {
            if (err) {
                res.end("Oops! something went wrong");
            }
            res.end("successfull");
        });
    });


    //remove the book from list and update the value of the copies
    app.put("/update",function(req,res){
    	var Name = req.body.bName.toLowerCase();
        var Copies = req.body.copies;
     
        var strQuery = "SELECT copies FROM books WHERE name =\'"+Name+"\'";
            console.log(strQuery);
            connection.query(strQuery,function(err,result){
            if(err){
                console.log(err)
                res.end("something wrong happened");
            }else{
                console.log(result[0].copies);
                  Copies = result[0].copies;
                  if(Copies==1){
                    connection.query("DELETE FROM books WHERE name ='"+Name+"'" , function (err, result) {
                        if (err) {
                            console.log(err);
                            res.end("Oops! something went wrong");
                        }
                        console.log(result);
                        res.end("successfull");
                    });
                  }else{
                    var strQuery = connection.query('UPDATE books SET copies= ? WHERE name = ?',[Copies-1,Name], function (err, result) {
                        if (err) {
                            console.log(err);
                            res.end("Oops! something went wrong");
                        }
                        res.end("successfull");
                    
                    });

                  }

            }
        });

        
    });



    app.get("/",function(req,res){

        if (req.url === "/") {
            fs.readFile("./html/beforeload.html", "UTF-8", function(err, html) {
                res.writeHead(200, {"Content-Type": "text/html"});
                res.end(html);
            });

        } else if (req.url.match(/.css$/)) {

            var cssPath = path.join(__dirname, 'html', req.url);
            var fileStream = fs.createReadStream(cssPath, "UTF-8");

            res.writeHead(200, {"Content-Type": "text/css"});

            fileStream.pipe(res);

        } else if (req.url.match(/.js$/)) {

            var imgPath = path.join(__dirname, 'html', req.url);
            var imgStream = fs.createReadStream(imgPath,"UTF-8");

            res.writeHead(200, {"Content-Type": "image/javascript"});

            imgStream.pipe(res);

        } else {
            res.writeHead(404, {"Content-Type": "text/plain"});
            res.end("404 File Not Found");
        }

        });

    app.get("/books",function(req,res){
         var query_index = req.url.indexOf('?');
         var query_string = (query_index>=0)?req.url.slice(0,query_index):'';
        if (query_string === "/books") {
            fs.readFile("./html/books.html", "UTF-8", function(err, html) {
                res.writeHead(200, {"Content-Type": "text/html"});
                res.end(html);
            });

        }else {
            res.writeHead(404, {"Content-Type": "text/plain"});
            res.end("404 File Not Found");
        }

        });
   

    app.get("/deleteb",function(req,res){
        if (req.url === "/deleteb") {
            fs.readFile("./html/DeleteCategory.html", "UTF-8", function(err, html) {
                res.writeHead(200, {"Content-Type": "text/html"});
                res.end(html);
            });

        }else {
            res.writeHead(404, {"Content-Type": "text/plain"});
            res.end("404 File Not Found");
        }

        });

    app.get("/addc",function(req,res){
        if (req.url === "/addc") {
            fs.readFile("./html/AddCategory.html", "UTF-8", function(err, html) {
                res.writeHead(200, {"Content-Type": "text/html"});
                res.end(html);
            });

        } else {
            res.writeHead(404, {"Content-Type": "text/plain"});
            res.end("404 File Not Found");
        }

        });

    app.get("/changePrice",function(req,res){
        if (req.url === "/changePrice") {
            fs.readFile("./html/temp.html", "UTF-8", function(err, html) {
                res.writeHead(200, {"Content-Type": "text/html"});
                res.end(html);
            });

        } else {
            res.writeHead(404, {"Content-Type": "text/plain"});
            res.end("404 File Not Found");
        }

    });

    app.get("/addc",function(req,res){
        if (req.url === "/addc") {
            fs.readFile("./html/AddCategory.html", "UTF-8", function(err, html) {
                res.writeHead(200, {"Content-Type": "text/html"});
                res.end(html);
            });

        }  else {
            res.writeHead(404, {"Content-Type": "text/plain"});
            res.end("404 File Not Found");
        }

        });

    app.get("/bookPrice",function(req,res){
        if (req.url === "/bookPrice") {
            fs.readFile("./html/getBook.html", "UTF-8", function(err, html) {
                res.writeHead(200, {"Content-Type": "text/html"});
                res.end(html);
            });

        } else {
            res.writeHead(404, {"Content-Type": "text/plain"});
            res.end("404 File Not Found");
        }

    });
}
