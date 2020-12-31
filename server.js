var express = require("express");
var http = require("http");
var app = express();


// Ping the app
app.use(express.static("public"));
// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
    response.sendStatus(200);
});

setInterval(() => {
    http.get(`https://among-us-bot-india.herokuapp.com/`);
}, 280000);
