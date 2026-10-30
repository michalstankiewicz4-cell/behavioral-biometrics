// Test: pseudowords
import { U, setMain, setRow, setSummary } from "../core/cards.js";
import { classifyErrors, errTypesSpec, renderErrTypes, topErr } from "../core/errors.js";
import { $, esc, median, ms, nf, pct } from "../core/utils.js";
import { LANG } from "../i18n/index.js";
import { markDone } from "../main.js";
import { Typing } from "./typing.js";

// =====================================================================
// 8a. PSEUDOSŁOWA — przepisywanie słów bez znaczenia
// =====================================================================
const PSEUDO = {
  pl:"brodwiel klepsa żumoch dryzgot szawiłka pąbro chrzęsk dziwolik bezgrot ółmica",
  en:"blorft drimple quazzle snepto grawlish thrumb ploddit vexrin bidquor fendrel"
};
const Pseudo = (() => {
  const ta=$("ps-input"), tgt=$("ps-target"); let S, T;
  const self = { tab:"litery", key:"pseudoslowa", grid:"cards-ps", sumId:"sum-ps", R:null, title:{pl:"Pseudosłowa",en:"Pseudowords"}, specs:[
    {id:"ps-speed", title:{pl:"Tempo",en:"Pace"}, unit:{pl:"znaków/min",en:"chars/min"},
     rows:[["real",{pl:"zwykły tekst (etap 1)",en:"normal text (stage 1)"}],["ratio",{pl:"pseudosłowa ÷ zwykły tekst",en:"pseudowords ÷ normal text"}],["dur",{pl:"czas całkowity",en:"total time"}]],
     how:{pl:"<code>znaki ÷ minuty</code>, od pierwszego znaku do ostatniej zmiany tekstu. Jeśli zrobiłeś etap 1, porównuję z tempem zwykłego tekstu. Znane słowa piszemy z pamięci całymi kawałkami, a pseudosłowa trzeba składać litera po literze, więc zwykle idą wolniej. Badacze pisania porównują właśnie takie zadania o różnym stopniu „słowności”.",
          en:"<code>characters ÷ minutes</code>, from the first character to the last change of the text. If you did stage 1, I compare with your normal-text pace. Familiar words are typed from memory in whole chunks, while pseudowords must be built letter by letter, so they are usually slower. Writing researchers compare exactly such tasks with different levels of “wordness”."}},
    {id:"ps-word", title:{pl:"Czas na słowo",en:"Time per word"}, unit:U.ms_med,
     rows:[["slow",{pl:"najwolniejsze",en:"slowest"}],["fast",{pl:"najszybsze",en:"fastest"}]],
     how:{pl:"Od wpisania pierwszej litery słowa do wpisania jego ostatniej litery (pierwsze podejście, bez poprawek).",
          en:"From typing a word's first letter to typing its last letter (first attempt, before corrections)."}},
    {id:"ps-err", title:{pl:"Błędy",en:"Errors"}, unit:{pl:"wpisanych błędnie",en:"typed wrong"},
     rows:[["rate",{pl:"odsetek błędnych znaków",en:"share of wrong characters"}],["left",{pl:"niepoprawione na końcu",en:"left uncorrected"}]],
     how:{pl:"Jak w etapie 1: każdy wstawiony znak porównuję ze znakiem wzorca na tej samej pozycji.",
          en:"As in stage 1: every inserted character is compared with the reference character at the same position."}},
    errTypesSpec("ps-types")
  ]};
  const fresh = () => ({ ins:[], startT:null, lastT:null, typed:0, err:0, prevLen:0, done:false, timer:null });
  function renderTarget(){ const v=ta.value; let h="";
    for(let i=0;i<T.length;i++){ const cls = i<v.length ? (v[i]===T[i]?"done":"bad") : (i===v.length?"cur":"");
      h += `<span class="${cls}">${T[i]===" "?"&nbsp;":esc(T[i])}</span>` + (T[i]===" "?"<wbr>":""); }
    tgt.innerHTML=h; }
  function renderLive(){ const t = S.startT==null ? 0 : ((S.done?S.lastT:performance.now())-S.startT)/1000;
    $("ps-time").textContent = nf(t,1)+" s"; $("ps-err").textContent = S.err; }
  ta.addEventListener("keydown", e => { if(S.done) return;
    if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End","PageUp","PageDown","Enter"].includes(e.key)){ e.preventDefault(); return; }
    if(S.startT==null && e.key.length===1){ S.startT=performance.now(); $("ps-finish").disabled=false; S.timer=setInterval(renderLive,100); } });
  ta.addEventListener("beforeinput", e => { if(S.done || ["insertFromPaste","insertFromDrop","insertLineBreak","insertParagraph"].includes(e.inputType)) e.preventDefault(); });
  ta.addEventListener("input", e => { const v=ta.value, t=performance.now(); S.lastT=t;
    if(e.inputType && e.inputType.startsWith("insert") && e.data){ const st=v.length-e.data.length;
      for(let i=0;i<e.data.length;i++){ S.typed++; S.ins.push({pos:st+i, ch:e.data[i], t}); if(e.data[i]!==T[st+i]) S.err++; } }
    S.prevLen=v.length; renderTarget(); renderLive(); if(v===T) finish(); });
  const toEnd = () => { const n=ta.value.length; ta.setSelectionRange(n,n); };
  ["click","focus","select","mouseup"].forEach(ev => ta.addEventListener(ev, toEnd));
  ta.addEventListener("paste", e => e.preventDefault()); ta.addEventListener("drop", e => e.preventDefault());
  $("ps-finish").addEventListener("click", () => { if(S.startT!=null) finish(); });
  $("ps-reset").addEventListener("click", reset);
  function finish(){ if(S.done) return; S.done=true; clearInterval(S.timer); if(S.lastT==null) S.lastT=performance.now();
    ta.disabled=true; $("ps-finish").disabled=true; renderLive();
    const v=ta.value, dur=(S.lastT-S.startT)/1000;
    const first={}; for(const x of S.ins) if(!(x.pos in first)) first[x.pos]=x.t;
    const words=[]; let a=0;
    for(const w of T.split(" ")){ const b=a+w.length-1; if(first[a]!=null && first[b]!=null) words.push({w, ms:first[b]-first[a]}); a=b+2; }
    self.R = { cpm:v.length/(dur/60), dur, realCpm: Typing.R ? Typing.R.cpm : null,
      words, err:S.err, errRate:S.typed?S.err/S.typed:NaN, left:[...v].filter((c,i)=>c!==T[i]).length+Math.max(0,T.length-v.length),
      errTypes:classifyErrors(S.ins, T) };
    self.render(self.R); setSummary(self); markDone("litery"); }
  self.render = R => {
    setMain("ps-speed", nf(R.cpm)); setRow("ps-speed","real", R.realCpm ? nf(R.realCpm) : (LANG==="pl"?"brak (zrób etap 1)":"none (do stage 1)"));
    setRow("ps-speed","ratio", R.realCpm ? nf(R.cpm/R.realCpm,2)+"×" : "—"); setRow("ps-speed","dur", nf(R.dur,1)+" s");
    const ws=[...R.words].sort((x,y)=>y.ms-x.ms);
    setMain("ps-word", nf(median(R.words.map(w=>w.ms))));
    setRow("ps-word","slow", ws.length ? `${ws[0].w} · ${ms(ws[0].ms)}` : "—"); setRow("ps-word","fast", ws.length ? `${ws[ws.length-1].w} · ${ms(ws[ws.length-1].ms)}` : "—");
    setMain("ps-err", R.err); setRow("ps-err","rate", pct(R.errRate,1)); setRow("ps-err","left", R.left);
    renderErrTypes("ps-types", R.errTypes); };
  self.summary = R => { const ws=[...R.words].sort((x,y)=>y.ms-x.ms), top=topErr(R.errTypes);
    if(LANG==="pl") return `<p>Pseudosłowa przepisałeś w tempie <strong>${nf(R.cpm)} znaków/min</strong>`
      + (R.realCpm ? `, a zwykły tekst z etapu 1 w tempie ${nf(R.realCpm)} znaków/min (stosunek ${nf(R.cpm/R.realCpm,2)}).` : ". Zrób etap 1, żeby porównać to ze zwykłym tekstem.")
      + (ws.length ? ` Najdłużej pisałeś słowo „${esc(ws[0].w)}” (${ms(ws[0].ms)}).` : "") + `</p>`
      + `<p>Błędnie wpisanych znaków: ${R.err}` + (top ? `, najczęstszy rodzaj błędu: ${top}.` : ".") + ` To opis tego, co zrobiłeś, a nie ocena.</p>`;
    return `<p>You retyped the pseudowords at <strong>${nf(R.cpm)} chars/min</strong>`
      + (R.realCpm ? `, and the normal text from stage 1 at ${nf(R.realCpm)} chars/min (ratio ${nf(R.cpm/R.realCpm,2)}).` : ". Do stage 1 to compare it with normal text.")
      + (ws.length ? ` The word that took longest was “${esc(ws[0].w)}” (${ms(ws[0].ms)}).` : "") + `</p>`
      + `<p>Characters typed wrong: ${R.err}` + (top ? `, most common error type: ${top}.` : ".") + ` This describes what you did; it is not an assessment.</p>`; };
  function reset(){ if(S && S.timer) clearInterval(S.timer); S=fresh(); T=PSEUDO[LANG];
    ta.maxLength=T.length; ta.value=""; ta.disabled=false; $("ps-finish").disabled=true; renderTarget(); renderLive(); }
  self.reset=reset; self.onLang = () => { if(!S.done) reset(); else renderLive(); };
  S=fresh(); T=PSEUDO[LANG];
  return self;
})();

export { PSEUDO, Pseudo };
