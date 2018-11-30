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

//  Serial.println(toIncrease);
  
  if (readyToIncrease) insertedTabletsNum += 1;
  if (readyToDecrease) insertedTabletsNum -= 1;
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
            Serial.println("SLEEPING");
            Serial.println(insertedTabletsNum);
          // do the actions...
            break;
          case 1:
            currentStage = "regular_1";
            Serial.println("REGULAR 1");
            Serial.println(insertedTabletsNum);
          // do the actions...
            break;          
          case 4:
            currentStage = "regular_2";
            Serial.println("REGULAR 2");
            Serial.println(insertedTabletsNum);            
          // do the actions...
            break;          
          case 6:
            currentStage = "regular_3";
            Serial.println("REGULAR 3");
            Serial.println(insertedTabletsNum);                        
          // do the actions...
            break;          
          /* ejection acceptable, module btn unlocked */
          case 2: // temp testing number
            currentStage = "activating_final";
            Serial.println("REGULAR 9");            
            // do the actions...
            break;            
        }

//        Serial.println(insertedTabletsNum);            
        
      } else {                        
        
//        Serial.println("in activating final stage");   
        
        // enter condition switching        
        switch (insertedTabletsNum) {
          case 1: // temp testing number
            currentStage = "deactivated_regular";
            // do the actions...
            Serial.println("end");              
            isRunning = false;
            break;            
          case 3: // temp testing number
            // do the actions...
            Serial.println("enter advanced");              
            isActivatingStage = false;
            break;            
        }
      }
      
    } else {
        if (currentStage != "deactivating_final") {
          switch (insertedTabletsNum) {
            case 10:
              currentStage = "advanced_1";
            // do the actions...
              break;            
            case 9:
              currentStage = "advanced_2";
            // do the actions...
              break;            
            case 6:
              currentStage = "advanced_3";
            // do the actions...
              break;                        
            case 4:
              currentStage = "advanced_4";
            // do the actions...
              break;                        
            case 2:
              currentStage = "advanced_5";
            // do the actions...
              break;                        
            case 1:
              currentStage = "deactivating_final";
              // do the actions...
              break;                          
          }
        } else {
          switch (insertedTabletsNum) {
            case 1:
              currentStage = "ending_advanced";
              // do the actions...
              isRunning = false;
              break;                          
            case 0:
              currentStage = "deactivated_advanced";
              // do the actions...
              isRunning = false;
              break;                          
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

ModuleSet::ModuleSet(Servo servo, int btnPin) {
  _servo = servo;
  _btnPin = btnPin;
};

void ModuleSet::updateBtnState() {
  _btnRead = digitalRead(_btnPin);
  boolean debouncePassed = (_btnRead == HIGH && _btnWasOn == LOW && millis() - _time > tabletMovingDuration);
  boolean readyToToggle = (debouncePassed && !btnIsLocked);

  // btn is not locked, switch btn state
  if (readyToToggle) {
  
    // toggle btn state
    if (btnIsOn == HIGH) btnIsOn = LOW;
    else btnIsOn = HIGH;

    // update inserted tablets number
    if (isActivatingStage) {
      if (currentStage != "activating_final") {
        update_insertedTabletsNum(true);       
      } else {
        // @TODO: try to figure out user is ejecting or inserting tablet
        
        // unlock modules 
        btnIsLocked = false;

        // update inserted tablets number
        boolean enterLastTablet = !_btnWasOn && btnIsOn
        if (enterLastTablet) insertedTabletsNum = modulesNum;
        else insertedTabletsNum -= 1;
      }
    }
      
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

//    Serial.println(_btnPin);
//    Serial.println(btnIsLocked);
  }
  
  _btnWasOn = _btnRead;
};

void ModuleSet::moveTablet() {
  updateBtnState();
  update_stage();  
//  Serial.println(btnIsLocked);
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
}
