var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var Chance = require('chance');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var formidable = require('formidable');
var fs = require('fs');
var config = require('./config');
var five = require('johnny-five');
var db = require('./db_actions');
var colors = require('colors/safe');
var gm = require('gm').subClass({
  imageMagick: true
});

var board, btnOne, buttonTwo, btnOneDowned, btnTwoDowned,
  btnOneTimeout, btnTwoTimeout;

app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/player_img', express.static(path.join(__dirname, 'player_img')));
app.use(bodyParser.json({
  uploadDir: './uploads'
}));

var port = process.env.PORT || 3000;

//API Routes
app.get('/fetch/player/:id', function(req, res) {
  db.fetchPlayerInfo(req.params.id, res);
});

app.get('/fetch/settings', function(req, res) {
  db.loadSettings(res);
});

app.post('/create/player', function(req, res) {
  db.createNewProfile(req.body.name, res);
});

app.post('/fetch/players', function(req, res) {
  db.fetchPlayers(req.body.filter, req.body.sort, res);
});

app.post('/update/player/quote', function(req, res) {
  db.updatePlayerQuote(req.body.id, req.body.quote, res);
});

app.post('/save/winloss', function(req, res) {
  db.savePlayerWinLoss(req.body.gameType, req.body.winningIds, req.body.losingIds, res);
});

app.post('/save/setting', function(req, res) {
  db.saveSetting(req.body.column, req.body.value, res);
});

app.post('/update/player/picture', function(req, res) {
  var form = new formidable.IncomingForm();
  var playerId, picType;

  form.parse(req, function(err, fields, files) {
    console.log('Receiving upload');
    playerId = fields.id;
    picType = fields.picType;
  });

  form.on('end', function() {
    var tmpPath = this.openedFiles[0].path;
    var fileName = this.openedFiles[0].name;
    var preResizePath = './uploads/' + this.openedFiles[0].name;
    console.log('moving image to temp folder');
    fs.rename(tmpPath, preResizePath, function(err) {
      if (err) throw err;
      var nameGen = new Chance();
      var newName = nameGen.string({
        length: 12,
        pool: config.imageNameSeed
      });
      var ext = fileName.match(/\.(jpg|jpeg|png)$/i);
      ext = ext[0] || '.jpg';
      var finalPath = config.imageDir + newName + ext;
      console.log('resizing image');
      gm(preResizePath)
        .resize(null, 280)
        .write(finalPath, function(err) {
          if (!err) {
            console.log('done, cleaning up temp folder...');
            fs.unlink(preResizePath);
            db.updatePlayerPicture(playerId, picType, newName + ext, res);
          } else {
            res.writeHead(200, {
              'content-type': 'application/json'
            });
            var errorBody = {
              error: 'err'
            }
            res.write(JSON.stringify(errorBody));
            res.end();
          }
        });
    });

  });
});

board = new five.Board({
  port: config.boardPort
});

board.on('ready', function() {
  btnOne = new five.Button(config.btnOne);
  btnOneDowned = false;

  btnTwo = new five.Button(config.btnTwo);
  btnTwoDowned = false;

  btnOne.on('down', function() {
    btnOneTimeout = setTimeout(function() {
      btnOneDowned = false;
    }, 500);
    io.emit('btnDown', 'groupOne');
    if (btnOneDowned) {
      io.emit('btnDblDown', 'groupOne');
    }
    btnOneDowned = true;
  });

  btnOne.on('hold', function() {
    io.emit('btnHold', 'groupOne');
  });

  btnTwo.on('down', function() {
    btnTwoTimeout = setTimeout(function() {
      btnTwoDowned = false;
    }, 500);
    io.emit('btnDown', 'groupTwo');
    if (btnTwoDowned) {
      io.emit('btnDblDown', 'groupTwo');
    }
    btnTwoDowned = true;
  });

  btnTwo.on('hold', function() {
    io.emit('btnHold', 'groupTwo');
  });

});

http.listen(port, function() {
  db.initTable();
  var listenMsg = 'Playing pong on http://localhost:' + port + '!';
  console.log(colors.rainbow(listenMsg));
});
