// Test: stroop
import { R_MEAN, R_SD, U, setMain, setRow, setSummary } from "../core/cards.js";
import { LANGHOOKS, LEAVE, SHOW } from "../core/registry.js";
import { $, mean, median, ms, nf, sd } from "../core/utils.js";
import { L, LANG } from "../i18n/index.js";
import { markDone } from "../main.js";

// =====================================================================
// TEST STROOPA — nazwa koloru napisana innym kolorem
// =====================================================================
const Stroop = (() => { const N=24;
  const COLS = [{k:"red",hex:"#e5484d",pl:"CZERWONY",en:"RED"},{k:"green",hex:"#30a46c",pl:"ZIELONY",en:"GREEN"},{k:"blue",hex:"#3e8bff",pl:"NIEBIESKI",en:"BLUE"},{k:"yellow",hex:"#f5d90a",pl:"ŻÓŁTY",en:"YELLOW"}];
  let S=null, st=null;
  const self = { tab:"stroop", key:"stroop", grid:"cards-stroop", sumId:"sum-stroop", R:null, title:{pl:"Test Stroopa",en:"Stroop test"}, specs:[
    {id:"st-eff", title:{pl:"Efekt Stroopa",en:"Stroop effect"}, unit:{pl:"ms",en:"ms"}, rows:[["con",{pl:"zgodne (mediana)",en:"congruent (median)"}],["inc",{pl:"niezgodne (mediana)",en:"incongruent (median)"}]],
     how:{pl:"Mediana czasu poprawnych odpowiedzi dla słów niezgodnych (np. „ZIELONY” na czerwono) minus mediana dla zgodnych („ZIELONY” na zielono). Czytanie jest tak zautomatyzowane, że przeszkadza w nazwaniu koloru; w badaniach różnica wynosi zwykle kilkadziesiąt do ponad stu milisekund.",
          en:"Median time of correct answers for incongruent words (e.g. “GREEN” in red) minus the median for congruent ones (“GREEN” in green). Reading is so automatic that it interferes with naming the colour; in studies the difference is usually tens to over a hundred milliseconds."}},
    {id:"st-err", title:{pl:"Błędy",en:"Errors"}, unit:{pl:`z ${N}`,en:`of ${N}`}, rows:[["con",{pl:"zgodne",en:"congruent"}],["inc",{pl:"niezgodne",en:"incongruent"}]],
     how:{pl:"Błąd to wybranie innego koloru niż kolor napisu. Najczęstszy błąd przy niezgodnych słowach to wybranie koloru, który słowo nazywa.",en:"An error is choosing a colour other than the ink colour. The most common error on incongruent words is choosing the colour the word names."}},
    {id:"st-rt", title:{pl:"Czas odpowiedzi",en:"Response time"}, unit:U.ms_med, rows:[R_MEAN,R_SD],
     how:{pl:"Od pokazania słowa do odpowiedzi, wszystkie próby.",en:"From showing the word to the answer, all trials."}}
  ]};
  const status = o => { st=o; $("st-stroop").textContent = L(o)||""; };
  function buttons(){ $("stroop-ans").innerHTML = COLS.map((c,i)=>`<button type="button" data-c="${c.k}"><span class="sw" style="background:${c.hex}"></span>${i+1}</button>`).join(""); }
  function show(){ const box=$("stroop-word"); box.textContent="+"; box.style.color="#aaa";
    S.timer=setTimeout(()=>{ const t=S.trials[S.i], w=COLS.find(c=>c.k===t.word), ink=COLS.find(c=>c.k===t.ink);
      box.textContent=w[LANG]; box.style.color=ink.hex; S.t0=performance.now(); S.ready=true; }, 400+Math.random()*400);
    status({pl:`Próba ${S.i+1} z ${N}: wskaż KOLOR napisu (klawisze 1–4)`,en:`Trial ${S.i+1} of ${N}: pick the INK colour (keys 1–4)`}); }
  function start(){ const tr=[]; for(let i=0;i<N;i++){ const ink=COLS[i%4].k, con=i<N/2; let word=ink;
      if(!con){ const o=COLS.filter(c=>c.k!==ink); word=o[Math.floor(Math.random()*3)].k; } tr.push({ink, word, con}); }
    tr.sort(()=>Math.random()-0.5); clearTimeout(S&&S.timer); S={trials:tr, i:0, res:[], ready:false}; show(); }
  function answer(k){ if(!S||!S.ready) return; S.ready=false; const t=S.trials[S.i];
    S.res.push({con:t.con, ok:k===t.ink, rt:performance.now()-S.t0, ink:t.ink, word:t.word, answer:k}); S.i++;
    if(S.i<N) show(); else finish(); }
  function finish(){ const r=S.res, ok=x=>x.filter(z=>z.ok).map(z=>z.rt), con=r.filter(x=>x.con), inc=r.filter(x=>!x.con);
    self.R = { trials:r, medCon:median(ok(con)), medInc:median(ok(inc)), errCon:con.filter(x=>!x.ok).length, errInc:inc.filter(x=>!x.ok).length,
      wordErrors:inc.filter(x=>!x.ok && x.answer===x.word).length, rts:r.map(x=>x.rt) };
    self.R.effect=self.R.medInc-self.R.medCon; S=null; $("stroop-word").textContent=""; status({pl:"Gotowe.",en:"Done."});
    self.render(self.R); setSummary(self); markDone("stroop"); }
  self.render = R => { setMain("st-eff", (R.effect>0?"+":"")+nf(R.effect)); setRow("st-eff","con",ms(R.medCon)); setRow("st-eff","inc",ms(R.medInc));
    setMain("st-err", R.errCon+R.errInc); setRow("st-err","con",R.errCon); setRow("st-err","inc",R.errInc);
    setMain("st-rt", nf(median(R.rts))); setRow("st-rt","mean",ms(mean(R.rts))); setRow("st-rt","sd",ms(sd(R.rts))); };
  self.summary = R => LANG==="pl"
    ? `<p>Na słowa niezgodne odpowiadałeś o <strong>${nf(Math.abs(R.effect))} ms</strong> ${R.effect>=0?"wolniej":"szybciej"} niż na zgodne (${ms(R.medInc)} wobec ${ms(R.medCon)}). Błędów: ${R.errCon+R.errInc}, w tym ${R.wordErrors} razy wybrałeś kolor, który słowo nazywało, zamiast koloru napisu.</p><p>Jeśli masz trudność z rozróżnianiem kolorów, ten wynik nie jest miarodajny.</p>`
    : `<p>You answered incongruent words <strong>${nf(Math.abs(R.effect))} ms</strong> ${R.effect>=0?"slower":"faster"} than congruent ones (${ms(R.medInc)} vs ${ms(R.medCon)}). Errors: ${R.errCon+R.errInc}, of which ${R.wordErrors} times you chose the colour the word named instead of the ink colour.</p><p>If you have difficulty telling colours apart, this result is not meaningful.</p>`;
  $("stroop-go").addEventListener("click", start);
  $("stroop-ans").addEventListener("click", e => { const b=e.target.closest("button[data-c]"); if(b) answer(b.dataset.c); });
  document.addEventListener("keydown", e => { if(!S || $("tab-stroop").hidden) return; const i="1234".indexOf(e.key); if(i>=0){ e.preventDefault(); answer(COLS[i].k); } });
  SHOW.stroop = () => buttons();
  LEAVE.stroop = () => { if(S){ clearTimeout(S.timer); S=null; $("stroop-word").textContent=""; status(null); } };
  LANGHOOKS.push(() => { status(st); buttons(); });
  return self;
})();

export { Stroop };
