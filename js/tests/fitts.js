// Test: fitts
import { Arena } from "../core/arena.js";
import { U, setMain, setRow, setSummary } from "../core/cards.js";
import { linfit, plotXY } from "../core/chart.js";
import { LANGHOOKS, LEAVE, SHOW } from "../core/registry.js";
import { $, css, hyp, mean, median, ms, nf, px } from "../core/utils.js";
import { D, L, LANG } from "../i18n/index.js";
import { markDone } from "../main.js";
import { Click } from "./target-clicking.js";

// =====================================================================
// PRAWO FITTSA — czas ruchu zależy od odległości i wielkości celu
// =====================================================================
const Fitts = (() => { const WS=[16,32,64], DS=[120,240,400], REP=2, HOME=12;
  const A = new Arena("cv-fitts"); let S=null, st=null;
  const self = { tab:"fitts", key:"prawo-fittsa", grid:"cards-fitts", sumId:"sum-fitts", R:null, title:{pl:"Prawo Fittsa",en:"Fitts's law"}, specs:[
    {id:"ft-tp", title:{pl:"Przepustowość",en:"Throughput"}, unit:{pl:"bit/s",en:"bit/s"}, rows:[["a",{pl:"wyraz wolny a",en:"intercept a"}],["b",{pl:"nachylenie b",en:"slope b"}],["r2",{pl:"dopasowanie R²",en:"fit R²"}]],
     how:{pl:"Prawo Fittsa: czas ruchu do celu rośnie z jego „trudnością”, czyli indeksem <code>ID = log₂(D/W + 1)</code> w bitach (D – odległość, W – szerokość celu). Dopasowuję prostą <code>MT = a + b · ID</code> metodą najmniejszych kwadratów. Przepustowość to średnia z <code>ID ÷ MT</code> dla wszystkich ruchów: ile bitów na sekundę „przesyła” ręka z myszką. Typowe wartości dla myszki to kilka bitów na sekundę.",
          en:"Fitts's law: movement time to a target grows with its “difficulty”, the index <code>ID = log₂(D/W + 1)</code> in bits (D – distance, W – target width). I fit <code>MT = a + b · ID</code> by least squares. Throughput is the mean of <code>ID ÷ MT</code> over all movements: how many bits per second your hand with the mouse “transmits”. Typical mouse values are a few bits per second."}},
    {id:"ft-mt", title:{pl:"Czas ruchu",en:"Movement time"}, unit:U.ms_med, rows:[["easy",{pl:"najłatwiejsze (duże, blisko)",en:"easiest (big, near)"}],["hard",{pl:"najtrudniejsze (małe, daleko)",en:"hardest (small, far)"}]],
     how:{pl:"Od kliknięcia w punkt startowy do trafienia w cel (z ewentualnymi pudłami po drodze).",en:"From clicking the start point to hitting the target (including any misses on the way)."}},
    {id:"ft-miss", title:{pl:"Pudła",en:"Misses"}, unit:{pl:"kliknięć obok",en:"clicks outside"}, rows:[["n",{pl:"ruchów",en:"movements"}]],
     how:{pl:`${WS.length*DS.length} kombinacji (szerokości ${WS.join(", ")} px × odległości ${DS.join(", ")} px, odległości zmniejszane na wąskich ekranach), każda ${REP} razy, w losowej kolejności.`,
          en:`${WS.length*DS.length} combinations (widths ${WS.join(", ")} px × distances ${DS.join(", ")} px, distances reduced on narrow screens), each ${REP} times, in random order.`}}
  ]};
  const status = o => { st=o; $("st-fitts").textContent = L(o)||""; };
  function place(D){ const m=40; for(let k=0;k<300;k++){ const a=Math.random()*2*Math.PI, dx=Math.cos(a)*D/2, dy=Math.sin(a)*D/2;
      if(Math.abs(dx)<A.w/2-m && Math.abs(dy)<A.h/2-m) return {hx:A.w/2-dx, hy:A.h/2-dy, tx:A.w/2+dx, ty:A.h/2+dy}; }
    return {hx:A.w/2-D/2, hy:A.h/2, tx:A.w/2+D/2, ty:A.h/2}; }
  function draw(){ A.fit(); if(!A.w) return; A.clear();
    if(!S){ const R=self.R; plotXY(A, { pts: R ? R.moves.map(m=>({x:m.id, y:m.mt, r:3})) : [], line:R&&R.fit, xl:LANG==="pl"?"indeks trudności ID = log₂(D/W + 1) [bit]":"index of difficulty ID = log₂(D/W + 1) [bit]", yu:" ms", x0:0,
      xticks:R?[...new Set(R.moves.map(m=>+m.id.toFixed(2)))]:[], xfmt:v=>nf(v,1), empty:LANG==="pl"?"Kliknij „Start”. Wykres pojawi się po teście.":"Click “Start”. The chart appears after the test." }); return; }
    const c=S.cur; A.dot(c.hx,c.hy,HOME,css("--muted"),!c.started,2); if(c.started) A.dot(c.tx,c.ty,c.W/2,css("--accent")); }
  function next(){ const t=S.list[S.i], k=Math.min(1,(Math.min(A.w,A.h*2)-90)/DS[DS.length-1]), D=t.D*k;
    S.cur={...place(D), W:t.W, D, started:false, miss:0}; draw();
    status({pl:`Ruch ${S.i+1} z ${S.list.length}: kliknij szary punkt, potem niebieski cel.`,en:`Movement ${S.i+1} of ${S.list.length}: click the grey point, then the blue target.`}); }
  function start(){ A.fit(); const list=[]; WS.forEach(W=>DS.forEach(D=>{ for(let r=0;r<REP;r++) list.push({W,D}); })); list.sort(()=>Math.random()-0.5);
    S={list, i:0, moves:[], misses:0}; next(); }
  A.c.addEventListener("pointerdown", e => { if(!S) return; e.preventDefault(); const p=A.pos(e), c=S.cur;
    if(!c.started){ if(hyp(p.x,p.y,c.hx,c.hy)<=HOME+3){ c.started=true; c.t0=p.t; draw(); } return; }
    if(hyp(p.x,p.y,c.tx,c.ty)<=c.W/2){ const mt=p.t-c.t0, id=Math.log2(c.D/c.W+1); S.moves.push({W:c.W, D:c.D, id, mt, miss:c.miss}); S.i++;
      if(S.i<S.list.length) next(); else finish(); }
    else { c.miss++; S.misses++; } });
  A.c.addEventListener("contextmenu", e => e.preventDefault());
  function finish(){ const m=S.moves, fit=linfit(m.map(x=>x.id), m.map(x=>x.mt));
    const ids=m.map(x=>x.id), lo=Math.min(...ids), hi=Math.max(...ids);
    self.R={ moves:m, fit, tp:mean(m.map(x=>x.id/(x.mt/1000))), misses:S.misses, easy:median(m.filter(x=>x.id===lo).map(x=>x.mt)), hard:median(m.filter(x=>x.id===hi).map(x=>x.mt)) };
    S=null; status({pl:"Gotowe.",en:"Done."}); draw(); self.render(self.R); setSummary(self); markDone("fitts"); }
  self.render = R => { setMain("ft-tp", nf(R.tp,2)); setRow("ft-tp","a", ms(R.fit.a)); setRow("ft-tp","b", nf(R.fit.b)+" ms/bit"); setRow("ft-tp","r2", nf(R.fit.r2,2));
    setMain("ft-mt", nf(median(R.moves.map(x=>x.mt)))); setRow("ft-mt","easy", ms(R.easy)); setRow("ft-mt","hard", ms(R.hard));
    setMain("ft-miss", R.misses); setRow("ft-miss","n", R.moves.length); };
  self.summary = R => LANG==="pl"
    ? `<p>Twoja przepustowość to <strong>${nf(R.tp,2)} bit/s</strong>. Najłatwiejszy cel (duży i blisko) zajmował Ci ${ms(R.easy)}, najtrudniejszy (mały i daleko) ${ms(R.hard)}. Każdy bit trudności dodaje ok. ${nf(R.fit.b)} ms, a prawo Fittsa opisuje Twoje ruchy z dopasowaniem R² = ${nf(R.fit.r2,2)}.</p>`
    : `<p>Your throughput is <strong>${nf(R.tp,2)} bit/s</strong>. The easiest target (big and near) took you ${ms(R.easy)}, the hardest (small and far) ${ms(R.hard)}. Each bit of difficulty adds about ${nf(R.fit.b)} ms, and Fitts's law fits your movements with R² = ${nf(R.fit.r2,2)}.</p>`;
  $("fitts-go").addEventListener("click", start);
  SHOW.fitts = draw;
  LEAVE.fitts = () => { if(S){ S=null; status(null); } };
  LANGHOOKS.push(() => { status(st); draw(); });
  return self;
})();

export { Fitts };
