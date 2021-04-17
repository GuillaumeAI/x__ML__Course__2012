import processing.net.*;
import processing.video.*;

Client client;
Capture cam;
JPGEncoder jpg;

void setup() {
	jpg = new JPGEncoder();

 // cam = new Capture(this, Capture.list()[1]);
  cam = new Capture(this, 1000,600);
	cam.start();

	String server = "192.168.2.132";
	//String server = "127.0.0.1";
	client = new Client(this, server, 5203);
	
	background(0);
	println("Starting client");
}

void draw() {

}
int resX = 1000;
float compressionRation = 0.4F;

void keyTyped() {
	if (cam.available()) {
		println("Cam available. Going to read");
		cam.read();
		try {
			println("Getting image to memory");
			PImage img = cam.get();
			img.resize(resX, 0);

			println("Encoding");
			byte[] jpgBytes = jpg.encode(img, compressionRation);

			println("Writing file length to server: " + jpgBytes.length);
			// Taken from: https://processing.org/discourse/beta/num_1192330628.html
			client.write(jpgBytes.length / 256);
			client.write(jpgBytes.length % 256);

      print("Writing jpg bytes to server");
			client.write(jpgBytes);
      println("...done");
		} catch (IOException e) {
			// Ignore failure to encode
			println("IOException");
		}
		
		
	}
}
