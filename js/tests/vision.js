// Test: vision
import { Arena } from "../core/arena.js";
import { R_MEAN, U, setHTML, setMain, setRow, setSummary } from "../core/cards.js";
import { $, css, esc, mean, median, ms, nf, px } from "../core/utils.js";
import { D, L, LANG } from "../i18n/index.js";
import { markDone } from "../main.js";
import { Click } from "./target-clicking.js";

// =====================================================================
// 9. WZROK — kalibracja, tablica Snellena (litery / obracane E), tablice barwne
// =====================================================================
const SLOAN = "CDHKNOVZ";
const SN_LEVELS = [200,100,70,50,40,30,25,20,15,10];
const snMm = (x, distM) => distM*1000*Math.tan((5/60)*(Math.PI/180)*x/20);   // wysokość znaku 20/x w mm
const snMetric = x => { const v=x*6/20; return "6/"+(Number.isInteger(v)?v:nf(v,1)); };

// Litery w stylu Sloan: siatka 5 × 5, grubość kreski = 1/5 wysokości
function drawSloan(g, ch, x, y, h){
  g.save(); g.beginPath(); g.rect(x,y,h,h); g.clip(); g.translate(x,y); g.scale(h/5,h/5);
  g.lineWidth=1; g.lineCap="butt"; g.lineJoin="miter"; g.miterLimit=10; g.beginPath();
  const P = pts => { g.moveTo(pts[0],pts[1]); for(let i=2;i<pts.length;i+=2) g.lineTo(pts[i],pts[i+1]); };
  switch(ch){
    case "H": P([.5,0,.5,5]); P([4.5,0,4.5,5]); P([.5,2.5,4.5,2.5]); break;
    case "N": P([.5,5.5,.5,.2,4.5,4.8,4.5,-.5]); break;
    case "V": P([.4,-.5,2.5,4.6,4.6,-.5]); break;
    case "Z": P([0,.5,4.3,.5,.7,4.5,5,4.5]); break;
    case "K": P([.5,0,.5,5]); P([4.7,-.1,1,3]); P([2.1,2.1,4.8,5.2]); break;
    case "O": g.arc(2.5,2.5,2,0,2*Math.PI); break;
    case "C": g.arc(2.5,2.5,2,0.27,2*Math.PI-0.27); break;
    case "D": P([2.5,.5,.5,.5,.5,4.5,2.5,4.5]); g.moveTo(2.5,.5); g.arc(2.5,2.5,2,-Math.PI/2,Math.PI/2); break;
  }
  g.stroke(); g.restore();
}
// Obracane E: siatka 5 × 5, ramiona skierowane w stronę `dir`
function drawE(g, dir, x, y, h){
  const u=h/5, rot={right:0, down:Math.PI/2, left:Math.PI, up:-Math.PI/2}[dir];
  g.save(); g.translate(x+h/2,y+h/2); g.rotate(rot); g.translate(-h/2,-h/2);
  g.fillRect(0,0,u,h); g.fillRect(0,0,h,u); g.fillRect(0,2*u,h,u); g.fillRect(0,4*u,h,u);
  g.restore();
}

const Cal = (() => {
  const r=$("cal-size"), d=$("cal-dist");
  r.value = Math.round(85.6*96/25.4);
  const dist = () => Math.min(6, Math.max(0.5, parseFloat(String(d.value).replace(",", ".")) || 2));
  const ppm = () => (+r.value)/85.6;
  function upd(){ const w=+r.value, c=$("cal-card"); c.style.width=w+"px"; c.style.height=(w*53.98/85.6)+"px";
    $("cal-mm").textContent = nf(ppm(),2)+" px/mm";
    const h=snMm(20,dist()); $("cal-info").textContent = (LANG==="pl"?"znak 20/20 będzie miał ":"a 20/20 symbol will be ")+`${nf(h,1)} mm = ${nf(h*ppm(),1)} px`; }
  r.addEventListener("input", upd); d.addEventListener("input", upd);
  return { ppm, dist, upd };
})();

function snSpecs(p){ return [
  {id:p+"-acu", title:{pl:"Ostrość wzroku",en:"Visual acuity"}, unit:{pl:"(zapis Snellena)",en:"(Snellen notation)"},
   rows:[["metric",{pl:"zapis metryczny",en:"metric notation"}],["dec",{pl:"zapis dziesiętny",en:"decimal"}],["start",{pl:"poziom startowy",en:"starting level"}]],
   how:{pl:"Znak poziomu 20/x ma wysokość odpowiadającą kątowi 5′ × x/20 z Twojej odległości: <code>wysokość = odległość × tan(5′ × x / 20)</code>. Na każdym poziomie pokazuję do 5 znaków; poziom jest zaliczony przy 3 poprawnych, niezaliczony przy 3 błędnych. Wynik to najmniejszy zaliczony poziom. 20/20 (6/6, 1,0) to tzw. pełna ostrość. Strona pokazuje pojedyncze znaki, a nie całe rzędy jak na tablicy, co zwykle trochę ułatwia zadanie.",
        en:"A 20/x symbol subtends 5′ × x/20 at your distance: <code>height = distance × tan(5′ × x / 20)</code>. Each level shows up to 5 symbols; it is passed at 3 correct and failed at 3 wrong. The result is the smallest passed level. 20/20 (6/6, 1.0) is so-called normal acuity. The page shows single symbols, not whole rows as on a chart, which usually makes the task a little easier."}},
  {id:p+"-lev", title:{pl:"Poziomy",en:"Levels"}, chips:[["list",null]],
   how:{pl:"Każdy pokazany poziom: liczba poprawnych odpowiedzi / pokazanych znaków.",en:"Each level shown: correct answers / symbols shown."}},
  {id:p+"-rt", title:{pl:"Czas odpowiedzi",en:"Response time"}, unit:U.ms_med, rows:[R_MEAN],
   how:{pl:"Od pokazania znaku do odpowiedzi.",en:"From showing a symbol to your answer."}},
  {id:p+"-cal", title:{pl:"Kalibracja",en:"Calibration"}, unit:{pl:"m od ekranu",en:"m from screen"},
   rows:[["ppm",{pl:"skala ekranu",en:"screen scale"}],["h20",{pl:"znak 20/20",en:"20/20 symbol"}]],
   how:{pl:"Skala pochodzi z dopasowania prostokąta do karty (85,6 mm), a odległość podajesz sam. Błąd kalibracji albo odległości przekłada się wprost na wynik: 10% za blisko to wynik o ok. 10% za dobry.",
        en:"The scale comes from matching the rectangle to a card (85.6 mm), and you enter the distance yourself. Calibration or distance errors go straight into the result: sitting 10% too close makes it about 10% too good."}}
];}
function snTask(mode){ const p = mode==="a" ? "sn-a" : "sn-b";
  const self = { tab:"wzrok", key: mode==="a" ? "snellen-litery" : "snellen-e", grid:"cards-"+p, sumId:"sum-"+p, R:null,
    title: mode==="a" ? {pl:"Tablica Snellena: litery",en:"Snellen chart: letters"} : {pl:"Tablica Snellena: obracane E",en:"Snellen chart: tumbling E"},
    specs: snSpecs(p) };
  self.render = R => {
    setMain(p+"-acu", R.best ? "20/"+R.best : `< 20/${R.startLevel}`);
    setRow(p+"-acu","metric", R.best ? snMetric(R.best) : "—"); setRow(p+"-acu","dec", R.best ? nf(20/R.best,2) : "—"); setRow(p+"-acu","start","20/"+R.startLevel);
    setHTML(p+"-lev","list", R.levels.map(l=>`<span class="chip ${l.pass?"ok":"no"}">20/${l.x} · ${l.ok}/${l.n} ${l.pass?"✓":"✗"}</span>`).join(""));
    setMain(p+"-rt", nf(median(R.rts))); setRow(p+"-rt","mean", ms(mean(R.rts)));
    setMain(p+"-cal", nf(R.distanceM,1)); setRow(p+"-cal","ppm", nf(R.pxPerMm,2)+" px/mm"); setRow(p+"-cal","h20", `${nf(R.h20mm,1)} mm · ${nf(R.h20px,1)} px`); };
  self.summary = R => { const what = mode==="a" ? (LANG==="pl"?"litery":"letters") : (LANG==="pl"?"znaki E":"E symbols");
    const lim = R.limited ? (LANG==="pl" ? " Ekran nie pokaże mniejszych znaków z tej odległości, więc wynik może być zaniżony; usiądź dalej i powtórz." : " The screen can't show smaller symbols at this distance, so the result may be underestimated; sit further away and repeat.") : "";
    if(LANG==="pl") return (R.best
      ? `<p>Z odległości ${nf(R.distanceM,1)} m najmniejsze ${what}, które rozpoznałeś (3 z 5), odpowiadają ostrości <strong>20/${R.best}</strong> (${snMetric(R.best)}, dziesiętnie ${nf(20/R.best,2)}). Dla porównania 20/20 to tzw. pełna ostrość.${lim}</p>`
      : `<p>Nie zaliczyłeś nawet poziomu startowego 20/${R.startLevel}. Sprawdź kalibrację i odległość.</p>`)
      + `<p><strong>To nie jest badanie wzroku.</strong> Wynik z ekranu jest przybliżony; jeśli masz wątpliwości co do wzroku, idź do optometrysty lub okulisty.</p>`;
    return (R.best
      ? `<p>From ${nf(R.distanceM,1)} m the smallest ${what} you recognised (3 of 5) correspond to <strong>20/${R.best}</strong> acuity (${snMetric(R.best)}, decimal ${nf(20/R.best,2)}). For comparison, 20/20 is so-called normal acuity.${lim}</p>`
      : `<p>You didn't pass even the starting level 20/${R.startLevel}. Check the calibration and distance.</p>`)
      + `<p><strong>This is not an eye test.</strong> A screen result is approximate; if you have any doubts about your eyesight, see an optometrist or ophthalmologist.</p>`; };
  return self;
}
const SnA = snTask("a"), SnB = snTask("b");

const SnRun = (() => {
  const A = new Arena("cv-sn"); let S=null, st=null;
  const ARROW = {right:"→", down:"↓", left:"←", up:"↑"};
  const opts = m => m==="a" ? [...SLOAN] : ["right","down","left","up"];
  const status = o => { st=o; $("st-sn").textContent = L(o)||""; };
  function answersUI(){ $("sn-answers").innerHTML = S
      ? opts(S.m).map(o=>`<button type="button" data-a="${o}">${S.m==="a"?o:ARROW[o]}</button>`).join("") + `<button type="button" data-a="?">${LANG==="pl"?"Nie widzę":"Can't see"}</button>`
      : ""; }
  function blank(){ A.fit(); const g=A.ctx; g.fillStyle="#fff"; g.fillRect(0,0,A.w,A.h); return g; }
  function idle(){ const g=blank(); g.fillStyle="#555"; g.font="15px "+css("--font-body"); g.textAlign="center"; g.textBaseline="middle";
    g.fillText(LANG==="pl"?"Skalibruj ekran powyżej i wybierz Start":"Calibrate the screen above and choose Start", A.w/2, A.h/2); }
  function draw(){ const g=blank(), h=S.lv[S.li].px, x=(A.w-h)/2, y=(A.h-h)/2;
    g.fillStyle="#000"; g.strokeStyle="#000"; if(S.m==="a") drawSloan(g,S.cur,x,y,h); else drawE(g,S.cur,x,y,h); }
  function start(m){ A.fit(); const ppm=Cal.ppm(), d=Cal.dist();
    const lv = SN_LEVELS.map(x => ({x, px:snMm(x,d)*ppm}));
    let li = lv.findIndex(l => l.px <= A.h*0.8); if(li<0) li=lv.length-1;
    S = {m, lv, li, startLi:li, k:0, ok:0, bad:0, res:[], rts:[], prev:null, cur:null, t0:0, d, ppm, limited:false};
    if(lv[li].px < 5){ S=null; status({pl:"Z tej odległości ekran nie pokaże nawet największych znaków poprawnie. Sprawdź kalibrację.",en:"At this distance the screen can't show even the largest symbols correctly. Check the calibration."}); return; }
    answersUI(); next(); }
  function next(){ const o=opts(S.m).filter(x=>x!==S.prev); S.cur=o[Math.floor(Math.random()*o.length)]; S.prev=S.cur; S.t0=performance.now(); draw();
    const x=S.lv[S.li].x; status({pl:`Poziom 20/${x} · znak ${S.k+1} z maks. 5 · odpowiadaj klawiaturą lub przyciskami`, en:`Level 20/${x} · symbol ${S.k+1} of max. 5 · answer with the keyboard or the buttons`}); }
  function answer(a){ if(!S) return; S.rts.push(performance.now()-S.t0);
    if(a===S.cur) S.ok++; else S.bad++; S.k++;
    if(S.ok>=3 || S.bad>=3){ const pass=S.ok>=3; S.res.push({x:S.lv[S.li].x, ok:S.ok, n:S.k, pass});
      if(!pass) return finish();
      const ni=S.li+1; if(ni>=S.lv.length) return finish();
      if(S.lv[ni].px < 5){ S.limited=true; return finish(); }
      S.li=ni; S.k=0; S.ok=0; S.bad=0; }
    next(); }
  function finish(){ const passed=S.res.filter(r=>r.pass), task = S.m==="a" ? SnA : SnB;
    task.R = { mode:S.m, distanceM:S.d, pxPerMm:S.ppm, best: passed.length ? passed[passed.length-1].x : null, startLevel:S.lv[S.startLi].x,
      levels:S.res, limited:S.limited, rts:S.rts, h20mm:snMm(20,S.d), h20px:snMm(20,S.d)*S.ppm };
    S=null; answersUI(); task.render(task.R); setSummary(task); markDone("wzrok"); status({pl:"Gotowe. Wynik poniżej.",en:"Done. Result below."}); idle(); }
  $("sn-go-a").addEventListener("click", () => start("a"));
  $("sn-go-b").addEventListener("click", () => start("b"));
  $("sn-answers").addEventListener("click", e => { const b=e.target.closest("button[data-a]"); if(b) answer(b.dataset.a); });
  document.addEventListener("keydown", e => {
    if(!S || $("tab-wzrok").hidden || /^(INPUT|TEXTAREA)$/.test(document.activeElement && document.activeElement.tagName)) return;
    const k=e.key;
    if(S.m==="a" && k.length===1 && /[a-z]/i.test(k)){ e.preventDefault(); answer(k.toUpperCase()); }
    else if(S.m==="b"){ const m={ArrowRight:"right",ArrowLeft:"left",ArrowUp:"up",ArrowDown:"down"}[k]; if(m){ e.preventDefault(); answer(m); } }
  });
  return { show(){ if(S) draw(); else idle(); }, onLang(){ status(st); answersUI(); if(!S) idle(); } };
})();

// Tablice barwne w stylu Ishihary — generowane na nowo przy każdym starcie
const Plates = (() => {
  const A = new Arena("cv-ish"), N=6, inp=$("ish-input");
  const NUMS = [2,3,5,6,7,8,9,15,16,26,29,35,42,45,57,73,74,96,97];
  let S=null, st=null;
  const self = { tab:"wzrok", key:"tablice-barwne", grid:"cards-ish", sumId:"sum-ish", R:null, title:{pl:"Tablice barwne",en:"Colour plates"}, specs:[
    {id:"ish-score", title:{pl:"Rozpoznane tablice",en:"Plates read"}, unit:{pl:`z ${N} testowych`,en:`of ${N} test plates`},
     rows:[["demo",{pl:"tablica pokazowa",en:"demonstration plate"}]],
     how:{pl:"Każda tablica jest generowana na nowo: losowo rozmieszczone kropki różnej wielkości. Kropki liczby mają odcienie pomarańczowo-czerwone, tło jest zielono-oliwkowe, a jasność obu grup losuję z tego samego zakresu, więc liczbę odróżnia tylko odcień. To pary barw, które osoby z najczęstszymi zaburzeniami widzenia barw (czerwono-zielonymi) odbierają jako podobne. Pierwsza tablica jest pokazowa: ciemna liczba na jasnym tle, którą powinien przeczytać każdy.",
          en:"Every plate is generated fresh: randomly placed dots of different sizes. The number's dots are orange-red, the background is green-olive, and the lightness of both groups is drawn from the same range, so only hue separates the number. These are colour pairs that people with the most common (red-green) colour vision deficiencies see as similar. The first plate is a demonstration: a dark number on a light background that everyone should read."}},
    {id:"ish-list", title:{pl:"Tablice",en:"Plates"}, chips:[["list",null]],
     how:{pl:"Pokazana liczba → Twoja odpowiedź. „—” oznacza „nie widzę liczby”.",en:"Number shown → your answer. “—” means “I can't see a number”."}},
    {id:"ish-rt", title:{pl:"Czas odpowiedzi",en:"Response time"}, unit:U.ms_med, rows:[R_MEAN],
     how:{pl:"Od pokazania tablicy do zatwierdzenia odpowiedzi.",en:"From showing a plate to submitting your answer."}}
  ]};
  const status = o => { st=o; $("st-ish").textContent = L(o)||""; };
  const rnd = (a,b) => a + Math.random()*(b-a);
  function plate(num, demo){
    A.fit(); const g=A.ctx, W=A.w, cx=W/2, cy=W/2, R=W/2-3, sc=W/380;
    g.clearRect(0,0,W,W); g.fillStyle="#f3eee4"; g.beginPath(); g.arc(cx,cy,R,0,2*Math.PI); g.fill();
    const m=document.createElement("canvas"); m.width=m.height=Math.ceil(W); const mg=m.getContext("2d");
    mg.font=`700 ${Math.round(W*(String(num).length>1?0.46:0.56))}px ${css("--font-body")}`; mg.textAlign="center"; mg.textBaseline="middle";
    mg.fillText(String(num), W/2, W/2+W*0.02); const md=mg.getImageData(0,0,m.width,m.height).data;
    const inFig = (x,y) => { const xi=Math.round(x), yi=Math.round(y); return xi>=0 && yi>=0 && xi<m.width && yi<m.height && md[(yi*m.width+xi)*4+3]>110; };
    const CELL=20*sc, grid=new Map(), dots=[], key=(i,j)=>i+","+j;
    for(let t=0; t<40000 && dots.length<2600; t++){
      const r=(2.4+Math.random()*Math.random()*7.5)*sc, a=Math.random()*2*Math.PI, rr=Math.sqrt(Math.random())*(R-r-2);
      const x=cx+rr*Math.cos(a), y=cy+rr*Math.sin(a), ci=Math.floor(x/CELL), cj=Math.floor(y/CELL);
      let ok=true;
      for(let i=ci-1;i<=ci+1&&ok;i++) for(let j=cj-1;j<=cj+1&&ok;j++){ const c=grid.get(key(i,j)); if(c) for(const d of c) if(Math.hypot(d.x-x,d.y-y) < d.r+r+1.2*sc){ ok=false; break; } }
      if(!ok) continue;
      const d={x,y,r}; dots.push(d); const k=key(ci,cj); if(!grid.has(k)) grid.set(k,[]); grid.get(k).push(d);
    }
    for(const d of dots){
      const fig = inFig(d.x,d.y);
      let col;
      if(demo) col = fig ? `hsl(220 22% ${rnd(28,38)}%)` : `hsl(${rnd(32,46)} 70% ${rnd(62,74)}%)`;
      else col = fig ? `hsl(${rnd(12,30)} ${rnd(52,66)}% ${rnd(48,64)}%)` : `hsl(${rnd(72,98)} ${rnd(28,42)}% ${rnd(48,64)}%)`;
      g.fillStyle=col; g.beginPath(); g.arc(d.x,d.y,d.r,0,2*Math.PI); g.fill();
    }
  }
  function idle(){ A.fit(); if(!A.w) return; const g=A.ctx, W=A.w; g.clearRect(0,0,W,W); g.fillStyle=css("--bg"); g.beginPath(); g.arc(W/2,W/2,W/2-3,0,2*Math.PI); g.fill();
    g.fillStyle=css("--muted"); g.font="14px "+css("--font-body"); g.textAlign="center"; g.textBaseline="middle"; g.fillText(LANG==="pl"?"Kliknij „Start”":"Click “Start”", W/2, W/2); }
  const setForm = on => { inp.disabled=!on; $("ish-ok").disabled=!on; $("ish-none").disabled=!on; if(on){ inp.value=""; inp.focus(); } };
  function start(){
    const pool=[...NUMS].sort(()=>Math.random()-0.5);
    S = { plates:[{num:12, demo:true}, ...pool.slice(0,N).map(n=>({num:n, demo:false}))], i:0, ans:[], t0:0 };
    show(); }
  function show(){ const p=S.plates[S.i]; plate(p.num, p.demo); S.t0=performance.now(); setForm(true);
    status(p.demo ? {pl:`Tablica 1 z ${S.plates.length} (pokazowa): jaką liczbę widzisz?`,en:`Plate 1 of ${S.plates.length} (demonstration): what number do you see?`}
                  : {pl:`Tablica ${S.i+1} z ${S.plates.length}: jaką liczbę widzisz?`,en:`Plate ${S.i+1} of ${S.plates.length}: what number do you see?`}); }
  function submit(a){ if(!S) return; const p=S.plates[S.i];
    S.ans.push({ demo:p.demo, shown:p.num, answer:a, correct:a===String(p.num), rt:performance.now()-S.t0 });
    S.i++; if(S.i<S.plates.length) return show();
    const test=S.ans.filter(x=>!x.demo);
    self.R = { plates:S.ans, testCorrect:test.filter(x=>x.correct).length, testN:test.length, demoCorrect:S.ans[0].correct, rts:S.ans.map(x=>x.rt) };
    S=null; setForm(false); idle(); self.render(self.R); setSummary(self); markDone("wzrok"); status({pl:"Gotowe. Wynik poniżej.",en:"Done. Result below."}); }
  $("ish-go").addEventListener("click", start);
  $("ish-ok").addEventListener("click", () => submit(inp.value.trim()));
  $("ish-none").addEventListener("click", () => submit(""));
  inp.addEventListener("keydown", e => { if(e.key==="Enter"){ e.preventDefault(); submit(inp.value.trim()); } });
  self.render = R => {
    setMain("ish-score", R.testCorrect); setRow("ish-score","demo", R.demoCorrect ? (LANG==="pl"?"odczytana":"read") : (LANG==="pl"?"nieodczytana":"not read"));
    setHTML("ish-list","list", R.plates.map(x=>`<span class="chip ${x.correct?"ok":"no"}">${x.demo?(LANG==="pl"?"pokaz ":"demo "):""}${x.shown} → ${x.answer===""?"—":esc(x.answer)} ${x.correct?"✓":"✗"}</span>`).join(""));
    setMain("ish-rt", nf(median(R.rts))); setRow("ish-rt","mean", ms(mean(R.rts))); };
  self.summary = R => LANG==="pl"
    ? `<p>Odczytałeś <strong>${R.testCorrect} z ${R.testN}</strong> tablic testowych.${R.demoCorrect ? "" : " Nie odczytałeś tablicy pokazowej, którą powinien widzieć każdy, więc wynik jest niewiarygodny: sprawdź jasność, tryb nocny i kolory ekranu."}</p><p><strong>To nie jest badanie widzenia barw.</strong> Tablice są generowane przez stronę, nie są oryginalnymi tablicami Ishihary i nie zostały sprawdzone na osobach z zaburzeniami widzenia barw, a kolory na ekranie różnią się od drukowanych. Jeśli chcesz rzetelnie sprawdzić widzenie barw, zrób to u okulisty lub optometrysty.</p>`
    : `<p>You read <strong>${R.testCorrect} of ${R.testN}</strong> test plates.${R.demoCorrect ? "" : " You didn't read the demonstration plate that everyone should see, so the result is unreliable: check brightness, night mode and screen colours."}</p><p><strong>This is not a colour vision test.</strong> The plates are generated by the page, are not original Ishihara plates and have not been checked with people who have colour vision deficiencies, and screen colours differ from printed ones. For a reliable colour vision check, see an ophthalmologist or optometrist.</p>`;
  self.show = () => { if(!S) idle(); };
  self.onLang = () => { status(st); if(!S) idle(); };
  return self;
})();

export { SLOAN, SN_LEVELS, snMm, snMetric, drawSloan, drawE, Cal, snSpecs, snTask, SnA, SnB, SnRun, Plates };
