var text		// variable for the text div you'll create
var socket = new WebSocket("ws://localhost:8081")
var reading

function setup() {
  // The socket connection needs two event listeners:
  socket.onopen = openSocket
  socket.onmessage = showData
  // console.log(socket.onmessage)
  // make a new div and position it at 10, 10:
  text = createDiv("Sensor reading:")
  text.position(10,10)
}
function openSocket() {
  text.html("Socket open")
  socket.send("Hello test")
}

function draw(p5) {
  createCanvas(200, 200)
  fill('black')
  ellipse(100, 100, 200, 200)
  textSize(100)
	createP(reading)
}
/*
showData(), below, will get called whenever there is new Data
from the server. So there's no need for a draw() function:
*/
function showData(result) {
  // when the server returns, show the result in the div:
  reading = result.data
  text.html("Sensor reading:" + reading)
  xPos = int(reading)        // convert result to an integer
  text.position(xPos, 10)        // position the text
  socket.send('a')
}