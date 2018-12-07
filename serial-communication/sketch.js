/*
** web socket
*/
var socket = new WebSocket('ws://localhost:8081')

/*
** custom stores
*/
const store = {
  currentState: 'sleeping',
  prevSoundFile: '',
  counter: 0,
  lastTime: 0,
  currentTime: 0
}
const flags = {
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

const set = {
  fmtData(data) {
    return data.slice(0, -1)
  },
  activateAction(soundFileObj, toneCallback = false, prevIsPlaying = true) {
    console.log(store.currentState)
    if (!flags.isPlayingSound && !prevIsPlaying && !flags.enteredState[store.currentState]) {
      // default p5 soundfile play
      if (soundFileObj) {
        console.log(soundFileObj)
        const {soundFile, startTime} = soundFileObj
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
    flags.enteredState[store.currentState] = true
  },
  deactivateAction(soundFile = false, toneCallback = false, isToPlay = false) {
    console.log(store.currentState)
    console.log(flags.enteredState[store.currentState])
    if(!set.uploadingVoiceIsPlaying() && !flags.enteredState[store.currentState]) {
      if (isToPlay) {
        soundFile.play()
      } else {
        if(soundFile.isPlaying()) {
          if (soundFile) soundFile.stop()
          if (toneCallback) toneCallback()
        }
      }
    }
    flags.enteredState[store.currentState] = true
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
  }
}

const update = {
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
let d1, d3, d5, d7, d9

//-- tone.js --//
// activation
let s1 = new Tone.Player('/assets/SoundTest/activation/wave.mp3').toMaster()
s1.volume.value = -2
s1.loop = true
let s2 = new Tone.Player('/assets/SoundTest/activation/meditation.mp3').toMaster()
s2.volume.value = -10
s2.loop = true
let s3 = new Tone.Player('/assets/SoundTest/activation/rain.mp3').toMaster()
s3.volume.value = -15
s3.loop = true
let s4 = new Tone.Player('/assets/SoundTest/activation/bell.mp3').toMaster()
s4.volume.value = -30
s4.loop = true
let s5 = new Tone.Player('/assets/SoundTest/activation/Sound bowl.mp3').toMaster()
s5.volume.value = -20
s5.loop = true
let s6 = new Tone.Player('/assets/SoundTest/activation/sequence.mp3').toMaster()
s6.volume.value = -10
s6.loop = true
let s7 = new Tone.Player('/assets/SoundTest/activation/drone loop.wav').toMaster()
s7.volume.value = -20
s7.loop = true
let s10 = new Tone.Player('/assets/SoundTest/activation/upload.wav').toMaster()
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
const noise = new Tone.Noise('white').connect(ampEnv).start()

const s11 = new Tone.Player('/assets/SoundTest/deactivation/analog extreme.wav').toMaster()
s11.volume.value = -10
s11.loop = true
const s12 = new Tone.Player('/assets/SoundTest/deactivation/mri1.mp3').toMaster()
s12.volume.value = -10
s12.loop = true
const s13 = new Tone.Player('/assets/SoundTest/deactivation/mri2.mp3').toMaster()
s13.volume.value = -10
s13.loop = true
const s14 = new Tone.Player('/assets/SoundTest/deactivation/tension synths.mp3').toMaster()
s14.volume.value = -10
s14.loop = true
const osc1 = new Tone.Oscillator(300, 'square').toMaster()
osc1.volume.value = -30
const osc2 = new Tone.Oscillator(340, 'sine').toMaster()
osc2.volume.value = -30
const osc3 = new Tone.Oscillator(500, 'triangle').toMaster()
osc3.volume.value = -30

/*
** p5 functions
*/

function preload() {
  // uploading voices files
  u1  = loadSound('/assets/Uploading/1initialize.mp3')
  u2  = loadSound('/assets/Uploading/2scanning.mp3')
  u3  = loadSound('/assets/Uploading/3mapping.mp3')
  u4  = loadSound('/assets/Uploading/4reestablishing.mp3')
  u5  = loadSound('/assets/Uploading/5uploading.mp3')
  u6  = loadSound('/assets/Uploading/Congratulations.mp3')

  // testing voice files
  a0  = loadSound('/assets/ActivationTest/a0.mp3')
  a1  = loadSound('/assets/ActivationTest/a1.mp3')
  a3  = loadSound('/assets/ActivationTest/a3.mp3')
  a5  = loadSound('/assets/ActivationTest/a5.mp3')
  a7  = loadSound('/assets/ActivationTest/a7.mp3')
  a9  = loadSound('/assets/ActivationTest/a9.mp3')
  a10 = loadSound('/assets/ActivationTest/a10.mp3')

  d9  = loadSound('/assets/DeactivationTest/d9.mp3')
  d7  = loadSound('/assets/DeactivationTest/d7.mp3')
  d5  = loadSound('/assets/DeactivationTest/d5.mp3')
  d3  = loadSound('/assets/DeactivationTest/d3.mp3')
  d1  = loadSound('/assets/DeactivationTest/d1.mp3')
}

function setup() {
  /* websocket connection */
  socket.onopen = openSocket
  socket.onmessage = showData

  /* sound settings */
  uploadingVoice = [u1, u2, u3, u4, u5, u6]
  uploadingSound = [s11, s12, s13, s14]
}

function draw() {
  const fmtString = set.fmtData(store.currentState)

  switch (fmtString) {
    case 'sleeping':
      set.activateAction({
        soundFile: a0,
        startTime: false
      }, false, false)
      break
    case 'regular_1':
      set.activateAction({
        soundFile: a1,
        startTime: 3
      }, () => {
        Tone.Transport.start()
        s1.start()
      }, a0.isPlaying())
      break
    case 'regular_2':
      set.activateAction(false, () => s2.start(), a1.isPlaying())
      break
    case 'regular_3':
      set.activateAction({
        soundFile: a3,
        startTime: 1
      }, () => s3.start(), a1.isPlaying())
      break
    case 'regular_4':
      set.activateAction(false, () => s4.start(), a3.isPlaying())
      break
    case 'regular_5':
      set.activateAction({
        soundFile: a5,
        startTime: 2
      }, () => s5.start(), a3.isPlaying())
      break
    case 'regular_6':
      set.activateAction(false, () => s6.start(), a5.isPlaying())
      break
    case 'regular_7':
      set.activateAction({
        soundFile: a7,
        startTime: 1
      }, () => s7.start(), a5.isPlaying())
      break
    case 'regular_8':
      set.activateAction(false, false, a7.isPlaying())
      break
    case 'regular_final':
      set.activateAction({
        soundFile: a9,
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
      }, a7.isPlaying())
      break
    case 'regular_deactivated':
      console.log('regular deactivated')
      break
    case 'advanced_0':
      a10.play()
      flags.enteredState.regular_final = true
      if (!a10.isPlaying() && !set.uploadingVoiceIsPlaying() && !flags.enteredState[store.currentState]) {
        d9.play()
        flags.enteredState[store.currentState] = true
      }
      break
    case 'advanced_1':
      set.deactivateAction(d9, function() {
        ampEnv.triggerAttackRelease("0.3")
      })
      break
    case 'advanced_2':
      set.deactivateAction(d7, false, true)
      break
    case 'advanced_3':
      set.deactivateAction(d7, function() {
        ampEnv.triggerAttackRelease("0.3")
      })
      break
    case 'advanced_4':
      set.deactivateAction(d5, false, true)
      break
    case 'advanced_5':
      set.deactivateAction(d5, function() {
        ampEnv.triggerAttackRelease("0.3")
      })
      break
    case 'advanced_6':
      set.deactivateAction(d3, false, true)
      break
    case 'advanced_7':
      set.deactivateAction(d3, function() {
        ampEnv.triggerAttackRelease("0.3")
      })
      break
    case 'advanced_8':
      set.deactivateAction(d1, false, true)
      break
    case 'advanced_final':
      console.log('advanced final')
      break
    case 'advanced_deactivated':
      set.deactivateAction(d1, function() {
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
}

/*
** websocket functions
*/

function openSocket() {
  socket.send('Hello test')
}

function showData(result) {
  update.currentState(result.data)
}