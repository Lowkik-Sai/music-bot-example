var express = require("express");
var http = require("http");
var app = express();

const wakeDyno = require("woke-dyno");

// start the server, then call wokeDyno(url).start()
app.listen(PORT, () => {
    wakeDyno(https://among-us-bot-india.herokuapp.com/).start(); // DYNO_URL should be the url of your Heroku app
});
// Ping the app
app.use(express.static("public"));
// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
    response.sendStatus(200);
});

// Request listener
var listener = app.listen(process.env.PORT || 3000, function () {
    console.log("Your app is listening on port " + listener.address().port);
});
setInterval(() => {
    http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);
