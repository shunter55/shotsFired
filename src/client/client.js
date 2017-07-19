var PORT = 8080;

//var ws = new WebSocket('ws://localhost:' + PORT, 'echo-protocol');
var ws = new WebSocket('ws://localhost:' + PORT, 'echo-protocol');

var changePort = function() {
	if (ws != null)
		ws.close();

	var portNum = document.getElementById("portNumber").value;
	ws = new WebSocket('ws://' + portNum + ':' + PORT, 'echo-protocol');
	setupWS();
}

var objs = {};
var keys = {};
keys.a = false;
keys.d = false;
keys.w = false;
keys.s = false;

var sendMessage = function() {
   var packet = new Packet();
   packet.left = keys.a;
   packet.right = keys.d;
   packet.up = keys.w;
   packet.down = keys.s;

   ws.send(JSON.stringify(packet));
};

var setupWS = function() {

	ws.addEventListener("message", function(e) {
		var arr = JSON.parse(e.data);
		objs = Object.keys(arr).map(function(key) {

	    	return JSON.parse(arr[key]);
		});

	   //var arr = JSON.parse(e.data);
	   //for (var i in arr) {
	   //	objs[i] = JSON.parse(arr[i]);
	   //}
	   //objs.length = Object.keys(objs).length;
	   //console.log(objs[0]);

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

var draw = function() {
	var map = document.getElementById("map");
	var i = players.length;
	while (objs.length > players.length) {
		var player = document.createElement("div");
		player.style.width = "20px";
		player.style.height = "20px";
		player.style.backgroundColor = "green";
		player.style.borderRadius = "10px";
		player.style.position = "absolute";
		player.style.top = "200px";
		player.style.left = "200px";
		players.push(player);
		map.appendChild(player);
		
		//console.log(JSON.stringify(players[i].style));
	}
	while (objs.length < players.length) {
		map.removeChild(players[players.length - 1]);
		delete players[players.length - 1];
		players.length = Object.keys(players).length;
	}
	for (var i in objs) {
		players[i].style.top = objs[i].y;
		players[i].style.left = objs[i].x;
	}

	//var player = document.getElementById("player");
	//player.style.top = obj.y;
	//player.style.left = obj.x;
};

//setInterval(function() {
//	sendMessage();
//}, 10);


setupWS();


