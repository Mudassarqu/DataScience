/* Quiz bank for Grade 9 DS PRO Criterion C: light detector and PIR motion */
window.QUIZ_BANK={
 "topics": {
  "ldr": {
   "name": "The light sensor (LDR)",
   "emoji": "💡",
   "mcq": [
    {
     "q": "What does LDR stand for?",
     "o": [
      "Light Dependent Resistor",
      "Low Data Rate",
      "Linear Digital Reader",
      "Laser Distance Reader"
     ],
     "c": 0,
     "w": "A Light Dependent Resistor changes its resistance with the light that falls on it."
    },
    {
     "q": "In your kit the LDR is inverted. What happens to the raw reading when it gets brighter?",
     "o": [
      "It goes down",
      "It goes up",
      "It stays the same",
      "It becomes text"
     ],
     "c": 0,
     "w": "Low raw value = bright, high raw value = dark, so the sketch maps it the other way round."
    },
    {
     "q": "Which pin is the LDR connected to in the sketch?",
     "o": [
      "GPIO 36 (VP)",
      "GPIO 25",
      "GPIO 1",
      "The USB port"
     ],
     "c": 0,
     "w": "LDR_PIN is 36. GPIO 25, 26 and 27 drive the LEDs."
    },
    {
     "q": "Which function reads the voltage on the LDR pin as a number?",
     "o": [
      "analogRead()",
      "digitalWrite()",
      "Serial.begin()",
      "delay()"
     ],
     "c": 0,
     "w": "analogRead() returns the ADC value for the pin."
    },
    {
     "q": "A raw reading of 688 means the sensor is probably…",
     "o": [
      "covered or in the dark",
      "in direct sunlight",
      "broken because it is too low",
      "disconnected because it is too high"
     ],
     "c": 0,
     "w": "688 is above the 500 DARK threshold. It is a normal covered-sensor reading in your data."
    },
    {
     "q": "What does an ADC do?",
     "o": [
      "Turns a voltage into a number",
      "Turns a number into light",
      "Stores data in a file",
      "Draws a chart"
     ],
     "c": 0,
     "w": "An analogue to digital converter turns the pin voltage into a number the program can use."
    },
    {
     "q": "A reading of 4095 appears once in a stream of values near 400. What is the best explanation?",
     "o": [
      "A fault such as a floating pin",
      "The room became very bright",
      "The sensor is working perfectly",
      "Python added 4095"
     ],
     "c": 0,
     "w": "4095 is the top of the ESP32 12-bit scale. A loose wire can make the pin float to it, so it is a fault."
    },
    {
     "q": "Why do we test the sensor in several lighting conditions?",
     "o": [
      "To see whether the thresholds work in real conditions",
      "To make the code longer",
      "Because the sensor needs warming up",
      "To avoid using Python"
     ],
     "c": 0,
     "w": "A fair test covers the range the product will meet, such as dark, shade, classroom lights and sunlight."
    }
   ],
   "fill": [
    {
     "t": "The LDR is connected to pin ___ on the ESP32.",
     "a": [
      "36",
      "GPIO 36",
      "gpio36"
     ],
     "w": "LDR_PIN = 36."
    },
    {
     "t": "A ___ reading means bright light on your inverted LDR sensor (low or high).",
     "a": [
      "low"
     ],
     "w": "Low raw = bright."
    },
    {
     "t": "The sketch prints readings to the Serial ___ at 9600 baud.",
     "a": [
      "monitor"
     ],
     "w": "Serial Monitor."
    },
    {
     "t": "ADC stands for analogue to ___ converter.",
     "a": [
      "digital"
     ],
     "w": "Analogue to digital converter."
    },
    {
     "t": "The function analog___() reads the sensor pin.",
     "a": [
      "read",
      "Read"
     ],
     "w": "analogRead()."
    }
   ],
   "match": {
    "title": "Match the part to its job",
    "pairs": [
     [
      "LDR",
      "Changes resistance with light"
     ],
     [
      "ESP32",
      "Reads the sensor and prints to serial"
     ],
     [
      "Serial Monitor",
      "Shows the lines your sketch prints"
     ],
     [
      "Red LED (GPIO 25)",
      "Shows that it is too dark"
     ],
     [
      "analogRead()",
      "Returns the sensor value as a number"
     ]
    ]
   },
   "sensor": "Light sensor"
  },
  "ino": {
   "name": "Reading the Arduino code",
   "emoji": "🔌",
   "mcq": [
    {
     "q": "What does map(lightValue, 650, 0, 0, 100) do?",
     "o": [
      "Turns 650..0 into 0..100",
      "Turns 0..650 into 100..0 as text",
      "Draws a map",
      "Sorts the readings"
     ],
     "c": 0,
     "w": "It rescales the raw range 650 down to 0 onto 0 up to 100 percent."
    },
    {
     "q": "For raw = 325, map(325, 650, 0, 0, 100) gives…",
     "o": [
      "50",
      "25",
      "75",
      "325"
     ],
     "c": 0,
     "w": "325 is halfway between 650 and 0, so the result is 50."
    },
    {
     "q": "What does constrain(x, 0, 100) do?",
     "o": [
      "Keeps x between 0 and 100",
      "Doubles x",
      "Prints x",
      "Deletes x"
     ],
     "c": 0,
     "w": "constrain clamps a value inside a range."
    },
    {
     "q": "In the sketch, which comes first in the if / else if chain?",
     "o": [
      "The DARK test: lightValue > 500",
      "The VERY BRIGHT test",
      "The BRIGHT test",
      "The DIM test"
     ],
     "c": 0,
     "w": "The chain starts with the largest raw threshold, because a high raw value means dark."
    },
    {
     "q": "What does Serial.begin(9600) set?",
     "o": [
      "The speed of serial communication",
      "The number of readings",
      "The pin number",
      "The light level"
     ],
     "c": 0,
     "w": "9600 is the baud rate, and the computer must read at the same speed."
    },
    {
     "q": "Why does the sketch end loop() with delay(500)?",
     "o": [
      "To take about two readings per second",
      "To make the LED brighter",
      "To clear the Serial Monitor",
      "To restart the ESP32"
     ],
     "c": 0,
     "w": "500 ms between readings is two readings each second."
    },
    {
     "q": "What goes wrong if you move the DIM threshold above the DARK threshold?",
     "o": [
      "DIM can never be reached",
      "Everything is DIM",
      "The code will not compile",
      "Nothing changes"
     ],
     "c": 0,
     "w": "Because DARK is tested first, any value above the DIM threshold would already have been caught as DARK."
    },
    {
     "q": "The extension code uses LED_RED for lightPercent below 30. What does that mean in your product?",
     "o": [
      "Too dark, so the corridor lights switch on",
      "Plenty of light",
      "Sensor fault",
      "Battery low"
     ],
     "c": 0,
     "w": "Red is the too-dark state in your Criterion B design."
    }
   ],
   "fill": [
    {
     "t": "In map(x, 650, 0, 0, 100) the first number, ___, is the input range's low end.",
     "a": [
      "650"
     ],
     "w": "The input range is 650 to 0."
    },
    {
     "t": "constrain(lightPercent, 0, ___) stops the percent going above the top value.",
     "a": [
      "100"
     ],
     "w": "The top of the percent range is 100."
    },
    {
     "t": "The Arduino function ___() pauses the program for a number of milliseconds.",
     "a": [
      "delay"
     ],
     "w": "delay(500)."
    },
    {
     "t": "Use Serial.___() to print a line and move to the next line.",
     "a": [
      "println"
     ],
     "w": "Serial.println."
    },
    {
     "t": "Pin modes for LEDs are set with pin___(LED_RED, OUTPUT).",
     "a": [
      "mode",
      "Mode"
     ],
     "w": "pinMode()."
    }
   ],
   "match": {
    "title": "Match the Arduino code to its meaning",
    "pairs": [
     [
      "Serial.begin(9600)",
      "Start serial at 9600 baud"
     ],
     [
      "analogRead(LDR_PIN)",
      "Get the raw sensor value"
     ],
     [
      "map(...)",
      "Rescale one range onto another"
     ],
     [
      "constrain(...)",
      "Keep a value within limits"
     ],
     [
      "delay(500)",
      "Wait half a second"
     ]
    ]
   },
   "sensor": "Light sensor"
  },
  "data": {
   "name": "Cleaning and statistics",
   "emoji": "🧹",
   "mcq": [
    {
     "q": "Why do we clean sensor data before analysing it?",
     "o": [
      "Faults give wrong answers",
      "To make it longer",
      "Python needs it",
      "Charts only work on clean data"
     ],
     "c": 0,
     "w": "A few faulty readings can change the mean and hide the real pattern."
    },
    {
     "q": "Which reading would a range filter of 5 to 1000 remove?",
     "o": [
      "4095",
      "688",
      "442",
      "30"
     ],
     "c": 0,
     "w": "4095 is outside the believable range."
    },
    {
     "q": "A z-score of 4 means the value is…",
     "o": [
      "4 standard deviations from the mean",
      "4 times the mean",
      "4 percent of the data",
      "the fourth reading"
     ],
     "c": 0,
     "w": "A z-score counts standard deviations from the mean."
    },
    {
     "q": "Which statistic is least affected by one huge glitch?",
     "o": [
      "Median",
      "Mean",
      "Range",
      "Total"
     ],
     "c": 0,
     "w": "The median is the middle value, so one extreme value hardly moves it."
    },
    {
     "q": "What does a 5-sample moving average do?",
     "o": [
      "Smooths out small jumps",
      "Removes all outliers",
      "Doubles the data",
      "Sorts the data"
     ],
     "c": 0,
     "w": "Each point becomes the mean of the last five, so short spikes are flattened."
    },
    {
     "q": "Your data has a gap of two missing readings in a time series. Which is a reasonable first fix?",
     "o": [
      "Carry the last good value forward and say so in your report",
      "Delete the whole dataset",
      "Replace with 4095",
      "Ignore it and do not mention it"
     ],
     "c": 0,
     "w": "For short gaps carrying a value forward is fair, as long as you record what you did."
    },
    {
     "q": "You removed 9 of 100 rows. What should you do?",
     "o": [
      "Record which steps removed them and why",
      "Hide the number",
      "Add 9 random rows",
      "Nothing"
     ],
     "c": 0,
     "w": "Evidence of your cleaning decisions belongs in your Criterion C log."
    },
    {
     "q": "Which chart best shows how often DARK, DIM, BRIGHT and VERY BRIGHT happened?",
     "o": [
      "Bar chart",
      "Line chart",
      "Scatter plot",
      "Pie chart with 40 slices"
     ],
     "c": 0,
     "w": "A bar chart compares counts across categories."
    }
   ],
   "fill": [
    {
     "t": "The ___ is the middle value after sorting the data.",
     "a": [
      "median"
     ],
     "w": "Median."
    },
    {
     "t": "A reading outside the possible range is called an ___ if it is far from the others.",
     "a": [
      "outlier"
     ],
     "w": "Outlier."
    },
    {
     "t": "Standard deviation measures how ___ out the data is.",
     "a": [
      "spread"
     ],
     "w": "Spread."
    },
    {
     "t": "A z-score above ___ is usually treated as very unusual.",
     "a": [
      "3",
      "three"
     ],
     "w": "The kit script uses 3."
    },
    {
     "t": "Percent share = count ÷ ___ × 100.",
     "a": [
      "total"
     ],
     "w": "Divide by the total number of readings."
    }
   ],
   "match": {
    "title": "Match the cleaning step to its purpose",
    "pairs": [
     [
      "Range filter",
      "Removes impossible values"
     ],
     [
      "Z-score filter",
      "Removes statistical outliers"
     ],
     [
      "Moving average",
      "Smooths noise"
     ],
     [
      "Fill gaps",
      "Replaces short runs of missing data"
     ],
     [
      "Drop missing rows",
      "Removes rows with no number"
     ]
    ]
   },
   "sensor": "Light sensor"
  },
  "py": {
   "name": "Python for data",
   "emoji": "🐍",
   "mcq": [
    {
     "q": "What does int(\"442\") return?",
     "o": [
      "The number 442",
      "The text 442",
      "An error",
      "442.0"
     ],
     "c": 0,
     "w": "int() converts text to a whole number."
    },
    {
     "q": "What does [v for v in raw if v < 1000] create?",
     "o": [
      "A new list of the values under 1000",
      "A dictionary",
      "A single number",
      "An error"
     ],
     "c": 0,
     "w": "It is a list comprehension that keeps values meeting the test."
    },
    {
     "q": "What does counts.get(r, 0) + 1 do inside a counting loop?",
     "o": [
      "Adds one to the current count, starting from zero",
      "Resets the count",
      "Deletes the key",
      "Prints the count"
     ],
     "c": 0,
     "w": "get returns 0 when the key is missing, so the first time it becomes 1."
    },
    {
     "q": "What is the result of 7 // 2?",
     "o": [
      "3",
      "3.5",
      "4",
      "1"
     ],
     "c": 0,
     "w": "Double slash divides and drops the decimals."
    },
    {
     "q": "Which loop is best when you do not know how many repeats you need?",
     "o": [
      "while",
      "for over range",
      "no loop",
      "print"
     ],
     "c": 0,
     "w": "while repeats until its condition changes."
    },
    {
     "q": "What does try / except do?",
     "o": [
      "Handles an error instead of crashing",
      "Repeats code",
      "Defines a function",
      "Imports a module"
     ],
     "c": 0,
     "w": "The except block runs if the try block raises an error."
    },
    {
     "q": "What is wrong with if raw = 500: ?",
     "o": [
      "One equals sign stores a value, you need two to compare",
      "Nothing",
      "500 is not a number",
      "if is a bad word"
     ],
     "c": 0,
     "w": "== compares, = stores."
    },
    {
     "q": "How do you get the last item in a list called raws?",
     "o": [
      "raws[-1]",
      "raws[last]",
      "raws.end",
      "raws[len]"
     ],
     "c": 0,
     "w": "A negative index counts from the end."
    }
   ],
   "fill": [
    {
     "t": "Use the ___() function to find how many items are in a list.",
     "a": [
      "len"
     ],
     "w": "len(list)."
    },
    {
     "t": "A list comprehension is written inside square ___.",
     "a": [
      "brackets"
     ],
     "w": "[ ... ]"
    },
    {
     "t": "To define a function you start the line with ___.",
     "a": [
      "def"
     ],
     "w": "def name(parameters):"
    },
    {
     "t": "A dictionary stores values under a ___.",
     "a": [
      "key"
     ],
     "w": "Keys label the values."
    },
    {
     "t": "To show a result on the screen use ___().",
     "a": [
      "print"
     ],
     "w": "print()."
    }
   ],
   "match": {
    "title": "Match the Python idea to the example",
    "pairs": [
     [
      "f-string",
      "f\"Raw {raw}\""
     ],
     [
      "list comprehension",
      "[v for v in raw if v > 5]"
     ],
     [
      "dictionary",
      "{\"DARK\": 3}"
     ],
     [
      "function",
      "def clean(rows):"
     ],
     [
      "comparison",
      "raw > 500"
     ]
    ]
   }
  },
  "pir": {
   "name": "The PIR motion sensor",
   "emoji": "🚶",
   "sensor": "Motion sensor",
   "mcq": [
    {
     "q": "What does PIR stand for?",
     "o": [
      "Passive Infrared",
      "Pulse Input Reader",
      "Power In Relay",
      "Pin Input Register"
     ],
     "c": 0,
     "w": "A Passive Infrared sensor detects the infrared heat that moving people give off."
    },
    {
     "q": "What kind of signal does the PIR put on GPIO 27?",
     "o": [
      "Digital: HIGH or LOW",
      "Analogue 0 to 4095",
      "A text message",
      "A sound"
     ],
     "c": 0,
     "w": "The PIR is read with digitalRead(), so you get 1 (motion) or 0 (no motion)."
    },
    {
     "q": "Why does the sketch wait 3 seconds in setup() before streaming?",
     "o": [
      "The PIR needs time to warm up",
      "To save battery",
      "To clear the Serial Monitor",
      "Python needs it"
     ],
     "c": 0,
     "w": "A PIR sensor needs a warm-up period to settle before its output is reliable."
    },
    {
     "q": "Which part switches the room lights in your kit sketch?",
     "o": [
      "The relay on GPIO 25",
      "The buzzer on GPIO 26",
      "The PIR on GPIO 27",
      "The USB cable"
     ],
     "c": 0,
     "w": "RELAY_PIN is 25. It goes HIGH when motion starts and LOW when it stops."
    },
    {
     "q": "A PIR reports motion for 1 second and then nothing. Which status fits best?",
     "o": [
      "TRANSIT_PASSING",
      "CONTINUOUS_PRESENCE",
      "ACTIVE_OCCUPANCY",
      "VACANT_STANDBY"
     ],
     "c": 0,
     "w": "Short dwell (2000 ms or less) means someone just passed through."
    },
    {
     "q": "Which situation is a weakness of a PIR sensor?",
     "o": [
      "A person sitting very still",
      "A person walking quickly",
      "A person waving",
      "A person running"
     ],
     "c": 0,
     "w": "PIRs detect changes in infrared, so a very still person may stop triggering it."
    },
    {
     "q": "Why can a sunny window or a heater cause false alarms?",
     "o": [
      "They change the infrared in the sensor's view",
      "They make the ESP32 slower",
      "They block the serial port",
      "They change the baud rate"
     ],
     "c": 0,
     "w": "Rapid heat changes look like movement to a passive infrared sensor."
    },
    {
     "q": "Which is the best reason to log motion data over a whole day?",
     "o": [
      "To see when and how long a space is used",
      "To make the code longer",
      "To avoid using the relay",
      "To make the buzzer louder"
     ],
     "c": 0,
     "w": "Logs let you find patterns such as busy periods, so the product can be tuned."
    }
   ],
   "fill": [
    {
     "t": "The PIR is connected to GPIO ___.",
     "a": [
      "27",
      "gpio 27",
      "gpio27"
     ],
     "w": "PIR_PIN = 27."
    },
    {
     "t": "The relay that switches the lights is on GPIO ___.",
     "a": [
      "25",
      "gpio 25",
      "gpio25"
     ],
     "w": "RELAY_PIN = 25."
    },
    {
     "t": "The PIR output is read with digital___().",
     "a": [
      "read",
      "digitalread"
     ],
     "w": "digitalRead()."
    },
    {
     "t": "If dwell time is more than 6000 ms the status is ___.",
     "a": [
      "continuous_presence",
      "continuous presence"
     ],
     "w": "CONTINUOUS_PRESENCE."
    },
    {
     "t": "When there is no motion the status is always ___.",
     "a": [
      "vacant_standby",
      "vacant standby"
     ],
     "w": "VACANT_STANDBY."
    }
   ],
   "match": {
    "title": "Match the part to its job",
    "pairs": [
     [
      "PIR sensor",
      "Detects moving infrared heat"
     ],
     [
      "Relay (GPIO 25)",
      "Switches the room lights"
     ],
     [
      "Buzzer (GPIO 26)",
      "Sounds a security alert"
     ],
     [
      "Dwell time",
      "How long the current motion has lasted"
     ],
     [
      "TRANSIT_PASSING",
      "Someone passing through quickly"
     ]
    ]
   }
  },
  "pino": {
   "name": "Reading the motion sketch",
   "emoji": "🔌",
   "sensor": "Motion sensor",
   "mcq": [
    {
     "q": "What does an edge detection like (currentMotion == HIGH && lastMotionState == LOW) find?",
     "o": [
      "The moment motion starts",
      "Any time motion is HIGH",
      "The moment motion stops",
      "A broken sensor"
     ],
     "c": 0,
     "w": "The state was LOW before and is HIGH now, so motion has just started. That is when motionStartTime is saved."
    },
    {
     "q": "How is dwellDuration worked out while motion is HIGH?",
     "o": [
      "now - motionStartTime",
      "now + motionStartTime",
      "motionStartTime / 1000",
      "Serial.read()"
     ],
     "c": 0,
     "w": "Dwell is how long since the motion started."
    },
    {
     "q": "What is millis()?",
     "o": [
      "Milliseconds since the board started",
      "The time of day",
      "The sensor value",
      "A Python function"
     ],
     "c": 0,
     "w": "millis() counts milliseconds since the ESP32 powered up."
    },
    {
     "q": "Why does the sketch use TELEMETRY_INTERVAL instead of delay(1000)?",
     "o": [
      "So the PIR can still be read every loop",
      "Because delay() is broken",
      "To save memory",
      "To change the baud rate"
     ],
     "c": 0,
     "w": "delay() would freeze the sketch. Comparing millis() lets the loop keep reading the PIR."
    },
    {
     "q": "In the sketch, which dwell time gives ACTIVE_OCCUPANCY (motion is HIGH)?",
     "o": [
      "More than 2000 and up to 6000 ms",
      "Less than 2000 ms",
      "More than 6000 ms",
      "Exactly 0 ms"
     ],
     "c": 0,
     "w": "The if / else if chain checks > 6000 first, then > 2000, else TRANSIT_PASSING."
    },
    {
     "q": "What is the baud rate in the sketch?",
     "o": [
      "9600",
      "115200",
      "4800",
      "2400"
     ],
     "c": 0,
     "w": "Serial.begin(9600). The Python collector uses the same number."
    },
    {
     "q": "What does the Python collector do with each serial line?",
     "o": [
      "Parses it with a regular expression and writes a CSV row",
      "Deletes it",
      "Sends it to the relay",
      "Plays a sound"
     ],
     "c": 0,
     "w": "parse_motion_line() pulls out four values and the script writes them to a CSV file."
    }
   ],
   "fill": [
    {
     "t": "A variable that stores the last state is lastMotion___.",
     "a": [
      "state"
     ],
     "w": "lastMotionState."
    },
    {
     "t": "digitalWrite(RELAY_PIN, ___) switches the lights on.",
     "a": [
      "high"
     ],
     "w": "HIGH switches the relay on."
    },
    {
     "t": "The sketch prints telemetry once every ___ ms.",
     "a": [
      "1000"
     ],
     "w": "TELEMETRY_INTERVAL = 1000 (1 Hz)."
    },
    {
     "t": "A statement such as else ___ (dwellDuration > 2000) adds another test.",
     "a": [
      "if"
     ],
     "w": "else if."
    },
    {
     "t": "Serial.___ prints a value and moves to a new line.",
     "a": [
      "println"
     ],
     "w": "Serial.println()."
    }
   ],
   "match": {
    "title": "Match the code to what it does",
    "pairs": [
     [
      "pinMode(PIR_PIN, INPUT)",
      "Prepares the PIR pin to be read"
     ],
     [
      "digitalRead(PIR_PIN)",
      "Reads 1 or 0 from the PIR"
     ],
     [
      "millis() - motionStartTime",
      "Dwell time so far"
     ],
     [
      "digitalWrite(RELAY_PIN, HIGH)",
      "Lights on"
     ],
     [
      "Serial.println(statusStr)",
      "Prints the status to the Serial Monitor"
     ]
    ]
   }
  },
  "pdata": {
   "name": "Motion data and cleaning",
   "emoji": "📊",
   "sensor": "Motion sensor",
   "mcq": [
    {
     "q": "A row has Motion_State 7. What should clean() do?",
     "o": [
      "Drop it, because only 0 or 1 is possible",
      "Keep it",
      "Change it to 70",
      "Sort it first"
     ],
     "c": 0,
     "w": "A digital PIR can only report 0 or 1, so 7 is an error."
    },
    {
     "q": "What is Rolling_Activity in your cleaning script?",
     "o": [
      "The sum of the last 10 motion states",
      "The dwell time in seconds",
      "The row number",
      "The timestamp"
     ],
     "c": 0,
     "w": "It adds up the last 10 Motion_State values, so it counts how many of the last 10 seconds had motion."
    },
    {
     "q": "Rolling_Activity is 4. What is Duty_Cycle_Pct?",
     "o": [
      "40.0",
      "4.0",
      "14.0",
      "400"
     ],
     "c": 0,
     "w": "4 ÷ 10 × 100 = 40 %."
    },
    {
     "q": "Dwell_Time_ms is 2450. What is Dwell_Seconds?",
     "o": [
      "2.45",
      "24.5",
      "245",
      "0.245"
     ],
     "c": 0,
     "w": "Divide milliseconds by 1000."
    },
    {
     "q": "Which chart shows how busy a space is through the day?",
     "o": [
      "A line chart of duty cycle over time",
      "A pie chart of the sensor pin",
      "A table of pin numbers",
      "No chart is useful"
     ],
     "c": 0,
     "w": "A line chart shows change over time."
    },
    {
     "q": "What does an 'event' mean in Step 3 of the Python lab?",
     "o": [
      "One visit: motion changes from 0 to 1",
      "Any row",
      "Any row with Status",
      "A cleaning error"
     ],
     "c": 0,
     "w": "Counting changes from 0 to 1 counts visits instead of seconds of motion."
    },
    {
     "q": "Almost every event in your kit data is TRANSIT_PASSING. What is the best next step?",
     "o": [
      "Check whether the dwell numbers and thresholds make sense for the space",
      "Delete the data",
      "Ignore it",
      "Change the baud rate"
     ],
     "c": 0,
     "w": "Data should be questioned. Very small dwell values may mean a unit or sampling problem."
    }
   ],
   "fill": [
    {
     "t": "Duty cycle = rolling sum ÷ ___ × 100.",
     "a": [
      "10"
     ],
     "w": "The window is 10 samples."
    },
    {
     "t": "An outlier or impossible value should be ___ or corrected during cleaning.",
     "a": [
      "removed",
      "dropped",
      "deleted"
     ],
     "w": "Remove or fix it."
    },
    {
     "t": "pd.read_csv() loads a ___ file.",
     "a": [
      "csv"
     ],
     "w": "CSV."
    },
    {
     "t": "A value that is not a number can become ___ with errors='coerce'.",
     "a": [
      "nan"
     ],
     "w": "NaN, which fillna(0) can replace."
    },
    {
     "t": "The count of rows with motion divided by all rows gives the ___ percentage.",
     "a": [
      "occupancy"
     ],
     "w": "Occupancy %."
    }
   ],
   "match": {
    "title": "Match the column to its meaning",
    "pairs": [
     [
      "Motion_State",
      "1 = motion, 0 = none"
     ],
     [
      "Dwell_Time_ms",
      "How long this motion has lasted (ms)"
     ],
     [
      "Rolling_Activity",
      "Motion samples in the last 10 seconds"
     ],
     [
      "Duty_Cycle_Pct",
      "Share of the last 10 samples with motion"
     ],
     [
      "Status",
      "VACANT, TRANSIT, ACTIVE or CONTINUOUS"
     ]
    ]
   }
  },
  "daylight": {
   "name": "Daylight Tracker (Criterion C)",
   "emoji": "☀️",
   "sensor": "Light sensor",
   "mcq": [
    {
     "q": "Why does the post's sketch flip the LDR scale before reporting a percent?",
     "o": [
      "Low raw means bright in this kit",
      "The ESP32 counts backwards",
      "Percent cannot be negative",
      "The LDR is broken"
     ],
     "c": 0,
     "w": "Your LDR is inverted: a low raw value is bright, so map(raw,650,0,0,100) turns it into a light percent."
    },
    {
     "q": "What does map(325, 650, 0, 0, 100) return?",
     "o": [
      "50",
      "25",
      "325",
      "0"
     ],
     "c": 0,
     "w": "325 is halfway between 650 and 0, so the answer is halfway between 0 and 100."
    },
    {
     "q": "Why is constrain() used after map()?",
     "o": [
      "To keep the percent between 0 and 100",
      "To make the code run faster",
      "To print the value",
      "To read the sensor again"
     ],
     "c": 0,
     "w": "A raw reading above 650 would map to a negative percent, so constrain holds it in range."
    },
    {
     "q": "The if chain tests raw > 500 first. Why is the order important?",
     "o": [
      "A raw of 688 would also pass every lower test",
      "The ESP32 reads the top line first only",
      "Order never matters",
      "DARK needs the most memory"
     ],
     "c": 0,
     "w": "If the 100 test came first, almost every reading would be labelled VERY BRIGHT. Test the biggest threshold first."
    },
    {
     "q": "Strong sun makes a bare sensor over-read. What design change fixes this?",
     "o": [
      "A diffuser lip around the sensor",
      "A longer USB cable",
      "A second Serial.begin",
      "A bigger delay"
     ],
     "c": 0,
     "w": "The lip blocks harsh direct light so the sensor reports the true level. That is the C4 change."
    },
    {
     "q": "B1 spec 7.1 allows fewer than how many wrong readings in a day?",
     "o": [
      "2",
      "10",
      "0 only",
      "100"
     ],
     "c": 0,
     "w": "Fewer than 2 wrong readings means at most 1 wrong."
    },
    {
     "q": "A loose wire gives one reading of 0 in a run of 600s. Which cleaning rule removes it?",
     "o": [
      "A range filter such as 5 to 1000",
      "A moving average",
      "A bar chart",
      "Serial.println"
     ],
     "c": 0,
     "w": "0 is outside the realistic range, so the range filter drops it."
    },
    {
     "q": "Why use the median instead of the mean for a day of readings with a spike?",
     "o": [
      "The median is not dragged by one spike",
      "The mean cannot be calculated",
      "The median is always bigger",
      "The mean is only for text"
     ],
     "c": 0,
     "w": "One extreme value pulls the mean towards it, while the median stays in the middle."
    },
    {
     "q": "What does a 5-reading moving average do to a single noisy value?",
     "o": [
      "Reduces its effect on the label",
      "Deletes the whole day",
      "Doubles it",
      "Turns it into text"
     ],
     "c": 0,
     "w": "Each reading is replaced by the average of the last five, so one bad value changes the label much less."
    },
    {
     "q": "A reading is 8 hours of 'not DARK' out of 144 readings in 16 hours. How many readings is that?",
     "o": [
      "72",
      "8",
      "144",
      "16"
     ],
     "c": 0,
     "w": "One reading is 16/144 of an hour, so 8 hours is 8 × 144 ÷ 16 = 72 readings."
    }
   ],
   "fill": [
    {
     "t": "The LDR in your kit is connected to GPIO ___.",
     "a": [
      "36"
     ],
     "w": "LDR_PIN is 36 (VP)."
    },
    {
     "t": "A covered sensor reads about ___ raw, which is DARK.",
     "a": [
      "688"
     ],
     "w": "688 is above the 500 DARK threshold."
    },
    {
     "t": "The three thresholds in the sketch are 500, 300 and ___.",
     "a": [
      "100"
     ],
     "w": "DARK above 500, DIM above 300, BRIGHT above 100."
    },
    {
     "t": "Energy in kWh = lamps × watts × hours ÷ ___.",
     "a": [
      "1000"
     ],
     "w": "Watts divided by 1000 gives kilowatts."
    },
    {
     "t": "A z-score of 3 or more marks a statistical ___.",
     "a": [
      "outlier",
      "outliers"
     ],
     "w": "Values this far from the mean are outliers."
    },
    {
     "t": "The Serial Monitor baud rate for the post is ___.",
     "a": [
      "9600"
     ],
     "w": "Serial.begin(9600)."
    }
   ],
   "match": {
    "title": "Match the step to its job in the Daylight Tracker",
    "pairs": [
     [
      "analogRead()",
      "Reads the LDR voltage as a number"
     ],
     [
      "map()",
      "Rescales raw to a 0 to 100 percent"
     ],
     [
      "constrain()",
      "Keeps the percent inside its range"
     ],
     [
      "Range filter",
      "Drops impossible readings like 0 or 4095"
     ],
     [
      "Moving average",
      "Smooths one noisy reading"
     ],
     [
      "Diffuser lip",
      "Stops glare over-reading in strong sun"
     ]
    ]
   }
  }
 },
 "order": [
  "ldr",
  "ino",
  "data",
  "daylight",
  "pir",
  "pino",
  "pdata",
  "py"
 ]
};
