// Test: dragging
import { mouseTask } from "../core/arena.js";
import { R_MEAN, U, setMain, setRow } from "../core/cards.js";
import { $, countPauses, css, hyp, mean, median, ms, nf, px, tremorRMS } from "../core/utils.js";
import { LANG } from "../i18n/index.js";

// =====================================================================
// 4. PRZECIĄGANIE
// =====================================================================
const Drag = (() => { const N=6, SQ=40, FR=64, TOL=(FR-SQ)/2+6;
  const newTrial = t => { const A=t.A; const sq=A.rnd(SQ); let fr, k=0;
    do{ fr=A.rnd(FR); k++; } while(hyp(sq.x,sq.y,fr.x,fr.y)<220 && k<200);
    t.S.cur={sq, fr, grabs:0, first:null, segs:[], drag:false, off:null};
    t.status({pl:`Przeciągnięcie ${t.S.trials.length+1} z ${N}`, en:`Drag ${t.S.trials.length+1} of ${N}`}); draw(t); };
  const draw = t => { const A=t.A, c=t.S.cur, g=A.ctx; A.clear(); if(!c) return;
    g.setLineDash([6,4]); g.strokeStyle=css("--muted"); g.lineWidth=2; g.strokeRect(c.fr.x-FR/2, c.fr.y-FR/2, FR, FR); g.setLineDash([]);
    g.fillStyle=css("--accent"); g.globalAlpha=c.drag?0.85:1; g.fillRect(c.sq.x-SQ/2, c.sq.y-SQ/2, SQ, SQ); g.globalAlpha=1; };
  return mouseTask({ tab:"przeciaganie", grid:"cards-drag", sumId:"sum-drag", canvas:"cv-drag", statusId:"st-drag", go:"go-drag",
    title:{pl:"Przeciąganie",en:"Dragging"},
    specs:[
      {id:"d-time", title:{pl:"Czas przeciągnięcia",en:"Drag time"}, unit:U.ms_med, rows:[R_MEAN],
       how:{pl:"Od pierwszego chwycenia kwadratu do udanego upuszczenia w ramce.", en:"From first grabbing the square to a successful drop in the frame."}},
      {id:"d-err", title:{pl:"Precyzja upuszczenia",en:"Drop precision"}, unit:{pl:"px (średnio)",en:"px (mean)"}, rows:[["max",{pl:"najgorsze",en:"worst"}]],
       how:{pl:"Odległość środka upuszczonego kwadratu od środka ramki. Upuszczenie jest udane, gdy kwadrat mieści się w ramce (z małym zapasem).",
            en:"Distance from the dropped square's centre to the frame's centre. A drop succeeds when the square fits in the frame (with a small margin)."}},
      {id:"d-trem", title:{pl:"Drżenie",en:"Tremor"}, unit:{pl:"px (RMS)",en:"px (RMS)"},
       how:{pl:"Dla każdego punktu drogi przy wciśniętym przycisku liczę, jak daleko odstaje od średniej z 7 sąsiednich punktów, i biorę średnią kwadratową. To mierzy drobne, szybkie drgania, a nie sam kształt ruchu.",
            en:"For every path point while the button is held I measure how far it sits from the average of the 7 neighbouring points, then take the root mean square. This captures small, fast wobble rather than the overall shape."}},
      {id:"d-pause", title:{pl:"Zatrzymania",en:"Stops"}, unit:{pl:"zatrzymań",en:"stops"}, rows:[["per",{pl:"na przeciągnięcie",en:"per drag"}]],
       how:{pl:"Momenty w trakcie przeciągania, gdy kursor zwalnia poniżej 20 px/s na co najmniej 150 ms, np. żeby się poprawić.",
            en:"Moments during a drag when the cursor slows below 20 px/s for at least 150 ms, e.g. to adjust."}},
      {id:"d-regrab", title:{pl:"Ponowne chwyty",en:"Re-grabs"}, unit:{pl:"razy",en:"times"},
       how:{pl:"Ile razy upuściłeś kwadrat poza ramką i musiałeś złapać go jeszcze raz.", en:"How many times you dropped the square outside the frame and had to grab it again."}}
    ],
    start(t){ t.S={phase:"run", trials:[], cur:null}; newTrial(t); },
    draw,
    down(t, p, e){ const c=t.S.cur; if(!c) return;
      if(Math.abs(p.x-c.sq.x)<=SQ/2 && Math.abs(p.y-c.sq.y)<=SQ/2){
        c.drag=true; c.grabs++; if(c.first==null) c.first=p.t; c.off={x:c.sq.x-p.x, y:c.sq.y-p.y}; c.segs.push([p]);
        try{ t.A.c.setPointerCapture(e.pointerId); }catch(_){} draw(t); } },
    move(t, pts){ const c=t.S.cur, A=t.A; if(!c || !c.drag) return; const seg=c.segs[c.segs.length-1];
      for(const p of pts){ seg.push(p); c.sq={ x:Math.max(SQ/2,Math.min(A.w-SQ/2,p.x+c.off.x)), y:Math.max(SQ/2,Math.min(A.h-SQ/2,p.y+c.off.y)) }; }
      draw(t); },
    up(t, p){ const S=t.S, c=S.cur; if(!c || !c.drag) return; c.drag=false;
      const dx=c.sq.x-c.fr.x, dy=c.sq.y-c.fr.y;
      if(Math.abs(dx)<=TOL && Math.abs(dy)<=TOL){
        S.trials.push({ time:p.t-c.first, err:Math.hypot(dx,dy), segs:c.segs, grabs:c.grabs, pauses:c.segs.reduce((s,g)=>s+countPauses(g),0) });
        if(S.trials.length>=N) t.finish(); else newTrial(t);
      } else { t.status({pl:"Poza ramką, złap kwadrat jeszcze raz.",en:"Outside the frame, grab the square again."}); draw(t); } },
    analyse(t){ const T=t.S.trials;
      return { time:T.map(x=>x.time), err:T.map(x=>x.err), trem:tremorRMS(T.flatMap(x=>x.segs)),
        pauses:T.reduce((s,x)=>s+x.pauses,0), regrab:T.reduce((s,x)=>s+x.grabs-1,0), n:T.length }; },
    render(R){ setMain("d-time",nf(median(R.time))); setRow("d-time","mean",ms(mean(R.time)));
      setMain("d-err",nf(mean(R.err),1)); setRow("d-err","max",px(Math.max(...R.err)));
      setMain("d-trem",nf(R.trem,2)); setMain("d-pause",R.pauses); setRow("d-pause","per",nf(R.pauses/R.n,1));
      setMain("d-regrab",R.regrab); },
    summary(R){ return LANG==="pl"
      ? `<p>Przeciągnięcie trwa u ciebie zwykle <strong>${ms(median(R.time))}</strong>, a kwadrat upuszczasz średnio ${px(mean(R.err))} od środka ramki.</p><p>Drżenie przy wciśniętym przycisku: ${px(R.trem,2)}. Zatrzymania w trakcie: ${R.pauses}, ponowne chwyty: ${R.regrab}.</p>`
      : `<p>A drag usually takes you <strong>${ms(median(R.time))}</strong>, and you drop the square on average ${px(mean(R.err))} from the frame's centre.</p><p>Tremor while holding the button: ${px(R.trem,2)}. Stops during dragging: ${R.pauses}, re-grabs: ${R.regrab}.</p>`; }
  });
})();

export { Drag };
