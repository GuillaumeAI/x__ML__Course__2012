// patch
adc => DelayL delay => dac;

// set delay parameters
1.35::second => delay.max => delay.delay;

// infinite time loop
while( true ) 2::second => now;
