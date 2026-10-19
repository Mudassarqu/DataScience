# ==============================================================================
# DataSciensPro — 1_data_collection.py (LDR Light Sensor)
# Reads live serial stream from ESP32 Pin 36 (VP) at 9600 baud.
# Parses the pipe-delimited output and writes clean rows to ldr_light_data.csv.
# ==============================================================================

import serial
import csv
import time
from datetime import datetime

# ── CONFIGURATION ─────────────────────────────────────────────────────────────
COM_PORT  = 'COM5'          # Check Arduino IDE > Tools > Port (e.g. 'COM3' or '/dev/cu.usbserial')
BAUD_RATE = 9600            # Matches Serial.begin(9600) in Arduino sketch
CSV_FILE  = 'ldr_light_data.csv'
TARGET_SAMPLES = 100        # Collect 100 rows or press Ctrl+C to stop
# ──────────────────────────────────────────────────────────────────────────────

def parse_ldr_line(line_str):
    """
    Parses Arduino output format:
    'Raw ADC: 420  |  Light %: 35%  |  Condition: DIM  (indoor shade or twilight)'
    Returns: (raw_adc: int, light_percent: int, condition: str)
    """
    try:
        parts = line_str.split('|')
        if len(parts) >= 3:
            raw_str = parts[0].replace('Raw ADC:', '').strip()
            pct_str = parts[1].replace('Light %:', '').replace('%', '').strip()
            cond_str = parts[2].replace('Condition:', '').strip()
            # Clean condition text to short category
            short_cond = cond_str.split('(')[0].strip()
            return int(raw_str), int(pct_str), short_cond
    except (ValueError, IndexError):
        pass
    return None, None, None

def main():
    print("=" * 65)
    print("  DataSciensPro — LDR Sensor Data Collector")
    print(f"  Target Port: {COM_PORT} @ {BAUD_RATE} baud")
    print(f"  Destination: {CSV_FILE}")
    print("=" * 65)

    try:
        ser = serial.Serial(COM_PORT, BAUD_RATE, timeout=2)
        time.sleep(2)  # Allow ESP32 reboot cycle to complete
        ser.reset_input_buffer()
        print("✓ Connected to ESP32! Reading live light data...")
        print("  [Cover sensor with hand, point flashlight, or test room lamps]")
        print("  [Press Ctrl+C at any time to finish]")
        print()
    except Exception as err:
        print(f"✗ Connection Failed: {err}")
        print("  Troubleshooting tip: Close Arduino Serial Monitor first!")
        return

    row_count = 0
    with open(CSV_FILE, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Timestamp', 'Raw_ADC', 'Light_Percent', 'Condition'])

        print(f"  {'Timestamp':<20} | {'Raw ADC':>8} | {'Light %':>8} | {'Condition':<15}")
        print("  " + "-" * 60)

        try:
            while row_count < TARGET_SAMPLES:
                raw_bytes = ser.readline()
                line = raw_bytes.decode('utf-8', errors='ignore').strip()

                if 'Raw ADC:' in line:
                    raw_adc, light_pct, condition = parse_ldr_line(line)
                    if raw_adc is not None:
                        now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                        writer.writerow([now_str, raw_adc, light_pct, condition])
                        f.flush()
                        row_count += 1
                        print(f"  {now_str:<20} | {raw_adc:>8} | {str(light_pct)+'%':>8} | {condition:<15}")

        except KeyboardInterrupt:
            print()
            print("✓ Logging paused by user (Ctrl+C).")

    ser.close()
    print("=" * 65)
    print(f"✓ Completed! Successfully wrote {row_count} records to '{CSV_FILE}'.")
    print("  Next Step: Run 'python 2_clean_analyse.py' for Exploratory Data Analysis.")
    print("=" * 65)

if __name__ == '__main__':
    main()