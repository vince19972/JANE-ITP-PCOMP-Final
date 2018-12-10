/*
** custom stores
*/

var serial
var portName = '/dev/cu.usbmodem144101'

var store = {
  currentState: 'sleeping',
  prevSoundFile: '',
  counter: 0,
  lastTime: 0,
  uploadLastTime: 0,
  showSequence: false,
  seqLastTime: 0, //for blinking deactivating sequence
  seqLit: false
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
    advanced_0: false,
  }
}

var setter = {
  fmtData(data) {
    return data.slice(0, -1)
  },
  activateAction(soundFileObj, toneCallback = false, prevIsPlaying = true) {
    // console.log(store.currentState)
    if (!flags.isPlayingSound && !prevIsPlaying && !flags.enteredState[store.currentState]) {
      // default p5 soundfile play
      if (soundFileObj) {
        // update isPlaying flag
        flags.isPlayingSound = true

        // play sound
        var { soundFile, startTime } = soundFileObj
        if (startTime)
          soundFile.play(startTime)
        else
          soundFile.play()

        // update isPlaying flag
        soundFile.onended(function () {
          flags.isPlayingSound = false
        })
      }

      // tone.js callback
      if (toneCallback) toneCallback()
    } else {
      flags.isPlayingSound = false
    }

    if (!flags.enteredState[store.currentState]) {
      store.lastTime = millis()
      if (store.currentState == 'advanced_0') {
        store.uploadLastTime = millis()
      }
    }

    // update entered state of each module
    flags.enteredState[store.currentState] = true

    // send data back to Arduino
    setter.sendSerialData()
  },
  deactivateAction(soundFile = false, toneCallback = false, isToPlay = false) {
    console.log(store.currentState)
    if (!getter.actDeactVoiceIsPlaying() && !getter.uploadingVoiceIsPlaying() && !flags.enteredState[store.currentState]) {
      if (isToPlay) {
        soundFile.play()
      } else {
        if (soundFile.isPlaying()) {
          if (toneCallback) toneCallback()
          if (soundFile) soundFile.stop()
        }
      }
    }
    // update entered state of each module
    flags.enteredState[store.currentState] = true

    // send data back to Arduino
    setter.sendSerialData()
  },
  startUrgingTimer() {
    console.log("urging timer starts");
    // console.log(millis() - store.lastTime);
    if (millis() - store.lastTime > 5000) {
      urg1.play();
      store.lastTime = millis();
    } else if (a1.isPlaying() || a3.isPlaying() || a5.isPlaying() || a7.isPlaying() || a9.isPlaying() || a10.isPlaying()) {
      store.lastTime = millis();
    }
  },
  startUploadingTimer() {
    if (millis() - store.uploadLastTime > 7000 && store.counter < uploadingVoice.length) {
      console.log(millis() - store.uploadLastTime);
      console.log("uploading in progess")
      s10.stop()
      uploadingVoice[store.counter].play()
      if (store.counter < uploadingSound.length) {
        uploadingSound[store.counter].start()
      }
      store.counter++
      store.uploadLastTime = millis()
    } else if (d9.isPlaying() || d7.isPlaying() || d5.isPlaying() || d3.isPlaying() || d1.isPlaying()) {
      store.uploadLastTime = millis()
    }
  },
  sendSerialData() {
    const isPlaying = getter.actDeactVoiceIsPlaying() || getter.uploadingVoiceIsPlaying() || flags.isPlayingSound
    console.log(isPlaying)
    if (isPlaying) serial.write(72)
    else serial.write(66)
  }
}

var getter = {
  actDeactVoiceIsPlaying() {
    let numOfActDeactVoices = actDeactVoice.filter(_voice => _voice.isPlaying()).length
    return numOfActDeactVoices >= 1
  },
  uploadingVoiceIsPlaying() {
    let numOfUploadingVoices = uploadingVoice.filter(_voice => _voice.isPlaying()).length
    return numOfUploadingVoices >= 1
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
let a1, a3, a5, a7, a9, a10, urg1, urg2, exit
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

let lastState;

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
var s10 = new Tone.Player("./sounds/SoundTest/activation/tension synths.mp3").toMaster();
s10.volume.value = -5;
s10.loop = true;

//deactivation:
ampEnv = new Tone.AmplitudeEnvelope({
  'attack': 0.05,
  'decay': 0.05,
  'sustain': 0.05,
  'release': 0.05
}).toMaster()

//noise for interrupting uploading
var noise = new Tone.Noise('white').connect(ampEnv).start()

//pulse sound
var autoFilter2 = new Tone.AutoFilter("8n").toMaster().start();
var autoFilter1 = new Tone.AutoFilter("4n").toMaster().start();
var s11 = new Tone.Oscillator(300, "triangle").connect(autoFilter1).connect(autoFilter2).toMaster();
s11.volume.value = -25;

var s12 = new Tone.Player('./sounds/SoundTest/deactivation/upload.mp3').toMaster()
s12.volume.value = -10
s12.loop = true
var s13 = new Tone.Player('./sounds/SoundTest/deactivation/analog extreme.mp3').toMaster()
s13.volume.value = -10
s13.loop = true
var s14 = new Tone.Player('./sounds/SoundTest/deactivation/mri2.mp3').toMaster()
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
  // //activating voice:
  // a0 = loadSound("./sounds/ActivationV3/a0.mp3")
  // a1 = loadSound("./sounds/ActivationV3/a1.mp3")
  // a3 = loadSound("./sounds/ActivationV3/a3.mp3")
  // a5 = loadSound("./sounds/ActivationV3/a5.mp3")
  // a7 = loadSound("./sounds/ActivationV3/a7.mp3")
  // a9 = loadSound("./sounds/ActivationV3/a9.mp3")
  a10 = loadSound("./sounds/ActivationV3/a10.mp3")
  // exit = loadSound('./sounds/ActivationV3/exit.mp3')
  // urg1 = loadSound("./sounds/ActivationV3/urging 1.mp3")
  // urg2 = loadSound("./sounds/ActivationV3/urging 2.mp3")

  // //deactivating voice
  // d9 = loadSound("./sounds/Deactivation/d9.mp3")
  // d7 = loadSound("./sounds/Deactivation/d7.mp3")
  // d5 = loadSound("./sounds/Deactivation/d5.mp3")
  // d3 = loadSound("./sounds/Deactivation/d3.mp3")
  // d1 = loadSound("./sounds/Deactivation/d1.mp3")
  // d0 = loadSound("./sounds/Deactivation/d0.mp3")

  // uploading voices files
  u1 = loadSound('./sounds/Uploading/1initialize.mp3')
  u2 = loadSound('./sounds/Uploading/2scanning.mp3')
  u3 = loadSound('./sounds/Uploading/3mapping.mp3')
  u4 = loadSound('./sounds/Uploading/4reestablishing.mp3')
  u5 = loadSound('./sounds/Uploading/5uploading.mp3')
  u6 = loadSound('./sounds/Uploading/Congratulations.mp3')

  // testing voice files
  a0 = loadSound('./sounds/ActivationTest/a0.mp3')
  a1 = loadSound('./sounds/ActivationTest/a1.mp3')
  a3 = loadSound('./sounds/ActivationTest/a3.mp3')
  a5 = loadSound('./sounds/ActivationTest/a5.mp3')
  a7 = loadSound('./sounds/ActivationTest/a7.mp3')
  a9 = loadSound('./sounds/ActivationTest/a9.mp3')
  // a10 = loadSound('./sounds/ActivationTest/a10.mp3')
  exit = loadSound('./sounds/ActivationV3/exit.mp3')

  urg1 = loadSound("./sounds/ActivationTest/urging 1.mp3");
  urg2 = loadSound("./sounds/ActivationTest/urging 2.mp3");
  d9 = loadSound('./sounds/DeactivationTest/d9.mp3')
  d7 = loadSound('./sounds/DeactivationTest/d7.mp3')
  d5 = loadSound('./sounds/DeactivationTest/d5.mp3')
  d3 = loadSound('./sounds/DeactivationTest/d3.mp3')
  d1 = loadSound('./sounds/DeactivationTest/d1.mp3')
  d0 = loadSound('./sounds/DeactivationTest/d0.mp3')
}

function setup() {
  createCanvas(windowWidth, windowHeight)
  store.showSequence = false
  store.seqLit = false

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
  uploadingVoice = [u1, u2, u3, u4, u5, u6]
  uploadingSound = [s11, s12, s13, s14]
  actDeactVoice = [a0, a1, a3, a5, a7, a9, a10, d1]

  /* timer settings */
  // move to start session button click function
  store.lastTime = millis()

}

function draw() {
  /* p5 canvas sketch */
  background(0)
  textSize(20)
  fill(255, 0, 0)
  text("waiver:", 10, windowHeight / 2 - 60)
  fill(255)
  text("Warning: never take off your headset when the session is in progress, as it might cause irreversible brain damage.", 10, windowHeight / 2 - 30)
  text("In case of any detected discomfort or malfunction, emergency instruction will light up.", 10, windowHeight / 2)
  if (store.showSequence) {   //blink white and red
    if (millis() - store.seqLastTime > 1000) {
      store.seqLit = !store.seqLit
      store.seqLastTime = millis()
    }
    if (store.seqLit) {
      fill(255, 0, 0)
    } else {
      fill(255)
    }
    text("To shut down the program, deactivate the modules in the following sequence: 1, 3, 5, 7, 9, 2, 4, 6, 8, 10", 10, windowHeight / 2 + 30)
  }
  console.log(store.currentState)
  /* p5 sound and main program */
  switch (store.currentState) {
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
      }, false, a7.isPlaying())
      break
    // case 'regular_final':
    //   break
    case 'regular_deactivated':
      console.log('regular deactivated')
      setter.activateAction({
        soundFile: exit,
        startTime: false
      }, () => {
        s1.stop()
        s2.stop()
        s3.stop()
        s4.stop()
        s5.stop()
        s6.stop()
        s7.stop()
      }, a9.isPlaying())
      break
    case 'advanced_0':
      setter.activateAction({
        soundFile: a10,
        startTime: false
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
      flags.enteredState.advanced_0 = true
      break
    case 'advanced_1':
      if (!a10.isPlaying() && !getter.uploadingVoiceIsPlaying() && !flags.enteredState[store.currentState]) {
        setter.deactivateAction(d9, false, true)
      }
      break
    case 'advanced_2':
      setter.deactivateAction(d9, function () {
        ampEnv.triggerAttackRelease("0.3")
      })
      break
    case 'advanced_3':
      setter.deactivateAction(d7, false, true)
      break
    case 'advanced_4':
      setter.deactivateAction(d7, function () {
        ampEnv.triggerAttackRelease("0.3")
      })
      break
    case 'advanced_5':
      setter.deactivateAction(d5, false, true)
      break
    case 'advanced_6':
      setter.deactivateAction(d5, function () {
        ampEnv.triggerAttackRelease("0.3")
      })
      break
    case 'advanced_7':
      setter.deactivateAction(d3, false, true)
      break
    case 'advanced_8':
      setter.deactivateAction(d3, function () {
        ampEnv.triggerAttackRelease("0.3")
      })
      break
    case 'advanced_final':
      setter.deactivateAction(d1, false, true)
      console.log('advanced final')
      break
    case 'advanced_deactivated':
      setter.deactivateAction(d0, false, true)
      store.showSequence = false
      //sound looping
      // console.log('in d0 tone')
      // s11.stop()
      // s12.stop()
      // s13.stop()
      // s14.stop()
      // ampEnv.triggerAttackRelease("0.3")
      // osc1.start()
      // osc2.start()
      // osc3.start()
      // if (!d0.isPlaying) {
      //   osc1.stop()
      //   osc2.stop()
      //   osc3.stop()
      // }
      break
  }

  // once entering advanced_1 && a10 stops, trigger uploading voice timer,
  if ((store.currentState == 'advanced_0' && !a10.isPlaying()) || store.currentState == 'advanced_1' || store.currentState == 'advanced_2' || store.currentState == 'advanced_3' || store.currentState == 'advanced_4' || store.currentState == 'advanced_5' || store.currentState == 'advanced_6' || store.currentState == 'advanced_7' || store.currentState == 'advanced_8' || store.currentState == 'advanced_final') {
    setter.startUploadingTimer();
  }

  // if(currentstate = regular 1-8 && currentState !==lastState)
  if (store.currentState == 'regular_1' || store.currentState == 'regular_2' || store.currentState == 'regular_3' || store.currentState == 'regular_4' || store.currentState == 'regular_5' || store.currentState == 'regular_6' || store.currentState == 'regular_7' || store.currentState == 'regular_8' && store.currentState !== lastState) {
    // store.lastTime = millis()
    setter.startUrgingTimer()
  }

  /* reset lastState */
  lastState = store.currentState
}






/*
** serial port functions
*/

// get the list of ports:
function printList(portList) {
  // portList is an array of serial port names
  for (var i = 0; i < portList.length; i++) {
    // Display the list the console:
    console.log(i + " " + portList[i])
  }
}

function serverConnected() {
  console.log('connected to server.')
}

function portOpen() {
  console.log('the serial port opened.')
}

function serialEvent() {
  var inString = serial.readStringUntil('\r\n')
  if (inString.length > 0) {
    if (inString !== 'hello') {
      var readValue = split(inString, ',')[0]
      console.log(readValue)
      update.currentState(readValue)
      // console.log(readValue)
      var sensors = split(inString, ',')           // split the string on the commas
    }
  }
}

function serialError(err) {
  console.log('Something went wrong with the serial port. ' + err)
}

function portClose() {
  console.log('The serial port closed.')
}