// Test: tapping
import { Arena } from "../core/arena.js";
import { U, setMain, setRow, setSummary } from "../core/cards.js";
import { plotXY } from "../core/chart.js";
import { LANGHOOKS, LEAVE, SHOW } from "../core/registry.js";
import { $, css, mean, ms, nf, pct, sd } from "../core/utils.js";
import { L, LANG } from "../i18n/index.js";
import { markDone } from "../main.js";
import { Click } from "./target-clicking.js";

// =====================================================================
// TAPPING — 10 s stukania osobno lewą (F) i prawą (J) ręką
// =====================================================================
const Tap = (() => { const DUR=10000, HANDS=[{k:"left",code:"KeyF",key:"F"},{k:"right",code:"KeyJ",key:"J"}];
  const A = new Arena("cv-tap"); let S=null, st=null, res={};
  const self = { tab:"tapping", key:"tapping", grid:"cards-tap", sumId:"sum-tap", R:null, title:{pl:"Tapping",en:"Tapping"}, specs:[
    {id:"tp-rate", title:{pl:"Tempo",en:"Rate"}, unit:{pl:"uderzeń/s (lewa / prawa)",en:"taps/s (left / right)"}, rows:[["n",{pl:"uderzeń",en:"taps"}],["asym",{pl:"różnica prawa − lewa",en:"difference right − left"}]],
     how:{pl:"Liczba wciśnięć w ciągu 10 s od pierwszego uderzenia, podzielona przez 10. Różnica rąk = (prawa − lewa) ÷ średnia obu, w procentach. U większości osób ręka dominująca jest szybsza o kilka do kilkunastu procent.",
          en:"Number of presses within 10 s from the first tap, divided by 10. Hand difference = (right − left) ÷ mean of both, in percent. For most people the dominant hand is a few to over ten percent faster."}},
    {id:"tp-cv", title:{pl:"Równomierność",en:"Regularity"}, unit:{pl:"CV odstępów (lewa / prawa)",en:"interval CV (left / right)"}, rows:[["int",{pl:"średni odstęp",en:"mean interval"}],["dw",{pl:"przytrzymanie klawisza",en:"key hold"}]],
     how:{pl:"Współczynnik zmienności odstępów między kolejnymi wciśnięciami (odchylenie ÷ średnia). Mniej = równiej.",en:"Coefficient of variation of the gaps between presses (std ÷ mean). Lower = more even."}},
    {id:"tp-fat", title:{pl:"Zmęczenie",en:"Fatigue"}, unit:{pl:"% zmiany tempa (lewa / prawa)",en:"% rate change (left / right)"},
     how:{pl:"Tempo w ostatnich 3 sekundach w porównaniu z pierwszymi 3 sekundami. Wartość ujemna oznacza zwolnienie pod koniec.",en:"Rate in the last 3 seconds compared with the first 3 seconds. A negative value means slowing down towards the end."}}
  ]};
  const status = o => { st=o; $("st-tap").textContent = L(o)||""; };
  function stats(t){ const d=t.map(x=>x.down), iv=d.slice(1).map((v,i)=>v-d[i]), dw=t.filter(x=>x.up!=null).map(x=>x.up-x.down);
    const r=(a,b)=>d.filter(v=>v-d[0]>=a && v-d[0]<b).length/((b-a)/1000);
    return { n:t.length, rate:t.length/(DUR/1000), cv:sd(iv)/mean(iv), interval:mean(iv), dwell:mean(dw), fatigue:(r(7000,10000)-r(0,3000))/r(0,3000), iv:iv.map((v,i)=>({t:(d[i+1]-d[0])/1000, v})) }; }
  function draw(){ A.fit(); if(!A.w) return; A.clear(); const g=A.ctx;
    if(S && S.run){ const left=Math.max(0,(DUR-(performance.now()-(S.t0||performance.now())))/1000);
      g.fillStyle=css("--ink"); g.font=`600 64px ${css("--font-mono")}`; g.textAlign="center"; g.textBaseline="middle"; g.fillText(String(S.taps.length), A.w/2, A.h/2-20);
      g.font=`15px ${css("--font-body")}`; g.fillStyle=css("--muted"); g.fillText(S.t0 ? (LANG==="pl"?`zostało ${nf(left,1)} s`:`${nf(left,1)} s left`) : (LANG==="pl"?`Stukaj w klawisz ${S.h.key}, czas ruszy od pierwszego uderzenia`:`Tap the ${S.h.key} key, timing starts at the first tap`), A.w/2, A.h/2+40); return; }
    const pts=[]; HANDS.forEach(h=>{ if(res[h.k]) res[h.k].iv.forEach(p=>pts.push({x:p.t, y:p.v, c:h.k==="left"?css("--accent"):css("--warn"), r:2.5})); });
    plotXY(A, { pts, xl:LANG==="pl"?"czas [s] · niebieskie: lewa ręka, pomarańczowe: prawa":"time [s] · blue: left hand, orange: right", yu:" ms", x0:0, xticks:[0,2,4,6,8,10], xfmt:v=>String(v),
      empty:LANG==="pl"?"Kliknij „Start: lewa ręka”, potem „Start: prawa ręka”":"Click “Start: left hand”, then “Start: right hand”" }); }
  function start(i){ if(S&&S.raf) cancelAnimationFrame(S.raf); S={h:HANDS[i], taps:[], run:true, t0:null}; if(document.activeElement) document.activeElement.blur();
    status({pl:`Lewa ręka: ${HANDS[0].key}, prawa: ${HANDS[1].key}. Teraz ${i?"PRAWA":"LEWA"} ręka, klawisz ${S.h.key}, stukaj jak najszybciej.`,en:`Left hand: ${HANDS[0].key}, right: ${HANDS[1].key}. Now the ${i?"RIGHT":"LEFT"} hand, key ${S.h.key}, tap as fast as you can.`});
    const loop=()=>{ if(!S||!S.run) return; if(S.t0 && performance.now()-S.t0>=DUR) return finish(); draw(); S.raf=requestAnimationFrame(loop); }; loop(); }
  function finish(){ const h=S.h, taps=S.taps.filter(x=>x.down-S.t0<DUR); res[h.k]=stats(taps); S=null; draw();
    status(res.left&&res.right ? {pl:"Gotowe.",en:"Done."} : {pl:"Teraz druga ręka.",en:"Now the other hand."});
    if(res.left && res.right){ self.R={ left:res.left, right:res.right, asym:(res.right.rate-res.left.rate)/((res.right.rate+res.left.rate)/2) }; self.render(self.R); setSummary(self); markDone("tapping"); } }
  document.addEventListener("keydown", e => { if(!S||!S.run||$("tab-tapping").hidden||e.code!==S.h.code) return; e.preventDefault(); if(e.repeat) return;
    const t=performance.now(); if(!S.t0) S.t0=t; S.taps.push({down:t, up:null}); });
  document.addEventListener("keyup", e => { if(!S||!S.run||e.code!==S.h.code) return; const x=S.taps[S.taps.length-1]; if(x && x.up==null) x.up=performance.now(); });
  $("tap-l").addEventListener("click", () => start(0)); $("tap-r").addEventListener("click", () => start(1));
  const two = (a,b,f) => `${f(a)} / ${f(b)}`;
  self.render = R => { const l=R.left, r=R.right;
    setMain("tp-rate", two(l.rate,r.rate,v=>nf(v,1))); setRow("tp-rate","n", two(l.n,r.n,v=>v)); setRow("tp-rate","asym", (R.asym>=0?"+":"")+pct(R.asym));
    setMain("tp-cv", two(l.cv,r.cv,v=>nf(v,2))); setRow("tp-cv","int", two(l.interval,r.interval,v=>nf(v)+" ms")); setRow("tp-cv","dw", two(l.dwell,r.dwell,v=>nf(v)+" ms"));
    setMain("tp-fat", two(l.fatigue,r.fatigue,v=>(v>=0?"+":"")+nf(100*v))); };
  self.summary = R => { const faster = R.asym>=0 ? (LANG==="pl"?"prawa":"right") : (LANG==="pl"?"lewa":"left");
    return LANG==="pl"
      ? `<p>Lewa ręka: <strong>${nf(R.left.rate,1)}</strong> uderzeń na sekundę, prawa: <strong>${nf(R.right.rate,1)}</strong>. Szybsza była ${faster} ręka, o ${pct(Math.abs(R.asym))}. Pod koniec tempo zmieniło się o ${nf(100*R.left.fatigue)}% (lewa) i ${nf(100*R.right.fatigue)}% (prawa).</p>`
      : `<p>Left hand: <strong>${nf(R.left.rate,1)}</strong> taps per second, right: <strong>${nf(R.right.rate,1)}</strong>. Your ${faster} hand was faster by ${pct(Math.abs(R.asym))}. Towards the end the rate changed by ${nf(100*R.left.fatigue)}% (left) and ${nf(100*R.right.fatigue)}% (right).</p>`; };
  SHOW.tapping = draw;
  LEAVE.tapping = () => { if(S){ cancelAnimationFrame(S.raf); S=null; status(null); } };
  LANGHOOKS.push(() => { status(st); draw(); });
  return self;
})();

export { Tap };
