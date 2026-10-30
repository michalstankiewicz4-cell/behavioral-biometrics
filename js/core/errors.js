// Klasyfikacja rodzajów błędów pisania
import { setHTML, setMain, setRow } from "./cards.js";
import { $, esc } from "./utils.js";
import { L, LANG } from "../i18n/index.js";

// ---------- rodzaje błędów (opis, nie ocena) ----------
const ERR_CATS = [
  ["space", {pl:"spacje",en:"spaces"}],
  ["case",  {pl:"wielka / mała litera",en:"upper / lower case"}],
  ["mirror",{pl:"litery lustrzane (b/d/p/q)",en:"mirror letters (b/d/p/q)"}],
  ["orth",  {pl:"ortografia (ó/u, rz/ż, ch/h, om/ą)",en:"Polish spelling (ó/u, rz/ż, ch/h, om/ą)"}],
  ["diac",  {pl:"ogonki (ą→a, ł→l…)",en:"diacritics (ą→a, ł→l…)"}],
  ["swap",  {pl:"przestawione litery",en:"swapped letters"}],
  ["skip",  {pl:"pominięta litera",en:"skipped letter"}],
  ["double",{pl:"podwojona litera",en:"doubled letter"}],
  ["adj",   {pl:"sąsiedni klawisz",en:"neighbouring key"}],
  ["other", {pl:"inne",en:"other"}]
];
const MIRROR = new Set(["bd","db","pq","qp","bp","pb","dq","qd"]);
const ORTH = new Set(["óu","uó","żr","rż","ch","hc","oą","ąo"]);
const BASE = {"ą":"a","ć":"c","ę":"e","ł":"l","ń":"n","ó":"o","ś":"s","ź":"z","ż":"z"};
const base = c => BASE[c] || c;
const KEYPOS = (() => { const m={}; [["1234567890",0],["qwertyuiop",0.5],["asdfghjkl",0.75],["zxcvbnm",1.25]]
  .forEach(([row,off],y) => [...row].forEach((k,x) => m[k]={x:x+off,y})); return m; })();
const adjacent = (a,b) => { const p=KEYPOS[base(a)], q=KEYPOS[base(b)]; return !!(p && q && p!==q && Math.hypot(p.x-q.x,p.y-q.y)<=1.3); };
// ins: lista wstawionych znaków w kolejności {pos, ch}; T: tekst wzorcowy
function classifyErrors(ins, T){
  const counts={}; ERR_CATS.forEach(([k])=>counts[k]=0); const examples=[];
  const sh = x => x===" " ? "␣" : x;
  const add = (k,ex) => { counts[k]++; if(examples.length<10) examples.push({k, ex}); };
  let prevErrPos = -9;
  for(let i=0;i<ins.length;i++){
    const {pos,ch}=ins[i], exp=T[pos];
    if(exp===undefined || ch===exp){ prevErrPos=-9; continue; }
    if(pos===prevErrPos+1){ prevErrPos=pos; continue; }   // kaskada po przesunięciu: liczę tylko pierwszy błąd w ciągu
    prevErrPos=pos;
    const e=exp.toLowerCase(), c=ch.toLowerCase(), nx=ins[i+1];
    if(exp===" " || ch===" ") add("space", `${sh(exp)}→${sh(ch)}`);
    else if(c===e) add("case", `${exp}→${ch}`);
    else if(MIRROR.has(e+c)) add("mirror", `${exp}→${ch}`);
    else if(ORTH.has(e+c)) add("orth", `${exp}→${ch}`);
    else if(base(e)===base(c)) add("diac", `${exp}→${ch}`);
    else if(ch===T[pos+1] && nx && nx.pos===pos+1 && nx.ch===exp){ add("swap", `${exp}${T[pos+1]}→${ch}${nx.ch}`); i++; prevErrPos=-9; }
    else if(ch===T[pos+1]) add("skip", `−${exp}`);
    else if(pos>0 && ch===T[pos-1]) add("double", `${T[pos-1]}${exp}→${T[pos-1]}${ch}`);
    else if(adjacent(e,c)) add("adj", `${exp}→${ch}`);
    else add("other", `${exp}→${ch}`);
  }
  return { counts, examples, total:Object.values(counts).reduce((a,b)=>a+b,0) };
}
const errTypesSpec = id => ({ id, title:{pl:"Rodzaje błędów",en:"Error types"}, unit:{pl:"sklasyfikowanych",en:"classified"},
  rows: ERR_CATS.map(([k,l]) => [k,l]), chips:[["ex",{pl:"przykłady (oczekiwane → wpisane)",en:"examples (expected → typed)"}]],
  how:{pl:"Każdy błędnie wpisany znak porównuję ze znakiem wzorca i sprawdzam po kolei: spacja, wielkość litery, litery lustrzane b/d/p/q, polska ortografia (ó/u, rz/ż, ch/h, om/ą), brak lub nadmiar ogonka, przestawienie dwóch liter, pominięcie litery, podwojenie poprzedniej litery, sąsiedni klawisz na klawiaturze QWERTY. Z ciągu kolejnych błędów liczę tylko pierwszy, bo następne są zwykle skutkiem przesunięcia. To opis, a nie ocena.",
       en:"Each wrongly typed character is compared with the reference and checked in order: space, letter case, mirror letters b/d/p/q, Polish spelling (ó/u, rz/ż, ch/h, om/ą), missing or extra diacritic, two swapped letters, skipped letter, doubled previous letter, neighbouring key on a QWERTY keyboard. In a run of consecutive errors only the first counts, as the rest usually come from the shift. This is a description, not an assessment."} });
function renderErrTypes(id, et){
  setMain(id, et.total);
  ERR_CATS.forEach(([k]) => setRow(id, k, et.counts[k]));
  setHTML(id, "ex", et.examples.length ? et.examples.map(x=>`<span class="chip">${esc(x.ex)}</span>`).join("") : `<span class="chip">${LANG==="pl"?"brak błędów":"no errors"}</span>`);
}
const topErr = et => { let best=null; for(const [k,l] of ERR_CATS) if(et.counts[k] && (!best || et.counts[k]>et.counts[best[0]])) best=[k,l]; return best ? L(best[1]) : null; };

export { ERR_CATS, MIRROR, ORTH, BASE, base, KEYPOS, adjacent, classifyErrors, errTypesSpec, renderErrTypes, topErr };
