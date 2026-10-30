// Test: dot-tracking
import { mouseTask } from "../core/arena.js";
import { setMain, setRow } from "../core/cards.js";
import { $, css, hyp, mean, median, ms, nf, pct, px } from "../core/utils.js";
import { LANG } from "../i18n/index.js";
import { Click } from "./target-clicking.js";

// =====================================================================
// 3. ŚLEDZENIE PUNKTU
// =====================================================================
const Track = (() => { const DUR=15, RAD=10, ZONE=25;
  const f = (S, s) => ({
    x: S.w/2 + S.w*0.36*(0.65*Math.sin(2*Math.PI*0.11*s) + 0.35*Math.sin(2*Math.PI*0.29*s+1.3)),
    y: S.h/2 + S.h*0.36*(0.60*Math.sin(2*Math.PI*0.14*s+0.5) + 0.40*Math.sin(2*Math.PI*0.37*s+2.1)) });
  const draw = (t, s=0) => { const A=t.A, S=t.S, p=f(S,s); A.clear();
    A.dot(p.x,p.y,ZONE,css("--line"),false,1);
    A.dot(p.x,p.y,RAD,S.phase==="ready"?css("--muted"):css("--accent")); };
  function loop(t){ const S=t.S; if(!S || S.phase!=="run") return;
    const now=performance.now(), s=(now-S.t0)/1000;
    if(s>=DUR){ t.finish(); return; }
    const p=f(S,s); S.samples.push({t:now, s, tx:p.x, ty:p.y, cx:S.cur.x, cy:S.cur.y});
    draw(t,s); $("st-track").textContent = (LANG==="pl"?"Pozostało ":"Remaining ")+nf(DUR-s,1)+" s";
    S.raf = requestAnimationFrame(()=>loop(t)); }
  return mouseTask({ tab:"sledzenie", grid:"cards-track", sumId:"sum-track", canvas:"cv-track", statusId:"st-track", go:"go-track",
    title:{pl:"Śledzenie punktu",en:"Dot tracking"},
    specs:[
      {id:"s-dist", title:{pl:"Odległość od kropki",en:"Distance from the dot"}, unit:{pl:"px (średnio)",en:"px (mean)"}, rows:[["med",{pl:"mediana",en:"median"}]],
       how:{pl:"W każdej klatce animacji (ok. 60 razy na sekundę) liczę odległość kursora od środka kropki i uśredniam.",
            en:"In every animation frame (about 60 times per second) I measure the distance from the cursor to the dot's centre and average it."}},
      {id:"s-zone", title:{pl:"Czas w strefie",en:"Time in zone"}, unit:{pl:"% czasu",en:"% of time"},
       how:{pl:`Odsetek klatek, w których kursor był nie dalej niż ${ZONE} px od środka kropki (cienki okrąg wokół niej).`,
            en:`Share of frames in which the cursor was within ${ZONE} px of the dot's centre (the thin ring around it).`}},
      {id:"s-lag", title:{pl:"Opóźnienie",en:"Lag"}, unit:{pl:"ms",en:"ms"}, rows:[["d",{pl:"odległość po korekcie",en:"distance after correction"}]],
       how:{pl:"Sprawdzam przesunięcia czasowe od 0 do 800 ms co 10 ms: dla każdego porównuję kursor z miejscem, w którym kropka była tyle wcześniej. Opóźnienie to przesunięcie, przy którym średnia odległość jest najmniejsza.",
            en:"I try time shifts from 0 to 800 ms in 10 ms steps: for each I compare the cursor with where the dot was that much earlier. The lag is the shift with the smallest mean distance."}},
      {id:"s-jerk", title:{pl:"Płynność",en:"Smoothness"}, unit:{pl:"zrywów/s",en:"jerks/s"}, rows:[["n",{pl:"zrywów łącznie",en:"jerks in total"}]],
       how:{pl:"Liczę prędkość kursora w każdej klatce, wygładzam ją średnią z 7 klatek i liczę lokalne szczyty powyżej 40 px/s. Każdy szczyt to osobny „zryw” ręki. Mniej zrywów na sekundę oznacza płynniejszy ruch.",
            en:"I compute cursor speed in every frame, smooth it with a 7-frame average and count local peaks above 40 px/s. Each peak is a separate hand “jerk”. Fewer jerks per second means smoother movement."}}
    ],
    start(t){ const A=t.A; t.S={phase:"ready", w:A.w, h:A.h, samples:[], cur:null, raf:0};
      t.status({pl:"Kliknij kropkę, a potem trzymaj na niej kursor przez 15 s.",en:"Click the dot, then keep the cursor on it for 15 s."}); draw(t,0); },
    draw:(t)=>draw(t, t.S.phase==="run" ? (performance.now()-t.S.t0)/1000 : 0),
    move(t, pts){ t.S.cur = pts[pts.length-1]; },
    down(t, p){ const S=t.S; if(S.phase!=="ready") return; const q=f(S,0);
      if(hyp(p.x,p.y,q.x,q.y)<=RAD+8){ S.phase="run"; S.cur=p; S.t0=performance.now(); loop(t); } },
    analyse(t){ const S=t.S, sm=S.samples;
      const d = sm.map(s=>hyp(s.cx,s.cy,s.tx,s.ty));
      let lag=0, lagD=Infinity;
      for(let tau=0; tau<=800; tau+=10){ let s=0,c=0;
        for(const x of sm){ const ss=x.s-tau/1000; if(ss<0) continue; const q=f(S,ss); s+=hyp(x.cx,x.cy,q.x,q.y); c++; }
        if(c && s/c<lagD){ lagD=s/c; lag=tau; } }
      const v=[]; for(let i=1;i<sm.length;i++){ const dt=(sm[i].t-sm[i-1].t)/1000; v.push(dt>0?hyp(sm[i].cx,sm[i].cy,sm[i-1].cx,sm[i-1].cy)/dt:0); }
      const vs=v.map((_,i)=>{ let s=0,c=0; for(let j=Math.max(0,i-3);j<=Math.min(v.length-1,i+3);j++){ s+=v[j]; c++; } return s/c; });
      let peaks=0; for(let i=1;i<vs.length-1;i++) if(vs[i]>vs[i-1] && vs[i]>=vs[i+1] && vs[i]>40) peaks++;
      return { mean:mean(d), med:median(d), zone:d.filter(x=>x<=ZONE).length/d.length, lag, lagD, peaks, pps:peaks/DUR }; },
    render(R){ setMain("s-dist",nf(R.mean,1)); setRow("s-dist","med",px(R.med));
      setMain("s-zone",nf(100*R.zone)); setMain("s-lag",nf(R.lag)); setRow("s-lag","d",px(R.lagD));
      setMain("s-jerk",nf(R.pps,1)); setRow("s-jerk","n",R.peaks); },
    summary(R){ return LANG==="pl"
      ? `<p>Kursor był średnio <strong>${px(R.mean)}</strong> od kropki, a w strefie ${ZONE} px trzymałeś go przez ${pct(R.zone)} czasu.</p><p>Twój ruch spóźniał się za kropką o ok. ${ms(R.lag)}, a ręka robiła ${nf(R.pps,1)} zrywów na sekundę.</p>`
      : `<p>On average the cursor was <strong>${px(R.mean)}</strong> from the dot, and you kept it within the ${ZONE} px zone ${pct(R.zone)} of the time.</p><p>Your movement lagged behind the dot by about ${ms(R.lag)}, and your hand made ${nf(R.pps,1)} jerks per second.</p>`; }
  });
})();

export { Track };
