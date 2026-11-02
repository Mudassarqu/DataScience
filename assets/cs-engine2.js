/* Lab 2 engine (Python data lab) for the Criterion C sensor lessons. Needs cs-steps.js, window.CSL and pyrunner.js. */
(function(){
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
const Y=CSL.py,STEPS=CS_BUILD(CSL),HDR=JSON.stringify(Y.cols);
const KEYL="ds_cs_"+CSL.code+"_log",KEYP="ds_cs_"+CSL.code+"_lab2";
let cur=0,ready=false,hints=0,solSeen=false,dsKey="day",cleaned=null,cleanForSteps={};
let prog={};try{prog=JSON.parse(localStorage.getItem(KEYP)||"{}")}catch(e){}const saveP=()=>{try{localStorage.setItem(KEYP,JSON.stringify(prog))}catch(e){}};
function data(){if(dsKey==="day")return CSL.DAY;if(dsKey==="dayfix")return CSL.DAYFIX;if(dsKey==="messy")return CSL.MESSY;try{return JSON.parse(localStorage.getItem(KEYL)||"[]")}catch(e){return[]}}
const num=x=>{const v=parseFloat(x);return x===""||x==null||isNaN(v)?null:v};
function pre(){return `import json as _j; CHECKS=[tuple(_c) for _c in ${JSON.stringify(CSL.CHECKS)}]; RAW=[dict(zip(${HDR},_r)) for _r in _j.loads(r'''${JSON.stringify(data()).replace(/'/g,"")}''')]\n`}
async function preWithClean(){const key=dsKey+data().length;if(!cleanForSteps[key]){const sol=STEPS.find(s=>s.id==="clean").solution;const r=await PyRun.run(pre()+sol+"\nprint('@@DATA@@'+_j.dumps(clean(RAW)))");cleanForSteps[key]=(r.out.split("@@DATA@@")[1]||"[]").trim()}
 return pre().replace(/\n$/,"")+`; clean_rows=_j.loads(r'''${cleanForSteps[key].replace(/'/g,"")}''')\n`}
function drawSteps(){$("steps").innerHTML=STEPS.map((s,i)=>`<button role="tab" class="${i===cur?"on":""}" data-i="${i}"><span class="d">${prog[s.id]&&prog[s.id].done?"✔":"○"}</span>${esc(s.title)}</button>`).join("");$("steps").querySelectorAll("button").forEach(b=>b.onclick=()=>show(+b.dataset.i))}
function gut(){const c=$("code"),n=c.value.split("\n").length;let s="";for(let i=1;i<=n;i++)s+=i+"\n";$("gutter").textContent=s;$("gutter").scrollTop=c.scrollTop}
function show(i){cur=i;const s=STEPS[i];if(s.needDay&&dsKey!=="day"&&dsKey!=="dayfix"){dsKey="day";$("dsel").value="day";cleaned=null;tableRows();$("dnote").textContent=NOTES.day}hints=0;solSeen=false;$("sTitle").textContent=s.title+"   ("+s.c+")";$("sGoal").innerHTML="<p style='margin:0'>"+s.goal+"</p>";$("hintBox").innerHTML="";
 $("code").value=(prog[s.id]&&prog[s.id].code)||s.starter;gut();$("out").textContent="Run your code to see the output here.";
 $("checks").innerHTML='<li class="wait"><span class="ic">·</span><div>Press “Check my code”.</div></li>';$("score").innerHTML="";$("win").innerHTML="";drawSteps()}
function tableRows(){const d=data();$("dcount").textContent=d.length+" rows";if(!d.length){$("dtab").innerHTML="<tr><td>No Lab 1 readings yet. Go to Lab 1, press the Play button, then come back.</td></tr>";return}
 $("dtab").innerHTML="<tr>"+Y.cols.map(c=>`<th>${esc(c)}</th>`).join("")+"</tr>"+d.slice(0,150).map(r=>{const raw=num(r[1]),v=num(r[2]);const bad=raw==null||v==null||!String(r[3]||"").trim()||raw<Y.lo||raw>Y.hi;return `<tr class="${bad?"bad":""}">`+[0,1,2,3].map(j=>`<td>${esc(r[j])}</td>`).join("")+"</tr>"}).join("")}
function fixLines(t){return String(t||"").replace(/Line (\d+):/g,(m,n)=>"Line "+Math.max(1,n-1)+":")}
function showOut(r){let h=esc((r.out||"").replace(/@@DATA@@.*\n?/g,""));if(r.err)h+=(h?"\n":"")+'<span class="err">❌ '+esc(fixLines(r.err))+"</span>";$("out").innerHTML=h||"(no output)"}
async function run(check){if(!ready)return;const s=STEPS[cur];if(!data().length){$("out").textContent="This dataset is empty. Choose another one or record readings in Lab 1 first.";return}
 const src=$("code").value;prog[s.id]=prog[s.id]||{};prog[s.id].code=src;saveP();$("checkBtn").disabled=$("runBtn").disabled=true;
 let r;try{const base=(s.id==="clean"||s.id==="parse")?pre():await preWithClean();r=await PyRun.run(base+src,check?s.tests:undefined)}catch(e){r={out:"",err:String(e),results:[]}}
 $("checkBtn").disabled=$("runBtn").disabled=false;showOut(r);if(!check)return;
 if(r.err&&!r.results.length){$("checks").innerHTML='<li class="no"><span class="ic">✘</span><div><strong>Your code has an error</strong><small>'+esc(fixLines(r.err))+"</small></div></li>";$("score").innerHTML="";return}
 const pass=r.results.filter(x=>x[1]).length,tot=r.results.length,all=pass===tot&&tot>0;
 $("score").innerHTML=`<div class="ring" style="--p:${tot?Math.round(pass/tot*100):0}"><i>${tot?Math.round(pass/tot*100):0}%</i></div><div><strong>${pass} of ${tot} tests passed</strong></div>`;
 $("checks").innerHTML=r.results.map(x=>`<li class="${x[1]?"ok":"no"}"><span class="ic">${x[1]?"✔":"✘"}</span><div><strong>${esc(x[0])}</strong>${x[2]?"<small>"+esc(x[2])+"</small>":""}</div></li>`).join("");
 if(s.id==="clean"){const m=(r.out||"").match(/@@DATA@@(.*)/);if(m){try{cleaned=JSON.parse(m[1]);drawFigs()}catch(e){}}}
 if(s.id==="spec71"&&r.out){const m=r.out.split("\n").filter(l=>/worst error|wrong:|delay:|met\?|Met\?/.test(l));window.__specOut=m.join(" | ")}
 if(all){const first=!prog[s.id].done;prog[s.id].done=true;saveP();drawSteps();$("win").innerHTML='<div class="win">🎉 <strong>Step complete!</strong>'+(solSeen?" (You looked at the solution, so try it again later without it.)":"")+"</div>";try{win()}catch(e){}
  if(first&&!solSeen){try{const u=currentUser();if(u&&typeof postToSheet==="function")postToSheet("quiz",{Name:u.name,Class:u.klass,Criterion:"P",Topic:CSL.title+" ("+CSL.code+")",Lesson:"Lab 2 Python data lab",Quiz:"Lab · "+CSL.title+" · Python · "+s.title,Score:pass,Total:tot,Percent:100,TimeTakenSec:0})}catch(e){}}}}
function win(){const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const ac=new C();[523,659,784,1046].forEach((f,i)=>{const o=ac.createOscillator(),g=ac.createGain();o.type="triangle";o.frequency.value=f;g.gain.setValueAtTime(.0001,ac.currentTime+i*.12);g.gain.exponentialRampToValueAtTime(.2,ac.currentTime+i*.12+.02);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+i*.12+.2);o.connect(g);g.connect(ac.destination);o.start(ac.currentTime+i*.12);o.stop(ac.currentTime+i*.12+.22)})}
/* charts */
const css=n=>getComputedStyle(document.body).getPropertyValue(n).trim();
function cv(id,cap){return `<figure class="fig"><canvas id="${id}" width="520" height="300" style="width:100%;height:auto;background:var(--panel);border-radius:8px;border:1px solid var(--line)" role="img" aria-label="${cap}"></canvas><figcaption>${cap}</figcaption></figure>`}
const fm=v=>Math.abs(v)>=1000?Math.round(v):(Math.abs(v)>=100?v.toFixed(0):v.toFixed(1)).replace(/\.0$/,"");
function axes(g,W,H,xl,ymin,ymax){g.font="13px system-ui";g.fillStyle=css("--muted");g.strokeStyle=css("--line");g.lineWidth=1;for(let i=0;i<=4;i++){const y=20+(H-60)*i/4;g.beginPath();g.moveTo(52,y);g.lineTo(W-12,y);g.stroke();g.fillText(fm(ymax-(ymax-ymin)*i/4),4,y+4)}g.fillText(xl,W/2-40,H-6)}
const COL=["#16a34a","#d97706","#dc2626"];
function drawFigs(){if(!cleaned||!cleaned.length)return;const raw=data().map(r=>({ts:r[0],raw:num(r[1])}));
 const VN=Y.VAL.replace(/_/g," "),RN=Y.RAW.replace(/_/g," ");
 $("figst").textContent=cleaned.length+" clean rows";
 $("figs").innerHTML='<div class="charts">'+cv("f0","Figure 1: "+RN+". Red crosses were removed by your clean().")+cv("f1","Figure 2: "+VN+" over time with your 5-sample moving average. Dotted lines are your sketch thresholds.")+cv("f2","Figure 3: how often each status was reported.")+cv("f3","Figure 4: distribution of "+VN+" with mean and median.")+"</div>";
 const T=n=>document.getElementById(n);const vals=cleaned.map(r=>r[Y.VAL]);
 {const c=T("f0"),g=c.getContext("2d"),W=c.width,H=c.height;const rv=raw.map(r=>r.raw).filter(v=>v!=null);const cap=Math.max(...cleaned.map(r=>r[Y.RAW]))*1.15;const ymax=Math.max(cap,1),ymin=Math.min(0,...cleaned.map(r=>r[Y.RAW]));axes(g,W,H,"sample number",ymin,ymax);
  let k=0;const keep=new Set();raw.forEach((r,i)=>{if(k<cleaned.length&&cleaned[k].Timestamp===r.ts&&Math.abs(cleaned[k][Y.RAW]-(r.raw==null?-9e9:r.raw))<1e-6){keep.add(i);k++}});
  raw.forEach((r,i)=>{const x=52+(W-68)*i/Math.max(1,raw.length-1);if(r.raw==null){g.fillStyle="#dc2626";g.fillText("?",x,H-34);return}const yy=Math.min(ymax,Math.max(ymin,r.raw));const y=20+(H-60)*(1-(yy-ymin)/(ymax-ymin));if(keep.has(i)){g.fillStyle="#0891b2";g.beginPath();g.arc(x,y,2.6,0,7);g.fill()}else{g.strokeStyle="#dc2626";g.lineWidth=2;g.beginPath();g.moveTo(x-4,y-4);g.lineTo(x+4,y+4);g.moveTo(x+4,y-4);g.lineTo(x-4,y+4);g.stroke()}});
  window.__removed=raw.length-keep.size}
 {const c=T("f1"),g=c.getContext("2d"),W=c.width,H=c.height;const lo=Math.min(...vals,Y.t1,Y.t2),hi=Math.max(...vals,Y.t1,Y.t2),pad=(hi-lo)*.08||1;const ymin=lo-pad,ymax=hi+pad;axes(g,W,H,"sample number",ymin,ymax);const n=cleaned.length;const X=i=>52+(W-68)*i/Math.max(1,n-1),Yy=v=>20+(H-60)*(1-(v-ymin)/(ymax-ymin));
  [[Y.t1,"#10b981"],[Y.t2,"#ef4444"]].forEach(([v,col])=>{g.strokeStyle=col;g.setLineDash([3,4]);g.beginPath();g.moveTo(52,Yy(v));g.lineTo(W-12,Yy(v));g.stroke();g.setLineDash([])});
  g.lineWidth=1.8;g.strokeStyle="#06b6d4";g.beginPath();cleaned.forEach((r,i)=>i?g.lineTo(X(i),Yy(r[Y.VAL])):g.moveTo(X(i),Yy(r[Y.VAL])));g.stroke();
  g.strokeStyle="#f59e0b";g.setLineDash([6,4]);g.lineWidth=2.2;g.beginPath();cleaned.forEach((r,i)=>i?g.lineTo(X(i),Yy(r.Value_MA5)):g.moveTo(X(i),Yy(r.Value_MA5)));g.stroke();g.setLineDash([])}
 {const c=T("f2"),g=c.getContext("2d"),W=c.width,H=c.height;const order=Y.labels,cnt=order.map(o=>cleaned.filter(r=>r[Y.LAB]===o).length);const other=cleaned.length-cnt.reduce((a,b)=>a+b,0);const ym=Math.max(...cnt,other,1);axes(g,W,H,"status",0,ym);
  const names=order.concat(other>0?["other"]:[]),cn=cnt.concat(other>0?[other]:[]);cn.forEach((n,i)=>{const bw=(W-70)/names.length,x=58+i*bw+6,h=(H-60)*n/ym;g.fillStyle=COL[i]||"#64748b";g.fillRect(x,H-40-h,bw-12,h);g.fillStyle=css("--ink");g.fillText(n,x+(bw-12)/2-8,H-44-h);g.fillStyle=css("--muted");g.font="10px system-ui";g.fillText(names[i].replace(/_/g," ").slice(0,14),x,H-24);g.font="13px system-ui"})}
 {const c=T("f3"),g=c.getContext("2d"),W=c.width,H=c.height;const lo=Math.min(...vals),hi=Math.max(...vals),rng=(hi-lo)||1,bins=Array(10).fill(0);vals.forEach(x=>bins[Math.min(9,Math.floor((x-lo)/rng*10))]++);const ym=Math.max(...bins,1);axes(g,W,H,VN,0,ym);
  bins.forEach((n,i)=>{const bw=(W-68)/10,h=(H-60)*n/ym;g.fillStyle="#0284c7";g.fillRect(54+i*bw+2,H-40-h,bw-4,h)});
  const mean=vals.reduce((a,b)=>a+b,0)/vals.length,s=[...vals].sort((a,b)=>a-b),med=s.length%2?s[(s.length-1)/2]:(s[s.length/2-1]+s[s.length/2])/2;const X=x=>54+(W-68)*(x-lo)/rng;
  g.lineWidth=2;g.strokeStyle="#ef4444";g.beginPath();g.moveTo(X(mean),20);g.lineTo(X(mean),H-40);g.stroke();g.strokeStyle="#10b981";g.setLineDash([6,4]);g.beginPath();g.moveTo(X(med),20);g.lineTo(X(med),H-40);g.stroke();g.setLineDash([]);
  g.fillStyle="#ef4444";g.fillText("mean "+fm(mean),W-130,34);g.fillStyle="#10b981";g.fillText("median "+fm(med),W-130,50)}
}
/* wiring */
$("checkBtn").onclick=()=>run(true);$("runBtn").onclick=()=>run(false);
$("hintBtn").onclick=()=>{const s=STEPS[cur];if(hints<s.hints.length)hints++;$("hintBox").innerHTML=s.hints.slice(0,hints).map((h,i)=>`<div class="hint"><strong>Hint ${i+1}:</strong> ${h}</div>`).join("")};
$("solBtn").onclick=()=>{if(!solSeen&&!confirm("Show the solution? Try the hints first. You can still complete the step, but it will not be sent to the Google Sheet."))return;solSeen=true;$("hintBox").innerHTML='<div class="hint"><strong>Solution</strong><pre style="background:var(--code-bg);color:var(--code-ink);padding:10px;border-radius:8px;overflow:auto;margin:6px 0 0">'+esc(STEPS[cur].solution)+"</pre></div>"};
$("resetBtn").onclick=()=>{if(confirm("Put the starter code back?")){const s=STEPS[cur];$("code").value=s.starter;if(prog[s.id])delete prog[s.id].code;saveP();gut()}};
$("code").addEventListener("input",gut);$("code").addEventListener("scroll",()=>{$("gutter").scrollTop=$("code").scrollTop});
$("code").addEventListener("keydown",e=>{if(e.key==="Tab"){e.preventDefault();const c=$("code"),a=c.selectionStart;c.value=c.value.slice(0,a)+"    "+c.value.slice(c.selectionEnd);c.selectionStart=c.selectionEnd=a+4;gut()}if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();run(true)}});
const NOTES={day:"Model data: one day made by the Lab 1 simulator WITHOUT your C4 design change, with the faults a real kit produces added. It is not from a real sensor.",dayfix:"Model data: the same day WITH your C4 design change fitted. It is not from a real sensor.",messy:"Synthetic practice data made with a different random seed, full of faults. Use it to test that your clean() is robust.",lab1:"The readings you recorded in Lab 1 on this device."};
$("dsel").onchange=()=>{dsKey=$("dsel").value;cleaned=null;$("figs").innerHTML='<div class="lock">🔒 Pass <strong>Step 2 · Clean</strong> again with this dataset to redraw the figures.</div>';tableRows();$("dnote").textContent=NOTES[dsKey]};
["q1","q2","q3"].forEach(q=>{try{$(q).value=localStorage.getItem("ds_cs_"+CSL.code+"_"+q)||""}catch(e){}});
document.querySelectorAll("[data-save]").forEach(b=>b.onclick=()=>{const q=b.dataset.save,t=$(q).value.trim(),st=$("st-"+q);if(!t){st.textContent="Write something first.";return}try{localStorage.setItem("ds_cs_"+CSL.code+"_"+q,t)}catch(e){}const u=currentUser();if(u&&typeof postToSheet==="function"){postToSheet("strand",{Name:u.name,Class:u.klass,Lesson:CSL.title+" ("+CSL.code+") Lab 2",Strand:"C",Prompt:document.querySelector('label[for="'+q+'"]').textContent,Response:t});st.textContent="✅ Saved and sent "+new Date().toLocaleTimeString()}else st.textContent="Saved here. Log in to also send it to your teacher."});
tableRows();drawSteps();show(0);$("dnote").textContent=NOTES.day;
PyRun.init().then(()=>{ready=true;$("pystatus").textContent="Python ready";$("checkBtn").disabled=$("runBtn").disabled=false}).catch(e=>{$("pystatus").textContent=String(e.message||e)});
window.__lab2={run,show,get cleaned(){return cleaned},prog,STEPS,drawFigs,setClean:c=>{cleaned=c},data};
})();
