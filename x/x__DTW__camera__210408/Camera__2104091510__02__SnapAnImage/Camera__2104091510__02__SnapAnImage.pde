/*
 * Leveraging Camera - Capturing and Serializing
 * Capture a Still when mouse is clicked in ../out and paused the capture.
 * If paused and mouse click, it restart filming until next click and save
 * By J.Guillaume D-Isabelle, 2021
 */


// Step 1. Import the video library.
import processing.video.*;
 
//Step 2. Declare a capture object.
Capture cam;
PImage br,i;

// Step 5. Read from the camera when a new image is available!
void captureEvent(Capture cam) {
  cam.read();
}
 
void setup() {  
  size(640, 480);
 
  // Step 3. Initialize Capture object.
  cam = new Capture(this, 640, 480);
 
  // Step 4. Start the capturing process.
  cam.start();
}
 
// Step 6. Display the image.
void draw() {  
image(cam, 0, 0);
}
boolean paused = false;
void mousePressed(){
  if (!paused)
  {
    saveFrame("../out/capture.jpg");
    cam.stop();    
    paused = true;
  }else
  {
    paused = false;
    cam.start();
  }
}
