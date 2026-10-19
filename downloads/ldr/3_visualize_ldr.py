# ==============================================================================
# DataSciensPro — 3_visualise.py (LDR Light Sensor)
# Generates 6 publication-grade figures saved to 300 DPI PNG images.
# ==============================================================================

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
df = pd.read_csv('ldr_light_clean.csv')

print("Generating 6 Scientific Charts for IB Criterion C/D ePortfolio...")

# ── Chart 1: Time-Series Chronological Trend with Threshold Zones ──────────────
plt.figure(figsize=(10, 4.5), dpi=300)
plt.plot(df.index, df['Light_Percent'], color='#06b6d4', linewidth=2, label='Measured Light %')
plt.plot(df.index, df['Light_Pct_MA5'], color='#f59e0b', linewidth=2, linestyle='--', label='5-Sample Moving Avg')
plt.axhline(70, color='#10b981', linestyle=':', label='Bright Threshold (70%)')
plt.axhline(30, color='#ef4444', linestyle=':', label='Dark Threshold (30%)')
plt.title('Figure 1: LDR Dynamic Illuminance Over Time', fontsize=12, fontweight='bold')
plt.xlabel('Sample Index (Time Sequence)', fontsize=10)
plt.ylabel('Light Intensity (%)', fontsize=10)
plt.ylim(0, 105)
plt.legend(loc='upper right', frameon=True)
plt.tight_layout()
plt.savefig('chart1_ldr_timeseries.png', dpi=300)
plt.close()
print("✓ Chart 1: chart1_ldr_timeseries.png created.")

# ── Chart 2: Condition Category Frequency (Bar Chart) ─────────────────────────
plt.figure(figsize=(7, 4), dpi=300)
order = ['DARK', 'DIM', 'BRIGHT', 'VERY BRIGHT']
counts = df['Condition'].value_counts().reindex(order).fillna(0)
bars = plt.bar(order, counts, color=['#3b82f6', '#06b6d4', '#f59e0b', '#10b981'], edgecolor='#1e293b')
plt.title('Figure 2: Distribution of Detected Ambient Lighting States', fontsize=12, fontweight='bold')
plt.xlabel('Lighting Condition', fontsize=10)
plt.ylabel('Observed Count', fontsize=10)
for bar in bars:
    yval = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2.0, yval + 1, int(yval), ha='center', va='bottom', fontsize=9)
plt.tight_layout()
plt.savefig('chart2_ldr_conditions_bar.png', dpi=300)
plt.close()
print("✓ Chart 2: chart2_ldr_conditions_bar.png created.")

# ── Chart 3: Proportional Share Donut Chart ──────────────────────────────────
plt.figure(figsize=(6, 5), dpi=300)
colors = ['#1e293b', '#64748b', '#f59e0b', '#38bdf8']
valid_counts = df['Condition'].value_counts()
plt.pie(valid_counts, labels=valid_counts.index, autopct='%1.1f%%', startangle=140,
        colors=colors, wedgeprops=dict(width=0.4, edgecolor='white'))
plt.title('Figure 3: Proportion of Classroom Illumination Exposure', fontsize=11, fontweight='bold')
plt.tight_layout()
plt.savefig('chart3_ldr_pie_share.png', dpi=300)
plt.close()
print("✓ Chart 3: chart3_ldr_pie_share.png created.")

# ── Chart 4: Light Intensity Histogram with KDE and Central Tendency ──────────
plt.figure(figsize=(8, 4.5), dpi=300)
sns.histplot(df['Light_Percent'], kde=True, color='#0284c7', bins=15)
plt.axvline(df['Light_Percent'].mean(), color='#ef4444', linewidth=2, label=f"Mean: {df['Light_Percent'].mean():.1f}%")
plt.axvline(df['Light_Percent'].median(), color='#10b981', linewidth=2, linestyle='--', label=f"Median: {df['Light_Percent'].median():.1f}%")
plt.title('Figure 4: Frequency Distribution & Statistical Central Tendency', fontsize=12, fontweight='bold')
plt.xlabel('Light Percentage (%)', fontsize=10)
plt.ylabel('Frequency', fontsize=10)
plt.legend()
plt.tight_layout()
plt.savefig('chart4_ldr_histogram.png', dpi=300)
plt.close()
print("✓ Chart 4: chart4_ldr_histogram.png created.")

# ── Chart 5: Box Plot Grouped by Condition ────────────────────────────────────
plt.figure(figsize=(8, 4.5), dpi=300)
sns.boxplot(x='Condition', y='Raw_ADC', data=df, palette='Set2', order=['DARK', 'DIM', 'BRIGHT', 'VERY BRIGHT'])
plt.title('Figure 5: Raw ADC Voltage Variance Across Lighting States', fontsize=12, fontweight='bold')
plt.xlabel('Condition', fontsize=10)
plt.ylabel('Raw ADC Reading (Inverted Transduction)', fontsize=10)
plt.tight_layout()
plt.savefig('chart5_ldr_boxplot.png', dpi=300)
plt.close()
print("✓ Chart 5: chart5_ldr_boxplot.png created.")

# ── Chart 6: Scatter Correlation (Raw ADC vs Calculated Light %) ──────────────
plt.figure(figsize=(8, 4.5), dpi=300)
plt.scatter(df['Raw_ADC'], df['Light_Percent'], alpha=0.7, color='#0ea5e9', edgecolors='none')
m, b = np.polyfit(df['Raw_ADC'], df['Light_Percent'], 1)
plt.plot(df['Raw_ADC'], m*df['Raw_ADC'] + b, color='#ef4444', linewidth=2, label=f'Fit Line (Slope={m:.3f})')
plt.title('Figure 6: Transduction Transfer Curve (Inverse Linear)', fontsize=12, fontweight='bold')
plt.xlabel('Raw ADC Value (Pin 36)', fontsize=10)
plt.ylabel('Calculated Light %', fontsize=10)
plt.legend()
plt.tight_layout()
plt.savefig('chart6_ldr_scatter_correlation.png', dpi=300)
plt.close()
print("✓ Chart 6: chart6_ldr_scatter_correlation.png created.")
print("All 6 visualization artifacts successfully exported!")