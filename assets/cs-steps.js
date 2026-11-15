/* Lab 2 steps for every Criterion C sensor lesson, built from the lesson's own settings (window.CSL.py). */
window.CS_BUILD=function(CSL){
const Y=CSL.py,H=JSON.stringify(Y.cols);
const q=s=>JSON.stringify(s);
const ST=[];
const unit=Y.unit?(" ("+Y.unit+")"):"";
/* ---------- 1 parse ---------- */
const L0=Y.lines[0],L1=Y.lines[1],L2=Y.lines[2];
const pf=(line)=>{const p=line.split("|");if(p.length<3)return null;const g=s=>parseFloat(s.split(":")[1].trim().split(/\s+/)[0]);return [g(p[0]),g(p[1]),p[p.length-1].split(":")[1].trim()]};
const pyT=a=>a?`(${a[0]}, ${a[1]}, ${q(a[2])})`:"(None, None, None)";
const e0=pf(L0),e1=pf(L1),e2=pf(L2);
const DAMAGED="Ra#w AD@C: 51??";
const F1=L0.split("|")[0].split(":")[0].trim();
ST.push({id:"parse",title:"1 · Collect: parse a serial line",c:"C2",
 goal:`Your sketch prints one line per reading. <code>parse_line()</code> turns that text into numbers: <code>(first number, second number, status word)</code>, or <code>(None, None, None)</code> when the line is damaged. This is the job of <code>1_data_collection.py</code> in your kit. The code already works: press <strong>Just run it</strong> first. The <span class="ed">yellow</span> text is yours to change.<ul class="tryit"><li><span class="lv basic">BASIC</span> Change the damaged line (delete a colon or add a letter inside a number). What does <code>parse_line</code> return?</li><li><span class="lv moderate">MODERATE</span> Write a damaged line that still gives numbers. Why did it get through?</li><li><span class="lv advanced">ADVANCED</span> Add a fourth line of your own to <code>serial_lines</code> and predict the output before you run it.</li></ul>`,
 hints:[`Press Just run it. The third line is damaged, so you should see <code>(None, None, None)</code> for it.`,`Damaged ideas: remove a <code>|</code>, replace a number with letters, or cut the line short.`],
 starter:`def parse_line(line):
    """${L0.replace(/"/g,"'")}
       -> ${pyT(e0).replace(/"/g,"'")}   or (None, None, None) if the line is damaged."""
    try:
        parts = line.split('|')
        if len(parts) >= 3:
            first = float(parts[0].split(':')[1].strip().split()[0].rstrip('%'))
            second = float(parts[1].split(':')[1].strip().split()[0].rstrip('%'))
            status = parts[-1].split(':')[1].strip()
            return first, second, status
    except (ValueError, IndexError):
        pass
    return None, None, None


serial_lines = [
    ${q(L0)},
    ${q(L1)},
    ${q(DAMAGED)},      # <- change this damaged line
]
for line in serial_lines:
    print(parse_line(line))
`,
 solution:`def parse_line(line):
    try:
        parts = line.split('|')
        if len(parts) >= 3:
            first = float(parts[0].split(':')[1].strip().split()[0].rstrip('%'))
            second = float(parts[1].split(':')[1].strip().split()[0].rstrip('%'))
            status = parts[-1].split(':')[1].strip()
            return first, second, status
    except (ValueError, IndexError):
        pass
    return None, None, None
`,
 tests:`
t("First kit line", lambda: S["parse_line"](${q(L0)}), ${pyT(e0)})
t("Second kit line", lambda: S["parse_line"](${q(L1)}), ${pyT(e1)})
t("Third kit line keeps the whole status word", lambda: S["parse_line"](${q(L2)}), ${pyT(e2)})
t("Damaged line gives (None, None, None)", lambda: S["parse_line"](${q(DAMAGED)}), (None,None,None))
t("Number replaced by text gives (None, None, None)", lambda: S["parse_line"]("${F1}: ERR  |  Value: 5  |  Status: OK"), (None,None,None))
`});
/* ---------- 2 clean ---------- */
const zc=Y.zmax>3?`# a real event is a big jump, so 3 would delete it. Why is ${Y.zmax} a better choice here?`:"# a z-score of 3 or more is a rare, suspicious value";
const cleanBody=(blank)=>`import statistics

LOW_OK, HIGH_OK = ${Y.lo}, ${Y.hi}      # <- change these numbers (sensible range for this sensor circuit)
Z_MAX = ${Y.zmax}                   # <- change this number ${zc.replace(/^# /,"")}
WINDOW = 5                      # <- change this number (readings in the moving average)
RAW_COL, VAL_COL, LAB_COL = ${q(Y.RAW)}, ${q(Y.VAL)}, ${q(Y.LAB)}


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
        raw = to_number(r.get(RAW_COL))
        val = to_number(r.get(VAL_COL))
        lab = str(r.get(LAB_COL) or "").strip()
        if raw is None or val is None or lab == "":
            continue
        if raw < LOW_OK or raw > HIGH_OK:                  # outside the sensible range
            continue
        out.append({"Timestamp": r["Timestamp"], RAW_COL: raw, VAL_COL: val, LAB_COL: lab})

    # 3. z-score outlier rejection on the raw column (keep rows with |z| < Z_MAX)
    if len(out) > 2:
        values = [r[RAW_COL] for r in out]
        mean = statistics.mean(values)
        sd = statistics.stdev(values)
        if sd > 0:
            out = [r for r in out if abs((r[RAW_COL] - mean) / sd) < Z_MAX]

    # 4. rolling moving average of the value column (WINDOW readings)
    for i, r in enumerate(out):
        window = [x[VAL_COL] for x in out[max(0, i - WINDOW + 1): i + 1]]
        r["Value_MA5"] = round(sum(window) / len(window), 2)
    return out


cleaned = clean(RAW)          # RAW is the dataset you chose above
print("rows in :", len(RAW))
print("rows out:", len(cleaned))
print("removed :", len(RAW) - len(cleaned))
print("first   :", cleaned[0])
`;
ST.push({id:"clean",title:"2 · Clean: remove bad data",c:"C2",
 goal:`Raw sensor data is never perfect. <code>clean(rows)</code> (1) drops rows with missing or non-numeric values, (2) drops impossible readings outside <code>LOW_OK..HIGH_OK</code> (a loose wire gives stuck values such as ${Y.lo<=0?"0":"a number far outside the range"}), (3) removes outliers with a z-score of <code>Z_MAX</code> or more, and (4) adds a moving average of <code>WINDOW</code> readings. This is <code>2_clean_analyse.py</code> written without pandas. It already works: press <strong>Just run it</strong>, note <em>removed</em>, then change the <span class="ed">yellow</span> numbers and run again.<ul class="tryit"><li><span class="lv basic">BASIC</span> Change <code>LOW_OK</code> or <code>HIGH_OK</code>. Does the <em>removed</em> number go up or down?</li><li><span class="lv moderate">MODERATE</span> Change <code>Z_MAX</code> to 1.5, then 5. Which value removes real events? Use Figure 1.</li><li><span class="lv advanced">ADVANCED</span> Change <code>WINDOW</code> to 2, then 10. Compare the dashed line in Figure 2 and explain the trade-off.</li></ul>`,
 hints:[`Press Just run it first, then Check my code. After that, change one number at a time so you know which change did what.`,`A bigger <code>Z_MAX</code> keeps more rows. A smaller one removes more, including real events.`,`A bigger <code>WINDOW</code> makes a smoother line that reacts later.`],
 starter:cleanBody(true),solution:cleanBody(false),
 tests:`
import statistics as _st, json as _j
RAW_COL,VAL_COL,LAB_COL=${q(Y.RAW)},${q(Y.VAL)},${q(Y.LAB)}
LO,HI,ZM,WN=S["LOW_OK"],S["HIGH_OK"],S["Z_MAX"],S["WINDOW"]
check("Your numbers make sense (LOW_OK below HIGH_OK, Z_MAX above 0, WINDOW at least 1)", LO<HI and ZM>0 and WN>=1 and int(WN)==WN, "LOW_OK=%s HIGH_OK=%s Z_MAX=%s WINDOW=%s"%(LO,HI,ZM,WN))
def _ref(rows):
    def num(x):
        try: return float(x)
        except (TypeError, ValueError): return None
    out=[]
    for r in rows:
        raw=num(r.get(RAW_COL)); val=num(r.get(VAL_COL)); lab=str(r.get(LAB_COL) or "").strip()
        if raw is None or val is None or lab=="": continue
        if raw<LO or raw>HI: continue
        out.append({"Timestamp":r["Timestamp"],RAW_COL:raw,VAL_COL:val,LAB_COL:lab})
    if len(out)>2:
        v=[r[RAW_COL] for r in out]; m=_st.mean(v); sd=_st.stdev(v)
        if sd>0: out=[r for r in out if abs((r[RAW_COL]-m)/sd)<ZM]
    for i,r in enumerate(out):
        w=[x[VAL_COL] for x in out[max(0,i-int(WN)+1):i+1]]; r["Value_MA5"]=round(sum(w)/len(w),2)
    return out
RAW=S["RAW"]
ref=_ref(RAW)
got=S["clean"](RAW)
check("Returns a list of rows", isinstance(got,list) and len(got)>0, "type %s"%type(got).__name__)
t("Keeps the right number of rows", lambda: len(got), len(ref))
check("No impossible readings left (only LOW_OK to HIGH_OK)", all(LO<=r[RAW_COL]<=HI for r in got), "")
check("All values are numbers", all(isinstance(r[RAW_COL],(int,float)) and isinstance(r[VAL_COL],(int,float)) for r in got), "")
check("No empty status word", all(r[LAB_COL] for r in got), "")
t("Moving average of the last row", lambda: got[-1]["Value_MA5"], ref[-1]["Value_MA5"], True)
t("Moving average of the 3rd row", lambda: got[2]["Value_MA5"], ref[2]["Value_MA5"], True)
print("@@DATA@@"+_j.dumps(got))
`});
/* ---------- 3 analyse ---------- */
const analyseBody=(b)=>`import statistics

RAW_COL, VAL_COL, LAB_COL = ${q(Y.RAW)}, ${q(Y.VAL)}, ${q(Y.LAB)}
DECIMALS = 2          # <- change this number (decimal places in the summary)

def summary(rows):
    raws = [r[RAW_COL] for r in rows]
    vals = [r[VAL_COL] for r in rows]
    return {
        "count": len(rows),
        "mean_raw": round(statistics.mean(raws), DECIMALS),
        "median_raw": statistics.median(raws),
        "std_raw": round(statistics.stdev(raws), DECIMALS),     # sample standard deviation
        "mean_val": round(statistics.mean(vals), DECIMALS),
        "min_val": min(vals),
        "max_val": max(vals),
    }


def status_counts(rows):
    counts = {}
    for r in rows:
        c = r[LAB_COL]
        counts[c] = counts.get(c, 0) + 1        # add one to this status's count
    return counts


def percent_share(counts):
    total = sum(counts.values())
    return {c: round(n / total * 100, 1) for c, n in counts.items()}


cleaned = clean_rows        # the cleaned rows from Step 2 (done for you)
print(summary(cleaned))
print(status_counts(cleaned))
print(percent_share(status_counts(cleaned)))
`;
ST.push({id:"analyse",title:"3 · Analyse: statistics",c:"C2",
 goal:`Turn the cleaned rows into numbers you can talk about. <code>summary()</code>, <code>status_counts()</code> and <code>percent_share()</code> replace <code>describe()</code> and <code>value_counts()</code> from the pandas script. It already works: press <strong>Just run it</strong> and read the three printed lines.<ul class="tryit"><li><span class="lv basic">BASIC</span> Change <code>DECIMALS</code> to 0 and then 4. What changes in the printout?</li><li><span class="lv moderate">MODERATE</span> Choose <em>the same day WITH your design change</em> in the data menu, pass Step 2 again, run this step and compare the percentages.</li><li><span class="lv advanced">ADVANCED</span> Add one line to the summary, for example <code>"range_val": max(vals) - min(vals)</code>, and say what it tells you.</li></ul>`,
 hints:[`<code>statistics.median(list)</code> gives the middle value. <code>statistics.stdev(list)</code> is the sample standard deviation (the same as pandas).`,`<code>counts[c] = counts.get(c, 0) + 1</code> counts how often each status appears.`,`Share = count ÷ total × 100, rounded to 1 decimal place.`],
 starter:analyseBody(true),solution:analyseBody(false),
 tests:`
import statistics as _st
RAW_COL,VAL_COL,LAB_COL=${q(Y.RAW)},${q(Y.VAL)},${q(Y.LAB)}
rows=S["clean_rows"]
DP=S["DECIMALS"]
check("DECIMALS is a whole number from 0 to 6", isinstance(DP,int) and 0<=DP<=6, "DECIMALS=%r"%(DP,))
raws=[r[RAW_COL] for r in rows]; vals=[r[VAL_COL] for r in rows]
s=S["summary"](rows)
t("count", lambda: s["count"], len(rows))
t("mean_raw", lambda: s["mean_raw"], round(_st.mean(raws),DP), True)
t("median_raw", lambda: s["median_raw"], _st.median(raws), True)
t("std_raw (sample standard deviation)", lambda: s["std_raw"], round(_st.stdev(raws),DP), True)
t("mean_val", lambda: s["mean_val"], round(_st.mean(vals),DP), True)
cc={}
for r in rows: cc[r[LAB_COL]]=cc.get(r[LAB_COL],0)+1
t("status_counts", lambda: S["status_counts"](rows), cc)
t("percent_share", lambda: S["percent_share"](cc), {c:round(n/len(rows)*100,1) for c,n in cc.items()})
`});
/* ---------- 4 decide ---------- */
const LB=Y.dl.length>=3?Y.dl:Y.labels;
const decBody=(b)=>`import statistics

VAL_COL, LAB_COL = ${q(Y.VAL)}, ${q(Y.LAB)}
CENTRE = statistics.median     # <- change to statistics.mean to try the average instead
DECIMALS = 1                   # <- change this number

def suggest_threshold(rows, status_a, status_b):
    a = [r[VAL_COL] for r in rows if r[LAB_COL] == status_a]
    b = [r[VAL_COL] for r in rows if r[LAB_COL] == status_b]
    if not a or not b:
        return None
    return round((CENTRE(a) + CENTRE(b)) / 2, DECIMALS)      # midpoint of the two centres


cleaned = clean_rows
print(${q(LB[0]+" / "+LB[1]+" boundary :")}, suggest_threshold(cleaned, ${q(LB[0])}, ${q(LB[1])}))
print(${q(LB[1]+" / "+LB[2]+" boundary :")}, suggest_threshold(cleaned, ${q(LB[1])}, ${q(LB[2])}))
print("Your sketch uses ${Y.t1} and ${Y.t2}. Does the data agree?")
`;
ST.push({id:"decide",title:"4 · Decide: set thresholds from data",c:"C4",
 goal:`Good designers justify numbers with evidence. <code>suggest_threshold()</code> takes the centre (median) value of two statuses and returns the midpoint. Press <strong>Just run it</strong>, then compare the two boundaries with the ${Y.t1} and ${Y.t2} in your sketch.<ul class="tryit"><li><span class="lv basic">BASIC</span> Run it. Write the two boundaries and say whether they are close to ${Y.t1} and ${Y.t2}.</li><li><span class="lv moderate">MODERATE</span> Change <code>statistics.median</code> to <code>statistics.mean</code>. Which boundaries move, and by how much?</li><li><span class="lv advanced">ADVANCED</span> Use the data to decide whether you would change ${Y.t1} or ${Y.t2} in the Arduino sketch. Justify it in question 2 below the charts.</li></ul>`,
 hints:[`<code>CENTRE(a)</code> is the median of the first status. <code>CENTRE(b)</code> is the median of the second status.`,`The median ignores extreme values. The mean is pulled towards them.`],
 starter:decBody(true),solution:decBody(false),
 tests:`
import statistics as _st
VAL_COL,LAB_COL=${q(Y.VAL)},${q(Y.LAB)}
rows=S["clean_rows"]
CE,DP=S["CENTRE"],S["DECIMALS"]
check("CENTRE is statistics.median or statistics.mean", CE in (_st.median,_st.mean), "CENTRE=%r"%(CE,))
def ref(a,b):
    x=[r[VAL_COL] for r in rows if r[LAB_COL]==a]; y=[r[VAL_COL] for r in rows if r[LAB_COL]==b]
    return None if not x or not y else round((CE(x)+CE(y))/2,DP)
t(${q(LB[0]+" / "+LB[1]+" boundary")}, lambda: S["suggest_threshold"](rows,${q(LB[0])},${q(LB[1])}), ref(${q(LB[0])},${q(LB[1])}), True)
t(${q(LB[1]+" / "+LB[2]+" boundary")}, lambda: S["suggest_threshold"](rows,${q(LB[1])},${q(LB[2])}), ref(${q(LB[1])},${q(LB[2])}), True)
t("Returns None when a status is missing", lambda: S["suggest_threshold"](rows,${q(LB[0])},"PURPLE"), None)
`});
/* ---------- 5 spec ---------- */
const LIM=Y.limit,PU=Y.punit?(" "+Y.punit):"";
const SPECTRY=Y.kind==="delay"
 ?`<ul class="tryit"><li><span class="lv basic">BASIC</span> Run it on both days. Write the delay for each event and say which day meets spec 7.1.</li><li><span class="lv moderate">MODERATE</span> Change <code>SLACK</code> from 0 to 5. Does the first day now pass? Is that fair to the community?</li><li><span class="lv advanced">ADVANCED</span> Use the two days to justify your C4 design change with numbers.</li></ul>`
 :`<ul class="tryit"><li><span class="lv basic">BASIC</span> Run it on both days and write the result (worst error or wrong count) for each.</li><li><span class="lv moderate">MODERATE</span> Change <code>LIMIT</code> to a stricter and a looser value. At what value does the first day start to pass?</li><li><span class="lv advanced">ADVANCED</span> Use the two days to justify your C4 design change with numbers.</li></ul>`;
let spec;
if(Y.kind==="error"){
 const body=(b)=>`# CHECKS is ready for you: 12 pairs of (time, true value from a reference instrument).
print(CHECKS[:3])

VAL_COL = ${q(Y.VAL)}
LIMIT = ${LIM}        # <- change this number (B1 spec 7.1: no reading further than this from the reference, ${Y.punit})


def max_error(rows, checks):
    by_time = {r["Timestamp"]: r for r in rows}
    errors = []
    for when, truth in checks:
        if when in by_time:
            errors.append(abs(by_time[when][VAL_COL] - truth))   # truth = the reference value
    if not errors:
        return None
    return round(max(errors), 2)


def meets_spec(rows, checks, limit=LIMIT):
    worst = max_error(rows, checks)
    return worst is not None and worst <= limit      # worst error is at most the limit


cleaned = clean_rows
print("worst error:", max_error(cleaned, CHECKS), "${Y.punit}")
print("B1 spec 7.1 needs at most ${LIM} ${Y.punit}. Met?", meets_spec(cleaned, CHECKS))
`;
 spec={goal:`Spec 7.1 asks for ${Y.what} within ${LIM} ${Y.punit} of a reference instrument. <code>CHECKS</code> holds 12 times and the true value at each time. The code already works. Run the step on <strong>both days</strong>: the first day does not have your C4 design change, the second day does.${SPECTRY}`,
  hints:[`Press Just run it. The error is how far the post's value is from the true value: <code>abs(measured - truth)</code>.`,`<code>meets_spec</code> compares the worst error with the limit using <code>&lt;=</code>.`,`If the first day fails and the second passes, that gap is your evidence for the design change in C4. Quote both numbers.`],
  starter:body(true),solution:body(false),
  tests:`
VAL_COL=${q(Y.VAL)}
rows=S["clean_rows"]; chk=S["CHECKS"]
def _me(rs):
    bt={r["Timestamp"]:r for r in rs}
    e=[abs(bt[w][VAL_COL]-tr) for w,tr in chk if w in bt]
    return round(max(e),2) if e else None
fake=[{"Timestamp":"a",VAL_COL:10.0},{"Timestamp":"b",VAL_COL:12.5}]
t("max_error on a tiny example", lambda: S["max_error"](fake,[("a",9.0),("b",12.0)]), 1.0, True)
t("max_error ignores a time that is not in the data", lambda: S["max_error"](fake,[("a",9.0),("zz",1.0)]), 1.0, True)
t("max_error on your cleaned day", lambda: S["max_error"](rows,chk), _me(rows), True)
LM=S["LIMIT"]
check("LIMIT is a positive number", isinstance(LM,(int,float)) and LM>0, "LIMIT=%r"%(LM,))
t("meets_spec for this day", lambda: S["meets_spec"](rows,chk), (_me(rows) is not None and _me(rows)<=LM))
t("meets_spec(limit) is strict about the limit", lambda: S["meets_spec"](fake,[("a",9.0)],1.0), True)
`,needDay:true};
}else if(Y.kind==="wrong"){
 const body=(b)=>`# CHECKS is ready for you: 12 pairs of (time, true status from a reference).
print(CHECKS[:3])

LAB_COL = ${q(Y.LAB)}
LIMIT = ${LIM}        # <- change this number (B1 spec 7.1: at most this many wrong or missing readings out of 12)


def count_wrong(rows, checks):
    by_time = {r["Timestamp"]: r for r in rows}
    wrong = 0
    for when, ref in checks:
        row = by_time.get(when)
        if row is None or row[LAB_COL] != ref:     # no reading at all also counts as wrong
            wrong += 1          # add one wrong reading
    return wrong


def meets_spec(rows, checks, limit=LIMIT):
    return count_wrong(rows, checks) <= limit      # at most the limit


cleaned = clean_rows
print("wrong:", count_wrong(cleaned, CHECKS), "of", len(CHECKS))
print("B1 spec 7.1 allows at most ${LIM}. Met?", meets_spec(cleaned, CHECKS))
`;
 spec={goal:`Spec 7.1 asks for the right ${Y.what}${Y.finger?" whenever a finger is on the sensor":""}. <code>CHECKS</code> holds 12 times and the true status at each time. The code already works. Run the step on <strong>both days</strong>: the first day does not have your C4 design change, the second day does.${SPECTRY}`,
  hints:[`A reading is wrong when its status differs from the reference, or when there is no reading at all. <code>wrong += 1</code> counts it.`,`<code>meets_spec</code> compares the count with <code>LIMIT</code> using <code>&lt;=</code>.`,`If the first day fails and the second passes, that gap is your evidence for the design change in C4. Quote both counts.`],
  starter:body(true),solution:body(false),
  tests:`
LAB_COL=${q(Y.LAB)}
rows=S["clean_rows"]; chk=S["CHECKS"]
def _cw(rs):
    bt={r["Timestamp"]:r for r in rs}
    return sum(1 for w,ref in chk if w not in bt or bt[w][LAB_COL]!=ref)
fake=[{"Timestamp":"a",LAB_COL:"X"},{"Timestamp":"b",LAB_COL:"Y"}]
t("count_wrong on a tiny example", lambda: S["count_wrong"](fake,[("a","X"),("b","X")]), 1)
t("A missing reading counts as wrong", lambda: S["count_wrong"](fake,[("a","X"),("zz","X")]), 1)
t("count_wrong on your cleaned day", lambda: S["count_wrong"](rows,chk), _cw(rows))
LM=S["LIMIT"]
check("LIMIT is a whole number from 0 to 12", isinstance(LM,int) and 0<=LM<=12, "LIMIT=%r"%(LM,))
t("meets_spec for this day", lambda: S["meets_spec"](rows,chk), _cw(rows)<=LM)
t("meets_spec(limit=1) with one wrong", lambda: S["meets_spec"](fake,[("a","X"),("b","X")],1), True)
`,needDay:true};
}else{
 const body=(b)=>`# CHECKS is ready for you: each item is (time of the event, [accepted statuses], limit in seconds).
print(CHECKS[:2])

LAB_COL = ${q(Y.LAB)}
SLACK = 0        # <- change this number (extra seconds allowed on top of each limit)


def seconds(ts):
    h, m, s = ts[11:19].split(":")          # the clock time HH:MM:SS
    return int(h) * 3600 + int(m) * 60 + int(s)


def alert_delay(rows, event_ts, wanted):
    """Seconds from the event until the first reading whose status is in 'wanted'."""
    t0 = seconds(event_ts)
    for r in rows:
        if seconds(r["Timestamp"]) >= t0 and r[LAB_COL] in wanted:
            return seconds(r["Timestamp"]) - t0      # seconds from the event to this reading
    return None                      # it was never reported


def meets_spec(rows, checks):
    for when, wanted, limit in checks:
        d = alert_delay(rows, when, wanted)
        if d is None or d > limit + SLACK:          # too slow
            return False
    return True


cleaned = clean_rows
for when, wanted, limit in CHECKS:
    print(when, "delay:", alert_delay(cleaned, when, wanted), "s  (limit", limit, "s)")
print("B1 spec 7.1 met?", meets_spec(cleaned, CHECKS))
`;
 spec={goal:`Spec 7.1 is about how quickly the post reports ${Y.what}. <code>CHECKS</code> lists the events from the reference. The code already works. Run the step on <strong>both days</strong>: the first day does not have your C4 design change, the second day does.${SPECTRY}`,
  hints:[`The delay is the time of the first matching reading minus the time of the event: <code>seconds(r["Timestamp"]) - t0</code>.`,`A check fails when the delay is bigger than its limit: <code>d &gt; limit</code>.`,`If the first day is too slow and the second is fast enough, that gap is your evidence for the design change in C4. Quote the delays.`],
  starter:body(true),solution:body(false),
  tests:`
LAB_COL=${q(Y.LAB)}
rows=S["clean_rows"]; chk=S["CHECKS"]
def _s(ts):
    h,m,sec=ts[11:19].split(":"); return int(h)*3600+int(m)*60+int(sec)
def _ad(rs,e,w):
    t0=_s(e)
    for r in rs:
        if _s(r["Timestamp"])>=t0 and r[LAB_COL] in w: return _s(r["Timestamp"])-t0
    return None
SL=S["SLACK"]
check("SLACK is a number from 0 to 60", isinstance(SL,(int,float)) and 0<=SL<=60, "SLACK=%r"%(SL,))
def _ok(rs):
    for e,w,l in chk:
        d=_ad(rs,e,w)
        if d is None or d>l+SL: return False
    return True
fake=[{"Timestamp":"2026-10-14 10:00:00",LAB_COL:"A"},{"Timestamp":"2026-10-14 10:00:04",LAB_COL:"B"},{"Timestamp":"2026-10-14 10:00:08",LAB_COL:"B"}]
t("alert_delay on a tiny example", lambda: S["alert_delay"](fake,"2026-10-14 10:00:01",["B"]), 3.0, True)
t("alert_delay is 0 when the status is already right", lambda: S["alert_delay"](fake,"2026-10-14 10:00:00",["A"]), 0.0, True)
t("alert_delay is None when it never appears", lambda: S["alert_delay"](fake,"2026-10-14 10:00:00",["Z"]), None)
for e,w,l in chk:
    t("Delay for the event at "+e[11:19], lambda e=e,w=w: S["alert_delay"](rows,e,w), _ad(rows,e,w), True)
t("meets_spec for this day", lambda: S["meets_spec"](rows,chk), _ok(rows))
`,needDay:true};
}
ST.push(Object.assign({id:"spec71",title:"5 · Test: B1 spec 7.1 against the reference",c:"C3"},spec));
/* ---------- 6 report ---------- */
const TOP=Y.top;
const repBody=(b)=>`LAB_COL = ${q(Y.LAB)}
WATCH = ${q(TOP)}        # <- change this word (choose from: ${Y.labels.join(", ")})


def episode_report(rows, label):
    """How often, and for how long in a row, did the post report this status?"""
    episodes, longest, run, hits = 0, 0, 0, 0
    first = None
    for r in rows:
        if r[LAB_COL] == label:
            run += 1
            hits += 1
            if run == 1:                         # a new episode starts here
                episodes += 1                    # add one episode
                if first is None:
                    first = r["Timestamp"][11:19]
            longest = max(longest, run)
        else:
            run = 0
    share = round(hits / len(rows) * 100, 1)       # hits = readings with this status
    return {"label": label, "episodes": episodes, "longest_run": longest, "first": first, "share_pct": share}


report = episode_report(clean_rows, WATCH)
print(report)
`;
ST.push({id:"report",title:"6 · Report: episodes of "+TOP.replace(/_/g," ").toLowerCase(),c:"C4",
 goal:`Your community needs a short report, not 150 rows. <code>episode_report()</code> tells them how many separate times the post reported <code>${TOP}</code>, the longest run of readings in a row, when the first episode started and the share of all readings. It already works: press <strong>Just run it</strong>.<ul class="tryit"><li><span class="lv basic">BASIC</span> Run it and write the four numbers in one sentence for the community.</li><li><span class="lv moderate">MODERATE</span> Change <code>WATCH</code> to another status. Which status is reported most often?</li><li><span class="lv advanced">ADVANCED</span> Run it on both days. How did the design change alter the episodes and the longest run? Use the numbers in question 3 below the charts.</li></ul>`,
 hints:[`A new episode starts only when a run starts: <code>run == 1</code> after the status was something else.`,`Share = readings with that status ÷ all readings × 100. The count of those readings is <code>hits</code>.`],
 starter:repBody(true),solution:repBody(false),
 tests:`
LAB_COL=${q(Y.LAB)}
rows=S["clean_rows"]
def _rep(rs,lab):
    ep=lg=run=hits=0;first=None
    for r in rs:
        if r[LAB_COL]==lab:
            run+=1;hits+=1
            if run==1:
                ep+=1
                if first is None: first=r["Timestamp"][11:19]
            lg=max(lg,run)
        else: run=0
    return {"label":lab,"episodes":ep,"longest_run":lg,"first":first,"share_pct":round(hits/len(rs)*100,1)}
WT=S["WATCH"]
check("WATCH is one of the statuses (${Y.labels.join(", ")})", WT in ${JSON.stringify(Y.labels)}, "WATCH=%r"%(WT,))
got=S["episode_report"](rows,WT)
ref=_rep(rows,WT)
check("Returns a dictionary", isinstance(got,dict), "type %s"%type(got).__name__)
t("episodes", lambda: got["episodes"], ref["episodes"])
t("longest_run", lambda: got["longest_run"], ref["longest_run"])
t("first", lambda: got["first"], ref["first"])
t("share_pct", lambda: got["share_pct"], ref["share_pct"], True)
t("A status that never happens gives 0 episodes", lambda: S["episode_report"](rows,"NEVER")["episodes"], 0)
`,needDay:true});
return ST};
