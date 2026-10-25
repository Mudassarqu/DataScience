window.TUTORIALS=[
 {
  "id": "01",
  "title": "Hello, Python and print()",
  "emoji": "👋",
  "mins": 3,
  "goal": "Run your first program and see how Python reads code one line at a time.",
  "slides": [
   {
    "h": "Python turns sensor readings into answers",
    "say": "Welcome. In this unit you will collect data from sensors, clean it, and find the story it tells. Python is the tool for all three jobs. We start with the one command you will use every day: print.",
    "code": null,
    "bullets": [
     "Python reads code from top to bottom",
     "print() shows a result on the screen",
     "Every data program starts with small steps like this"
    ],
    "norun": false,
    "out": null
   },
   {
    "h": "Your first program",
    "say": "The word print is a function. The brackets hold what we want to show, and quote marks tell Python the text is a message. Press Run and it appears in the output box.",
    "code": "print(\"Light sensor ready\")",
    "bullets": null,
    "norun": false,
    "out": "Light sensor ready"
   },
   {
    "h": "Print several things",
    "say": "Separate items with commas. Python puts a space between them. Numbers do not need quote marks.",
    "code": "print(\"Raw ADC:\", 442)\nprint(\"Light percent:\", 32, \"%\")",
    "bullets": null,
    "norun": false,
    "out": "Raw ADC: 442\nLight percent: 32 %"
   },
   {
    "h": "Order matters",
    "say": "Python runs the first line, then the second, then the third. A data program is a list of instructions in the right order: collect, clean, analyse, show.",
    "code": "print(\"1. Collect\")\nprint(\"2. Clean\")\nprint(\"3. Analyse\")\nprint(\"4. Show\")",
    "bullets": null,
    "norun": false,
    "out": "1. Collect\n2. Clean\n3. Analyse\n4. Show"
   },
   {
    "h": "Comments explain why",
    "say": "A hash symbol starts a comment. Python ignores it, but people read it. Write comments that explain why you did something, not just what.",
    "code": "# Sensor sends 0 to 1000, so we scale it\nprint(\"Scaled reading ready\")  # a note after code is fine too",
    "bullets": null,
    "norun": false,
    "out": "Scaled reading ready"
   }
  ],
  "task": "Print a three-line report: the sensor name, how many readings you collected, and the room where you collected them.",
  "challenges": [
   "hello",
   "fstring_reading"
  ]
 },
 {
  "id": "02",
  "title": "Variables and data types",
  "emoji": "📦",
  "mins": 4,
  "goal": "Store readings with names and know int, float, str and bool.",
  "slides": [
   {
    "h": "A variable is a labelled box",
    "say": "A variable remembers a value. One equals sign stores a value in a name. Choose names that explain themselves, like raw_adc or light_percent.",
    "code": "raw_adc = 442\nsensor = \"LDR\"\nprint(sensor, \"read\", raw_adc)",
    "bullets": null,
    "norun": false,
    "out": "LDR read 442"
   },
   {
    "h": "Variables can change",
    "say": "The same name can hold a new value later. That is why they are called variables. The shortcut plus equals adds to the existing value.",
    "code": "count = 0\ncount = count + 1\ncount += 1\nprint(\"readings so far:\", count)",
    "bullets": null,
    "norun": false,
    "out": "readings so far: 2"
   },
   {
    "h": "Four basic types",
    "say": "An int is a whole number. A float has a decimal point. A str is text. A bool is True or False. The type function tells you which one you have.",
    "code": "print(type(442))\nprint(type(3.14))\nprint(type(\"DIM\"))\nprint(type(True))",
    "bullets": null,
    "norun": false,
    "out": "<class 'int'>\n<class 'float'>\n<class 'str'>\n<class 'bool'>"
   },
   {
    "h": "Serial data arrives as text",
    "say": "When an Arduino sends a number over the serial port, Python receives text. You must convert it with int or float before you can do maths with it.",
    "code": "text = \"442\"\nraw = int(text)\nprint(raw + 8)\nprint(text + \"8\")",
    "bullets": null,
    "norun": false,
    "out": "450\n4428"
   },
   {
    "h": "Booleans answer yes or no",
    "say": "A comparison gives True or False. These values drive every decision in a program, like is it dark, or is the reading valid.",
    "code": "raw = 688\nis_dark = raw > 500\nprint(is_dark)\nprint(type(is_dark))",
    "bullets": null,
    "norun": false,
    "out": "True\n<class 'bool'>"
   }
  ],
  "task": "Make variables for the sensor name, raw reading, and whether it is dark, then print them with an f-string.",
  "challenges": [
   "convert_text",
   "fstring_reading"
  ]
 },
 {
  "id": "03",
  "title": "Numbers, rounding and map()",
  "emoji": "🧮",
  "mins": 5,
  "goal": "Do the maths that turns raw sensor numbers into useful percentages.",
  "slides": [
   {
    "h": "Python as a calculator",
    "say": "Plus, minus, star for multiply, slash for divide. Double slash divides and drops the decimals. Percent gives the remainder and two stars means power.",
    "code": "print(7 + 3, 7 - 3, 7 * 3)\nprint(7 / 2, 7 // 2, 7 % 2)\nprint(3 ** 2)",
    "bullets": null,
    "norun": false,
    "out": "10 4 21\n3.5 3 1\n9"
   },
   {
    "h": "Percentages",
    "say": "A percentage is part divided by whole times one hundred. This is how you report what share of readings were dark.",
    "code": "dark = 27\ntotal = 90\nshare = dark / total * 100\nprint(share)\nprint(round(share, 1))",
    "bullets": null,
    "norun": false,
    "out": "30.0\n30.0"
   },
   {
    "h": "Rounding",
    "say": "Sensors give long decimals. The round function tidies them. The second number is how many decimal places to keep.",
    "code": "reading = 41.66666\nprint(round(reading))\nprint(round(reading, 1))\nprint(round(reading, 2))",
    "bullets": null,
    "norun": false,
    "out": "42\n41.7\n41.67"
   },
   {
    "h": "The Arduino map function",
    "say": "Your sketch uses map to turn a raw value into a percentage. Python has no map like that, but the formula is simple. Take the raw value minus the input minimum, scale it, and add the output minimum.",
    "code": "raw = 325\npercent = int((raw - 650) * (100 - 0) / (0 - 650) + 0)\nprint(percent)",
    "bullets": null,
    "norun": false,
    "out": "50"
   },
   {
    "h": "Keep it in range",
    "say": "Real sensors can step outside the range you expect. Min and max together make a clamp that keeps a value between a lower and an upper limit. Your sketch uses constrain for the same job.",
    "code": "percent = 107\nsafe = max(0, min(100, percent))\nprint(safe)\nprint(max(0, min(100, -7)))",
    "bullets": null,
    "norun": false,
    "out": "100\n0"
   }
  ],
  "task": "Work out what percentage of 90 readings were bright if 18 were bright, rounded to one decimal.",
  "challenges": [
   "mean3",
   "map_by_hand",
   "share"
  ]
 },
 {
  "id": "04",
  "title": "Decisions with if, elif, else",
  "emoji": "🔀",
  "mins": 5,
  "goal": "Make code choose an action using conditions, as your sketch does.",
  "slides": [
   {
    "h": "Ask a question",
    "say": "A condition is a question with a True or False answer. Comparison symbols are equal equal, not equal, less than, greater than, and the two with equals. Remember one equals stores and two equals asks.",
    "code": "raw = 442\nprint(raw > 500)\nprint(raw == 442)\nprint(raw != 442)",
    "bullets": null,
    "norun": false,
    "out": "False\nTrue\nFalse"
   },
   {
    "h": "if runs code when true",
    "say": "After if comes a condition and a colon. The indented lines only run if the condition is True. The indent is how Python knows which lines belong together.",
    "code": "raw = 688\nif raw > 500:\n    print(\"DARK\")\nprint(\"Done checking\")",
    "bullets": null,
    "norun": false,
    "out": "DARK\nDone checking"
   },
   {
    "h": "elif and else",
    "say": "Elif means else if, and lets you test more than two cases. Python checks from the top and stops at the first true one, so the order matters. This is exactly your light condition chain.",
    "code": "raw = 442\nif raw > 500:\n    print(\"DARK\")\nelif raw > 300:\n    print(\"DIM\")\nelif raw > 100:\n    print(\"BRIGHT\")\nelse:\n    print(\"VERY BRIGHT\")",
    "bullets": null,
    "norun": false,
    "out": "DIM"
   },
   {
    "h": "and, or, not",
    "say": "Combine conditions with and, or and not. And needs both, or needs one, not flips the answer. A valid reading must be at least five and at most one thousand.",
    "code": "raw = 4095\nvalid = raw >= 5 and raw <= 1000\nprint(valid)\nprint(5 <= 688 <= 1000)",
    "bullets": null,
    "norun": false,
    "out": "False\nTrue"
   },
   {
    "h": "Order of tests",
    "say": "If your chain gives the wrong answer, check the order. This code always says small, because the first test is true for almost everything. Put the tightest test first.",
    "code": "x = 50\nif x < 100:\n    print(\"small\")\nelif x < 60:\n    print(\"never reached\")",
    "bullets": null,
    "norun": false,
    "out": "small"
   }
  ],
  "task": "Write the corridor light rule: red below 30 percent, yellow below 60, otherwise green.",
  "challenges": [
   "classify_light",
   "led_colour",
   "is_valid"
  ]
 },
 {
  "id": "05",
  "title": "Loops: go through every reading",
  "emoji": "🔁",
  "mins": 5,
  "goal": "Use for and while loops to process whole datasets.",
  "slides": [
   {
    "h": "Why loops",
    "say": "A dataset has hundreds of readings. You cannot write one line for each. A loop repeats code for every item for you.",
    "code": null,
    "bullets": [
     "for loop: do something for each item",
     "while loop: repeat until a condition changes",
     "break and continue give you control"
    ],
    "norun": false,
    "out": null
   },
   {
    "h": "The for loop",
    "say": "For i in range five runs the indented code five times with i counting from zero. Use two numbers to choose where to start.",
    "code": "for i in range(5):\n    print(\"sample\", i)\nfor n in range(1, 4):\n    print(\"count\", n)",
    "bullets": null,
    "norun": false,
    "out": "sample 0\nsample 1\nsample 2\nsample 3\nsample 4\ncount 1\ncount 2\ncount 3"
   },
   {
    "h": "Looping over a list",
    "say": "A for loop can visit every item in a list directly. This is how you look at each reading in turn.",
    "code": "raws = [688, 442, 325, 30]\nfor raw in raws:\n    print(raw, \"is dark\" if raw > 500 else \"is not dark\")",
    "bullets": null,
    "norun": false,
    "out": "688 is dark\n442 is not dark\n325 is not dark\n30 is not dark"
   },
   {
    "h": "Accumulating",
    "say": "A loop can build an answer. Start with zero and add each value. Divide by how many to get the mean. This is what the mean function does for you.",
    "code": "values = [12, 15, 11, 14]\ntotal = 0\nfor v in values:\n    total += v\nprint(\"total\", total)\nprint(\"mean\", total / len(values))",
    "bullets": null,
    "norun": false,
    "out": "total 52\nmean 13.0"
   },
   {
    "h": "Counting with a condition",
    "say": "Add one to a counter only when a test is true. This counts how many readings were above a threshold, which is a very common data question.",
    "code": "raws = [688, 442, 689, 300, 701]\ndark = 0\nfor raw in raws:\n    if raw > 500:\n        dark += 1\nprint(\"dark readings:\", dark)",
    "bullets": null,
    "norun": false,
    "out": "dark readings: 3"
   },
   {
    "h": "The while loop",
    "say": "A while loop keeps going as long as its condition is true. It is useful when you do not know how many repeats you need. Make sure something changes inside, or it never ends.",
    "code": "total = 0\nn = 0\nwhile total < 50:\n    n += 1\n    total += n\nprint(\"needed\", n, \"numbers to pass 50\")",
    "bullets": null,
    "norun": false,
    "out": "needed 10 numbers to pass 50"
   }
  ],
  "task": "Loop through [688, 442, 4095, 325, 0] and print only the readings that are between 5 and 1000.",
  "challenges": [
   "total",
   "count_above",
   "biggest"
  ]
 },
 {
  "id": "06",
  "title": "Lists: a row of readings",
  "emoji": "📋",
  "mins": 5,
  "goal": "Store many readings, slice them, and filter them with comprehensions.",
  "slides": [
   {
    "h": "A list holds many values",
    "say": "A list is written in square brackets with commas. It is how you store a series of readings. Len tells you how many items there are.",
    "code": "raws = [688, 442, 325, 30, 410]\nprint(raws)\nprint(len(raws))",
    "bullets": null,
    "norun": false,
    "out": "[688, 442, 325, 30, 410]\n5"
   },
   {
    "h": "Indexing and slicing",
    "say": "Python counts positions from zero. A negative index counts from the end. A slice takes a section, and the first number is included but the second is not.",
    "code": "raws = [688, 442, 325, 30, 410]\nprint(raws[0], raws[-1])\nprint(raws[1:4])\nprint(raws[:2])\nprint(raws[::2])",
    "bullets": null,
    "norun": false,
    "out": "688 410\n[442, 325, 30]\n[688, 442]\n[688, 325, 410]"
   },
   {
    "h": "Adding to a list",
    "say": "Append adds an item to the end. This is how a data logger grows as new readings arrive.",
    "code": "log = []\nfor raw in (688, 442, 325):\n    log.append(raw)\nprint(log)\nprint(len(log))",
    "bullets": null,
    "norun": false,
    "out": "[688, 442, 325]\n3"
   },
   {
    "h": "Built-in list functions",
    "say": "Sum, min, max, len and sorted work on whole lists. Sorted gives a new list without changing the original.",
    "code": "raws = [688, 442, 325, 30, 410]\nprint(sum(raws), min(raws), max(raws))\nprint(sum(raws) / len(raws))\nprint(sorted(raws))",
    "bullets": null,
    "norun": false,
    "out": "1895 30 688\n379.0\n[30, 325, 410, 442, 688]"
   },
   {
    "h": "List comprehensions",
    "say": "A comprehension builds a new list in one line. It is a loop and an if packed together. Here we keep only readings in the believable range.",
    "code": "raw = [688, 4095, 442, 0, 325]\ngood = [v for v in raw if 5 <= v <= 1000]\nprint(good)\nscaled = [v / 10 for v in good]\nprint(scaled)",
    "bullets": null,
    "norun": false,
    "out": "[688, 442, 325]\n[68.8, 44.2, 32.5]"
   },
   {
    "h": "Lists of lists",
    "say": "A dataset is a list of rows, and each row is a list. You can loop over rows and pick items out by position.",
    "code": "rows = [[\"15:06:27\", 688, \"DARK\"], [\"15:06:31\", 442, \"DIM\"]]\nfor time, raw, cond in rows:\n    print(time, raw, cond)",
    "bullets": null,
    "norun": false,
    "out": "15:06:27 688 DARK\n15:06:31 442 DIM"
   }
  ],
  "task": "Given [688, 4095, 442, 0, 325] create a cleaned list and print its mean.",
  "challenges": [
   "filter_range",
   "moving_average",
   "every_nth"
  ]
 },
 {
  "id": "07",
  "title": "Strings and serial lines",
  "emoji": "🔤",
  "mins": 5,
  "goal": "Turn a line of text from the Arduino into numbers.",
  "slides": [
   {
    "h": "Strings are text",
    "say": "A string is text in quote marks. You can join strings with plus, repeat with star, and measure with len. Methods like upper, lower and strip clean text up.",
    "code": "word = \"  Dim  \"\nprint(word.strip().upper())\nprint(len(word.strip()))",
    "bullets": null,
    "norun": false,
    "out": "DIM\n3"
   },
   {
    "h": "f-strings build messages",
    "say": "Put the letter f before the quote and write variables in curly brackets. You can even format numbers inside. This is how you print tidy results.",
    "code": "raw = 442\npct = 32.1234\nprint(f\"Raw {raw}, light {pct:.1f}%\")",
    "bullets": null,
    "norun": false,
    "out": "Raw 442, light 32.1%"
   },
   {
    "h": "Splitting text",
    "say": "The split method cuts a string into a list of pieces. Give it the character to cut on. Serial lines from your sketch are cut on the pipe symbol.",
    "code": "line = \"Raw ADC: 420  |  Light %: 35%  |  Condition: DIM\"\nparts = line.split(\"|\")\nprint(parts)\nprint(len(parts))",
    "bullets": null,
    "norun": false,
    "out": "['Raw ADC: 420  ', '  Light %: 35%  ', '  Condition: DIM']\n3"
   },
   {
    "h": "Cleaning each piece",
    "say": "Replace removes a label and strip removes spaces. Then int turns the text into a number. This is exactly what the kit script parse ldr line does.",
    "code": "part = \" Light %: 35% \"\ntext = part.replace(\"Light %:\", \"\").replace(\"%\", \"\").strip()\nprint(repr(text))\nprint(int(text) + 1)",
    "bullets": null,
    "norun": false,
    "out": "'35'\n36"
   },
   {
    "h": "The whole parser",
    "say": "Put it together in a function. If any step fails, the try and except catch the error and the function returns None values, so one damaged line cannot crash your program.",
    "code": "def parse_ldr_line(line):\n    try:\n        p = line.split(\"|\")\n        raw = int(p[0].replace(\"Raw ADC:\", \"\").strip())\n        pct = int(p[1].replace(\"Light %:\", \"\").replace(\"%\", \"\").strip())\n        cond = p[2].replace(\"Condition:\", \"\").strip().split(\"(\")[0].strip()\n        return raw, pct, cond\n    except (ValueError, IndexError):\n        return None, None, None\n\nprint(parse_ldr_line(\"Raw ADC: 420  |  Light %: 35%  |  Condition: DIM (x)\"))\nprint(parse_ldr_line(\"garbage\"))",
    "bullets": null,
    "norun": false,
    "out": "(420, 35, 'DIM')\n(None, None, None)"
   }
  ],
  "task": "Write parse_ldr_line for a line of your own sensor and test it on two good lines and one damaged line.",
  "challenges": [
   "parse_line",
   "split_csv_row",
   "clean_text"
  ]
 },
 {
  "id": "08",
  "title": "Dictionaries: label your data",
  "emoji": "🗂️",
  "mins": 5,
  "goal": "Use keys to label values and to count categories.",
  "slides": [
   {
    "h": "A dictionary has keys",
    "say": "A list finds items by position. A dictionary finds them by name, called a key. Use one when each value has a meaning, like one row of sensor data.",
    "code": "row = {\"time\": \"15:06:27\", \"raw\": 688, \"cond\": \"DARK\"}\nprint(row[\"raw\"])\nprint(row[\"cond\"])",
    "bullets": null,
    "norun": false,
    "out": "688\nDARK"
   },
   {
    "h": "Changing a dictionary",
    "say": "Assign to a key to add or change a value. The get method gives a safe default when a key is missing, so your program does not crash.",
    "code": "row = {\"raw\": 688}\nrow[\"percent\"] = 0\nprint(row)\nprint(row.get(\"colour\", \"unknown\"))",
    "bullets": null,
    "norun": false,
    "out": "{'raw': 688, 'percent': 0}\nunknown"
   },
   {
    "h": "Looping over a dictionary",
    "say": "Items gives you each key and value together. This lets you report on every category in turn.",
    "code": "counts = {\"DARK\": 27, \"DIM\": 22, \"BRIGHT\": 38}\nfor cond, n in counts.items():\n    print(cond, n)",
    "bullets": null,
    "norun": false,
    "out": "DARK 27\nDIM 22\nBRIGHT 38"
   },
   {
    "h": "Counting with a dictionary",
    "say": "The most useful data pattern. Go through the readings, and add one to the count for each category. The get method starts a missing key at zero.",
    "code": "readings = [\"DARK\", \"DIM\", \"DARK\", \"BRIGHT\", \"DARK\"]\ncounts = {}\nfor r in readings:\n    counts[r] = counts.get(r, 0) + 1\nprint(counts)",
    "bullets": null,
    "norun": false,
    "out": "{'DARK': 3, 'DIM': 1, 'BRIGHT': 1}"
   },
   {
    "h": "Percent share",
    "say": "Divide each count by the total to get the share of each category. A dictionary comprehension builds the answer in one line.",
    "code": "counts = {\"DARK\": 3, \"DIM\": 1}\ntotal = sum(counts.values())\nshare = {k: round(v / total * 100, 1) for k, v in counts.items()}\nprint(share)",
    "bullets": null,
    "norun": false,
    "out": "{'DARK': 75.0, 'DIM': 25.0}"
   },
   {
    "h": "A dataset as dictionaries",
    "say": "Libraries like pandas treat each row like a dictionary. If you can work with a list of dictionaries, you already understand a dataframe.",
    "code": "rows = [\n    {\"raw\": 688, \"cond\": \"DARK\"},\n    {\"raw\": 442, \"cond\": \"DIM\"},\n    {\"raw\": 690, \"cond\": \"DARK\"},\n]\ndark = [r[\"raw\"] for r in rows if r[\"cond\"] == \"DARK\"]\nprint(dark)",
    "bullets": null,
    "norun": false,
    "out": "[688, 690]"
   }
  ],
  "task": "Count how many times each word appears in 'DARK DIM DARK BRIGHT DARK DIM' and print the most common.",
  "challenges": [
   "count_conditions",
   "most_common",
   "percent_share"
  ]
 },
 {
  "id": "09",
  "title": "Functions: reusable steps",
  "emoji": "🧩",
  "mins": 6,
  "goal": "Package your cleaning and analysis steps into functions.",
  "slides": [
   {
    "h": "Write once, use many times",
    "say": "A function is a named block of code. You define it with def and call it by name. Functions make programs shorter and easier to fix.",
    "code": "def say_ready():\n    print(\"Sensor ready\")\n\nsay_ready()\nsay_ready()",
    "bullets": null,
    "norun": false,
    "out": "Sensor ready\nSensor ready"
   },
   {
    "h": "Parameters",
    "say": "Parameters are inputs. Put them in the brackets when you define the function. When you call it, give the actual values.",
    "code": "def percent(raw, low=650):\n    return int((raw - low) * 100 / (0 - low))\n\nprint(percent(325))\nprint(percent(400, 800))",
    "bullets": null,
    "norun": false,
    "out": "50\n50"
   },
   {
    "h": "Return gives an answer back",
    "say": "Print only shows something. Return hands a value back so you can store it and use it later. A function stops as soon as it returns.",
    "code": "def is_valid(raw):\n    return 5 <= raw <= 1000\n\nprint(is_valid(688))\nprint(is_valid(4095))\nreadings = [688, 4095, 442]\nprint([r for r in readings if is_valid(r)])",
    "bullets": null,
    "norun": false,
    "out": "True\nFalse\n[688, 442]"
   },
   {
    "h": "Functions that decide",
    "say": "Functions can contain if statements and return different answers. Each function does one clear job, which makes it easy to test.",
    "code": "def classify(raw):\n    if raw > 500:\n        return \"DARK\"\n    elif raw > 300:\n        return \"DIM\"\n    return \"BRIGHT\"\n\nfor r in (688, 442, 120):\n    print(r, classify(r))",
    "bullets": null,
    "norun": false,
    "out": "688 DARK\n442 DIM\n120 BRIGHT"
   },
   {
    "h": "Small functions build big programs",
    "say": "A cleaning pipeline is made of small functions that call each other. Each one can be tested on its own. That is decomposition, and it is part of your plan in Criterion C.",
    "code": "def keep(values, low, high):\n    return [v for v in values if low <= v <= high]\n\ndef average(values):\n    return round(sum(values) / len(values), 1)\n\nraw = [688, 4095, 686, 0, 442]\nprint(average(keep(raw, 5, 1000)))",
    "bullets": null,
    "norun": false,
    "out": "605.3"
   },
   {
    "h": "Test your functions",
    "say": "An assert checks that a function gives the answer you expect. If it does not, Python stops and tells you. Write asserts for the normal case and for the edge cases.",
    "code": "def clamp(v, lo, hi):\n    return max(lo, min(hi, v))\n\nassert clamp(150, 0, 100) == 100\nassert clamp(-5, 0, 100) == 0\nassert clamp(50, 0, 100) == 50\nprint(\"all tests pass\")",
    "bullets": null,
    "norun": false,
    "out": "all tests pass"
   }
  ],
  "task": "Write a function percent_share(count, total) and test it on three examples including total zero.",
  "challenges": [
   "is_valid",
   "classify_light",
   "mean"
  ]
 },
 {
  "id": "10",
  "title": "Statistics: mean, median, spread",
  "emoji": "📊",
  "mins": 6,
  "goal": "Summarise a dataset with mean, median, range and standard deviation.",
  "slides": [
   {
    "h": "Centre and spread",
    "say": "Two numbers describe most data. The centre says what is typical. The spread says how much it varies. You need both to tell the story of a sensor.",
    "code": null,
    "bullets": [
     "Mean and median describe the centre",
     "Range and standard deviation describe the spread",
     "A big gap between mean and median warns of outliers"
    ],
    "norun": false,
    "out": null
   },
   {
    "h": "Mean and median",
    "say": "The mean is the total divided by how many. The median is the middle value after sorting. One huge glitch drags the mean but barely moves the median.",
    "code": "import statistics\nraw = [51, 50, 250, 52, 49]\nprint(\"mean\", sum(raw) / len(raw))\nprint(\"median\", statistics.median(raw))",
    "bullets": null,
    "norun": false,
    "out": "mean 90.4\nmedian 51"
   },
   {
    "h": "Range",
    "say": "The range is the biggest value minus the smallest. It is easy to calculate but one glitch ruins it, so use it with clean data.",
    "code": "raw = [51, 50, 52, 49, 53]\nprint(min(raw), max(raw))\nprint(\"range\", max(raw) - min(raw))",
    "bullets": null,
    "norun": false,
    "out": "49 53\nrange 4"
   },
   {
    "h": "Standard deviation",
    "say": "Standard deviation measures the typical distance from the mean. A small value means steady readings. The statistics module calculates the sample version, which is the one pandas uses.",
    "code": "import statistics\nsteady = [50, 51, 50, 49, 50]\nnoisy = [30, 70, 45, 60, 20]\nprint(round(statistics.stdev(steady), 2))\nprint(round(statistics.stdev(noisy), 2))",
    "bullets": null,
    "norun": false,
    "out": "0.71\n20.62"
   },
   {
    "h": "Z-scores",
    "say": "A z-score says how many standard deviations a value is from the mean. A value with a z-score above three is a very unusual reading, and is a candidate to remove as an outlier.",
    "code": "import statistics\nvalues = [50] * 10 + [51] * 10 + [400]\nm = statistics.mean(values)\nsd = statistics.stdev(values)\nprint(round((400 - m) / sd, 2))\nprint(round((50 - m) / sd, 2))",
    "bullets": null,
    "norun": false,
    "out": "4.36\n-0.22"
   },
   {
    "h": "A summary function",
    "say": "Put it all together in one function that returns a dictionary. This is the same information as the describe method in pandas.",
    "code": "import statistics\n\ndef summary(values):\n    return {\n        \"count\": len(values),\n        \"mean\": round(statistics.mean(values), 2),\n        \"median\": statistics.median(values),\n        \"std\": round(statistics.stdev(values), 2),\n        \"min\": min(values),\n        \"max\": max(values),\n    }\n\nprint(summary([688, 686, 442, 325, 690]))",
    "bullets": null,
    "norun": false,
    "out": "{'count': 5, 'mean': 566.2, 'median': 686, 'std': 171.84, 'min': 325, 'max': 690}"
   }
  ],
  "task": "Calculate the mean, median and standard deviation of a list of ten readings you collected, and say what they tell you.",
  "challenges": [
   "median",
   "std_dev",
   "z_scores",
   "summarise"
  ]
 },
 {
  "id": "11",
  "title": "Cleaning sensor data",
  "emoji": "🧹",
  "mins": 7,
  "goal": "Remove faults, fill gaps and smooth noise so the data can be trusted.",
  "slides": [
   {
    "h": "Why clean",
    "say": "Real sensors give faults. A loose wire makes the pin float to zero or to the top of the range. A garbled line gives text instead of a number. If you analyse dirty data you get a wrong answer, so cleaning comes first.",
    "code": null,
    "bullets": [
     "Drop missing and garbled rows",
     "Remove impossible values",
     "Remove statistical outliers",
     "Smooth the noise"
    ],
    "norun": false,
    "out": null
   },
   {
    "h": "Drop bad rows",
    "say": "Check every row for a missing value or text where a number should be. Keep only the rows that pass. A helper function that returns None on failure makes this simple.",
    "code": "def to_number(x):\n    try:\n        return float(x)\n    except (TypeError, ValueError):\n        return None\n\nraw = [688, \"ERR\", 442, None, \"\", 325]\nnumbers = [to_number(x) for x in raw]\nprint(numbers)\nprint([n for n in numbers if n is not None])",
    "bullets": null,
    "norun": false,
    "out": "[688.0, None, 442.0, None, None, 325.0]\n[688.0, 442.0, 325.0]"
   },
   {
    "h": "Impossible values",
    "say": "Your sensor can only produce values in a certain range. Anything outside it is a fault. A floating pin gives zero or four thousand and ninety five, so reject anything outside five to one thousand.",
    "code": "raw = [688, 4095, 686, 0, 442, 689, 4095]\nLOW_OK, HIGH_OK = 5, 1000\ngood = [v for v in raw if LOW_OK <= v <= HIGH_OK]\nprint(good)\nprint(\"removed\", len(raw) - len(good))",
    "bullets": null,
    "norun": false,
    "out": "[688, 686, 442, 689]\nremoved 3"
   },
   {
    "h": "Statistical outliers",
    "say": "After the range filter, a few strange values may remain. A z-score of three or more is very unusual, so remove those rows. Always say how many rows you removed and why.",
    "code": "import statistics\nraw = [50, 51, 49, 50, 52, 50, 51, 49, 50, 51, 50, 49, 52, 300]\nm, sd = statistics.mean(raw), statistics.stdev(raw)\nkept = [v for v in raw if abs((v - m) / sd) < 3]\nprint(kept)\nprint(\"removed\", len(raw) - len(kept))",
    "bullets": null,
    "norun": false,
    "out": "[50, 51, 49, 50, 52, 50, 51, 49, 50, 51, 50, 49, 52]\nremoved 1"
   },
   {
    "h": "Fill small gaps",
    "say": "If a few readings are missing in a time series, you can carry the last good value forward. Only do this for short gaps, and always note that you did it in your report.",
    "code": "def fill_gaps(values):\n    out, last = [], None\n    for v in values:\n        if v is None:\n            out.append(last)\n        else:\n            out.append(v)\n            last = v\n    return out\n\nprint(fill_gaps([5, None, None, 7, None]))",
    "bullets": null,
    "norun": false,
    "out": "[5, 5, 5, 7, 7]"
   },
   {
    "h": "Smooth with a moving average",
    "say": "A moving average replaces each value with the mean of the last few. It hides small jumps and shows the trend. A bigger window is smoother but slower to react.",
    "code": "def moving_average(values, window=5):\n    out = []\n    for i in range(len(values)):\n        part = values[max(0, i - window + 1): i + 1]\n        out.append(round(sum(part) / len(part), 1))\n    return out\n\nprint(moving_average([10, 12, 40, 11, 10, 12], 3))",
    "bullets": null,
    "norun": false,
    "out": "[10.0, 11.0, 20.7, 21.0, 20.3, 11.0]"
   },
   {
    "h": "Record what you did",
    "say": "Cleaning changes your data, so record each step. Say what you removed, how many rows, and why. That is the evidence your Criterion C log and your Criterion D evaluation will need.",
    "code": "before = 100\nafter_range = 91\nafter_zscore = 90\nprint(\"range filter removed\", before - after_range)\nprint(\"z-score removed\", after_range - after_zscore)\nprint(\"kept\", after_zscore, \"of\", before)",
    "bullets": null,
    "norun": false,
    "out": "range filter removed 9\nz-score removed 1\nkept 90 of 100"
   }
  ],
  "task": "Clean your own dataset in the Python data lab, and write down how many rows each step removed.",
  "challenges": [
   "filter_range",
   "remove_outliers",
   "fill_gaps",
   "drop_missing"
  ]
 },
 {
  "id": "12",
  "title": "CSV files and the serial port",
  "emoji": "💾",
  "mins": 6,
  "goal": "Read and write CSV text and understand how data travels from the sensor to Python.",
  "slides": [
   {
    "h": "From sensor to spreadsheet",
    "say": "Your data travels in four steps. The sensor sends a voltage, the ESP32 turns it into a number and prints a line, Python reads the line, and then writes it to a CSV file. Each step can go wrong, so you test each one.",
    "code": null,
    "bullets": [
     "Sensor, then ESP32 analogRead",
     "Serial line over USB at 9600 baud",
     "Python parses the line",
     "CSV file stores the rows"
    ],
    "norun": false,
    "out": null
   },
   {
    "h": "What a CSV looks like",
    "say": "CSV means comma separated values. The first line is the header. Every other line is one row with values separated by commas. Any spreadsheet can open it.",
    "code": "text = \"\"\"Timestamp,Raw_ADC,Light_Percent,Condition\n15:06:27,688,0,DARK\n15:06:31,442,32,DIM\n\"\"\"\nfor line in text.strip().splitlines():\n    print(line.split(\",\"))",
    "bullets": null,
    "norun": false,
    "out": "['Timestamp', 'Raw_ADC', 'Light_Percent', 'Condition']\n['15:06:27', '688', '0', 'DARK']\n['15:06:31', '442', '32', 'DIM']"
   },
   {
    "h": "Turn rows into dictionaries",
    "say": "Zip the header with each row to build a dictionary per row. Now you can use the column names instead of positions. This is what pandas does for you.",
    "code": "text = \"A,B\\n1,2\\n3,4\"\nlines = text.splitlines()\nheader = lines[0].split(\",\")\nrows = [dict(zip(header, l.split(\",\"))) for l in lines[1:]]\nprint(rows)",
    "bullets": null,
    "norun": false,
    "out": "[{'A': '1', 'B': '2'}, {'A': '3', 'B': '4'}]"
   },
   {
    "h": "The csv module",
    "say": "Python has a csv module that handles awkward cases like commas inside quotes. It can read from any text source, including the file on your computer.",
    "code": "import csv, io\ntext = \"Raw_ADC,Condition\\n688,DARK\\n442,DIM\\n\"\nfor row in csv.DictReader(io.StringIO(text)):\n    print(row[\"Condition\"], int(row[\"Raw_ADC\"]) > 500)",
    "bullets": null,
    "norun": false,
    "out": "DARK True\nDIM False"
   },
   {
    "h": "Reading the serial port",
    "say": "On your computer, the pyserial library opens the port. Each readline gives one line of text. This code needs your real board plugged in, so it cannot run on this page. Study it and compare it with your kit script.",
    "code": "import serial\n\nser = serial.Serial(\"COM5\", 9600, timeout=2)\nfor _ in range(100):\n    line = ser.readline().decode(\"utf-8\", errors=\"ignore\").strip()\n    if \"Raw ADC:\" in line:\n        print(line)\nser.close()",
    "bullets": null,
    "norun": true,
    "out": null
   },
   {
    "h": "Writing a CSV file",
    "say": "Write the header once, then one row per reading. The with statement closes the file for you. This also needs your computer, so just read it carefully here.",
    "code": "import csv\n\nwith open(\"ldr_light_data.csv\", \"w\", newline=\"\") as f:\n    writer = csv.writer(f)\n    writer.writerow([\"Timestamp\", \"Raw_ADC\", \"Light_Percent\", \"Condition\"])\n    writer.writerow([\"15:06:27\", 688, 0, \"DARK\"])",
    "bullets": null,
    "norun": true,
    "out": null
   }
  ],
  "task": "Download the CSV from Lab 1, open it in a spreadsheet, and list the four column names and their data types.",
  "challenges": [
   "csv_to_dicts",
   "split_csv_row",
   "parse_line"
  ]
 },
 {
  "id": "13",
  "title": "Charts that tell the truth",
  "emoji": "📈",
  "mins": 5,
  "goal": "Choose the right chart for your data and read it carefully.",
  "slides": [
   {
    "h": "Pick the chart for the question",
    "say": "Different questions need different charts. A line chart shows change over time. A bar chart compares categories. A histogram shows how values are spread. A box plot compares spread between groups.",
    "code": null,
    "bullets": [
     "Over time: line chart",
     "Counting categories: bar chart",
     "Spread of values: histogram",
     "Spread by group: box plot"
    ],
    "norun": false,
    "out": null
   },
   {
    "h": "Counting for a bar chart",
    "say": "Before you chart, count. A dictionary of counts is the data behind every bar chart. Here we count and then draw a simple text chart, which is a good way to check your numbers.",
    "code": "counts = {\"DARK\": 27, \"DIM\": 22, \"BRIGHT\": 38, \"VERY BRIGHT\": 6}\nfor cond, n in counts.items():\n    print(f\"{cond:<12} {'#' * n} {n}\")",
    "bullets": null,
    "norun": false,
    "out": "DARK         ########################### 27\nDIM          ###################### 22\nBRIGHT       ###################################### 38\nVERY BRIGHT  ###### 6"
   },
   {
    "h": "Bins for a histogram",
    "say": "A histogram counts how many values fall in each bin. Divide the range into equal bins and count. The shape tells you if the data is steady, spread out, or has two peaks.",
    "code": "values = [5, 12, 18, 33, 35, 36, 41, 58, 62, 64, 71, 90]\nbins = [0] * 10\nfor v in values:\n    bins[min(9, v // 10)] += 1\nfor i, n in enumerate(bins):\n    print(f\"{i * 10:>3}-{i * 10 + 9:<3} {'*' * n}\")",
    "bullets": null,
    "norun": false,
    "out": "  0-9   *\n 10-19  **\n 20-29  \n 30-39  ***\n 40-49  *\n 50-59  *\n 60-69  **\n 70-79  *\n 80-89  \n 90-99  *"
   },
   {
    "h": "Moving average on a line chart",
    "say": "A line chart of raw readings is jagged. Plotting the moving average on top shows the trend. Always label both lines so the reader can tell them apart.",
    "code": "raw = [10, 12, 40, 11, 10, 12, 13, 45, 12]\nwindow = 3\nfor i, v in enumerate(raw):\n    part = raw[max(0, i - window + 1): i + 1]\n    print(f\"{v:>3}  avg {sum(part) / len(part):5.1f}\")",
    "bullets": null,
    "norun": false,
    "out": " 10  avg  10.0\n 12  avg  11.0\n 40  avg  20.7\n 11  avg  21.0\n 10  avg  20.3\n 12  avg  11.0\n 13  avg  11.7\n 45  avg  23.3\n 12  avg  23.3"
   },
   {
    "h": "The matplotlib version",
    "say": "In a normal Python install you would draw the chart with matplotlib. This page cannot run it, but your lab figures are drawn for you from your own cleaned data. Notice the title, labels and legend, which every figure needs.",
    "code": "import matplotlib.pyplot as plt\n\nplt.plot(light_percent, label=\"Light %\")\nplt.plot(moving_avg, linestyle=\"--\", label=\"5-sample average\")\nplt.title(\"Figure 1: Light over time\")\nplt.xlabel(\"Sample number\")\nplt.ylabel(\"Light intensity (%)\")\nplt.legend()\nplt.savefig(\"chart1.png\", dpi=300)",
    "bullets": null,
    "norun": true,
    "out": null
   },
   {
    "h": "Describe what you see",
    "say": "A chart needs words. Say what the chart shows, point to one specific number, and explain what it means for your design. That is what separates a picture from evidence.",
    "code": "peak = 97\nlowest = 0\nprint(f\"Light reached {peak}% at midday and fell to {lowest}% at night,\")\nprint(\"so the corridor lights should switch on below about 30%.\")",
    "bullets": null,
    "norun": false,
    "out": "Light reached 97% at midday and fell to 0% at night,\nso the corridor lights should switch on below about 30%."
   }
  ],
  "task": "Look at Figure 2 in Lab 2 and write two sentences that describe it using real numbers from the chart.",
  "challenges": [
   "count_conditions",
   "percent_share",
   "moving_average"
  ]
 },
 {
  "id": "14",
  "title": "Errors and debugging",
  "emoji": "🐞",
  "mins": 6,
  "goal": "Read error messages, find bugs, and make code safe with try and except.",
  "slides": [
   {
    "h": "Errors are clues",
    "say": "When Python stops with a message, do not panic. Read the last line for the kind of error, and the line above for where it happened. The most common errors are syntax, name and type errors.",
    "code": "print(raw)",
    "bullets": null,
    "norun": false,
    "out": "NameError: name 'raw' is not defined (line 1)"
   },
   {
    "h": "Name and type errors",
    "say": "A name error means a variable does not exist, often a typo. A type error means mixed types, like adding text to a number. Convert with int or str to fix it.",
    "code": "raw = 442\nprint(\"Raw is \" + raw)",
    "bullets": null,
    "norun": false,
    "out": "TypeError: can only concatenate str (not \"int\") to str (line 2)"
   },
   {
    "h": "Logic errors",
    "say": "The worst bugs give no message at all. The code runs but the answer is wrong. Print values inside the loop to see what is really happening.",
    "code": "values = [10, 20, 30]\ntotal = 0\nfor v in values:\n    total = v\nprint(\"mean\", total / len(values))",
    "bullets": null,
    "norun": false,
    "out": "mean 10.0"
   },
   {
    "h": "Debug with print",
    "say": "Add a print inside the loop to watch the variable change. The problem shows up at once. Remove the extra prints when it works.",
    "code": "values = [10, 20, 30]\ntotal = 0\nfor v in values:\n    total += v\n    print(\"after\", v, \"total is\", total)\nprint(\"mean\", total / len(values))",
    "bullets": null,
    "norun": false,
    "out": "after 10 total is 10\nafter 20 total is 30\nafter 30 total is 60\nmean 20.0"
   },
   {
    "h": "try and except",
    "say": "Some errors you cannot prevent, like a damaged serial line. Put risky code in a try block. If it fails, the except block runs instead of crashing the program.",
    "code": "def safe_int(text):\n    try:\n        return int(text)\n    except ValueError:\n        return None\n\nprint(safe_int(\"442\"))\nprint(safe_int(\"ERR\"))\nprint(safe_int(\"\"))",
    "bullets": null,
    "norun": false,
    "out": "442\nNone\nNone"
   },
   {
    "h": "Test the edge cases",
    "say": "Test with an empty list, one item, and bad values. Most bugs hide at the edges. A function that works on normal data but crashes on an empty list is not finished.",
    "code": "def mean(values):\n    if not values:\n        return None\n    return sum(values) / len(values)\n\nprint(mean([2, 4, 6]))\nprint(mean([5]))\nprint(mean([]))",
    "bullets": null,
    "norun": false,
    "out": "4.0\n5.0\nNone"
   }
  ],
  "task": "Find and fix the bug in a function meant to return the largest reading but returns the first.",
  "challenges": [
   "parse_line",
   "drop_missing",
   "debounce"
  ]
 },
 {
  "id": "15",
  "title": "Putting it together: your data pipeline",
  "emoji": "🏗️",
  "mins": 7,
  "goal": "Combine collecting, cleaning, analysing and charting into one program.",
  "slides": [
   {
    "h": "The four stages",
    "say": "Every data project follows the same four stages. Collect the raw data, clean it, analyse it, and then show it. If you build each stage as a function, you can test each one, and swap in new data without changing anything else.",
    "code": null,
    "bullets": [
     "collect: read the lines",
     "clean: remove faults",
     "analyse: find the statistics",
     "show: chart and explain"
    ],
    "norun": false,
    "out": null
   },
   {
    "h": "Stage 1: collect",
    "say": "Here the lines are in a list so the code can run on this page. On your computer the lines would come from the serial port. The parse function turns each line into a tuple, or None values if it is damaged.",
    "code": "lines = [\n    \"Raw ADC: 688  |  Light %: 0%  |  Condition: DARK (x)\",\n    \"Raw ADC: 442  |  Light %: 32%  |  Condition: DIM (x)\",\n    \"garbled ???\",\n    \"Raw ADC: 4095  |  Light %: 0%  |  Condition: DARK (x)\",\n    \"Raw ADC: 30  |  Light %: 95%  |  Condition: VERY BRIGHT (x)\",\n]\n\ndef parse(line):\n    try:\n        p = line.split(\"|\")\n        return (int(p[0].replace(\"Raw ADC:\", \"\")),\n                int(p[1].replace(\"Light %:\", \"\").replace(\"%\", \"\")),\n                p[2].replace(\"Condition:\", \"\").split(\"(\")[0].strip())\n    except (ValueError, IndexError):\n        return None\n\nparsed = [parse(l) for l in lines]\nprint(parsed)",
    "bullets": null,
    "norun": false,
    "out": "[(688, 0, 'DARK'), (442, 32, 'DIM'), None, (4095, 0, 'DARK'), (30, 95, 'VERY BRIGHT')]"
   },
   {
    "h": "Stage 2: clean",
    "say": "Drop the damaged rows and the impossible readings. The output is a list of tuples you can trust. Count what you removed so you can report it.",
    "code": "parsed = [(688, 0, \"DARK\"), (442, 32, \"DIM\"), None, (4095, 0, \"DARK\"), (30, 95, \"VERY BRIGHT\")]\nclean = [r for r in parsed if r is not None and 5 <= r[0] <= 1000]\nprint(clean)\nprint(\"removed\", len(parsed) - len(clean))",
    "bullets": null,
    "norun": false,
    "out": "[(688, 0, 'DARK'), (442, 32, 'DIM'), (30, 95, 'VERY BRIGHT')]\nremoved 2"
   },
   {
    "h": "Stage 3: analyse",
    "say": "Now calculate the numbers that answer your question. Mean light, the share of each condition, and how often it was dark. Keep the results in a dictionary so the next stage can use them.",
    "code": "clean = [(688, 0, \"DARK\"), (442, 32, \"DIM\"), (30, 95, \"VERY BRIGHT\")]\npcts = [r[1] for r in clean]\ncounts = {}\nfor _, _, c in clean:\n    counts[c] = counts.get(c, 0) + 1\nresult = {\"mean_pct\": round(sum(pcts) / len(pcts), 1), \"counts\": counts}\nprint(result)",
    "bullets": null,
    "norun": false,
    "out": "{'mean_pct': 42.3, 'counts': {'DARK': 1, 'DIM': 1, 'VERY BRIGHT': 1}}"
   },
   {
    "h": "Stage 4: show and explain",
    "say": "Report the findings in words with numbers. Then decide what it means for your design. Here the data supports lights switching on when the light is below about thirty percent. Your Criterion D evaluation makes exactly this kind of link.",
    "code": "result = {\"mean_pct\": 42.3, \"counts\": {\"DARK\": 1, \"DIM\": 1, \"VERY BRIGHT\": 1}}\nprint(f\"Average light was {result['mean_pct']}%.\")\nprint(\"Dark readings:\", result[\"counts\"][\"DARK\"], \"of 3\")\nprint(\"Decision: switch the corridor lights on below 30%.\")",
    "bullets": null,
    "norun": false,
    "out": "Average light was 42.3%.\nDark readings: 1 of 3\nDecision: switch the corridor lights on below 30%."
   },
   {
    "h": "Plan your own project",
    "say": "Before you code, write the plan. What question are you answering, which sensor and how many readings, what could go wrong, and how will you test each stage. Then build one stage at a time and record evidence. That is Criterion C.",
    "code": null,
    "bullets": [
     "1. Question and sensor",
     "2. Plan the four stages",
     "3. Test each stage on its own",
     "4. Record evidence and changes"
    ],
    "norun": false,
    "out": null
   }
  ],
  "task": "Take your own CSV from Lab 1 through all four stages in Lab 2 and write one sentence about your design decision.",
  "challenges": [
   "pipeline",
   "summarise",
   "count_events",
   "logger"
  ]
 },
 {
  "id": "16",
  "title": "How the Daylight Tracker works",
  "emoji": "☀️",
  "mins": 6,
  "goal": "Follow the light from the sun to the LDR, the raw number, the label and the percent, and see why the diffuser lip matters.",
  "slides": [
   {
    "h": "A post that measures daylight",
    "say": "School corridors and car parks in the UAE often keep their lights on all day because nobody measures the daylight. Your Sun-Tracker Post from Criterion B fixes that. A light sensor reads the sky, the ESP32 turns it into a number, and Python turns the numbers into a story.",
    "code": null,
    "bullets": [
     "The LDR senses the light",
     "The ESP32 reads it on pin 36",
     "The Serial Monitor prints it",
     "Python cleans, tests and reports it"
    ],
    "norun": false,
    "out": null
   },
   {
    "h": "The LDR is inverted in your kit",
    "say": "An LDR is a light dependent resistor. In your kit a low raw reading means bright light and a high raw reading means dark. A covered sensor reads about 688. The ADC turns the voltage into a number from 0 to 4095, so the sketch has to flip the scale before it can report a percent.",
    "code": null,
    "bullets": [
     "Covered sensor: raw about 688",
     "Room lights: raw about 200 to 300",
     "Direct sun: raw under 100",
     "ADC range: 0 to 4095"
    ],
    "norun": false,
    "out": null
   },
   {
    "h": "From a raw number to a label",
    "say": "Your sketch uses an if and else if chain. It tests the biggest number first. Here is the same rule in Python. Press run and change the raw readings to see each band.",
    "code": "def label(raw):\n    if raw > 500:\n        return \"DARK\"\n    elif raw > 300:\n        return \"DIM\"\n    elif raw > 100:\n        return \"BRIGHT\"\n    return \"VERY BRIGHT\"\n\nfor raw in [688, 420, 250, 60]:\n    print(raw, label(raw))",
    "bullets": null,
    "norun": false,
    "out": "688 DARK\n420 DIM\n250 BRIGHT\n60 VERY BRIGHT"
   },
   {
    "h": "From a raw number to a percent",
    "say": "The Arduino map function rescales 650 down to 0 onto 0 up to 100, and constrain keeps the answer inside that range. Arduino works in whole numbers, so Python needs int. A raw reading of 325 is halfway, so the post reports 50 percent.",
    "code": "def light_percent(raw):\n    value = int((raw - 650) * 100 / (0 - 650))\n    return max(0, min(100, value))\n\nfor raw in [688, 325, 130, 0]:\n    print(raw, light_percent(raw), \"%\")",
    "bullets": null,
    "norun": false,
    "out": "688 0 %\n325 50 %\n130 80 %\n0 100 %"
   },
   {
    "h": "Why the post has a diffuser lip",
    "say": "Strong sun shines straight on a bare sensor and makes it over-read, so a bright sky can look very bright. Here is a simple model. At 70 percent light, the sensor without a lip sees 95 percent, but with the lip it sees the true 70. That is the evidence behind your C4 design change.",
    "code": "def reading(light, lip):\n    seen = light\n    if light > 60 and not lip:\n        seen = min(96, light + 25)\n    return round(690 * (1 - seen / 100))\n\nfor light in [30, 70]:\n    print(light, \"% no lip:\", reading(light, False), \"lip:\", reading(light, True))",
    "bullets": null,
    "norun": false,
    "out": "30 % no lip: 483 lip: 483\n70 % no lip: 35 lip: 207"
   },
   {
    "h": "What you will test",
    "say": "Criterion B gave you specification 7.1: fewer than 2 wrong readings in a day. In Lab 1 you fit the lip and run the 12 spec checks. In Lab 2 you check two model days of data with Python. Write what you find in your C3 log and justify the lip in C4.",
    "code": null,
    "bullets": [
     "B1 7.1: fewer than 2 wrong readings",
     "B1 7.2: clear view over 120 degrees",
     "C3: log the test with an image",
     "C4: justify the lip with numbers"
    ],
    "norun": false,
    "out": null
   }
  ],
  "task": "In Lab 1, run the 12 spec checks with and without the diffuser lip and write two sentences that compare the wrong counts.",
  "challenges": [
   "day_label",
   "day_percent",
   "day_lights"
  ]
 },
 {
  "id": "17",
  "title": "Day or night? Thresholds from data",
  "emoji": "🌗",
  "mins": 6,
  "goal": "Choose the three light thresholds from evidence and count wrong labels to test B1 spec 7.1.",
  "slides": [
   {
    "h": "Three numbers decide everything",
    "say": "The post uses three numbers: 500, 300 and 100. They decide where DARK, DIM, BRIGHT and VERY BRIGHT begin. The kit chose them as a starting point. A good designer checks them against real readings and a trusted reference, such as a phone light app.",
    "code": null,
    "bullets": [
     "DARK above 500",
     "DIM above 300",
     "BRIGHT above 100",
     "Check them against a reference"
    ],
    "norun": false,
    "out": null
   },
   {
    "h": "Give the thresholds as inputs",
    "say": "If the three numbers are inputs, you can test other values without rewriting the rule. These are called default arguments. Run it and compare the kit numbers with calibrated ones.",
    "code": "def label(raw, dark=500, dim=300, bright=100):\n    if raw > dark:\n        return \"DARK\"\n    elif raw > dim:\n        return \"DIM\"\n    elif raw > bright:\n        return \"BRIGHT\"\n    return \"VERY BRIGHT\"\n\nprint(label(595))\nprint(label(595, 620, 410, 170))",
    "bullets": null,
    "norun": false,
    "out": "DARK\nDIM"
   },
   {
    "h": "Median beats mean for sensor data",
    "say": "A single spike drags the mean towards it, but the median stays in the middle. That makes the median a safer way to describe a condition. Here a loose wire adds one reading of 150.",
    "code": "import statistics\n\nraw = [688, 690, 686, 150, 689]\nprint(\"mean  :\", round(statistics.mean(raw)))\nprint(\"median:\", statistics.median(raw))",
    "bullets": null,
    "norun": false,
    "out": "mean  : 581\nmedian: 688"
   },
   {
    "h": "A threshold halfway between two conditions",
    "say": "To place a threshold, take the median raw reading of two neighbouring conditions and find the number halfway between them. Here DARK readings sit near 688 and DIM readings near 440.",
    "code": "import statistics\n\ndef midpoint(a, b):\n    return round((statistics.median(a) + statistics.median(b)) / 2)\n\ndark = [688, 690, 686]\ndim = [440, 430, 450]\nprint(midpoint(dark, dim))",
    "bullets": null,
    "norun": false,
    "out": "564"
   },
   {
    "h": "Count the wrong labels",
    "say": "Specification 7.1 allows fewer than 2 wrong readings in a day. Compare the label the post gives with the true label from the phone app at each check, and count the differences. Use zip to walk through both lists together.",
    "code": "def label(raw, dark=500, dim=300, bright=100):\n    if raw > dark:\n        return \"DARK\"\n    elif raw > dim:\n        return \"DIM\"\n    elif raw > bright:\n        return \"BRIGHT\"\n    return \"VERY BRIGHT\"\n\nraws = [688, 467, 288, 601]\nrefs = [\"DARK\", \"DIM\", \"BRIGHT\", \"DIM\"]\nwrong = 0\nfor raw, ref in zip(raws, refs):\n    if label(raw) != ref:\n        wrong += 1\nprint(\"wrong:\", wrong)",
    "bullets": null,
    "norun": false,
    "out": "wrong: 1"
   },
   {
    "h": "Compare the numbers and decide",
    "say": "Now run the same checks with two sets of thresholds and compare. Calibrated numbers cut the wrong labels, but glare on a bare sensor can still cause errors. The leftover errors are the evidence for your design change in C4.",
    "code": null,
    "bullets": [
     "Kit numbers: 5 wrong in Lab 2 day one",
     "Calibrated 620, 410, 170: 3 wrong",
     "Calibrated and lip fitted: 0 wrong",
     "Spec 7.1 needs fewer than 2"
    ],
    "norun": false,
    "out": null
   }
  ],
  "task": "In Lab 2, run Step 5 on both days. Write which three numbers you chose and why, using the wrong counts.",
  "challenges": [
   "day_wrong",
   "day_midpoint"
  ]
 },
 {
  "id": "18",
  "title": "Clean the day and smooth it",
  "emoji": "🧹",
  "mins": 6,
  "goal": "Remove faulty readings from a full day of data and smooth the rest, and explain why this makes the label trustworthy.",
  "slides": [
   {
    "h": "A real day has faults",
    "say": "A full day of readings always contains faults. A loose wire gives 0 or 4095. A damaged serial line gives text instead of a number. A missing condition leaves a blank. If you do not clean them, they change your statistics and your charts.",
    "code": null,
    "bullets": [
     "0 or 4095: a floating or loose pin",
     "Text in the number column: a damaged line",
     "Blank condition: a missing value",
     "Each one needs a rule in clean()"
    ],
    "norun": false,
    "out": null
   },
   {
    "h": "The range filter",
    "say": "The first rule drops impossible readings. The kit says a realistic LDR reading is between 5 and 1000, so anything outside that range is a fault. Press run and watch the faults disappear.",
    "code": "raw = [688, 4095, 467, 0, 288, 61, 601]\ngood = [r for r in raw if 5 <= r <= 1000]\nprint(good)\nprint(\"removed:\", len(raw) - len(good))",
    "bullets": null,
    "norun": false,
    "out": "[688, 467, 288, 61, 601]\nremoved: 2"
   },
   {
    "h": "The z-score filter",
    "say": "A z-score says how many standard deviations a value is from the mean. Values with a z-score of 3 or more are statistical outliers. In this small list the 151 stands far from the others.",
    "code": "import statistics\n\nraw = [688, 690, 686, 689, 687, 688, 690, 686, 689, 151]\nm = statistics.mean(raw)\nsd = statistics.stdev(raw)\nfor r in raw:\n    z = (r - m) / sd\n    if abs(z) >= 2.5:\n        print(r, \"z =\", round(z, 1))",
    "bullets": null,
    "norun": false,
    "out": "151 z = -2.8"
   },
   {
    "h": "Smooth with a moving average",
    "say": "A moving average replaces each reading with the average of the last five. One noisy reading no longer changes the label. Here a single 442 appears in a run of 688s.",
    "code": "def moving_avg(values, n=5):\n    out = []\n    for i in range(len(values)):\n        window = values[max(0, i - n + 1): i + 1]\n        out.append(round(sum(window) / len(window), 1))\n    return out\n\nraw = [688, 688, 688, 688, 442, 690]\nprint(moving_avg(raw))",
    "bullets": null,
    "norun": false,
    "out": "[688.0, 688.0, 688.0, 688.0, 638.8, 639.2]"
   },
   {
    "h": "Why it matters for the label",
    "say": "Without smoothing, the single 442 reads as DIM even though the sensor was covered. The five reading average is about 639, which stays DARK. That is the evidence for a code change you can justify in C4.",
    "code": "raw = [688, 688, 688, 688, 442]\nprint(\"single reading:\", \"DARK\" if raw[-1] > 500 else \"DIM\")\navg = sum(raw) / len(raw)\nprint(\"average of 5   :\", round(avg), \"DARK\" if avg > 500 else \"DIM\")",
    "bullets": null,
    "norun": false,
    "out": "single reading: DIM\naverage of 5   : 639 DARK"
   },
   {
    "h": "Record the evidence",
    "say": "Cleaning is only worth marks if you can show it. Screenshot the rows in and the rows out, name each rule, and write one sentence on what would go wrong without it. That goes in your C2 explanation and your C3 log.",
    "code": null,
    "bullets": [
     "Rows in and rows out",
     "The rule for each fault",
     "One sentence on why",
     "Screenshot into your C3 log"
    ],
    "norun": false,
    "out": null
   }
  ],
  "task": "In Lab 2, pass Step 2 on the day without the lip and write the number of rows removed and the rule that removed each fault.",
  "challenges": [
   "day_smooth"
  ]
 },
 {
  "id": "19",
  "title": "Tell the story of the day",
  "emoji": "📊",
  "mins": 6,
  "goal": "Turn clean readings into a report the facilities team can act on: when it is light, for how long, and what that saves.",
  "slides": [
   {
    "h": "Answer the client's question",
    "say": "The client is a school facilities team. They do not want raw numbers. They want to know when it is light, for how many hours, and how much energy the corridor lights could save. Your Python code has to answer those three questions.",
    "code": null,
    "bullets": [
     "When does the light start and end?",
     "How many hours is it light?",
     "What could the lights save?"
    ],
    "norun": false,
    "out": null
   },
   {
    "h": "When does the light start and end?",
    "say": "Pick out the rows that are not DARK, then read the time from the first and the last one. The time is the HH colon MM part of the timestamp, so a slice from position 11 to 16 gets it.",
    "code": "rows = [(\"2026-10-14 05:00:00\", \"DARK\"), (\"2026-10-14 07:00:00\", \"DIM\"), (\"2026-10-14 12:20:00\", \"BRIGHT\"), (\"2026-10-14 17:00:00\", \"DIM\"), (\"2026-10-14 19:00:00\", \"DARK\")]\nlight = [r for r in rows if r[1] != \"DARK\"]\nprint(light[0][0][11:16], light[-1][0][11:16])",
    "bullets": null,
    "norun": false,
    "out": "07:00 17:00"
   },
   {
    "h": "How many hours is it light?",
    "say": "The post takes 144 readings in 16 hours, so one reading is 16 over 144 of an hour. Count the readings that are not DARK and multiply.",
    "code": "labels = [\"DARK\"] * 45 + [\"DIM\"] * 9 + [\"BRIGHT\"] * 90\nlight = 0\nfor lab in labels:\n    if lab != \"DARK\":\n        light += 1\nprint(round(light * 16 / 144, 1), \"hours\")",
    "bullets": null,
    "norun": false,
    "out": "11.0 hours"
   },
   {
    "h": "What could the lights save?",
    "say": "Energy is power times time. Twenty lamps of 36 watts for 9.7 hours is about 7 kilowatt hours. The price here is an example rate for practice, not a real tariff, so check your own school's bill before you quote money.",
    "code": "def saving(light_hours, lamps=20, watts=36, aed_per_kwh=0.35):\n    kwh = lamps * watts * light_hours / 1000\n    return {\"kwh\": round(kwh, 1), \"aed\": round(kwh * aed_per_kwh, 1)}\n\nprint(saving(9.7))",
    "bullets": null,
    "norun": false,
    "out": "{'kwh': 7.0, 'aed': 2.4}"
   },
   {
    "h": "Show it in a chart",
    "say": "A good chart has a title, labelled axes with units and a line for the smoothed values. In your portfolio, show Light percent over the day with the moving average, and mark when the lights could be off. Lab 2 draws four figures for you after Step 2.",
    "code": null,
    "bullets": [
     "Title and units on both axes",
     "Raw readings and the moving average",
     "A mark for where DARK begins and ends",
     "Caption: what the chart shows"
    ],
    "norun": false,
    "out": null
   },
   {
    "h": "Justify the change with numbers",
    "say": "In C4, a full reason names the change, quotes the evidence and states the effect on a specification. For example, the lip changed the wrong labels from 3 to 0 in the spec 7.1 test, so the post now meets the specification.",
    "code": null,
    "bullets": [
     "Change: diffuser lip added",
     "Evidence: 3 wrong without, 0 with",
     "Effect: meets spec 7.1",
     "Link it to your B3 design"
    ],
    "norun": false,
    "out": null
   }
  ],
  "task": "Run Lab 2 Step 6 and write the light hours and the start and end times in your C3 log, then write the C4 justification for the lip.",
  "challenges": [
   "day_hours",
   "day_firstlast",
   "day_energy"
  ]
 }
];
