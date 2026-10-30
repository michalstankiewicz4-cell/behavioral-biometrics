// Interpretacje łączone: opisowe wnioski z kilku testów naraz (bez diagnoz).
// Progi są orientacyjne i ustalone na potrzeby tej strony, chyba że opis mówi inaczej.
import { LANG, L } from "../i18n/index.js";
import { $, mean, median, nf, sd, esc } from "../core/utils.js";
import { Typing } from "../tests/typing.js";
import { Click } from "../tests/target-clicking.js";
import { Drag } from "../tests/dragging.js";
import { Draw } from "../tests/tracing.js";
import { Hick } from "../tests/reaction-hick.js";
import { Fitts } from "../tests/fitts.js";
import { Tap } from "../tests/tapping.js";
import { Stroop } from "../tests/stroop.js";
import { Search } from "../tests/letter-search.js";
import { Digits, Corsi } from "../tests/memory.js";

const pl = () => LANG === "pl";
const name = t => L(t.title);
const item = (label, value, note) => `<li><span>${label}</span> <b>${value}</b>${note ? ` <small>${note}</small>` : ""}</li>`;

function block(title, used, missing, items, text){
  const need = missing.length ? `<p class="sub">${pl() ? "Brakuje:" : "Missing:"} ${missing.map(name).join(", ")}</p>` : "";
  if (used.length < 2) return `<article class="card comb"><h3>${title}</h3><p class="lead">${pl() ? "Zrób co najmniej dwa z tych testów:" : "Do at least two of these tests:"} ${[...used, ...missing].map(name).join(", ")}.</p></article>`;
  return `<article class="card comb"><h3>${title}</h3><ul class="comb-list">${items.join("")}</ul><p>${text}</p>${need}
    <p class="sub">${pl() ? "Na podstawie:" : "Based on:"} ${used.map(name).join(", ")}</p></article>`;
}
const split = list => [list.filter(t => t.R), list.filter(t => !t.R)];

function speed(){
  const [used, missing] = split([Hick, Click, Typing, Tap]); const it = []; let faster = 0, slower = 0, ref = 0;
  if (Hick.R){ const v = Hick.R.med[1]; ref++; if (v < 200) faster++; else if (v > 300) slower++;
    it.push(item(pl() ? "prosta reakcja" : "simple reaction", nf(v) + " ms", pl() ? "typowo ok. 200–300 ms" : "typically about 200–300 ms")); }
  if (Click.R) it.push(item(pl() ? "reakcja przy klikaniu celów" : "reaction when clicking targets", nf(median(Click.R.rt)) + " ms", pl() ? "z ruchem myszki" : "including mouse movement"));
  if (Typing.R){ const w = Typing.R.wpm; ref++; if (w > 45) faster++; else if (w < 35) slower++;
    it.push(item(pl() ? "pisanie" : "typing", nf(w) + (pl() ? " słów/min" : " words/min"), pl() ? "typowo ok. 35–45" : "typically about 35–45")); }
  if (Tap.R) it.push(item("tapping", `${nf(Tap.R.left.rate, 1)} / ${nf(Tap.R.right.rate, 1)} ${pl() ? "uderzeń/s (L/P)" : "taps/s (L/R)"}`));
  const txt = !ref ? (pl() ? "Do porównania z orientacyjnymi wartościami potrzebny jest czas reakcji albo test pisania." : "A reaction-time or typing test is needed to compare with rough reference values.")
    : pl() ? `W ${faster} z ${ref} miar, dla których znam orientacyjne wartości, jesteś szybszy niż typowo, w ${slower} wolniejszy${faster === 0 && slower === 0 ? ", czyli mieścisz się w typowym zakresie" : ""}. Pozostałe liczby pokazują, czy szybkość jest u Ciebie równa we wszystkim, czy zależy od zadania.`
           : `In ${faster} of ${ref} measures with rough reference values you are faster than typical, in ${slower} slower${faster === 0 && slower === 0 ? ", i.e. within the typical range" : ""}. The other numbers show whether your speed is even across tasks or depends on the task.`;
  return block(pl() ? "Szybkość ogólna" : "Overall speed", used, missing, it, txt);
}

function speedAccuracy(){
  const [used, missing] = split([Typing, Click, Fitts, Drag]); const it = []; let fast = null, sloppy = null;
  if (Typing.R){ it.push(item(pl() ? "pisanie: tempo / błędy" : "typing: pace / errors", `${nf(Typing.R.wpm)} / ${nf(100 * (Typing.R.errRate || 0), 1)} %`));
    fast = (fast || false) || Typing.R.wpm >= 45; sloppy = (sloppy || false) || (Typing.R.errRate || 0) >= 0.05; }
  if (Fitts.R){ const mr = Fitts.R.misses / Fitts.R.moves.length; it.push(item(pl() ? "Fitts: przepustowość / pudła" : "Fitts: throughput / misses", `${nf(Fitts.R.tp, 2)} bit/s / ${Fitts.R.misses}`));
    fast = (fast || false) || Fitts.R.tp >= 5; sloppy = (sloppy || false) || mr >= 0.15; }
  if (Click.R){ const mr = Click.R.misses / Click.R.n; it.push(item(pl() ? "klikanie: pudła / przestrzelenia" : "clicking: misses / overshoots", `${Click.R.misses} / ${Click.R.ovr.length} ${pl() ? "z" : "of"} ${Click.R.n}`));
    sloppy = (sloppy || false) || mr >= 0.15 || Click.R.ovr.length / Click.R.n >= 0.4; }
  if (Drag.R) it.push(item(pl() ? "przeciąganie: precyzja upuszczenia" : "dragging: drop precision", nf(mean(Drag.R.err), 1) + " px"));
  let txt;
  if (fast === null) txt = pl() ? "Do oceny tempa potrzebny jest test pisania albo prawo Fittsa." : "The typing test or Fitts's law test is needed to judge pace.";
  else if (fast && sloppy) txt = pl() ? "Wygląda na to, że stawiasz na <strong>szybkość kosztem precyzji</strong>: tempo masz wysokie, ale błędów lub pudeł jest sporo." : "You seem to favour <strong>speed over precision</strong>: your pace is high, but there are quite a few errors or misses.";
  else if (fast) txt = pl() ? "Jesteś <strong>szybki i dokładny</strong> jednocześnie." : "You are <strong>fast and accurate</strong> at the same time.";
  else if (!sloppy) txt = pl() ? "Działasz <strong>raczej spokojnie, ale dokładnie</strong>: tempo umiarkowane, mało błędów." : "You work <strong>calmly but accurately</strong>: moderate pace, few errors.";
  else txt = pl() ? "Tempo jest umiarkowane, a błędów sporo. Często to kwestia sprzętu (touchpad, nieznana klawiatura) albo zmęczenia." : "The pace is moderate with quite a few errors. This is often down to the hardware (touchpad, unfamiliar keyboard) or tiredness.";
  txt += pl() ? " <small>Progi: szybko = ≥ 45 słów/min lub ≥ 5 bit/s; dużo błędów = ≥ 5% znaków lub ≥ 15% pudeł (ustalone na potrzeby strony).</small>"
              : " <small>Thresholds: fast = ≥ 45 words/min or ≥ 5 bit/s; many errors = ≥ 5% of characters or ≥ 15% misses (set for this page).</small>";
  return block(pl() ? "Szybkość kontra precyzja" : "Speed vs accuracy", used, missing, it, txt);
}

function steadiness(){
  const [used, missing] = split([Drag, Draw, Tap, Typing]); const it = []; const notes = [];
  if (Drag.R) it.push(item(pl() ? "drżenie przy przeciąganiu" : "tremor when dragging", nf(Drag.R.trem, 2) + " px"));
  if (Draw.R) it.push(item(pl() ? "drżenie przy rysowaniu (koło / linia)" : "tremor when tracing (circle / line)", `${nf(Draw.R.circle.trem, 2)} / ${nf(Draw.R.line.trem, 2)} px`));
  if (Tap.R){ const cv = (Tap.R.left.cv + Tap.R.right.cv) / 2; it.push(item(pl() ? "równomierność tappingu (CV)" : "tapping regularity (CV)", nf(cv, 2)));
    notes.push(cv < 0.15 ? (pl() ? "stukasz bardzo równo" : "you tap very evenly") : (pl() ? "rytm stukania jest zmienny" : "your tapping rhythm varies")); }
  if (Typing.R){ const cv = sd(Typing.R.dd) / mean(Typing.R.dd); it.push(item(pl() ? "rytm pisania (CV)" : "typing rhythm (CV)", nf(cv, 2)));
    notes.push(cv < 0.35 ? (pl() ? "piszesz równym rytmem" : "you type with a steady rhythm") : (pl() ? "rytm pisania jest zmienny" : "your typing rhythm varies")); }
  const txt = (notes.length ? (pl() ? "Krótko: " : "In short: ") + notes.join(pl() ? ", " : ", ") + ". " : "")
    + (pl() ? "Drżenie w pikselach zależy mocno od myszki, jej czułości i podkładki, więc porównuj je raczej między swoimi podejściami niż z innymi osobami."
            : "Tremor in pixels depends heavily on the mouse, its sensitivity and the pad, so compare it between your own attempts rather than with other people.");
  return block(pl() ? "Stabilność ręki i rytmu" : "Hand and rhythm steadiness", used, missing, it, txt);
}

function attentionMemory(){
  const [used, missing] = split([Stroop, Search, Digits, Corsi]); const it = []; const parts = [];
  if (Stroop.R){ it.push(item(pl() ? "efekt Stroopa" : "Stroop effect", (Stroop.R.effect >= 0 ? "+" : "") + nf(Stroop.R.effect) + " ms", pl() ? "zwykle od kilkudziesięciu do ponad 100 ms" : "usually tens to over 100 ms"));
    parts.push(Stroop.R.effect > 150 ? (pl() ? "czytanie słów mocno przeszkadzało Ci w nazywaniu kolorów" : "reading the words interfered strongly with naming colours")
             : Stroop.R.effect < 20 ? (pl() ? "słowa prawie nie przeszkadzały Ci w nazywaniu kolorów" : "the words barely interfered with naming colours")
             : (pl() ? "słowa przeszkadzały Ci w typowym stopniu" : "the words interfered to a typical degree")); }
  if (Search.R) it.push(item(pl() ? "szukanie liter: pominięte / pomyłki" : "letter search: missed / false marks", `${Search.R.missed} / ${Search.R.falseTotal}`));
  if (Digits.R) it.push(item(pl() ? "zakres cyfr" : "digit span", Digits.R.span, pl() ? "typowo 7 ± 2" : "typically 7 ± 2"));
  if (Corsi.R) it.push(item(pl() ? "bloki Corsiego" : "Corsi blocks", Corsi.R.span, pl() ? "typowo ok. 5–6" : "typically about 5–6"));
  if (Digits.R && Corsi.R){ const d = Digits.R.span - Corsi.R.span;
    parts.push(d > 0 ? (pl() ? `zakres cyfr masz o ${d} większy niż przestrzenny, jak większość osób` : `your digit span is ${d} larger than your spatial span, as for most people`)
             : d < 0 ? (pl() ? "pamięć przestrzenna wypadła u Ciebie lepiej niż słowna, co zdarza się rzadziej" : "your spatial memory scored better than verbal, which is less common")
             : (pl() ? "oba zakresy pamięci masz równe" : "both memory spans are equal")); }
  const txt = parts.length ? (pl() ? "Krótko: " : "In short: ") + parts.join(", ") + "." : (pl() ? "Liczby obok pokazują Twoje wyniki." : "The numbers above show your results.");
  return block(pl() ? "Uwaga i pamięć" : "Attention and memory", used, missing, it, txt);
}

export function renderCombined(){
  const el = $("results-comb"); if (!el) return;
  el.innerHTML = [speed(), speedAccuracy(), steadiness(), attentionMemory()].join("");
}
