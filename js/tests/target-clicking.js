// Test: target-clicking
import { mouseTask } from "../core/arena.js";
import { R_MEAN, R_SD, U, setMain, setRow } from "../core/cards.js";
import { $, css, hyp, mean, median, ms, nf, pathLen, pct, px, sd } from "../core/utils.js";
import { D, LANG } from "../i18n/index.js";

// =====================================================================
// 2. KLIKANIE CELÓW
// =====================================================================
const Click = (() => { const N=12, RAD=20;
  const newTarget = (t, from) => { const A=t.A; let p, k=0;
    do{ p=A.rnd(RAD+12); k++; } while(hyp(p.x,p.y,from.x,from.y)<160 && k<200);
    t.S.cur = { tx:p.x, ty:p.y, from:{x:from.x,y:from.y}, t0:performance.now(), path:[], onset:null, down:null, up:null };
    t.status({pl:`Cel ${t.S.trials.length+1} z ${N}`, en:`Target ${t.S.trials.length+1} of ${N}`}); draw(t); };
  const draw = t => { const A=t.A, S=t.S; A.clear();
    if(S.phase==="ready") A.dot(A.w/2, A.h/2, RAD, css("--muted"));
    else if(S.cur) A.dot(S.cur.tx, S.cur.ty, RAD, css("--accent")); };
  return mouseTask({ tab:"klikanie", grid:"cards-click", sumId:"sum-click", canvas:"cv-click", statusId:"st-click", go:"go-click",
    title:{pl:"Klikanie celów",en:"Target clicking"},
    specs:[
      {id:"k-rt", title:{pl:"Czas reakcji",en:"Reaction time"}, unit:U.ms_med, rows:[R_MEAN,R_SD],
       how:{pl:"Od pojawienia się celu do pierwszego ruchu kursora o więcej niż 4 px. W tym czasie oko zauważa cel, a mózg wysyła polecenie do ręki.",
            en:"From the moment the target appears to the first cursor movement of more than 4 px. In that time your eye spots the target and your brain sends the command to your hand."}},
      {id:"k-mt", title:{pl:"Czas ruchu",en:"Movement time"}, unit:U.ms_med, rows:[R_MEAN,["spd",{pl:"średnia prędkość",en:"average speed"}]],
       how:{pl:"Od pierwszego ruchu do wciśnięcia przycisku na celu. Średnia prędkość to <code>odległość do celu ÷ czas ruchu</code>.",
            en:"From the first movement to pressing the button on the target. Average speed is <code>distance to target ÷ movement time</code>."}},
      {id:"k-str", title:{pl:"Prostoliniowość",en:"Straightness"}, unit:{pl:"% (mediana)",en:"% (median)"}, rows:[["min",{pl:"najbardziej kręty ruch",en:"most curved movement"}]],
       how:{pl:"<code>odległość w linii prostej ÷ długość faktycznej drogi kursora</code>. 100 % to idealnie prosta linia; im więcej łuków i zakrętów, tym mniej.",
            en:"<code>straight-line distance ÷ length of the actual cursor path</code>. 100 % is a perfectly straight line; the more arcs and turns, the lower."}},
      {id:"k-ovr", title:{pl:"Przestrzelenie",en:"Overshoot"}, unit:{pl:`celów z ${N}`,en:`of ${N} targets`}, rows:[["mean",{pl:"średnio o",en:"on average by"}]],
       how:{pl:"Rzutuję drogę kursora na kierunek start → cel. Jeśli przed kliknięciem kursor wyszedł dalej niż daleka krawędź celu, liczy się to jako przestrzelenie.",
            en:"I project the cursor path onto the start → target direction. If the cursor went beyond the far edge of the target before the click, it counts as an overshoot."}},
      {id:"k-hold", title:{pl:"Przytrzymanie przycisku",en:"Button hold"}, unit:U.ms_med, rows:[R_SD],
       how:{pl:"<code>pointerup − pointerdown</code> przy trafionym kliknięciu, czyli jak długo trzymasz wciśnięty przycisk.",
            en:"<code>pointerup − pointerdown</code> for a hit, i.e. how long you keep the button pressed."}},
      {id:"k-miss", title:{pl:"Pudła",en:"Misses"}, unit:{pl:"kliknięć obok",en:"clicks outside"}, rows:[["rate",{pl:"na cel",en:"per target"}]],
       how:{pl:"Kliknięcia poza kółkiem. Cel nie znika, dopóki go nie trafisz.", en:"Clicks outside the circle. The target stays until you hit it."}}
    ],
    start(t){ t.S={phase:"ready", trials:[], misses:0, cur:null}; t.status({pl:"Kliknij szare kółko na środku, żeby zacząć.",en:"Click the grey circle in the middle to begin."}); draw(t); },
    draw,
    move(t, pts){ const c=t.S.cur; if(!c || c.down) return;
      for(const p of pts){ c.path.push(p); if(c.onset==null && hyp(p.x,p.y,c.from.x,c.from.y)>4) c.onset=p.t; } },
    down(t, p){ const S=t.S, A=t.A;
      if(S.phase==="ready"){ if(hyp(p.x,p.y,A.w/2,A.h/2)<=RAD+4){ S.phase="run"; newTarget(t,p); } return; }
      const c=S.cur; if(!c || c.down) return;
      if(hyp(p.x,p.y,c.tx,c.ty)<=RAD) c.down=p; else S.misses++; },
    up(t, p){ const S=t.S, c=S.cur; if(!c || !c.down || c.up!=null) return;
      c.up=p.t; S.trials.push(c);
      if(S.trials.length>=N) t.finish(); else newTarget(t, c.down); },
    analyse(t){ const S=t.S; const rt=[],mt=[],str=[],ovr=[],hold=[],spd=[];
      for(const c of S.trials){
        hold.push(c.up-c.down.t);
        if(c.onset==null) continue;
        rt.push(c.onset-c.t0);
        const m=c.down.t-c.onset; mt.push(m);
        const D=hyp(c.tx,c.ty,c.from.x,c.from.y); if(m>0) spd.push(D/(m/1000));
        const pts=[c.from, ...c.path.filter(p=>p.t<=c.down.t), c.down];
        const Lp=pathLen(pts), st=hyp(c.down.x,c.down.y,c.from.x,c.from.y);
        str.push(Lp>0?Math.min(1,st/Lp):1);
        const ux=(c.tx-c.from.x)/D, uy=(c.ty-c.from.y)/D; let mx=-Infinity;
        for(const p of pts) mx=Math.max(mx,(p.x-c.from.x)*ux+(p.y-c.from.y)*uy);
        if(mx-(D+RAD)>0) ovr.push(mx-(D+RAD));
      }
      return {rt,mt,str,ovr,hold,spd,misses:S.misses,n:S.trials.length}; },
    render(R){
      setMain("k-rt",nf(median(R.rt))); setRow("k-rt","mean",ms(mean(R.rt))); setRow("k-rt","sd",ms(sd(R.rt)));
      setMain("k-mt",nf(median(R.mt))); setRow("k-mt","mean",ms(mean(R.mt))); setRow("k-mt","spd",Number.isFinite(mean(R.spd))?nf(mean(R.spd))+" px/s":"—");
      setMain("k-str",nf(100*median(R.str))); setRow("k-str","min",pct(Math.min(...R.str)));
      setMain("k-ovr",R.ovr.length); setRow("k-ovr","mean",px(mean(R.ovr)));
      setMain("k-hold",nf(median(R.hold))); setRow("k-hold","sd",ms(sd(R.hold)));
      setMain("k-miss",R.misses); setRow("k-miss","rate",nf(R.misses/R.n,2)); },
    summary(R){ return LANG==="pl"
      ? `<p>Czas reakcji (mediana) wynosi <strong>${ms(median(R.rt))}</strong>, a dojście do celu zajmuje ci ${ms(median(R.mt))}. Kursor prowadzisz w ${pct(median(R.str))} prosto (100 % to linia prosta).</p><p>Przestrzeliłeś ${R.ovr.length} z ${R.n} celów i kliknąłeś obok ${R.misses} razy. Przycisk przytrzymujesz zwykle przez ${ms(median(R.hold))}.</p>`
      : `<p>Your median reaction time is <strong>${ms(median(R.rt))}</strong>, and reaching the target takes ${ms(median(R.mt))}. Your cursor path is ${pct(median(R.str))} straight (100 % is a straight line).</p><p>You overshot ${R.ovr.length} of ${R.n} targets and clicked outside ${R.misses} times. You usually hold the button for ${ms(median(R.hold))}.</p>`; }
  });
})();

export { Click };
