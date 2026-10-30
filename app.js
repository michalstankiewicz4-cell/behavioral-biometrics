"use strict";
/*
 * Odcisk klawiatury i myszki — jawne demo biometrii behawioralnej.
 * Wszystko działa lokalnie: brak fetch/XHR/WebSocket, brak ciasteczek i localStorage.
 */
(() => {
const $ = id => document.getElementById(id);
const REPO = "https://github.com/michalstankiewicz4-cell/behavioral-biometrics";

// ---------- język ----------
function detectLang(){
  const list = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || "en"];
  for(const l of list){ const s = String(l).toLowerCase(); if(s.startsWith("pl")) return "pl"; if(s.startsWith("en")) return "en"; }
  return "en";
}
let LANG = detectLang();
const L = o => (o && typeof o === "object" && "pl" in o) ? o[LANG] : o;

const D = {
pl:{
  title:"Odcisk klawiatury i myszki",
  tag:"BIOMETRIA BEHAWIORALNA",
  lang_btn:"English", lang_label:"Przełącz na angielski",
  lead:"Biometria behawioralna rozpoznaje ludzi po tym, <strong>jak</strong> coś robią: jak piszą, jak ruszają myszką, jak klikają. Zwykle działa ukryta w tle (np. w bankowości). Tutaj jest <strong>jawna</strong>: wykonujesz sześć krótkich zadań, a strona pokazuje, co zmierzyła i jak to policzyła.",
  amateur_h:"Amatorski projekt",
  amateur_p:"To hobbystyczne demo, które pokazuje, jak działa biometria behawioralna. <strong>Nie jest narzędziem naukowym ani medycznym.</strong> Progi w ocenach są orientacyjne, a wyniki mocno zależą od sprzętu (klawiatura, myszka czy touchpad), zmęczenia i wprawy. <strong>Nie sugeruj się wynikiem</strong>: nie wyciągaj z niego wniosków o sobie ani o innych i nie podejmuj na jego podstawie żadnych decyzji.",
  data_h:"Gdzie trafiają dane",
  data_list:`<li><strong>Nigdzie, wszystko działa lokalnie.</strong> Pomiary (czasy klawiszy, ruchy myszki) zbiera i liczy JavaScript w Twojej przeglądarce. Są tylko w pamięci tej karty i znikają po odświeżeniu lub zamknięciu strony.</li>
<li><strong>Nic nie jest wysyłane na GitHub.</strong> Strona to statyczne pliki na GitHub Pages: GitHub tylko je dostarcza, nie ma tu serwera, który mógłby cokolwiek odebrać.</li>
<li>Kod nie zawiera <code>fetch</code>, <code>XMLHttpRequest</code>, WebSocketów, formularzy, ciasteczek, <code>localStorage</code> ani analityki. Możesz to sprawdzić w <a href="${REPO}">kodzie źródłowym</a> albo w zakładce Sieć (Network) w narzędziach deweloperskich.</li>
<li>Jak przy każdej stronie: przy wczytaniu GitHub (hosting) i Google (czcionki Google Fonts) widzą standardowe dane żądania, np. adres IP i typ przeglądarki. Nie widzą niczego z tego, co wpisujesz ani jak ruszasz myszką.</li>`,
  tab_type:"Pisanie", tab_click:"Klikanie celów", tab_track:"Śledzenie punktu", tab_drag:"Przeciąganie", tab_draw:"Rysowanie po śladzie", tab_dbl:"Podwójne kliknięcie", tab_res:"Wyniki",
  type_h:"1. Pisanie", type_desc:"Przepisz tekst. Mierzę, jak długo trzymasz klawisze, ile trwają przerwy między nimi, gdzie się mylisz i jak poprawiasz.",
  type_label:"Pisz tutaj. Wklejanie jest zablokowane, kursor zawsze stoi na końcu.",
  underlay:"Tekst jako podkładka (wzorzec w tle pola, piszesz po nim)",
  mobile:"Wygląda na to, że używasz ekranu dotykowego. Klawiatury ekranowe podają niedokładne czasy klawiszy, a zadania z myszką mierzą palec zamiast ręki na myszce. Najlepiej użyć komputera.",
  live_time:"czas", live_chars:"znaki", live_err:"błędy",
  finish:"Zakończ teraz", restart:"Od nowa", start:"Start",
  hint:"Doszedłeś do końca, ale w tekście zostały błędy. Popraw je albo kliknij „Zakończ teraz”.",
  click_h:"2. Klikanie celów", click_desc:"Kółka pojawiają się w losowych miejscach. Klikaj je jak najszybciej i najcelniej. Mierzę czas reakcji, prostoliniowość ruchu, przestrzelenia i przytrzymanie przycisku.",
  track_h:"3. Śledzenie punktu", track_desc:"Przez 15 sekund trzymaj kursor na poruszającej się kropce. Mierzę odległość od kropki, opóźnienie i płynność ruchu ręki.",
  drag_h:"4. Przeciąganie", drag_desc:"Przeciągnij kwadrat do ramki, i tak 6 razy. Mierzę stabilność ręki przy wciśniętym przycisku i precyzję upuszczenia.",
  draw_h:"5. Rysowanie po śladzie", draw_desc:"Obrysuj okrąg, a potem linię, trzymając wciśnięty przycisk. Mierzę odchylenie od wzoru i drżenie.",
  dbl_h:"6. Podwójne kliknięcie", dbl_desc:"Kliknij dwukrotnie każde z 8 kółek. Mierzę odstęp między kliknięciami, przytrzymanie i to, czy kursor przy tym drgnął.",
  next_click:"Dalej: klikanie celów →", next_track:"Dalej: śledzenie punktu →", next_drag:"Dalej: przeciąganie →", next_draw:"Dalej: rysowanie →", next_dbl:"Dalej: podwójne kliknięcie →", next_res:"Zobacz wyniki →",
  res_h:"Wyniki", res_empty:"Nie ukończyłeś jeszcze żadnego zadania.",
  res_note:"Przypomnienie: to amatorski projekt. Wyniki są orientacyjne, nie sugeruj się nimi.",
  sum_empty:"Ocena pojawi się po wykonaniu zadania. Poniżej już teraz widać, co i jak będzie mierzone.",
  sum_fine:"Progi są orientacyjne. Wynik z jednego krótkiego testu to profil, a nie diagnoza.",
  how:"Jak to liczę",
  idle:"Kliknij „Start”",
  done_canvas:"Gotowe — wyniki poniżej",
  footer_code:`Kod źródłowy: <a href="${REPO}">${REPO.replace("https://","")}</a>. Strona nie używa bibliotek i nie łączy się z żadnym serwerem.`,
  author:"autor: Michał Stankiewicz · stworzone przy użyciu vibecodingu"
},
en:{
  title:"Keyboard and mouse fingerprint",
  tag:"BEHAVIORAL BIOMETRICS",
  lang_btn:"Polski", lang_label:"Switch to Polish",
  lead:"Behavioral biometrics recognises people by <strong>how</strong> they do things: how they type, move the mouse and click. It usually runs hidden in the background (e.g. in banking). Here it is <strong>out in the open</strong>: you do six short tasks and the page shows what it measured and how it calculated it.",
  amateur_h:"Amateur project",
  amateur_p:"This is a hobby demo showing how behavioral biometrics works. <strong>It is not a scientific or medical tool.</strong> The thresholds in the evaluations are rough, and the results depend heavily on your hardware (keyboard, mouse or touchpad), tiredness and practice. <strong>Don't take the results seriously</strong>: don't draw conclusions about yourself or others from them and don't base any decisions on them.",
  data_h:"Where your data goes",
  data_list:`<li><strong>Nowhere, everything runs locally.</strong> The measurements (key timings, mouse movements) are collected and computed by JavaScript in your browser. They live only in this tab's memory and disappear when you refresh or close the page.</li>
<li><strong>Nothing is sent to GitHub.</strong> The page is static files on GitHub Pages: GitHub only delivers them, and there is no server here that could receive anything.</li>
<li>The code contains no <code>fetch</code>, <code>XMLHttpRequest</code>, WebSockets, forms, cookies, <code>localStorage</code> or analytics. You can check this in the <a href="${REPO}">source code</a> or in the Network tab of your browser's developer tools.</li>
<li>As with any website: when the page loads, GitHub (hosting) and Google (Google Fonts) see standard request data such as your IP address and browser type. They see nothing of what you type or how you move the mouse.</li>`,
  tab_type:"Typing", tab_click:"Target clicking", tab_track:"Dot tracking", tab_drag:"Dragging", tab_draw:"Tracing shapes", tab_dbl:"Double click", tab_res:"Results",
  type_h:"1. Typing", type_desc:"Retype the text. I measure how long you hold keys, the gaps between them, where you make mistakes and how you correct them.",
  type_label:"Type here. Pasting is blocked and the caret always stays at the end.",
  underlay:"Text as underlay (reference shown behind the field, you type over it)",
  mobile:"It looks like you're using a touch screen. On-screen keyboards report inaccurate key timings, and the mouse tasks would measure a finger instead of a hand on a mouse. A computer works best.",
  live_time:"time", live_chars:"chars", live_err:"errors",
  finish:"Finish now", restart:"Restart", start:"Start",
  hint:"You reached the end, but there are errors left in the text. Fix them or click “Finish now”.",
  click_h:"2. Target clicking", click_desc:"Circles appear at random spots. Click them as fast and as accurately as you can. I measure reaction time, path straightness, overshoots and button hold time.",
  track_h:"3. Dot tracking", track_desc:"For 15 seconds keep the cursor on a moving dot. I measure distance from the dot, lag and how smooth your hand movement is.",
  drag_h:"4. Dragging", drag_desc:"Drag the square into the frame, 6 times. I measure hand steadiness while the button is held and how precisely you drop.",
  draw_h:"5. Tracing shapes", draw_desc:"Trace a circle and then a line while holding the button. I measure deviation from the shape and tremor.",
  dbl_h:"6. Double click", dbl_desc:"Double-click each of 8 circles. I measure the interval between clicks, hold time and whether the cursor moved in between.",
  next_click:"Next: target clicking →", next_track:"Next: dot tracking →", next_drag:"Next: dragging →", next_draw:"Next: tracing →", next_dbl:"Next: double click →", next_res:"See results →",
  res_h:"Results", res_empty:"You haven't finished any task yet.",
  res_note:"Reminder: this is an amateur project. The results are rough, don't take them seriously.",
  sum_empty:"The evaluation appears after you finish the task. Below you can already see what will be measured and how.",
  sum_fine:"Thresholds are rough. A result from one short test is a profile, not a diagnosis.",
  how:"How I calculate it",
  idle:"Click “Start”",
  done_canvas:"Done — results below",
  footer_code:`Source code: <a href="${REPO}">${REPO.replace("https://","")}</a>. The page uses no libraries and connects to no server.`,
  author:"author: Michał Stankiewicz · made with vibe coding"
}};

// ---------- statystyka i formatowanie ----------
const mean = a => a.length ? a.reduce((s,x)=>s+x,0)/a.length : NaN;
const median = a => { if(!a.length) return NaN; const b=[...a].sort((x,y)=>x-y), m=b.length>>1; return b.length%2?b[m]:(b[m-1]+b[m])/2; };
const sd = a => { if(a.length<2) return NaN; const m=mean(a); return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)); };
const nf = (x,d=0) => Number.isFinite(x) ? x.toLocaleString(LANG==="pl"?"pl-PL":"en-US",{minimumFractionDigits:d,maximumFractionDigits:d}) : "—";
const ms = x => Number.isFinite(x) ? nf(x)+" ms" : "—";
const px = (x,d=1) => Number.isFinite(x) ? nf(x,d)+" px" : "—";
const pct = (x,d=0) => Number.isFinite(x) ? nf(100*x,d)+" %" : "—";
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const hyp = (ax,ay,bx,by) => Math.hypot(ax-bx, ay-by);
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

// Drżenie: odchylenie punktów od średniej kroczącej (okno 2h+1 próbek), zwraca sumę kwadratów i liczbę
function tremorAcc(seg, h=3){
  let sum=0, n=0;
  for(let i=h;i<seg.length-h;i++){
    let mx=0,my=0; for(let j=i-h;j<=i+h;j++){ mx+=seg[j].x; my+=seg[j].y; }
    mx/=2*h+1; my/=2*h+1;
    sum += (seg[i].x-mx)**2 + (seg[i].y-my)**2; n++;
  }
  return {sum,n};
}
const tremorRMS = segs => { let s=0,n=0; for(const seg of segs){ const r=tremorAcc(seg); s+=r.sum; n+=r.n; } return n ? Math.sqrt(s/n) : NaN; };
// Zatrzymania: odcinki z prędkością < 20 px/s trwające ≥ 150 ms
function countPauses(seg){
  let c=0, a=null, b=null;
  for(let i=1;i<seg.length;i++){
    const dt=seg[i].t-seg[i-1].t; if(dt<=0) continue;
    const v=hyp(seg[i].x,seg[i].y,seg[i-1].x,seg[i-1].y)/(dt/1000);
    if(v<20){ if(a==null) a=seg[i-1].t; b=seg[i].t; }
    else { if(a!=null && b-a>=150) c++; a=null; }
  }
  if(a!=null && b-a>=150) c++;
  return c;
}
const pathLen = pts => { let s=0; for(let i=1;i<pts.length;i++) s+=hyp(pts[i].x,pts[i].y,pts[i-1].x,pts[i-1].y); return s; };

// ---------- karty miar ----------
const UNITS = {};
function buildCards(gridId, specs){
  $(gridId).innerHTML = specs.map(c => {
    UNITS[c.id] = c.unit;
    return `<article class="card"><h3>${L(c.title)}</h3>`
      + (c.unit ? `<div class="val" id="v-${c.id}">—<small> ${L(c.unit)}</small></div>` : "")
      + (c.rows ? `<div class="rows">${c.rows.map(([k,l])=>`<div><span>${L(l)}</span><span id="v-${c.id}-${k}">—</span></div>`).join("")}</div>` : "")
      + (c.chips||[]).map(([k,l])=>`${l?`<div class="sub">${L(l)}</div>`:""}<div class="chips" id="v-${c.id}-${k}"><span class="chip">—</span></div>`).join("")
      + `<details><summary>${D[LANG].how}</summary><p>${L(c.how)}</p></details></article>`;
  }).join("");
}
const setMain = (id,v) => { const e=$("v-"+id); if(e) e.innerHTML = `${v}<small> ${L(UNITS[id])}</small>`; };
const setRow = (id,k,v) => { const e=$(`v-${id}-${k}`); if(e) e.textContent = v; };
const setHTML = (id,k,v) => { const e=$(`v-${id}-${k}`); if(e) e.innerHTML = v; };
function setSummary(task){
  const e=$(task.sumId);
  if(!task.R){ e.classList.add("empty"); e.innerHTML = `<p>${D[LANG].sum_empty}</p>`; return; }
  e.classList.remove("empty");
  e.innerHTML = task.summary(task.R) + `<p class="fine">${D[LANG].sum_fine}</p>`;
}
const U = { ms_med:{pl:"ms (mediana)",en:"ms (median)"} };
const R_MEAN = ["mean",{pl:"średnia",en:"mean"}], R_SD = ["sd",{pl:"odchylenie std.",en:"std. deviation"}], R_N = ["n",{pl:"liczba pomiarów",en:"samples"}];

// ---------- pole zadania (canvas) ----------
class Arena{
  constructor(id){ this.c=$(id); this.ctx=this.c.getContext("2d"); this.w=0; this.h=0; }
  fit(){ const r=this.c.getBoundingClientRect(); if(!r.width) return; const d=window.devicePixelRatio||1;
    this.w=r.width; this.h=r.height; this.c.width=Math.round(r.width*d); this.c.height=Math.round(r.height*d); this.ctx.setTransform(d,0,0,d,0,0); }
  pos(e){ const r=this.c.getBoundingClientRect(); return {x:e.clientX-r.left, y:e.clientY-r.top, t:e.timeStamp}; }
  moves(e){ const l = e.getCoalescedEvents ? e.getCoalescedEvents() : []; return (l.length?l:[e]).map(x=>this.pos(x)); }
  clear(){ this.ctx.clearRect(0,0,this.w,this.h); }
  dot(x,y,r,color,fill=true,lw=1.5){ const g=this.ctx; g.beginPath(); g.arc(x,y,r,0,Math.PI*2);
    if(fill){ g.fillStyle=color; g.fill(); } else { g.strokeStyle=color; g.lineWidth=lw; g.stroke(); } }
  label(s,y){ const g=this.ctx; g.fillStyle=css("--muted"); g.font="15px "+css("--font-body"); g.textAlign="center"; g.textBaseline="middle"; g.fillText(s,this.w/2,y??this.h/2); }
  rnd(m){ return {x:m+Math.random()*(this.w-2*m), y:m+Math.random()*(this.h-2*m)}; }
}

// Wspólny szkielet zadań z myszką
function mouseTask(o){
  const A = new Arena(o.canvas);
  const t = { tab:o.tab, grid:o.grid, sumId:o.sumId, specs:o.specs, R:null, S:null, A, st:null, title:o.title,
    summary:o.summary, render:o.render };
  t.status = obj => { t.st = obj; $(o.statusId).textContent = L(obj) || ""; };
  t.idle = () => { A.fit(); A.clear(); A.label(t.R ? D[LANG].done_canvas : D[LANG].idle); };
  t.abort = () => { if(t.S && t.S.raf) cancelAnimationFrame(t.S.raf); if(t.S && t.S.phase!=="done"){ t.S=null; t.status(null); } t.idle(); };
  t.redraw = () => { if(t.S && t.S.phase!=="done" && o.draw) o.draw(t); else t.idle(); };
  t.finish = () => { t.S.phase="done"; t.R = o.analyse(t); t.render(t.R); setSummary(t); t.status({pl:"Gotowe.",en:"Done."}); t.idle(); markDone(t.tab); };
  $(o.go).addEventListener("click", () => { t.abort(); A.fit(); o.start(t); });
  const c = A.c;
  c.addEventListener("pointerdown", e => { if(t.S && t.S.phase!=="done"){ e.preventDefault(); o.down && o.down(t, A.pos(e), e); } });
  c.addEventListener("pointermove", e => { if(t.S && t.S.phase!=="done") o.move && o.move(t, A.moves(e), e); });
  c.addEventListener("pointerup", e => { if(t.S && t.S.phase!=="done") o.up && o.up(t, A.pos(e), e); });
  c.addEventListener("dblclick", e => e.preventDefault());
  c.addEventListener("contextmenu", e => e.preventDefault());
  return t;
}

// =====================================================================
// 1. PISANIE
// =====================================================================
const TEXT = {
  pl:"Każdy człowiek pisze na klawiaturze w nieco inny sposób. Jedni przytrzymują klawisze dłużej, inni szybciej przeskakują między literami. Ten rytm jest prawie tak charakterystyczny jak podpis, a wszystkie pomiary na tej stronie odbywają się wyłącznie w Twojej przeglądarce.",
  en:"Everyone types on a keyboard in a slightly different way. Some people hold the keys longer, others jump between letters faster. This rhythm is almost as distinctive as a signature, and every measurement on this page happens only in your browser."
};
const Typing = (() => {
  const PAUSE = 1000;
  const ta=$("input"), tgt=$("target");
  let S, TARGET;
  const self = { tab:"pisanie", grid:"cards-type", sumId:"sum-type", R:null, title:{pl:"Pisanie",en:"Typing"}, specs:[
    {id:"t-speed", title:{pl:"Prędkość",en:"Speed"}, unit:{pl:"słów/min",en:"words/min"},
     rows:[["cpm",{pl:"znaków na minutę",en:"characters per minute"}],["dur",{pl:"czas całkowity",en:"total time"}]],
     how:{pl:"Czas biegnie od pierwszego wciśnięcia klawisza do ostatniej zmiany tekstu. Słowa na minutę to przyjęta konwencja <code>(liczba znaków ÷ 5) ÷ minuty</code>, czyli „słowo” to 5 znaków razem ze spacjami.",
          en:"Time runs from the first key press to the last change of the text. Words per minute follows the usual convention <code>(characters ÷ 5) ÷ minutes</code>, so a “word” is 5 characters including spaces."}},
    {id:"t-dwell", title:{pl:"Czas przytrzymania",en:"Dwell time"}, unit:U.ms_med, rows:[R_MEAN,R_SD,R_N],
     how:{pl:"Dla każdego klawisza znakowego: <code>keyup − keydown</code>, czyli jak długo palec trzymał klawisz. Pomijam Shift, Alt, Backspace i automatyczne powtórzenia. Czasy pochodzą z <code>performance.now()</code>.",
          en:"For every character key: <code>keyup − keydown</code>, i.e. how long the finger held the key. Shift, Alt, Backspace and auto-repeat are skipped. Times come from <code>performance.now()</code>."}},
    {id:"t-flight", title:{pl:"Czas przelotu",en:"Flight time"}, unit:U.ms_med, rows:[R_MEAN,["neg",{pl:"nakładanie klawiszy",en:"key overlap"}],R_N],
     how:{pl:"Dla dwóch kolejnych klawiszy znakowych: <code>keydown(następny) − keyup(poprzedni)</code>. Wartość ujemna oznacza, że następny klawisz wcisnąłeś, zanim puściłeś poprzedni; „nakładanie” to odsetek takich par. Pomijam pary rozdzielone pauzą powyżej 1 s.",
          en:"For two consecutive character keys: <code>keydown(next) − keyup(previous)</code>. A negative value means you pressed the next key before releasing the previous one; “overlap” is the share of such pairs. Pairs separated by a pause over 1 s are skipped."}},
    {id:"t-cv", title:{pl:"Równomierność rytmu",en:"Rhythm consistency"}, unit:{pl:"CV",en:"CV"}, rows:[["mean",{pl:"średni odstęp",en:"mean interval"}],R_SD],
     how:{pl:"Biorę odstępy <code>keydown → keydown</code> między kolejnymi znakami (bez pauz powyżej 1 s) i liczę współczynnik zmienności <code>CV = odchylenie ÷ średnia</code>. Im mniejszy, tym równiej piszesz. Orientacyjnie: poniżej 0,35 rytm równy, 0,35–0,6 umiarkowany, powyżej 0,6 nierówny.",
          en:"I take the <code>keydown → keydown</code> intervals between consecutive characters (no pauses over 1 s) and compute the coefficient of variation <code>CV = std ÷ mean</code>. Lower means a steadier rhythm. Roughly: below 0.35 steady, 0.35–0.6 moderate, above 0.6 uneven."}},
    {id:"t-err", title:{pl:"Błędy",en:"Errors"}, unit:{pl:"wpisanych błędnie",en:"typed wrong"}, rows:[["rate",{pl:"odsetek błędnych znaków",en:"share of wrong characters"}],["left",{pl:"niepoprawione na końcu",en:"left uncorrected"}]],
     how:{pl:"Każdy wstawiony znak porównuję z tekstem wzorcowym na tej samej pozycji. Niezgodny znak to błąd, nawet jeśli później go poprawisz. Odsetek to <code>błędne ÷ wszystkie wpisane znaki</code>.",
          en:"Each inserted character is compared with the reference text at the same position. A mismatch counts as an error even if you fix it later. The share is <code>wrong ÷ all typed characters</code>."}},
    {id:"t-del", title:{pl:"Poprawki",en:"Corrections"}, unit:{pl:"usuniętych znaków",en:"characters deleted"},
     rows:[["imm",{pl:"natychmiastowe",en:"immediate"}],["late",{pl:"opóźnione",en:"delayed"}],["lag",{pl:"średnie opóźnienie",en:"average delay"}],["none",{pl:"usunięcia poprawnego tekstu",en:"deleting correct text"}]],
     how:{pl:"Ciąg kolejnych usunięć to jedna poprawka. W chwili jej rozpoczęcia sprawdzam, gdzie jest pierwszy błąd. Jeśli to ostatni wpisany znak, poprawka jest natychmiastowa. Jeśli po błędzie napisałeś jeszcze <i>n</i> znaków, jest opóźniona o <i>n</i>. Jeśli błędu nie było, to usunięcie poprawnego tekstu.",
          en:"A run of consecutive deletions is one correction. When it starts I look for the first error. If it is the last typed character, the correction is immediate. If you typed <i>n</i> more characters after the error, it is delayed by <i>n</i>. If there was no error, it counts as deleting correct text."}},
    {id:"t-pause", title:{pl:"Pauzy",en:"Pauses"}, unit:{pl:"pauz ≥ 1 s",en:"pauses ≥ 1 s"}, rows:[["max",{pl:"najdłuższa",en:"longest"}],["sum",{pl:"łącznie",en:"total"}]], chips:[["list",null]],
     how:{pl:"Pauza to odstęp <code>keydown → keydown</code> dłuższy niż 1 s. Przy każdej pokazuję słowo, przed którym (lub w którym) wystąpiła.",
          en:"A pause is a <code>keydown → keydown</code> gap longer than 1 s. For each one I show the word it happened before (or inside)."}},
    {id:"t-pairs", title:{pl:"Pary liter",en:"Letter pairs"}, chips:[["slow",{pl:"najwolniejsze",en:"slowest"}],["fast",{pl:"najszybsze",en:"fastest"}]],
     how:{pl:"Dla dwóch kolejnych, poprawnie wpisanych liter mierzę odstęp <code>keydown → keydown</code> i grupuję po parze (np. „sz”). Pokazuję średnią dla par, które wystąpiły co najmniej 2 razy; w nawiasie liczba wystąpień.",
          en:"For two consecutive correctly typed letters I measure the <code>keydown → keydown</code> gap and group by pair (e.g. “th”). I show the mean for pairs that occurred at least twice; the number in brackets is the count."}}
  ]};

  const fresh = () => ({ strokes:[], startT:null, lastT:null, errTyped:0, typed:0, deletions:0, inDelete:false,
    corr:{imm:0, late:0, lags:[], none:0}, done:false, timer:null, prevLen:0 });
  const firstMismatch = v => { for(let i=0;i<v.length;i++) if(v[i]!==TARGET[i]) return i; return -1; };
  const isCharKey = e => e.key.length === 1;
  function wordAt(p){
    if(p>=TARGET.length) p=TARGET.length-1;
    while(p<TARGET.length-1 && TARGET[p]===" ") p++;
    let a=p, b=p;
    while(a>0 && TARGET[a-1]!==" ") a--;
    while(b<TARGET.length && TARGET[b]!==" ") b++;
    return TARGET.slice(a,b).replace(/[.,]/g,"");
  }
  function renderTarget(){
    const v = ta.value; let html = "";
    for(let i=0;i<TARGET.length;i++){
      const ch = TARGET[i]===" " ? "&nbsp;" : esc(TARGET[i]);
      let cls = "";
      if(i < v.length) cls = v[i]===TARGET[i] ? "done" : "bad";
      else if(i === v.length) cls = "cur";
      html += `<span class="${cls}">${ch}</span>` + (TARGET[i]===" " ? "<wbr>" : "");
    }
    tgt.innerHTML = html;
    // podkładka: wpisana część (niewidoczna, z zaznaczeniem błędów) + reszta wzorca
    let g = "";
    for(let i=0;i<v.length;i++) g += `<span class="typed${v[i]!==TARGET[i]?" bad":""}">${esc(v[i])}</span>`;
    if(v.length < TARGET.length) g += `<span class="cur">${esc(TARGET[v.length])}</span>` + esc(TARGET.slice(v.length+1));
    $("ghost").innerHTML = g;
  }
  const under = $("underlay");
  under.addEventListener("change", () => {
    $("typebox").classList.toggle("under", under.checked);
    tgt.classList.toggle("hidden", under.checked);
    ta.focus(); toEndSoon();
  });
  const toEndSoon = () => setTimeout(() => { const n=ta.value.length; ta.setSelectionRange(n,n); }, 0);
  function renderLive(){
    const t = S.startT==null ? 0 : ((S.done?S.lastT:performance.now()) - S.startT)/1000;
    $("l-time").textContent = nf(t,1)+" s";
    $("l-chars").textContent = ta.value.length + " / " + TARGET.length;
    $("l-err").textContent = S.errTyped;
  }

  ta.addEventListener("keydown", e => {
    if(S.done) return;
    const nav = ["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End","PageUp","PageDown","Enter"];
    if(nav.includes(e.key)){ e.preventDefault(); return; }
    if(e.repeat) return;
    const t = performance.now();
    if(S.startT==null && (isCharKey(e) || e.key==="Backspace")){
      S.startT = t; $("finish").disabled = false; S.timer = setInterval(renderLive, 100);
    }
    const pos = ta.value.length;
    S.strokes.push({ code:e.code, key:e.key, down:t, up:null, pos, isChar:isCharKey(e), isBack:e.key==="Backspace",
      correct: isCharKey(e) && e.key===TARGET[pos] });
  });
  ta.addEventListener("keyup", e => {
    const t = performance.now();
    for(let i=S.strokes.length-1;i>=0;i--){ const s=S.strokes[i]; if(s.code===e.code && s.up==null){ s.up=t; break; } }
  });
  ta.addEventListener("beforeinput", e => {
    if(S.done){ e.preventDefault(); return; }
    if(["insertFromPaste","insertFromDrop","insertLineBreak","insertParagraph"].includes(e.inputType)){ e.preventDefault(); return; }
    if(e.inputType.startsWith("delete")){
      if(!S.inDelete){
        S.inDelete = true;
        const v = ta.value, fm = firstMismatch(v);
        if(fm === -1) S.corr.none++;
        else { const lag = v.length-1-fm; if(lag===0) S.corr.imm++; else { S.corr.late++; S.corr.lags.push(lag); } }
      }
    } else if(e.inputType.startsWith("insert")) S.inDelete = false;
  });
  ta.addEventListener("input", e => {
    S.lastT = performance.now();
    const v = ta.value;
    if(e.inputType && e.inputType.startsWith("insert") && e.data){
      const start = v.length - e.data.length;
      for(let i=0;i<e.data.length;i++){ S.typed++; if(e.data[i] !== TARGET[start+i]) S.errTyped++; }
    } else if(e.inputType && e.inputType.startsWith("delete")){
      S.deletions += Math.max(0, S.prevLen - v.length);
    }
    S.prevLen = v.length;
    renderTarget(); renderLive();
    if(v === TARGET) finish();
    else $("hint").classList.toggle("hidden", v.length < TARGET.length);
  });
  const toEnd = () => { const n=ta.value.length; ta.setSelectionRange(n,n); };
  ["click","focus","select","mouseup"].forEach(ev => ta.addEventListener(ev, toEnd));
  ta.addEventListener("paste", e => e.preventDefault());
  ta.addEventListener("drop", e => e.preventDefault());
  $("finish").addEventListener("click", () => { if(S.startT!=null) finish(); });
  $("reset").addEventListener("click", reset);

  function finish(){
    if(S.done) return;
    S.done = true; clearInterval(S.timer);
    if(S.lastT==null) S.lastT = performance.now();
    ta.disabled = true; $("finish").disabled = true; $("hint").classList.add("hidden");
    renderLive();
    self.R = analyse(); self.render(self.R); setSummary(self); markDone("pisanie");
  }
  function analyse(){
    const v = ta.value, dur = (S.lastT - S.startT)/1000;
    const chars = S.strokes.filter(s=>s.isChar);
    const dwell = chars.filter(s=>s.up!=null).map(s=>s.up-s.down);
    const seq = S.strokes.filter(s=>s.isChar||s.isBack);
    const flight=[], dd=[], pauses=[], pairs={};
    for(let i=1;i<seq.length;i++){
      const a=seq[i-1], b=seq[i], gap=b.down-a.down;
      if(gap >= PAUSE) pauses.push({ms:gap, word:wordAt(b.pos)});
      if(!(a.isChar && b.isChar) || gap >= PAUSE) continue;
      dd.push(gap);
      if(a.up!=null) flight.push(b.down - a.up);
      if(a.correct && b.correct && b.pos===a.pos+1){
        const p = TARGET.substr(a.pos,2).toLowerCase();
        if(/^\p{L}{2}$/u.test(p)) (pairs[p] ||= []).push(gap);
      }
    }
    const ranked = Object.entries(pairs).filter(([,a])=>a.length>=2).map(([p,a])=>({p,m:mean(a),n:a.length})).sort((x,y)=>y.m-x.m);
    return { wpm:(v.length/5)/(dur/60), cpm:v.length/(dur/60), dur, dwell, flight, dd, pauses, ranked,
      errTyped:S.errTyped, errRate:S.typed?S.errTyped/S.typed:NaN,
      left:[...v].filter((c,i)=>c!==TARGET[i]).length, missing:Math.max(0,TARGET.length-v.length),
      deletions:S.deletions, corr:{...S.corr} };
  }
  self.render = R => {
    setMain("t-speed", nf(R.wpm)); setRow("t-speed","cpm",nf(R.cpm)); setRow("t-speed","dur",nf(R.dur,1)+" s");
    setMain("t-dwell", nf(median(R.dwell))); setRow("t-dwell","mean",ms(mean(R.dwell))); setRow("t-dwell","sd",ms(sd(R.dwell))); setRow("t-dwell","n",R.dwell.length);
    setMain("t-flight", nf(median(R.flight))); setRow("t-flight","mean",ms(mean(R.flight)));
    setRow("t-flight","neg", R.flight.length ? pct(R.flight.filter(x=>x<0).length/R.flight.length) : "—"); setRow("t-flight","n",R.flight.length);
    setMain("t-cv", nf(sd(R.dd)/mean(R.dd),2)); setRow("t-cv","mean",ms(mean(R.dd))); setRow("t-cv","sd",ms(sd(R.dd)));
    setMain("t-err", R.errTyped); setRow("t-err","rate",pct(R.errRate,1));
    setRow("t-err","left", R.left + (R.missing ? (LANG==="pl"?` (+${R.missing} niedopisanych)`:` (+${R.missing} not typed)`) : ""));
    setMain("t-del", R.deletions); setRow("t-del","imm",R.corr.imm); setRow("t-del","late",R.corr.late);
    setRow("t-del","lag", R.corr.lags.length ? nf(mean(R.corr.lags),1)+(LANG==="pl"?" znaku":" chars") : "—"); setRow("t-del","none",R.corr.none);
    setMain("t-pause", R.pauses.length);
    setRow("t-pause","max", R.pauses.length ? nf(Math.max(...R.pauses.map(p=>p.ms))/1000,1)+" s" : "—");
    setRow("t-pause","sum", R.pauses.length ? nf(R.pauses.reduce((s,p)=>s+p.ms,0)/1000,1)+" s" : "—");
    setHTML("t-pause","list", R.pauses.map(p=>`<span class="chip">${nf(p.ms/1000,1)} s · ${esc(p.word)}</span>`).join(""));
    const chip = (r,c) => `<span class="chip ${c}">${esc(r.p)} ${nf(r.m)} ms (${r.n})</span>`;
    const none = `<span class="chip">${LANG==="pl"?"za mało danych":"not enough data"}</span>`;
    setHTML("t-pairs","slow", R.ranked.length ? R.ranked.slice(0,5).map(r=>chip(r,"slow")).join("") : none);
    setHTML("t-pairs","fast", R.ranked.length ? R.ranked.slice(-5).reverse().map(r=>chip(r,"fast")).join("") : none);
  };
  self.summary = R => {
    const cv = sd(R.dd)/mean(R.dd), w = R.wpm;
    const overlap = R.flight.length ? R.flight.filter(x=>x<0).length/R.flight.length : 0;
    const tot = R.corr.imm + R.corr.late;
    if(LANG==="pl"){
      const speed = w<25?"powoli":w<40?"w umiarkowanym tempie":w<60?"szybko":"bardzo szybko";
      const rhythm = !Number.isFinite(cv)?"":cv<0.35?"Rytm masz równy, odstępy między klawiszami są podobne.":cv<0.6?"Rytm masz umiarkowanie zmienny: niektóre fragmenty idą płynnie, inne wolniej.":"Rytm masz nierówny: tempo wyraźnie skacze między fragmentami.";
      const corr = tot===0 ? (R.errTyped?"Błędów nie poprawiałeś.":"Nie musiałeś niczego poprawiać.") : R.corr.imm>=R.corr.late ? "Błędy poprawiasz zwykle od razu, zaraz po ich zrobieniu." : "Błędy wychwytujesz zwykle z opóźnieniem, po napisaniu kolejnych znaków.";
      const roll = overlap>0.25 ? " Często wciskasz kolejny klawisz, zanim puścisz poprzedni, co jest typowe dla wprawnych osób." : "";
      return `<p>Piszesz <strong>${speed}</strong> (${nf(w)} słów/min; przeciętny wynik dorosłej osoby to ok. 35–45). ${rhythm}</p><p>${corr} Błędnie wpisałeś ${pct(R.errRate||0,1)} znaków.${roll}</p>`;
    }
    const speed = w<25?"slowly":w<40?"at a moderate pace":w<60?"fast":"very fast";
    const rhythm = !Number.isFinite(cv)?"":cv<0.35?"Your rhythm is steady: the gaps between keys are similar.":cv<0.6?"Your rhythm is moderately variable: some parts flow, others are slower.":"Your rhythm is uneven: the pace clearly jumps between parts.";
    const corr = tot===0 ? (R.errTyped?"You didn't correct your errors.":"You didn't need to correct anything.") : R.corr.imm>=R.corr.late ? "You usually fix errors immediately, right after making them." : "You usually catch errors late, after typing more characters.";
    const roll = overlap>0.25 ? " You often press the next key before releasing the previous one, which is typical of practised typists." : "";
    return `<p>You type <strong>${speed}</strong> (${nf(w)} words/min; a typical adult scores about 35–45). ${rhythm}</p><p>${corr} You typed ${pct(R.errRate||0,1)} of characters wrong.${roll}</p>`;
  };
  function reset(){
    if(S && S.timer) clearInterval(S.timer);
    S = fresh(); TARGET = TEXT[LANG];
    ta.maxLength = TARGET.length; ta.value = ""; ta.disabled = false;
    $("finish").disabled = true; $("hint").classList.add("hidden");
    renderTarget(); renderLive();
  }
  self.reset = reset;
  self.onLang = () => { if(!S.done) reset(); else renderLive(); };
  return self;
})();

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

// =====================================================================
// zakładki, wyniki, język
// =====================================================================
const TASKS = [Typing, Click, Track, Drag, Draw, Dbl];
const MOUSE = [Click, Track, Drag, Draw, Dbl];
const TABS = ["pisanie","klikanie","sledzenie","przeciaganie","rysowanie","dwuklik","wyniki"];

function markDone(tab){ document.querySelector(`#tabs a[data-tab="${tab}"]`).classList.add("done"); renderResults(); }
function renderResults(){
  const done = TASKS.filter(t=>t.R);
  $("results").innerHTML = done.length
    ? done.map(t=>`<article><h3>${L(t.title)}</h3>${t.summary(t.R)}</article>`).join("")
    : `<p class="lead">${D[LANG].res_empty}</p>`;
}
function showTab(){
  let h = location.hash.slice(1); if(!TABS.includes(h)) h = "pisanie";
  document.querySelectorAll("[data-panel]").forEach(p => p.hidden = p.dataset.panel !== h);
  document.querySelectorAll("#tabs a").forEach(a => { if(a.dataset.tab===h) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  MOUSE.forEach(t => { if(t.tab !== h) t.abort(); });
  const cur = MOUSE.find(t => t.tab === h);
  if(cur){ requestAnimationFrame(() => { cur.A.fit(); cur.redraw(); }); }
}
function applyLang(){
  document.documentElement.lang = LANG;
  document.title = D[LANG].title;
  document.querySelectorAll("[data-i18n]").forEach(el => { el.innerHTML = D[LANG][el.dataset.i18n]; });
  const b=$("lang"); b.textContent = D[LANG].lang_btn; b.setAttribute("aria-label", D[LANG].lang_label);
  $("tabs").setAttribute("aria-label", LANG==="pl" ? "Etapy" : "Stages");
  TASKS.forEach(t => { buildCards(t.grid, t.specs); if(t.R) t.render(t.R); setSummary(t); });
  MOUSE.forEach(t => { t.status(t.st); if(t.A.w) t.redraw(); });
  Typing.onLang();
  renderResults();
}
$("lang").addEventListener("click", () => { LANG = LANG==="pl" ? "en" : "pl"; applyLang(); });
window.addEventListener("hashchange", showTab);
window.addEventListener("resize", () => { const cur = MOUSE.find(t => !$( "tab-"+t.tab).hidden); if(cur){ cur.A.fit(); cur.redraw(); } });
if(matchMedia("(pointer: coarse)").matches) $("mobile").classList.remove("hidden");

Typing.reset();
applyLang();
showTab();
})();
