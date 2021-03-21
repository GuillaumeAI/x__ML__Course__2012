/*  Triggers melody notes whenever OSC message arrives

parameters for this class are:
0 = midinote pitch, 0 is middle C
1 = gain (0 to 1)
*/


// create our OSC receiver
OscRecv recv;
// use port 12000
12000 => recv.port;
// start listening (launch thread)
recv.listen();

// create an address in the receiver, store in new variable
recv.event( "/wek/outputs, f f" ) @=> OscEvent oe;

<<< "Listening for 2 continuous parameters on port 12000, message name /wek/outputs">>>; 


OscSend xmit;

Mandolin m => Gain g => dac;
2 => int numParams;
60 => Std.mtof => m.freq;
float myParams[2];

1 => float vol;
0 => float freq;
now => time last;
300::ms => dur wait;

Envelope envs[numParams];
for (0 => int i; i < numParams; i++) {
    envs[i] => blackhole;
    .5 => envs[i].value;
    1::samp => envs[i].duration;
}

//This is called by the main code, only once after initialization, like a constructor
fun void setup() {
    spork ~smooth();	
}

fun void setParams(float params[]) {
    if (params.size() >= numParams) {		
        //Adjust the synthesis accordingly
        0.0 => float x;
        for (0 => int i; i < numParams; i++) {
            params[i] => x;
            if (i == 0) {
                
                if (x < -60)
                    -60 => x;
                if (x > 60)
                    60 => x;
            } else {
                
                if (x < 0)
                    0 => x;
                if (x > 1)
                    1 => x;
            } 
            x => envs[i].target;
            x => myParams[i];
        }
    }
    //NOTE: we rely on smooth() method to actually interpret these parameters musically.
}
fun void smooth() {
    while (true) {
        makeInt(envs[0].value()) + 60 => Std.mtof => m.freq;
        (envs[1].value() ) => g.gain;
        1::samp => now;
    }
}

fun int makeInt(float in) {
    //<<< in >>>;
    if (in < 1) 
        return 0;
    if (in < 2) 
        return 2;
    if (in < 3) 
        return 4;
    if (in < 4) 
        return 5;
    if (in < 5) 
        return 7;
    if (in < 6) 
        return 9;
    if (in < 7) 
        return 11;
     
    return 12;
}

fun void waitForEvent() {
    // infinite event loop
    while ( true )
    {
           

        // wait for event to arrive
        oe => now;
        // <<< "EVENT">>>;
        
        // grab the next message from the queue. 
        while ( oe.nextMsg() != 0 )
        { 

            if (now > last + wait) {
                float p[2];
                oe.getFloat() => p[0];
                oe.getFloat() => p[1];
                setParams(p);
                1 => m.noteOn;
                now => last;
            }
        }
    }   
    
}

setup();
spork ~waitForEvent();
10::hour => now;

/* //For testing:
setup();
sound();
setClass(0);
10::second => now;
setClass(3);
1::minute => now; */
