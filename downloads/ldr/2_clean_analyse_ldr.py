# ==============================================================================
# DataSciensPro — 2_clean_analyse.py (LDR Light Sensor)
# Cleans noisy serial readings, removes floating rail spikes, calculates stats.
# Saves clean dataset to ldr_light_clean.csv.
# ==============================================================================

import pandas as pd
import numpy as np

CSV_IN  = 'ldr_light_data.csv'
CSV_OUT = 'ldr_light_clean.csv'

def clean_ldr_dataset():
    print("=" * 60)
    print("  DataSciensPro — Step 2: Data Cleaning & EDA (LDR)")
    print("=" * 60)

    # 1. Load CSV
    df = pd.read_csv(CSV_IN)
    print(f"• Ingested raw observations: {len(df)} rows")

    # 2. Type conversions
    df['Timestamp'] = pd.to_datetime(df['Timestamp'], errors='coerce')
    df['Raw_ADC'] = pd.to_numeric(df['Raw_ADC'], errors='coerce')
    df['Light_Percent'] = pd.to_numeric(df['Light_Percent'], errors='coerce')
    df['Condition'] = df['Condition'].astype(str).str.strip()

    # 3. Drop missing/corrupt rows
    df.dropna(subset=['Raw_ADC', 'Light_Percent', 'Condition'], inplace=True)

    # 4. Filter hardware rail anomalies (Floating disconnected wire or short circuit)
    # LDR calibrated between 0 and 4095, realistic readings 20 <= ADC <= 1000
    valid_mask = (df['Raw_ADC'] >= 0) & (df['Raw_ADC'] <= 4095)
    df_clean = df[valid_mask].copy()

    # 5. Outlier rejection via Z-Score on Raw ADC
    mean_val = df_clean['Raw_ADC'].mean()
    std_val  = df_clean['Raw_ADC'].std()
    if std_val > 0:
        z_scores = np.abs((df_clean['Raw_ADC'] - mean_val) / std_val)
        df_clean = df_clean[z_scores < 3.0].copy()

    # 6. Feature Engineering: Rolling 5-sample Moving Average
    df_clean['Light_Pct_MA5'] = df_clean['Light_Percent'].rolling(window=5, min_periods=1).mean().round(1)

    # 7. Summary Statistics
    print()
    print("--- DESCRIPTIVE SUMMARY STATISTICS ---")
    summary = df_clean[['Raw_ADC', 'Light_Percent']].describe().round(2)
    print(summary)

    print()
    print("--- CONDITION CATEGORY DISTRIBUTION ---")
    cond_counts = df_clean['Condition'].value_counts()
    for cond, count in cond_counts.items():
        pct = (count / len(df_clean)) * 100
        print(f"  {cond:<15}: {count:>4} samples ({pct:>5.1f}%)")

    # 8. Save Cleaned Dataset
    df_clean.to_csv(CSV_OUT, index=False)
    print()
    print(f"✓ Saved clean telemetry to '{CSV_OUT}' ({len(df_clean)} rows remaining).")
    return df_clean

if __name__ == '__main__':
    clean_ldr_dataset()