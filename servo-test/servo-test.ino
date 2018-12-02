#include <Servo.h>
#include <SoftwareSerial.h>

/*
    global store
*/

/* vars */
const int modulesNum = 10;
const int regularFinal_end = modulesNum - 2;
const int regularFinal_enter = modulesNum;
const int advancedFinal_end = 0;

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
          case 2:
            currentStage = "regular_2";
            Serial.println("REGULAR 2");
            Serial.println(insertedTabletsNum);
            // do the actions...
            break;   
          case 3:
            currentStage = "regular_3";
            Serial.println("REGULAR 3");
            Serial.println(insertedTabletsNum);
            // do the actions...
            break;                                  
          case 4:
            currentStage = "regular_4";
            Serial.println("REGULAR 4");
            Serial.println(insertedTabletsNum);            
            // do the actions...
            break;    
          case 5:
            currentStage = "regular_5";
            Serial.println("REGULAR 5");
            Serial.println(insertedTabletsNum);
            // do the actions...
            break;                     
          case 6:
            currentStage = "regular_6";
            Serial.println("REGULAR 6");
            Serial.println(insertedTabletsNum);                        
            // do the actions...
            break;       
          case 7:
            currentStage = "regular_7";
            Serial.println("REGULAR 7");
            Serial.println(insertedTabletsNum);
            // do the actions...
            break;  
          case 8:
            currentStage = "regular_8";
            Serial.println("REGULAR 8");
            Serial.println(insertedTabletsNum);
            // do the actions...
            break;   
          /* ejection acceptable, module btn unlocked (9 tablets) */
          case modulesNum - 1: 
            currentStage = "activating_final";
            Serial.println("ACTIVATION FINAL");            
            // do the actions...
            break;            
        }
        
      } else {                        
        
        // enter condition switching        
        switch (insertedTabletsNum) {
          case regularFinal_end:
            currentStage = "deactivated_regular";
            // do the actions...
            Serial.println("end");              
            isRunning = false;
            break;            
          case regularFinal_enter:
            // do the actions...
            Serial.println("enter advanced");                     
            isActivatingStage = false;
            break;            
        }
      }
      
    } else {
//      if (currentStage != "deactivating_final") {
        switch (insertedTabletsNum) {
          case modulesNum:
            currentStage = "advanced_0";
            // do the actions...
            Serial.println("Advanced 0");
            Serial.println(insertedTabletsNum);               
            break;            
          case 9:
            currentStage = "advanced_1";
            Serial.println("Advanced 1");
            Serial.println(insertedTabletsNum);                           
            // do the actions...
            break;     
          case 8:
            currentStage = "advanced_2";
            Serial.println("Advanced 2");
            Serial.println(insertedTabletsNum);                           
            // do the actions...
            break; 
          case 7:
            currentStage = "advanced_3";
            Serial.println("Advanced 3");
            Serial.println(insertedTabletsNum);                           
            // do the actions...
            break;                                    
          case 6:
            currentStage = "advanced_4";
            Serial.println("Advanced 4");
            Serial.println(insertedTabletsNum);                           
            // do the actions...
            break;       
          case 5:
            currentStage = "advanced_5";
            Serial.println("Advanced 5");
            Serial.println(insertedTabletsNum);                           
            // do the actions...
            break;                              
          case 4:
            currentStage = "advanced_6";
            Serial.println("Advanced 6");
            Serial.println(insertedTabletsNum);                                       
            // do the actions...
            break;     
          case 3:
            currentStage = "advanced_7";
            Serial.println("Advanced 7");
            Serial.println(insertedTabletsNum);                           
            // do the actions...
            break;                                
          case 2:
            currentStage = "advanced_8";
            Serial.println("Advanced 8");
            Serial.println(insertedTabletsNum);                                       
            // do the actions...
            break;                        
          case 1:
            currentStage = "deactivating_final";
            Serial.println("Advanced final");
            Serial.println(insertedTabletsNum);                           
            // do the actions...
            break;    
          case 0:
            currentStage = "deactivated_advanced";
            Serial.println("Deactivated");
            Serial.println(insertedTabletsNum);               
            // do the actions...
//            isRunning = false;
            break;                                    
        }
//      } 
//      else 
//      {
//        switch (insertedTabletsNum) {
//          case 1:
//            currentStage = "ending_advanced";
//            // do the actions...
//            isRunning = false;
//            break;                          
//          case 0:
//            currentStage = "deactivated_advanced";
//            // do the actions...
//            isRunning = false;
//            break;                          
//        }
//      }
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

//  Serial.println(_btnRead);

  // btn is not locked, switch btn state
  if (readyToToggle) {

    Serial.println("ready to toggle");
    _servo.write(180);
  
    // toggle btn state
    if (btnIsOn == HIGH) btnIsOn = LOW;
    else btnIsOn = HIGH;

    // update inserted tablets number
    if (isActivatingStage) {
      if (currentStage != "activating_final") {
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
      update_insertedTabletsNum(false);       
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
      btnIsLocked = false;
    }          
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
const int btnStartNum = 41;

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
  servo_2.attach(servo_2_pin);
  servo_3.attach(servo_3_pin);
  servo_4.attach(servo_4_pin);
  servo_5.attach(servo_5_pin);
  servo_6.attach(servo_6_pin);
  servo_7.attach(servo_7_pin);        
  servo_8.attach(servo_8_pin);        
  servo_9.attach(servo_9_pin);        
  servo_10.attach(servo_10_pin);              

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
}

/*
   loop
*/
void loop() {
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
}
