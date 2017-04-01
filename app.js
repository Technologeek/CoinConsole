var http = require("http"),
    express = require("express"),
    bodyparser = require("body-parser"),
    path = require('path'),

    cd = __dirname;
    webport = 3002,
    socketport = 3004,

    websock = require('socket.io')( socketport ),

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

var globalData,
    userRefreshRate = 5; //number of seconds before a user can successfully refresh

//listen for websocket connections
websock.on('connection', function(socket){
    console.log("%s has connected to the server.", socket.id);

    //send initial data
    console.log('Refreshing data for %s...', socket.id);
    socket.emit('refresh', globalData);

    //refresh the data every 'userRefreshRate' seconds
    var userRefreshTimer = setInterval(function() {
      console.log('Refreshing data for %s...', socket.id);
      socket.emit('refresh', globalData);
    }, userRefreshRate * 1000);
});

let cmcGET = new Promise(function(resolve, reject) {
  console.log('New request to refresh the coinmarketcap data.');
  var request = http.request(options, function(response) {
    var chunks = [];

    response.on("data", function(chunk) {
      chunks.push(chunk);
    });

    response.on("end", function() {
      var data = Buffer.concat(chunks);
      console.log('Successfully refreshed the coinmarketcap data!');
      resolve(data.toString());
    });
  });

  request.on('error', (err) => {
    console.log('ERROR CONTACTING THE API! %s', err);
    reject(Error(err));
  });

  request.end();
});

function getCoinData() {
  cmcGET.then(function(data){
    if(data && data != 'undefined'){
      globalData = data;
      return data;
    }
  }).catch(function(err){
    console.log(err);
    return 'There was an error! ' + err;
  });
}

//Get coin data on server start
//getCoinData();

//Get coin data every minute - time will decrease at go-live
var autoRefresh = setInterval(function(){
  getCoinData();
}, 15 * 1000);

/*    ROUTES    */
//home page
app.get('/', function(req, res){
  res.render('index');
});

//let's use a templating engine...
app.set('view engine', 'pug');
app.set('views', cd + '/views');

//oh yeah, we want our styles and scripts to be available, too...
app.use( '/assets', express.static( cd + '/assets' ) );

//start the web server
app.listen(webport, console.log("Web server started on port %s...", webport));
