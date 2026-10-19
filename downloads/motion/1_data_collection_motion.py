# ==============================================================================
# DataSciensPro — 1_collect_data.py (PIR Motion Detection Sensor)
# Streams real-time motion states & dwell intervals to CSV.
# ==============================================================================

import serial
import csv
import time
import re
from datetime import datetime

SERIAL_PORT = 'COM5'  # Replace with your ESP32 serial port (e.g. /dev/ttyUSB0 on Linux)
BAUD_RATE = 9600
CSV_FILE = 'motion_telemetry_data.csv'

def parse_motion_line(line):
    # Regex parse: Motion: 1 | State: MOTION_DETECTED | Dwell_Time_ms: 2450 | Status: ACTIVE_OCCUPANCY
    match = re.search(r'Motion:\s*([01]).*State:\s*([A-Za-z_]+).*Dwell_Time_ms:\s*(\d+).*Status:\s*([A-Za-z_]+)', line)
    if match:
        m_state = int(match.group(1))
        m_label = match.group(2)
        dwell = int(match.group(3))
        status = match.group(4)
        return m_state, m_label, dwell, status
    return None, None, None, None

def main():
    print(f"Connecting to ESP32 Motion Detector on {SERIAL_PORT} @ {BAUD_RATE} baud...")
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=2)
        time.sleep(2)
        ser.reset_input_buffer()
        print("Connected! Listening for PIR motion telemetry (Press Ctrl+C to stop)...")
    except Exception as e:
        print(f"Error opening serial port {SERIAL_PORT}: {e}")
        return

    with open(CSV_FILE, mode='w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Timestamp', 'Elapsed_Seconds', 'Motion_State', 'State_Label', 'Dwell_Time_ms', 'Status'])

        start_time = time.time()
        try:
            while True:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                if 'Motion:' in line and 'Dwell_Time_ms:' in line:
                    m_state, m_label, dwell, status = parse_motion_line(line)
                    if m_state is not None:
                        elapsed = round(time.time() - start_time, 2)
                        now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                        writer.writerow([now_str, elapsed, m_state, m_label, dwell, status])
                        f.flush()
                        print(f"  [{now_str}] Motion: {m_state} | Dwell: {dwell}ms | Status: {status}")
        except KeyboardInterrupt:
            print("\n✓ Motion logging stopped by user.")

    ser.close()

if __name__ == '__main__':
    main()