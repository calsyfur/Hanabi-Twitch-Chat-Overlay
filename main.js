var irc = require('irc');
var readline = require('readline');
var request = require("request-promise");
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var PASS = '#########';
var NICK = '#########';
var CLIENT_ID = '##########';
var options;

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
//

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

setTimeout(function(){
  getChannel();
}, 1000);

//

// get channel name
function getChannel() {
    rl.question("CHANNEL: ", function (res) {
        rl.close();
        var channel_name = res.split(" ");
        channel_name[0] = '#' + channel_name[0];

        console.log("Joining:", channel_name);
          setTimeout(function () {
              joinChannel(channel_name);
          }, 3000);
    });
}

// join channel
function joinChannel(res) {
  var c = new irc.Client('irc.twitch.tv', NICK,
    {
      username: NICK,
      port: 6667,
      password: PASS,
      channels: res
    });

  c.addListener('error', function(message) {
    console.log('error: ', message);
  });
  c.addListener('raw', function(message) {
    getLogo(message.nick, message.args[1]);
  });
}

// http-request get user profile picture
function getLogo(user, msg) {
  options = {
    url: 'https://api.twitch.tv/kraken/channels/' + user,
    headers: {
      'Client-ID': CLIENT_ID
    }
  };
  request(options).then(function(response){
    var img = null;
    var info = JSON.parse(response);
    if (info.logo != null){
      img = ('<img class="profile-pic" src="' + info.logo + '">');
      console.log(user, ": ", msg);
      io.emit('message', user, msg, img);
    }
    else {
      img = ('<img class="profile-pic" src="' + getRandomProfilePicture() + '">');
      console.log(user, ": ", msg);
      io.emit('message', user, msg, img);
    }
  }).catch(function(err){
    console.log("callback error");
  });
}

// call getRandomInt, return random profile picture
function getRandomProfilePicture() {
  var i = getRandomInt(1,4);
  switch(i) {
    case 1:
      return 'http://res.cloudinary.com/miocci/image/upload/v1486183879/mio-purp.jpg';
    case 2:
      return 'http://res.cloudinary.com/miocci/image/upload/v1486183879/mio-pink.jpg';
    case 3:
      return 'http://res.cloudinary.com/miocci/image/upload/v1486183879/mio-blue.jpg';
    default:
      return 'http://res.cloudinary.com/miocci/image/upload/v1486183879/mio-purp.jpg';
  }
}

// generate random integer
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
