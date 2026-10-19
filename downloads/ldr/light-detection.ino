/*
  ============================================================
  DataSciensPro Kit — Light Detector Sensor (LDR) — FIXED
  ESP32 | Pin 36 (VP) | Baud Rate: 9600
  ============================================================
  CORRECTED for inverted LDR behaviour:
  LOW value  = BRIGHT (sunlight/torch)
  HIGH value = DARK   (sensor covered)
  ============================================================
*/

const int LDR_PIN = 36;
int lightValue = 0;

void setup() {
  Serial.begin(9600);
  Serial.println("------ Light Detector Sensor ------");
  Serial.println("Sensor: LDR | Pin: 36 | DataSciensPro Kit");
  Serial.println("-----------------------------------");
  delay(500);
}

void loop() {

  lightValue = analogRead(LDR_PIN);

  // Map the inverted value so 0 = dark, 4095 = bright
  // (makes it intuitive for students to read)
  int lightPercent = map(lightValue, 650, 0, 0, 100);
  lightPercent = constrain(lightPercent, 0, 100);

  Serial.print("Raw ADC: ");
  Serial.print(lightValue);
  Serial.print("  |  Light %: ");
  Serial.print(lightPercent);
  Serial.print("%  |  Condition: ");

  // INVERTED: low raw value = bright, high raw value = dark
  if (lightValue > 500) {
    Serial.println("DARK (sensor covered or room lights off)");
  }
  else if (lightValue > 300) {
    Serial.println("DIM  (indoor shade or twilight)");
  }
  else if (lightValue > 100) {
    Serial.println("BRIGHT (indoor light or cloudy daylight)");
  }
  else {
    Serial.println("VERY BRIGHT (direct sunlight or torch)");
  }

  delay(500);
}