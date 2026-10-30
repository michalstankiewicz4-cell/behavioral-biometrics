// Test: vision-extra
import { Arena } from "../core/arena.js";
import { setMain, setRow, setSummary } from "../core/cards.js";
import { LANGHOOKS, SHOW } from "../core/registry.js";
import { $, css, nf, px } from "../core/utils.js";
import { L, LANG } from "../i18n/index.js";
import { markDone } from "../main.js";
import { Click } from "./target-clicking.js";
import { SLOAN, drawSloan } from "./vision.js";

// =====================================================================
// WZROK cd. — tarcza astygmatyczna i wrażliwość na kontrast
// =====================================================================
const Astig = (() => { const A=new Arena("cv-ast"); let S=null, st=null;
  const EYES=[{k:"left",pl:"lewe",en:"left"},{k:"right",pl:"prawe",en:"right"}];
  const self = { tab:"wzrok", key:"astygmatyzm", grid:"cards-ast", sumId:"sum-ast", R:null, title:{pl:"Tarcza astygmatyczna",en:"Astigmatism dial"}, specs:[
    {id:"as-res", title:{pl:"Twoje odpowiedzi",en:"Your answers"}, rows:[["left",{pl:"lewe oko",en:"left eye"}],["right",{pl:"prawe oko",en:"right eye"}]],
     how:{pl:"Tarcza ma linie w 12 kierunkach (jak godziny na zegarze). Przy astygmatyzmie oko inaczej ogniskuje światło w różnych kierunkach, więc część linii może wyglądać na ciemniejszą lub ostrzejszą. Strona tylko zapisuje Twoją odpowiedź; nie ocenia, czy masz astygmatyzm.",
          en:"The dial has lines in 12 directions (like clock hours). With astigmatism the eye focuses light differently in different directions, so some lines may look darker or sharper. The page only records your answer; it doesn't assess whether you have astigmatism."}}
  ]};
  const status = o => { st=o; $("st-ast").textContent = L(o)||""; };
  function draw(){ A.fit(); if(!A.w) return; const g=A.ctx, W=A.w, c=W/2, R=W/2-26; g.fillStyle="#fff"; g.fillRect(0,0,W,W); g.strokeStyle="#000"; g.lineWidth=1.6;
    for(let h=0;h<6;h++){ const a=h*Math.PI/6-Math.PI/2, ux=Math.cos(a), uy=Math.sin(a), px=-uy, py=ux;
      for(const o of [-4,0,4]){ g.beginPath(); g.moveTo(c-ux*R+px*o, c-uy*R+py*o); g.lineTo(c-ux*R*0.12+px*o, c-uy*R*0.12+py*o); g.moveTo(c+ux*R*0.12+px*o, c+uy*R*0.12+py*o); g.lineTo(c+ux*R+px*o, c+uy*R+py*o); g.stroke(); } }
    g.fillStyle="#000"; g.font=`600 14px ${css("--font-body")}`; g.textAlign="center"; g.textBaseline="middle";
    for(let h=1;h<=12;h++){ const a=h*Math.PI/6-Math.PI/2; g.fillText(String(h), c+Math.cos(a)*(R+14), c+Math.sin(a)*(R+14)); } }
  function buttons(){ $("ast-ans").innerHTML = S ? Array.from({length:12},(_,i)=>`<button type="button" data-h="${i+1}" class="${S.pick.includes(i+1)?"on":""}">${i+1}</button>`).join("")
      + `<button type="button" data-h="0">${LANG==="pl"?"Wszystkie jednakowe":"All the same"}</button><button type="button" class="primary" data-h="ok">${LANG==="pl"?"Dalej":"Next"}</button>` : ""; }
  function ask(){ const e=EYES[S.i]; S.pick=[]; buttons();
    status({pl:`Zasłoń ${S.i?"lewe":"prawe"} oko i patrz ${e.pl}m na środek tarczy. Kliknij numery linii, które wydają się ciemniejsze lub ostrzejsze, albo „Wszystkie jednakowe”.`,
            en:`Cover your ${S.i?"left":"right"} eye and look at the centre with your ${e.en} eye. Click the numbers of lines that look darker or sharper, or “All the same”.`}); }
  $("ast-ans").addEventListener("click", e => { const b=e.target.closest("button[data-h]"); if(!b||!S) return; const h=b.dataset.h;
    if(h==="ok"){ S.res[EYES[S.i].k]=S.pick.length?[...S.pick].sort((a,b)=>a-b):[]; S.i++; if(S.i<EYES.length) ask(); else finish(); return; }
    if(h==="0"){ S.pick=[]; S.res[EYES[S.i].k]=[]; S.i++; if(S.i<EYES.length) ask(); else finish(); return; }
    const n=+h; S.pick = S.pick.includes(n) ? S.pick.filter(x=>x!==n) : [...S.pick,n]; buttons(); });
  function finish(){ self.R={ left:S.res.left, right:S.res.right }; S=null; buttons(); status({pl:"Gotowe.",en:"Done."}); self.render(self.R); setSummary(self); markDone("wzrok"); }
  const fmt = a => a.length ? a.join(", ") : (LANG==="pl"?"wszystkie jednakowe":"all the same");
  self.render = R => { setRow("as-res","left",fmt(R.left)); setRow("as-res","right",fmt(R.right)); };
  self.summary = R => { const any=R.left.length||R.right.length;
    return LANG==="pl"
      ? `<p>Lewe oko: ${fmt(R.left)}. Prawe oko: ${fmt(R.right)}.</p><p>${any?"Wskazałeś kierunki, które wyglądały inaczej. Bywa to związane z astygmatyzmem, ale też z oświetleniem, ekranem czy zmęczeniem oczu. ":""}<strong>To nie jest badanie wzroku.</strong> Astygmatyzm rozpoznaje optometrysta lub okulista.</p>`
      : `<p>Left eye: ${fmt(R.left)}. Right eye: ${fmt(R.right)}.</p><p>${any?"You marked directions that looked different. This can be related to astigmatism, but also to lighting, the screen or eye strain. ":""}<strong>This is not an eye test.</strong> Astigmatism is diagnosed by an optometrist or ophthalmologist.</p>`; };
  $("ast-go").addEventListener("click", () => { S={i:0, res:{}, pick:[]}; draw(); ask(); });
  SHOW.wzrok = () => { draw(); Contrast.show(); };
  LANGHOOKS.push(() => { status(st); buttons(); });
  return self;
})();

const Contrast = (() => { const A=new Arena("cv-con"); let S=null, st=null;
  const LEVELS = Array.from({length:15},(_,i)=>Math.pow(10,-0.15*i));   // 100% … ok. 0,8%
  const self = { tab:"wzrok", key:"kontrast", grid:"cards-con", sumId:"sum-con", R:null, title:{pl:"Wrażliwość na kontrast",en:"Contrast sensitivity"}, specs:[
    {id:"cn-cs", title:{pl:"Wrażliwość na kontrast",en:"Contrast sensitivity"}, unit:{pl:"log CS",en:"log CS"}, rows:[["c",{pl:"najniższy rozpoznany kontrast",en:"lowest contrast recognised"}],["lv",{pl:"zaliczone poziomy",en:"levels passed"}]],
     how:{pl:"Litery mają stałą, dużą wielkość, ale coraz mniejszy kontrast z tłem (co 0,15 jednostki logarytmicznej, jak na tablicy Pelli-Robsona). Na każdym poziomie są 3 litery; poziom jest zaliczony przy 2 poprawnych. Wynik to <code>log₁₀(1 ÷ najniższy zaliczony kontrast)</code>. Ekran ma tylko 256 odcieni szarości, więc kontrast jest zaokrąglany do najbliższego możliwego, a jasność i ustawienia monitora mocno zmieniają wynik.",
          en:"Letters have a fixed large size but decreasing contrast with the background (in 0.15 log unit steps, as on the Pelli-Robson chart). Each level has 3 letters; it is passed at 2 correct. The result is <code>log₁₀(1 ÷ lowest passed contrast)</code>. A screen has only 256 grey levels, so contrast is rounded to the nearest possible value, and monitor brightness and settings change the result a lot."}}
  ]};
  const status = o => { st=o; $("st-con").textContent = L(o)||""; };
  const grey = c => Math.min(255, Math.round(255*(1-c)));
  function draw(){ A.fit(); if(!A.w) return; const g=A.ctx; g.fillStyle="#fff"; g.fillRect(0,0,A.w,A.h);
    if(!S||!S.cur){ g.fillStyle="#666"; g.font="15px "+css("--font-body"); g.textAlign="center"; g.textBaseline="middle"; g.fillText(LANG==="pl"?"Kliknij „Start”":"Click “Start”", A.w/2, A.h/2); return; }
    const h=Math.min(A.h*0.6, 180), v=grey(LEVELS[S.li]); g.fillStyle=g.strokeStyle=`rgb(${v},${v},${v})`; drawSloan(g, S.cur, (A.w-h)/2, (A.h-h)/2, h); }
  function answersUI(){ $("con-ans").innerHTML = S ? [...SLOAN].map(l=>`<button type="button" data-a="${l}">${l}</button>`).join("") + `<button type="button" data-a="?">${LANG==="pl"?"Nie widzę":"Can't see"}</button>` : ""; }
  function next(){ const o=[...SLOAN].filter(x=>x!==S.cur); S.cur=o[Math.floor(Math.random()*o.length)]; draw();
    const c=(255-grey(LEVELS[S.li]))/255; status({pl:`Kontrast ${nf(100*c,1)}% · litera ${S.k+1} z 3`,en:`Contrast ${nf(100*c,1)}% · letter ${S.k+1} of 3`}); }
  function answer(a){ if(!S||!S.cur) return; if(a===S.cur) S.ok++; S.k++;
    if(S.k>=3 || S.ok>=2 || S.k-S.ok>=2){ const c=(255-grey(LEVELS[S.li]))/255, pass=S.ok>=2; S.res.push({contrast:c, ok:S.ok, n:S.k, pass});
      if(!pass) return finish(); S.li++; S.k=0; S.ok=0; if(S.li>=LEVELS.length || grey(LEVELS[S.li])>=255) return finish(); }
    next(); }
  function finish(){ const passed=S.res.filter(r=>r.pass), last=passed.length?passed[passed.length-1].contrast:null;
    self.R={ logCS: last ? Math.log10(1/last) : 0, lowestContrast:last, levels:S.res }; S=null; answersUI(); draw(); status({pl:"Gotowe.",en:"Done."}); self.render(self.R); setSummary(self); markDone("wzrok"); }
  self.render = R => { setMain("cn-cs", nf(R.logCS,2)); setRow("cn-cs","c", R.lowestContrast ? nf(100*R.lowestContrast,1)+" %" : "—"); setRow("cn-cs","lv", R.levels.filter(l=>l.pass).length+" / "+LEVELS.length); };
  self.summary = R => LANG==="pl"
    ? `<p>Najniższy kontrast, przy którym rozpoznałeś litery, to <strong>${R.lowestContrast?nf(100*R.lowestContrast,1)+" %":"—"}</strong>, czyli wrażliwość na kontrast <strong>${nf(R.logCS,2)} log CS</strong>. Na tablicy Pelli-Robsona osoby z prawidłowym widzeniem uzyskują zwykle ok. 1,65–2,0.</p><p><strong>To nie jest badanie wzroku.</strong> Ekran, jego jasność i oświetlenie pokoju mają duży wpływ na wynik.</p>`
    : `<p>The lowest contrast at which you recognised letters is <strong>${R.lowestContrast?nf(100*R.lowestContrast,1)+" %":"—"}</strong>, a contrast sensitivity of <strong>${nf(R.logCS,2)} log CS</strong>. On the Pelli-Robson chart people with normal vision usually score about 1.65–2.0.</p><p><strong>This is not an eye test.</strong> The screen, its brightness and room lighting strongly affect the result.</p>`;
  $("con-go").addEventListener("click", () => { A.fit(); S={li:0, k:0, ok:0, res:[], cur:null}; answersUI(); next(); });
  $("con-ans").addEventListener("click", e => { const b=e.target.closest("button[data-a]"); if(b) answer(b.dataset.a); });
  document.addEventListener("keydown", e => { if(!S || $("tab-wzrok").hidden || /^(INPUT|TEXTAREA)$/.test(document.activeElement && document.activeElement.tagName)) return;
    if(e.key.length===1 && /[a-z]/i.test(e.key)){ e.preventDefault(); answer(e.key.toUpperCase()); } });
  self.show = () => draw();
  LANGHOOKS.push(() => { status(st); answersUI(); draw(); });
  return self;
})();

export { Astig, Contrast };
