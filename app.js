var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    colors = require('colors');

server.listen(3000);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});


app.get('/newgame', function(req, res) {
    res.sendfile(__dirname + '/game.html');
});

// Initial var values
var bluepoints = "00",
    redpoints = "00",
    round = "1",
    bluePlayer1 = "",
    bluePlayer2 = "",
    redPlayer1 = "",
    redPlayer2 = "",
    currTime = Date.now();

var round1,
    round2,
    round3;

var connectCounter = "0"

function millisecondsToStr (milliseconds) {
    // TIP: to find current time in milliseconds, use:
    // var  current_time_milliseconds = new Date().getTime();

    function numberEnding (number) {
        return (number > 1) ? 's' : '';
    }

    var temp = Math.floor(milliseconds / 1000);
   
    var minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
        var minRemainder = (temp) - (minutes * 60);   
        return minutes + ' minute' + numberEnding(minutes) + ' ' + minRemainder + ' second' + numberEnding(minRemainder);
    }
    var seconds = temp % 60;
    if (seconds) {
        return seconds + ' second' + numberEnding(seconds);
    }
    return 'less than a second'; //'just now' //or other string you like;
}




function addpoint(data){

    var currentBP = Number(bluepoints),
        currentRP = Number(redpoints),
        pointTime =     millisecondsToStr(Date.now() - currTime);

    
    console.log(pointTime);

    switch (data)
        {
           case "blueplus":
                console.log('blue team plus 1');
                // var current = Number(bluepoints);
                bluepoints = currentBP+1;
                console.log(bluepoints);
            break;
           
           case "redplus":
                console.log('Red team plus 1');
                //var current = Number(redpoints);
                redpoints = currentRP+1;
                console.log(redpoints);
            break;

           case "bluemin":
                console.log('blue team minus 1');
                //var current = Number(bluepoints);
                bluepoints = currentBP-1;
                console.log(bluepoints);
            break;

           case "redmin":
                console.log('Red team minus 1');
                //var current = Number(redpoints);
                redpoints = currentRP-1;
                console.log(redpoints);
            break;

           default: 
                console.log('unknown message received:'+data);
            break;
        };

    // check for wins
        
    if (bluepoints == "10") {
        console.log("Blue team wins!".blue);
        io.emit('status', 'Blue Team Wins!');
    };

    if (redpoints == "10") {
        console.log("Blue team wins!".blue);
       
        io.emit('status', 'Red Team Wins!');
    };


    io.emit('score-update', {blue: bluepoints, red: redpoints, currentround: round, time : pointTime});
    console.log('Score '+pointTime+' !'.blue);
    
};

console.log('Server listening on port 3000'.green);

// On first client connection start a new game
io.sockets.on('connection', function(socket){

// Game round score keeper
    
    connectCounter++;
    console.log("connections: "+connectCounter);


    console.log('New device connected'.green);
    
    io.emit('status', 'New device connected!');

// Send score update to all devices on new connection
    io.emit('score-update', {blue: bluepoints, red: redpoints, currentround: round});

// Receiving info from remote page        
        socket.on('score', function(data){
            
            console.log('score received from Remote'.green)
            // io.emit('score-update', data);
            addpoint(data);
        });

        socket.on('status', function(data){
            switch (data)
            { case "newGame": 
                    newGame();
            break;
            };
        });


        socket.on('players', function(data){
            console.log(data);
            bluePlayer1 = data.bluePlayer1;
            bluePlayer2 = data.bluePlayer2;
            redPlayer1 = data.redPlayer1;
            redPlayer2 = data.redPlayer2;
        });

function newGame() {
    bluepoints = "00"
    redpoints = "00"
    round = "1"
    currTime = Date.now();
    io.emit('score-update', {blue: bluepoints, red: redpoints, currentround: round});
    console.log('New Game Starting');
    io.emit('status', "Starting new Game...");
    
};

socket.on('disconnect', function() { 
    connectCounter--; console.log("connections: "+connectCounter);

});

}); //end socket connection


var five = require("johnny-five"),
  board, button;

board = new five.Board();

board.on("ready", function() {

  blueSensor = new five.Button(8);
  redSensor = new five.Button(10);

  board.repl.inject({
    blueSensor: button,
    redSensor: button
  });

  blueSensor.on("up", function() {
    console.log("up");
    addpoint("blueplus");
  });

  redSensor.on("up", function() {
    console.log("up");
    addpoint("redplus");
  });
});



