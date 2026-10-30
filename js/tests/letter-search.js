// Test: letter-search
import { setMain, setRow, setSummary } from "../core/cards.js";
import { $, ms, nf } from "../core/utils.js";
import { L, LANG } from "../i18n/index.js";
import { markDone } from "../main.js";

// =====================================================================
// 8b. SZUKANIE LITER — zaznacz wszystkie „b” wśród d/p/q
// =====================================================================
const Search = (() => { const ROWS=7, COLS=12, NT=21, TGT="b", OTH=["d","p","q"];
  const grid=$("ls-grid"); let S=null, st=null;
  const self = { tab:"litery", key:"szukanie-liter", grid:"cards-ls", sumId:"sum-ls", R:null, title:{pl:"Szukanie liter",en:"Letter search"}, specs:[
    {id:"ls-time", title:{pl:"Czas",en:"Time"}, unit:{pl:"s",en:"s"}, rows:[["per",{pl:"na znak siatki",en:"per grid character"}]],
     how:{pl:`Od kliknięcia „Start” do „Gotowe”. Siatka ma ${ROWS*COLS} znaków, w tym ${NT} liter „${TGT}”.`,
          en:`From clicking “Start” to “Done”. The grid has ${ROWS*COLS} characters, ${NT} of them “${TGT}”.`}},
    {id:"ls-hit", title:{pl:"Trafienia",en:"Hits"}, unit:{pl:`z ${NT}`,en:`of ${NT}`}, rows:[["miss",{pl:"pominięte",en:"missed"}]],
     how:{pl:`Ile liter „${TGT}” zaznaczyłeś i ile przeoczyłeś. Po zakończeniu przeoczone mają pomarańczową ramkę.`,
          en:`How many “${TGT}” letters you marked and how many you missed. After finishing, missed ones get an orange outline.`}},
    {id:"ls-fa", title:{pl:"Pomyłki",en:"False marks"}, unit:{pl:"innych liter",en:"other letters"},
     rows:OTH.map(o=>[o,{pl:`„${o}” zamiast „${TGT}”`,en:`“${o}” instead of “${TGT}”`}]),
     how:{pl:`Zaznaczone litery inne niż „${TGT}”, z podziałem na to, którą literę wzięto za „${TGT}”. Litery b, d, p i q są swoimi odbiciami lustrzanymi lub obrotami. Po zakończeniu mają czerwoną ramkę.`,
          en:`Marked letters other than “${TGT}”, split by which letter was taken for “${TGT}”. The letters b, d, p and q are mirror images or rotations of each other. After finishing they get a red outline.`}}
  ]};
  const status = o => { st=o; $("st-ls").textContent = L(o)||""; };
  function idle(){ grid.innerHTML = Array.from({length:ROWS*COLS},()=>`<button type="button" disabled>·</button>`).join(""); }
  function start(){
    const pos=new Set(); while(pos.size<NT) pos.add(Math.floor(Math.random()*ROWS*COLS));
    const letters=Array.from({length:ROWS*COLS},(_,i)=>pos.has(i)?TGT:OTH[Math.floor(Math.random()*OTH.length)]);
    S={letters, marked:new Set(), t0:performance.now(), done:false};
    grid.innerHTML = letters.map((l,i)=>`<button type="button" data-i="${i}" aria-pressed="false">${l}</button>`).join("");
    $("ls-done").disabled=false;
    status({pl:`Zaznacz wszystkie litery „${TGT}”, potem kliknij „Gotowe”.`,en:`Mark every “${TGT}”, then click “Done”.`});
  }
  grid.addEventListener("click", e => { const b=e.target.closest("button[data-i]"); if(!b || !S || S.done) return;
    const i=+b.dataset.i; if(S.marked.has(i)) S.marked.delete(i); else S.marked.add(i);
    b.classList.toggle("on", S.marked.has(i)); b.setAttribute("aria-pressed", S.marked.has(i)); });
  function finish(){ if(!S || S.done) return; S.done=true; const t=(performance.now()-S.t0)/1000;
    let hits=0; const fa={}; OTH.forEach(o=>fa[o]=0);
    S.letters.forEach((l,i)=>{ const m=S.marked.has(i), b=grid.querySelector(`[data-i="${i}"]`);
      if(l===TGT){ if(m) hits++; else b.classList.add("miss"); } else if(m){ fa[l]++; b.classList.add("fa"); } b.disabled=true; });
    $("ls-done").disabled=true;
    self.R = { time:t, n:ROWS*COLS, targets:NT, hits, missed:NT-hits, falseMarks:fa, falseTotal:Object.values(fa).reduce((a,b)=>a+b,0) };
    self.render(self.R); setSummary(self); markDone("litery"); status({pl:"Gotowe.",en:"Done."}); }
  $("ls-go").addEventListener("click", start); $("ls-done").addEventListener("click", finish);
  self.render = R => { setMain("ls-time", nf(R.time,1)); setRow("ls-time","per", ms(1000*R.time/R.n));
    setMain("ls-hit", R.hits); setRow("ls-hit","miss", R.missed);
    setMain("ls-fa", R.falseTotal); OTH.forEach(o=>setRow("ls-fa",o,R.falseMarks[o])); };
  self.summary = R => LANG==="pl"
    ? `<p>Przejrzenie siatki zajęło ci <strong>${nf(R.time,1)} s</strong>. Zaznaczyłeś ${R.hits} z ${R.targets} liter „${TGT}”, pominąłeś ${R.missed}, a innych liter zaznaczyłeś ${R.falseTotal} (${OTH.map(o=>`${o}: ${R.falseMarks[o]}`).join(", ")}).</p><p>To opis tego, co zrobiłeś, a nie ocena.</p>`
    : `<p>Scanning the grid took you <strong>${nf(R.time,1)} s</strong>. You marked ${R.hits} of ${R.targets} “${TGT}” letters, missed ${R.missed} and marked ${R.falseTotal} other letters (${OTH.map(o=>`${o}: ${R.falseMarks[o]}`).join(", ")}).</p><p>This describes what you did; it is not an assessment.</p>`;
  self.onLang = () => status(st);
  idle();
  return self;
})();

export { Search };
