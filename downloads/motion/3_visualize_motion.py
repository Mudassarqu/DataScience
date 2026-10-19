# ==============================================================================
# DataSciensPro — 3_visualise.py (PIR Motion Detection Sensor)
# Generates 6 publication-ready exploratory data analysis charts.
# ==============================================================================

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
df = pd.read_csv('motion_telemetry_clean.csv')

# Chart 1: Motion Trigger Events & Binary State Timeline
plt.figure(figsize=(10, 4.5), dpi=300)
plt.step(df.index, df['Motion_State'], where='post', color='#0284c7', linewidth=2, label='PIR Trigger State (0=Vacant, 1=Motion)')
plt.fill_between(df.index, df['Motion_State'], step='post', alpha=0.25, color='#38bdf8')
plt.title('Figure 1: Chronological PIR Motion Trigger State Transitions', fontweight='bold')
plt.xlabel('Sample Index (Seconds)')
plt.ylabel('Digital State')
plt.yticks([0, 1], ['0 (Vacant)', '1 (Motion)'])
plt.legend(loc='upper right')
plt.tight_layout()
plt.savefig('chart1_motion_timeline.png', dpi=300)
plt.close()
print("✓ Chart 1: chart1_motion_timeline.png created.")

# Chart 2: Dwell Duration Frequency Histogram & KDE
plt.figure(figsize=(7, 4), dpi=300)
motion_dwells = df[df['Dwell_Time_ms'] > 0]['Dwell_Time_ms']
if len(motion_dwells) > 0:
    sns.histplot(motion_dwells, kde=True, color='#0ea5e9', bins=12)
else:
    plt.text(0.5, 0.5, 'No Active Dwell Durations Logged', ha='center', va='center')
plt.title('Figure 2: Active Motion Dwell Duration Distribution', fontweight='bold')
plt.xlabel('Dwell Duration (ms)')
plt.ylabel('Observation Frequency')
plt.tight_layout()
plt.savefig('chart2_dwell_hist.png', dpi=300)
plt.close()
print("✓ Chart 2: chart2_dwell_hist.png created.")

# Chart 3: Occupancy State Frequencies Bar Chart
plt.figure(figsize=(7, 4), dpi=300)
state_order = ['VACANT_STANDBY', 'TRANSIT_PASSING', 'ACTIVE_OCCUPANCY', 'CONTINUOUS_PRESENCE']
available_states = [s for s in state_order if s in df['Status'].values]
if len(available_states) > 0:
    df['Status'].value_counts()[available_states].plot(kind='bar', color=['#64748b', '#38bdf8', '#0284c7', '#0369a1'])
else:
    df['Status'].value_counts().plot(kind='bar', color='#0284c7')
plt.title('Figure 3: Facility Occupancy State Frequency Breakdown', fontweight='bold')
plt.xlabel('Operational Status')
plt.ylabel('Logged Observations')
plt.xticks(rotation=15)
plt.tight_layout()
plt.savefig('chart3_occupancy_bar.png', dpi=300)
plt.close()
print("✓ Chart 3: chart3_occupancy_bar.png created.")

# Chart 4: Correlation Matrix Heatmap
plt.figure(figsize=(6, 5), dpi=300)
num_cols = ['Motion_State', 'Dwell_Time_ms', 'Rolling_Activity', 'Duty_Cycle_Pct']
corr = df[num_cols].corr()
sns.heatmap(corr, annot=True, cmap='Blues', fmt='.2f', vmin=-1, vmax=1)
plt.title('Figure 4: Motion Telemetry Correlation Matrix', fontweight='bold')
plt.tight_layout()
plt.savefig('chart4_motion_correlation.png', dpi=300)
plt.close()
print("✓ Chart 4: chart4_motion_correlation.png created.")

# Chart 5: Boxplot of Dwell Times across Operational Status
plt.figure(figsize=(7, 4), dpi=300)
sns.boxplot(x='Status', y='Dwell_Time_ms', data=df, palette='Blues')
plt.title('Figure 5: Motion Dwell Duration Variance Across Status Modes', fontweight='bold')
plt.xlabel('Status Category')
plt.ylabel('Dwell Duration (ms)')
plt.xticks(rotation=15)
plt.tight_layout()
plt.savefig('chart5_dwell_status_boxplot.png', dpi=300)
plt.close()
print("✓ Chart 5: chart5_dwell_status_boxplot.png created.")

# Chart 6: Cumulative Occupancy Duty Cycle vs Energy Demand Curve
plt.figure(figsize=(9, 4), dpi=300)
plt.plot(df.index, df['Duty_Cycle_Pct'], color='#0369a1', linewidth=2, label='Occupancy Duty Cycle (%)')
plt.axhline(50, color='#ef4444', linestyle='--', label='High Demand Threshold (50%)')
plt.title('Figure 6: Rolling Occupancy Duty Cycle & Smart Energy Demand', fontweight='bold')
plt.xlabel('Sample Index (Time Progress)')
plt.ylabel('Occupancy Duty Cycle (%)')
plt.legend()
plt.tight_layout()
plt.savefig('chart6_energy_duty_cycle.png', dpi=300)
plt.close()
print("✓ Chart 6: chart6_energy_duty_cycle.png created.")
print("All 6 visualization artifacts successfully exported!")