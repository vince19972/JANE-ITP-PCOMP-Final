/*
** libraries and init settings
*/

// I2C
#include <Wire.h>
int busData = 0;

// neo pixels
#include <Adafruit_NeoPixel.h>   // including the Adafruit library
#ifdef __AVR__
  #include <avr/power.h>
#endif
#define PIN 13
#define N_LEDS 60    

/*
** variables and stores
*/

// neo pixels
Adafruit_NeoPixel strip = Adafruit_NeoPixel(N_LEDS, PIN);
int G = 0;
int s = 1;
unsigned long buttonPressedTime;

void setup() {
  /* I2C */
  Wire.begin(9); 
  Wire.onReceive(receiveEvent);

  /* serial */
  Serial.begin(9600);
    
  /* neo pixels */
  // init 
  strip.begin();
  strip.show();

  // record time when button pressed
  buttonPressedTime = millis(); 

  pinMode(PIN, OUTPUT);
}

void receiveEvent(int bytes) {
  busData = Wire.read();
  Serial.println(busData);
}

void loop() {  
  Serial.println(busData);  
  if (busData % 2 == '0') {
    digitalWrite(PIN, HIGH);
  }
}
