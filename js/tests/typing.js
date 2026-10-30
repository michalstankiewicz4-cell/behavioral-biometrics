// Test: typing
import { R_MEAN, R_N, R_SD, U, setHTML, setMain, setRow, setSummary } from "../core/cards.js";
import { base, classifyErrors, errTypesSpec, renderErrTypes } from "../core/errors.js";
import { $, esc, mean, median, ms, nf, pct, sd } from "../core/utils.js";
import { L, LANG } from "../i18n/index.js";
import { markDone } from "../main.js";

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
          en:"For two consecutive correctly typed letters I measure the <code>keydown → keydown</code> gap and group by pair (e.g. “th”). I show the mean for pairs that occurred at least twice; the number in brackets is the count."}},
    errTypesSpec("t-types")
  ]};

  const fresh = () => ({ strokes:[], ins:[], startT:null, lastT:null, errTyped:0, typed:0, deletions:0, inDelete:false,
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
  // położenie tekstu wzorcowego: nad polem / jako podkładka / pod polem
  document.querySelectorAll('input[name="txtpos"]').forEach(r => r.addEventListener("change", () => {
    const v = r.value, box = $("typebox");
    box.classList.toggle("under", v==="under");
    tgt.classList.toggle("hidden", v==="under");
    if(v==="below") box.after(tgt); else $("txtpos").after(tgt);
    if(!ta.disabled){ ta.focus(); toEndSoon(); }
  }));
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
      for(let i=0;i<e.data.length;i++){ S.typed++; S.ins.push({pos:start+i, ch:e.data[i]}); if(e.data[i] !== TARGET[start+i]) S.errTyped++; }
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
      errTyped:S.errTyped, errRate:S.typed?S.errTyped/S.typed:NaN, errTypes:classifyErrors(S.ins, TARGET), keys:keyStats(chars, S.ins, TARGET),
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
    renderErrTypes("t-types", R.errTypes);
    renderKbd(R.keys);
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


// ---------- mapa cieplna klawiatury ----------
const KBD_ROWS = ["1234567890-=","qwertyuiop[]","asdfghjkl;'","zxcvbnm,./"," "];
function keyStats(chars, ins, T){ const dw={}, err={};
  for(const s of chars) if(s.up!=null){ const k=base(s.key.toLowerCase()); (dw[k] ||= []).push(s.up-s.down); }
  for(const x of ins) if(T[x.pos]!==undefined && x.ch!==T[x.pos]){ const k=base(T[x.pos].toLowerCase()); err[k]=(err[k]||0)+1; }
  const dwell={}, n={}; for(const k in dw){ dwell[k]=mean(dw[k]); n[k]=dw[k].length; }
  return { dwell, n, err }; }
let KBD_MODE = "dwell";
function renderKbd(keys){ const el=$("kbd"); if(!el) return;
  const vals = KBD_MODE==="dwell" ? keys && keys.dwell : keys && keys.err;
  const nums = vals ? Object.values(vals) : []; const lo=nums.length?Math.min(...nums):0, hi=nums.length?Math.max(...nums):1;
  el.innerHTML = KBD_ROWS.map((row,ri) => `<div class="kr" style="padding-left:${[0,0.5,0.75,1.25,3.5][ri]*2.6}rem">` + [...row].map(k => {
    const v = vals ? vals[k] : undefined, has = v!==undefined;
    const t = has ? (KBD_MODE==="err" ? v/(hi||1) : (hi>lo ? (v-lo)/(hi-lo) : 0.5)) : 0;
    const label = k===" " ? (LANG==="pl"?"spacja":"space") : k;
    const val = has ? (KBD_MODE==="dwell" ? nf(v)+" ms" : String(v)) : "";
    const tip = has ? `${label}: ${val}` + (KBD_MODE==="dwell" ? ` (n=${keys.n[k]})` : "") : label;
    return `<span class="key${k===" "?" space":""}${has?" has":""}${t>0.6?" hot":""}" title="${esc(tip)}" style="--t:${(t*100).toFixed(0)}%"><b>${esc(label)}</b><small>${val}</small></span>`;
  }).join("") + `</div>`).join("");
}
document.querySelectorAll('input[name="kbdmode"]').forEach(r => r.addEventListener("change", () => { KBD_MODE=r.value; renderKbd(Typing.R && Typing.R.keys); }));

export { TEXT, Typing, KBD_ROWS, keyStats, KBD_MODE, renderKbd };
