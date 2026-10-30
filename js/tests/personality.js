// Test: osobowość – Wielka Piątka, pełny IPIP-NEO (300 pozycji)
import { setMain, setRow, setSummary } from "../core/cards.js";
import { LANGHOOKS } from "../core/registry.js";
import { $, esc, nf } from "../core/utils.js";
import { L, LANG } from "../i18n/index.js";
import { markDone } from "../main.js";
import { ITEMS } from "../data/ipip-neo-300.js";

// =====================================================================
// 5 cech × 6 pod-cech × 10 pozycji. Kolejność pokazywania jak w IPIP-NEO:
// pozycje kolejnych pod-cech na przemian (1. z N1, 1. z E1, …, 1. z C6, 2. z N1, …).
// Wynik pod-cechy = średnia odpowiedzi (1–5) po odwróceniu pozycji z kluczem ujemnym.
// Brak norm populacyjnych: wynik to położenie na skali odpowiedzi, nie centyl.
// =====================================================================
const DOM = ["N","E","O","A","C"];
const DNAME = {
  N:{pl:"Neurotyczność",en:"Neuroticism"}, E:{pl:"Ekstrawersja",en:"Extraversion"}, O:{pl:"Otwartość na doświadczenie",en:"Openness to experience"},
  A:{pl:"Ugodowość",en:"Agreeableness"}, C:{pl:"Sumienność",en:"Conscientiousness"} };
const FNAME = {
  N1:{pl:"Lęk",en:"Anxiety"}, N2:{pl:"Złość",en:"Anger"}, N3:{pl:"Przygnębienie",en:"Depression"}, N4:{pl:"Skrępowanie",en:"Self-consciousness"}, N5:{pl:"Niepohamowanie",en:"Immoderation"}, N6:{pl:"Podatność na stres",en:"Vulnerability"},
  E1:{pl:"Serdeczność",en:"Friendliness"}, E2:{pl:"Towarzyskość",en:"Gregariousness"}, E3:{pl:"Asertywność",en:"Assertiveness"}, E4:{pl:"Aktywność",en:"Activity level"}, E5:{pl:"Poszukiwanie wrażeń",en:"Excitement-seeking"}, E6:{pl:"Pogoda ducha",en:"Cheerfulness"},
  O1:{pl:"Wyobraźnia",en:"Imagination"}, O2:{pl:"Zainteresowania artystyczne",en:"Artistic interests"}, O3:{pl:"Emocjonalność",en:"Emotionality"}, O4:{pl:"Śmiałość w działaniu",en:"Adventurousness"}, O5:{pl:"Intelekt",en:"Intellect"}, O6:{pl:"Liberalizm",en:"Liberalism"},
  A1:{pl:"Zaufanie",en:"Trust"}, A2:{pl:"Prawość",en:"Morality"}, A3:{pl:"Altruizm",en:"Altruism"}, A4:{pl:"Ustępliwość",en:"Cooperation"}, A5:{pl:"Skromność",en:"Modesty"}, A6:{pl:"Współczucie",en:"Sympathy"},
  C1:{pl:"Poczucie skuteczności",en:"Self-efficacy"}, C2:{pl:"Zamiłowanie do porządku",en:"Orderliness"}, C3:{pl:"Obowiązkowość",en:"Dutifulness"}, C4:{pl:"Dążenie do osiągnięć",en:"Achievement-striving"}, C5:{pl:"Samodyscyplina",en:"Self-discipline"}, C6:{pl:"Rozwaga",en:"Cautiousness"} };
const DTEXT = {
  N:{ lo:{pl:"jest spokojna, rzadko się zamartwia i trudno ją wytrącić z równowagi",en:"is calm, rarely worries and is hard to upset"},
      hi:{pl:"silniej przeżywa stres, niepokój, złość i smutek",en:"feels stress, worry, anger and sadness more strongly"} },
  E:{ lo:{pl:"woli spokój i mniejsze grono, potrzebuje mniej bodźców z zewnątrz",en:"prefers quiet and smaller groups, needs less outside stimulation"},
      hi:{pl:"czerpie energię z ludzi i działania, chętnie zabiera głos",en:"draws energy from people and action, readily speaks up"} },
  O:{ lo:{pl:"ceni to, co sprawdzone, konkretne i praktyczne",en:"values the familiar, concrete and practical"},
      hi:{pl:"lubi nowe pomysły, sztukę, wyobraźnię i rozważania",en:"enjoys new ideas, art, imagination and reflection"} },
  A:{ lo:{pl:"jest bardziej sceptyczna i rywalizująca, mówi wprost, co myśli",en:"is more sceptical and competitive, says plainly what it thinks"},
      hi:{pl:"jest ufna, pomocna i unika konfliktów",en:"is trusting, helpful and avoids conflict"} },
  C:{ lo:{pl:"działa bardziej spontanicznie i elastycznie, mniej planuje",en:"acts more spontaneously and flexibly, plans less"},
      hi:{pl:"jest zorganizowana, wytrwała i planuje z wyprzedzeniem",en:"is organised, persistent and plans ahead"} } };
const SCALE = [
  {pl:"Zupełnie nie pasuje",en:"Very inaccurate"}, {pl:"Raczej nie pasuje",en:"Moderately inaccurate"}, {pl:"Ani tak, ani nie",en:"Neither"},
  {pl:"Raczej pasuje",en:"Moderately accurate"}, {pl:"Bardzo pasuje",en:"Very accurate"} ];
const PER_PAGE = 10, N = ITEMS.length;
// kolejność pokazywania: pozycja k każdej z 30 pod-cech po kolei
const ORDER = []; for(let k=0;k<10;k++) for(let f=0;f<30;f++) ORDER.push(f*10+k);
const level = m => m < 2.5 ? "lo" : m > 3.5 ? "hi" : "mid";
const LV = { lo:{pl:"niski",en:"low"}, mid:{pl:"średni",en:"average"}, hi:{pl:"wysoki",en:"high"} };
const facetsOf = d => [1,2,3,4,5,6].map(i => d+i);

function score(ans){
  const fac = {}, dom = {};
  ITEMS.forEach(([f,key],i) => { const v = ans[i]; if(v==null) return; (fac[f] ||= []).push(key>0 ? v : 6-v); });
  const avg = a => a.reduce((s,x)=>s+x,0)/a.length;
  for(const f in fac) fac[f] = avg(fac[f]);
  for(const d of DOM) dom[d] = avg(facetsOf(d).map(f => fac[f]));
  return { fac, dom };
}

const Big5 = (() => {
  let ans = new Array(N).fill(null), page = 0, t0 = null, st = null;
  const self = { tab:"osobowosc", key:"osobowosc", grid:"cards-b5", sumId:"sum-b5", R:null, title:{pl:"Osobowość (Wielka Piątka, IPIP-NEO-300)",en:"Personality (Big Five, IPIP-NEO-300)"},
    specs: DOM.map(d => ({ id:"b5-"+d, title:DNAME[d], unit:{pl:"średnia odpowiedź (1–5)",en:"mean answer (1–5)"},
      rows: facetsOf(d).map(f => [f, FNAME[f]]),
      how:{pl:`Średnia z 60 pozycji tej cechy (po 10 na każdą z 6 pod-cech), na skali 1–5; pozycje sformułowane odwrotnie są odwracane (1↔5). Poniżej 2,5 = niski, powyżej 3,5 = wysoki – to tylko położenie na skali odpowiedzi, bez porównania z normami populacji.`,
           en:`Mean of the 60 items of this trait (10 for each of 6 facets), on a 1–5 scale; reverse-keyed items are flipped (1↔5). Below 2.5 = low, above 3.5 = high – this is only the position on the answer scale, with no comparison to population norms.`} })) };
  const status = o => { st=o; $("st-b5").textContent = L(o)||""; };
  const answered = () => ans.filter(v=>v!=null).length;

  function renderPage(){
    const box = $("b5-items"); if(!t0){ box.innerHTML=""; $("b5-nav").hidden = true; return; }
    const ids = ORDER.slice(page*PER_PAGE, (page+1)*PER_PAGE);
    box.innerHTML = ids.map((i,k) => { const n = page*PER_PAGE+k+1, txt = LANG==="pl" ? ITEMS[i][3] : ITEMS[i][2];
      return `<fieldset class="q-item" data-i="${i}"><legend><span class="q-n">${n}.</span> ${esc(txt)}</legend><div class="q-scale">`
        + SCALE.map((s,v) => `<label><input type="radio" name="q${i}" value="${v+1}"${ans[i]===v+1?" checked":""}><span>${esc(L(s))}</span></label>`).join("")
        + `</div></fieldset>`; }).join("");
    $("b5-nav").hidden = false;
    $("b5-prev").disabled = page===0;
    const last = (page+1)*PER_PAGE >= N;
    $("b5-next").textContent = last ? (LANG==="pl"?"Zakończ i pokaż wynik":"Finish and show result") : (LANG==="pl"?"Dalej →":"Next →");
    progress();
  }
  function progress(){ const a = answered();
    $("b5-prog").value = a; $("b5-prog").max = N;
    status(t0 ? {pl:`Strona ${page+1} z ${N/PER_PAGE} · odpowiedzi: ${a} z ${N}`, en:`Page ${page+1} of ${N/PER_PAGE} · answered: ${a} of ${N}`} : null); }
  $("b5-items").addEventListener("change", e => { const r = e.target; if(r.type!=="radio") return;
    const i = +r.closest(".q-item").dataset.i; ans[i] = +r.value; r.closest(".q-item").classList.remove("miss"); progress(); });
  $("b5-prev").addEventListener("click", () => { if(page>0){ page--; renderPage(); $("b5-items").scrollIntoView({block:"start"}); } });
  $("b5-next").addEventListener("click", () => {
    const ids = ORDER.slice(page*PER_PAGE, (page+1)*PER_PAGE), miss = ids.filter(i => ans[i]==null);
    if(miss.length){ miss.forEach(i => $("b5-items").querySelector(`[data-i="${i}"]`).classList.add("miss"));
      $("b5-items").querySelector(".miss").scrollIntoView({block:"center"});
      status({pl:`Odpowiedz na wszystkie pytania na tej stronie (brakuje: ${miss.length}).`,en:`Answer all questions on this page (missing: ${miss.length}).`}); return; }
    if((page+1)*PER_PAGE < N){ page++; renderPage(); $("b5-items").scrollIntoView({block:"start"}); return; }
    finish();
  });
  $("b5-go").addEventListener("click", () => {
    if(t0 && answered() && !confirm0()) return;
    ans = new Array(N).fill(null); page = 0; t0 = performance.now(); renderPage(); $("b5-items").scrollIntoView({block:"start"}); });
  // ponowny start czyści odpowiedzi – drugi klik w ciągu 4 s potwierdza (bez okien dialogowych)
  let armed = 0;
  function confirm0(){ if(performance.now()-armed < 4000) return true; armed = performance.now();
    status({pl:"Kliknij „Start” jeszcze raz, aby zacząć od nowa (odpowiedzi zostaną usunięte).",en:"Click “Start” again to start over (answers will be cleared)."}); return false; }

  function finish(){
    const { fac, dom } = score(ans);
    self.R = { items:N, minutes: (performance.now()-t0)/60000, domains:dom, facets:fac, answers:[...ans] };
    t0 = null; renderPage(); status({pl:"Gotowe – wynik poniżej.",en:"Done – result below."});
    self.render(self.R); setSummary(self); markDone("osobowosc"); $("sum-b5").scrollIntoView({block:"start"});
  }
  self.render = R => { for(const d of DOM){ setMain("b5-"+d, nf(R.domains[d],2)+` · ${L(LV[level(R.domains[d])])}`);
    facetsOf(d).forEach(f => setRow("b5-"+d, f, nf(R.facets[f],2))); } };
  self.summary = R => {
    const bar = (v) => `<span class="b5-bar"><span style="width:${((v-1)/4*100).toFixed(1)}%"></span></span>`;
    const rows = DOM.map(d => { const m = R.domains[d], lv = level(m);
      const t = lv==="mid" ? (LANG==="pl" ? "pośrodku skali – ani jedna, ani druga skrajność" : "in the middle of the scale – neither extreme")
                           : (LANG==="pl" ? "osoba z takim wynikiem zwykle " : "a person with this score usually ") + L(DTEXT[d][lv]);
      return `<li><strong>${L(DNAME[d])}</strong> ${bar(m)} ${nf(m,2)} (${L(LV[lv])}) – ${t}.</li>`; }).join("");
    const ext = []; for(const f in R.facets){ const v=R.facets[f]; if(v<=2 || v>=4) ext.push(`${L(FNAME[f])} ${nf(v,1)}`); }
    return LANG==="pl"
      ? `<p>Twój profil w pięciu cechach (średnia odpowiedź 1–5, ${R.items} pytań, ${nf(R.minutes,0)} min):</p><ul class="b5-list">${rows}</ul>`
        + (ext.length ? `<p>Najbardziej wyraziste pod-cechy (≤ 2 lub ≥ 4): ${ext.join(", ")}.</p>` : "")
        + `<p>Żadna cecha nie jest „lepsza” – każdy biegun ma swoje mocne strony. Wynik opisuje, jak dziś sam(a) siebie oceniasz, i może się różnić od oceny innych osób.</p>`
      : `<p>Your profile on the five traits (mean answer 1–5, ${R.items} questions, ${nf(R.minutes,0)} min):</p><ul class="b5-list">${rows}</ul>`
        + (ext.length ? `<p>Most pronounced facets (≤ 2 or ≥ 4): ${ext.join(", ")}.</p>` : "")
        + `<p>No trait is “better” – each pole has its strengths. The result describes how you rate yourself today and may differ from how others see you.</p>`;
  };
  LANGHOOKS.push(() => { if(t0) renderPage(); else status(st); });
  return self;
})();

export { Big5, ITEMS, ORDER, score, DNAME, FNAME };
