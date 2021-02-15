// Code originally from http://www.instructables.com/id/Arduino-to-Processing-Serial-Communication-withou/
// by https://www.instructables.com/member/thelostspore/
// Code was shared under public domain https://creativecommons.org/licenses/publicdomain/

// This code reads analog inputs from pins A0 and A1 and sends these values out via serial
// You can add or remove pins to read from, but be sure they are separated by commas, and print a
// newline character at the end of each loop()

int AnalogPin0 = A0; //Declare an integer variable, hooked up to analog pin 0
int AnalogPin1 = A1; //Declare an integer variable, hooked up to analog pin 1
int AnalogPin2 = A2; //Declare an integer variable, hooked up to analog pin 1

//Measurements // defines variables
int echoPin = 5; // attach pin D2 Arduino to pin Echo of HC-SR04
int trigPin = 6; //attach pin D3 Arduino to pin Trig of HC-SR04

long duration; // variable for the duration of sound wave travel
int distance; // variable for the distance measurement


// -------------------------------------
// ---  These might be part of an interface as they might be parametrizable
int cycleDelay = 44;
int maxDist = 40; // max range of expressiveness
int minDist = 4;// Min range of expressiveness
int curWeight = 3; //The weight of the current value in the equalization
// -------------------------------------



//maxRange
  int maxDistFlag = maxDist;  // max range of expressiveness value we send through the output
//minRange
  int minDistFlag = 0; // Min range of expressiveness we send as output

  

int p = -1;
int Value1 = 0;
int Value2 = 0;
int Value3 = 0;

//store previous value

int pValue1 = 0; 
int pValue2 = 0;
int pValue3 = 0;
int pDistance = 0;


void setup() {
  Serial.begin(9600); //Begin Serial Communication with a baud rate of 9600

  pinMode(trigPin, OUTPUT); // Sets the trigPin as an OUTPUT
  pinMode(echoPin, INPUT); // Sets the echoPin as an INPUT


}


void loop() {
   //New variables are declared to store the readings of the respective pins
  Value1 = analogRead(AnalogPin0);
  Value2 = analogRead(AnalogPin1);
  Value3 = analogRead(AnalogPin2);
  
  
  //Integrate measurements ------------
  // Clears the trigPin condition
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  // Sets the trigPin HIGH (ACTIVE) for 10 microseconds
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  // Reads the echoPin, returns the sound wave travel time in microseconds
  duration = pulseIn(echoPin, HIGH);
  // Calculating the distance
  distance = duration * 0.034 / 2; // Speed of sound wave divided by 2 (go and back)
  
  p = (distance + p) / 2;
  

//Max-Min Range setup
  if (distance > maxDist ) distance= maxDistFlag; 
  if (distance < minDist ) distance= minDistFlag;
  
  /*The Serial.print() function does not execute a "return" or a space
      Also, the "," character is essential for parsing the values,
      The comma is not necessary after the last variable.*/
equalizeValues();
  
  Serial.print(Value1, DEC); 
  Serial.print(",");
  Serial.print(Value2, DEC); 
  Serial.print(",");
  Serial.print(Value3, DEC); 
  Serial.print(",");
  Serial.print(distance, DEC); 
  Serial.println();
  delay(cycleDelay); // For illustration purposes only. This will slow down your program if not removed 
//Keep track of previous value so we can equalize them with current (smooting the curve a bit)

  pValue1= Value1;
  pValue2 = Value2;
  pValue3 = Value3;
  pDistance = distance;
  
}

void equalizeValues() {
  //int cur = Value1;
  //int pCur = pValue1;
  //Value1 = (((cur + pCur) / 2) + cur )/ 2 );
 // Value1 = eqOne(Value1,pValue1);
 // Value2 = eqOne(Value2,pValue2);
 // Value3 = eqOne(Value3,pValue3);
  distance = eqOne(distance,pDistance);
}


int eqOne(int cur,int pCur)
{
  
//  int pCurA = pCurA = (cur + pCurA ) / 2;
//  
//  //we want cur value to go in the direction it will be smootly
//  if (pCur > cur ) cur = cur - pCurA;
//  else cur = pCur - pCurA;
//  
//  int r = ((cur * curWeight-1 ) + pCur ) / curWeight;
    int maxStep = 5;
    if (cur - pCur > maxStep) return pCur + maxStep;
    if (cur - pCur < maxStep * -1) return pCur - maxStep;
    
    int r = (cur + pCur ) / 2;           
  return r;
}
