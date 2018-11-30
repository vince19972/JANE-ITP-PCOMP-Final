#include <Servo.h>
#include <SoftwareSerial.h>

/*
    global store
*/
const int modulesNum = 3;
int insertedTabletsNum = 0;
boolean isRunning = true; // true if user is here
boolean isActivatingStage = true;
String currentStage = "sleeping";

void update_insertedTabletsNum(boolean toIncrease) {
  boolean tabletsAllIn = (insertedTabletsNum == modulesNum);
  boolean tabletsAllOut = (insertedTabletsNum == 0);
  boolean readyToIncrease = (toIncrease && insertedTabletsNum < modulesNum && !tabletsAllIn);
  boolean readyToDecrease = (!toIncrease && insertedTabletsNum > 0 && !tabletsAllOut);

  if (readyToIncrease) insertedTabletsNum -= 1;
  if (readyToDecrease) insertedTabletsNum += 1;
};

String update_stage() {
  if (isRunning) {
    isActivatingStage = true;

    if (isActivatingStage) {
      if (currentStage != "activating_final") {
        switch (insertedTabletsNum) {
          case 0:
            currentStage = "sleeping";
          // do the actions...
          case 1:
            currentStage = "regular_1";
          // do the actions...
          case 4:
            currentStage = "regular_2";
          // do the actions...
          case 6:
            currentStage = "regular_3";
          // do the actions...
          case 9:
            currentStage = "activating_final";
            // do the actions...
        }
      } else {
        switch (insertedTabletsNum) {
          case 8:
            currentStage = "deactivated_regular";
            // do the actions...
            isRunning = false;
          case 10:
            // do the actions...
            isActivatingStage = false;
        }
      }
    } else {
      if (currentStage != "deactivating_final") {
        switch (insertedTabletsNum) {
          case 10:
            currentStage = "advanced_1";
          // do the actions...
          case 9:
            currentStage = "advanced_2";
          // do the actions...
          case 6:
            currentStage = "advanced_3";
          // do the actions...
          case 4:
            currentStage = "advanced_4";
          // do the actions...
          case 2:
            currentStage = "advanced_5";
          // do the actions...
          case 1:
            currentStage = "deactivating_final";
            // do the actions...
        }
      } else {
        switch (insertedTabletsNum) {
          case 1:
            currentStage = "ending_advanced";
            // do the actions...
            isRunning = false;
          case 0:
            currentStage = "deactivated_advanced";
            // do the actions...
            isRunning = false;
        }
      }
    }
  } else {
    currentStage = "sleeping";
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
    boolean btnIsOn = false;
    boolean tableIsOut = false;
  private:
    // base vars
    Servo _servo;
    int _ModuleSetIndex;
    int _btnPin;
    int _btnRead = 0;

    // btn toggle vars
    int _btnWasOn = !btnIsOn;
    unsigned long _time = 0;
    unsigned long _debounce = 200UL;
};

ModuleSet::ModuleSet(Servo servo, int btnPin) {
  _servo = servo;
  _btnPin = btnPin;
};

void ModuleSet::updateBtnState() {
  _btnRead = digitalRead(_btnPin);
  boolean readyToToggle = (_btnRead == HIGH && _btnWasOn == LOW && millis() - _time > _debounce);

  // debounce and switch btn state
  if (readyToToggle) {
    if (btnIsOn == HIGH)
      btnIsOn = LOW;
    else
      btnIsOn = HIGH;

    _time = millis();
  }

  _btnWasOn = _btnRead;
};

void ModuleSet::moveTablet() {
  updateBtnState();
  Serial.println(insertedTabletsNum);

  if (btnIsOn)
    _servo.write(180);
  else
    _servo.write(0);

  //   update_insertedTabletsNum();
}

/*
   init settings
*/

/* servos */
const int servoStartNum = 21;

Servo servo_1;
const int servo_1_pin = servoStartNum + 0;
Servo servo_2;
const int servo_2_pin = servoStartNum + 1;
Servo servo_3;
const int servo_3_pin = servoStartNum + 2;

/* btns */
const int btnStartNum = 31;

const int btnPin_1 = btnStartNum + 0;
int btnRead_1 = 0;
ModuleSet ModuleSet_1(servo_1, btnPin_1);

const int btnPin_2 = btnStartNum + 1;
int btnRead_2 = 0;
ModuleSet ModuleSet_2(servo_2, btnPin_2);

const int btnPin_3 = btnStartNum + 2;
int btnRead_3 = 0;
ModuleSet ModuleSet_3(servo_3, btnPin_3);

/* others */
int pos = 0;


/*
   setup
*/
void setup() {
  Serial.begin(9600);

  // init servos
  servo_1.attach(servo_1_pin);
  servo_2.attach(servo_2_pin);
  servo_3.attach(servo_3_pin);

  // init btns
  pinMode(btnPin_1, INPUT);
  pinMode(btnPin_2, INPUT);
  pinMode(btnPin_3, INPUT);
}

/*
   loop
*/
void loop() {

  ModuleSet_1.moveTablet();
  ModuleSet_2.moveTablet();
  ModuleSet_3.moveTablet();
  //  ModuleSet_1.updateBtnState();
  //  ModuleSet_2.updateBtnState();
  //  ModuleSet_3.updateBtnState();

}
