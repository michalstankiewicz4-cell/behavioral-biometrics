// Test: password
import { Arena } from "../core/arena.js";
import { buildCards, setMain, setRow, setSummary } from "../core/cards.js";
import { $, css, mean, ms, nf, sd } from "../core/utils.js";
import { L, LANG } from "../i18n/index.js";
import { markDone, renderResults } from "../main.js";

// =====================================================================
// 7. HASŁO — profil rytmu wpisywania hasła i test zgodności
// =====================================================================
const Pass = (() => { const N=5, MINLEN=6, FLOOR=10;
  const inp=$("pass-input"), A=new Arena("cv-pass");
  let P, cur, st=null;
  const self = { tab:"haslo", grid:"cards-pass", sumId:"sum-pass", R:null, title:{pl:"Hasło",en:"Password"}, specs:[
    {id:"h-last", title:{pl:"Ostatni test",en:"Last test"}, unit:{pl:"odległość",en:"distance"},
     rows:[["th",{pl:"próg zgodności",en:"match threshold"}],["ver",{pl:"werdykt",en:"verdict"}]],
     how:{pl:"Każde wpisanie zamieniam na wektor cech: czas przytrzymania każdego klawisza i odstęp <code>keydown → keydown</code> między kolejnymi klawiszami. Odległość to skalowana odległość Manhattan: średnia z <code>|wartość − średnia z profilu| ÷ średnie odchylenie z profilu</code>. 0 oznacza wpisanie identyczne ze średnią z profilu, 1 to typowe odchylenie.",
          en:"Each entry becomes a feature vector: how long each key is held and the <code>keydown → keydown</code> gap between consecutive keys. The distance is a scaled Manhattan distance: the mean of <code>|value − profile mean| ÷ profile mean deviation</code>. 0 means identical to the profile average, 1 is a typical deviation."}},
    {id:"h-tests", title:{pl:"Testy",en:"Tests"}, unit:{pl:"zgodnych",en:"matching"},
     rows:[["all",{pl:"wszystkich testów",en:"tests in total"}],["rej",{pl:"odrzuconych",en:"rejected"}]],
     how:{pl:"Test zgadza się z profilem, gdy jego odległość nie przekracza progu. Możesz dać wpisać hasło komuś innemu i sprawdzić, czy zostanie odrzucony.",
          en:"A test matches the profile when its distance does not exceed the threshold. You can let someone else type your password and see whether they get rejected."}},
    {id:"h-cons", title:{pl:"Powtarzalność",en:"Consistency"}, unit:{pl:"ms (średnie odchylenie)",en:"ms (mean deviation)"},
     rows:[["loo",{pl:"odległości wpisań próbnych",en:"enrollment distances"}]],
     how:{pl:`Średnie odchylenie bezwzględne każdej cechy w ${N} wpisaniach próbnych (minimum ${FLOOR} ms, żeby nie dzielić przez prawie zero). Mniej oznacza bardziej powtarzalne pisanie. Próg: każde wpisanie próbne porównuję z profilem zbudowanym z pozostałych. Próg to większa z dwóch wartości: najgorszy wynik tych porównań albo średnia + 2 odchylenia.`,
          en:`The mean absolute deviation of each feature over the ${N} enrollment entries (at least ${FLOOR} ms, to avoid dividing by almost zero). Lower means more repeatable typing. Threshold: each enrollment entry is compared with a profile built from the others. The threshold is the larger of: the worst of those results, or mean + 2 standard deviations.`}},
    {id:"h-feat", title:{pl:"Cechy",en:"Features"}, unit:{pl:"cech czasowych",en:"timing features"},
     rows:[["dw",{pl:"przytrzymania",en:"hold times"}],["dd",{pl:"odstępy",en:"intervals"}],["en",{pl:"wpisań w profilu",en:"entries in profile"}]],
     how:{pl:"Hasło o <i>n</i> znakach daje <i>n</i> czasów przytrzymania i <i>n</i>−1 odstępów. Wpisanie z poprawkami (Backspace, strzałki), wklejeniem lub innym tekstem jest odrzucane i nie trafia do profilu. Samo hasło nie jest nigdzie zapisywane ani eksportowane.",
          en:"A password of <i>n</i> characters gives <i>n</i> hold times and <i>n</i>−1 intervals. Entries with corrections (Backspace, arrows), pasting or different text are rejected and don't enter the profile. The password itself is never stored or exported."}}
  ]};
  const status = o => { st=o; $("pass-status").textContent = L(o) || ""; };
  const newAttempt = () => { cur={keys:[], dirty:false}; inp.value=""; };

  function label(){
    $("pass-label").textContent = P.prof
      ? (LANG==="pl" ? "Test: wpisz hasło i naciśnij Enter." : "Test: type the password and press Enter.")
      : (LANG==="pl" ? `Wpisanie ${P.enroll.length+1} z ${N}: ${P.enroll.length?"wpisz to samo hasło":`wymyśl hasło (min. ${MINLEN} znaków)`} i naciśnij Enter.`
                     : `Entry ${P.enroll.length+1} of ${N}: ${P.enroll.length?"type the same password":`make up a password (min. ${MINLEN} characters)`} and press Enter.`);
    $("pass-steps").innerHTML = Array.from({length:N},(_,i)=>`<span class="${i<P.enroll.length?"ok":(i===P.enroll.length&&!P.prof?"now":"")}">${i+1}</span>`).join("")
      + `<span class="${P.prof?"now":""}">test</span>`;
  }

  inp.addEventListener("keydown", e => {
    if(e.key==="Enter"){ e.preventDefault(); submit(); return; }
    if(e.repeat) return;
    if(["Backspace","Delete","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(e.key)){ cur.dirty=true; return; }
    if(e.key.length===1) cur.keys.push({code:e.code, key:e.key, down:performance.now(), up:null});
  });
  inp.addEventListener("keyup", e => { const t=performance.now();
    for(let i=cur.keys.length-1;i>=0;i--){ const k=cur.keys[i]; if(k.code===e.code && k.up==null){ k.up=t; break; } } });
  inp.addEventListener("beforeinput", e => {
    if(["insertFromPaste","insertFromDrop"].includes(e.inputType)){ e.preventDefault(); cur.dirty=true; }
    else if(!e.inputType.startsWith("insertText") && e.inputType!=="insertCompositionText") cur.dirty=true; });
  inp.addEventListener("paste", e => e.preventDefault());
  inp.addEventListener("drop", e => e.preventDefault());
  $("pass-reset").addEventListener("click", reset);

  const vec = () => { const k=cur.keys; if(k.some(x=>x.up==null)) return null;
    return k.map(x=>x.up-x.down).concat(k.slice(1).map((x,i)=>x.down-k[i].down)); };
  function stats(vs){ const mu=[], a=[];
    for(let i=0;i<vs[0].length;i++){ const col=vs.map(v=>v[i]), m=mean(col); mu.push(m); a.push(Math.max(FLOOR, mean(col.map(c=>Math.abs(c-m))))); }
    return {mu,a}; }
  const dist = (x,mu,a) => { let s=0; for(let i=0;i<x.length;i++) s+=Math.abs(x[i]-mu[i])/a[i]; return s/x.length; };
  function build(){ const {mu,a}=stats(P.enroll);
    const loo=P.enroll.map((v,j)=>{ const o=stats(P.enroll.filter((_,k)=>k!==j)); return dist(v,o.mu,o.a); });
    P.prof={mu, a, loo, th:Math.max(Math.max(...loo), mean(loo)+2*sd(loo))}; }

  function submit(){
    const v=inp.value, typed=cur.keys.map(x=>x.key).join("");
    if(!P.pw && v.length<MINLEN){ status({pl:`Hasło musi mieć co najmniej ${MINLEN} znaków.`,en:`The password needs at least ${MINLEN} characters.`}); newAttempt(); return; }
    if(P.pw && v!==P.pw){ status({pl:"To nie jest to samo hasło. Spróbuj jeszcze raz.",en:"That's not the same password. Try again."}); newAttempt(); return; }
    if(cur.dirty || typed!==v){ status({pl:"Wpisanie z poprawką albo wklejeniem nie liczy się. Wpisz hasło jeszcze raz, bez poprawek.",en:"Entries with corrections or pasting don't count. Type the password again without corrections."}); newAttempt(); return; }
    const x=vec();
    if(!x){ status({pl:"Puść wszystkie klawisze przed naciśnięciem Enter i spróbuj jeszcze raz.",en:"Release all keys before pressing Enter and try again."}); newAttempt(); return; }
    if(!P.prof){
      if(!P.pw) P.pw=v;
      P.enroll.push(x);
      if(P.enroll.length>=N){ build(); update();
        status({pl:"Profil gotowy. Teraz wpisz hasło w trybie testu albo daj spróbować komuś innemu.",en:"Profile ready. Now type the password in test mode, or let someone else try."}); }
      else status({pl:`Zapisano wpisanie ${P.enroll.length} z ${N}.`,en:`Saved entry ${P.enroll.length} of ${N}.`});
    } else {
      const d=dist(x,P.prof.mu,P.prof.a), ok=d<=P.prof.th;
      P.tests.push({d, ok, x}); update();
      status(ok ? {pl:`Zgadza się z profilem (odległość ${nf(d,2)}, próg ${nf(P.prof.th,2)}).`,en:`Matches the profile (distance ${nf(d,2)}, threshold ${nf(P.prof.th,2)}).`}
                : {pl:`Nie zgadza się z profilem (odległość ${nf(d,2)}, próg ${nf(P.prof.th,2)}).`,en:`Does not match the profile (distance ${nf(d,2)}, threshold ${nf(P.prof.th,2)}).`});
    }
    label(); newAttempt(); chart(); history();
  }
  function update(){
    // w wyniku nie ma hasła, są tylko czasy
    self.R = { length:P.enroll[0] ? (P.enroll[0].length+1)/2 : 0, enroll:P.enroll, mean:P.prof.mu, deviation:P.prof.a, enrollDistances:P.prof.loo,
      threshold:P.prof.th, tests:P.tests.map(t=>({distance:t.d, match:t.ok, timings:t.x})) };
    self.render(self.R); setSummary(self); markDone("haslo");
  }
  function history(){
    $("pass-history").innerHTML = P.tests.map((t,i)=>`<span class="chip ${t.ok?"ok":"no"}">#${i+1} ${nf(t.d,2)} ${t.ok?"✓":"✗"}</span>`).join("");
  }
  self.render = R => { const last=R.tests[R.tests.length-1], acc=R.tests.filter(t=>t.match).length;
    setMain("h-last", last ? nf(last.distance,2) : "—"); setRow("h-last","th",nf(R.threshold,2));
    setRow("h-last","ver", last ? (last.match ? (LANG==="pl"?"zgodne":"match") : (LANG==="pl"?"niezgodne":"no match")) : "—");
    setMain("h-tests", acc); setRow("h-tests","all",R.tests.length); setRow("h-tests","rej",R.tests.length-acc);
    setMain("h-cons", nf(mean(R.deviation))); setRow("h-cons","loo", R.enrollDistances.map(d=>nf(d,2)).join(" · "));
    setMain("h-feat", R.mean.length); setRow("h-feat","dw",R.length); setRow("h-feat","dd",R.length-1); setRow("h-feat","en",R.enroll.length); };
  self.summary = R => { const last=R.tests[R.tests.length-1], acc=R.tests.filter(t=>t.match).length;
    if(LANG==="pl") return `<p>Profil powstał z ${R.enroll.length} wpisań hasła (${R.length} znaków, ${R.mean.length} cech czasowych). Próg zgodności wynosi <strong>${nf(R.threshold,2)}</strong>.</p>`
      + (last ? `<p>Ostatni test: odległość <strong>${nf(last.distance,2)}</strong>, więc wpisanie <strong>${last.match?"zgadza się":"nie zgadza się"}</strong> z profilem. Zgodnych testów: ${acc} z ${R.tests.length}.</p>` : `<p>Nie było jeszcze żadnego testu.</p>`);
    return `<p>The profile was built from ${R.enroll.length} password entries (${R.length} characters, ${R.mean.length} timing features). The match threshold is <strong>${nf(R.threshold,2)}</strong>.</p>`
      + (last ? `<p>Last test: distance <strong>${nf(last.distance,2)}</strong>, so the entry <strong>${last.match?"matches":"does not match"}</strong> the profile. Matching tests: ${acc} of ${R.tests.length}.</p>` : `<p>No test yet.</p>`); };

  // Wykres: dla każdej cechy pasmo średnia ± odchylenie, kropki wpisań próbnych i ostatni test
  function chart(){
    A.fit(); if(!A.w) return; A.clear(); const g=A.ctx;
    if(!P.enroll.length){ A.label(LANG==="pl"?"Wykres pojawi się po pierwszym wpisaniu hasła":"The chart appears after the first password entry"); return; }
    const m=P.enroll[0].length, n=(m+1)/2, {mu,a}=P.prof||stats(P.enroll);
    const last=P.tests[P.tests.length-1];
    let ymax=0; for(let i=0;i<m;i++){ ymax=Math.max(ymax,mu[i]+2*a[i]); for(const v of P.enroll) ymax=Math.max(ymax,v[i]); if(last) ymax=Math.max(ymax,last.x[i]); }
    const step = ymax>800?200:ymax>400?100:ymax>150?50:25; ymax=Math.ceil(ymax*1.05/step)*step;
    const L0=48, R0=12, T0=12, B0=40, W=A.w-L0-R0, H=A.h-T0-B0, cw=W/m;
    const y = v => T0+H-(Math.max(0,v)/ymax)*H, x = i => L0+cw*(i+0.5);
    g.font="11px "+css("--font-mono"); g.fillStyle=css("--muted"); g.textAlign="right"; g.textBaseline="middle";
    g.strokeStyle=css("--line"); g.lineWidth=1;
    for(let v=0; v<=ymax; v+=step){ g.beginPath(); g.moveTo(L0,y(v)); g.lineTo(A.w-R0,y(v)); g.stroke(); g.fillText(v+" ms",L0-6,y(v)); }
    g.beginPath(); g.moveTo(L0+cw*n, T0); g.lineTo(L0+cw*n, T0+H); g.setLineDash([4,4]); g.stroke(); g.setLineDash([]);
    const acc=css("--accent");
    for(let i=0;i<m;i++){
      const bw=Math.min(28,cw*0.6);
      g.globalAlpha=0.18; g.fillStyle=acc; g.fillRect(x(i)-bw/2, y(mu[i]+a[i]), bw, Math.max(1,y(mu[i]-a[i])-y(mu[i]+a[i]))); g.globalAlpha=1;
      g.strokeStyle=acc; g.lineWidth=2; g.beginPath(); g.moveTo(x(i)-bw/2,y(mu[i])); g.lineTo(x(i)+bw/2,y(mu[i])); g.stroke();
      for(const v of P.enroll) A.dot(x(i), y(v[i]), 2.2, css("--muted"));
      if(last){ const off=Math.abs(last.x[i]-mu[i])<=2*a[i]; A.dot(x(i), y(last.x[i]), 4.5, off?css("--ok"):css("--err")); }
      g.fillStyle=css("--muted"); g.textAlign="center"; g.textBaseline="top";
      g.fillText(i<n ? String(i+1) : `${i-n+1}→${i-n+2}`, x(i), T0+H+5);
    }
    g.font="12px "+css("--font-body"); g.fillStyle=css("--ink");
    g.fillText(LANG==="pl"?"przytrzymanie klawisza nr":"hold time of key no.", L0+cw*n/2, T0+H+22);
    g.fillText(LANG==="pl"?"odstęp między klawiszami":"interval between keys", L0+cw*n+cw*(m-n)/2, T0+H+22);
  }
  function reset(){
    P={pw:null, enroll:[], prof:null, tests:[]}; self.R=null; newAttempt(); status(null);
    const tab=document.querySelector('#tabs a[data-tab="haslo"]'); if(tab) tab.classList.remove("done");
    if($(self.grid).children.length){ buildCards(self.grid, self.specs); setSummary(self); renderResults(); }
    label(); history(); chart();
  }
  self.reset = reset; self.chart = chart;
  self.onLang = () => { label(); status(st); history(); chart(); };
  P={pw:null, enroll:[], prof:null, tests:[]}; newAttempt();
  return self;
})();

export { Pass };
