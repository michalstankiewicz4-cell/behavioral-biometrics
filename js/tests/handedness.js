// Test: ręczność – kwestionariusz w stylu Edynburskiego (pytania własne) + porównanie z tappingiem
import { setHTML, setMain, setRow, setSummary } from "../core/cards.js";
import { LANGHOOKS, SHOW } from "../core/registry.js";
import { $, esc, nf } from "../core/utils.js";
import { L, LANG } from "../i18n/index.js";
import { markDone } from "../main.js";
import { Tap } from "./tapping.js";

// =====================================================================
// 10 codziennych czynności, odpowiedź od „zawsze lewa” (−2) do „zawsze prawa” (+2).
// Wskaźnik lateralizacji LQ = suma ÷ (2 × liczba czynności) × 100, od −100 do +100.
// Podział jak w krótkiej wersji Edynburskiego (Veale 2014): ≥ 60 prawo-, ≤ −60 lewo-, pomiędzy mieszana.
// Pytania są własne (inspirowane listą czynności Oldfielda, 1971), nie kopią kwestionariusza.
// =====================================================================
const ACTS = [
  {pl:"Pisanie",en:"Writing"}, {pl:"Rysowanie",en:"Drawing"}, {pl:"Rzucanie piłką do celu",en:"Throwing a ball at a target"},
  {pl:"Cięcie nożyczkami",en:"Cutting with scissors"}, {pl:"Mycie zębów (ręka ze szczoteczką)",en:"Brushing teeth (hand holding the brush)"},
  {pl:"Krojenie nożem bez widelca",en:"Cutting with a knife (no fork)"}, {pl:"Jedzenie łyżką",en:"Eating with a spoon"},
  {pl:"Zapalanie zapałki (ręka z zapałką)",en:"Striking a match (hand holding the match)"}, {pl:"Wbijanie gwoździa (ręka z młotkiem)",en:"Hammering a nail (hand holding the hammer)"},
  {pl:"Odkręcanie słoika (ręka, która kręci pokrywką)",en:"Opening a jar (hand turning the lid)"} ];
const OPTS = [ {v:-2,pl:"Zawsze lewa",en:"Always left"}, {v:-1,pl:"Zwykle lewa",en:"Usually left"}, {v:0,pl:"Obie tak samo",en:"Both equally"},
  {v:1,pl:"Zwykle prawa",en:"Usually right"}, {v:2,pl:"Zawsze prawa",en:"Always right"} ];
const cls = lq => lq >= 60 ? "right" : lq <= -60 ? "left" : "mixed";
const CLS = { right:{pl:"praworęczność",en:"right-handed"}, left:{pl:"leworęczność",en:"left-handed"}, mixed:{pl:"ręczność mieszana",en:"mixed-handed"} };

const Hand = (() => {
  const ans = new Array(ACTS.length).fill(null); let st = null;
  const self = { tab:"recznosc", key:"recznosc", grid:"cards-hand", sumId:"sum-hand", R:null, title:{pl:"Ręczność",en:"Handedness"}, specs:[
    {id:"hd-lq", title:{pl:"Wskaźnik lateralizacji",en:"Laterality quotient"}, unit:{pl:"od −100 (lewa) do +100 (prawa)",en:"from −100 (left) to +100 (right)"},
     rows:[["cls",{pl:"kategoria",en:"category"}],["l",{pl:"czynności lewą ręką",en:"tasks with the left hand"}],["r",{pl:"czynności prawą ręką",en:"tasks with the right hand"}],["b",{pl:"obie tak samo",en:"both equally"}]],
     how:{pl:"Każda odpowiedź ma wartość od −2 (zawsze lewa) do +2 (zawsze prawa). LQ = suma ÷ (2 × 10) × 100. Podział jak w krótkiej wersji Inwentarza Edynburskiego (Veale, 2014): co najmniej +60 to praworęczność, co najwyżej −60 leworęczność, pomiędzy ręczność mieszana. Pytania są własne, wzorowane na czynnościach z kwestionariusza Oldfielda (1971).",
          en:"Each answer scores from −2 (always left) to +2 (always right). LQ = sum ÷ (2 × 10) × 100. Categories as in the short Edinburgh Handedness Inventory (Veale, 2014): +60 or more is right-handed, −60 or less left-handed, in between mixed. The questions are my own, modelled on the activities in Oldfield's questionnaire (1971)."}},
    {id:"hd-tap", title:{pl:"Porównanie z tappingiem",en:"Comparison with tapping"}, unit:{pl:"% różnicy tempa (prawa − lewa)",en:"% rate difference (right − left)"},
     rows:[["fast",{pl:"szybsza ręka w tappingu",en:"faster hand in tapping"}],["agree",{pl:"zgodność z deklaracją",en:"agrees with your answers"}]],
     how:{pl:"Jeśli wykonano test Tapping, porównuję deklarowaną rękę z tą, która stukała szybciej. Różnica poniżej 3% jest traktowana jako remis. Ręka dominująca jest zwykle szybsza o kilka do kilkunastu procent, ale nie zawsze.",
          en:"If the Tapping test was done, I compare the declared hand with the one that tapped faster. A difference below 3% counts as a tie. The dominant hand is usually a few to over ten percent faster, but not always."}}
  ]};
  const status = o => { st=o; $("st-hand").textContent = L(o)||""; };
  function renderForm(){
    $("hand-items").innerHTML = ACTS.map((a,i) => `<fieldset class="q-item" data-i="${i}"><legend><span class="q-n">${i+1}.</span> ${esc(L(a))}</legend><div class="q-scale">`
      + OPTS.map(o => `<label><input type="radio" name="hd${i}" value="${o.v}"${ans[i]===o.v?" checked":""}><span>${esc(L(o))}</span></label>`).join("")
      + `</div></fieldset>`).join("");
  }
  $("hand-items").addEventListener("change", e => { const r=e.target; if(r.type!=="radio") return;
    const q=r.closest(".q-item"); ans[+q.dataset.i] = +r.value; q.classList.remove("miss"); });
  $("hand-go").addEventListener("click", () => {
    const miss = ans.map((v,i)=>v==null?i:-1).filter(i=>i>=0);
    if(miss.length){ miss.forEach(i => $("hand-items").querySelector(`[data-i="${i}"]`).classList.add("miss"));
      status({pl:`Odpowiedz na wszystkie pytania (brakuje: ${miss.length}).`,en:`Answer all questions (missing: ${miss.length}).`}); return; }
    const sum = ans.reduce((s,v)=>s+v,0), lq = sum/(2*ACTS.length)*100;
    self.R = { answers:[...ans], lq, cls:cls(lq), left:ans.filter(v=>v<0).length, right:ans.filter(v=>v>0).length, both:ans.filter(v=>v===0).length };
    status({pl:"Gotowe.",en:"Done."}); self.render(self.R); setSummary(self); markDone("recznosc");
  });
  // porównanie z tappingiem liczone przy każdym wyświetleniu (tapping mógł zostać zrobiony później)
  function tapCmp(){ if(!Tap.R) return null; const a = Tap.R.asym*100, fast = Math.abs(a) < 3 ? "tie" : a > 0 ? "right" : "left";
    return { asym:a, fast }; }
  self.render = R => { setMain("hd-lq", (R.lq>0?"+":"")+nf(R.lq,0)); setRow("hd-lq","cls",L(CLS[R.cls])); setRow("hd-lq","l",R.left); setRow("hd-lq","r",R.right); setRow("hd-lq","b",R.both);
    const t = tapCmp();
    if(t){ setMain("hd-tap", (t.asym>0?"+":"")+nf(t.asym,1));
      setRow("hd-tap","fast", t.fast==="tie" ? (LANG==="pl"?"remis":"tie") : t.fast==="right" ? (LANG==="pl"?"prawa":"right") : (LANG==="pl"?"lewa":"left"));
      setRow("hd-tap","agree", R.cls==="mixed" || t.fast==="tie" ? "—" : (t.fast===R.cls ? (LANG==="pl"?"tak":"yes") : (LANG==="pl"?"nie":"no"))); }
    else { setHTML("hd-tap","fast", LANG==="pl" ? `<a href="#tapping">zrób Tapping</a>` : `<a href="#tapping">do Tapping</a>`); setRow("hd-tap","agree","—"); }
  };
  self.summary = R => { const t = tapCmp(), c = L(CLS[R.cls]);
    const base = LANG==="pl"
      ? `<p>Twój wskaźnik lateralizacji to <strong>${(R.lq>0?"+":"")+nf(R.lq,0)}</strong>, czyli <strong>${c}</strong>. Na świecie ok. 10% osób jest leworęcznych, a spora część ludzi wykonuje niektóre czynności „drugą” ręką.</p>`
      : `<p>Your laterality quotient is <strong>${(R.lq>0?"+":"")+nf(R.lq,0)}</strong>, i.e. <strong>${c}</strong>. About 10% of people worldwide are left-handed, and many people do some tasks with the “other” hand.</p>`;
    if(!t) return base + (LANG==="pl" ? `<p>Zrób też test <a href="#tapping">Tapping</a>, żeby porównać deklarację z tym, która ręka naprawdę stuka szybciej.</p>` : `<p>Also do the <a href="#tapping">Tapping</a> test to compare your answers with which hand actually taps faster.</p>`);
    const f = t.fast==="tie" ? null : t.fast;
    const agree = R.cls!=="mixed" && f && f===R.cls;
    return base + (LANG==="pl"
      ? `<p>W tappingu ${f ? `szybsza była <strong>${f==="right"?"prawa":"lewa"}</strong> ręka (różnica ${nf(Math.abs(t.asym),1)}%)` : "obie ręce stukały prawie tak samo szybko"}. ${R.cls==="mixed" ? "Przy ręczności mieszanej to naturalne, że różnica jest mała albo w dowolną stronę." : agree ? "To zgadza się z Twoimi odpowiedziami." : "To nie zgadza się z Twoimi odpowiedziami – możliwe przy krótkim teście, zmęczeniu albo innej klawiaturze."}</p>`
      : `<p>In tapping ${f ? `your <strong>${f}</strong> hand was faster (difference ${nf(Math.abs(t.asym),1)}%)` : "both hands tapped almost equally fast"}. ${R.cls==="mixed" ? "With mixed handedness a small difference either way is natural." : agree ? "This agrees with your answers." : "This doesn't match your answers – possible with a short test, fatigue or a different keyboard."}</p>`);
  };
  SHOW.recznosc = () => { if(self.R){ self.render(self.R); setSummary(self); } };
  renderForm();
  LANGHOOKS.push(() => { renderForm(); status(st); });
  return self;
})();

export { Hand, ACTS };
