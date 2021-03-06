// Gets serial port data (e.g. from Arduino) 

import processing.serial.*;
import controlP5.*;
import java.util.*;
import oscP5.*;
import netP5.*;

//Objects for display:
ControlP5 cp5;
PFont fBig;
CColor defaultColor;

//Serial port info:
int end = 10;    // the number 10 is ASCII for linefeed (end of serial.println), later we will look for this to break up individual messages
String serial;   // declare a new string called 'serial' . A string is a sequence of characters (data type know as "char")
int numPorts = 0;
Serial myPort;  // The serial port
boolean gettingData = false; //True if we've selected a port to read from

//Objects for sending OSC
OscP5 oscP5;
NetAddress dest;

int numFeatures = 0;
String featureString = "";

//String giaHost = "gaia";
String giaHost = "giahost";
int giaPort = 6448;

void setup() {
  size(300, 250);
  frameRate(100);

  //Set up display
  cp5 = new ControlP5(this);
  textAlign(LEFT, CENTER);
  fBig = createFont("Arial", 12);

  //Populate serial port options:
  List l = Arrays.asList(Serial.list());
  numPorts = l.size();
  cp5.addScrollableList("Port") //Create drop-down menu
     .setPosition(10, 60)
     .setSize(200, 100)
     .setBarHeight(20)
     .setItemHeight(20)
     .addItems(l)
     ;
  defaultColor = cp5.getColor();
     
     
}

//Called when new port (n-th) selected in drop-down
void Port(int n) {
 // println(n, cp5.get(ScrollableList.class, "Port").getItem(n));
  CColor c = new CColor();
  c.setBackground(color(255,0,0));
  
  //Color all non-selected ports the default color in drop-down list
  for (int i = 0; i < numPorts; i++) {
      cp5.get(ScrollableList.class, "Port").getItem(i).put("color", defaultColor);
  }
  
  //Color the selected item red in drop-down list
  cp5.get(ScrollableList.class, "Port").getItem(n).put("color", c);
  
  //If we were previously receiving on a port, stop receiving
  if (gettingData) {
    myPort.stop();
  }
  
  //Finally, select new port:
  myPort = new Serial(this, Serial.list()[n], 9600); //Using 9600 baud rate
  myPort.clear(); //Throw out first reading, in case we're mid-feature vector
  gettingData = true;
  serial = null; //Initialise serial string
  numFeatures = 0;
}

//Called in a loop at frame rate (100 Hz)
void draw() {
  background(240);
  textFont(fBig);
  fill(0);
  text("Serial to OSC by Rebecca Fiebrink. \nCode Extended by Guillaume D.Isabelle, 2020", 10, 10);
  text("Select serial port:", 10, 40);
  text("Sending " + numFeatures + " values to port 6449, message /wek/inputs", 10, 180); 
  text("Feature values:", 10, 200);
  text(featureString, 25, 220);

  if (gettingData) {
    getData();
  }
}

//Parses serial data to get button & accel values, also buffers accels if we're in button-segmented mode
void getData() {
  while (myPort.available() > 0 ) { 
    serial = myPort.readStringUntil(end);
  }
  if (serial != null) {  //if the string is not empty, print the following
    
    /*  Note: the split function used below is not necessary if sending only a single variable. However, it is useful for parsing (separating) messages when
        reading from multiple inputs in Arduino. Below is example code for an Arduino sketch
    */
    
    text("Seria Data: " + serial, 20,120);     
     
  }
}
