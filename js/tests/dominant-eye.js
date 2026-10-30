// Test: oko dominujące – test „okienka z dłoni” (metoda Milesa) prowadzony krok po kroku
import { setMain, setRow, setSummary } from "../core/cards.js";
import { LANGHOOKS } from "../core/registry.js";
import { $ } from "../core/utils.js";
import { L, LANG } from "../i18n/index.js";
import { markDone } from "../main.js";

// =====================================================================
// Patrzysz obojgiem oczu przez trójkątne okienko ze złożonych dłoni na punkt na ekranie.
// Potem zamykasz po kolei jedno oko: oko, przy którym punkt zostaje w okienku, jest dominujące.
// Każde przejście to jedna próba; wynik to większość prób.
// =====================================================================
const EYE = { right:{pl:"prawe",en:"right"}, left:{pl:"lewe",en:"left"}, unclear:{pl:"niejasne",en:"unclear"} };

const Eye = (() => { let S=null, st=null; const trials=[];
  const self = { tab:"wzrok", key:"oko-dominujace", grid:"cards-eye", sumId:"sum-eye", R:null, title:{pl:"Oko dominujące",en:"Dominant eye"}, specs:[
    {id:"ey-dom", title:{pl:"Oko dominujące",en:"Dominant eye"}, unit:{pl:"",en:""}, rows:[["n",{pl:"próby",en:"trials"}],["agree",{pl:"zgodne próby",en:"consistent trials"}],["list",{pl:"wyniki prób",en:"trial results"}]],
     how:{pl:"Metoda Milesa: przy patrzeniu przez małe okienko mózg „ustawia” je przed okiem dominującym. Gdy zamkniesz to oko, punkt wyskakuje z okienka; gdy zamkniesz drugie, punkt zostaje. Próba jest niejasna, jeśli punkt zostaje albo znika przy obu oczach. Wynik to oko, które wyszło w większości prób.",
          en:"Miles test: when looking through a small opening, the brain lines it up in front of the dominant eye. When you close that eye the dot jumps out of the opening; when you close the other one, the dot stays. A trial is unclear if the dot stays or disappears for both eyes. The result is the eye found in most trials."}}
  ]};
  const status = o => { st=o; $("st-eye").textContent = L(o)||""; };
  const STEPS = [
    { t:{pl:"1/3 · Wyciągnij przed siebie obie ręce i złóż dłonie tak, by między kciukami i palcami wskazującymi powstało małe trójkątne okienko. Patrząc OBOJGIEM oczu, ustaw okienko tak, by punkt na ekranie był dokładnie w jego środku.",
          en:"1/3 · Stretch both arms out and put your hands together so that your thumbs and index fingers form a small triangular opening. Looking with BOTH eyes, place the opening so the dot on the screen is right in its centre."},
      b:[["ok",{pl:"Punkt jest w okienku",en:"The dot is in the opening"}]] },
    { t:{pl:"2/3 · Nie ruszając rąk, zamknij LEWE oko (patrzysz prawym). Czy punkt nadal jest w okienku?",en:"2/3 · Without moving your hands, close your LEFT eye (look with the right one). Is the dot still in the opening?"},
      b:[["yes",{pl:"Tak, nadal jest",en:"Yes, still there"}],["no",{pl:"Nie, uciekł",en:"No, it moved out"}]] },
    { t:{pl:"3/3 · Otwórz lewe oko i zamknij PRAWE (patrzysz lewym), nadal bez ruszania rąk. Czy punkt jest w okienku?",en:"3/3 · Open your left eye and close the RIGHT one (look with the left), still without moving your hands. Is the dot in the opening?"},
      b:[["yes",{pl:"Tak, jest",en:"Yes, it is"}],["no",{pl:"Nie, uciekł",en:"No, it moved out"}]] } ];
  function show(){ if(!S){ $("eye-ans").innerHTML=""; return; } const s=STEPS[S.step]; status(s.t);
    $("eye-ans").innerHTML = s.b.map(([k,l]) => `<button type="button" data-k="${k}" class="${k==="no"?"":"primary"}">${L(l)}</button>`).join(""); }
  $("eye-ans").addEventListener("click", e => { const b=e.target.closest("button[data-k]"); if(!b||!S) return; const k=b.dataset.k;
    if(S.step===1) S.rightSees = k==="yes"; if(S.step===2) S.leftSees = k==="yes";
    if(S.step<2){ S.step++; show(); return; }
    const r = S.rightSees && !S.leftSees ? "right" : S.leftSees && !S.rightSees ? "left" : "unclear";
    trials.push(r); S=null; show(); finish(r); });
  function finish(last){
    const cnt = { right:trials.filter(x=>x==="right").length, left:trials.filter(x=>x==="left").length };
    const dom = cnt.right > cnt.left ? "right" : cnt.left > cnt.right ? "left" : "unclear";
    self.R = { dominant:dom, trials:[...trials], agree: dom==="unclear" ? 0 : cnt[dom] };
    status(last==="unclear"
      ? {pl:"Ta próba wyszła niejasno. Kliknij „Start”, żeby powtórzyć – warto zrobić 2–3 próby.",en:"This trial was unclear. Click “Start” to repeat – 2–3 trials are worth doing."}
      : {pl:`Próba: oko ${EYE[last].pl}. Możesz powtórzyć („Start”), żeby sprawdzić, czy wynik się powtarza.`,en:`Trial: ${EYE[last].en} eye. You can repeat (“Start”) to check that the result repeats.`});
    self.render(self.R); setSummary(self); markDone("wzrok");
  }
  self.render = R => { setMain("ey-dom", L(EYE[R.dominant])); setRow("ey-dom","n",R.trials.length); setRow("ey-dom","agree", R.dominant==="unclear" ? "—" : `${R.agree} / ${R.trials.length}`);
    setRow("ey-dom","list", R.trials.map(x=>L(EYE[x])).join(", ")); };
  self.summary = R => LANG==="pl"
    ? (R.dominant==="unclear"
        ? `<p>Wynik jest <strong>niejasny</strong> (${R.trials.length} ${R.trials.length===1?"próba":"próby"}). Powtórz test, trzymając okienko małe i ręce wyprostowane. U części osób żadne oko wyraźnie nie dominuje.</p>`
        : `<p>Twoje oko dominujące to <strong>${EYE[R.dominant].pl}</strong> (${R.agree} z ${R.trials.length} prób). Około 70% ludzi ma dominujące prawe oko. Oko dominujące ma znaczenie np. przy celowaniu, fotografii czy patrzeniu przez mikroskop.</p>`)
      + `<p><strong>To nie jest badanie wzroku.</strong></p>`
    : (R.dominant==="unclear"
        ? `<p>The result is <strong>unclear</strong> (${R.trials.length} trial${R.trials.length===1?"":"s"}). Repeat the test with a small opening and straight arms. Some people have no clearly dominant eye.</p>`
        : `<p>Your dominant eye is the <strong>${EYE[R.dominant].en}</strong> one (${R.agree} of ${R.trials.length} trials). About 70% of people are right-eye dominant. Eye dominance matters e.g. for aiming, photography or looking through a microscope.</p>`)
      + `<p><strong>This is not an eye test.</strong></p>`;
  $("eye-go").addEventListener("click", () => { S={step:0}; show(); });
  LANGHOOKS.push(() => { if(S) show(); else status(st); });
  return self;
})();

export { Eye };
