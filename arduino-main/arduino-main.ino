#include <Servo.h>
#include <SoftwareSerial.h>
#include "LPD8806.h"
#include "SPI.h"

/*
    global store
*/

/* vars */
const int modulesNum = 10;
const int regularFinal_end = modulesNum - 2;
const int regularFinal_enter = modulesNum;
const int advancedFinal_end = 0;

const int servoStartNum = 11;
const int btnStartNum = 31;

int incomingByte;

const int tabletMovingDuration = 5000; 
int insertedTabletsNum = 0;
String currentStage = "sleeping";

/* state flags */
boolean isRunning = true; // true if user is here
boolean isActivatingStage = true;
boolean isPlayingSounds = false;
//ada update
boolean isUploading = false;

/* lpd 8806 (led strip) */
// Number of RGB LEDs in strand
const int nLEDs = 40;

// Chose 2 pins for output; can be any valid output pins
const int dataPin  = 2;
const int clockPin = 3;

// The offset is used to cycle colours along the strip
int offset = 0;

// Multiple is used to space out the spectrum, a value of 4 will be four 
// times as many cycles as a value of 1 on any given length
const int multiple = 4;

// Number of steps the colour pattern advanc
const int offsetDelta = 2;
LPD8806 strip = LPD8806(nLEDs, dataPin, clockPin);


/* update functions */
void update_insertedTabletsNum(boolean toIncrease) {
  boolean tabletsAllIn = (insertedTabletsNum == modulesNum);
  boolean tabletsAllOut = (insertedTabletsNum == 0);
  boolean readyToIncrease = (toIncrease && insertedTabletsNum < modulesNum && !tabletsAllIn);
  boolean readyToDecrease = (!toIncrease && insertedTabletsNum > 0 && !tabletsAllOut);

  if (readyToIncrease) insertedTabletsNum += 1;
  if (readyToDecrease) insertedTabletsNum -= 1;
};

/* state actions */
void moveModule() {
  if (currentStage == "regular_deactivated") isRunning = false;
}

/* state machine */
void update_stage() {

  if (isRunning) {

    if (isActivatingStage) {

      if (currentStage != "regular_9") {

        // enter condition switching
        switch (insertedTabletsNum) {
          /* ejection denied, module btn locked after inserted */
          case 0:
            currentStage = "sleeping";
            break;
          case 1:
            currentStage = "regular_1";
            break;
          case 2:
            currentStage = "regular_2";
            break;
          case 3:
            currentStage = "regular_3";
            break;
          case 4:
            currentStage = "regular_4";
            break;
          case 5:
            currentStage = "regular_5";
            break;
          case 6:
            currentStage = "regular_6";
            break;
          case 7:
            currentStage = "regular_7";
            break;
          case 8:
            currentStage = "regular_8";
            break;
          /* ejection acceptable, module btn unlocked (9 tablets) */
          case modulesNum - 1:
            currentStage = "regular_9";
            break;
        }
        moveModule();

      } else {
        // enter condition switching
        switch (insertedTabletsNum) {
          case regularFinal_end:
            currentStage = "regular_deactivated";
            moveModule();
            break;
          case regularFinal_enter:
            currentStage = "regular_final";
            isActivatingStage = false;
            break;
        }
      }

    } else {
      switch (insertedTabletsNum) {
        case modulesNum:
          currentStage = "advanced_0";
          break;
        case 9:
          currentStage = "advanced_1";
          break;
        case 8:
          currentStage = "advanced_2";
          break;
        case 7:
          currentStage = "advanced_3";
          break;
        case 6:
          currentStage = "advanced_4";
          break;
        case 5:
          currentStage = "advanced_5";
          break;
        case 4:
          currentStage = "advanced_6";
          break;
        case 3:
          currentStage = "advanced_7";
          break;
        case 2:
          currentStage = "advanced_8";
          break;
        case 1:
          currentStage = "advanced_final";
          break;
        case 0:
          currentStage = "advanced_deactivated";
          break;
      }

      moveModule();
    }
  } else {
    currentStage = "sleeping";
    moveModule();
  }

};


/*
   classes
*/
class ModuleSet {
  public:
    ModuleSet(Servo servo, int btnPin);
    void updateBtnState();
    void moveTablet();
    void updateNeopixels();

    int _servoPin;
    int _btnPin;
    Servo _servo;
    boolean btnIsOn = false;
    boolean btnIsLocked = false;
  private:
    // base vars
    int _btnRead = 0;

    // btn toggle vars
    int _btnWasOn = !btnIsOn;
    unsigned long _time = 0;

    // deactivation sequence
    const int deactivateSequence [10] = {
      btnStartNum + 0,
      btnStartNum + 2,
      btnStartNum + 4,
      btnStartNum + 6,
      btnStartNum + 8,
      btnStartNum + 1,
      btnStartNum + 3,
      btnStartNum + 5,
      btnStartNum + 7,
      btnStartNum + 9,
    };

};

ModuleSet::ModuleSet(Servo servo, int btnPin) {
  _servo = servo;
  _btnPin = btnPin;
};

void ModuleSet::updateBtnState() {
  // lock or unlock btn before doing anything
  if (isPlayingSounds) {
    // but only before activating final stage
    if (isActivatingStage) {
      btnIsLocked = true;
      // or only one deactivation module left
    } else if (!isActivatingStage && insertedTabletsNum == 1) {
      btnIsLocked = true;
      // or only when all modules are inserted
    } else if (insertedTabletsNum == 10) {
      btnIsLocked = true;
    }
  } else {
    // reverse btn locked state after sound ends
    // but only do this in activating stage
    // or it'd unlock already ejected module
    if (!btnIsOn && isActivatingStage) btnIsLocked = false;
  }

  // update module locked status in deactivation stage
  if (!isActivatingStage) {
    btnIsLocked = true;
    switch (insertedTabletsNum) {
      case modulesNum:
        if (_btnPin == deactivateSequence[0] && !isPlayingSounds) btnIsLocked = false;
        break;
      case 9:
        if (_btnPin == deactivateSequence[1] && !isPlayingSounds) btnIsLocked = false;
        break;
      case 8:
        if (_btnPin == deactivateSequence[2] && !isPlayingSounds) btnIsLocked = false;
        break;
      case 7:
        if (_btnPin == deactivateSequence[3] && !isPlayingSounds) btnIsLocked = false;
        break;
      case 6:
        if (_btnPin == deactivateSequence[4] && !isPlayingSounds) btnIsLocked = false;
        break;
      case 5:
        if (_btnPin == deactivateSequence[5] && !isPlayingSounds) btnIsLocked = false;
        break;
      case 4:
        if (_btnPin == deactivateSequence[6] && !isPlayingSounds) btnIsLocked = false;
        break;
      case 3:
        if (_btnPin == deactivateSequence[7] && !isPlayingSounds) btnIsLocked = false;
        break;
      case 2:
        if (_btnPin == deactivateSequence[8] && !isPlayingSounds) btnIsLocked = false;
        break;
      case 1:
        if (_btnPin == deactivateSequence[9] && !isPlayingSounds) btnIsLocked = false;
        break;
      default:
        btnIsLocked = true;
        break;
    }
  }
  
  _btnRead = digitalRead(_btnPin);
  boolean debouncePassed = (_btnRead == false && _btnWasOn == true && millis() - _time > tabletMovingDuration);
  boolean readyToToggle = (debouncePassed && !btnIsLocked);

  // btn is not locked, switch btn state
  if (readyToToggle) {

    // toggle btn state
    if (btnIsOn == HIGH) btnIsOn = LOW;
    else btnIsOn = HIGH;

    // update inserted tablets number
    if (isActivatingStage) {
      if (currentStage != "regular_final") {
        update_insertedTabletsNum(true);
      } else {
        // unlock modules
        btnIsLocked = false;

        // update inserted tablets number
        boolean enterLastTablet = !_btnWasOn && btnIsOn;
        if (enterLastTablet) insertedTabletsNum = modulesNum;
        else insertedTabletsNum -= 1;
      }

    } else {
      switch (insertedTabletsNum) {
        case modulesNum:
          if (_btnPin == deactivateSequence[0]) update_insertedTabletsNum(false);
          break;
        case 9:
          if (_btnPin == deactivateSequence[1]) update_insertedTabletsNum(false);
          break;
        case 8:
          if (_btnPin == deactivateSequence[2]) update_insertedTabletsNum(false);
          break;
        case 7:
          if (_btnPin == deactivateSequence[3]) update_insertedTabletsNum(false);
          break;
        case 6:
          if (_btnPin == deactivateSequence[4]) update_insertedTabletsNum(false);
          break;
        case 5:
          if (_btnPin == deactivateSequence[5]) update_insertedTabletsNum(false);
          break;
        case 4:
          if (_btnPin == deactivateSequence[6]) update_insertedTabletsNum(false);
          break;
        case 3:
          if (_btnPin == deactivateSequence[7]) update_insertedTabletsNum(false);
          break;
        case 2:
          if (_btnPin == deactivateSequence[8]) update_insertedTabletsNum(false);
          break;
        case 1:
          if (_btnPin == deactivateSequence[9]) update_insertedTabletsNum(false);
          break;
      }

      // update debounce time value
      _time = millis();
    }

    // btn is not locked, move servo
    if (!btnIsLocked) {
      if (btnIsOn) {
        // move servo
        _servo.write(180);
        // update btnIsLocked
        btnIsLocked = true;
      } else {
        // move servo
        _servo.write(0);
        // update btnIsLocked
        btnIsLocked = true;
      }
    }
  }

  // led lights controlling depends on btnIsLocked value
  int controlledRGB [3] = {255, 0, 0};
  int restRGB [3] = {255, 255, 255};
  
  if (btnIsLocked) {
    led_moduleControl(_btnPin, controlledRGB);
  } else {
    led_moduleControl(_btnPin, restRGB);
  }

  // reset btnWasOn value for debounce function
  _btnWasOn = _btnRead;
};

void ModuleSet::moveTablet() {
  updateBtnState();
  update_stage();
}

/*
   init settings
*/

/* servos */
Servo servo_1;
const int servo_1_pin = servoStartNum + 0;
Servo servo_2;
const int servo_2_pin = servoStartNum + 1;
Servo servo_3;
const int servo_3_pin = servoStartNum + 2;
Servo servo_4;
const int servo_4_pin = servoStartNum + 3;
Servo servo_5;
const int servo_5_pin = servoStartNum + 4;
Servo servo_6;
const int servo_6_pin = servoStartNum + 5;
Servo servo_7;
const int servo_7_pin = servoStartNum + 6;
Servo servo_8;
const int servo_8_pin = servoStartNum + 7;
Servo servo_9;
const int servo_9_pin = servoStartNum + 8;
Servo servo_10;
const int servo_10_pin = servoStartNum + 9;

/* btns */
const int btnPin_1 = btnStartNum + 0;
int btnRead_1 = 0;
ModuleSet ModuleSet_1(servo_1, btnPin_1);

const int btnPin_2 = btnStartNum + 1;
int btnRead_2 = 0;
ModuleSet ModuleSet_2(servo_2, btnPin_2);

const int btnPin_3 = btnStartNum + 2;
int btnRead_3 = 0;
ModuleSet ModuleSet_3(servo_3, btnPin_3);

const int btnPin_4 = btnStartNum + 3;
int btnRead_4 = 0;
ModuleSet ModuleSet_4(servo_4, btnPin_4);

const int btnPin_5 = btnStartNum + 4;
int btnRead_5 = 0;
ModuleSet ModuleSet_5(servo_5, btnPin_5);

const int btnPin_6 = btnStartNum + 5;
int btnRead_6 = 0;
ModuleSet ModuleSet_6(servo_6, btnPin_6);

const int btnPin_7 = btnStartNum + 6;
int btnRead_7 = 0;
ModuleSet ModuleSet_7(servo_7, btnPin_7);

const int btnPin_8 = btnStartNum + 7;
int btnRead_8 = 0;
ModuleSet ModuleSet_8(servo_8, btnPin_8);

const int btnPin_9 = btnStartNum + 8;
int btnRead_9 = 0;
ModuleSet ModuleSet_9(servo_9, btnPin_9);

const int btnPin_10 = btnStartNum + 9;
int btnRead_10 = 0;
ModuleSet ModuleSet_10(servo_10, btnPin_10);

/* others */
int pos = 0;


/*
   setup
*/
void setup() {
  Serial.begin(9600);

  // init servos
  servo_1.attach(servo_1_pin);
  servo_1.write(0);
  servo_2.attach(servo_2_pin);
  servo_2.write(0);
  servo_3.attach(servo_3_pin);
  servo_3.write(0);
  servo_4.attach(servo_4_pin);
  servo_4.write(0);
  servo_5.attach(servo_5_pin);
  servo_5.write(0);
  servo_6.attach(servo_6_pin);
  servo_6.write(0);
  servo_7.attach(servo_7_pin);
  servo_7.write(0);
  servo_8.attach(servo_8_pin);
  servo_8.write(0);
  servo_9.attach(servo_9_pin);
  servo_9.write(0);
  servo_10.attach(servo_10_pin);
  servo_10.write(0);

  // init btns
  pinMode(btnPin_1, INPUT);
  pinMode(btnPin_2, INPUT);
  pinMode(btnPin_3, INPUT);
  pinMode(btnPin_4, INPUT);
  pinMode(btnPin_5, INPUT);
  pinMode(btnPin_6, INPUT);
  pinMode(btnPin_7, INPUT);
  pinMode(btnPin_8, INPUT);
  pinMode(btnPin_9, INPUT);
  pinMode(btnPin_10, INPUT);

  // init led
  strip.begin();
  strip.show();  
}

/*
   loop
*/
void loop() {
  // modules control
  ModuleSet_1.moveTablet();
  ModuleSet_2.moveTablet();
  ModuleSet_3.moveTablet();
  ModuleSet_4.moveTablet();
  ModuleSet_5.moveTablet();
  ModuleSet_6.moveTablet();
  ModuleSet_7.moveTablet();
  ModuleSet_8.moveTablet();
  ModuleSet_9.moveTablet();
  ModuleSet_10.moveTablet();

  // serial port control
  Serial.println(currentStage);

  if (Serial.available() > 0) {
    incomingByte = Serial.read();
    if (incomingByte == 'H') {
      isPlayingSounds = true;
    } else {
      isPlayingSounds = false;
    }
  }
}


/*
** led lights function
*/
void led_default() {
  led_allWhite();
}

void led_allWhite() {
  for (unsigned int n = 0; n < strip.numPixels(); n++) {
    strip.setPixelColor(n, 255, 255, 255);  
  }
  strip.show();  
}

void led_moduleControl(int btnPin, int rgb [3]) {
  int fmtBtnPin = (btnPin % 10) - 1;
  if (fmtBtnPin < 0) fmtBtnPin = 10;
  int startPosition = fmtBtnPin * (nLEDs / 10);
  const int endPosition = startPosition + (nLEDs / 10);

  for (unsigned int y = startPosition; y < endPosition; y++) {
    strip.setPixelColor(y, rgb[0], rgb[1], rgb[2]);  
  }
  
  strip.show();    
}
