"use strict"

const SCREEN_SIZE = 600;
const FLAG_BORDER_SIZE = 5;

var PORT = 8080;
var IP = 'localhost';
var ws = new WebSocket('ws://' + IP + ':' + PORT, 'echo-protocol');

var serverPacket;
var keys = { a: false, d: false, w: false, s: false, shoot: false, shootPos: { 'x': 0, 'y': 0 } };
var players = [];
var bullets = [];
var blocks = [];
var flags = [];

function to_num(s) {
  return Number(s.substring(0, s.length-2));
}

var map = {};

window.addEventListener("keydown", function(event) {
  switch (event.key) {
    case 'a':
      keys.a = true;
      break;
    case 's':
      keys.s = true;
      break;
    case 'd':
      keys.d = true;
      break;
    case 'w':
      keys.w = true;
      break;
    }
});

window.addEventListener("keyup", function(event) {
  switch (event.key) {
    case 'a':
    case 'A':
      keys.a = false;
      break;
    case 's':
    case 'S':
      keys.s = false;
      break;
    case 'd':
    case 'D':
      keys.d = false;
      break;
    case 'w':
    case 'W':
      keys.w = false;
      break;
  }
});

var server = {};
server.connect = function() {
  if (ws != null) {
    ws.close();
    ws = null;
  }
  var ip = document.getElementById("ip").value;
  console.log(ip);
  ws = new WebSocket('ws://' + ip + ':' + PORT, 'echo-protocol');
  server.setupWS();
}

server.setupWS = function() {
  ws.addEventListener("message", function(e) {
    serverPacket = JSON.parse(e.data);
    switch (serverPacket.type) {
      case "update":
        draw();
        server.sendMessage();
        break;
      case "message":
        break;
      case "score":
        updateScore();
        break;
      default:
        console.log("Unsupported Packet Type");
        break;
    }
  });
}

server.sendMessage = function() {
   var packet = new Packet();
   packet.left = keys.a;
   packet.right = keys.d;
   packet.up = keys.w;
   packet.down = keys.s;
   packet.shoot = keys.shoot;
   packet.shootPos = keys.shootPos;
   keys.shoot = false;

   ws.send(JSON.stringify(packet));
   

   //shootHack();
};



function Map() {
  map.map = document.getElementById("map");
  map.map.addEventListener("click", player.shootBullet);
  redrawMap();
}

map.getPoints = function(e) {
  if(e.target.id === "map") {
    return [e.layerX/map.ratio, e.layerY/map.ratio];
  } else if(e.target.parentElement.id === "map") {
    return [(e.layerX+to_num(e.target.style.left))/map.ratio, (e.layerY+to_num(e.target.style.top))/map.ratio];
  }
  return [600, 600];
}

var setup = {};
setup.init = function() {
   Map();
};

server.setupWS();

var offset = {
  x: 0,
  y: 0
};

var player = {};
player.shootBullet = function(e) {
   var points = map.getPoints(e);
   keys.shoot = true;

   var offsetX = serverPacket.playerArr[0].center.x + (points[0] - SCREEN_SIZE / 2);
   var offsetY = serverPacket.playerArr[0].center.y + (points[1] - SCREEN_SIZE / 2);
   keys.shootPos = {'x': offsetX, 'y': offsetY};
}

var util = {};
util.convertCenterPosCircle = function(circle, ratio) {
   var pos = {};
   pos.x = circle.x - (ratio * circle.radius * 2) / 2;
   pos.y = circle.y - (ratio * circle.radius * 2) / 2;
   return pos;
}
util.convertCenterPosRectangle = function(rectangle, ratio) {
   var pos = {};
   pos.x = rectangle.center.x - (ratio * rectangle.width) / 2;
   pos.y = rectangle.center.y - (ratio * rectangle.height) / 2;
   return pos;
}

map.createPlayer = function() {
  var player = document.createElement('div');
  player.style.position = 'absolute';
  players.push(player);
  map.map.appendChild(player);
};

map.drawPlayer = function(player, i) {
  var y = (player.center.y + offset.y) * map.ratio - player.radius * map.ratio;
  var x = (player.center.x + offset.x) * map.ratio - player.radius*map.ratio;
  players[i].style.transform = "translate(" + x + "px, " + y + "px)";

  players[i].style.width = (2 * player.radius) * map.ratio + 'px';
  players[i].style.height = (2 * player.radius) * map.ratio + 'px';
  players[i].style.borderRadius = player.radius * map.ratio + 'px';
  players[i].style.border = "none";

  if (player.team == 1) {
    players[i].style.backgroundColor = 'blue';
  } else {
    players[i].style.backgroundColor = 'green';
  }

  if (player.flag != false) {
    players[i].style.width = (2 * (player.radius - FLAG_BORDER_SIZE)) * map.ratio + 'px';
    players[i].style.height = (2 * (player.radius - FLAG_BORDER_SIZE)) * map.ratio + 'px';
    players[i].style.borderRadius = player.radius * map.ratio + 'px';
    if (player.flag.team == 0) {
      players[i].style.border = FLAG_BORDER_SIZE + "px solid green";
    } else {
      players[i].style.border = FLAG_BORDER_SIZE + "px solid blue";
    }
  }

  if (player.deathTimer > 0) {
    players[i].style.opacity = "0.5";
  } else {
    players[i].style.opacity = "1";
  }
}

map.createBullet = function() {
  var bullet = document.createElement('bullet');
  bullet.style.backgroundColor = 'black';
  bullet.style.position = 'absolute';
  bullets.push(bullet);
  map.map.appendChild(bullet);
};

map.drawBullet = function(bullet, i) {
  var y = (bullet.center.y + offset.y) * map.ratio - bullet.radius*map.ratio;
  var x = (bullet.center.x + offset.x) * map.ratio - bullet.radius*map.ratio;
  bullets[i].style.transform = "translate(" + x + "px, " + y + "px)";

  bullets[i].style.width = (2 * bullet.radius) * map.ratio + 'px';
  bullets[i].style.height = (2 * bullet.radius) * map.ratio + 'px';
  bullets[i].style.borderRadius = bullet.radius * map.ratio + 'px';
};

map.createBlock = function() {
  var block = document.createElement("div");
  block.style.backgroundColor = "orange";
  block.style.position = "absolute";
  block.style.zIndex = 1;
  blocks.push(block);
  map.map.appendChild(block);
}

map.drawBlock = function(block, i) {
  var y = (block.center.y + offset.y) * map.ratio - block.height*map.ratio/2;
  var x = (block.center.x + offset.x) * map.ratio - block.width*map.ratio/2;
  blocks[i].style.transform = "translate(" + x + "px, " + y + "px)";

  blocks[i].style.width = (block.width * map.ratio) + "px";
  blocks[i].style.height = (block.height * map.ratio) + "px";
}

map.createFlag = function() {
  var flag = document.createElement("div");
  flag.style.backgroundColor = "gold";
  flag.style.position = "absolute";
  flag.style.zIndex = 2;
  flags.push(flag);
  map.map.appendChild(flag);
}

map.drawFlag = function(flag, i) {
  var y = (flag.center.y + offset.y) * map.ratio - flag.radius*map.ratio;
  var x = (flag.center.x + offset.x) * map.ratio - flag.radius*map.ratio;
  flags[i].style.transform = "translate(" + x + "px, " + y + "px)";

  flags[i].style.width = (2 * (flag.radius - FLAG_BORDER_SIZE)) * map.ratio + 'px';
  flags[i].style.height = (2 * (flag.radius - FLAG_BORDER_SIZE)) * map.ratio + 'px';
  flags[i].style.borderRadius = flag.radius * map.ratio + 'px';
  if (flag.team == 0) {
    flags[i].style.border = FLAG_BORDER_SIZE + "px solid green";
  } else {
    flags[i].style.border = FLAG_BORDER_SIZE + "px solid blue";
  }
}

function redrawAll() {
  for(var i = 0; i < players.length; i++) {
    map.drawPlayer(players[i], i);
  }
  for(var i = 0; i < bullets.length; i++) {
    map.drawBullet(bullets[i], i)
  }
  for(var i = 0; i < blocks.length; i++) {
    var block = blocks[i];

    var y = serverPacket.blockArr[i].center.y*map.ratio - serverPacket.blockArr[i].height*map.ratio/2;
    var x = serverPacket.blockArr[i].center.x*map.ratio - serverPacket.blockArr[i].width*map.ratio/2;
    block.style.transform = "translate(" + x + "px, " + y + "px)";

    block.style.width = (serverPacket.blockArr[i].width * map.ratio) + "px";
    block.style.height = (serverPacket.blockArr[i].height * map.ratio) + "px";
  }
}

function redrawMap() {
  if(to_num(map.map.style.height) !== window.innerHeight || to_num(map.map.style.width) !== window.innerWidth) {
    map.map.style.height = window.innerHeight;
    map.map.style.width = window.innerHeight;
    map.ratio = to_num(map.map.style.height) / SCREEN_SIZE;

    var leftBorder = document.getElementById("leftBorder");
    leftBorder.style.width = (window.innerWidth - to_num(map.map.style.width)) / 2;
    leftBorder.style.height = window.innerHeight + 10;
    var rightBorder = document.getElementById("rightBorder");
    rightBorder.style.width = (window.innerWidth - to_num(map.map.style.width)) / 2;
    rightBorder.style.height = window.innerHeight + 10;

    map.map.style.minHeight = window.innerHeight
    map.map.style.minWidth = window.innerHeight
  }
}

var draw = function() {
  offset.x = SCREEN_SIZE / 2 - serverPacket.playerArr[0].center.x;
  offset.y = SCREEN_SIZE / 2 - serverPacket.playerArr[0].center.y;

  redrawMap();

  // Add Players.
  while (serverPacket.playerArr.length > players.length) {
    map.createPlayer();
  }
  // Remove Players.
  while (serverPacket.playerArr.length < players.length) {
    map.map.removeChild(players[players.length - 1]);
    players.pop();
  }
  // Draw Players.
  for (var i in serverPacket.playerArr) {
    map.drawPlayer(serverPacket.playerArr[i], i);
  }

  // Add Bullets.
  while (serverPacket.bulletArr.length > bullets.length) {
    map.createBullet();
  }
  // Remove Bullets.
  while (serverPacket.bulletArr.length < bullets.length) {
    map.map.removeChild(bullets[bullets.length - 1]);
    bullets.pop();
  }
  // Draw Bullets.
  for (var i in serverPacket.bulletArr) {
    map.drawBullet(serverPacket.bulletArr[i], i);
  }

  // Add Blocks.
  while (serverPacket.blockArr.length > blocks.length) {
    map.createBlock();
  }
  // Remove Blocks.
  while (serverPacket.blockArr.length < blocks.length) {
    map.map.removeChild(blocks[blocks.length - 1]);
    blocks.pop();
  }
  // Draw Blocks.
  for (var i in serverPacket.blockArr) {
    map.drawBlock(serverPacket.blockArr[i], i);
  }

  // Add Flags.
  while (serverPacket.flagArr.length > flags.length) {
    map.createFlag();
  }
  // Remove Flags.
  while (serverPacket.flagArr.length < flags.length) {
    map.map.removeChild(flags[flags.length - 1]);
    flags.pop();
  }
  // Draw Flags.
  for (var i in serverPacket.flagArr) {
    map.drawFlag(serverPacket.flagArr[i], i);
  }
};

var updateScore = function() {
  var score = serverPacket.score;
  document.getElementById("score0").innerHTML = score.teams[0];
  document.getElementById("score1").innerHTML = score.teams[1];
  var seconds = score.time % 60;
  if (seconds <= 9) {
    seconds = "0" + seconds;
  }
  document.getElementById("time").innerHTML = Math.floor(score.time / 60) + ":" + seconds;
}

var shootHack = function() {
   for (var i in serverPacket.playerArr) {
      var p = new Packet();
      p.shoot = true;
      p.shootPos = {'x': serverPacket.playerArr[i].x, 'y': serverPacket.playerArr[i].y}
      ws.send(JSON.stringify(p));
   }
}






