// Test: tracing
import { mouseTask } from "../core/arena.js";
import { setMain, setRow } from "../core/cards.js";
import { $, css, hyp, mean, nf, pathLen, px, tremorRMS } from "../core/utils.js";
import { LANG } from "../i18n/index.js";

// =====================================================================
// 5. RYSOWANIE PO ŚLADZIE
// =====================================================================
const Draw = (() => {
  const geom = A => ({ circle:{cx:A.w/2, cy:A.h/2, r:Math.min(A.w,A.h)*0.36},
                       line:{x1:A.w*0.15, y1:A.h*0.8, x2:A.w*0.85, y2:A.h*0.2} });
  const devC = (g,p) => Math.abs(hyp(p.x,p.y,g.cx,g.cy)-g.r);
  const projL = (g,p) => { const dx=g.x2-g.x1, dy=g.y2-g.y1; return ((p.x-g.x1)*dx+(p.y-g.y1)*dy)/(dx*dx+dy*dy); };
  const devL = (g,p) => { const u=Math.max(0,Math.min(1,projL(g,p))); return hyp(p.x,p.y,g.x1+u*(g.x2-g.x1),g.y1+u*(g.y2-g.y1)); };
  const shape = S => S.round===0 ? "circle" : "line";
  const dev = (S,p) => shape(S)==="circle" ? devC(S.g.circle,p) : devL(S.g.line,p);
  const instr = S => shape(S)==="circle"
    ? {pl:"Wciśnij przycisk na szarym okręgu i obrysuj go jednym ruchem dookoła.",en:"Press the button on the grey circle and trace it all the way round in one go."}
    : {pl:"Teraz linia: wciśnij przycisk przy jednym końcu i prowadź do drugiego.",en:"Now the line: press the button near one end and trace it to the other."};
  const draw = t => { const A=t.A, S=t.S, g=A.ctx; A.clear();
    g.lineCap="round"; g.strokeStyle=css("--line"); g.lineWidth=22; g.beginPath();
    if(shape(S)==="circle"){ const c=S.g.circle; g.arc(c.cx,c.cy,c.r,0,Math.PI*2); }
    else { const l=S.g.line; g.moveTo(l.x1,l.y1); g.lineTo(l.x2,l.y2); }
    g.stroke(); g.strokeStyle=css("--muted"); g.lineWidth=1.5; g.stroke();
    if(S.pts.length>1){ g.strokeStyle=css("--accent"); g.lineWidth=2; g.beginPath(); g.moveTo(S.pts[0].x,S.pts[0].y);
      for(const p of S.pts) g.lineTo(p.x,p.y); g.stroke(); } };
  function endRound(t){ const S=t.S; S.drawing=false;
    const pts=S.pts, sh=shape(S);
    if(pts.length<15){ S.pts=[]; t.status({pl:"Za krótko. Spróbuj jeszcze raz.",en:"Too short. Try again."}); draw(t); return; }
    const devs=pts.map(p=>dev(S,p));
    let cover;
    if(sh==="circle") cover=Math.min(1,Math.abs(S.cum)/(2*Math.PI));
    else { const u=pts.map(p=>Math.max(0,Math.min(1,projL(S.g.line,p)))); cover=Math.max(...u)-Math.min(...u); }
    const time=pts[pts.length-1].t-pts[0].t;
    S.res[sh]={ mean:mean(devs), max:Math.max(...devs), trem:tremorRMS([pts]), cover, time, speed:pathLen(pts)/(time/1000) };
    S.round++; S.pts=[];
    if(S.round>=2) t.finish(); else { t.status(instr(S)); draw(t); } }
  return mouseTask({ tab:"rysowanie", grid:"cards-draw", sumId:"sum-draw", canvas:"cv-draw", statusId:"st-draw", go:"go-draw",
    title:{pl:"Rysowanie po śladzie",en:"Tracing shapes"},
    specs:[
      {id:"r-dev", title:{pl:"Odchylenie od wzoru",en:"Deviation from shape"}, unit:{pl:"px (koło / linia)",en:"px (circle / line)"},
       rows:[["maxc",{pl:"maksymalne, koło",en:"maximum, circle"}],["maxl",{pl:"maksymalne, linia",en:"maximum, line"}]],
       how:{pl:"Dla każdego punktu narysowanej drogi liczę odległość od wzoru: dla okręgu <code>|odległość od środka − promień|</code>, dla linii odległość prostopadłą do odcinka. Pokazuję średnią i maksimum.",
            en:"For every point of the drawn path I measure the distance to the shape: for the circle <code>|distance from centre − radius|</code>, for the line the perpendicular distance to the segment. I show the mean and the maximum."}},
      {id:"r-trem", title:{pl:"Drżenie",en:"Tremor"}, unit:{pl:"px RMS (koło / linia)",en:"px RMS (circle / line)"},
       how:{pl:"Tak samo jak przy przeciąganiu: odchylenie każdego punktu od średniej z 7 sąsiednich, średnia kwadratowa. Mierzy drobne drgania niezależnie od tego, jak dobrze trzymasz się wzoru.",
            en:"Same as in dragging: each point's offset from the average of its 7 neighbours, root mean square. It measures small wobble regardless of how well you follow the shape."}},
      {id:"r-cover", title:{pl:"Pokrycie wzoru",en:"Shape coverage"}, unit:{pl:"% (koło / linia)",en:"% (circle / line)"},
       how:{pl:"Okrąg: jaki kąt obiegłeś wokół środka (360° = 100 %, wtedy rysowanie kończy się samo). Linia: jaką część długości odcinka pokryła rzutowana droga.",
            en:"Circle: the angle you went round the centre (360° = 100 %, drawing then stops by itself). Line: how much of the segment's length the projected path covered."}},
      {id:"r-speed", title:{pl:"Tempo rysowania",en:"Drawing speed"}, unit:{pl:"px/s (koło / linia)",en:"px/s (circle / line)"},
       rows:[["tc",{pl:"czas, koło",en:"time, circle"}],["tl",{pl:"czas, linia",en:"time, line"}]],
       how:{pl:"<code>długość narysowanej drogi ÷ czas rysowania</code>.", en:"<code>length of drawn path ÷ drawing time</code>."}}
    ],
    start(t){ const A=t.A; t.S={phase:"run", g:geom(A), round:0, pts:[], drawing:false, res:{}, cum:0, prevA:0}; t.status(instr(t.S)); draw(t); },
    draw,
    down(t, p, e){ const S=t.S;
      if(dev(S,p)>30){ t.status({pl:"Zacznij na wzorze (szary pas).",en:"Start on the shape (the grey band)."}); return; }
      S.drawing=true; S.pts=[p]; S.cum=0; const c=S.g.circle; S.prevA=Math.atan2(p.y-c.cy,p.x-c.cx);
      try{ t.A.c.setPointerCapture(e.pointerId); }catch(_){} t.status(instr(S)); },
    move(t, pts){ const S=t.S; if(!S.drawing) return; const c=S.g.circle;
      for(const p of pts){ S.pts.push(p);
        if(shape(S)==="circle"){ const a=Math.atan2(p.y-c.cy,p.x-c.cx); let d=a-S.prevA;
          if(d>Math.PI) d-=2*Math.PI; if(d<-Math.PI) d+=2*Math.PI; S.cum+=d; S.prevA=a;
          if(Math.abs(S.cum)>=2*Math.PI){ draw(t); endRound(t); return; } } }
      draw(t); },
    up(t){ if(t.S.drawing) endRound(t); },
    analyse(t){ return t.S.res; },
    render(R){ const c=R.circle, l=R.line;
      setMain("r-dev",`${nf(c.mean,1)} / ${nf(l.mean,1)}`); setRow("r-dev","maxc",px(c.max)); setRow("r-dev","maxl",px(l.max));
      setMain("r-trem",`${nf(c.trem,2)} / ${nf(l.trem,2)}`);
      setMain("r-cover",`${nf(100*c.cover)} / ${nf(100*l.cover)}`);
      setMain("r-speed",`${nf(c.speed)} / ${nf(l.speed)}`); setRow("r-speed","tc",nf(c.time/1000,1)+" s"); setRow("r-speed","tl",nf(l.time/1000,1)+" s"); },
    summary(R){ const c=R.circle, l=R.line; return LANG==="pl"
      ? `<p>Okrąg obrysowałeś ze średnim odchyleniem <strong>${px(c.mean)}</strong>, a linię z odchyleniem <strong>${px(l.mean)}</strong>.</p><p>Drżenie: ${px(c.trem,2)} przy okręgu i ${px(l.trem,2)} przy linii. Okrąg zajął ci ${nf(c.time/1000,1)} s, linia ${nf(l.time/1000,1)} s.</p>`
      : `<p>You traced the circle with a mean deviation of <strong>${px(c.mean)}</strong> and the line with <strong>${px(l.mean)}</strong>.</p><p>Tremor: ${px(c.trem,2)} on the circle and ${px(l.trem,2)} on the line. The circle took you ${nf(c.time/1000,1)} s, the line ${nf(l.time/1000,1)} s.</p>`; }
  });
})();

export { Draw };
