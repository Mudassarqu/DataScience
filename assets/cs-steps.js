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
 goal:`Your sketch prints one line per reading. Python has to turn that text into numbers. Finish <code>parse_line()</code> so it returns <code>(first number, second number, status word)</code> and returns <code>(None, None, None)</code> when the line is damaged. This is the same job as <code>1_data_collection.py</code> in your kit.`,
 hints:[`The first number is done for you. For the second number, split <code>parts[1]</code> at the colon, take the part after it, strip the spaces, keep the first word and remove any % sign.`,`<code>float(parts[1].split(':')[1].strip().split()[0].rstrip('%'))</code>`],
 starter:`def parse_line(line):
    """${L0.replace(/"/g,"'")}
       -> ${pyT(e0).replace(/"/g,"'")}   or (None, None, None) if the line is damaged."""
    try:
        parts = line.split('|')
        if len(parts) >= 3:
            first = float(parts[0].split(':')[1].strip().split()[0].rstrip('%'))
            second = float(___)       # <- same idea for parts[1]
            status = parts[-1].split(':')[1].strip()
            return first, second, status
    except (ValueError, IndexError):
        pass
    return None, None, None


serial_lines = [
    ${q(L0)},
    ${q(L1)},
    ${q(DAMAGED)},
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

LOW_OK, HIGH_OK = ${Y.lo}, ${Y.hi}      # sensible range for this sensor circuit
Z_MAX = ${Y.zmax}                   ${zc}
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
        if ${blank?"___":"raw < LOW_OK or raw > HIGH_OK"}:${blank?"                      # <- reading outside LOW_OK..HIGH_OK":""}
            continue
        out.append({"Timestamp": r["Timestamp"], RAW_COL: raw, VAL_COL: val, LAB_COL: lab})

    # 3. z-score outlier rejection on the raw column (keep rows with |z| < Z_MAX)
    if len(out) > 2:
        values = [r[RAW_COL] for r in out]
        mean = statistics.mean(values)
        sd = statistics.stdev(values)
        if sd > 0:
            out = [r for r in out if ${blank?"___":"abs((r[RAW_COL] - mean) / sd) < Z_MAX"}]${blank?"      # <- |z| < Z_MAX":""}

    # 4. rolling 5-sample moving average of the value column
    for i, r in enumerate(out):
        window = [x[VAL_COL] for x in out[max(0, i - 4): i + 1]]
        r["Value_MA5"] = round(sum(window) / len(window), 2)
    return out


cleaned = clean(RAW)          # RAW is the dataset you chose above
print("rows in :", len(RAW))
print("rows out:", len(cleaned))
print("first   :", cleaned[0])
`;
ST.push({id:"clean",title:"2 · Clean: remove bad data",c:"C2",
 goal:`Raw sensor data is never perfect. Finish <code>clean(rows)</code> so it (1) drops rows with missing or non-numeric values, (2) drops impossible readings outside <code>LOW_OK..HIGH_OK</code> (a loose wire gives stuck values such as ${Y.lo<=0?"0":"a number far outside the range"}), (3) removes statistical outliers with a z-score of <code>Z_MAX</code> or more, and (4) adds a 5-sample moving average. This is <code>2_clean_analyse.py</code> written without pandas.`,
 hints:[`Fill the first blank with a test for a reading that is too low OR too high: <code>raw < LOW_OK or raw > HIGH_OK</code>.`,`Outliers: <code>abs((value - mean) / sd) &lt; Z_MAX</code> keeps a row. <code>statistics.mean()</code> and <code>statistics.stdev()</code> do the maths.`,`Moving average: for row number i, average the value column of rows i-4 to i (fewer at the start). It is already written for you.`],
 starter:cleanBody(true),solution:cleanBody(false),
 tests:`
import statistics as _st, json as _j
RAW_COL,VAL_COL,LAB_COL=${q(Y.RAW)},${q(Y.VAL)},${q(Y.LAB)}
def _ref(rows):
    def num(x):
        try: return float(x)
        except (TypeError, ValueError): return None
    out=[]
    for r in rows:
        raw=num(r.get(RAW_COL)); val=num(r.get(VAL_COL)); lab=str(r.get(LAB_COL) or "").strip()
        if raw is None or val is None or lab=="": continue
        if raw<${Y.lo} or raw>${Y.hi}: continue
        out.append({"Timestamp":r["Timestamp"],RAW_COL:raw,VAL_COL:val,LAB_COL:lab})
    if len(out)>2:
        v=[r[RAW_COL] for r in out]; m=_st.mean(v); sd=_st.stdev(v)
        if sd>0: out=[r for r in out if abs((r[RAW_COL]-m)/sd)<${Y.zmax}]
    for i,r in enumerate(out):
        w=[x[VAL_COL] for x in out[max(0,i-4):i+1]]; r["Value_MA5"]=round(sum(w)/len(w),2)
    return out
RAW=S["RAW"]
ref=_ref(RAW)
got=S["clean"](RAW)
check("Returns a list of rows", isinstance(got,list) and len(got)>0, "type %s"%type(got).__name__)
t("Keeps the right number of rows", lambda: len(got), len(ref))
check("No impossible readings left (${Y.lo} to ${Y.hi} only)", all(${Y.lo}<=r[RAW_COL]<=${Y.hi} for r in got), "")
check("All values are numbers", all(isinstance(r[RAW_COL],(int,float)) and isinstance(r[VAL_COL],(int,float)) for r in got), "")
check("No empty status word", all(r[LAB_COL] for r in got), "")
t("Moving average of the last row", lambda: got[-1]["Value_MA5"], ref[-1]["Value_MA5"], True)
t("Moving average of the 3rd row", lambda: got[2]["Value_MA5"], ref[2]["Value_MA5"], True)
print("@@DATA@@"+_j.dumps(got))
`});
/* ---------- 3 analyse ---------- */
const analyseBody=(b)=>`import statistics

RAW_COL, VAL_COL, LAB_COL = ${q(Y.RAW)}, ${q(Y.VAL)}, ${q(Y.LAB)}

def summary(rows):
    raws = [r[RAW_COL] for r in rows]
    vals = [r[VAL_COL] for r in rows]
    return {
        "count": len(rows),
        "mean_raw": round(statistics.mean(raws), 2),
        "median_raw": statistics.median(raws),
        "std_raw": round(${b?"___":"statistics.stdev(raws)"}, 2),${b?"            # <- sample standard deviation of raws":""}
        "mean_val": round(statistics.mean(vals), 2),
        "min_val": min(vals),
        "max_val": max(vals),
    }


def status_counts(rows):
    counts = {}
    for r in rows:
        c = r[LAB_COL]
        counts[c] = ${b?"___":"counts.get(c, 0) + 1"}${b?"                      # <- add one to this status's count":""}
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
 goal:`Turn the cleaned rows into numbers you can talk about. Finish <code>summary()</code>, <code>status_counts()</code> and <code>percent_share()</code>. This replaces <code>describe()</code> and <code>value_counts()</code> from the pandas script.`,
 hints:[`<code>statistics.median(list)</code> gives the middle value. <code>statistics.stdev(list)</code> is the sample standard deviation (the same as pandas).`,`<code>counts[c] = counts.get(c, 0) + 1</code> counts how often each status appears.`,`Share = count ÷ total × 100, rounded to 1 decimal place (done for you).`],
 starter:analyseBody(true),solution:analyseBody(false),
 tests:`
import statistics as _st
RAW_COL,VAL_COL,LAB_COL=${q(Y.RAW)},${q(Y.VAL)},${q(Y.LAB)}
rows=S["clean_rows"]
raws=[r[RAW_COL] for r in rows]; vals=[r[VAL_COL] for r in rows]
s=S["summary"](rows)
t("count", lambda: s["count"], len(rows))
t("mean_raw", lambda: s["mean_raw"], round(_st.mean(raws),2), True)
t("median_raw", lambda: s["median_raw"], _st.median(raws), True)
t("std_raw (sample standard deviation)", lambda: s["std_raw"], round(_st.stdev(raws),2), True)
t("mean_val", lambda: s["mean_val"], round(_st.mean(vals),2), True)
cc={}
for r in rows: cc[r[LAB_COL]]=cc.get(r[LAB_COL],0)+1
t("status_counts", lambda: S["status_counts"](rows), cc)
t("percent_share", lambda: S["percent_share"](cc), {c:round(n/len(rows)*100,1) for c,n in cc.items()})
`});
/* ---------- 4 decide ---------- */
const LB=Y.dl.length>=3?Y.dl:Y.labels;
const decBody=(b)=>`import statistics

VAL_COL, LAB_COL = ${q(Y.VAL)}, ${q(Y.LAB)}

def suggest_threshold(rows, status_a, status_b):
    a = [r[VAL_COL] for r in rows if r[LAB_COL] == status_a]
    b = [r[VAL_COL] for r in rows if r[LAB_COL] == status_b]
    if not a or not b:
        return None
    return round(${b?"___":"(statistics.median(a) + statistics.median(b)) / 2"}, 1)${b?"      # <- midpoint of the two medians":""}


cleaned = clean_rows
print(${q(LB[0]+" / "+LB[1]+" boundary :")}, suggest_threshold(cleaned, ${q(LB[0])}, ${q(LB[1])}))
print(${q(LB[1]+" / "+LB[2]+" boundary :")}, suggest_threshold(cleaned, ${q(LB[1])}, ${q(LB[2])}))
print("Your sketch uses ${Y.t1} and ${Y.t2}. Does the data agree?")
`;
ST.push({id:"decide",title:"4 · Decide: set thresholds from data",c:"C4",
 goal:`Good designers justify numbers with evidence. Finish <code>suggest_threshold()</code>: take the median value of two statuses and return the midpoint. Compare it with the ${Y.t1} and ${Y.t2} in your sketch and write your justification below the charts.`,
 hints:[`Collect the value for each status with a list comprehension, then use <code>statistics.median()</code> on each.`,`Midpoint = (median_a + median_b) / 2. If either status has no rows, return <code>None</code> (done for you).`],
 starter:decBody(true),solution:decBody(false),
 tests:`
import statistics as _st
VAL_COL,LAB_COL=${q(Y.VAL)},${q(Y.LAB)}
rows=S["clean_rows"]
def ref(a,b):
    x=[r[VAL_COL] for r in rows if r[LAB_COL]==a]; y=[r[VAL_COL] for r in rows if r[LAB_COL]==b]
    return None if not x or not y else round((_st.median(x)+_st.median(y))/2,1)
t(${q(LB[0]+" / "+LB[1]+" boundary")}, lambda: S["suggest_threshold"](rows,${q(LB[0])},${q(LB[1])}), ref(${q(LB[0])},${q(LB[1])}), True)
t(${q(LB[1]+" / "+LB[2]+" boundary")}, lambda: S["suggest_threshold"](rows,${q(LB[1])},${q(LB[2])}), ref(${q(LB[1])},${q(LB[2])}), True)
t("Returns None when a status is missing", lambda: S["suggest_threshold"](rows,${q(LB[0])},"PURPLE"), None)
`});
/* ---------- 5 spec ---------- */
const LIM=Y.limit,PU=Y.punit?(" "+Y.punit):"";
let spec;
if(Y.kind==="error"){
 const body=(b)=>`# CHECKS is ready for you: 12 pairs of (time, true value from a reference instrument).
print(CHECKS[:3])

VAL_COL = ${q(Y.VAL)}
LIMIT = ${LIM}        # B1 spec 7.1: no reading further than this from the reference (${Y.punit})


def max_error(rows, checks):
    by_time = {r["Timestamp"]: r for r in rows}
    errors = []
    for when, truth in checks:
        if when in by_time:
            errors.append(abs(by_time[when][VAL_COL] - ${b?"___":"truth"}))${b?"   # <- the reference value":""}
    if not errors:
        return None
    return round(max(errors), 2)


def meets_spec(rows, checks, limit=LIMIT):
    worst = max_error(rows, checks)
    return worst is not None and worst ${b?"___":"<="} limit${b?"      # <- worst error is at most the limit":""}


cleaned = clean_rows
print("worst error:", max_error(cleaned, CHECKS), "${Y.punit}")
print("B1 spec 7.1 needs at most ${LIM} ${Y.punit}. Met?", meets_spec(cleaned, CHECKS))
`;
 spec={goal:`Spec 7.1 asks for ${Y.what} within ${LIM} ${Y.punit} of a reference instrument. <code>CHECKS</code> holds 12 times and the true value at each time. Finish <code>max_error()</code> and <code>meets_spec()</code>. Run the step on <strong>both days</strong>: the first day does not have your C4 design change, the second day does.`,
  hints:[`The error is how far the post's value is from the true value: <code>abs(measured - truth)</code>.`,`<code>meets_spec</code> compares the worst error with the limit using <code>&lt;=</code>.`,`If the first day fails and the second passes, that gap is your evidence for the design change in C4. Quote both numbers.`],
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
t("meets_spec for this day", lambda: S["meets_spec"](rows,chk), (_me(rows) is not None and _me(rows)<=${LIM}))
t("meets_spec(limit) is strict about the limit", lambda: S["meets_spec"](fake,[("a",9.0)],1.0), True)
`,needDay:true};
}else if(Y.kind==="wrong"){
 const body=(b)=>`# CHECKS is ready for you: 12 pairs of (time, true status from a reference).
print(CHECKS[:3])

LAB_COL = ${q(Y.LAB)}
LIMIT = ${LIM}        # B1 spec 7.1: at most this many wrong or missing readings out of 12


def count_wrong(rows, checks):
    by_time = {r["Timestamp"]: r for r in rows}
    wrong = 0
    for when, ref in checks:
        row = by_time.get(when)
        if row is None or row[LAB_COL] != ref:     # no reading at all also counts as wrong
            wrong += ${b?"___":"1"}${b?"          # <- add one wrong reading":""}
    return wrong


def meets_spec(rows, checks, limit=LIMIT):
    return count_wrong(rows, checks) ${b?"___":"<="} limit${b?"      # <- at most the limit":""}


cleaned = clean_rows
print("wrong:", count_wrong(cleaned, CHECKS), "of", len(CHECKS))
print("B1 spec 7.1 allows at most ${LIM}. Met?", meets_spec(cleaned, CHECKS))
`;
 spec={goal:`Spec 7.1 asks for the right ${Y.what}${Y.finger?" whenever a finger is on the sensor":""}. <code>CHECKS</code> holds 12 times and the true status at each time. Finish <code>count_wrong()</code> and <code>meets_spec()</code>. Run the step on <strong>both days</strong>: the first day does not have your C4 design change, the second day does.`,
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
t("meets_spec for this day", lambda: S["meets_spec"](rows,chk), _cw(rows)<=${LIM})
t("meets_spec(limit=1) with one wrong", lambda: S["meets_spec"](fake,[("a","X"),("b","X")],1), True)
`,needDay:true};
}else{
 const body=(b)=>`# CHECKS is ready for you: each item is (time of the event, [accepted statuses], limit in seconds).
print(CHECKS[:2])

LAB_COL = ${q(Y.LAB)}


def seconds(ts):
    h, m, s = ts[11:19].split(":")          # the clock time HH:MM:SS
    return int(h) * 3600 + int(m) * 60 + int(s)


def alert_delay(rows, event_ts, wanted):
    """Seconds from the event until the first reading whose status is in 'wanted'."""
    t0 = seconds(event_ts)
    for r in rows:
        if seconds(r["Timestamp"]) >= t0 and r[LAB_COL] in wanted:
            return ${b?"___":"seconds(r[\"Timestamp\"]) - t0"}${b?"      # <- seconds from the event to this reading":""}
    return None                      # it was never reported


def meets_spec(rows, checks):
    for when, wanted, limit in checks:
        d = alert_delay(rows, when, wanted)
        if d is None or d ${b?"___":">"} limit:${b?"          # <- too slow":""}
            return False
    return True


cleaned = clean_rows
for when, wanted, limit in CHECKS:
    print(when, "delay:", alert_delay(cleaned, when, wanted), "s  (limit", limit, "s)")
print("B1 spec 7.1 met?", meets_spec(cleaned, CHECKS))
`;
 spec={goal:`Spec 7.1 is about how quickly the post reports ${Y.what}. <code>CHECKS</code> lists the events from the reference. Finish <code>alert_delay()</code> and <code>meets_spec()</code>. Run the step on <strong>both days</strong>: the first day does not have your C4 design change, the second day does.`,
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
def _ok(rs):
    for e,w,l in chk:
        d=_ad(rs,e,w)
        if d is None or d>l: return False
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


def episode_report(rows, label):
    """How often, and for how long in a row, did the post report this status?"""
    episodes, longest, run, hits = 0, 0, 0, 0
    first = None
    for r in rows:
        if r[LAB_COL] == label:
            run += 1
            hits += 1
            if run == 1:                         # a new episode starts here
                episodes += ${b?"___":"1"}${b?"               # <- add one episode":""}
                if first is None:
                    first = r["Timestamp"][11:19]
            longest = max(longest, run)
        else:
            run = 0
    share = round(${b?"___":"hits"} / len(rows) * 100, 1)${b?"    # <- readings with this status":""}
    return {"label": label, "episodes": episodes, "longest_run": longest, "first": first, "share_pct": share}


report = episode_report(clean_rows, ${q(TOP)})
print(report)
`;
ST.push({id:"report",title:"6 · Report: episodes of "+TOP.replace(/_/g," ").toLowerCase(),c:"C4",
 goal:`Your community needs a short report, not 150 rows. Finish <code>episode_report()</code> so it tells them how many separate times the post reported <code>${TOP}</code>, the longest run of readings in a row, when the first episode started and the share of all readings.`,
 hints:[`Count a new episode only when a run starts: <code>run == 1</code> after the status was something else.`,`Share = readings with that status ÷ all readings × 100. The count of those readings is <code>hits</code>.`],
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
got=S["episode_report"](rows,${q(TOP)})
ref=_rep(rows,${q(TOP)})
check("Returns a dictionary", isinstance(got,dict), "type %s"%type(got).__name__)
t("episodes", lambda: got["episodes"], ref["episodes"])
t("longest_run", lambda: got["longest_run"], ref["longest_run"])
t("first", lambda: got["first"], ref["first"])
t("share_pct", lambda: got["share_pct"], ref["share_pct"], True)
t("A status that never happens gives 0 episodes", lambda: S["episode_report"](rows,"NEVER")["episodes"], 0)
`,needDay:true});
return ST};
