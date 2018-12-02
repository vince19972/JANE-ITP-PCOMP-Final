var SerialPort = require('serialport')
var WebSocketServer = require('ws').Server

// creating websocket instance
var SERVER_PORT = 8081
var wss = new WebSocketServer({ port: SERVER_PORT })
var connections = new Array

wss.on('connection', handleConnection)

function handleConnection(client) {
  console.log('New Connection')
  connections.push(client)

  client.on('message', sendToSerial)
  client.on('close', () => {
    console.log('connection closed')
    var position = connections.indexOf(client)
    connections.splice(position, 1)
  })
}

function sendToSerial(data) {
  // console.log('sending to serial: ' + data)
  myPort.write(data)
}

// get port name from the command line
var portName = process.argv[2]
var myPort = new SerialPort(portName, 9600)

var Readline = SerialPort.parsers.Readline
var parser = new Readline()
myPort.pipe(parser)

myPort.on('open', showPortOpen)
parser.on('data', readSerialData)
myPort.on('close', showPortClose)
myPort.on('error', showError)

function showPortOpen() {
  console.log('port open. Data rate: ' + myPort.baudRate)
}

function readSerialData(data) {
  console.log(data)
  if (connections.length > 0)
    broadcast(data)
}

function showPortClose() {
  console.log('port closed.')
}

function showError(error) {
  console.log('Serial port error: ' + error)
}

function broadcast(data) {
  for (myConnection in connections) {
    connections[myConnection].send(data)
  }
}