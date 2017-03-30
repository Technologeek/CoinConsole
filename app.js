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

var globalData;

//listen for websocket connections
websock.on('connection', function(socket){
    console.log("%s has connected to the server.", socket.id);

    socket.on('refresh', function(){
      console.log("Refreshing data for user %s", socket.id);
      socket.emit('refresh', globalData);
    });
});

//get coin data every minute - time will decrease at go-live
/*setInterval(function() {
  cmcGET.then(function(data){
    if(data && data != 'undefined'){
      res.send(data);
    } else {
      res.send('Something went wrong...');
    }
  }).catch(function(err){
    console.log(err);
    res.send('There was an error! ' + err);
  });
}, 60 * 1000);
*/

let cmcGET = new Promise(function(resolve, reject) {
  var request = http.request(options, function(response) {
    var chunks = [];

    response.on("data", function(chunk) {
      chunks.push(chunk);
    });

    response.on("end", function() {
      var data = Buffer.concat(chunks);
      resolve(data.toString());
    });
  });

  request.on('error', (err) => {
    console.log('ERROR CONTACTING THE API! %s', err);
    reject(Error(err));
  });

  request.end();
});

/*    ROUTES    */
//home page
app.get('/', function(req, res){
  //send the page
  res.render('index');
});

//legacy -- will get deleted once websockets run properly
app.get('/get', function(req, res){
  cmcGET.then(function(data){
    if(data && data != 'undefined'){
      globalData = data;
      res.send(data)
    } else {
      res.send('Something went wrong...')
    }
  }).catch(function(err){
    console.log(err);
    res.send('There was an error! ' + err);
  });
});

//let's use a templating engine...
app.set('view engine', 'pug');
app.set('views', cd + '/views');

//oh yeah, we want our styles and scripts to be available, too...
app.use( '/assets', express.static( cd + '/assets' ) );

//start the web server
app.listen(webport, console.log("Web server started on port %s...", webport));
