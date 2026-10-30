// Test: memory
import { Arena } from "../core/arena.js";
import { U, setHTML, setMain, setRow, setSummary } from "../core/cards.js";
import { LANGHOOKS, LEAVE, SHOW } from "../core/registry.js";
import { $, css } from "../core/utils.js";
import { D, L, LANG } from "../i18n/index.js";
import { markDone } from "../main.js";
import { Click } from "./target-clicking.js";

// =====================================================================
// PAMIĘĆ — zakres cyfr (digit span) i bloki Corsiego
// =====================================================================
function spanSpecs(id, typ){ return [
  {id, title:{pl:"Zakres pamięci",en:"Memory span"}, unit:{pl:"elementów",en:"items"}, rows:[["tries",{pl:"prób",en:"attempts"}],["typ",{pl:"orientacyjnie u dorosłych",en:"typical for adults"}]],
   how:{pl:"Zaczynam od krótkiego ciągu; po poprawnym powtórzeniu ciąg wydłuża się o 1. Na każdej długości są 2 szanse; dwa błędy z rzędu kończą test. Zakres to najdłuższy poprawnie powtórzony ciąg.",
        en:"It starts with a short sequence; after a correct repeat the sequence grows by 1. Each length has 2 chances; two errors in a row end the test. The span is the longest correctly repeated sequence."}},
  {id:id+"-l", title:{pl:"Próby",en:"Attempts"}, chips:[["list",null]], how:{pl:"Długość ciągu i wynik każdej próby.",en:"Sequence length and result of each attempt."}}
];}
const spanRender = (id, R) => { setMain(id, R.span); setRow(id,"tries", R.attempts.length); setRow(id,"typ", R.typical);
  setHTML(id+"-l","list", R.attempts.map(a=>`<span class="chip ${a.ok?"ok":"no"}">${a.len} ${a.ok?"✓":"✗"}</span>`).join("")); };
function spanStep(S, ok){ S.attempts.push({len:S.len, ok}); if(ok){ S.span=Math.max(S.span,S.len); S.len++; S.fails=0; return S.len<=S.max; } S.fails++; return S.fails<2; }

const Digits = (() => { const inp=$("ds-input"), box=$("ds-show"); let S=null, st=null;
  const self = { tab:"pamiec", key:"pamiec-cyfry", grid:"cards-ds", sumId:"sum-ds", R:null, title:{pl:"Pamięć: ciąg cyfr",en:"Memory: digit span"}, specs:spanSpecs("ds-span") };
  const status = o => { st=o; $("st-ds").textContent = L(o)||""; };
  function play(){ inp.disabled=true; $("ds-ok").disabled=true; inp.value=""; const seq=[]; while(seq.length<S.len){ const d=Math.floor(Math.random()*10); if(d!==seq[seq.length-1]) seq.push(d); } S.seq=seq;
    status({pl:`Zapamiętaj ${S.len} cyfr…`,en:`Remember ${S.len} digits…`}); let i=0;
    const step=()=>{ if(!S) return; if(i>=seq.length){ box.textContent=""; inp.disabled=false; $("ds-ok").disabled=false; inp.focus(); status({pl:"Wpisz cyfry w tej samej kolejności i naciśnij Enter.",en:"Type the digits in the same order and press Enter."}); return; }
      box.textContent=seq[i]; S.timer=setTimeout(()=>{ box.textContent=""; i++; S.timer=setTimeout(step,200); }, 800); };
    S.timer=setTimeout(step,600); }
  function submit(){ if(!S||inp.disabled) return; const ok=inp.value.replace(/\D/g,"")===S.seq.join("");
    box.textContent = ok ? "✓" : "✗"; if(spanStep(S,ok)) setTimeout(play,700); else finish(); }
  function finish(){ inp.disabled=true; $("ds-ok").disabled=true; self.R={ span:S.span, attempts:S.attempts, typical:"7 ± 2" }; S=null; status({pl:"Gotowe.",en:"Done."});
    self.render(self.R); setSummary(self); markDone("pamiec"); }
  self.render = R => spanRender("ds-span", R);
  self.summary = R => LANG==="pl"
    ? `<p>Twój zakres pamięci cyfr to <strong>${R.span}</strong>. Klasycznie podaje się, że dorośli zapamiętują ok. 7 ± 2 elementów naraz („magiczna liczba” Millera), choć nowsze badania wskazują raczej na ok. 4 porcje informacji, gdy nie da się ich grupować.</p>`
    : `<p>Your digit span is <strong>${R.span}</strong>. Classically adults hold about 7 ± 2 items at once (Miller's “magical number”), although newer research suggests closer to 4 chunks when grouping isn't possible.</p>`;
  $("ds-go").addEventListener("click", () => { if(S) clearTimeout(S.timer); S={len:3, max:12, span:0, fails:0, attempts:[]}; play(); });
  $("ds-ok").addEventListener("click", submit);
  inp.addEventListener("keydown", e => { if(e.key==="Enter"){ e.preventDefault(); submit(); } });
  LEAVE.pamiec = () => { if(S){ clearTimeout(S.timer); S=null; box.textContent=""; status(null); } if(Corsi.leave) Corsi.leave(); };
  LANGHOOKS.push(() => status(st));
  return self;
})();

const Corsi = (() => { const POS=[[.12,.70],[.26,.28],[.40,.62],[.52,.18],[.60,.48],[.74,.78],[.84,.30],[.30,.88],[.90,.62]], SZ=46;
  const A=new Arena("cv-corsi"); let S=null, st=null;
  const self = { tab:"pamiec", key:"pamiec-corsi", grid:"cards-corsi", sumId:"sum-corsi", R:null, title:{pl:"Pamięć: bloki Corsiego",en:"Memory: Corsi blocks"}, specs:spanSpecs("cs-span") };
  const status = o => { st=o; $("st-corsi").textContent = L(o)||""; };
  const at = i => ({x:POS[i][0]*A.w, y:POS[i][1]*A.h});
  function draw(lit){ A.fit(); if(!A.w) return; A.clear(); const g=A.ctx;
    POS.forEach((_,i)=>{ const p=at(i); g.fillStyle = i===lit ? css("--warn") : css("--accent"); g.globalAlpha = i===lit ? 1 : 0.75; g.fillRect(p.x-SZ/2,p.y-SZ/2,SZ,SZ); g.globalAlpha=1; });
    if(!S) A.label(LANG==="pl"?"Kliknij „Start”":"Click “Start”", 24); }
  function play(){ S.input=null; const seq=[]; while(seq.length<S.len){ const b=Math.floor(Math.random()*POS.length); if(!seq.includes(b)) seq.push(b); } S.seq=seq;
    status({pl:`Patrz: ${S.len} bloków…`,en:`Watch: ${S.len} blocks…`}); let i=0;
    const step=()=>{ if(!S) return; if(i>=seq.length){ draw(); S.input=[]; status({pl:"Kliknij bloki w tej samej kolejności.",en:"Click the blocks in the same order."}); return; }
      draw(seq[i]); S.timer=setTimeout(()=>{ draw(); i++; S.timer=setTimeout(step,250); }, 700); };
    draw(); S.timer=setTimeout(step,600); }
  A.c.addEventListener("pointerdown", e => { if(!S||!S.input) return; e.preventDefault(); const p=A.pos(e);
    const i=POS.findIndex((_,k)=>{ const q=at(k); return Math.abs(p.x-q.x)<=SZ/2 && Math.abs(p.y-q.y)<=SZ/2; }); if(i<0) return;
    S.input.push(i); draw(i); setTimeout(()=>{ if(S) draw(); },180);
    if(S.input.length===S.seq.length){ const ok=S.input.every((v,k)=>v===S.seq[k]); S.input=null; status(ok?{pl:"Dobrze ✓",en:"Correct ✓"}:{pl:"Źle ✗",en:"Wrong ✗"});
      if(spanStep(S,ok)) S.timer=setTimeout(play,900); else finish(); } });
  function finish(){ self.R={ span:S.span, attempts:S.attempts, typical:LANG==="pl"?"ok. 5–6":"about 5–6" }; S=null; status({pl:"Gotowe.",en:"Done."}); draw();
    self.render(self.R); setSummary(self); markDone("pamiec"); }
  self.render = R => spanRender("cs-span", R);
  self.summary = R => LANG==="pl"
    ? `<p>Twój zakres pamięci przestrzennej (bloki Corsiego) to <strong>${R.span}</strong>. U dorosłych zwykle wynosi ok. 5–6, czyli nieco mniej niż zakres cyfr.</p>`
    : `<p>Your spatial memory span (Corsi blocks) is <strong>${R.span}</strong>. For adults it is usually about 5–6, slightly less than the digit span.</p>`;
  $("cs-go").addEventListener("click", () => { if(S) clearTimeout(S.timer); A.fit(); S={len:2, max:9, span:0, fails:0, attempts:[]}; play(); });
  self.leave = () => { if(S){ clearTimeout(S.timer); S=null; status(null); } };
  SHOW.pamiec = () => draw();
  LANGHOOKS.push(() => { status(st); if(!S) draw(); });
  return self;
})();

export { spanSpecs, spanRender, spanStep, Digits, Corsi };
