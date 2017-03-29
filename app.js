var http = require("http"),
    express = require("express"),
    bodyparser = require("body-parser"),
    path = require('path'),

    cd = __dirname;
    port = 3002,

    app = express();

var options = {
  "method": "GET",
  "hostname": "api.coinmarketcap.com",
  "port": null,
  "path": "/v1/ticker/",
  "headers": {
    "cache-control": "no-cache"
  }
};

app.set('view engine', 'pug');
app.set('views', cd + '/views');

app.use( '/assets', express.static( cd + '/assets' ) );


app.get('/', function(req, res){
  res.render('index');
});

app.get('/get', function(req, res){
  var cmcreq = http.request(options, function (cmcres) {
    var chunks = [];

    cmcres.on("data", function(chunk) {
      chunks.push(chunk);
    });

    cmcres.on("end", function() {
      var body = Buffer.concat(chunks);
      res.send(body.toString());
    });
  });

  cmcreq.end();
});

app.listen(port, console.log("started on port %s...", port));
