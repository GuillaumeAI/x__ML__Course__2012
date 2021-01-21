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


void setup() {
  Serial.begin(9600); //Begin Serial Communication with a baud rate of 9600

  pinMode(trigPin, OUTPUT); // Sets the trigPin as an OUTPUT
  pinMode(echoPin, INPUT); // Sets the echoPin as an INPUT


}

  int p = -1;
  
void loop() {
   //New variables are declared to store the readings of the respective pins
  int Value1 = analogRead(AnalogPin0);
  int Value2 = analogRead(AnalogPin1);
  int Value3 = analogRead(AnalogPin2);
  
  
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
  // Displays the distance on the Serial Monitor
  
  if (distance > 110 ) distance= -1;
  
  p = (distance + p) / 2;
  
  /*The Serial.print() function does not execute a "return" or a space
      Also, the "," character is essential for parsing the values,
      The comma is not necessary after the last variable.*/
  
  Serial.print(Value1, DEC); 
  Serial.print(",");
  Serial.print(Value2, DEC); 
  Serial.print(",");
  Serial.print(Value3, DEC); 
  Serial.print(",");
  Serial.print(distance, DEC); 
  Serial.println();
  //delay(1); // For illustration purposes only. This will slow down your program if not removed 
}
