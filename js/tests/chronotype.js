// Test: chronotyp – skowronek czy sowa, z godzin snu (metoda punktu środka snu w dni wolne, Roenneberg)
import { setMain, setRow, setSummary } from "../core/cards.js";
import { LANGHOOKS } from "../core/registry.js";
import { $, nf } from "../core/utils.js";
import { L, LANG } from "../i18n/index.js";
import { markDone } from "../main.js";

// =====================================================================
// Pytania są własne; nie kopiują kwestionariuszy MEQ ani MCTQ (wymagają zgody autorów).
// Liczę opublikowane miary (Roenneberg i in. 2003/2004):
//   SD = koniec snu − zaśnięcie, MS = zaśnięcie + SD/2 (osobno dni robocze W i wolne F)
//   ØSD = (SDW·dni_robocze + SDF·dni_wolne) / 7
//   MSFsc = MSF − (SDF − ØSD)/2, jeśli SDF > SDW; w przeciwnym razie MSFsc = MSF
//   społeczny jet lag = |MSF − MSW|
// =====================================================================
const parse = s => { if(!s) return null; const [h,m] = s.split(":").map(Number); return h + m/60; };
const mod24 = x => ((x % 24) + 24) % 24;
const signed = x => { const v = mod24(x); return v >= 12 ? v - 24 : v; };   // 23:00 → −1, 04:00 → 4
const hhmm = x => { const v = mod24(x), h = Math.floor(v), m = Math.round((v-h)*60); return `${String(m===60?h+1:h).padStart(2,"0")}:${String(m===60?0:m).padStart(2,"0")}`; };
const dur = h => { const H = Math.floor(h), M = Math.round((h-H)*60); return `${H} h ${String(M).padStart(2,"0")} min`; };
// orientacyjne godzinne przedziały MSFsc (środek rozkładu u dorosłych ok. 4–5)
const BANDS = [
  [2,  {pl:"wyraźny skowronek (bardzo wczesny)",en:"strong lark (very early)"}],
  [3,  {pl:"skowronek (wczesny)",en:"lark (early)"}],
  [4,  {pl:"lekko wczesny",en:"slightly early"}],
  [5,  {pl:"typ pośredni",en:"intermediate"}],
  [6,  {pl:"lekko późny",en:"slightly late"}],
  [7,  {pl:"sowa (późny)",en:"owl (late)"}],
  [99, {pl:"wyraźna sowa (bardzo późny)",en:"strong owl (very late)"}] ];
const band = msf => BANDS.find(([lim]) => signed(msf) < lim)[1];

const Chrono = (() => { let st=null;
  const self = { tab:"chronotyp", key:"chronotyp", grid:"cards-chr", sumId:"sum-chr", R:null, title:{pl:"Chronotyp",en:"Chronotype"}, specs:[
    {id:"ch-msf", title:{pl:"Chronotyp (środek snu w dni wolne)",en:"Chronotype (mid-sleep on free days)"}, unit:{pl:"godzina",en:"time"},
     rows:[["band",{pl:"typ",en:"type"}],["msf",{pl:"środek snu w dni wolne, bez korekty",en:"mid-sleep on free days, uncorrected"}],["msw",{pl:"środek snu w dni robocze",en:"mid-sleep on workdays"}]],
     how:{pl:"Środek snu = zaśnięcie + połowa długości snu. Chronotyp to środek snu w dni wolne (MSF), bo wtedy śpimy według zegara biologicznego, a nie budzika. Jeśli w dni wolne śpisz dłużej niż w robocze, odsypiasz niedobór z tygodnia – wtedy MSF jest przesuwany wcześniej: MSFsc = MSF − (SDF − ØSD) ÷ 2, gdzie ØSD to średnia długość snu w tygodniu. Wzory: Roenneberg i in. (2003, 2004). Przedziały typów są orientacyjne, godzinne; środek rozkładu u dorosłych wypada ok. 4:00–5:00.",
          en:"Mid-sleep = sleep onset + half the sleep duration. Chronotype is mid-sleep on free days (MSF), because then we sleep by the body clock, not the alarm. If you sleep longer on free days than on workdays, you are catching up on the week's sleep debt – then MSF is moved earlier: MSFsc = MSF − (SDF − ØSD) ÷ 2, where ØSD is the average weekly sleep duration. Formulas: Roenneberg et al. (2003, 2004). The type bands are approximate, one hour wide; the middle of the adult distribution is around 4:00–5:00."}},
    {id:"ch-sjl", title:{pl:"Społeczny jet lag",en:"Social jetlag"}, unit:{pl:"godz.",en:"h"},
     rows:[["sdw",{pl:"sen w dni robocze",en:"sleep on workdays"}],["sdf",{pl:"sen w dni wolne",en:"sleep on free days"}],["sdweek",{pl:"średnio w tygodniu",en:"weekly average"}]],
     how:{pl:"Różnica między środkiem snu w dni wolne i robocze. Pokazuje, o ile godzin „przestawiasz zegar” między tygodniem a weekendem – jak przy zmianie strefy czasowej. Ponad 2 godziny to dużo.",
          en:"The difference between mid-sleep on free days and on workdays. It shows how many hours you “shift your clock” between the week and the weekend – like crossing time zones. Over 2 hours is a lot."}} ]};
  const status = o => { st=o; $("st-chr").textContent = L(o)||""; };
  $("chr-go").addEventListener("click", () => {
    const wd = +$("chr-wd").value, v = id => parse($(id).value);
    const soW=v("chr-sow"), seW=v("chr-sew"), soF=v("chr-sof"), seF=v("chr-sef");
    const alarm = document.querySelector('input[name="chr-alarm"]:checked');
    if([soF,seF].includes(null) || (wd>0 && [soW,seW].includes(null)) || !alarm){
      status({pl:"Uzupełnij wszystkie godziny i pytanie o budzik.",en:"Fill in all times and the alarm question."}); return; }
    const sdF = mod24(seF-soF), msF = mod24(soF+sdF/2);
    const sdW = wd>0 ? mod24(seW-soW) : sdF, msW = wd>0 ? mod24(soW+sdW/2) : msF;
    if([sdF,sdW].some(d => d<3 || d>14)){ status({pl:"Długość snu wychodzi poniżej 3 lub powyżej 14 godzin – sprawdź godziny.",en:"Sleep duration comes out below 3 or above 14 hours – check the times."}); return; }
    const sdWeek = (sdW*wd + sdF*(7-wd))/7;
    const msfsc = sdF > sdW ? mod24(msF - (sdF-sdWeek)/2) : msF;
    const sjl = Math.abs(signed(msF - msW));
    self.R = { workdays:wd, alarmFree: alarm.value==="yes", sleepOnsetW:wd>0?hhmm(soW):null, sleepEndW:wd>0?hhmm(seW):null, sleepOnsetF:hhmm(soF), sleepEndF:hhmm(seF),
      sdW, sdF, sdWeek, msW, msF, msfsc, sjl };
    status({pl:"Gotowe.",en:"Done."}); self.render(self.R); setSummary(self); markDone("chronotyp");
  });
  self.render = R => { setMain("ch-msf", hhmm(R.msfsc)); setRow("ch-msf","band", L(band(R.msfsc))); setRow("ch-msf","msf", hhmm(R.msF)); setRow("ch-msf","msw", R.workdays ? hhmm(R.msW) : "—");
    setMain("ch-sjl", nf(R.sjl,1)); setRow("ch-sjl","sdw", R.workdays ? dur(R.sdW) : "—"); setRow("ch-sjl","sdf", dur(R.sdF)); setRow("ch-sjl","sdweek", dur(R.sdWeek)); };
  self.summary = R => { const b = L(band(R.msfsc));
    const pl = `<p>Twój chronotyp to środek snu w dni wolne o <strong>${hhmm(R.msfsc)}</strong>, czyli <strong>${b}</strong>. U dorosłych środek rozkładu wypada mniej więcej między 4:00 a 5:00; nastolatki i młodzi dorośli są zwykle później, a z wiekiem chronotyp przesuwa się na wcześniej.</p>`
      + (R.workdays ? `<p>Społeczny jet lag: <strong>${nf(R.sjl,1)} h</strong> – ${R.sjl < 1 ? "mały, Twój rytm w tygodniu i w weekend jest podobny" : R.sjl < 2 ? "umiarkowany, typowy dla wielu osób pracujących lub uczących się" : "duży: w weekend żyjesz jakby w innej strefie czasowej niż w tygodniu"}.</p>` : "")
      + (R.alarmFree ? `<p>W dni wolne budzisz się z budzikiem, więc środek snu w dni wolne może być wcześniejszy niż Twój naturalny – wynik jest mniej pewny.</p>` : "")
      + `<p>Ten wynik zakłada stały rytm tygodnia; przy pracy zmianowej nie ma sensu.</p>`;
    const en = `<p>Your chronotype is mid-sleep on free days at <strong>${hhmm(R.msfsc)}</strong>, i.e. <strong>${b}</strong>. In adults the middle of the distribution is roughly between 4:00 and 5:00; teenagers and young adults are usually later, and chronotype moves earlier with age.</p>`
      + (R.workdays ? `<p>Social jetlag: <strong>${nf(R.sjl,1)} h</strong> – ${R.sjl < 1 ? "small, your rhythm is similar on weekdays and weekends" : R.sjl < 2 ? "moderate, typical of many people who work or study" : "large: at weekends you live as if in a different time zone than during the week"}.</p>` : "")
      + (R.alarmFree ? `<p>You use an alarm on free days, so your free-day mid-sleep may be earlier than your natural one – the result is less certain.</p>` : "")
      + `<p>This result assumes a regular weekly rhythm; it doesn't make sense for shift work.</p>`;
    return LANG==="pl" ? pl : en; };
  $("chr-wd").addEventListener("change", () => { const off = $("chr-wd").value==="0"; document.querySelectorAll(".chr-w").forEach(e => e.hidden = off); });
  LANGHOOKS.push(() => status(st));
  return self;
})();

export { Chrono, hhmm, signed };
