var PORT = 8080;
var IP = '10.0.0.200';

//var ws = new WebSocket('ws://localhost:' + PORT, 'echo-protocol');
var ws = new WebSocket('ws://' + IP + ':' + PORT, 'echo-protocol');

var changePort = function() {
	if (ws != null)
		ws.close();

	var portNum = document.getElementById("portNumber").value;
	ws = new WebSocket('ws://' + portNum + ':' + PORT, 'echo-protocol');
	setupWS();
}

var serverPacket;
var keys = {};
keys.a = false;
keys.d = false;
keys.w = false;
keys.s = false;
keys.shoot = false;
keys.shootPos = {'x': 0, 'y': 0};

//window.addEventListener("onload", init());

function init() {
	console.log("init")
	document.getElementById("map").addEventListener("click", shootBullet);
}

//document.addEventListener("click", shootBullet);

function shootBullet(e) {
	keys.shoot = true
	keys.shootPos = {'x': e.clientX - 10, 'y': e.clientY - 30}
	console.log(e);
}

//document.getElementById("map").addEventListener('onclick', function(e) {
//	console.log(e);
//});

var sendMessage = function() {
   var packet = new Packet();
   packet.left = keys.a;
   packet.right = keys.d;
   packet.up = keys.w;
   packet.down = keys.s;
   packet.shoot = keys.shoot;
   packet.shootPos = keys.shootPos;

   keys.shoot = false;

   ws.send(JSON.stringify(packet));
};

var setupWS = function() {

	ws.addEventListener("message", function(e) {
		serverPacket = JSON.parse(e.data);

	   draw();
	   sendMessage();
	});

}

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

var players = [];
var bullets = [];

var draw = function() {
	var map = document.getElementById("map");
	
	var i = players.length;
	// Add Players.
	while (serverPacket.playerArr.length > players.length) {
		var player = document.createElement("div");
		player.style.width = "20px";
		player.style.height = "20px";
		player.style.backgroundColor = "green";
		player.style.borderRadius = "10px";
		player.style.position = "absolute";
		players.push(player);
		map.appendChild(player);
	}
	// Remove Players.
	while (serverPacket.playerArr.length < players.length) {
		map.removeChild(players[players.length - 1]);
		players.pop();
	}
	// Draw Players.
	for (var i in serverPacket.playerArr) {
		players[i].style.top = serverPacket.playerArr[i].y;
		players[i].style.left = serverPacket.playerArr[i].x;
	}

	// Add Bullets.
	while (serverPacket.bulletArr.length > bullets.length) {
		var bullet = document.createElement("div");
		bullet.style.width = "10px";
		bullet.style.height = "10px";
		bullet.style.backgroundColor = "red";
		bullet.style.borderRadius = "5px";
		bullet.style.position = "absolute";
		bullets.push(bullet);
		map.appendChild(bullet);
	}
	// Remove Bullets.
	while (serverPacket.bulletArr.length < bullets.length) {
		map.removeChild(bullets[bullets.length - 1]);
		bullets.pop();
	}
	// Draw Bullets.
	for (var i in serverPacket.bulletArr) {
		bullets[i].style.top = serverPacket.bulletArr[i].y;
		bullets[i].style.left = serverPacket.bulletArr[i].x;
	}
};

//setInterval(function() {
//	sendMessage();
//}, 10);


setupWS();


