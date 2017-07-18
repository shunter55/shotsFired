var PORT = 8080;

var ws = new WebSocket('ws://localhost:' + PORT, 'echo-protocol');

var sendMessage = function() {
   let message = document.getElementById('message').value;
   ws.send(message);
};

ws.addEventListener("message", function(e) {
   // The data is simply the message that we're sending back
   var msg = e.data;

   // Append the message
   document.getElementById('chatlog').innerHTML += '<br>' + msg;
});