/* Criterion C core: sensor kinds, the simulator and the B1 spec tests.
   Used by the Lab 1 pages (browser) and by the build checks (node). */
(function(root){
"use strict";
const C={};
C.rng=function(seed){let a=(seed>>>0)||1;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
C.gauss=function(r){let u=0,v=0;while(u===0)u=r();v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
C.map=function(x,a,b,c,d){return Math.trunc((x-a)*(d-c)/(b-a)+c)};          /* Arduino map(): whole numbers */
C.con=function(x,lo,hi){return Math.max(lo,Math.min(hi,x))};
const GREEN="#16a34a",AMBER="#d97706",RED="#dc2626",BLUE="#0891b2",SLATE="#334155";
const sp=(c,t)=>`<span class="${c}">${t}</span>`;
const cm=t=>sp("cm",t),kw=t=>sp("kw",t),st=t=>sp("st",t);

/* ---------- kinds ---------- */
const K={};
/* every kind: pin, file, P0 (editable numbers), world, ideal(), value(), labels, idx(), refIdx(), fmt(), sketch() */
K.sound={name:"Sound sensor",emoji:"🔊",file:"sound-sensor.ino",pin:"GPIO 36 (VP)",pinNote:"KY-038 microphone",baud:9600,
 P0:{base:35,gain:28,t1:60,t2:75,delay:500,avgN:1,confirm:1},
 world:{name:"Sound level in the room (true, from a reference meter)",unit:"dB",min:35,max:100,def:40,step:1,dp:0},
 ideal:(x)=>Math.max(0,(x-35)/31*4095/3.3),noise:40,faultRaw:[4095],
 value:(raw,P)=>C.con(P.base+Math.trunc(raw*3.3/4095*P.gain),35,105),
 labels:["QUIET_ZONE","ELEVATED_NOISE","HAZARDOUS_NOISE"],colors:[GREEN,AMBER,RED],up:true,
 fmt:r=>`Peak_to_Peak: ${r.raw}  |  Sound_dB: ${r.v} dB  |  Zone: ${r.lab}`,
 cols:["Timestamp","Peak_to_Peak","Sound_dB","Zone"],valUnit:" dB",
 sketch:(F,P,e)=>`${cm("// DataSciensPro Kit - Acoustic Sound Level Sensor (KY-038)   ESP32 | Pin 36 | 9600 baud")}
${kw("const int")} SOUND_PIN = 36;
${kw("const int")} SAMPLE_WINDOW_MS = 50;${e?`
${kw("const int")} LED_RED = 25, LED_YELLOW = 26, LED_GREEN = 27;`:""}

${kw("void")} loop() {
  ${cm("// sample the microphone for 50 ms, keep the highest and lowest values")}
  peakToPeak = signalMax - signalMin;
  ${kw("float")} volts = (peakToPeak * 3.3) / 4095.0;
  ${kw("int")} soundDb = ${F("base")} + ${kw("int")}(volts * ${F("gain")});
  soundDb = constrain(soundDb, 35, 105);
  ${kw("if")} (soundDb >= ${F("t2")})      zone = ${st('"HAZARDOUS_NOISE"')};
  ${kw("else if")} (soundDb >= ${F("t1")}) zone = ${st('"ELEVATED_NOISE"')};
  ${kw("else")}                      zone = ${st('"QUIET_ZONE"')};
  Serial.print(${st('"Peak_to_Peak: "')}); Serial.print(peakToPeak); ...${e?`
  ${cm("// extension: traffic-light status from your Criterion B product")}
  digitalWrite(LED_GREEN, zone == QUIET); digitalWrite(LED_YELLOW, zone == ELEVATED); digitalWrite(LED_RED, zone == HAZARDOUS);`:""}
  delay(${F("delay")});
}`,
 calc:{label:"Peak-to-peak =",def:1100,note:"try 0, 600, 1100, 2000",f:(x,P)=>{const v=x*3.3/4095,d=Math.trunc(v*P.gain);return `volts = ${x} x 3.3 / 4095 = ${v.toFixed(3)} V\nsoundDb = ${P.base} + int(${v.toFixed(3)} x ${P.gain}) = ${P.base} + ${d} = ${P.base+d}  ->  constrain(35, 105) = ${C.con(P.base+d,35,105)} dB`}}};

K.gas={name:"Gas / air-quality sensor",emoji:"🧪",file:"air_quality_gas_sensor.ino",pin:"GPIO 36 (VP)",pinNote:"MQ-135, 5 V heater",baud:9600,
 P0:{lo:200,hi:2500,t1:250,t2:450,delay:2000,avgN:1,confirm:1,preheat:0},
 world:{name:"Air contaminant level (true index, from a reference meter)",unit:"PPM index",min:50,max:1000,def:80,step:5,dp:0},
 ideal:(x)=>200+(x-50)*2.7,noise:25,faultRaw:[0,4095],
 value:(raw,P)=>C.con(C.map(raw,P.lo,P.hi,50,1000),50,1000),
 labels:["CLEAN","MODERATE","HAZARDOUS"],colors:[GREEN,AMBER,RED],up:true,gt:true,
 fmt:r=>`Raw ADC: ${r.raw}  |  Air Index: ${r.v} PPM  |  Rs/Ro: ${(3.3/(r.raw/1000+0.1)).toFixed(2)}  |  Hazard: ${r.lab}`,
 cols:["Timestamp","Raw_ADC","Air_Index_PPM","Hazard"],valUnit:" PPM",
 sketch:(F,P,e)=>`${cm("// DataSciensPro Kit - MQ-135 Air Quality & Hazardous Gas   ESP32 | Pin 36 | 9600 baud")}
${kw("const int")} MQ135_PIN = 36;
${kw("const int")} PREHEAT_S = ${F("preheat")};   ${cm("// kit note: the heater needs about 2 minutes")}${e?`
${kw("const int")} LED_RED = 25, LED_YELLOW = 26, LED_GREEN = 27, BUZZER = 14;`:""}

${kw("void")} setup() {
  Serial.begin(9600);
  delay(PREHEAT_S * 1000UL);   ${cm("// wait for the heater before trusting readings")}
}

${kw("void")} loop() {
  ${kw("int")} rawADC = analogRead(MQ135_PIN);
  ${kw("int")} ppmIndex = map(rawADC, ${F("lo")}, ${F("hi")}, 50, 1000);
  ppmIndex = constrain(ppmIndex, 50, 1000);
  ${kw("if")} (ppmIndex > ${F("t2")})      hazard = ${st('"HAZARDOUS"')};
  ${kw("else if")} (ppmIndex > ${F("t1")}) hazard = ${st('"MODERATE"')};
  ${kw("else")}                      hazard = ${st('"CLEAN"')};
  Serial.print(${st('"Raw ADC: "')}); Serial.print(rawADC); ...${e?`
  ${cm("// extension: alert from your Criterion B product")}
  digitalWrite(BUZZER, hazard == HAZARDOUS); digitalWrite(LED_RED, hazard == HAZARDOUS);`:""}
  delay(${F("delay")});
}`,
 calc:{label:"Raw ADC =",def:700,note:"try 200, 700, 1500, 2500",f:(x,P)=>{const m=C.map(x,P.lo,P.hi,50,1000);return `map(${x}, ${P.lo}, ${P.hi}, 50, 1000) = (${x} - ${P.lo}) x 950 / ${P.hi-P.lo} + 50 = ${m}  (whole numbers only)\nconstrain(${m}, 50, 1000) = ${C.con(m,50,1000)} PPM index`}}};

K.vibration={name:"Vibration sensor",emoji:"📳",file:"vibration-sensor.ino",pin:"GPIO 36 (VP)",pinNote:"SW-420 shock sensor",baud:9600,
 P0:{hi:4095,t1:20,t2:60,delay:250,avgN:1,confirm:1},
 world:{name:"Shake strength at the structure (true, from a reference accelerometer)",unit:"%",min:0,max:100,def:0,step:1,dp:0},
 ideal:(x)=>x*34,noise:30,faultRaw:[4095],
 value:(raw,P)=>C.con(C.map(raw,0,P.hi,0,100),0,100),
 labels:["SMOOTH_NORMAL","BEARING_FATIGUE","CRITICAL_SHOCK"],colors:[GREEN,AMBER,RED],up:true,
 fmt:r=>`Raw ADC: ${r.raw}  |  Vibration %: ${r.v}%  |  Status: ${r.lab}`,
 cols:["Timestamp","Raw_ADC","Vibration_Pct","Status"],valUnit:"%",
 sketch:(F,P,e)=>`${cm("// DataSciensPro Kit - SW-420 Vibration & Shock Sensor   ESP32 | Pin 36 | 9600 baud")}
${kw("const int")} VIBRATION_PIN = 36;${e?`
${kw("const int")} LED_RED = 25, LED_YELLOW = 26, LED_GREEN = 27;`:""}

${kw("void")} loop() {
  rawAdc = analogRead(VIBRATION_PIN);
  ${kw("int")} vibPercent = map(rawAdc, 0, ${F("hi")}, 0, 100);
  vibPercent = constrain(vibPercent, 0, 100);
  ${kw("if")} (vibPercent >= ${F("t2")})      status = ${st('"CRITICAL_SHOCK"')};
  ${kw("else if")} (vibPercent >= ${F("t1")}) status = ${st('"BEARING_FATIGUE"')};
  ${kw("else")}                         status = ${st('"SMOOTH_NORMAL"')};
  Serial.print(${st('"Raw ADC: "')}); Serial.print(rawAdc); ...${e?`
  ${cm("// extension: warning lights from your Criterion B product")}
  digitalWrite(LED_RED, status == CRITICAL); digitalWrite(LED_YELLOW, status == FATIGUE);`:""}
  delay(${F("delay")});   ${cm("// fast sampling for shock transients")}
}`,
 calc:{label:"Raw ADC =",def:1500,note:"try 0, 800, 1500, 3000",f:(x,P)=>{const m=C.map(x,0,P.hi,0,100);return `map(${x}, 0, ${P.hi}, 0, 100) = ${x} x 100 / ${P.hi} = ${m}  (whole numbers only)\nconstrain(${m}, 0, 100) = ${C.con(m,0,100)} %`}}};

K.flame={name:"Flame (IR) sensor",emoji:"🔥",file:"flame-sensor.ino",pin:"GPIO 36 (VP)",pinNote:"IR flame module, analogue output",baud:9600,
 P0:{lo:0,t1:20,t2:60,delay:500,avgN:1,confirm:1},
 world:{name:"Infrared from the flame (true, from a reference IR meter)",unit:"%",min:0,max:100,def:2,step:1,dp:0},
 world2:{name:"Sunlight on the sensor (true)",unit:"%",min:0,max:100,def:0,step:1,dp:0},
 ideal:(x)=>3950-x*36,noise:35,faultRaw:[0,4095],
 value:(raw,P)=>C.con(C.map(raw,4095,P.lo,0,100),0,100),
 labels:["CLEAR","WATCH","FLAME_ALARM"],colors:[GREEN,AMBER,RED],up:true,
 fmt:r=>`Raw ADC: ${r.raw}  |  Flame IR %: ${r.v}%  |  Status: ${r.lab}`,
 cols:["Timestamp","Raw_ADC","Flame_Pct","Status"],valUnit:"%",
 sketch:(F,P,e)=>`${cm("// DataSciensPro Kit - IR Flame Sensor   ESP32 | Pin 36 | 9600 baud   (kit style)")}
${kw("const int")} FLAME_PIN = 36;${e?`
${kw("const int")} BUZZER = 14, LED_RED = 25;`:""}

${kw("void")} loop() {
  ${kw("int")} rawAdc = analogRead(FLAME_PIN);
  ${cm("// inverted module: low raw value = strong infrared")}
  ${kw("int")} flamePercent = map(rawAdc, 4095, ${F("lo")}, 0, 100);
  flamePercent = constrain(flamePercent, 0, 100);
  ${kw("if")} (flamePercent >= ${F("t2")})      status = ${st('"FLAME_ALARM"')};
  ${kw("else if")} (flamePercent >= ${F("t1")}) status = ${st('"WATCH"')};
  ${kw("else")}                           status = ${st('"CLEAR"')};
  Serial.print(${st('"Raw ADC: "')}); Serial.print(rawAdc); ...${e?`
  ${cm("// extension: alarm from your Criterion B product")}
  digitalWrite(BUZZER, status == FLAME_ALARM); digitalWrite(LED_RED, status == FLAME_ALARM);`:""}
  delay(${F("delay")});
}`,
 calc:{label:"Raw ADC =",def:2000,note:"try 4095, 3000, 2000, 400",f:(x,P)=>{const m=C.map(x,4095,P.lo,0,100);return `map(${x}, 4095, ${P.lo}, 0, 100) = (${x} - 4095) x 100 / (${P.lo} - 4095) = ${m}  (whole numbers only)\nconstrain(${m}, 0, 100) = ${C.con(m,0,100)} %`}}};

K.rain={name:"Raindrop sensor",emoji:"🌧️",file:"rain-sensor.ino",pin:"GPIO 36 (VP)",pinNote:"raindrop plate, analogue output",baud:9600,
 P0:{dry:4095,wet:1500,t1:15,t2:50,delay:500,avgN:1,confirm:1},
 world:{name:"Water covering the plate (true, from a reference gauge)",unit:"%",min:0,max:100,def:0,step:1,dp:0},
 world2:{name:"Splash from crops or sprinklers (true)",unit:"%",min:0,max:100,def:0,step:1,dp:0},
 ideal:(x)=>3980-x*25,noise:30,faultRaw:[0,4095],
 value:(raw,P)=>C.con(C.map(raw,P.dry,P.wet,0,100),0,100),
 labels:["DRY","LIGHT_RAIN","HEAVY_RAIN"],colors:[GREEN,AMBER,BLUE],up:true,
 fmt:r=>`Raw ADC: ${r.raw}  |  Rain %: ${r.v}%  |  Status: ${r.lab}`,
 cols:["Timestamp","Raw_ADC","Rain_Pct","Status"],valUnit:"%",
 sketch:(F,P,e)=>`${cm("// DataSciensPro Kit - Raindrop Sensor   ESP32 | Pin 36 | 9600 baud   (kit style)")}
${kw("const int")} RAIN_PIN = 36;${e?`
${kw("const int")} PUMP_RELAY = 25, LED_BLUE = 26;`:""}

${kw("void")} loop() {
  ${kw("int")} rawAdc = analogRead(RAIN_PIN);
  ${cm("// dry plate = high raw value, wet plate = low raw value")}
  ${kw("int")} rainPercent = map(rawAdc, ${F("dry")}, ${F("wet")}, 0, 100);
  rainPercent = constrain(rainPercent, 0, 100);
  ${kw("if")} (rainPercent >= ${F("t2")})      status = ${st('"HEAVY_RAIN"')};
  ${kw("else if")} (rainPercent >= ${F("t1")}) status = ${st('"LIGHT_RAIN"')};
  ${kw("else")}                          status = ${st('"DRY"')};
  Serial.print(${st('"Raw ADC: "')}); Serial.print(rawAdc); ...${e?`
  ${cm("// extension: pause irrigation while it rains")}
  digitalWrite(PUMP_RELAY, status == DRY);   ${cm("// pump ON only when DRY")}`:""}
  delay(${F("delay")});
}`,
 calc:{label:"Raw ADC =",def:3000,note:"try 4095, 3000, 2000, 1500",f:(x,P)=>{const m=C.map(x,P.dry,P.wet,0,100);return `map(${x}, ${P.dry}, ${P.wet}, 0, 100) = (${x} - ${P.dry}) x 100 / (${P.wet} - ${P.dry}) = ${m}  (whole numbers only)\nconstrain(${m}, 0, 100) = ${C.con(m,0,100)} %`}}};

K.soil={name:"Soil moisture sensor",emoji:"🌱",file:"soil-moisture-sensor.ino",pin:"GPIO 36 (VP)",pinNote:"capacitive soil probe, analogue output",baud:9600,
 P0:{dry:3000,wet:1200,t1:30,t2:60,delay:1000,avgN:1,confirm:1},
 world:{name:"Water in the soil (true, oven-dry reference)",unit:"%",min:0,max:100,def:10,step:1,dp:0},
 ideal:(x)=>3150-x*20.5,noise:22,faultRaw:[0,4095],
 value:(raw,P)=>C.con(C.map(raw,P.dry,P.wet,0,100),0,100),
 labels:["DRY","MOIST","WET"],colors:[AMBER,GREEN,BLUE],up:true,
 fmt:r=>`Raw ADC: ${r.raw}  |  Soil Moisture %: ${r.v}%  |  Status: ${r.lab}`,
 cols:["Timestamp","Raw_ADC","Soil_Moisture_Pct","Status"],valUnit:"%",
 sketch:(F,P,e)=>`${cm("// DataSciensPro Kit - Soil Moisture Sensor   ESP32 | Pin 36 | 9600 baud   (kit style)")}
${kw("const int")} SOIL_PIN = 36;${e?`
${kw("const int")} PUMP_RELAY = 25, LED_BLUE = 26;`:""}

${kw("void")} loop() {
  ${kw("int")} rawAdc = analogRead(SOIL_PIN);
  ${cm("// dry soil = high raw value, wet soil = low raw value")}
  ${kw("int")} soilPercent = map(rawAdc, ${F("dry")}, ${F("wet")}, 0, 100);
  soilPercent = constrain(soilPercent, 0, 100);
  ${kw("if")} (soilPercent >= ${F("t2")})      status = ${st('"WET"')};
  ${kw("else if")} (soilPercent >= ${F("t1")}) status = ${st('"MOIST"')};
  ${kw("else")}                          status = ${st('"DRY"')};
  Serial.print(${st('"Raw ADC: "')}); Serial.print(rawAdc); ...${e?`
  ${cm("// extension: water only when the soil is DRY")}
  digitalWrite(PUMP_RELAY, status == DRY);`:""}
  delay(${F("delay")});
}`,
 calc:{label:"Raw ADC =",def:2100,note:"try 3000, 2100, 1200",f:(x,P)=>{const m=C.map(x,P.dry,P.wet,0,100);return `map(${x}, ${P.dry}, ${P.wet}, 0, 100) = (${x} - ${P.dry}) x 100 / (${P.wet} - ${P.dry}) = ${m}  (whole numbers only)\nconstrain(${m}, 0, 100) = ${C.con(m,0,100)} %`}}};

K.temp={name:"Waterproof temperature probe (DS18B20)",emoji:"🌡️",file:"temperature-probe.ino",pin:"GPIO 4 (1-Wire, 4.7 kΩ pull-up)",pinNote:"DS18B20 probe",baud:9600,
 P0:{off:0,t1:30,t2:33,delay:1000,avgN:1,confirm:1},
 world:{name:"Temperature of the water or soil (true, from a reference thermometer)",unit:"°C",min:10,max:45,def:25,step:0.5,dp:1},
 ideal:(x)=>x+1.4,noise:0.12,faultRaw:[-127,85],
 value:(raw,P)=>Math.round((raw+P.off)*100)/100,
 labels:["NORMAL","WARM","HOT"],colors:[BLUE,AMBER,RED],up:true,
 fmt:r=>`Temp C: ${r.v.toFixed(2)}  |  Temp F: ${(r.v*9/5+32).toFixed(2)}  |  Category: ${r.lab}`,
 cols:["Timestamp","Temp_C","Temp_C_Cal","Category"],valUnit:" °C",dec:2,
 sketch:(F,P,e)=>`${cm("// DataSciensPro Kit - DS18B20 Temperature Probe   ESP32 | Pin 4 (1-Wire + 4.7k pull-up) | 9600 baud")}
${kw("const int")} ONE_WIRE_BUS = 4;
${kw("const float")} OFFSET_C = ${F("off")};   ${cm("// calibration: add this to every reading")}${e?`
${kw("const int")} LED_RED = 25, LED_YELLOW = 26, LED_GREEN = 27;`:""}

${kw("void")} loop() {
  sensors.requestTemperatures();
  ${kw("float")} tempC = sensors.getTempCByIndex(0) + OFFSET_C;
  ${kw("if")} (tempC == DEVICE_DISCONNECTED_C) { Serial.println(${st('"ERROR: DS18B20 Disconnected"')}); ${kw("return")}; }
  ${kw("if")} (tempC >= ${F("t2")})      category = ${st('"HOT"')};
  ${kw("else if")} (tempC >= ${F("t1")}) category = ${st('"WARM"')};
  ${kw("else")}                    category = ${st('"NORMAL"')};
  Serial.print(${st('"Temp C: "')}); Serial.print(tempC, 2); ...${e?`
  ${cm("// extension: status lights from your Criterion B product")}
  digitalWrite(LED_RED, category == HOT); digitalWrite(LED_YELLOW, category == WARM);`:""}
  delay(${F("delay")});
}`,
 calc:{label:"Probe reading (°C) =",def:26.4,note:"try 21.4, 26.4, 31.4, 34.4",f:(x,P)=>{const v=Math.round((x+P.off)*100)/100;return `tempC = ${x} + OFFSET_C (${P.off}) = ${v.toFixed(2)} °C`}}};

K.moisture={name:"Humidity and temperature sensor (DHT22)",emoji:"💧",file:"humidity-temp-sensor.ino",pin:"GPIO 4 (DHT22 data)",pinNote:"DHT22 humidity and temperature",baud:9600,
 P0:{off:0,t1:30,t2:70,delay:2000,avgN:1,confirm:1},
 world:{name:"Humidity of the air (true, from a reference hygrometer)",unit:"% RH",min:10,max:100,def:50,step:1,dp:0},
 world2:{name:"Air temperature (true, from a reference thermometer)",unit:"°C",min:15,max:48,def:30,step:0.5,dp:1},
 ideal:(x)=>x,noise:0.8,faultRaw:[0,255],
 value:(raw,P)=>C.con(Math.round((raw+P.off)*10)/10,0,100),
 labels:["DRY_AIR","COMFORT","HUMID_WARNING"],colors:[AMBER,GREEN,BLUE],up:true,
 fmt:r=>`Humidity: ${r.v.toFixed(1)} %  |  Temp C: ${r.t.toFixed(1)}  |  Status: ${r.lab}`,
 cols:["Timestamp","Humidity_Pct","Humidity_Cal","Status"],valUnit:" %",dec:1,
 sketch:(F,P,e,L)=>{const flag=L&&L.mode==="flag";return `${cm("// DataSciensPro Kit - DHT22 Humidity & Temperature   ESP32 | Pin 4 | 9600 baud   (kit style)")}
${kw("const int")} DHT_PIN = 4;
${kw("const float")} HUM_OFFSET = ${F("off")};   ${cm("// calibration: add this to every humidity reading")}${e?`
${kw("const int")} LED_RED = 25, LED_YELLOW = 26, LED_GREEN = 27;`:""}

${kw("void")} loop() {
  ${kw("float")} h = dht.readHumidity() + HUM_OFFSET;
  ${kw("float")} t = dht.readTemperature();
  ${kw("if")} (isnan(h) || isnan(t)) { Serial.println(${st('"ERROR: DHT22 read failed"')}); ${kw("return")}; }
  ${flag?`${kw("if")} (h < ${F("t1")} && t > ${F("t2")})      status = ${st('"DRY_HEAT_ALERT"')};   ${cm("// low humidity AND high heat")}
  ${kw("else if")} (h < ${F("t1")} || t > ${F("t2")}) status = ${st('"WATCH"')};
  ${kw("else")}                                  status = ${st('"OK"')};`:`${kw("if")} (h >= ${F("t2")})      status = ${st('"HUMID_WARNING"')};
  ${kw("else if")} (h >= ${F("t1")}) status = ${st('"COMFORT"')};
  ${kw("else")}                status = ${st('"DRY_AIR"')};`}
  Serial.print(${st('"Humidity: "')}); Serial.print(h, 1); Serial.print(${st('" %  |  Temp C: "')}); Serial.print(t, 1); ...${e?`
  ${cm("// extension: status lights from your Criterion B product")}
  digitalWrite(LED_RED, status == ALERT); digitalWrite(LED_GREEN, status == OK);`:""}
  delay(${F("delay")});
}`},
 calc:{label:"Sensor humidity =",def:48,note:"try 20, 48, 65, 90",f:(x,P)=>{const v=Math.round((x+P.off)*10)/10;return `h = ${x} + HUM_OFFSET (${P.off}) = ${v.toFixed(1)} %`}}};

K.photogate={name:"Infrared photogate",emoji:"🚪",file:"photogate-sensor.ino",pin:"GPIO 19 (interrupt, INPUT_PULLUP)",pinNote:"IR photogate",baud:9600,
 P0:{w:0.05,t1:0.5,t2:2.5,delay:10,avgN:1,confirm:1},
 world:{name:"Speed of the person or object (true, from video timing)",unit:"m/s",min:0.3,max:6,def:2,step:0.1,dp:1},
 world2:{name:"Width of whatever breaks the beam",unit:"m",min:0.05,max:0.5,def:0.05,step:0.01,dp:2},
 ideal:(x,x2)=>x2/x*1e6,noise:0,faultRaw:[50,9000000],
 value:(raw,P)=>Math.round(P.w/(raw/1e6)*100)/100,
 labels:["LOW_SPEED_DECELERATION","NOMINAL_TRAJECTORY","HIGH_VELOCITY_PASS"],colors:[BLUE,GREEN,RED],up:true,mid:true,
 fmt:r=>`Duration_ms: ${(r.raw/1000).toFixed(2)}  |  Velocity_mps: ${r.v.toFixed(2)}  |  State: ${r.lab}`,
 cols:["Timestamp","Duration_ms","Velocity_mps","State"],valUnit:" m/s",dec:2,
 sketch:(F,P,e)=>`${cm("// DataSciensPro Kit - Infrared Photogate Speed Sensor   ESP32 | Pin 19 (interrupt) | 9600 baud")}
${kw("const int")} PHOTOGATE_PIN = 19;
${kw("const float")} FLAG_WIDTH_M = ${F("w")};   ${cm("// width of whatever breaks the beam, in metres")}${e?`
${kw("const int")} LED_GREEN = 27, LED_RED = 25;`:""}

${cm("// ISR: micros() when the beam is blocked, again when it clears")}
${kw("void")} loop() {
  ${kw("if")} (passCompleted) {
    ${kw("float")} durationMs = blockDurationMicros / 1000.0;
    ${kw("float")} velocity = FLAG_WIDTH_M / (blockDurationMicros / 1000000.0);
    ${kw("if")} (velocity > ${F("t2")})      state = ${st('"HIGH_VELOCITY_PASS"')};
    ${kw("else if")} (velocity < ${F("t1")}) state = ${st('"LOW_SPEED_DECELERATION"')};
    ${kw("else")}                      state = ${st('"NOMINAL_TRAJECTORY"')};
    Serial.print(${st('"Duration_ms: "')}); Serial.print(durationMs, 2); ...${e?`
    ${cm("// extension: lights from your Criterion B product")}
    digitalWrite(LED_GREEN, state == NOMINAL); digitalWrite(LED_RED, state == HIGH);`:""}
  }
  delay(${F("delay")});
}`,
 calc:{label:"Beam blocked for (ms) =",def:25,note:"try 8, 25, 60, 120",f:(x,P)=>{const v=P.w/(x/1000);return `velocity = FLAG_WIDTH_M (${P.w}) / (${x} ms / 1000) = ${v.toFixed(2)} m/s`}}};

K.health={name:"Pulse oximeter (MAX30105)",emoji:"🫀",file:"pulse-sensor.ino",pin:"I2C: SDA GPIO 21, SCL GPIO 22",pinNote:"MAX30105 optical sensor",baud:9600,
 P0:{rate:4,t1:55,t2:115,delay:1000,avgN:1,confirm:1},
 world:{name:"Heart rate of the person (true, from a chest-strap reference)",unit:"BPM",min:40,max:160,def:72,step:1,dp:0},
 world2:{name:"Finger on the sensor (1 = yes, 0 = no)",unit:"",min:0,max:1,def:0,step:1,dp:0},
 ideal:(x)=>x,noise:0,faultRaw:[0,262143],
 value:(raw)=>raw,labels:["BRADYCARDIA","NORMAL","TACHYCARDIA_STRESS"],colors:[BLUE,GREEN,RED],up:true,mid:true,
 fmt:r=>`Raw IR: ${r.ir}  |  BPM: ${r.v}  |  SpO2: ${r.spo2.toFixed(1)}%  |  Status: ${r.lab}`,
 cols:["Timestamp","Raw_IR","BPM","Status"],valUnit:" BPM",
 sketch:(F,P,e)=>`${cm("// DataSciensPro Kit - MAX30105 Optical Pulse Monitor   ESP32 | SDA 21, SCL 22 | 9600 baud")}
${kw("const byte")} RATE_SIZE = ${F("rate")};   ${cm("// average of the last RATE_SIZE beats")}${e?`
${kw("const int")} LED_RED = 25, LED_GREEN = 27;`:""}

${kw("void")} loop() {
  ${kw("long")} irValue = particleSensor.getIR();
  ${kw("if")} (checkForBeat(irValue)) {
    beatsPerMinute = 60 / ((millis() - lastBeat) / 1000.0);
    ${kw("if")} (beatsPerMinute < 240 && beatsPerMinute > 30) { rates[rateSpot++] = beatsPerMinute; ...average of RATE_SIZE... }
  }
  ${kw("if")} (irValue < 50000)          { status = ${st('"NO_FINGER"')}; beatAvg = 0; }
  ${kw("else if")} (beatAvg > ${F("t2")})      status = ${st('"TACHYCARDIA_STRESS"')};
  ${kw("else if")} (beatAvg < ${F("t1")} && beatAvg > 0) status = ${st('"BRADYCARDIA"')};
  Serial.print(${st('"Raw IR: "')}); Serial.print(irValue); ...${e?`
  ${cm("// extension: status lights from your Criterion B product")}
  digitalWrite(LED_GREEN, status == NORMAL); digitalWrite(LED_RED, status == TACHYCARDIA);`:""}
  delay(${F("delay")});
}`,
 calc:{label:"Seconds between beats =",def:0.85,note:"try 0.5, 0.85, 1.2",f:(x)=>`BPM = 60 / ${x} = ${(60/x).toFixed(1)}`}};

/* ---------- classification ---------- */
C.K=K;
C.thr=function(k,L,P){return [P.t1,P.t2]};
C.kind=function(id,L){const k=Object.assign({},K[id]);if(L.world){k.world=Object.assign({},k.world,L.world);if(L.world.df!=null)k.world.def=L.world.df}if(L.world2){k.world2=Object.assign({},k.world2||{},L.world2);if(L.world2.df!=null)k.world2.def=L.world2.df}if(L.world2===null)delete k.world2;if(L.mid!=null)k.mid=L.mid;if(L.gt!=null)k.gt=L.gt;if(L.noise!=null)k.noise=L.noise;k.id=id;return k};
C.idx=function(k,L,v,P){
  if(L.mode==="flag")return 0;
  if(k.mid){ /* low / nominal / high bands (photogate, health, soil temperature) */
    return v>P.t2?2:(v<P.t1?0:1)}
  return v>=P.t2?2:v>=P.t1?1:0};
C.idxStrict=function(k,L,v,P){ /* gas uses > not >= like the kit */
  if(k.gt)return v>P.t2?2:v>P.t1?1:0;return C.idx(k,L,v,P)};
C.refIdx=function(k,L,x,x2){const PP=Object.assign({},k.P0,L.P0||{});const R=L.refT||[PP.t1,PP.t2];
  if(L.mode==="flag"){const a=x<R[0],b=x2>R[1];return a&&b?2:(a||b)?1:0}
  if(k.mid)return x>R[1]?2:(x<R[0]?0:1);
  if(k.gt)return x>R[1]?2:x>R[0]?1:0;
  return x>=R[1]?2:x>=R[0]?1:0};
C.paramsFor=function(k,L){return Object.assign({},k.P0,L.P0||{})};
C.labelsFor=function(k,L){return L.labels||k.labels};
C.colorsFor=function(k,L){return L.colors||k.colors};

/* ---------- the simulator ---------- */
function Sim(k,L,P,fix,seed,noiseMul){
  this.k=k;this.L=L;this.P=P;this.fix=fix?1:0;this.r=C.rng(seed||7);this.noiseMul=noiseMul==null?1:noiseMul;
  this.x=k.world.def;this.x2=k.world2?k.world2.def:0;this.y=null;this.buf=[];this.cand=-1;this.cnt=0;this.rep=-1;this.t=0;this.fault=false;this.prevY=null;this.warm=false;this.warmT=0}
C.Sim=Sim;
Sim.prototype.eff=function(x,x2){
  const k=this.k,L=this.L,f=L.fix,w=k.world,n=(x-w.min)/(w.max-w.min),b=f.bias[this.fix];
  let e=x+b[0]+b[1]*n;
  if(f.coupling&&k.world2)e+= (x2-k.world2.min)/(k.world2.max-k.world2.min)*f.coupling[this.fix]*(w.max-w.min);
  if(k.id==="moisture"){const dT=f.dT[this.fix];e=x-4.5*dT}
  return e};
Sim.prototype.dT=function(){return this.L.fix.dT?this.L.fix.dT[this.fix]:0};
Sim.prototype.tau=function(rising){const t=this.L.fix.tau,i=this.fix*2+(rising?0:1);return t[i]};
Sim.prototype.noiseSd=function(){return this.k.noise*this.L.fix.noise[this.fix]*this.noiseMul};
Sim.prototype.settle=function(){this.y=this.eff(this.x,this.x2);this.buf=[];this.cand=-1;this.cnt=0;this.rep=-1;this.prevY=this.y};
Sim.prototype.step=function(dtMs){
  const k=this.k,P=this.P,e=this.eff(this.x,this.x2);
  if(this.y===null){this.y=e;this.prevY=e}
  else{const rising=e>=this.y,tau=Math.max(0.05,this.tau(rising));this.y+=(e-this.y)*(1-Math.exp(-dtMs/1000/tau))}
  this.t+=dtMs;
  let raw;
  if(k.id==="photogate"){const dur=k.ideal(Math.max(0.05,this.y),this.x2);raw=Math.max(200,dur+C.gauss(this.r)*this.L.fix.jitter[this.fix]*this.noiseMul)}
  else raw=k.ideal(this.y,this.x2)+C.gauss(this.r)*this.noiseSd();
  if(this.warm){const sc=this.L.scenario;raw*=1+(sc.warmFactor||6)*Math.exp(-this.warmT/(sc.tauWarm||35));this.warmT+=dtMs/1000}
  /* heat trap (DHT): the sensor itself reads the extra warmth */
  let tRead=this.x2+(k.id==="moisture"?this.dT():0);
  if(this.fault&&this.r()<0.08){const fr=k.faultRaw;raw=fr[Math.floor(this.r()*fr.length)]}
  let err=false;
  if(k.id==="temp"&&(raw===-127||raw===85))err=true;
  if(k.id==="moisture"&&(raw===0||raw===255))err=true;
  if(k.id!=="temp"&&k.id!=="photogate")raw=Math.max(0,Math.round(raw*(k.id==="moisture"?10:1))/(k.id==="moisture"?10:1));
  else if(k.id==="temp")raw=Math.round(raw*100)/100;
  else raw=Math.round(raw);
  const v=k.value(raw,P);
  const avgN=Math.max(1,Math.round(P.avgN));
  this.buf.push(v);while(this.buf.length>avgN)this.buf.shift();
  const va=this.buf.reduce((a,b)=>a+b,0)/this.buf.length;
  let idx;
  if(this.L.mode==="flag")idx=(()=>{const a=va<P.t1,b=tRead>P.t2;return a&&b?2:(a||b)?1:0})();
  else idx=C.idxStrict(k,this.L,k.id==="temp"||k.id==="moisture"?va:Math.round(va),P);
  if(idx===this.cand)this.cnt++;else{this.cand=idx;this.cnt=1}
  if(this.cnt>=Math.max(1,Math.round(P.confirm)))this.rep=idx;
  return {raw,v,va,idx:this.rep,cand:idx,t:tRead,err}};


/* live heart-rate simulator (pulse oximeter) */
function HSim(k,L,P,fix,seed){this.k=k;this.L=L;this.P=P;this.fix=fix?1:0;this.r=C.rng(seed||5);this.x=72;this.x2=0;this.got=[];this.beatT=0;this.t=0;this.rep=-1;this.fault=false}
C.HSim=HSim;
HSim.prototype.step=function(dtMs){
  const L=this.L,P=this.P,r=this.r,q=L.fix.dropout[this.fix],pdet=L.fix.pdet[this.fix],N=Math.max(1,Math.round(P.rate)),per=60/Math.max(30,this.x);
  const dt=dtMs/1000,sub=Math.max(1,Math.round(dt/0.1));let drop=false;
  if(!this.beatT)this.beatT=this.t+per*r();
  for(let i=0;i<sub;i++){this.t+=dt/sub;
    if(this.x2<1){this.got=[];drop=true;continue}
    if(r()<1-Math.pow(1-q,dt/sub)){this.got=[];drop=true;this.beatT=this.t+per*0.5;continue}
    while(this.beatT<=this.t){if(r()<pdet){this.got.push(this.x*(1+C.gauss(r)*(this.fix?0.02:0.07)));if(this.got.length>N)this.got.shift()}this.beatT+=per}}
  const finger=this.x2>=1&&!drop;
  let ir=finger?Math.round(88000+C.gauss(r)*2500):Math.round(2500+C.gauss(r)*400);
  if(this.fault&&r()<0.08)ir=r()<.5?0:262143;
  let avg=0;if(finger&&this.got.length>=N)avg=this.got.reduce((a,b)=>a+b,0)/N;
  const v=Math.round(avg);let lab,idx;
  if(ir<50000){lab="NO_FINGER";idx=-1}else{idx=v>P.t2?2:(v<P.t1&&v>0)?0:1;lab=C.labelsFor(this.k,L)[idx]}
  const spo2=finger?98.4-Math.floor(r()*10)*0.1:98.2;
  return {raw:ir,ir,v,va:v,idx,lab,spo2,err:false,t:0}};


/* ---------- scenarios and datasets (same code builds the Lab 1 playback and the Lab 2 data) ---------- */
const pad2=n=>String(n).padStart(2,"0");
C.ts=function(startStr,sec){const m=startStr.match(/(\d+)-(\d+)-(\d+) (\d+):(\d+):(\d+)/);const d=new Date(Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+m[6])+sec*1000);
  return d.getUTCFullYear()+"-"+pad2(d.getUTCMonth()+1)+"-"+pad2(d.getUTCDate())+" "+pad2(d.getUTCHours())+":"+pad2(d.getUTCMinutes())+":"+pad2(d.getUTCSeconds())};
C.scenario=function(k,L,seed){
  const sc=L.scenario,r=C.rng(seed||11),ks=sc.keys,out=[],w=k.world,w2=k.world2;
  for(let i=0;i<sc.n;i++){const f=i/(sc.n-1);let a=ks[0],b=ks[ks.length-1];
    for(let j=0;j<ks.length-1;j++)if(f>=ks[j][0]&&f<=ks[j+1][0]){a=ks[j];b=ks[j+1];break}
    const u=b[0]===a[0]?0:(f-a[0])/(b[0]-a[0]);
    let x=a[1]+(b[1]-a[1])*u,x2=(a[2]!=null?a[2]:(w2?w2.def:0));if(a[2]!=null&&b[2]!=null)x2=a[2]+(b[2]-a[2])*u;
    const j0=sc.jit?sc.jit[0]:0,j1=sc.jit?sc.jit[1]:0;
    x+=C.gauss(r)*j0;if(k.id!=="health"&&w2)x2+=C.gauss(r)*j1;
    x=C.con(x,w.min,w.max);if(w2&&k.id!=="health")x2=C.con(x2,w2.min,w2.max);
    if(k.id==="health"){x2=1;(sc.fingerGap||[]).forEach(g=>{if(f>=g[0]&&f<=g[1])x2=0})}
    out.push({i,f,x:+x.toFixed(2),x2:+x2.toFixed(2),ts:C.ts(sc.start,i*sc.dt)})}
  return out};
/* one row of a dataset: [timestamp, raw, value, label] (raw in the units the kit prints) */
C.rowFrom=function(k,L,o,ts){
  const labs=C.labelsFor(k,L);let lab=o.idx>=0?labs[o.idx]:(o.lab||"WAIT");
  let raw=o.raw;if(k.id==="photogate")raw=Math.round(o.raw/10)/100;
  let v=o.v;if(k.id!=="temp"&&k.id!=="moisture"&&k.id!=="photogate")v=Math.round(o.va);
  if(k.id==="temp"||k.id==="moisture"||k.id==="photogate")v=+o.va.toFixed(2);
  if(k.id==="health"){raw=o.ir;lab=o.lab}
  return [ts,raw,v,lab]};
C.generate=function(k,L,fix,P,seed,faults){
  const pts=C.scenario(k,L,seed||11),sim=k.id==="health"?new C.HSim(k,L,P,fix,(seed||11)+1):new C.Sim(k,L,P,fix,(seed||11)+1,1),rows=[],truth=[];
  const dtMs=k.id==="photogate"?2000:L.scenario.dt*1000;if(L.scenario.warm&&sim.warm!==undefined){sim.warm=true;sim.warmT=0}
  pts.forEach((p,i)=>{sim.x=p.x;sim.x2=p.x2;
    if(k.id==="photogate"){sim.y=null}
    const o=sim.step(dtMs);rows.push(C.rowFrom(k,L,o,p.ts));truth.push({x:p.x,x2:p.x2,ref:C.refIdx(k,L,p.x,p.x2)})});
  return {rows,truth,pts}};


/* faults a real kit produces: stuck values, a missing reading and a garbled one (for the cleaning step) */
C.inject=function(k,L,P,rows,every){
  const out=rows.map(r=>r.slice()),n=out.length,fr=k.faultRaw,labs=C.labelsFor(k,L);
  const at=[.19,.47,.71].map(f=>Math.floor(f*n));
  at.forEach((i,j)=>{let raw=fr[j%fr.length];if(k.id==="photogate")raw=j%2?9000:0.04;out[i][1]=raw;
    if(k.id==="photogate"){out[i][2]=Math.round(P.w/(raw/1e3)*100)/100}
    else if(k.id==="health"){out[i][2]=0;out[i][3]="NO_FINGER"}
    else{const v=k.value(raw,P);out[i][2]=v;const idx=C.idxStrict(k,L,k.id==="temp"||k.id==="moisture"?v:Math.round(v),P);out[i][3]=labs[idx]}});
  out[Math.floor(.33*n)][1]="";out[Math.floor(.61*n)][1]="ERR";
  return out};

/* ---------- spec tests ---------- */
C.fixSeed=s=>s*7919+13;
function stepTrial(k,L,P,fix,tr,noiseMul,seed){
  const s=new Sim(k,L,P,fix,seed,noiseMul);s.x=tr.a;s.x2=tr.a2!=null?tr.a2:(k.world2?k.world2.def:0);s.settle();
  const dt=P.delay;for(let i=0;i<Math.ceil(30000/dt);i++)s.step(dt);
  s.x=tr.b;s.x2=tr.b2!=null?tr.b2:s.x2;
  const want=C.refIdx(k,L,tr.b,s.x2);let first=-1,ok3=0,lat=Infinity,last=null,hist=[];
  const N=Math.ceil(150000/dt);
  for(let i=1;i<=N;i++){const o=s.step(dt);last=o;hist.push(o.idx);
    if(o.idx===want){if(first<0)first=i}else first=-1;
    if(first>0&&i-first>=3){lat=first*dt/1000;break}}
  if(lat===Infinity&&first>0)lat=first*dt/1000;
  const labs=C.labelsFor(k,L);
  return {name:tr.n,want:labs[want],got:last?(last.idx>=0?labs[last.idx]:"-"):"-",lat,v:last?last.va:0,ok:lat<=(tr.max!=null?tr.max:Infinity)&&last&&last.idx===want,max:tr.max}}
function staticTrial(k,L,P,fix,tr,noiseMul,seed){
  const s=new Sim(k,L,P,fix,seed,noiseMul);s.x=tr.a;s.x2=tr.a2!=null?tr.a2:(k.world2?k.world2.def:0);s.settle();
  let o;for(let i=0;i<14;i++)o=s.step(P.delay);
  const labs=C.labelsFor(k,L),want=C.refIdx(k,L,tr.a,s.x2);
  return {tr,o,want,labs,s}}
C.runSpec=function(k,L,P,fix,noiseMul,seedBase){
  const sp=L.spec,labs=C.labelsFor(k,L),parts=[],M={};seedBase=seedBase||1;
  const types=Array.isArray(sp.type)?sp.type:[sp.type];
  types.forEach(type=>{
   const T=(sp.sets&&sp.sets[type])||sp.trials;const rows=[];let hdr;
   if(type==="step"){let wrong=0,lat=0,reset=0;
    T.forEach((tr,i)=>{const r=stepTrial(k,L,P,fix,tr,noiseMul,C.fixSeed(seedBase+i));
      if(!r.ok)wrong++;
      if(tr.fall)reset=r.lat===Infinity?Infinity:Math.max(reset,r.lat);else lat=r.lat===Infinity?Infinity:Math.max(lat,r.lat);
      rows.push([r.name,r.want,r.lat===Infinity?"never":r.lat.toFixed(1)+" s",r.got,r.ok]);});
    M.lat=lat;M.reset=reset;M.wrong=(M.wrong||0)+wrong;
    hdr=["Trial","True state","Time to report it","Post says","OK?"]}
   else if(type==="static"){let err=0,wrong=0,dT=0;
    T.forEach((tr,i)=>{const r=staticTrial(k,L,P,fix,tr,noiseMul,C.fixSeed(seedBase+i));
      const truth=tr.a,e=r.o.va-truth;err=Math.max(err,Math.abs(e));
      if(k.id==="moisture"){dT=Math.max(dT,r.o.t-(tr.a2!=null?tr.a2:r.s.x2))}
      const okLab=r.o.idx===r.want;if(!okLab)wrong++;
      const dp=k.dec!=null?k.dec:0;
      rows.push([tr.n,truth.toFixed(k.world.dp)+" "+k.world.unit,r.o.va.toFixed(Math.max(dp,1)),(e>=0?"+":"")+e.toFixed(Math.max(dp,1)),labs[r.o.idx]||"-",(sp.tol==null||Math.abs(e)<=sp.tol)&&(sp.noLabel||okLab)]);});
    M.err=err;M.wrong=(M.wrong||0)+wrong;M.dT=dT;hdr=["Trial","True value","Post reads","Error","Post says","OK?"]}
   else if(type==="classify"){let ok=0;
    T.forEach((tr,i)=>{const r=staticTrial(k,L,P,fix,tr,noiseMul,C.fixSeed(seedBase+i));const good=r.o.idx===r.want;if(good)ok++;
      rows.push([tr.n,labs[r.want],r.o.va.toFixed(0)+(k.valUnit||""),labs[r.o.idx]||"-",good])});
    M.correct=ok;M.wrong=(M.wrong||0)+T.length-ok;hdr=["Trial","True class","Post reads","Post says","OK?"]}
   else if(type==="levels"){const vals=[];
    T.forEach((tr,i)=>{const s=new Sim(k,L,P,fix,C.fixSeed(seedBase+i),noiseMul);s.x=tr.a;s.settle();let o;for(let j=0;j<Math.max(1,Math.round(P.avgN))+2;j++)o=s.step(P.delay);vals.push(o.va)});
    let clear=1;vals.forEach((v,i)=>{if(i&&v-vals[i-1]>=3)clear++});
    vals.forEach((v,i)=>rows.push([T[i].n,T[i].a+" %",v.toFixed(0)+" %",i?((v-vals[i-1]>=3)?"clear step":"merges with the last level"):"-",i===0||v-vals[i-1]>=3]));
    M.levels=clear;hdr=["Tap","True strength","Post reads","Step from last tap","OK?"]}
   else if(type==="warm"){const pre=P.preheat;let bad=0;
    const s=new Sim(k,L,P,fix,C.fixSeed(seedBase),noiseMul);s.x=k.world.def;s.settle();
    const tauW=sp.tauWarm||35,fac=sp.warmFactor||6;
    for(let t=0;t<=180;t+=P.delay/1000){const ex=1+fac*Math.exp(-t/tauW);
      const o=s.step(P.delay);const rawW=o.raw*ex;const v=k.value(Math.round(rawW),P);const idx=C.idxStrict(k,L,v,P);
      if(t>=pre&&idx!==0)bad++;
      if(t%20<P.delay/1000)rows.push([Math.round(t)+" s",Math.round(rawW),v,labs[idx],t<pre?"warming (ignored)":(idx===0)])}
    M.warmFalse=bad;M.preheat=pre;hdr=["Time since power on","Raw ADC","Index","Post says","OK?"]}
   else if(type==="photo"){let wrong=0,err=0;
    T.forEach((tr,i)=>{const s=new Sim(k,L,P,fix,C.fixSeed(seedBase+i),noiseMul);s.x=tr.a;s.x2=tr.a2;s.settle();const o=s.step(50);
      const trueDur=tr.a2/tr.a*1000,gotDur=o.raw/1000,e=gotDur-trueDur;err=Math.max(err,Math.abs(e));
      const want=C.refIdx(k,L,tr.a,tr.a2),good=o.idx===want;if(!good)wrong++;
      rows.push([tr.n,trueDur.toFixed(1)+" ms",gotDur.toFixed(1)+" ms",(e>=0?"+":"")+e.toFixed(1)+" ms",o.v.toFixed(2)+" m/s  "+labs[o.idx],Math.abs(e)<(sp.errMs||10)&&good])});
    M.errMs=err;M.wrong=(M.wrong||0)+wrong;hdr=["Pass","True duration","Post measures","Error","Speed and state","OK?"]}
   else if(type==="beats"){let tv=0,wrong=0,errB=0;
    T.forEach((tr,i)=>{const r=C.beatTrial(L,P,fix,tr,C.fixSeed(seedBase+i));tv=Math.max(tv,r.t);errB=Math.max(errB,r.err);
      const good=r.t<=(sp.maxS||20)&&r.err<=(sp.errBpm||8);if(!good)wrong++;
      rows.push([tr.n,tr.a+" BPM",r.t===Infinity?"never":r.t.toFixed(0)+" s",r.bpm?r.bpm.toFixed(0)+" BPM":"-",(r.status||"-"),good])});
    M.tvalid=tv;M.errBpm=errB;M.wrong=(M.wrong||0)+wrong;hdr=["Person","True pulse","Time to a valid reading","Post reads","Status","OK?"]}
   parts.push({title:(sp.titles&&sp.titles[type])||"",hdr,rows});
  });
  M.delayMs=P.delay;M.confirmMs=P.delay*Math.max(1,Math.round(P.confirm));M.avgN=P.avgN;
  M.pause=(M.lat||0)+(Math.max(1,Math.round(P.confirm))-1)*P.delay/1000;
  const checks=sp.chk.map(p=>{const val=M[p.m];let ok;
    if(p.op==="<=")ok=val<=p.v;else if(p.op==="<")ok=val<p.v;else if(p.op===">=")ok=val>=p.v;else ok=val===p.v;
    return {txt:p.txt,ok,val,m:p.m,unit:p.unit||""}});
  return {parts,rows:parts[0].rows,M,checks,met:checks.every(c=>c.ok),hdr:parts[0].hdr}};
/* heart-rate model: a beat is only counted when the finger signal is good; loose fingers drop out and reset the average */
C.beatTrial=function(L,P,fix,tr,seed){
  const r=C.rng(seed),q=L.fix.dropout[fix?1:0],pdet=L.fix.pdet[fix?1:0],N=Math.max(1,Math.round(P.rate)),per=60/tr.a;
  let t=0,beatT=per*r(),got=[];
  while(t<60){t+=1;
    if(r()<q){got=[];beatT=t+per*0.5;continue}
    while(beatT<=t){ if(r()<pdet){got.push(tr.a*(1+C.gauss(r)*(fix?0.02:0.07)));if(got.length>N)got.shift()} beatT+=per }
    if(got.length>=N){const avg=got.reduce((a,b)=>a+b,0)/N;
      const st=avg>P.t2?2:(avg<P.t1?0:1);return {t,bpm:avg,err:Math.abs(avg-tr.a),status:C.labelsFor(K.health,L)[st]}}}
  return {t:Infinity,bpm:0,err:99,status:"NO_FINGER"}};

if(typeof module!=="undefined"&&module.exports)module.exports=C;else root.CS_CORE=C;
for(const id in K)K[id].id=id;
})(typeof window!=="undefined"?window:globalThis);
