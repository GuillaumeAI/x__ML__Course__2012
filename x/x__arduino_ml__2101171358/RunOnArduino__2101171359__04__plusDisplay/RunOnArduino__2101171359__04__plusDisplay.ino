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


/* Define shift register pins used for seven segment display */
#define LATCH_DIO 4
#define CLK_DIO 7
#define DATA_DIO 8
 
#define Pot1 0
 
/* Segment byte maps for numbers 0 to 9 */
const byte SEGMENT_MAP[] = {0xC0,0xF9,0xA4,0xB0,0x99,0x92,0x82,0xF8,0X80,0X90};
/* Byte maps to select digit 1 to 4 */
const byte SEGMENT_SELECT[] = {0xF1,0xF2,0xF4,0xF8};
 
 
 
 
 

void setup() {
  Serial.begin(9600); //Begin Serial Communication with a baud rate of 9600

  pinMode(trigPin, OUTPUT); // Sets the trigPin as an OUTPUT
  pinMode(echoPin, INPUT); // Sets the echoPin as an INPUT

//display

pinMode(LATCH_DIO,OUTPUT);
pinMode(CLK_DIO,OUTPUT);
pinMode(DATA_DIO,OUTPUT);

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
  /* Update the display with the current counter value */
  int v1 = Value1==0;
  int v2 = Value2==0;
  int v3 = Value3==0;
  if (v2 == 0 || v3 == 0)
  {
    
    WriteNumberToSegment(0 , v1);
    WriteNumberToSegment(1 , v2 );
    WriteNumberToSegment(2 , v3);
  }
  else {
    
    WriteNumberToSegment(0 , 0);
    WriteNumberToSegment(1 , 0);
    WriteNumberToSegment(2 , 0);
    WriteNumberToSegment(3 , 0);
}
}




//display
/* Write a decimal number between 0 and 9 to one of the 4 digits of the display */
void WriteNumberToSegment(byte Segment, byte Value)
{
digitalWrite(LATCH_DIO,LOW);
shiftOut(DATA_DIO, CLK_DIO, MSBFIRST, SEGMENT_MAP[Value]);
shiftOut(DATA_DIO, CLK_DIO, MSBFIRST, SEGMENT_SELECT[Segment] );
digitalWrite(LATCH_DIO,HIGH);
}
