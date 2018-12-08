/*
** custom stores
*/

var serial
var portName = '/dev/cu.usbmodem141101'

var store = {
  currentState: 'sleeping',
  prevSoundFile: '',
  counter: 0,
  lastTime: 0,
  currentTime: 0,
}
var flags = {
  isPlayingSound: false,
  enteredState: {
    sleeping: false,
    regular_1: false,
    regular_2: false,
    regular_3: false,
    regular_4: false,
    regular_5: false,
    regular_6: false,
    regular_7: false,
    regular_8: false,
    regular_9: false,
    regular_final: false,
    advanced_1: false,
    advanced_2: false,
    advanced_3: false,
    advanced_4: false,
    advanced_5: false,
    advanced_6: false,
    advanced_7: false,
    advanced_8: false,
    advanced_9: false,
  }
}

var setter = {
  fmtData(data) {
    return data.slice(0, -1)
  },
  activateAction(soundFileObj, toneCallback = false, prevIsPlaying = true) {
    console.log(store.currentState)
    if (!flags.isPlayingSound && !prevIsPlaying && !flags.enteredState[store.currentState]) {
      // default p5 soundfile play
      if (soundFileObj) {
        console.log(soundFileObj)
        var {soundFile, startTime} = soundFileObj
        if (startTime)
          soundFile.play(startTime)
        else
          soundFile.play()

        // update isPlaying flag
        update.isPlaying(true)
        soundFile.onended(function() {
          update.isPlaying(false)
        })
      }

      // tone.js callback
      if (toneCallback) toneCallback()
    } else {
      update.isPlaying(false)
    }
    // update entered state of each module
    flags.enteredState[store.currentState] = true

    // send data back to Arduino
    setter.sendSerialData()
  },
  deactivateAction(soundFile = false, toneCallback = false, isToPlay = false) {
    console.log(store.currentState)
    console.log(flags.enteredState[store.currentState])
    if(!setter.uploadingVoiceIsPlaying() && !flags.enteredState[store.currentState]) {
      if (isToPlay) {
        soundFile.play()
      } else {
        if(soundFile.isPlaying()) {
          if (soundFile) soundFile.stop()
          if (toneCallback) toneCallback()
        }
      }
    }
    // update entered state of each module
    flags.enteredState[store.currentState] = true

    // send data back to Arduino
    setter.sendSerialData()
  },
  startUploadingTimer() {
    if (millis() - store.lastTime > 7000 && store.counter < uploadingVoice.length) {
      console.log("uploading in progess")
      uploadingVoice[counter].play()
      if (store.counter < uploadingSound.length) {
        uploadingSound[counter].start()
      }
      store.counter++
      store.lastTime = millis()
    } else if (d9.isPlaying() || d7.isPlaying() || d5.isPlaying() || d3.isPlaying() || d1.isPlaying()) {
      store.lastTime = millis()
    }
  },
  uploadingVoiceIsPlaying() {
    let numOfUploadingVoices = uploadingVoice.filter(_voice => _voice.isPlaying() == true).length
    if (numOfUploadingVoices == 1) {
      return true
    } else if (numOfUploadingVoices == 0) {
      return false
    }
  },
  sendSerialData() {
    const isPlaying = getter.actDeactVoiceIsPlaying()
    if (isPlaying) serial.write(72)
    else serial.write(66)
  }
}

var getter = {
  actDeactVoiceIsPlaying() {
    let numOfActDeactVoices = actDeactVoice.filter(_voice => _voice.isPlaying()).length
    return numOfActDeactVoices === 1 ? 1 : 0
  }
}

var update = {
  currentState(data) {
    store.currentState = data
  },
  isPlaying(state) {
    flags.isPlayingSound = state
  }
}


/*
** assets initialization
*/
//-- p5 sounds --//
// activation stage + urging voice
let a1, a3, a5, a7, a9, a10, urg1, urg2
// uploading stage voice array
let uploadingVoice = []
// uploading stage voice
let u1, u2, u3, u4, u5, u6
// uploading stage sound track array
let uploadingSound = []
// deactivation stage voice
let d1, d3, d5, d7, d9, d0
// voices collection
let actDeactVoice = []

//-- tone.js --//
// activation
let s1 = new Tone.Player('./sounds/SoundTest/activation/wave.mp3').toMaster()
s1.volume.value = -2
s1.loop = true
let s2 = new Tone.Player('./sounds/SoundTest/activation/meditation.mp3').toMaster()
s2.volume.value = -10
s2.loop = true
let s3 = new Tone.Player('./sounds/SoundTest/activation/rain.mp3').toMaster()
s3.volume.value = -15
s3.loop = true
let s4 = new Tone.Player('./sounds/SoundTest/activation/bell.mp3').toMaster()
s4.volume.value = -30
s4.loop = true
let s5 = new Tone.Player('./sounds/SoundTest/activation/Sound bowl.mp3').toMaster()
s5.volume.value = -20
s5.loop = true
let s6 = new Tone.Player('./sounds/SoundTest/activation/sequence.mp3').toMaster()
s6.volume.value = -10
s6.loop = true
let s7 = new Tone.Player('./sounds/SoundTest/activation/drone loop.mp3').toMaster()
s7.volume.value = -20
s7.loop = true
let s10 = new Tone.Player('./sounds/SoundTest/activation/upload.mp3').toMaster()
s10.volume.value = -20
s10.loop = true

//deactivation:
ampEnv = new Tone.AmplitudeEnvelope({
  'attack': 0.05,
  'decay': 0.05,
  'sustain': 0.05,
  'release': 0.05
}).toMaster()

//noise for interrupting uploading
var noise = new Tone.Noise('white').connect(ampEnv).start()

var s11 = new Tone.Player('./sounds/SoundTest/deactivation/analog extreme.mp3').toMaster()
s11.volume.value = -10
s11.loop = true
var s12 = new Tone.Player('./sounds/SoundTest/deactivation/mri1.mp3').toMaster()
s12.volume.value = -10
s12.loop = true
var s13 = new Tone.Player('./sounds/SoundTest/deactivation/mri2.mp3').toMaster()
s13.volume.value = -10
s13.loop = true
var s14 = new Tone.Player('./sounds/SoundTest/deactivation/tension synths.mp3').toMaster()
s14.volume.value = -10
s14.loop = true
var osc1 = new Tone.Oscillator(300, 'square').toMaster()
osc1.volume.value = -30
var osc2 = new Tone.Oscillator(340, 'sine').toMaster()
osc2.volume.value = -30
var osc3 = new Tone.Oscillator(500, 'triangle').toMaster()
osc3.volume.value = -30

/*
** p5 functions
*/

function preload() {
  // uploading voices files
  u1  = loadSound('./sounds/Uploading/1initialize.mp3')
  u2  = loadSound('./sounds/Uploading/2scanning.mp3')
  u3  = loadSound('./sounds/Uploading/3mapping.mp3')
  u4  = loadSound('./sounds/Uploading/4reestablishing.mp3')
  u5  = loadSound('./sounds/Uploading/5uploading.mp3')
  u6  = loadSound('./sounds/Uploading/Congratulations.mp3')

  // testing voice files
  a0  = loadSound('./sounds/ActivationTest/a0.mp3')
  a1  = loadSound('./sounds/ActivationTest/a1.mp3')
  a3  = loadSound('./sounds/ActivationTest/a3.mp3')
  a5  = loadSound('./sounds/ActivationTest/a5.mp3')
  a7  = loadSound('./sounds/ActivationTest/a7.mp3')
  a9  = loadSound('./sounds/ActivationTest/a9.mp3')
  a10 = loadSound('./sounds/ActivationTest/a10.mp3')

  d9  = loadSound('./sounds/DeactivationTest/d9.mp3')
  d7  = loadSound('./sounds/DeactivationTest/d7.mp3')
  d5  = loadSound('./sounds/DeactivationTest/d5.mp3')
  d3  = loadSound('./sounds/DeactivationTest/d3.mp3')
  d1  = loadSound('./sounds/DeactivationTest/d1.mp3')
  d0  = loadSound('./sounds/DeactivationTest/d0.mp3')
}

function setup() {
  /* websocket connection */
  // socket.onopen = openSocket
  // socket.onmessage = showData

  /* serial port */
  serial = new p5.SerialPort()           	// make a new instance of the serialport library
  serial.on('list', printList)           	// set a callback function for the serialport list event
  serial.on('connected', serverConnected)	// callback for connecting to the server
  serial.on('open', portOpen)            	// callback for the port opening
  serial.on('data', serialEvent)         	// callback for when new data arrives
  serial.on('error', serialError)        	// callback for errors
  serial.on('close', portClose)          	// callback for the port closing

  serial.list()                          	// list the serial ports
  serial.open(portName)                  	// open a serial port

  /* sound settings */
  uploadingVoice 	= [u1, u2, u3, u4, u5, u6]
  uploadingSound 	= [s11, s12, s13, s14]
  actDeactVoice 	= [a0, a1, a3, a5, a7, a9, a10, d9, d7, d5, d3, d1, d0]
}

function draw() {
  var fmtString = store.currentState

  // console.log(store.currentState)

  switch (fmtString) {
    case 'sleeping':
      setter.activateAction({
        soundFile: a0,
        startTime: false
      }, false, false)
      break
    case 'regular_1':
      setter.activateAction({
        soundFile: a1,
        startTime: 3
      }, () => {
        Tone.Transport.start()
        s1.start()
      }, a0.isPlaying())
      break
    case 'regular_2':
      setter.activateAction(false, () => s2.start(), a1.isPlaying())
      break
    case 'regular_3':
      setter.activateAction({
        soundFile: a3,
        startTime: 1
      }, () => s3.start(), a1.isPlaying())
      break
    case 'regular_4':
      setter.activateAction(false, () => s4.start(), a3.isPlaying())
      break
    case 'regular_5':
      setter.activateAction({
        soundFile: a5,
        startTime: 2
      }, () => s5.start(), a3.isPlaying())
      break
    case 'regular_6':
      setter.activateAction(false, () => s6.start(), a5.isPlaying())
      break
    case 'regular_7':
      setter.activateAction({
        soundFile: a7,
        startTime: 1
      }, () => s7.start(), a5.isPlaying())
      break
    case 'regular_8':
      setter.activateAction(false, false, a7.isPlaying())
      break
    case 'regular_9':
      setter.activateAction({
        soundFile: a9,
        startTime: false
      })
      break
    case 'regular_final':
      setter.activateAction({
        soundFile: a10,
        startTime: 3
      }, () => {
        s10.start()
        s1.stop()
        s2.stop()
        s3.stop()
        s4.stop()
        s5.stop()
        s6.stop()
        s7.stop()
      }, a9.isPlaying())
      break
    case 'regular_deactivated':
      console.log('regular deactivated')
      break
    case 'advanced_0':
      setter.activateAction({
        soundFile: a10,
        startTime: 3
      }, () => {
        s10.start()
        s1.stop()
        s2.stop()
        s3.stop()
        s4.stop()
        s5.stop()
        s6.stop()
        s7.stop()
      }, a9.isPlaying())
      flags.enteredState.regular_final = true
      break
    case 'advanced_1':
      if (!a10.isPlaying() && !setter.uploadingVoiceIsPlaying() && !flags.enteredState[store.currentState]) {
        setter.deactivateAction(d9, false, true)
      }
      break
    case 'advanced_2':
      setter.deactivateAction(d9, function() {
        ampEnv.triggerAttackRelease("0.3")
      })
      break
    case 'advanced_3':
      setter.deactivateAction(d7, false, true)
      break
    case 'advanced_4':
      setter.deactivateAction(d7, function() {
        ampEnv.triggerAttackRelease("0.3")
      })
      break
    case 'advanced_5':
      setter.deactivateAction(d5, false, true)
      break
    case 'advanced_6':
      setter.deactivateAction(d5, function() {
        ampEnv.triggerAttackRelease("0.3")
      })
      break
    case 'advanced_7':
      setter.deactivateAction(d3, false, true)
      break
    case 'advanced_8':
      setter.deactivateAction(d3, function() {
        ampEnv.triggerAttackRelease("0.3")
      })
      break
    case 'advanced_final':
      setter.deactivateAction(d1, false, true)
      console.log('advanced final')
      break
    case 'advanced_deactivated':
      setter.deactivateAction(d1, function() {
        s11.stop()
        s12.stop()
        s13.stop()
        s14.stop()
        s10.stop()
        ampEnv.triggerAttackRelease("0.3")
        osc1.start()
        osc2.start()
        osc3.start()
        d0.play(1)
        if(!d0.isPlaying){
          osc1.stop()
          osc2.stop()
          osc3.stop()
        }
      })
      break
  }

  // console.log(flags.isPlayingSound)
  // if (store.currentState == 'sleeping') serial.write(72)
  // else if (store.currentState == 'regular_1') serial.write(66)
  // else serial.write(65)
}

/*
** serial port functions
*/
function keyPressed() {
  var outByte
	outByte = byte(key * 25); // map the key to a range from 0 to 225
 	console.log(outByte); // send it out the serial port
}

// get the list of ports:
function printList(portList) {
  // portList is an array of serial port names
  for (var i = 0; i < portList.length; i++) {
    // Display the list the console:
    console.log(i + " " + portList[i]);
  }
}

function serverConnected() {
  console.log('connected to server.');
}

function portOpen() {
  console.log('the serial port opened.')
}

function serialEvent() {
  // read a string from the serial port
  // until you get carriage return and newline:
  var inString = serial.readStringUntil('\r\n');
  //check to see that there's actually a string there:
  if (inString.length > 0) {
    if (inString !== 'hello') {
      var readValue = split(inString, ',')[0]
      update.currentState(readValue)
      // console.log(readValue)
      var sensors = split(inString, ',');           // split the string on the commas
    }
    // serial.write('x'); // send a byte requesting more serial data
  }
}

function serialError(err) {
  console.log('Something went wrong with the serial port. ' + err);
}

function portClose() {
  console.log('The serial port closed.');
}