# ==============================================================================
# DataSciensPro — 2_clean_analyse.py (PIR Motion Detection Sensor)
# Formats timestamps, derives event frequency, and computes occupancy metrics.
# ==============================================================================

import pandas as pd
import numpy as np

def clean_motion_dataset():
    df = pd.read_csv('motion_telemetry_data.csv')
    df['Timestamp'] = pd.to_datetime(df['Timestamp'], errors='coerce')
    df['Motion_State'] = pd.to_numeric(df['Motion_State'], errors='coerce').fillna(0).astype(int)
    df['Dwell_Time_ms'] = pd.to_numeric(df['Dwell_Time_ms'], errors='coerce').fillna(0).astype(int)
    df.dropna(subset=['Timestamp'], inplace=True)

    # Derive rolling 10-sample activity frequency
    df['Rolling_Activity'] = df['Motion_State'].rolling(window=10, min_periods=1).sum()

    # Derive occupancy duty cycle percentage
    df['Duty_Cycle_Pct'] = (df['Rolling_Activity'] / 10.0 * 100.0).round(1)

    # Calculate dwell seconds
    df['Dwell_Seconds'] = (df['Dwell_Time_ms'] / 1000.0).round(2)

    df.to_csv('motion_telemetry_clean.csv', index=False)
    print("✓ Clean motion telemetry saved to 'motion_telemetry_clean.csv'.")
    print(df[['Motion_State', 'Dwell_Time_ms', 'Rolling_Activity', 'Duty_Cycle_Pct']].describe())

if __name__ == '__main__':
    clean_motion_dataset()