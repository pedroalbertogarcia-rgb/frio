(function(){
"use strict";
var START="2026-11-11", END="2026-12-02";
var OPEN=[
 "O frio é um professor honesto.",
 "Respira. Tu és mais forte do que pensas.",
 "Entra calmo, sai mais forte.",
 "Um dia de cada vez, um duche de cada vez.",
 "Primeiro a respiração, depois a coragem.",
 "Não lutes contra o frio. Recebe-o.",
 "Hoje, só mais um bocadinho do que ontem."
];
var DONE=[
 "Feito. O desconforto de hoje é a força de amanhã.",
 "Ficaste. É assim que se constrói.",
 "Mais um dia ganho ao conforto.",
 "O frio passou. O que construíste fica.",
 "Ninguém se arrepende de um duche frio já tomado.",
 "Saíste mais forte do que entraste.",
 "A tua vontade aqueceu mais do que a água.",
 "Isto já é hábito a nascer. Amanhã há mais.",
 "Calma debaixo de água fria: poucos treinam isto.",
 "Cada segundo contou, e tu contaste-os todos.",
 "Hoje escolheste o difícil. Guarda essa sensação.",
 "O corpo aprendeu mais um pouco. Bom trabalho."
];
var MONTHS=["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];

function pad(n){return (n<10?"0":"")+n}
function toStr(d){return d.getUTCFullYear()+"-"+pad(d.getUTCMonth()+1)+"-"+pad(d.getUTCDate())}
function parse(s){var p=s.split("-");return new Date(Date.UTC(+p[0],+p[1]-1,+p[2]))}
function addDays(s,n){var d=parse(s);d.setUTCDate(d.getUTCDate()+n);return toStr(d)}
function diff(a,b){return Math.round((parse(b)-parse(a))/864e5)}
function today(){var d=new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
function nice(s){var p=s.split("-");return (+p[2])+" "+MONTHS[+p[1]-1]}
var DAYS=[];(function(){for(var s=START;s<=END;s=addDays(s,1))DAYS.push(s)})();
var TOTAL=DAYS.length;
function clock(s){s=Math.max(0,Math.round(s));var m=Math.floor(s/60);return m+":"+pad(s%60)}
function dur(s){s=Math.round(s);if(s<60)return s+" s";var h=Math.floor(s/3600),m=Math.floor((s%3600)/60),r=s%60;
  if(h)return h+" h "+pad(m);return m+" min"+(r&&m<10?" "+pad(r):"")}
function $(id){return document.getElementById(id)}
function lget(k){try{var v=localStorage.getItem(k);return v==null?null:JSON.parse(v)}catch(e){return null}}
function lset(k,v){try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function clean(l){
  if(!l||typeof l.id!=="string"||!/^[A-Za-z0-9_-]{1,60}$/.test(l.id))return null;
  var secs=Number(l.secs);if(!/^\d{4}-\d{2}-\d{2}$/.test(String(l.date))||!(secs>0)||secs>86400)return null;
  return {id:l.id,date:l.date,secs:Math.round(secs),at:Number(l.at)||0};
}

/* ---------- dados: guardados apenas neste telemóvel ---------- */
var logs=(lget("frio.logs")||[]).map(clean).filter(Boolean);
var gone=lget("frio.gone")||[];
function keep(){lset("frio.logs",logs)}
/* ---------- cronómetro ---------- */
var run=lget("frio.timer"), pending=lget("frio.pending"), tick=null, message="";
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function paint(){
  var btn=$("timerBtn");btn.classList.toggle("running",!!run);btn.classList.toggle("done",!run&&!!pending);
  if(run){$("tTime").textContent=clock((Date.now()-run.start)/1000);$("tLabel").textContent="Parar"}
  else if(pending){$("tTime").textContent=clock(pending.secs);$("tLabel").textContent="Tempo final"}
  else{$("tTime").textContent="0:00";$("tLabel").textContent="Iniciar"}
  var show=!!pending&&!run;$("endPop").hidden=!show;if(show)fillEnd();
  $("msg").textContent=run?"Respira devagar. Estás a conseguir.":message;
}
var MEDALS=[
 ["t",10,"Aguentar 10 segundos","Primeira Faísca"],["t",30,"Aguentar 30 segundos","Coragem"],["t",60,"Aguentar 1 minuto","Sangue-Frio"],
 ["t",120,"Aguentar 2 minutos","Mente Calma"],["t",180,"Aguentar 3 minutos","Domínio"],["t",300,"Aguentar 5 minutos","Gelo nas Veias"],
 ["t",600,"Aguentar 10 minutos","Lenda do Frio"],
 ["d",3,"3 dias seguidos com registo","Ritmo"],["d",7,"7 dias seguidos com registo","Semana de Ferro"],
 ["d",14,"14 dias seguidos com registo","Hábito"],["d",22,"22 dias seguidos com registo","Desafio Completo"]
];
function standing(list){
  var best=0,days={};list.forEach(function(l){if(l.secs>best)best=l.secs;days[l.date]=1});
  var run=0,top=0,prev="";Object.keys(days).sort().forEach(function(d){run=(prev&&addDays(prev,1)===d)?run+1:1;if(run>top)top=run;prev=d});
  return {best:best,top:top};
}
function earned(list){
  var st=standing(list);
  return MEDALS.filter(function(m){return (m[0]==="t"?st.best:st.top)>=m[1]}).map(function(m){return m[3]});
}
function medalCard(){
  var st=standing(logs),got=earned(logs);
  function track(kind,title,sub){
    var list=MEDALS.filter(function(m){return m[0]===kind}),val=kind==="t"?st.best:st.top,next=null;
    list.forEach(function(m){if(!next&&val<m[1])next=m});
    var h='<div class="track"><h3>'+title+'</h3><div class="sub">'+sub+'</div>';
    if(next){
      var gap=next[1]-val,left=kind==="t"?dur(gap):gap+(gap===1?" dia":" dias");
      h+='<div class="next">Próxima: '+next[3]+'. '+(gap===1&&kind==="d"?"Falta ":"Faltam ")+left+'.<div class="barm"><i style="width:'+Math.round(100*val/next[1])+'%"></i></div></div>';
    }else h+='<div class="next">Todas conquistadas.</div>';
    list.forEach(function(m,i){
      var on=val>=m[1];
      h+='<div class="mrow'+(on?" on":"")+'"><i data-medal="'+m[3]+'">'+(on?medalSVG(m):(i+1))+'</i><div class="mw"><b>'+m[3]+'</b><span>'+m[2]+'</span></div><div class="st">'+(on?"Conquistada":"Por conquistar")+'</div></div>';
    });
    return h+'</div>';
  }
  return '<div class="card"><div class="mhead"><h2>Medalhas</h2><div class="mcount">'+got.length+' de '+MEDALS.length+'</div></div>'
   +'<p class="prize">Os 3 com mais medalhas ganham um almoço em Estocolmo. Os tempos vão ser confirmados.</p>'
   +track("t","Tempo no frio",st.best?"O teu melhor tempo: "+clock(st.best)+". Cada marca vale uma medalha.":"Aguenta cada vez mais. Cada marca vale uma medalha.")
   +track("d","Dias seguidos",st.top?"A tua melhor sequência: "+st.top+(st.top===1?" dia":" dias")+". Cada marca vale uma medalha.":"Não falhes um dia. Cada marca vale uma medalha.")
   +'</div>';
}
function medalSVG(m){
  var n=m[0]==="t"?(m[1]<60?m[1]:m[1]/60):m[1],u=m[0]==="d"?"dias":(m[1]<60?"segundos":(m[1]===60?"minuto":"minutos")),leaves="";
  for(var i=0;i<18;i++){
    var deg=-60+i*(300/17),a=deg*Math.PI/180,x=(50+38*Math.cos(a)).toFixed(1),y=(62+38*Math.sin(a)).toFixed(1);
    leaves+='<ellipse cx="'+x+'" cy="'+y+'" rx="5.2" ry="2.3" transform="rotate('+Math.round(deg+90+(i<9?-38:38))+' '+x+' '+y+')"/>';
  }
  var f="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;fill:#4a3000;font-weight:800;";
  return '<svg viewBox="0 0 100 112" aria-hidden="true"><defs><linearGradient id="mg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe680"/><stop offset=".5" stop-color="#f2c230"/><stop offset="1" stop-color="#c8920a"/></linearGradient></defs>'
   +'<path fill="url(#mg)" fill-rule="evenodd" d="M34 2h32v22H34zM40 7h20v7H40z"/>'
   +'<circle cx="50" cy="62" r="48" fill="url(#mg)"/><circle cx="50" cy="62" r="45.5" fill="none" stroke="#b07c00" stroke-width="1"/>'
   +'<g fill="#dba716" stroke="#a87400" stroke-width=".6">'+leaves+'</g>'
   +'<circle cx="50" cy="62" r="29" fill="#ffe27a" stroke="#b07c00" stroke-width="1"/>'
   +'<text x="50" y="68" text-anchor="middle" style="'+f+'font-size:'+(String(n).length>1?27:31)+'px">'+n+'</text>'
   +'<text x="50" y="79" text-anchor="middle" style="'+f+'font-size:8.5px">'+u+'</text></svg>';
}
function celebrate(list){
  if(!list.length)return;
  var slots={};
  Array.prototype.forEach.call(document.querySelectorAll("[data-medal]"),function(el){slots[el.getAttribute("data-medal")]=el});
  list.forEach(function(m){if(slots[m[3]])slots[m[3]].parentNode.classList.add("wait")});
  var still=!!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  (function next(){
    var m=list.shift();if(!m)return;
    var slot=slots[m[3]],ov=document.createElement("div");
    ov.className="fly";
    ov.innerHTML='<div class="flybg"></div><div class="flybox"><div class="flyt">Nova medalha</div><div class="flym"><div class="flyb">'+medalSVG(m)+'</div></div><div class="flyn"></div></div>';
    ov.querySelector(".flyn").textContent=m[3];
    document.body.appendChild(ov);
    if(slot&&slot.scrollIntoView)slot.scrollIntoView({block:"center"});
    setTimeout(function(){
      var fly=slot&&!still,med=ov.querySelector(".flym");
      if(fly){
        var a=med.getBoundingClientRect(),b=slot.getBoundingClientRect();
        ov.classList.add("go");
        med.style.transform="translate("+(b.left+b.width/2-a.left-a.width/2)+"px,"+(b.top+b.height/2-a.top-a.height/2)+"px) scale("+(b.width/a.width)+")";
      }
      setTimeout(function(){
        if(slot){slot.parentNode.classList.remove("wait");slot.parentNode.classList.add("land")}
        if(ov.parentNode)ov.parentNode.removeChild(ov);
        next();
      },fly?850:0);
    },2000);
  })();
}
function tier(s){
  if(s<30)return "Cada segundo debaixo de água fria conta.";
  if(s<60)return "Quase um minuto. O teu corpo já está a aprender.";
  if(s<120)return "Mais de um minuto de calma no frio.";
  if(s<300)return "Minutos inteiros no frio. Isto é domínio.";
  return "Mais de cinco minutos. Poucos chegam aqui.";
}
function fillEnd(){
  var s=pending.secs,t=today(),best=0,prevDay="",prevBest=0;
  logs.forEach(function(l){if(l.secs>best)best=l.secs;if(l.date<t&&l.date>prevDay)prevDay=l.date});
  logs.forEach(function(l){if(l.date===prevDay&&l.secs>prevBest)prevBest=l.secs});
  var title,cmp="";
  if(!logs.length){title="Primeiro registo!";cmp="O passo mais difícil está dado."}
  else if(s>best){title="Bateste o teu recorde!";cmp="Mais "+dur(s-best)+" do que o teu melhor tempo ("+clock(best)+")."}
  else if(!prevDay){title="Mais uma vez hoje";cmp="O teu melhor continua em "+clock(best)+"."}
  else if(s>prevBest+2){title="Melhoraste!";cmp="Mais "+dur(s-prevBest)+" do que no dia anterior ("+clock(prevBest)+", "+nice(prevDay)+")."}
  else if(s>=prevBest-2){title="Mantiveste o ritmo";cmp="Igual ao dia anterior ("+clock(prevBest)+", "+nice(prevDay)+"). A consistência é que conta."}
  else{title="Hoje ficaste abaixo";cmp="Menos "+dur(prevBest-s)+" do que no dia anterior ("+clock(prevBest)+", "+nice(prevDay)+"). Apareceste, e amanhã voltas a subir."}
  $("endTime").textContent=clock(s);$("endTitle").textContent=title;$("endCmp").textContent=cmp;$("endMsg").textContent=tier(s);
}
function intro(){
  var t=today(),n=t<=START?TOTAL:(t>END?0:diff(t,END)+1);
  $("introTitle").textContent=n?n+" dias de frio":"Desafio do Frio";
  $("introLead").textContent="De quarta, 11 de novembro, a 2 de dezembro: um duche ou banho de água fria por dia. Tocas em Iniciar, ficas o tempo que conseguires, paras e guardas o registo.";
  $("introSub").textContent=n?"O que podes ganhar em "+n+" dias:":"O que este desafio te dá:";
  $("introDisc").textContent=n?n+" dias seguidos a escolher o difícil: disciplina que fica.":"Dias seguidos a escolher o difícil: disciplina que fica.";
  $("introPop").hidden=false;
}
$("introGo").addEventListener("click",function(){$("introPop").hidden=true;lset("frio.intro",1)});
$("aboutBtn").addEventListener("click",intro);
function loop(){clearInterval(tick);tick=null;if(run)tick=setInterval(paint,250)}
$("timerBtn").addEventListener("click",function(){
  if(run){
    var secs=Math.round((Date.now()-run.start)/1000);run=null;lset("frio.timer",null);
    pending=secs<1?null:{secs:Math.min(secs,86400)};lset("frio.pending",pending);
    message=pending?pick(DONE):OPEN[dayIndex()%OPEN.length];
  }else if(pending){return}
  else{run={start:Date.now()};lset("frio.timer",run)}
  loop();paint();
});
document.addEventListener("visibilitychange",function(){if(!document.hidden)paint()});
$("discardBtn").addEventListener("click",function(){pending=null;lset("frio.pending",null);message=OPEN[dayIndex()%OPEN.length];paint()});
$("saveBtn").addEventListener("click",function(){
  if(!pending)return;
  var l={id:"r"+Date.now().toString(36)+Math.random().toString(36).slice(2,7),date:today(),secs:pending.secs,at:Date.now()};
  var had=earned(logs);logs.push(l);keep();
  message="Guardado: "+clock(l.secs)+". "+pick(DONE);
  pending=null;lset("frio.pending",null);paint();render();
  var has=earned(logs);celebrate(MEDALS.filter(function(m){return had.indexOf(m[3])<0&&has.indexOf(m[3])>=0}));
});

/* ---------- evolução ---------- */
function dayIndex(){var t=today();return t<START?0:(t>END?TOTAL-1:diff(START,t))}
function niceMax(v){var s=[30,60,120,180,300,600,900,1200,1800,3600,7200,14400];for(var i=0;i<s.length;i++)if(v<=s[i])return s[i];return Math.ceil(v/3600)*3600}
function axis(s){return s<60?s+" s":(s%60===0?(s/60)+" min":clock(s))}
function chart(per){
  var W=320,H=170,L=34,R=6,T=8,B=20,pw=W-L-R,ph=H-T-B,mx=0,t=today();
  DAYS.forEach(function(d){if((per[d]||0)>mx)mx=per[d]});
  var top=niceMax(Math.max(mx,30)),bw=pw/TOTAL,o='<svg viewBox="0 0 '+W+' '+H+'" width="100%" role="img" aria-label="Tempo no frio por dia">';
  [0,.5,1].forEach(function(f){var y=T+ph-ph*f;o+='<line class="grid-l" x1="'+L+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'"/><text x="'+(L-4)+'" y="'+(y+3)+'" text-anchor="end">'+axis(Math.round(top*f))+'</text>'});
  DAYS.forEach(function(d,i){
    var v=per[d]||0,h=v?Math.max(2,ph*v/top):1.5,x=L+i*bw+1;
    o+='<rect class="bar'+(v?"":" zero")+(d===t?" today":"")+'" x="'+x.toFixed(1)+'" y="'+(T+ph-h).toFixed(1)+'" width="'+(bw-2).toFixed(1)+'" height="'+h.toFixed(1)+'" rx="1.5"><title>'+nice(d)+": "+(v?dur(v):"sem registo")+'</title></rect>';
    if((i%7===0&&TOTAL-1-i>3)||i===TOTAL-1)o+='<text x="'+(x+(bw-2)/2).toFixed(1)+'" y="'+(H-6)+'" text-anchor="middle">'+nice(d)+'</text>';
  });
  return o+'</svg>';
}
function render(){
  var t=today(),per={},tot=0,best=0;
  logs.forEach(function(l){per[l.date]=(per[l.date]||0)+l.secs;tot+=l.secs;if(l.secs>best)best=l.secs});
  var c=per[t]?t:addDays(t,-1),streak=0;while(per[c]){streak++;c=addDays(c,-1)}
  $("dayline").textContent=t<START?"Começa quarta, 11 nov":(t>END?"Desafio concluído":"Dia "+(dayIndex()+1)+" de "+TOTAL);
  var got=earned(logs);
  var list=logs.slice().sort(function(a,b){return a.date===b.date?b.at-a.at:(a.date<b.date?1:-1)});
  var h='<div class="tiles">'
   +'<div class="tile"><b>'+dur(tot)+'</b><span>Total no frio</span></div>'
   +'<div class="tile"><b>'+(best?clock(best):"–")+'</b><span>Melhor tempo</span></div>'
   +'<div class="tile"><b>'+streak+'</b><span>Dias seguidos</span></div></div>'
   +'<div class="card"><h2>Tempo no frio por dia</h2>'+chart(per)+'</div>'
   +medalCard()
   +'<div class="card"><h2>Registos</h2>';
  if(!list.length)h+='<p class="muted" style="margin:0">Ainda sem registos. O primeiro é o mais difícil.</p>';
  else{h+='<ul class="logs">';list.forEach(function(l){
    h+='<li><div class="w"><b>'+clock(l.secs)+'</b><div class="muted small">'+nice(l.date)+'</div></div>'
      +'<button class="del" type="button" data-del="'+l.id+'">Apagar</button></li>'});h+='</ul>'}
  $("evo").innerHTML=h+'</div>';
}
$("evo").addEventListener("click",function(e){
  var b=e.target.closest&&e.target.closest("[data-del]");if(!b)return;
  if(b.dataset.sure!=="1"){b.dataset.sure="1";b.textContent="Apagar mesmo?";setTimeout(function(){if(b.isConnected){b.dataset.sure="";b.textContent="Apagar"}},3000);return}
  var id=b.dataset.del;logs=logs.filter(function(l){return l.id!==id});keep();
  gone.push(id);gone=gone.slice(-300);lset("frio.gone",gone);
  render();
});

/* ---------- arranque ---------- */
if(pending&&!(pending.secs>0))pending=null;
if(run&&!(run.start>0&&run.start<=Date.now()))run=null;
message=pending?pick(DONE):OPEN[dayIndex()%OPEN.length];
loop();paint();render();
if(!lget("frio.intro")&&!pending&&!run)intro();
})();

if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})})}
