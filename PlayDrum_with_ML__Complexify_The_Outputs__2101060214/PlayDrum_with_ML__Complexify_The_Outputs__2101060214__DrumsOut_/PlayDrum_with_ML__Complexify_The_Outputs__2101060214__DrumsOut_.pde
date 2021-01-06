import processing.opengl.*;

/**
  * Altered by : Guillaume Descoteaux-Isabelle, 2020
  * Added one Output
  *
  * ORIGINAL + Update
  * 
  * This is a modification of an example from Minim package
  * Modified by Rebecca Fiebrink to work with Wekinator
  * This version takes 4 continuous outputs from Wekinator, each expected in range 0-1
  * Listens on port 12000
  * Original header:
  * This sketch is a more involved use of AudioSamples to create a simple drum machine. 
  * Click on the buttons to toggle them on and off. The buttons that are on will trigger 
  * samples when the beat marker passes over their column. You can change the tempo by 
  * clicking in the BPM box and dragging the mouse up and down.
  * <p>
  * We achieve the timing by using AudioOutput's playNote method and a cleverly written Instrument.
  * <p>
  * For more information about Minim and additional features, 
  * visit http://code.compartmental.net/minim/
  *
  */


import ddf.minim.*;
import ddf.minim.ugens.*;

//Necessary for OSC communication with Wekinator:
import oscP5.*;
import netP5.*;
OscP5 oscP5;
NetAddress dest;

Minim       minim;
AudioOutput out;

Sampler     kick;
Sampler     snare;
Sampler     hat;
Sampler     py;

boolean[] hatRow = new boolean[16];
boolean[] snrRow = new boolean[16];
boolean[] kikRow = new boolean[16];
boolean[] pyRow = new boolean[16];

ArrayList<Rect> buttons = new ArrayList<Rect>();

int bpm = 120;

int beat; // which beat we're on

// here's an Instrument implementation that we use 
// to trigger Samplers every sixteenth note. 
// Notice how we get away with using only one instance
// of this class to have endless beat making by 
// having the class schedule itself to be played
// at the end of its noteOff method. 
class Tick implements Instrument
{
  void noteOn( float dur )
  {
    if ( hatRow[beat] ) hat.trigger();
    if ( snrRow[beat] ) snare.trigger();
    if ( kikRow[beat] ) kick.trigger();
    if ( pyRow[beat] ) py.trigger();
  }
  
  void noteOff()
  {
    // next beat
    beat = (beat+1)%16;
    // set the new tempo
    out.setTempo( bpm );
    // play this again right now, with a sixteenth note duration
    out.playNote( 0, 0.25f, this );
  }
}

// simple class for drawing the gui
class Rect 
{
  int x, y, w, h;
  boolean[] steps;
  int stepId;
  
  public Rect(int _x, int _y, boolean[] _steps, int _id)
  {
    x = _x;
    y = _y;
    w = 14;
    h = 30;
    steps = _steps;
    stepId = _id;
  }
  
  public void draw()
  {
    if ( steps[stepId] )
    {
      fill(0,255,0);
    }
    else
    {
      fill(255,0,0);
    }
    
    rect(x,y,w,h);
  }
  
  public void mousePressed()
  {
    /*if ( mouseX >= x && mouseX <= x+w && mouseY >= y && mouseY <= y+h )
    {
      steps[stepId] = !steps[stepId];
    } */
  }
  
 /* public void turnOn() {
    steps[stepId] = true;
  }
  
  public void turnOff() {
    steps[stepId] = false;
  } */
}

void setup()
{
  size(395, 250);
  
    //Initialize OSC communication
  oscP5 = new OscP5(this,12000); //listen for OSC messages on port 12000 (Wekinator default)
  dest = new NetAddress("127.0.0.1",6448); //send messages back to Wekinator on port 6448, localhost (this machine) (default)
  
  minim = new Minim(this);
  out   = minim.getLineOut();
  
  // load all of our samples, using 4 voices for each.
  // this will help ensure we have enough voices to handle even
  // very fast tempos.
  kick  = new Sampler( "BD.wav", 4, minim );
  snare = new Sampler( "SD.wav", 4, minim );
  hat   = new Sampler( "CHH.wav", 4, minim );
  py   = new Sampler( "PY.wav", 4, minim );
  
  // patch samplers to the output
  kick.patch( out );
  snare.patch( out );
  hat.patch( out );
  py.patch( out );
  
  for (int i = 0; i < 16; i++)
  {
    buttons.add( new Rect(10+i*24, 50, hatRow, i ) );
    buttons.add( new Rect(10+i*24, 100, snrRow, i ) );
    buttons.add( new Rect(10+i*24, 150, kikRow, i ) );
    buttons.add( new Rect(10+i*24, 200, pyRow, i ) );
  }
  
  beat = 0;
  
  // start the sequencer
  out.setTempo( bpm );
  out.playNote( 0, 0.25f, new Tick() );
}

void draw()
{
  background(0);
  fill(255);
  //text(frameRate, width - 60, 20);
  
  for(int i = 0; i < buttons.size(); ++i)
  {
    buttons.get(i).draw();
  }
  
  stroke(128);
  if ( beat % 4 == 0 )
  {
    fill(200, 0, 0);
  }
  else
  {
    fill(0, 200, 0);
  }
    
  // beat marker    
  rect(10+beat*24, 35, 14, 9);
  
  fill(0, 255, 0);
  text( "Use 4 continuous Wekinator outputs between 0 and 1", 5, 15 );
  text( "Listening for /wek/outputs on port 12000", 5, 30 );
  text("Use sliders in Wekinator to control density of each track", 5, 45 );
}

void mousePressed()
{
  for(int i = 0; i < buttons.size(); ++i)
  {
    buttons.get(i).mousePressed();
  }
}

//This is called automatically when OSC message is received
void oscEvent(OscMessage theOscMessage) {
 if (theOscMessage.checkAddrPattern("/wek/outputs")==true) {
     if(theOscMessage.checkTypetag("ffff")) { //Now looking for 2 parameters
        float p1 = theOscMessage.get(0).floatValue(); //get this parameter
        float p2 = theOscMessage.get(1).floatValue(); //get 2nd parameter
        float p3 = theOscMessage.get(2).floatValue(); //get third parameters
        float p4 = theOscMessage.get(3).floatValue(); //get 4 parameters
        
        updateDrums(p1, p2, p3,p4);
        
        print("Received new params value from Wekinator: ");  
        println(theOscMessage);  
      } else {
        println("Error: unexpected params type tag received by Processing");
      }
 }
}

void updateDrums(float p1, float p2, float p3,float p4) {
  hatRow[0] = p1 > 0.01;
  hatRow[1] = p1 > 0.3;
  hatRow[2] = p1 > 0.1;
  hatRow[3] = false;
  hatRow[4] = p1 > 0.8;
  hatRow[5] = false;
  hatRow[6] = p1 > 0.5;
  hatRow[7] = p1 > 0.6;
  hatRow[8] = false;
  hatRow[9] = p1 > 0.4;
  hatRow[10] = p1 > 0.9;
  hatRow[11] = false;
  hatRow[12] = p1 > 0.1;
  hatRow[13] = p1 > 0.7;
  hatRow[14] = false;
  hatRow[15] = p1 > 0.5;
  
  snrRow[0] = p2 > 0.7;
  snrRow[1] = false;
  snrRow[2] = p2 > 0.2; ;
  snrRow[3] = false;
  snrRow[4] = p2 > 0.8;
  snrRow[5] = p2 > 0.01;
  snrRow[6] = false;
  snrRow[7] = p2 > 0.4;
  snrRow[8] = false;
  snrRow[9] = p2 > 0.9;
  snrRow[10] = p2 > 0.3;;
  snrRow[11] = false;
  snrRow[12] = false;
  snrRow[13] = p2 > 0.1;
  snrRow[14] = p2 > 0.6;
  snrRow[15] = p2 > 0.5;
  
  kikRow[0] = p3 > 0.01;
  kikRow[1] = p3 > 0.5;
  kikRow[2] = false;
  kikRow[3] = p3 > 0.8;
  kikRow[4] =p3 >  0.6;
  kikRow[5] = false;
  kikRow[6] = false;
  kikRow[7] = p3 > 0.1;
  kikRow[8] = p3 > 0.9;
  kikRow[9] = false;
  kikRow[10] = p3 > 0.2;
  kikRow[11] = p3 > 0.4;
  kikRow[12] = p3 > 0.7;
  kikRow[13] = false;
  kikRow[14] = p3 > 0.3;
  kikRow[15] = p3 > 0.1;
  
  pyRow[0] = p4 > 0.01;
  pyRow[1] = false;
  pyRow[2] = p4 > 0.3;
  pyRow[3] = p4 > 0.5;
  pyRow[4] = p4 >  0.7;
  pyRow[5] = false;
  pyRow[6] = false;
  pyRow[7] = p4 > 0.1;
  pyRow[8] = p4 > 0.9;
  pyRow[9] = false;
  pyRow[10] = p4 > 0.2;
  pyRow[11] = p4 > 0.4;
  pyRow[12] = false;
  pyRow[13] =  p4 > 0.2;
  pyRow[14] = p4 > 0.3;
  pyRow[15] = p4 > 0.1;
  
}
