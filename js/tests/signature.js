// Test: signature
import { Arena } from "../core/arena.js";
import { buildCards, setMain, setRow, setSummary } from "../core/cards.js";
import { LANGHOOKS, SHOW } from "../core/registry.js";
import { $, css, mean, nf, pct, sd } from "../core/utils.js";
import { D, L, LANG } from "../i18n/index.js";
import { markDone, renderResults } from "../main.js";

// =====================================================================
// PODPIS MYSZKĄ — 3 podpisy jako wzorzec, potem weryfikacja (kształt, tempo, rytm)
// =====================================================================
const Sig = (() => { const N=3, TH=2, RS=64, BINS=16;
  const A=new Arena("cv-sig"); let P, cur, st=null, drawing=false, overlay=null;
  const self = { tab:"podpis", key:"podpis", grid:"cards-sig", sumId:"sum-sig", R:null, title:{pl:"Podpis myszką",en:"Mouse signature"}, specs:[
    {id:"sig-last", title:{pl:"Ostatnia weryfikacja",en:"Last verification"}, unit:{pl:`wynik (próg ${TH})`,en:`score (threshold ${TH})`},
     rows:[["ver",{pl:"werdykt",en:"verdict"}],["shape",{pl:"kształt",en:"shape"}],["tempo",{pl:"tempo",en:"tempo"}],["rhythm",{pl:"rytm",en:"rhythm"}]],
     how:{pl:`Każdy z trzech wskaźników mówi, ile razy podpis różni się od wzorców bardziej niż Twoje wzorce różnią się między sobą (1 = tak samo jak zwykle). <b>Kształt</b>: podpis przesuwam do środka, skaluję do tej samej wielkości, próbkuję w ${RS} punktach i porównuję algorytmem DTW (dopasowanie dynamiczne, które wybacza drobne przesunięcia w czasie). <b>Tempo</b>: różnica logarytmu czasu podpisu od średniej wzorców, w jednostkach ich rozrzutu (min. 8%). <b>Rytm</b>: profil prędkości w ${BINS} odcinkach czasu, porównany korelacją. Wynik = średnia trzech wskaźników; podpis jest zgodny, gdy wynik ≤ ${TH}.`,
          en:`Each of the three measures says how many times more the signature differs from your templates than your templates differ from each other (1 = as usual). <b>Shape</b>: the signature is centred, scaled to the same size, resampled to ${RS} points and compared with DTW (dynamic time warping, which forgives small timing shifts). <b>Tempo</b>: difference of the log of signing time from the templates' mean, in units of their spread (min. 8%). <b>Rhythm</b>: speed profile over ${BINS} time slices, compared by correlation. Score = mean of the three; the signature matches when score ≤ ${TH}.`}},
    {id:"sig-tests", title:{pl:"Weryfikacje",en:"Verifications"}, unit:{pl:"zgodnych",en:"matching"},
     rows:[["all",{pl:"wszystkich",en:"total"}],["rej",{pl:"odrzuconych",en:"rejected"}]],
     how:{pl:"Daj podpisać się komuś innemu, kto widział Twój podpis, i sprawdź, czy zostanie odrzucony. Nawet dobra kopia kształtu zwykle różni się tempem i rytmem.",
          en:"Let someone who has seen your signature try to copy it and check whether they get rejected. Even a good copy of the shape usually differs in tempo and rhythm."}},
    {id:"sig-ref", title:{pl:"Twoje wzorce",en:"Your templates"}, unit:{pl:"podpisy",en:"signatures"},
     rows:[["dur",{pl:"średni czas",en:"mean time"}],["strokes",{pl:"kresek (średnio)",en:"strokes (mean)"}],["rs",{pl:"rozrzut kształtu (DTW)",en:"shape spread (DTW)"}],["rt",{pl:"rozrzut tempa",en:"tempo spread"}]],
     how:{pl:"Kreska to fragment narysowany bez puszczania przycisku. Rozrzut kształtu to średnia odległość DTW między parami wzorców (w jednostkach rozmiaru podpisu), rozrzut tempa to odchylenie standardowe logarytmu czasu.",
          en:"A stroke is a part drawn without releasing the button. Shape spread is the mean DTW distance between pairs of templates (in signature-size units); tempo spread is the standard deviation of the log of signing time."}}
  ]};
  const status = o => { st=o; $("st-sig").textContent = L(o)||""; };
  const fresh = () => { cur={strokes:[]}; overlay=null; };
  function feats(sig){
    const pts=sig.strokes.flat(); const t0=pts[0].t, dur=pts[pts.length-1].t-t0;
    let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity; for(const p of pts){ x0=Math.min(x0,p.x); x1=Math.max(x1,p.x); y0=Math.min(y0,p.y); y1=Math.max(y1,p.y); }
    const sc=Math.max(x1-x0,y1-y0)||1, mx=mean(pts.map(p=>p.x)), my=mean(pts.map(p=>p.y));
    const n=pts.map(p=>({x:(p.x-mx)/sc, y:(p.y-my)/sc, t:p.t-t0}));
    const cum=[0]; for(let i=1;i<n.length;i++) cum.push(cum[i-1]+Math.hypot(n[i].x-n[i-1].x,n[i].y-n[i-1].y));
    const total=cum[cum.length-1]||1, res=[]; let j=0;
    for(let k=0;k<RS;k++){ const d=total*k/(RS-1); while(j<cum.length-2 && cum[j+1]<d) j++; const seg=(cum[j+1]-cum[j])||1, f=Math.min(1,Math.max(0,(d-cum[j])/seg));
      res.push({x:n[j].x+f*((n[j+1]||n[j]).x-n[j].x), y:n[j].y+f*((n[j+1]||n[j]).y-n[j].y)}); }
    const prof=new Array(BINS).fill(0), cnt=new Array(BINS).fill(0);
    for(let i=1;i<n.length;i++){ const dt=n[i].t-n[i-1].t; if(dt<=0) continue; const b=Math.min(BINS-1,Math.floor(BINS*n[i].t/(dur||1)));
      prof[b]+=Math.hypot(n[i].x-n[i-1].x,n[i].y-n[i-1].y)/dt; cnt[b]++; }
    for(let b=0;b<BINS;b++) prof[b]=cnt[b]?prof[b]/cnt[b]:0;
    return { res, prof, dur, strokes:sig.strokes.length, box:{x0,y0,x1,y1,sc,mx,my} };
  }
  function dtw(a,b){ const n=a.length, m=b.length, D=new Float64Array((n+1)*(m+1)).fill(Infinity); D[0]=0;
    for(let i=1;i<=n;i++) for(let j=1;j<=m;j++){ const c=Math.hypot(a[i-1].x-b[j-1].x,a[i-1].y-b[j-1].y);
      D[i*(m+1)+j]=c+Math.min(D[(i-1)*(m+1)+j],D[i*(m+1)+j-1],D[(i-1)*(m+1)+j-1]); }
    return D[n*(m+1)+m]/n; }
  const corrDist = (p,q) => { const mp=mean(p), mq=mean(q); let s=0,a=0,b=0; for(let i=0;i<p.length;i++){ s+=(p[i]-mp)*(q[i]-mq); a+=(p[i]-mp)**2; b+=(q[i]-mq)**2; } return (a&&b) ? 1-s/Math.sqrt(a*b) : 1; };
  const pairs = arr => { const o=[]; for(let i=0;i<arr.length;i++) for(let j=i+1;j<arr.length;j++) o.push([arr[i],arr[j]]); return o; };
  function ref(){ const E=P.enroll;
    return { rS:Math.max(0.02, mean(pairs(E).map(([a,b])=>dtw(a.res,b.res)))), rR:Math.max(0.05, mean(pairs(E).map(([a,b])=>corrDist(a.prof,b.prof)))),
             mu:mean(E.map(e=>Math.log(e.dur))), sT:Math.max(0.08, sd(E.map(e=>Math.log(e.dur)))) }; }
  function compare(f){ const E=P.enroll, r=ref();
    const ds=E.map(e=>dtw(f.res,e.res)), shape=mean(ds)/r.rS, tempo=Math.abs(Math.log(f.dur)-r.mu)/r.sT, rhythm=mean(E.map(e=>corrDist(f.prof,e.prof)))/r.rR;
    const score=(shape+tempo+rhythm)/3; return { score, shape, tempo, rhythm, ok:score<=TH, best:ds.indexOf(Math.min(...ds)), dur:f.dur, strokes:f.strokes }; }

  function draw(){ A.fit(); if(!A.w) return; const g=A.ctx; A.clear();
    g.strokeStyle=css("--line"); g.lineWidth=1; g.setLineDash([5,5]); g.beginPath(); g.moveTo(30,A.h*0.72); g.lineTo(A.w-30,A.h*0.72); g.stroke(); g.setLineDash([]);
    g.lineCap="round"; g.lineJoin="round";
    if(overlay){ const e=overlay.e, b=overlay.box; g.strokeStyle=css("--muted"); g.globalAlpha=0.55; g.lineWidth=2; g.beginPath();
      e.res.forEach((p,i)=>{ const x=b.mx+p.x*b.sc, y=b.my+p.y*b.sc; if(i) g.lineTo(x,y); else g.moveTo(x,y); }); g.stroke(); g.globalAlpha=1; }
    g.strokeStyle=css("--accent"); g.lineWidth=2.5;
    for(const s of cur.strokes){ g.beginPath(); s.forEach((p,i)=> i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y)); if(s.length===1) g.arc(s[0].x,s[0].y,1,0,7); g.stroke(); }
    if(!cur.strokes.length && !overlay) A.label(LANG==="pl"?"Podpisz się tutaj, trzymając wciśnięty przycisk myszy":"Sign here while holding the mouse button", A.h*0.4);
  }
  function steps(){
    $("sig-steps").innerHTML = Array.from({length:N},(_,i)=>`<span class="${i<P.enroll.length?"ok":(i===P.enroll.length?"now":"")}">${i+1}</span>`).join("")
      + `<span class="${P.enroll.length>=N?"now":""}">${LANG==="pl"?"weryfikacja":"verify"}</span>`;
    $("sig-history").innerHTML = P.tests.map((t,i)=>`<span class="chip ${t.ok?"ok":"no"}">#${i+1} ${nf(t.score,2)} ${t.ok?"✓":"✗"}</span>`).join("");
  }
  const prompt = () => status(P.enroll.length<N
    ? {pl:`Wzorzec ${P.enroll.length+1} z ${N}: podpisz się i kliknij „Zatwierdź”.`,en:`Template ${P.enroll.length+1} of ${N}: sign and click “Submit”.`}
    : {pl:"Weryfikacja: podpisz się (albo daj spróbować komuś innemu) i kliknij „Zatwierdź”.",en:"Verification: sign (or let someone else try) and click “Submit”."});
  A.c.addEventListener("pointerdown", e => { e.preventDefault(); if(overlay){ overlay=null; cur={strokes:[]}; }
    const p=A.pos(e); cur.strokes.push([p]); drawing=true; try{ A.c.setPointerCapture(e.pointerId); }catch(_){} draw(); });
  A.c.addEventListener("pointermove", e => { if(!drawing) return; cur.strokes[cur.strokes.length-1].push(...A.moves(e)); draw(); });
  A.c.addEventListener("pointerup", () => { drawing=false; });
  A.c.addEventListener("contextmenu", e => e.preventDefault());
  $("sig-clear").addEventListener("click", () => { fresh(); draw(); prompt(); });
  $("sig-reset").addEventListener("click", () => { P={enroll:[], tests:[]}; self.R=null; fresh();
    const tab=document.querySelector('#tabs a[data-tab="podpis"]'); if(tab) tab.classList.remove("done");
    buildCards(self.grid,self.specs); setSummary(self); renderResults(); steps(); prompt(); draw(); });
  $("sig-ok").addEventListener("click", () => {
    const pts=cur.strokes.flat();
    if(pts.length<20 || overlay){ status({pl:"Za krótki podpis. Podpisz się jeszcze raz.",en:"Signature too short. Sign again."}); fresh(); draw(); return; }
    const f=feats(cur);
    if(P.enroll.length<N){ P.enroll.push(f); fresh(); if(P.enroll.length===N){ update(); status({pl:"Wzorce gotowe. Teraz podpisz się jeszcze raz do weryfikacji.",en:"Templates ready. Now sign again to verify."}); } else prompt(); }
    else { const c=compare(f); P.tests.push(c); overlay={e:P.enroll[c.best], box:f.box}; update();
      status(c.ok ? {pl:`Zgodny z wzorcem (wynik ${nf(c.score,2)}). Szary ślad to najbliższy wzorzec.`,en:`Matches the templates (score ${nf(c.score,2)}). The grey trace is the closest template.`}
                  : {pl:`Niezgodny z wzorcem (wynik ${nf(c.score,2)}). Szary ślad to najbliższy wzorzec.`,en:`Does not match (score ${nf(c.score,2)}). The grey trace is the closest template.`}); }
    steps(); draw(); });
  function update(){ const r=ref(), E=P.enroll;
    self.R = { templates:E.map(e=>({durationMs:e.dur, strokes:e.strokes})), shapeSpread:r.rS, tempoSpread:r.sT, rhythmSpread:r.rR, threshold:TH,
      tests:P.tests.map(t=>({score:t.score, shape:t.shape, tempo:t.tempo, rhythm:t.rhythm, match:t.ok, durationMs:t.dur, strokes:t.strokes})) };
    self.render(self.R); setSummary(self); markDone("podpis"); }
  self.render = R => { const l=R.tests[R.tests.length-1], acc=R.tests.filter(t=>t.match).length;
    setMain("sig-last", l?nf(l.score,2):"—"); setRow("sig-last","ver", l?(l.match?(LANG==="pl"?"zgodny":"match"):(LANG==="pl"?"niezgodny":"no match")):"—");
    setRow("sig-last","shape", l?nf(l.shape,2)+"×":"—"); setRow("sig-last","tempo", l?nf(l.tempo,2)+"×":"—"); setRow("sig-last","rhythm", l?nf(l.rhythm,2)+"×":"—");
    setMain("sig-tests", acc); setRow("sig-tests","all", R.tests.length); setRow("sig-tests","rej", R.tests.length-acc);
    setMain("sig-ref", R.templates.length); setRow("sig-ref","dur", nf(mean(R.templates.map(t=>t.durationMs))/1000,2)+" s");
    setRow("sig-ref","strokes", nf(mean(R.templates.map(t=>t.strokes)),1)); setRow("sig-ref","rs", nf(R.shapeSpread,3)); setRow("sig-ref","rt", pct(R.tempoSpread)); };
  self.summary = R => { const l=R.tests[R.tests.length-1], acc=R.tests.filter(t=>t.match).length;
    if(LANG==="pl") return `<p>Wzorzec powstał z ${R.templates.length} podpisów (średnio ${nf(mean(R.templates.map(t=>t.durationMs))/1000,2)} s).</p>`
      + (l ? `<p>Ostatni podpis: wynik <strong>${nf(l.score,2)}</strong> przy progu ${TH}, więc jest <strong>${l.match?"zgodny":"niezgodny"}</strong> z wzorcem. Zgodnych weryfikacji: ${acc} z ${R.tests.length}.</p>` : "<p>Nie było jeszcze weryfikacji.</p>");
    return `<p>The template was built from ${R.templates.length} signatures (mean ${nf(mean(R.templates.map(t=>t.durationMs))/1000,2)} s).</p>`
      + (l ? `<p>Last signature: score <strong>${nf(l.score,2)}</strong> with threshold ${TH}, so it <strong>${l.match?"matches":"does not match"}</strong> the template. Matching verifications: ${acc} of ${R.tests.length}.</p>` : "<p>No verification yet.</p>"); };
  P={enroll:[], tests:[]}; fresh();
  SHOW.podpis = () => { steps(); if(!st) prompt(); draw(); };
  LANGHOOKS.push(() => { steps(); status(st); draw(); });
  return self;
})();

export { Sig };
