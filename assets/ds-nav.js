/* Injects the site bar and the lesson tab strip.
   <div id="dsnav" data-tab="lab1" data-lesson="motion"></div>  (data-lesson optional: shared pages remember the last lesson) */
(function(){
const LESSONS={
 CA3:{title:"☀️ CA3 Daylight Tracker",plan:"lesson-CA3.html",lab1:"lab-CA3-esp32.html",lab2:"lab-CA3-python.html",play:"playground.html#day_label",learn:"tutorials.html#t16",quiz:"quiz.html?topic=daylight"},
 CA1:{title:"🌦️ CA1 Weather Watch: Humidity & Temperature",plan:"lesson-CA1.html",lab1:"lab-CA1-esp32.html",lab2:"lab-CA1-python.html",play:"playground.html#cs_humidity",learn:"tutorial.html?id=27",quiz:"quiz.html?topic=cs_moisture"},
 CA2:{title:"🌧️ CA2 Rainfall Alert",plan:"lesson-CA2.html",lab1:"lab-CA2-esp32.html",lab2:"lab-CA2-python.html",play:"playground.html#cs_rain_pct",learn:"tutorial.html?id=24",quiz:"quiz.html?topic=cs_rain"},
 CA4:{title:"🌡️ CA4 Water Temperature Monitor",plan:"lesson-CA4.html",lab1:"lab-CA4-esp32.html",lab2:"lab-CA4-python.html",play:"playground.html#cs_calibrated",learn:"tutorial.html?id=26",quiz:"quiz.html?topic=cs_temp"},
 CA5:{title:"💨 CA5 Air Quality Guardian",plan:"lesson-CA5.html",lab1:"lab-CA5-esp32.html",lab2:"lab-CA5-python.html",play:"playground.html#cs_index_from_raw",learn:"tutorial.html?id=21",quiz:"quiz.html?topic=cs_gas"},
 GH1:{title:"💡 GH1 Healthy Light",plan:"lesson-GH1.html",lab1:"lab-esp32.html",lab2:"lab-python.html",play:"playground.html#day_label",learn:"tutorial.html?id=16",quiz:"quiz.html?topic=ldr"},
 GH2:{title:"🔊 GH2 Noise & Well-Being",plan:"lesson-GH2.html",lab1:"lab-GH2-esp32.html",lab2:"lab-GH2-python.html",play:"playground.html#cs_db_from_peak",learn:"tutorial.html?id=20",quiz:"quiz.html?topic=cs_sound"},
 GH3:{title:"🏃 GH3 Motion in Real Time",plan:"lesson-GH3.html",lab1:"lab-GH3-esp32.html",lab2:"lab-GH3-python.html",play:"playground.html#cs_speed_mps",learn:"tutorial.html?id=28",quiz:"quiz.html?topic=cs_photogate"},
 GH4:{title:"🫀 GH4 Personal Health Monitor",plan:"lesson-GH4.html",lab1:"lab-GH4-esp32.html",lab2:"lab-GH4-python.html",play:"playground.html#cs_bpm_from_gap",learn:"tutorial.html?id=29",quiz:"quiz.html?topic=cs_health"},
 GH5:{title:"🏠 GH5 Indoor Air & Health",plan:"lesson-GH5.html",lab1:"lab-GH5-esp32.html",lab2:"lab-GH5-python.html",play:"playground.html#cs_index_from_raw",learn:"tutorial.html?id=21",quiz:"quiz.html?topic=cs_gas"},
 SC5:{title:"🕵️ SC5 Motion Detection for Safer Spaces",plan:"lesson-SC5.html",lab1:"lab-motion.html",lab2:"lab-python-motion.html",play:"playground.html",learn:"tutorials.html",quiz:"quiz.html?topic=pir"},
 SC6:{title:"🌉 SC6 Vibration & Structural Safety",plan:"lesson-SC6.html",lab1:"lab-SC6-esp32.html",lab2:"lab-SC6-python.html",play:"playground.html#cs_vib_percent",learn:"tutorial.html?id=22",quiz:"quiz.html?topic=cs_vibration"},
 SC7:{title:"🔥 SC7 Flame Detection for Fire Safety",plan:"lesson-SC7.html",lab1:"lab-SC7-esp32.html",lab2:"lab-SC7-python.html",play:"playground.html#cs_flame_pct",learn:"tutorial.html?id=23",quiz:"quiz.html?topic=cs_flame"},
 SC8:{title:"🏭 SC8 Gas Safety for Cities",plan:"lesson-SC8.html",lab1:"lab-SC8-esp32.html",lab2:"lab-SC8-python.html",play:"playground.html#cs_index_from_raw",learn:"tutorial.html?id=21",quiz:"quiz.html?topic=cs_gas"},
 ZH5:{title:"🌱 ZH5 Soil Temperature for Crops",plan:"lesson-ZH5.html",lab1:"lab-ZH5-esp32.html",lab2:"lab-ZH5-python.html",play:"playground.html#cs_calibrated",learn:"tutorial.html?id=26",quiz:"quiz.html?topic=cs_temp"},
 ZH6:{title:"🌿 ZH6 Humidity & Temperature for Crops",plan:"lesson-ZH6.html",lab1:"lab-ZH6-esp32.html",lab2:"lab-ZH6-python.html",play:"playground.html#cs_humidity",learn:"tutorial.html?id=27",quiz:"quiz.html?topic=cs_moisture"},
 ZH7:{title:"💧 ZH7 Soil Moisture & Irrigation",plan:"lesson-ZH7.html",lab1:"lab-ZH7-esp32.html",lab2:"lab-ZH7-python.html",play:"playground.html#cs_soil_pct",learn:"tutorial.html?id=25",quiz:"quiz.html?topic=cs_soil"},
 ZH8:{title:"☔ ZH8 Rain, Irrigation & Crops",plan:"lesson-ZH8.html",lab1:"lab-ZH8-esp32.html",lab2:"lab-ZH8-python.html",play:"playground.html#cs_rain_pct",learn:"tutorial.html?id=24",quiz:"quiz.html?topic=cs_rain"},
 ZH9:{title:"🧪 ZH9 Gas Safety for Farms",plan:"lesson-ZH9.html",lab1:"lab-ZH9-esp32.html",lab2:"lab-ZH9-python.html",play:"playground.html#cs_index_from_raw",learn:"tutorial.html?id=21",quiz:"quiz.html?topic=cs_gas"},
 light:{title:"💡 Light Detector (LDR)",plan:"lesson-light.html",lab1:"lab-esp32.html",lab2:"lab-python.html"},
 motion:{title:"🚶 Motion Detector (PIR)",plan:"lesson-motion.html",lab1:"lab-motion.html",lab2:"lab-python-motion.html"},
 sound:{title:"🔊 Sound Sensor",plan:"lesson-sound.html"},
 photogate:{title:"🚪 Photogate Sensor",plan:"lesson-photogate.html"},
 health:{title:"❤️ Health Sensor",plan:"lesson-health.html"},
 gas:{title:"🧪 Gas Sensor",plan:"lesson-gas.html"},
 moisture:{title:"💧 Moisture Sensor",plan:"lesson-moisture.html"},
 rain:{title:"🌧️ Rain Drop Sensor",plan:"lesson-rain.html"},
 temp:{title:"🌡️ Temperature Probe",plan:"lesson-temp.html"},
 soil:{title:"🌱 Soil Moisture Sensor",plan:"lesson-soil.html"},
 vibration:{title:"📳 Vibration Sensor",plan:"lesson-vibration.html"},
 flame:{title:"🔥 Flame Sensor",plan:"lesson-flame.html"}
};
window.DS_LESSONS=LESSONS;
const el=document.getElementById("dsnav");if(!el)return;const cur=el.dataset.tab;
let L=el.dataset.lesson;try{if(L&&LESSONS[L])localStorage.setItem("ds_lesson",L);else L=localStorage.getItem("ds_lesson")}catch(e){}
if(!LESSONS[L])L="light";const D=LESSONS[L];
const TABS=[["plan","📋 Plan and rubric",D.plan]].concat(D.lab1?[["lab1","🔌 Lab 1 · Virtual ESP32",D.lab1],["lab2","🐍 Lab 2 · Python data lab",D.lab2]]:[]).concat([["play","🎯 Practice",D.play||"playground.html"],["learn","🎬 Learn",D.learn||"tutorials.html"],["quiz","🎮 Quiz",D.quiz||"quiz.html"]]);
el.outerHTML='<div class="topbar"><a class="brand" href="index.html">🔬 Grade 9 · DS PRO</a><a class="tab" href="index.html">Home</a><a class="tab" href="criteria-a.html">Criteria A</a><a class="tab" href="criteria-b.html">Criteria B</a><a class="tab active" href="criteria-c.html">Criteria C</a><a class="tab" href="criteria-d.html">Criteria D</a></div>'+
'<div class="lessontabs" role="tablist" aria-label="Lesson"><span class="lt-title"><select id="lessonSel" aria-label="Choose sensor lesson" style="font:inherit;font-weight:700;border:0;background:transparent;color:inherit;cursor:pointer">'+Object.keys(LESSONS).map(k=>`<option value="${k}"${k===L?" selected":""}>${LESSONS[k].title}</option>`).join("")+'</select></span>'+TABS.map(t=>`<a role="tab" class="lt${t[0]===cur?" on":""}" ${t[0]===cur?'aria-selected="true"':""} href="${t[2]}">${t[1]}</a>`).join("")+"</div>";
const sel=document.getElementById("lessonSel");if(sel)sel.onchange=()=>{try{localStorage.setItem("ds_lesson",sel.value)}catch(e){}location.href=LESSONS[sel.value].plan};
})();
