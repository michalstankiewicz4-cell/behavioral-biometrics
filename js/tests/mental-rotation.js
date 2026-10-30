// Test: rotacja umysłowa – czy obrócona figura to ta sama, czy jej odbicie lustrzane
import { Arena } from "../core/arena.js";
import { setMain, setRow, setSummary } from "../core/cards.js";
import { linfit, plotXY } from "../core/chart.js";
import { LANGHOOKS, LEAVE, SHOW } from "../core/registry.js";
import { $, css, median, nf, pct } from "../core/utils.js";
import { L, LANG } from "../i18n/index.js";
import { markDone } from "../main.js";

// =====================================================================
// Para figur z 7 kwadratów: lewa prosto, prawa obrócona o 0–180° i w połowie prób odbita lustrzanie.
// Odpowiedź: F = ta sama, J = odbicie (albo przyciski). 2 próby rozgrzewkowe + 30 liczonych
// (5 kątów × ta sama/odbicie × 3). Nachylenie prostej czas(kąt) z prób „ta sama” = ms na stopień
// (Shepard i Metzler 1971: czas rośnie liniowo z kątem obrotu).
// =====================================================================
const SHAPES = [
  [[0,0],[0,1],[0,2],[1,0],[1,2],[1,3],[2,2]], [[0,0],[0,1],[0,2],[0,3],[1,2],[1,3],[2,2]],
  [[0,1],[1,1],[1,2],[2,0],[2,1],[2,2],[3,2]], [[0,1],[0,2],[0,3],[1,1],[1,2],[2,0],[2,1]],
  [[0,0],[0,1],[1,0],[1,1],[1,2],[1,3],[2,0]], [[0,0],[0,1],[0,2],[1,1],[1,2],[2,2],[3,2]],
  [[0,0],[1,0],[1,1],[1,2],[1,3],[2,2],[2,3]], [[0,0],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]] ];
const ANGLES = [0,45,90,135,180], REPS = 3, WARM = 2;
const shuffle = a => { for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };

const Rot = (() => { const A = new Arena("cv-rot"); let S=null, st=null;
  const self = { tab:"rotacja", key:"rotacja-umyslowa", grid:"cards-rot", sumId:"sum-rot", R:null, title:{pl:"Rotacja umysłowa",en:"Mental rotation"}, specs:[
    {id:"rt-slope", title:{pl:"Tempo obracania",en:"Rotation speed"}, unit:{pl:"ms na stopień",en:"ms per degree"}, rows:[["rate",{pl:"czyli ok.",en:"i.e. about"}],["r2",{pl:"dopasowanie prostej R²",en:"line fit R²"}],["a",{pl:"czas przy 0°",en:"time at 0°"}]],
     how:{pl:"Dla prób „ta sama” z poprawną odpowiedzią liczę medianę czasu przy każdym kącie (0°, 45°, 90°, 135°, 180°) i dopasowuję prostą czas = a + b·kąt. Nachylenie b (ms na stopień) mówi, ile trwa obrócenie figury w wyobraźni o 1°; 1000 ÷ b to tempo w stopniach na sekundę. Shepard i Metzler (1971) pokazali, że czas rośnie z kątem mniej więcej liniowo.",
          en:"For correctly answered “same” trials I take the median time at each angle (0°, 45°, 90°, 135°, 180°) and fit the line time = a + b·angle. The slope b (ms per degree) is how long it takes to rotate the figure in your mind by 1°; 1000 ÷ b is the speed in degrees per second. Shepard and Metzler (1971) showed that time grows roughly linearly with the angle."}},
    {id:"rt-acc", title:{pl:"Trafność i czas",en:"Accuracy and time"}, unit:{pl:"% poprawnych",en:"% correct"}, rows:[["med",{pl:"mediana czasu (poprawne)",en:"median time (correct)"}],["same",{pl:"poprawne: ta sama",en:"correct: same"}],["mirror",{pl:"poprawne: odbicie",en:"correct: mirror"}],["n",{pl:"liczonych prób",en:"counted trials"}]],
     how:{pl:"Odsetek poprawnych odpowiedzi w 30 liczonych próbach (2 pierwsze to rozgrzewka) i mediana czasu od pokazania figur do odpowiedzi, tylko dla poprawnych.",
          en:"Share of correct answers in the 30 counted trials (the first 2 are warm-up) and the median time from showing the figures to the answer, correct answers only."}} ]};
  const status = o => { st=o; $("st-rot").textContent = L(o)||""; };

  function drawShape(g, cells, cx, cy, size, deg, mirror){
    const pts = cells.map(([x,y]) => [mirror ? -x : x, y]);
    const mx = pts.reduce((s,p)=>s+p[0]+.5,0)/pts.length, my = pts.reduce((s,p)=>s+p[1]+.5,0)/pts.length;
    g.save(); g.translate(cx,cy); g.rotate(deg*Math.PI/180); g.translate(-mx*size, -my*size);
    g.fillStyle = css("--accent"); g.strokeStyle = css("--surface"); g.lineWidth = 2;
    for(const [x,y] of pts){ g.fillRect(x*size, y*size, size, size); g.strokeRect(x*size, y*size, size, size); }
    g.restore();
  }
  function draw(){ A.fit(); if(!A.w) return; A.clear(); const g = A.ctx;
    if(S && S.show){ const t = S.trials[S.i], size = Math.min(A.h/7, A.w/16);
      drawShape(g, SHAPES[t.shape], A.w*0.27, A.h/2, size, 0, false);
      drawShape(g, SHAPES[t.shape], A.w*0.73, A.h/2, size, t.dir*t.angle, t.mirror);
      g.strokeStyle = css("--line"); g.beginPath(); g.moveTo(A.w/2, A.h*0.15); g.lineTo(A.w/2, A.h*0.85); g.stroke(); return; }
    if(S && S.fb){ A.label(S.fb, A.h/2); return; }
    if(S){ A.label("+", A.h/2); return; }
    if(self.R) return chart();
    A.label(LANG==="pl" ? "Kliknij „Start”" : "Click “Start”"); }
  function chart(){ const R=self.R, pts=ANGLES.filter(a=>Number.isFinite(R.byAngle[a])).map(a=>({x:a, y:R.byAngle[a]}));
    plotXY(A, { pts, line:R.fit, x0:0, xticks:ANGLES, xfmt:v=>v+"°", yu:" ms", xl:LANG==="pl"?"kąt obrotu (próby „ta sama”, mediana)":"rotation angle (“same” trials, median)" }); }

  function next(){ if(!S) return; S.i++; if(S.i >= S.trials.length) return finish();
    S.show=false; S.fb=null; draw(); const k = S.i - WARM;
    status(k < 0 ? {pl:`Rozgrzewka ${S.i+1}/${WARM} · F = ta sama, J = odbicie`,en:`Warm-up ${S.i+1}/${WARM} · F = same, J = mirror`}
                 : {pl:`Próba ${k+1}/${S.trials.length-WARM} · F = ta sama, J = odbicie`,en:`Trial ${k+1}/${S.trials.length-WARM} · F = same, J = mirror`});
    S.timer = setTimeout(() => { if(!S) return; S.show = true; draw(); S.t0 = performance.now(); }, 600 + Math.random()*400); }
  function answer(mirror){ if(!S || !S.show) return; const t = S.trials[S.i]; t.rt = performance.now() - S.t0; t.ok = mirror === t.mirror;
    S.show = false; S.fb = t.ok ? "✓" : "✗"; draw(); S.timer = setTimeout(next, 450); }
  function finish(){ const all = S.trials.slice(WARM), ok = all.filter(t=>t.ok), byAngle = {};
    for(const a of ANGLES){ const v = ok.filter(t=>!t.mirror && t.angle===a).map(t=>t.rt); byAngle[a] = v.length ? median(v) : NaN; }
    const xs = ANGLES.filter(a=>Number.isFinite(byAngle[a])), fit = xs.length>=3 ? linfit(xs, xs.map(a=>byAngle[a])) : {a:NaN,b:NaN,r2:NaN};
    self.R = { n:all.length, acc:ok.length/all.length, accSame:all.filter(t=>!t.mirror&&t.ok).length/all.filter(t=>!t.mirror).length,
      accMirror:all.filter(t=>t.mirror&&t.ok).length/all.filter(t=>t.mirror).length, median:median(ok.map(t=>t.rt)), byAngle, fit,
      trials: all.map(t=>({angle:t.angle, mirror:t.mirror, ok:t.ok, rt:Math.round(t.rt)})) };
    S=null; status({pl:"Gotowe.",en:"Done."}); draw(); self.render(self.R); setSummary(self); markDone("rotacja"); }

  $("rot-go").addEventListener("click", () => { if(S) clearTimeout(S.timer);
    const trials = []; for(const a of ANGLES) for(const m of [false,true]) for(let r=0;r<REPS;r++) trials.push({angle:a, mirror:m});
    shuffle(trials); const warm = shuffle(ANGLES.flatMap(a=>[{angle:a,mirror:false},{angle:a,mirror:true}])).slice(0,WARM);
    S = { i:-1, trials:[...warm, ...trials].map(t => ({...t, shape:Math.floor(Math.random()*SHAPES.length), dir:Math.random()<.5?-1:1})) };
    A.fit(); next(); });
  $("rot-same").addEventListener("click", () => answer(false));
  $("rot-mirror").addEventListener("click", () => answer(true));
  document.addEventListener("keydown", e => { if(!S || $("tab-rotacja").hidden || e.repeat) return;
    if(e.code==="KeyF"){ e.preventDefault(); answer(false); } else if(e.code==="KeyJ"){ e.preventDefault(); answer(true); } });
  self.render = R => { const ok = Number.isFinite(R.fit.b) && R.fit.b > 0;
    setMain("rt-slope", ok ? nf(R.fit.b,1) : "—"); setRow("rt-slope","rate", ok ? `${nf(1000/R.fit.b,0)} °/s` : "—");
    setRow("rt-slope","r2", nf(R.fit.r2,2)); setRow("rt-slope","a", Number.isFinite(R.fit.a) ? nf(R.fit.a,0)+" ms" : "—");
    setMain("rt-acc", pct(R.acc)); setRow("rt-acc","med", nf(R.median,0)+" ms"); setRow("rt-acc","same", pct(R.accSame)); setRow("rt-acc","mirror", pct(R.accMirror)); setRow("rt-acc","n", R.n);
    if(!S) draw(); };
  self.summary = R => { const ok = Number.isFinite(R.fit.b) && R.fit.b > 0;
    return LANG==="pl"
      ? `<p>Odpowiedziałeś poprawnie w <strong>${pct(R.acc)}</strong> prób, z medianą czasu ${nf(R.median,0)} ms. `
        + (ok ? `Każdy dodatkowy stopień obrotu wydłużał odpowiedź średnio o <strong>${nf(R.fit.b,1)} ms</strong>, czyli „obracasz” figurę w wyobraźni z prędkością ok. <strong>${nf(1000/R.fit.b,0)}°/s</strong> (dopasowanie prostej R² = ${nf(R.fit.r2,2)}${R.fit.r2 < 0.3 ? " – słabe, więc tempo jest tylko orientacyjne" : ""}).</p>`
              : `Czas nie rósł z kątem, więc nie da się policzyć tempa obracania – możliwe, że odpowiadałeś bez obracania figury w wyobraźni albo prób było za mało.</p>`)
        + `<p>${R.acc < 0.75 ? "Trafność poniżej 75% to sygnał, że część odpowiedzi była zgadywana – wtedy tempo jest mało wiarygodne. " : ""}Szybkość i trafność w tym zadaniu bardzo zależą od wprawy (np. gry, rysunek techniczny) i poprawiają się z ćwiczeniem.</p>`
      : `<p>You answered correctly in <strong>${pct(R.acc)}</strong> of trials, with a median time of ${nf(R.median,0)} ms. `
        + (ok ? `Each extra degree of rotation added on average <strong>${nf(R.fit.b,1)} ms</strong>, so you “rotate” the figure in your mind at about <strong>${nf(1000/R.fit.b,0)}°/s</strong> (line fit R² = ${nf(R.fit.r2,2)}${R.fit.r2 < 0.3 ? " – weak, so the speed is only approximate" : ""}).</p>`
              : `Time didn't grow with the angle, so the rotation speed can't be computed – perhaps you answered without rotating the figure mentally, or there were too few trials.</p>`)
        + `<p>${R.acc < 0.75 ? "Accuracy below 75% suggests some answers were guesses – then the speed is unreliable. " : ""}Speed and accuracy in this task depend a lot on practice (e.g. games, technical drawing) and improve with training.</p>`; };
  SHOW.rotacja = draw;
  LEAVE.rotacja = () => { if(S){ clearTimeout(S.timer); S=null; status(null); } };
  LANGHOOKS.push(() => { status(st); draw(); });
  return self;
})();

export { Rot, SHAPES };
