// Test: reaction-hick
import { Arena } from "../core/arena.js";
import { setMain, setRow, setSummary } from "../core/cards.js";
import { linfit, plotXY } from "../core/chart.js";
import { LANGHOOKS, LEAVE, SHOW } from "../core/registry.js";
import { $, css, median, ms, nf, px } from "../core/utils.js";
import { L, LANG } from "../i18n/index.js";
import { markDone } from "../main.js";
import { Click } from "./target-clicking.js";

// =====================================================================
// CZAS REAKCJI I PRAWO HICKA — reakcja na 1, 2, 4 i 8 możliwych bodźców
// =====================================================================
const Hick = (() => { const PER=8;
  const SETS = { 1:["KeyF"], 2:["KeyF","KeyJ"], 4:["KeyD","KeyF","KeyJ","KeyK"], 8:["KeyA","KeyS","KeyD","KeyF","KeyJ","KeyK","KeyL","Semicolon"] };
  const LBL = c => c==="Semicolon" ? ";" : c.slice(3);
  const A = new Arena("cv-hick"); let S=null, st=null;
  const self = { tab:"reakcja", key:"reakcja-hick", grid:"cards-hick", sumId:"sum-hick", R:null, title:{pl:"Czas reakcji (Hick)",en:"Reaction time (Hick)"}, specs:[
    {id:"hk-b", title:{pl:"Nachylenie (prawo Hicka)",en:"Slope (Hick's law)"}, unit:{pl:"ms na bit",en:"ms per bit"},
     rows:[["a",{pl:"wyraz wolny a",en:"intercept a"}],["r2",{pl:"dopasowanie R²",en:"fit R²"}],["tp",{pl:"przepustowość 1000/b",en:"throughput 1000/b"}]],
     how:{pl:"Prawo Hicka–Hymana: czas reakcji rośnie liniowo z ilością informacji, czyli z logarytmem liczby możliwości: <code>RT = a + b · log₂(n + 1)</code>. Dopasowuję prostą metodą najmniejszych kwadratów do median z 4 bloków. <i>b</i> to dodatkowy czas na każdy „bit” wyboru, <i>a</i> to czas niezależny od liczby możliwości (zauważenie bodźca i ruch palca).",
          en:"Hick–Hyman law: reaction time grows linearly with information, i.e. with the log of the number of choices: <code>RT = a + b · log₂(n + 1)</code>. I fit a least-squares line to the medians of the 4 blocks. <i>b</i> is the extra time per “bit” of choice, <i>a</i> is time independent of the number of choices (noticing the stimulus and moving the finger)."}},
    {id:"hk-n", title:{pl:"Mediany bloków",en:"Block medians"}, rows:[["1",{pl:"1 możliwość",en:"1 choice"}],["2",{pl:"2 możliwości",en:"2 choices"}],["4",{pl:"4 możliwości",en:"4 choices"}],["8",{pl:"8 możliwości",en:"8 choices"}]],
     how:{pl:`W każdym bloku ${PER} prób. Bodziec pojawia się po losowej przerwie 0,7–1,8 s, żeby nie dało się go przewidzieć. Liczę tylko poprawne odpowiedzi; naciśnięcie przed bodźcem to falstart i próba się powtarza.`,
          en:`Each block has ${PER} trials. The stimulus appears after a random 0.7–1.8 s pause so it can't be predicted. Only correct answers count; a press before the stimulus is a false start and the trial repeats.`}},
    {id:"hk-e", title:{pl:"Błędy i falstarty",en:"Errors and false starts"}, unit:{pl:"złych klawiszy",en:"wrong keys"}, rows:[["fs",{pl:"falstarty",en:"false starts"}]],
     how:{pl:"Zły klawisz to naciśnięcie klawisza innego niż podświetlony.",en:"A wrong key is pressing a key other than the highlighted one."}}
  ]};
  const status = o => { st=o; $("st-hick").textContent = L(o)||""; };
  function draw(){ A.fit(); if(!A.w) return; A.clear(); const g=A.ctx;
    if(!S || S.chart){ const pts=(self.R?[1,2,4,8].map(n=>({x:Math.log2(n+1), y:self.R.med[n]})):[]).filter(p=>Number.isFinite(p.y));
      plotXY(A, { pts, line:self.R&&self.R.fit, xl:LANG==="pl"?"log₂(n + 1): liczba możliwości n = 1, 2, 4, 8":"log₂(n + 1): number of choices n = 1, 2, 4, 8", yu:" ms",
        xticks:[1,2,4,8].map(n=>Math.log2(n+1)), xfmt:v=>"n="+Math.round(2**v-1), x0:0.8, empty:LANG==="pl"?"Kliknij „Start”. Wykres pojawi się po teście.":"Click “Start”. The chart appears after the test." }); return; }
    const keys=SETS[S.n], bw=Math.min(90,(A.w-40)/keys.length-10), tot=keys.length*(bw+10)-10, x0=(A.w-tot)/2, y=A.h/2-bw/2;
    keys.forEach((k,i)=>{ const x=x0+i*(bw+10), on=S.lit===i; g.fillStyle=on?css("--accent"):css("--surface"); g.strokeStyle=css("--line"); g.lineWidth=1.5;
      g.beginPath(); g.roundRect ? g.roundRect(x,y,bw,bw,8) : g.rect(x,y,bw,bw); g.fill(); g.stroke();
      g.fillStyle=on?css("--on-accent"):css("--muted"); g.font=`600 ${Math.round(bw*0.32)}px ${css("--font-mono")}`; g.textAlign="center"; g.textBaseline="middle"; g.fillText(LBL(k), x+bw/2, y+bw/2); }); }
  function trial(){ S.lit=null; S.armed=false; draw();
    status({pl:`Blok: ${S.n} ${S.n===1?"możliwość":"możliwości"} · próba ${S.k+1} z ${PER} · czekaj na podświetlenie`,en:`Block: ${S.n} choice${S.n>1?"s":""} · trial ${S.k+1} of ${PER} · wait for the highlight`});
    S.timer=setTimeout(()=>{ S.lit=Math.floor(Math.random()*S.n); S.t0=performance.now(); S.armed=true; draw(); }, 700+Math.random()*1100); }
  function start(){ clearTimeout(S&&S.timer); S={order:[1,2,4,8], bi:0, n:1, k:0, res:[], fs:0, err:0}; trial(); }
  function key(code){ if(!S || S.chart) return; const keys=SETS[S.n];
    if(!S.armed){ if(keys.includes(code)){ clearTimeout(S.timer); S.fs++; status({pl:"Falstart! Poczekaj na podświetlenie.",en:"False start! Wait for the highlight."}); setTimeout(trial,700); } return; }
    const idx=keys.indexOf(code); if(idx<0) return;
    S.armed=false; const rt=performance.now()-S.t0, ok=idx===S.lit; if(!ok) S.err++; S.lit=null; draw();
    S.res.push({n:S.n, rt, ok}); S.k++;
    if(S.k>=PER){ S.bi++; S.k=0; if(S.bi>=4) return finish(); S.n=S.order[S.bi]; }
    setTimeout(trial,300); }
  function finish(){ const med={}; [1,2,4,8].forEach(n=>med[n]=median(S.res.filter(r=>r.n===n&&r.ok).map(r=>r.rt)));
    const ns=[1,2,4,8].filter(n=>Number.isFinite(med[n])), fit=linfit(ns.map(n=>Math.log2(n+1)), ns.map(n=>med[n]));
    self.R={ med, fit, trials:S.res, errors:S.err, falseStarts:S.fs }; S={chart:true}; status({pl:"Gotowe.",en:"Done."}); draw(); S=null;
    self.render(self.R); setSummary(self); markDone("reakcja"); }
  self.render = R => { setMain("hk-b", nf(R.fit.b)); setRow("hk-b","a", ms(R.fit.a)); setRow("hk-b","r2", nf(R.fit.r2,2)); setRow("hk-b","tp", Number.isFinite(R.fit.b)&&R.fit.b>0 ? nf(1000/R.fit.b,1)+" bit/s" : "—");
    [1,2,4,8].forEach(n=>setRow("hk-n",String(n), ms(R.med[n]))); setMain("hk-e", R.errors); setRow("hk-e","fs", R.falseStarts); };
  self.summary = R => LANG==="pl"
    ? `<p>Prosta reakcja (1 możliwość) zajmuje Ci <strong>${ms(R.med[1])}</strong>, a wybór z 8 możliwości <strong>${ms(R.med[8])}</strong>. Każdy dodatkowy „bit” wyboru (podwojenie liczby możliwości) dodaje średnio ${nf(R.fit.b)} ms; prawo Hicka opisuje Twoje wyniki z dopasowaniem R² = ${nf(R.fit.r2,2)}.</p>`
    : `<p>Your simple reaction (1 choice) takes <strong>${ms(R.med[1])}</strong> and choosing among 8 takes <strong>${ms(R.med[8])}</strong>. Each extra “bit” of choice (doubling the options) adds ${nf(R.fit.b)} ms on average; Hick's law fits your results with R² = ${nf(R.fit.r2,2)}.</p>`;
  $("hick-go").addEventListener("click", start);
  A.c.addEventListener("pointerdown", e => { if(!S||S.chart) return; e.preventDefault(); const keys=SETS[S.n], p=A.pos(e), bw=Math.min(90,(A.w-40)/keys.length-10), tot=keys.length*(bw+10)-10, x0=(A.w-tot)/2;
    const i=Math.floor((p.x-x0)/(bw+10)); if(i>=0 && i<keys.length && Math.abs(p.y-A.h/2)<=bw/2) key(keys[i]); });
  document.addEventListener("keydown", e => { if(!S || $("tab-reakcja").hidden || e.repeat) return; if(Object.values(SETS).flat().includes(e.code)){ e.preventDefault(); key(e.code); } });
  SHOW.reakcja = draw;
  LEAVE.reakcja = () => { if(S){ clearTimeout(S.timer); S=null; status(null); } };
  LANGHOOKS.push(() => { status(st); draw(); });
  return self;
})();

export { Hick };
