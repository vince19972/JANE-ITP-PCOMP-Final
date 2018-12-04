// socket
var text		// variable for the text div you'll create
var socket = new WebSocket("ws://localhost:8081")

// mal
// var currentStage = 'sleeping'

//voice:
var regular_1, regular_3, regular_5, regular_7, regular_9, regular_10, urg_1, urg_2
var upload_1, upload_2, upload_3, upload_4, upload_5, upload_6
var advanced_1, advanced_3, advanced_5, advanced_7, advanced_9

function preload() {
  regular_0 = loadSound("./assets/activation/0.mp3");
  regular_1 = loadSound("./assets/activation/1st.mp3");
  regular_3 = loadSound("./assets/activation/3rd.mp3");
  regular_5 = loadSound("./assets/activation/5th.mp3");
  regular_7 = loadSound("./assets/activation/7th.mp3");
  regular_9 = loadSound("./assets/activation/9th.mp3");
  regular_10 = loadSound("./assets/activation/10th.mp3");
  urg_1 = loadSound("./assets/activation/urging 1.mp3");
  urg_2 = loadSound("./assets/activation/urging 2.mp3");
  advanced_9 = loadSound("./assets/deactivation/9.mp3");
  advanced_7 = loadSound("./assets/deactivation/7.mp3");
  advanced_5 = loadSound("./assets/deactivation/5.mp3");
  advanced_3 = loadSound("./assets/deactivation/3.mp3");
  advanced_1 = loadSound("./assets/deactivation/1.mp3");
  upload_1 = loadSound("./assets/uploading/1initialize.mp3");
  upload_2 = loadSound("./assets/uploading/2scanning.mp3");
  upload_3 = loadSound("./assets/uploading/3mapping.mp3");
  upload_4 = loadSound("./assets/uploading/4reestablishing.mp3");
  upload_5 = loadSound("./assets/uploading/5uploading.mp3");
  upload_6 = loadSound("./assets/uploading/Congratulations.mp3");
}

function setup() {
  // The socket connection needs two event listeners:
  socket.onopen = openSocket
  socket.onmessage = showData
  // console.log(socket.onmessage)
  // make a new div and position it at 10, 10:
  text = createDiv("Sensor reading:")
  text.position(10,10)

  currentStage = 'sleeping'
}
function openSocket() {
  text.html("Socket open")
  socket.send("Hello test")
}

function draw() {
  console.log(currentStage)

  if (currentStage === 'sleeping') {
    console.log('now sleeping')
  } else if (currentStage === 'regular_1') {
    console.log('now regular 1')
  }
  // switch (currentStage) {
  //   case 'sleeping':
  //     regular_0.play()
  //     console.log('sleeping now')
  //     break
  //   case 'regular_1':
  //     regular_1.play()
  //     console.log('regular one now')
  //     break
  //   case 'regular_2':
  //     break
  //   case 'regular_3':
  //     break
  //   case 'regular_4':
  //     break
  //   case 'regular_5':
  //     break
  //   case 'regular_6':
  //     break
  //   case 'regular_7':
  //     break
  //   case 'regular_8':
  //     break
  //   case 'regular_9':
  //     break
  //   case 'regular_final':
  //     break
  //   case 'regular_deactivated':
  //     break
  //   case 'advanced_0':
  //     break
  //   case 'advanced_1':
  //     break
  //   case 'advanced_2':
  //     break
  //   case 'advanced_3':
  //     break
  //   case 'advanced_4':
  //     break
  //   case 'advanced_5':
  //     break
  //   case 'advanced_6':
  //     break
  //   case 'advanced_7':
  //     break
  //   case 'advanced_8':
  //     break
  //   case 'advanced_final':
  //     break
  //   case 'advanced_deactivated':
  //     break
  // }
}
/*
showData(), below, will get called whenever there is new Data
from the server. So there's no need for a draw() function:
*/
function showData(result) {
  // when the server returns, show the result in the div:
  currentStage = result.data
  text.html("Sensor reading:" + currentStage)
  // socket.send('a')
}