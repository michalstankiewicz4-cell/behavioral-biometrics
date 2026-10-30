// Test: double-click
import { mouseTask } from "../core/arena.js";
import { R_MEAN, R_SD, U, setMain, setRow } from "../core/cards.js";
import { $, css, hyp, mean, median, ms, nf, px, sd } from "../core/utils.js";
import { LANG } from "../i18n/index.js";
import { Click } from "./target-clicking.js";

// =====================================================================
// 6. PODWÓJNE KLIKNIĘCIE
// =====================================================================
const Dbl = (() => { const N=8, RAD=26, SLOW=500;
  const newTrial = (t, from) => { const A=t.A; let p, k=0;
    do{ p=A.rnd(RAD+12); k++; } while(from && hyp(p.x,p.y,from.x,from.y)<150 && k<200);
    t.S.cur={x:p.x, y:p.y, downs:[], ups:[]};
    t.status({pl:`Kółko ${t.S.trials.length+1} z ${N}: kliknij dwukrotnie`, en:`Circle ${t.S.trials.length+1} of ${N}: double-click`}); draw(t); };
  const draw = t => { const A=t.A, c=t.S.cur; A.clear(); if(!c) return;
    A.dot(c.x,c.y,RAD,css("--accent")); if(c.downs.length===1) A.dot(c.x,c.y,RAD+6,css("--accent"),false,2); };
  return mouseTask({ tab:"dwuklik", grid:"cards-dbl", sumId:"sum-dbl", canvas:"cv-dbl", statusId:"st-dbl", go:"go-dbl",
    title:{pl:"Podwójne kliknięcie",en:"Double click"},
    specs:[
      {id:"p-int", title:{pl:"Odstęp między kliknięciami",en:"Click interval"}, unit:U.ms_med, rows:[R_MEAN,R_SD],
       how:{pl:"Czas od pierwszego do drugiego wciśnięcia przycisku (<code>pointerdown → pointerdown</code>).",
            en:"Time from the first to the second button press (<code>pointerdown → pointerdown</code>)."}},
      {id:"p-hold", title:{pl:"Przytrzymanie",en:"Hold"}, unit:U.ms_med, rows:[["first",{pl:"pierwsze kliknięcie",en:"first click"}],["second",{pl:"drugie kliknięcie",en:"second click"}]],
       how:{pl:"<code>pointerup − pointerdown</code> osobno dla pierwszego i drugiego kliknięcia w parze.",
            en:"<code>pointerup − pointerdown</code> separately for the first and second click in each pair."}},
      {id:"p-move", title:{pl:"Drgnięcie kursora",en:"Cursor drift"}, unit:{pl:"px (średnio)",en:"px (mean)"}, rows:[["max",{pl:"największe",en:"largest"}]],
       how:{pl:"O ile przesunął się kursor między pierwszym a drugim wciśnięciem. Systemy uznają kliknięcia za podwójne tylko wtedy, gdy kursor prawie się nie ruszył.",
            en:"How far the cursor moved between the first and second press. Systems only treat clicks as a double click when the cursor barely moved."}},
      {id:"p-slow", title:{pl:"Za wolne",en:"Too slow"}, unit:{pl:`z ${N}`,en:`of ${N}`},
       how:{pl:`Pary z odstępem powyżej ${SLOW} ms. To domyślny próg w Windows: wolniejsze kliknięcia system potraktowałby jako dwa pojedyncze.`,
            en:`Pairs with an interval above ${SLOW} ms. That is the Windows default threshold: slower clicks would be treated by the system as two single clicks.`}}
    ],
    start(t){ t.S={phase:"run", trials:[], cur:null}; newTrial(t, null); },
    draw,
    down(t, p){ const c=t.S.cur; if(!c) return; if(hyp(p.x,p.y,c.x,c.y)<=RAD+4){ c.downs.push(p); draw(t); } },
    up(t, p){ const S=t.S, c=S.cur; if(!c || c.ups.length>=c.downs.length) return; c.ups.push(p.t);
      if(c.ups.length===2){ const [a,b]=c.downs;
        S.trials.push({ int:b.t-a.t, h1:c.ups[0]-a.t, h2:c.ups[1]-b.t, move:hyp(a.x,a.y,b.x,b.y) });
        if(S.trials.length>=N) t.finish(); else newTrial(t, b); } },
    analyse(t){ const T=t.S.trials; return { int:T.map(x=>x.int), h1:T.map(x=>x.h1), h2:T.map(x=>x.h2), move:T.map(x=>x.move), slow:T.filter(x=>x.int>SLOW).length, n:T.length }; },
    render(R){ setMain("p-int",nf(median(R.int))); setRow("p-int","mean",ms(mean(R.int))); setRow("p-int","sd",ms(sd(R.int)));
      setMain("p-hold",nf(median([...R.h1,...R.h2]))); setRow("p-hold","first",ms(median(R.h1))); setRow("p-hold","second",ms(median(R.h2)));
      setMain("p-move",nf(mean(R.move),1)); setRow("p-move","max",px(Math.max(...R.move))); setMain("p-slow",R.slow); },
    summary(R){ return LANG==="pl"
      ? `<p>Odstęp między kliknięciami wynosi u ciebie zwykle <strong>${ms(median(R.int))}</strong> (Windows domyślnie uznaje kliknięcia za podwójne do ${SLOW} ms). Za wolnych par: ${R.slow} z ${R.n}.</p><p>Kursor przesuwał się przy tym średnio o ${px(mean(R.move))}.</p>`
      : `<p>Your interval between clicks is usually <strong>${ms(median(R.int))}</strong> (by default Windows treats clicks as a double click up to ${SLOW} ms). Too slow pairs: ${R.slow} of ${R.n}.</p><p>The cursor moved on average ${px(mean(R.move))} in between.</p>`; }
  });
})();

export { Dbl };
