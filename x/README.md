

# X 


## x Runs an oscillation

* Following the courses on Kadenze on Chuck from : [Kadenze.com/courses/introduction-to-programming-for-musicians-and-digital-artists](https://www.kadenze.com/courses/introduction-to-programming-for-musicians-and-digital-artists/sessions/basics-sound-waves-and-chuck-programming)

```sh

chuck x__oscillator__2101121337.ck

```

## Code
```ck
SinOsc foo => dac;
440 => foo.freq;

2::second => now;
```