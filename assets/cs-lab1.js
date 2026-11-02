/* Lab 1 engine: virtual ESP32 for every Criterion C sensor lesson. Needs cs-core.js and assets/cs-<CODE>.js (window.CSL). */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const CSL=window.CSL,C=window.CS_CORE,L=CSL.cfg,k=C.kind(L.kind,L),labs=C.labelsFor(k,L),cols=C.colorsFor(k,L);
const P=C.paramsFor(k,L),P_DEF=JSON.parse(JSON.stringify(P));
const KEY="ds_cs_"+CSL.code+"_log";
const esc=s=>String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
const fmtNum=(v,d)=>(typeof v==="number"&&isFinite(v))?v.toFixed(d):String(v);
const W=k.world,W2=k.world2;CSL.valName=CSL.valName||k.cols[2].replace(/_/g," ");$("b1q").innerHTML="<b>B1 spec 7.1:</b> "+esc(CSL.b1_71)+(CSL.b1_72?"<br><b>B1 spec 7.2:</b> "+esc(CSL.b1_72):"");$("cLab").textContent=k.calc.label;$("cRaw").value=k.calc.def;$("cNote").textContent="("+k.calc.note+")";
let fix=false,level=W.def,level2=W2?W2.def:0,sim=null,running=false,timer=null,curFn=null,vt=Date.now(),rows=[],hist=[],day=null,lastRec=null,lastLab="";
const seen={top:false,fault:false,scn:false,specRun:false,failNo:false,pass:false,ext:false};
try{rows=JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){rows=[]}
$("nRows").textContent=rows.length;
function newSim(){sim=k.id==="health"?new C.HSim(k,L,P,fix,5):new C.Sim(k,L,P,fix,Math.floor(Math.random()*9999)+1,+$("noise").value/10);
  sim.x=level;sim.x2=level2;sim.fault=$("fault").checked;if(L.scenario&&L.scenario.warm&&sim.warm!==undefined){}}
/* ---------- sketch with editable numbers ---------- */
const F=key=>`<input class="yel" data-k="${key}" value="${P[key]}" inputmode="decimal" aria-label="${key}">`;
function drawSketch(){const e=$("ext").checked;
 const extra=`\n\n${'<span class="cm">// Criterion C code of your own: smoothing and debounce</span>'}\n${'<span class="kw">const int</span>'} AVG_N = ${F("avgN")};       ${'<span class="cm">// average of the last N readings</span>'}\n${'<span class="kw">const int</span>'} CONFIRM_N = ${F("confirm")};   ${'<span class="cm">// a new status must appear N times in a row</span>'}`;
 $("sketch").innerHTML=k.sketch(F,P,e,L)+extra;
 $("sketch").querySelectorAll("input.yel").forEach(i=>i.oninput=()=>{const v=parseFloat(i.value);if(!isNaN(v)&&(v>=0||i.dataset.k==="off")){P[i.dataset.k]=v;onParams()}})}
$("ext").onchange=()=>{seen.ext=$("ext").checked||seen.ext;drawSketch();leds(lastRec);checkMissions()};
/* ---------- audio ---------- */
let AC=null;function tone(f,d,type,v){if(!$("snd").checked)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type=type||"sine";o.frequency.value=f;g.gain.setValueAtTime(.0001,AC.currentTime);g.gain.exponentialRampToValueAtTime(v||.12,AC.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d+.02)}catch(e){}}
const jingle=()=>[523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,.22,"triangle",.18),i*130));
/* ---------- LEDs ---------- */
function leds(rec){const on=$("ext").checked&&rec&&rec.idx>=0;const set=(id,v,c,off)=>$(id).setAttribute("fill",on&&v?c:off);
 set("ledR",rec&&rec.idx===2,"#ff3b30","#512a2a");set("ledY",rec&&rec.idx===1,"#ffd60a","#4d4520");set("ledG",rec&&rec.idx===0,"#30d158","#1f4a30")}
/* ---------- world controls ---------- */
function setWorld(x,x2){level=x;$("w1").value=x;$("w1v").textContent=fmtNum(+x,W.dp)+" "+W.unit;if(sim)sim.x=x;
 if(W2&&x2!=null){level2=x2;$("w2").value=x2;$("w2v").textContent=k.id==="health"?(x2>=1?"finger ON":"finger OFF"):fmtNum(+x2,W2.dp)+" "+W2.unit;if(sim)sim.x2=x2}
 $("pic").classList.toggle("hot",x>=W.min+(W.max-W.min)*0.6)}
/* ---------- one reading ---------- */
function reading(dtOverride){
 if(!sim)newSim();sim.x=level;sim.x2=level2;sim.fault=$("fault").checked;sim.noiseMul=+$("noise").value/10;
 const dt=dtOverride||(k.id==="photogate"?2500:P.delay);
 const o=sim.step(dt);const idx=o.idx;
 const dp=k.dec!=null?k.dec:0;
 const lab=idx>=0?labs[idx]:(o.lab||"WAIT");
 const rec={raw:o.raw,ir:o.ir,v:(k.id==="temp"||k.id==="moisture"||k.id==="photogate")?+o.va.toFixed(2):Math.round(o.va),t:o.t,spo2:o.spo2,idx,lab,err:o.err};
 if(k.id==="photogate")vt+=1000;else vt+=P.delay;
 const ts=new Date(vt),pad=n=>String(n).padStart(2,"0");
 const stamp=`${ts.getFullYear()}-${pad(ts.getMonth()+1)}-${pad(ts.getDate())} ${pad(ts.getHours())}:${pad(ts.getMinutes())}:${pad(ts.getSeconds())}`;
 let line;
 if(rec.err)line=k.id==="temp"?"ERROR: DS18B20 Disconnected. Check Pin 4 and 4.7k pull-up!":"ERROR: DHT22 read failed. Check the data wire.";
 else line=k.fmt(rec);
 const sm=$("serial");sm.textContent+=line+"\n";if(sm.textContent.length>16000)sm.textContent=sm.textContent.slice(-12000);sm.scrollTop=sm.scrollHeight;
 if(!rec.err){const rawOut=k.id==="photogate"?Math.round(o.raw/10)/100:rec.raw;rows.push([stamp,rawOut,rec.v,lab]);if(rows.length>600)rows.shift();try{localStorage.setItem(KEY,JSON.stringify(rows))}catch(e){}$("nRows").textContent=rows.length}
 if(!rec.err){hist.push([rec.v,k.id==="health"?rec.ir:rec.raw]);if(hist.length>60)hist.shift()}
 const showRaw=k.id==="photogate"?(o.raw/1000).toFixed(1)+" ms":(k.id==="temp"||k.id==="moisture")?rec.raw:rec.raw;
 $("vRaw").textContent=rec.err?"ERR":showRaw;
 $("vVal").textContent=rec.err?"-":rec.v+(k.valUnit||"");
 const c=idx>=0?cols[idx]:"#64748b";$("vCond").textContent=lab.replace(/_/g," ");$("vCond").style.background=c;
 if(lab!==lastLab&&idx>=0){tone(200+idx*220,.12,"sine",.08);lastLab=lab}
 lastRec=rec;leds(rec);$("clock").textContent="🕒 "+pad(ts.getHours())+":"+pad(ts.getMinutes())+":"+pad(ts.getSeconds());drawChart();
 if(idx===2&&!rec.err)seen.top=true;
 if($("fault").checked&&(!rec.err&&(k.faultRaw.includes(o.raw)||(k.id==="photogate"&&(o.raw<=100||o.raw>=9e6)))||rec.err))seen.fault=true;
 checkMissions()}
/* ---------- chart ---------- */
function drawChart(){const cv=$("chart"),g=cv.getContext("2d"),Wd=cv.width,H=cv.height;g.clearRect(0,0,Wd,H);const cs=getComputedStyle(document.body);const ink=cs.getPropertyValue("--muted")||"#666",line=cs.getPropertyValue("--line")||"#ccc";
 g.font="12px system-ui";g.fillStyle=ink;g.strokeStyle=line;g.lineWidth=1;
 let vmin=W.min,vmax=W.max;if(k.id==="photogate"){vmin=0;vmax=W.max}if(k.id==="health"){vmin=0;vmax=180}
 const noRaw=k.id==="photogate"||k.id==="health";
 const r0=k.ideal(W.min,W2?W2.def:0),r1=k.ideal(W.max,W2?W2.def:0);const rmin=Math.min(r0,r1),rmax=Math.max(r0,r1);
 for(let i=0;i<=4;i++){const y=14+(H-34)*i/4;g.beginPath();g.moveTo(44,y);g.lineTo(Wd-50,y);g.stroke();g.fillText((vmax-(vmax-vmin)*i/4).toFixed(W.dp>0&&vmax-vmin<60?1:0),4,y+4);if(!noRaw)g.fillText(Math.round(rmax-(rmax-rmin)*i/4),Wd-46,y+4)}
 const n=hist.length;if(n<2)return;const X=i=>44+(Wd-98)*i/59;
 g.lineWidth=2.4;g.strokeStyle="#0891b2";g.beginPath();hist.forEach((h,i)=>{const y=14+(H-34)*(1-C.con((h[0]-vmin)/(vmax-vmin),0,1));i?g.lineTo(X(i),y):g.moveTo(X(i),y)});g.stroke();
 if(!noRaw){g.strokeStyle="#dc2626";g.setLineDash([6,4]);g.beginPath();hist.forEach((h,i)=>{const y=14+(H-34)*(1-C.con((h[1]-rmin)/(rmax-rmin),0,1));i?g.lineTo(X(i),y):g.moveTo(X(i),y)});g.stroke();g.setLineDash([])}
 g.fillStyle="#0891b2";g.fillText(CSL.valName,52,12);if(!noRaw){g.fillStyle="#dc2626";g.fillText("Raw reading",52+CSL.valName.length*7+16,12)}}
/* ---------- run / scenario ---------- */
function stopAll(){running=false;clearInterval(timer);day=null;$("runBtn").disabled=false;$("dayBtn").disabled=false;$("stopBtn").disabled=true}
function startTimer(fn){curFn=fn;clearInterval(timer);const sp=+$("spd").value;const base=k.id==="photogate"?900:P.delay;timer=setInterval(fn,Math.max(15,base/sp));running=true;$("runBtn").disabled=true;$("dayBtn").disabled=true;$("stopBtn").disabled=false}
$("runBtn").onclick=()=>{tone(440,.1);if(!sim)newSim();startTimer(()=>reading())};
$("stopBtn").onclick=stopAll;
$("dayBtn").onclick=()=>{tone(330,.1);const pts=C.scenario(k,L,11);newSim();
 if(L.scenario.warm&&sim.warm!==undefined){sim.warm=true;sim.warmT=P.preheat||0}
 day={i:0,pts};const t0=pts[0].ts;vt=new Date(t0.replace(" ","T")).getTime();
 const sp=+$("spd").value;clearInterval(timer);curFn=null;
 timer=setInterval(()=>{const p=pts[day.i];setWorld(p.x,W2?p.x2:null);vt=new Date(p.ts.replace(" ","T")).getTime()-(k.id==="photogate"?1000:P.delay);
   reading(k.id==="photogate"?2500:L.scenario.dt*1000);day.i++;if(day.i>=pts.length){stopAll();seen.scn=true;checkMissions()}},Math.max(15,300/sp));
 running=true;$("runBtn").disabled=true;$("dayBtn").disabled=true;$("stopBtn").disabled=false};
$("spd").onchange=()=>{if(running&&curFn){clearInterval(timer);const base=k.id==="photogate"?900:P.delay;timer=setInterval(curFn,Math.max(15,base/+$("spd").value))}};
$("w1").oninput=()=>{if(!day)setWorld(+$("w1").value,null)};
if(W2)$("w2").oninput=()=>{if(!day)setWorld(level,+$("w2").value)};
document.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{if(day)return;const a=b.dataset.p.split(",").map(Number);setWorld(a[0],a[1]);tone(400+idxHint(a[0])*120,.08,"square",.05);if(!running){if(k.id==="health")for(let i=0;i<1;i++)reading();else reading()}});
function idxHint(x){return C.refIdx(k,L,x,level2)}
$("noise").oninput=()=>{$("noiseV").textContent=$("noise").value;if(sim)sim.noiseMul=+$("noise").value/10};
$("fix").onchange=()=>{fix=$("fix").checked;if(sim){sim.fix=fix?1:0}glare();checkMissions()};
function glare(){$("fixNote").textContent=fix?"✔ Fitted: "+L.fix.why.split(". ").slice(-1)[0].replace(/\.$/,"")+".":"Not fitted: "+L.fix.why.split(". ")[0].replace(/\.$/,"")+".";$("pic").classList.toggle("fixed",fix)}
$("clr").onclick=()=>{$("serial").textContent="";rows=[];hist=[];try{localStorage.setItem(KEY,"[]")}catch(e){}$("nRows").textContent=0;drawChart()};
$("csv").onclick=()=>{const t=k.cols.join(",")+"\n"+rows.map(r=>r.join(",")).join("\n")+"\n";const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([t],{type:"text/csv"}));a.download=CSL.code+"_"+L.kind+"_data.csv";a.click()};
/* ---------- maths box ---------- */
function calc(){const x=+$("cRaw").value;$("cOut").textContent=k.calc.f(x,P)}
$("cRaw").oninput=calc;
/* ---------- B1 spec 7.1 ---------- */
let specLast=null;
function specRun(){const r=C.runSpec(k,L,P,fix,+$("noise").value/10,1);
 $("specT").innerHTML=r.parts.map(p=>(p.title?`<tr><td colspan="${p.hdr.length}" style="background:var(--chip);font-weight:700">${esc(p.title)}</td></tr>`:"")+"<tr>"+p.hdr.map(h=>`<th>${esc(h)}</th>`).join("")+"</tr>"+p.rows.map(row=>{const last=row[row.length-1],bad=last===false;return `<tr class="${bad?"bad":""}">`+row.map((c,i)=>i===row.length-1?`<td>${typeof c==="boolean"?(c?"✔":"✘"):esc(c)}</td>`:`<td>${esc(c)}</td>`).join("")+"</tr>"}).join("")).join("");
 $("specChecks").innerHTML=r.checks.map(c=>`<li class="${c.ok?"ok":"no"}"><span class="ic">${c.ok?"✔":"✘"}</span><div><strong>${esc(c.txt)}</strong><small>Your result: ${c.val===Infinity?"never":fmtNum(+c.val,c.val%1?1:0)}${esc(c.unit)}</small></div></li>`).join("");
 $("specV").textContent=(r.met?"B1 spec 7.1 MET":"B1 spec 7.1 not met")+(fix?" · design change fitted":" · design change NOT fitted");$("specV").style.color=r.met?"#1b8a3d":"#c62828";
 seen.specRun=true;if(r.met&&fix)seen.pass=true;if(!r.met&&!fix)seen.failNo=true;specLast={met:r.met,fix,checks:r.checks.map(c=>c.txt+": "+(c.val===Infinity?"never":fmtNum(+c.val,c.val%1?1:0))+c.unit+" "+(c.ok?"(met)":"(not met)"))};
 tone(r.met?784:300,.15,"triangle",.12);checkMissions()}
$("specBtn").onclick=specRun;
/* ---------- missions ---------- */
function calOk(){if(!L.cal)return false;const c=L.cal;if(!c.keys.some(key=>Math.abs(P[key]-P_DEF[key])>1e-9))return false;
 const s=new C.Sim(k,L,P,1,3,0);s.x=c.x;s.x2=c.x2!=null?c.x2:(W2?W2.def:0);s.settle();let o;for(let i=0;i<20;i++)o=s.step(P.delay);return Math.abs(o.va-c.x)<=c.tol}
const hi=labs[2].replace(/_/g," ");
const M=[
 ["Make the post report "+hi,"Choose the strongest preset, then press Run virtual ESP32.",()=>seen.top],
 ["Spot a faulty reading","Tick the fault box and run until you see a stuck or impossible value. Real data has glitches like this, and you will clean them in Lab 2.",()=>seen.fault]]
 .concat(L.cal?[["Calibrate the sketch: "+L.cal.txt.split(". ")[0],L.cal.txt,calOk]]:[])
 .concat([
 ["Run the B1 spec 7.1 test","Press Run the spec test. Read each trial in the table.",()=>seen.specRun],
 ["See why the design change matters","Run the spec test with the design change NOT fitted and note which check fails.",()=>seen.failNo],
 ["Fit the design change and meet spec 7.1","Tick the design change (C4), keep your calibrated numbers and run the test again.",()=>seen.pass],
 ["Add the Criterion B extension","Tick the extension box and watch the status lights change.",()=>seen.ext],
 ["Play the whole scenario to the end","Press the Play button (25× is quick) and watch the chart.",()=>seen.scn]]);
let done=new Set(),posted=false;
function drawMissions(){$("missions").innerHTML=M.map((m,i)=>`<div class="mission ${done.has(i)?"ok":""}"><span class="ic">${done.has(i)?"✔":"○"}</span><div><strong>${esc(m[0])}</strong><small>${esc(m[1])}</small></div></div>`).join("");$("mCount").textContent=done.size+" / "+M.length}
function checkMissions(){let ch=false;M.forEach((m,i)=>{if(!done.has(i)&&m[2]()){done.add(i);ch=true}});if(ch){tone(784,.15,"triangle",.15);drawMissions()}
 if(done.size===M.length&&!posted){posted=true;jingle();$("doneMsg").textContent="🎉 All missions complete!";try{const u=currentUser();if(u&&typeof postToSheet==="function"){postToSheet("quiz",{Name:u.name,Class:u.klass,Criterion:"C",Topic:CSL.title+" ("+CSL.code+")",Lesson:"Lab 1 Virtual ESP32",Quiz:"Lab · "+CSL.title+" · Virtual ESP32",Score:M.length,Total:M.length,Percent:100,TimeTakenSec:0});$("doneMsg").textContent+=" Saved to your teacher's Google Sheet."}else $("doneMsg").textContent+=" Log in at the top to save it to the class Google Sheet."}catch(e){}}}
function onParams(){calc();drawMissions();checkMissions();leds(lastRec)}
$("copyEv").onclick=()=>{const t=`${CSL.title} (${CSL.code}) virtual ESP32 test evidence (simulator, not the physical kit)\nSketch settings: ${Object.keys(P).filter(x=>P[x]!==undefined).map(x=>x+"="+P[x]).join(", ")}\nDesign change (${L.fix.name}): ${fix?"fitted":"not fitted"}\nB1 7.1 test: ${specLast?(specLast.met?"met":"not met")+" ("+specLast.checks.join("; ")+")":"not run"}\nMissions complete: ${done.size}/${M.length}\nLast 8 readings:\n`+$("serial").textContent.trim().split("\n").slice(-8).join("\n");try{navigator.clipboard.writeText(t);$("copySt").textContent="Copied. Paste it into your C3 log and say it is simulator evidence."}catch(e){$("copySt").textContent="Select and copy from the Serial Monitor instead."}};
/* ---------- start ---------- */
$("w1").min=W.min;$("w1").max=W.max;$("w1").step=W.step;if(W2){$("w2").min=W2.min;$("w2").max=W2.max;$("w2").step=W2.step}
setWorld(W.def,W2?W2.def:null);
drawSketch();calc();drawMissions();drawChart();glare();
window.__ds={P,P_DEF,k,L,labs,seen,done,M,reading,setWorld,specRun,rows:()=>rows,setFix:v=>{$("fix").checked=v;fix=v;if(sim)sim.fix=v?1:0;glare()},newSim,calOk,hist:()=>hist};
})();
