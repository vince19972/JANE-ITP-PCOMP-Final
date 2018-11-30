#include <Servo.h>
#include <SoftwareSerial.h>

/*
    global store
*/

/* vars */
const int modulesNum = 3;
const int tabletMovingDuration = 3000; // millis
int insertedTabletsNum = 0;
boolean isRunning = true; // true if user is here
boolean isActivatingStage = true;
String currentStage = "sleeping";

/* update functions */
void update_insertedTabletsNum(boolean toIncrease) {
  boolean tabletsAllIn = (insertedTabletsNum == modulesNum);
  boolean tabletsAllOut = (insertedTabletsNum == 0);
  boolean readyToIncrease = (toIncrease && insertedTabletsNum < modulesNum && !tabletsAllIn);
  boolean readyToDecrease = (!toIncrease && insertedTabletsNum > 0 && !tabletsAllOut);

  if (readyToIncrease) insertedTabletsNum -= 1;
  if (readyToDecrease) insertedTabletsNum += 1;
};

/* state machine */
void update_stage() {
  if (isRunning) {
    isActivatingStage = true;

    if (isActivatingStage) { 
      if (currentStage != "activating_final") {
        // enter condition switching
        switch (insertedTabletsNum) {
          /* ejection denied, module btn locked after inserted */
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
          /* ejection acceptable, module btn unlocked */
          case 9:
            currentStage = "activating_final";
            // do the actions...
        }
      } else {      
        // enter condition switching        
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
//    ModuleSet(Servo servo, int btnPin);
    void init(int btnPin, int servoPin);
    void updateBtnState();
    void moveTablet();

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
};

//ModuleSet::ModuleSet(Servo servo, int btnPin) {
//  _servo = servo;
//  _btnPin = btnPin;
//};

void ModuleSet::init(int btnPin, int servoPin) {
  _servoPin = servoPin;
  _btnPin = btnPin;

  _servo.attach(_servoPin);
  pinMode(_btnPin, INPUT);  
}

void ModuleSet::updateBtnState() {
  _btnRead = digitalRead(_btnPin);
  boolean debouncePassed = (_btnRead == HIGH && _btnWasOn == LOW && millis() - _time > tabletMovingDuration);
  boolean readyToToggle = (debouncePassed && !btnIsLocked);

//  Serial.println(_btnRead);

  // btn is not locked, switch btn state
  if (readyToToggle) {
  
    // toggle btn state
    if (btnIsOn == HIGH)
      btnIsOn = LOW;
    else
      btnIsOn = HIGH;
      
    // update debounce time value
    _time = millis();
  }

  // btn is not locked, move servo
  if (!btnIsLocked) {
    if (btnIsOn)
      _servo.write(180);
    else
      _servo.write(0);          
  }  

  // btn is locked, but check if it should be unlocked or not
  if (debouncePassed) {
    if (isActivatingStage) {
      if (currentStage != "activating_final")
        btnIsLocked = true;
      else
        btnIsLocked = false;
    } else {
      btnIsLocked = true;
    }          
  }
  
  _btnWasOn = _btnRead;
};

void ModuleSet::moveTablet() {
  updateBtnState();
//  Serial.println(btnIsLocked);

  //   update_insertedTabletsNum();
}

/*
   init settings
*/

/* servos */
const int servoStartNum = 21;

//Servo servo_1;
//const int servo_1_pin = servoStartNum + 0;      
//Servo servo_2;
//const int servo_2_pin = servoStartNum + 1;
//Servo servo_3;
//const int servo_3_pin = servoStartNum + 2;

/* btns */
const int btnStartNum = 31;

//const int btnPin_1 = btnStartNum + 0;
//int btnRead_1 = 0;
//ModuleSet ModuleSet_1(servo_1, btnPin_1);
//
//const int btnPin_2 = btnStartNum + 1;
//int btnRead_2 = 0;
//ModuleSet ModuleSet_2(servo_2, btnPin_2);
//
//const int btnPin_3 = btnStartNum + 2;
//int btnRead_3 = 0;
//ModuleSet ModuleSet_3(servo_3, btnPin_3);

ModuleSet *moduleSets[modulesNum];

/* others */
int pos = 0;


/*
   setup
*/
void setup() {
  Serial.begin(9600);

  for (int i = 0; i < modulesNum; ++i) {
    int btnPin = btnStartNum + i;
    int servoPin = servoStartNum + i;

    moduleSets[i] -> init(btnPin, servoPin);
  }  

  Serial.println(moduleSets[0] -> _servoPin);
  Serial.println(moduleSets[1] -> _servoPin);  
  Serial.println(moduleSets[2] -> _servoPin);    

//  Serial.print(moduleSets);

  // init servos
//  servo_1.attach(servo_1_pin);
//  servo_2.attach(servo_2_pin);
//  servo_3.attach(servo_3_pin);

  // init btns
//  pinMode(btnPin_1, INPUT);
//  pinMode(btnPin_2, INPUT);
//  pinMode(btnPin_3, INPUT);
}

/*
   loop
*/
void loop() {
//  for (int i = 0; i < modulesNum; ++i) {    
//    moduleSets[i] -> moveTablet();
//    Serial.println(&moduleSets[i].btnIsOn);
//  }    

//  ModuleSet_1.moveTablet();
//  ModuleSet_2.moveTablet();
//  ModuleSet_3.moveTablet();
  //  ModuleSet_1.updateBtnState();
  //  ModuleSet_2.updateBtnState();
  //  ModuleSet_3.updateBtnState();

}
