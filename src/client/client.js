const SCREEN_SIZE = 600;

var PORT = 8080;
var IP = 'localhost';
var ws = new WebSocket('ws://' + IP + ':' + PORT, 'echo-protocol');

var serverPacket;
var keys = { a: false, d: false, w: false, s: false, shoot: false, shootPos: { 'x': 0, 'y': 0 } };
var players = [];
var bullets = [];
var blocks = [];

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
      keys.a = false;
      break;
    case 's':
      keys.s = false;
      break;
    case 'd':
      keys.d = false;
      break;
    case 'w':
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
    draw();
    server.sendMessage();
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
  player.style.backgroundColor = 'green';
  player.style.position = 'absolute';
  players.push(player);
  map.map.appendChild(player);
};

map.drawPlayer = function(player, i) {
  var y = (player.center.y + offset.y) * map.ratio - player.radius * map.ratio;
  var x = (player.center.x + offset.x) * map.ratio - player.radius*map.ratio;
  players[i].style.top = y;
  players[i].style.left = x;
  players[i].style.width = (2 * player.radius) * map.ratio + 'px';
  players[i].style.height = (2 * player.radius) * map.ratio + 'px';
  players[i].style.borderRadius = player.radius * map.ratio + 'px';

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
  bullets[i].style.top = (bullet.center.y + offset.y) * map.ratio - bullet.radius*map.ratio;
  bullets[i].style.left = (bullet.center.x + offset.x) * map.ratio - bullet.radius*map.ratio;
  bullets[i].style.width = (2 * bullet.radius) * map.ratio + 'px'
  bullets[i].style.height = (2 * bullet.radius) * map.ratio + 'px'
  bullets[i].style.borderRadius = bullet.radius * map.ratio + 'px'
};

map.createBlock = function() {
  var block = document.createElement("div");
  block.style.backgroundColor = "orange";
  block.style.position = "absolute";
  blocks.push(block);
  map.map.appendChild(block);
}

map.drawBlock = function(block, i) {
  blocks[i].style.top = (block.center.y + offset.y) * map.ratio - block.height*map.ratio/2;
  blocks[i].style.left = (block.center.x + offset.x) * map.ratio - block.width*map.ratio/2;
  blocks[i].style.width = (block.width * map.ratio) + "px";
  blocks[i].style.height = (block.height * map.ratio) + "px";
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

    block.style.top = serverPacket.blockArr[i].center.y*map.ratio - serverPacket.blockArr[i].height*map.ratio/2;
    block.style.left = serverPacket.blockArr[i].center.x*map.ratio - serverPacket.blockArr[i].width*map.ratio/2;
    block.style.width = (serverPacket.blockArr[i].width * map.ratio) + "px";
    block.style.height = (serverPacket.blockArr[i].height * map.ratio) + "px";
  }
}

function redrawMap() {
  if(to_num(map.map.style.height) !== window.innerHeight) {
    map.map.style.height = window.innerHeight;
    map.map.style.width = window.innerHeight;
    map.ratio = to_num(map.map.style.height) / SCREEN_SIZE;

    var leftBorder = document.getElementById("leftBorder");
    leftBorder.style.width = (window.innerWidth - to_num(map.map.style.width)) / 2;
    leftBorder.style.height = window.innerHeight + 10;
    var rightBorder = document.getElementById("rightBorder");
    rightBorder.style.width = (window.innerWidth - to_num(map.map.style.width)) / 2;
    rightBorder.style.height = window.innerHeight + 10;
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
};





var shootHack = function() {
   for (var i in serverPacket.playerArr) {
      var p = new Packet();
      p.shoot = true;
      p.shootPos = {'x': serverPacket.playerArr[i].x, 'y': serverPacket.playerArr[i].y}
      ws.send(JSON.stringify(p));
   }
}






