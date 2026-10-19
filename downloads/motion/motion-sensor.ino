/*
  ============================================================
  DataSciensPro Kit — HC-SR501 / AM312 PIR Motion Detector
  ESP32 | Pin GPIO 27 (Digital Input) | Baud: 9600
  ============================================================
  Monitors infrared movement, measures active dwell duration,
  and streams formatted telemetry for time-series Python analysis.
  ============================================================
*/

const int PIR_PIN = 27;     // PIR digital signal on GPIO 27
const int RELAY_PIN = 25;   // Automated lighting relay output
const int BUZZER_PIN = 26;  // Security alert buzzer output

int lastMotionState = LOW;
unsigned long motionStartTime = 0;
unsigned long dwellDuration = 0;
unsigned long lastTelemetryTime = 0;
const unsigned long TELEMETRY_INTERVAL = 1000; // 1Hz telemetry

void setup() {
  Serial.begin(9600);
  pinMode(PIR_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  delay(1000);
  Serial.println("==================================================");
  Serial.println("  DataSciensPro Kit: PIR Motion Telemetry Stream  ");
  Serial.println("  Sensor: HC-SR501 / AM312  |  ESP32 GPIO 27      ");
  Serial.println("==================================================");
  Serial.println("Initializing PIR warm-up (3 seconds)...");
  delay(3000);
  Serial.println("Sensor Ready. Streaming telemetry...");
}

void loop() {
  int currentMotion = digitalRead(PIR_PIN);
  unsigned long now = millis();

  // State change edge detection
  if (currentMotion == HIGH && lastMotionState == LOW) {
    motionStartTime = now;
    digitalWrite(RELAY_PIN, HIGH); // Turn on smart room lights
  } else if (currentMotion == LOW && lastMotionState == HIGH) {
    digitalWrite(RELAY_PIN, LOW);
    digitalWrite(BUZZER_PIN, LOW);
    dwellDuration = 0;
  }

  if (currentMotion == HIGH) {
    dwellDuration = now - motionStartTime;
  } else {
    dwellDuration = 0;
  }

  lastMotionState = currentMotion;

  // Stream structured serial telemetry
  if (now - lastTelemetryTime >= TELEMETRY_INTERVAL) {
    lastTelemetryTime = now;

    String stateStr = (currentMotion == HIGH) ? "MOTION_DETECTED" : "NO_MOTION";
    String statusStr = "VACANT_STANDBY";

    if (currentMotion == HIGH) {
      if (dwellDuration > 6000) {
        statusStr = "CONTINUOUS_PRESENCE";
      } else if (dwellDuration > 2000) {
        statusStr = "ACTIVE_OCCUPANCY";
      } else {
        statusStr = "TRANSIT_PASSING";
      }
    }

    Serial.print("Motion: ");
    Serial.print(currentMotion);
    Serial.print("  |  State: ");
    Serial.print(stateStr);
    Serial.print("  |  Dwell_Time_ms: ");
    Serial.print(dwellDuration);
    Serial.print("  |  Status: ");
    Serial.println(statusStr);
  }
}
