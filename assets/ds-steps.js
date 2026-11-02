/* Lab 2 steps. Each step: starter (student edits), solution, tests (run after student code; S = student globals, RAW = rows as dicts). */
window.DS_STEPS=[
{id:"parse",title:"1 · Collect: parse a serial line",c:"C2",
 goal:"Your Arduino sketch prints one line per reading. Python has to turn that text into numbers. Finish <code>parse_ldr_line()</code> so it returns <code>(raw, percent, condition)</code> and returns <code>(None, None, None)</code> when the line is damaged (this is the function from <code>1_data_collection.py</code>).",
 hints:["The first part is done for you. For the percent, remove the text <code>Light %:</code> and the <code>%</code> sign from <code>parts[1]</code>, strip the spaces, then convert with <code>int()</code>.","<code>int(parts[1].replace('Light %:', '').replace('%', '').strip())</code>"],
 starter:`def parse_ldr_line(line):
    """'Raw ADC: 420  |  Light %: 35%  |  Condition: DIM  (indoor shade or twilight)'
       -> (420, 35, 'DIM')      or (None, None, None) if the line is damaged."""
    try:
        parts = line.split('|')
        if len(parts) >= 3:
            raw = int(parts[0].replace('Raw ADC:', '').strip())
            pct = int(___)          # <- remove 'Light %:' and '%' from parts[1]
            cond = parts[2].replace('Condition:', '').strip().split('(')[0].strip()
            return raw, pct, cond
    except (ValueError, IndexError):
        pass
    return None, None, None


serial_lines = [
    "Raw ADC: 420  |  Light %: 35%  |  Condition: DIM  (indoor shade or twilight)",
    "Raw ADC: 688  |  Light %: 0%  |  Condition: DARK (sensor covered or room lights off)",
    "Ra#w AD@C: 51??",
]
for line in serial_lines:
    print(parse_ldr_line(line))
`,
 solution:`def parse_ldr_line(line):
    try:
        parts = line.split('|')
        if len(parts) >= 3:
            raw = int(parts[0].replace('Raw ADC:', '').strip())
            pct = int(parts[1].replace('Light %:', '').replace('%', '').strip())
            cond = parts[2].replace('Condition:', '').strip().split('(')[0].strip()
            return raw, pct, cond
    except (ValueError, IndexError):
        pass
    return None, None, None
`,
 tests:`
t("Good DIM line", lambda: S["parse_ldr_line"]("Raw ADC: 420  |  Light %: 35%  |  Condition: DIM  (indoor shade or twilight)"), (420,35,"DIM"))
t("Good DARK line", lambda: S["parse_ldr_line"]("Raw ADC: 688  |  Light %: 0%  |  Condition: DARK (sensor covered or room lights off)"), (688,0,"DARK"))
t("VERY BRIGHT keeps both words", lambda: S["parse_ldr_line"]("Raw ADC: 20  |  Light %: 97%  |  Condition: VERY BRIGHT (direct sunlight or torch)"), (20,97,"VERY BRIGHT"))
t("Damaged line gives (None, None, None)", lambda: S["parse_ldr_line"]("Ra#w AD@C: 51??"), (None,None,None))
t("Number replaced by text gives (None, None, None)", lambda: S["parse_ldr_line"]("Raw ADC: ERR  |  Light %: 5%  |  Condition: DARK"), (None,None,None))
`},
{id:"clean",title:"2 · Clean: remove bad data",c:"C2",
 goal:"Raw sensor data is never perfect. Finish <code>clean(rows)</code> so it (1) drops rows with missing or non-numeric values, (2) drops impossible readings outside <code>LOW_OK..HIGH_OK</code> (a floating wire gives 0 or 4095), (3) removes statistical outliers with a z-score of 3 or more, and (4) adds a 5-sample moving average. This is <code>2_clean_analyse.py</code> written without pandas.",
 hints:["Fill the blank with a test for a reading that is too low OR too high: <code>raw < LOW_OK or raw > HIGH_OK</code>.","Outliers: <code>abs((value - mean) / sd) < 3.0</code> keeps a row. Use <code>statistics.mean()</code> and <code>statistics.stdev()</code>.","Moving average: for row number i, average the Light_Percent of rows i-4 to i (fewer at the start). Round to 1 decimal."],
 starter:`import statistics

LOW_OK, HIGH_OK = 5, 1000      # sensible ADC range for this LDR circuit


def to_number(x):
    """Return x as a float, or None if it is not a number."""
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


def clean(rows):
    out = []
    # 1 and 2. convert, then drop bad rows and impossible readings
    for r in rows:
        raw = to_number(r.get("Raw_ADC"))
        pct = to_number(r.get("Light_Percent"))
        cond = str(r.get("Condition") or "").strip()
        if raw is None or pct is None or cond == "":
            continue
        if ___:                      # <- reading outside LOW_OK..HIGH_OK
            continue
        out.append({"Timestamp": r["Timestamp"], "Raw_ADC": raw,
                    "Light_Percent": pct, "Condition": cond})

    # 3. z-score outlier rejection on Raw_ADC (keep rows with |z| < 3)
    if len(out) > 2:
        values = [r["Raw_ADC"] for r in out]
        mean = statistics.mean(values)
        sd = statistics.stdev(values)
        if sd > 0:
            out = [r for r in out if ___]      # <- |z| < 3.0

    # 4. rolling 5-sample moving average of Light_Percent
    for i, r in enumerate(out):
        window = [x["Light_Percent"] for x in out[max(0, i - 4): i + 1]]
        r["Light_Pct_MA5"] = round(sum(window) / len(window), 1)
    return out


cleaned = clean(RAW)          # RAW is the dataset you chose above
print("rows in :", len(RAW))
print("rows out:", len(cleaned))
print("first   :", cleaned[0])
`,
 solution:`import statistics

LOW_OK, HIGH_OK = 5, 1000

def to_number(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return None

def clean(rows):
    out = []
    for r in rows:
        raw = to_number(r.get("Raw_ADC"))
        pct = to_number(r.get("Light_Percent"))
        cond = str(r.get("Condition") or "").strip()
        if raw is None or pct is None or cond == "":
            continue
        if raw < LOW_OK or raw > HIGH_OK:
            continue
        out.append({"Timestamp": r["Timestamp"], "Raw_ADC": raw,
                    "Light_Percent": pct, "Condition": cond})
    if len(out) > 2:
        values = [r["Raw_ADC"] for r in out]
        mean = statistics.mean(values)
        sd = statistics.stdev(values)
        if sd > 0:
            out = [r for r in out if abs((r["Raw_ADC"] - mean) / sd) < 3.0]
    for i, r in enumerate(out):
        window = [x["Light_Percent"] for x in out[max(0, i - 4): i + 1]]
        r["Light_Pct_MA5"] = round(sum(window) / len(window), 1)
    return out

cleaned = clean(RAW)
print("rows in :", len(RAW))
print("rows out:", len(cleaned))
print("first   :", cleaned[0])
`,
 tests:`
import statistics as _st, json as _j
def _ref(rows):
    def num(x):
        try: return float(x)
        except (TypeError, ValueError): return None
    out=[]
    for r in rows:
        raw=num(r.get("Raw_ADC")); pct=num(r.get("Light_Percent")); cond=str(r.get("Condition") or "").strip()
        if raw is None or pct is None or cond=="": continue
        if raw<5 or raw>1000: continue
        out.append({"Timestamp":r["Timestamp"],"Raw_ADC":raw,"Light_Percent":pct,"Condition":cond})
    if len(out)>2:
        v=[r["Raw_ADC"] for r in out]; m=_st.mean(v); sd=_st.stdev(v)
        if sd>0: out=[r for r in out if abs((r["Raw_ADC"]-m)/sd)<3.0]
    for i,r in enumerate(out):
        w=[x["Light_Percent"] for x in out[max(0,i-4):i+1]]; r["Light_Pct_MA5"]=round(sum(w)/len(w),1)
    return out
RAW=S["RAW"]
ref=_ref(RAW)
got=S["clean"](RAW)
check("Returns a list of rows", isinstance(got,list) and len(got)>0, "type %s"%type(got).__name__)
t("Keeps the right number of rows", lambda: len(got), len(ref))
check("No impossible readings left (5 to 1000 only)", all(5<=r["Raw_ADC"]<=1000 for r in got), "")
check("All values are numbers", all(isinstance(r["Raw_ADC"],(int,float)) and isinstance(r["Light_Percent"],(int,float)) for r in got), "")
check("No empty Condition", all(r["Condition"] for r in got), "")
t("Moving average of the last row", lambda: got[-1]["Light_Pct_MA5"], ref[-1]["Light_Pct_MA5"], True)
t("Moving average of the 3rd row", lambda: got[2]["Light_Pct_MA5"], ref[2]["Light_Pct_MA5"], True)
print("@@DATA@@"+_j.dumps(got))
`},
{id:"analyse",title:"3 · Analyse: statistics",c:"C2",
 goal:"Turn the cleaned rows into numbers you can talk about. Finish <code>summary()</code>, <code>condition_counts()</code> and <code>percent_share()</code>. This replaces <code>describe()</code> and <code>value_counts()</code> from the pandas script.",
 hints:["<code>statistics.median(list)</code> gives the middle value. <code>statistics.stdev(list)</code> is the sample standard deviation (the same as pandas).","<code>counts[c] = counts.get(c, 0) + 1</code> counts how often each condition appears.","Share = count ÷ total × 100, rounded to 1 decimal place."],
 starter:`import statistics

def summary(rows):
    raws = [r["Raw_ADC"] for r in rows]
    pcts = [r["Light_Percent"] for r in rows]
    return {
        "count": len(rows),
        "mean_raw": round(statistics.mean(raws), 2),
        "median_raw": statistics.median(raws),
        "std_raw": round(___, 2),            # <- sample standard deviation of raws
        "mean_pct": round(statistics.mean(pcts), 2),
        "min_pct": min(pcts),
        "max_pct": max(pcts),
    }


def condition_counts(rows):
    counts = {}
    for r in rows:
        c = r["Condition"]
        counts[c] = ___                      # <- add one to this condition's count
    return counts


def percent_share(counts):
    total = sum(counts.values())
    return {c: round(n / total * 100, 1) for c, n in counts.items()}


cleaned = clean_rows        # the cleaned rows from Step 2 (done for you)
print(summary(cleaned))
print(condition_counts(cleaned))
print(percent_share(condition_counts(cleaned)))
`,
 solution:`import statistics

def summary(rows):
    raws = [r["Raw_ADC"] for r in rows]
    pcts = [r["Light_Percent"] for r in rows]
    return {
        "count": len(rows),
        "mean_raw": round(statistics.mean(raws), 2),
        "median_raw": statistics.median(raws),
        "std_raw": round(statistics.stdev(raws), 2),
        "mean_pct": round(statistics.mean(pcts), 2),
        "min_pct": min(pcts),
        "max_pct": max(pcts),
    }

def condition_counts(rows):
    counts = {}
    for r in rows:
        c = r["Condition"]
        counts[c] = counts.get(c, 0) + 1
    return counts

def percent_share(counts):
    total = sum(counts.values())
    return {c: round(n / total * 100, 1) for c, n in counts.items()}

cleaned = clean_rows
print(summary(cleaned))
print(condition_counts(cleaned))
print(percent_share(condition_counts(cleaned)))
`,
 tests:`
import statistics as _st
rows=S["clean_rows"]
raws=[r["Raw_ADC"] for r in rows]; pcts=[r["Light_Percent"] for r in rows]
s=S["summary"](rows)
t("count", lambda: s["count"], len(rows))
t("mean_raw", lambda: s["mean_raw"], round(_st.mean(raws),2), True)
t("median_raw", lambda: s["median_raw"], _st.median(raws), True)
t("std_raw (sample standard deviation)", lambda: s["std_raw"], round(_st.stdev(raws),2), True)
t("mean_pct", lambda: s["mean_pct"], round(_st.mean(pcts),2), True)
cc={}
for r in rows: cc[r["Condition"]]=cc.get(r["Condition"],0)+1
t("condition_counts", lambda: S["condition_counts"](rows), cc)
t("percent_share", lambda: S["percent_share"](cc), {c:round(n/len(rows)*100,1) for c,n in cc.items()})
`},
{id:"decide",title:"4 · Decide: set thresholds from data",c:"C4",
 goal:"Good designers justify numbers with evidence. Finish <code>suggest_threshold()</code>: take the median raw reading of two conditions and return the midpoint (rounded to a whole number). Compare it with the 500 / 300 / 100 values in your sketch and write your justification below the charts.",
 hints:["Collect the Raw_ADC values for each condition with a list comprehension, then use <code>statistics.median()</code> on each.","Midpoint = (median_a + median_b) / 2. If either condition has no rows, return <code>None</code>."],
 starter:`import statistics

def suggest_threshold(rows, cond_a="DARK", cond_b="DIM"):
    a = [r["Raw_ADC"] for r in rows if r["Condition"] == cond_a]
    b = [r["Raw_ADC"] for r in rows if r["Condition"] == cond_b]
    if not a or not b:
        return None
    return round(___)            # <- midpoint of the two medians


cleaned = clean_rows
print("DARK / DIM boundary    :", suggest_threshold(cleaned, "DARK", "DIM"))
print("DIM / BRIGHT boundary  :", suggest_threshold(cleaned, "DIM", "BRIGHT"))
print("Your sketch uses 500 and 300. Does the data agree?")
`,
 solution:`import statistics

def suggest_threshold(rows, cond_a="DARK", cond_b="DIM"):
    a = [r["Raw_ADC"] for r in rows if r["Condition"] == cond_a]
    b = [r["Raw_ADC"] for r in rows if r["Condition"] == cond_b]
    if not a or not b:
        return None
    return round((statistics.median(a) + statistics.median(b)) / 2)

cleaned = clean_rows
print(suggest_threshold(cleaned, "DARK", "DIM"))
print(suggest_threshold(cleaned, "DIM", "BRIGHT"))
`,
 tests:`
import statistics as _st
rows=S["clean_rows"]
def ref(a,b):
    x=[r["Raw_ADC"] for r in rows if r["Condition"]==a]; y=[r["Raw_ADC"] for r in rows if r["Condition"]==b]
    return None if not x or not y else round((_st.median(x)+_st.median(y))/2)
t("DARK / DIM boundary", lambda: S["suggest_threshold"](rows,"DARK","DIM"), ref("DARK","DIM"))
t("DIM / BRIGHT boundary", lambda: S["suggest_threshold"](rows,"DIM","BRIGHT"), ref("DIM","BRIGHT"))
t("Returns None when a condition is missing", lambda: S["suggest_threshold"](rows,"DARK","PURPLE"), None)
t("Result is a whole number", lambda: isinstance(S["suggest_threshold"](rows,"DARK","DIM"),int) or S["suggest_threshold"](rows,"DARK","DIM") is None, True)
`}
];
