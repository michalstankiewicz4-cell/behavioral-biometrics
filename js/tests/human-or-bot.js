// Test: human-or-bot
import { Arena } from "../core/arena.js";
import { setMain, setRow, setSummary } from "../core/cards.js";
import { LANGHOOKS, LEAVE, SHOW } from "../core/registry.js";
import { $, css, hyp, mean, ms, nf, pathLen, px, sd, tremorRMS } from "../core/utils.js";
import { D, L, LANG } from "../i18n/index.js";
import { markDone } from "../main.js";
import { Click } from "./target-clicking.js";

// =====================================================================
// CZŁOWIEK CZY BOT — cechy ruchu myszki, po których zabezpieczenia odróżniają ludzi od skryptów
// =====================================================================
const Bot = (() => { const N=5, RAD=22;
  const A=new Arena("cv-bot"); let S=null, st=null, human=null, bot=null, anim=null;
  const SIGNS = [
    ["straight", {pl:"prostoliniowość",en:"straightness"}, v=>v>0.995, ">0,995"],
    ["speedCV",  {pl:"zmienność prędkości (CV)",en:"speed variability (CV)"}, v=>v<0.15, "<0,15"],
    ["tremor",   {pl:"drżenie",en:"tremor"}, v=>v<0.15, "<0,15 px"],
    ["offset",   {pl:"odległość kliknięcia od środka",en:"click distance from centre"}, v=>v<1, "<1 px"],
    ["hold",     {pl:"przytrzymanie przycisku",en:"button hold"}, v=>v<5, "<5 ms"]
  ];
  const fmt = (k,v) => !Number.isFinite(v) ? "—" : k==="straight"||k==="speedCV" ? nf(v,3) : k==="hold" ? ms(v) : px(v,2);
  const self = { tab:"bot", key:"czlowiek-czy-bot", grid:"cards-bot", sumId:"sum-bot", R:null, title:{pl:"Człowiek czy bot",en:"Human or bot"}, specs:[
    {id:"bot-v", title:{pl:"Oznaki bota",en:"Bot signs"}, unit:{pl:`z ${SIGNS.length} (Ty)`,en:`of ${SIGNS.length} (you)`}, rows:[["bot",{pl:"bot",en:"bot"}],["ver",{pl:"werdykt dla Ciebie",en:"verdict for you"}]],
     how:{pl:"Każda miara ma próg, poniżej lub powyżej którego ruch wygląda „nieludzko”. Werdykt „bot” zapada przy co najmniej 3 oznakach. Prawdziwe systemy (np. zabezpieczenia logowania) łączą dziesiątki takich cech i uczą się na milionach sesji, a do tego sprawdzają przeglądarkę, sieć i historię; ta zakładka pokazuje tylko zasadę.",
          en:"Each measure has a threshold beyond which movement looks “inhuman”. The verdict is “bot” with at least 3 signs. Real systems (e.g. login protection) combine dozens of such features learned from millions of sessions and also check the browser, network and history; this tab only shows the principle."}},
    {id:"bot-m", title:{pl:"Ty kontra bot",en:"You vs bot"}, rows:SIGNS.map(([k,l])=>[k,l]),
     how:{pl:"Średnie z 5 ruchów: prostoliniowość = odległość prosta ÷ długość drogi; zmienność prędkości = odchylenie ÷ średnia prędkości między kolejnymi próbkami (człowiek przyspiesza i zwalnia, prosty bot jedzie równo); drżenie = odchylenie punktów od średniej z 7 sąsiednich; odległość kliknięcia od środka celu; czas trzymania przycisku. Format: Ty / bot.",
          en:"Means over 5 movements: straightness = straight distance ÷ path length; speed variability = std ÷ mean of speed between samples (people accelerate and slow down, a simple bot moves evenly); tremor = points' offset from the mean of 7 neighbours; click distance from the target centre; button hold time. Format: you / bot."}}
  ]};
  const status = o => { st=o; $("st-bot").textContent = L(o)||""; };
  function metrics(trials){
    const per = trials.map(t => {
      const pts=t.path, D=hyp(t.to.x,t.to.y,t.from.x,t.from.y), len=pathLen(pts);
      const v=[]; for(let i=1;i<pts.length;i++){ const dt=pts[i].t-pts[i-1].t; if(dt>0) v.push(hyp(pts[i].x,pts[i].y,pts[i-1].x,pts[i-1].y)/dt); }
      return { straight: len>0 ? Math.min(1,D/len) : 1, speedCV: sd(v)/mean(v), tremor: tremorRMS([pts]), offset: hyp(t.click.x,t.click.y,t.tx,t.ty), hold: t.hold };
    });
    const m={}; SIGNS.forEach(([k])=>m[k]=mean(per.map(p=>p[k]).filter(Number.isFinite)));
    m.signs = SIGNS.filter(([k,,f])=>f(m[k])).length; return m;
  }
  function target(from){ let p,k=0; do{ p=A.rnd(RAD+20); k++; } while(hyp(p.x,p.y,from.x,from.y)<250 && k<200); return p; }
  function draw(cursor){ A.fit(); if(!A.w) return; A.clear();
    if(S && S.cur){ A.dot(S.cur.from.x,S.cur.from.y,RAD,css("--muted"),!S.cur.started,2); if(S.cur.started) A.dot(S.cur.tx,S.cur.ty,RAD,css("--accent")); }
    if(cursor){ const g=A.ctx; g.fillStyle=css("--err"); g.beginPath(); g.moveTo(cursor.x,cursor.y); g.lineTo(cursor.x,cursor.y+18); g.lineTo(cursor.x+5,cursor.y+13); g.lineTo(cursor.x+12,cursor.y+13); g.closePath(); g.fill(); }
    if(!S) A.label(LANG==="pl"?"Kliknij „Start” i rób to, co zwykle: klikaj kółka":"Click “Start” and just click the circles as usual");
  }
  function newTrial(){ const from={x:A.w*0.15+Math.random()*A.w*0.1, y:A.h*(0.25+Math.random()*0.5)}, t=target(from);
    S.cur={from, tx:t.x, ty:t.y, to:t, path:[], started:false}; draw();
    status({pl:`Ruch ${S.trials.length+1} z ${N}: kliknij szare kółko, potem niebieskie.`,en:`Movement ${S.trials.length+1} of ${N}: click the grey circle, then the blue one.`}); }
  A.c.addEventListener("pointerdown", e => { if(!S||!S.cur||anim) return; e.preventDefault(); const p=A.pos(e), c=S.cur;
    if(!c.started){ if(hyp(p.x,p.y,c.from.x,c.from.y)<=RAD){ c.started=true; c.path=[p]; draw(); } return; }
    if(hyp(p.x,p.y,c.tx,c.ty)<=RAD){ c.click=p; c.down=p.t; } });
  A.c.addEventListener("pointermove", e => { if(S && S.cur && S.cur.started && !S.cur.click) S.cur.path.push(...A.moves(e)); });
  A.c.addEventListener("pointerup", e => { if(!S||!S.cur||!S.cur.click) return; const c=S.cur; c.hold=A.pos(e).t-c.down; c.path.push(c.click);
    S.trials.push(c); if(S.trials.length<N) newTrial(); else { human=metrics(S.trials); S=null; done(); draw();
      status({pl:"Gotowe. Teraz kliknij „Puść bota” i porównaj.",en:"Done. Now click “Release the bot” and compare."}); } });
  A.c.addEventListener("contextmenu", e => e.preventDefault());
  $("bot-go").addEventListener("click", () => { if(anim) return; A.fit(); S={trials:[]}; newTrial(); });
  // Bot: idealnie prosta linia, stała prędkość, próbki co 16 ms, kliknięcie dokładnie w środek, bez przytrzymania
  $("bot-run").addEventListener("click", () => { if(anim) return; A.fit(); S={trials:[]};
    const trials=[]; let k=0;
    const one = () => { if(k>=N){ bot=metrics(trials); S=null; anim=null; done(); draw(); status({pl:"Bot skończył. Porównanie poniżej.",en:"The bot is done. Comparison below."}); return; }
      const from={x:A.w*0.15+Math.random()*A.w*0.1, y:A.h*(0.25+Math.random()*0.5)}, t=target(from);
      S.cur={from, tx:t.x, ty:t.y, to:t, started:true}; const D=hyp(t.x,t.y,from.x,from.y), steps=Math.max(2,Math.round(D/9)), path=[];
      for(let i=0;i<=steps;i++) path.push({x:from.x+(t.x-from.x)*i/steps, y:from.y+(t.y-from.y)*i/steps, t:i*16});
      let i=0; status({pl:`Bot: ruch ${k+1} z ${N}`,en:`Bot: movement ${k+1} of ${N}`});
      anim = setInterval(() => { draw(path[i]); i++; if(i>path.length-1){ clearInterval(anim);
        trials.push({from, to:t, tx:t.x, ty:t.y, path, click:{x:t.x,y:t.y}, hold:0}); k++; setTimeout(one, 250); } }, 16); };
    one(); });
  function done(){ const R = { human, bot, thresholds:Object.fromEntries(SIGNS.map(([k,,,th])=>[k,th])) }; self.render(R); if(human){ self.R=R; setSummary(self); markDone("bot"); } }
  self.render = R => { const h=R.human||{}, b=R.bot||{};
    setMain("bot-v", R.human ? h.signs : "—"); setRow("bot-v","bot", R.bot ? `${b.signs} / ${SIGNS.length}` : (LANG==="pl"?"jeszcze nie puszczony":"not released yet"));
    setRow("bot-v","ver", R.human ? (h.signs>=3 ? (LANG==="pl"?"wyglądasz na bota":"you look like a bot") : (LANG==="pl"?"wyglądasz na człowieka":"you look human")) : "—");
    SIGNS.forEach(([k,,f,th]) => setRow("bot-m",k, `${fmt(k,h[k])} / ${fmt(k,b[k])}  (${LANG==="pl"?"bot":"bot"} ${th})`)); };
  self.summary = R => { const h=R.human, b=R.bot;
    if(LANG==="pl") return `<p>Twój ruch ma <strong>${h.signs} z ${SIGNS.length}</strong> oznak bota, więc ${h.signs>=3?"<strong>wygląda na bota</strong> (ciekawe!)":"<strong>wygląda na ludzki</strong>"}.`
      + (b ? ` Bot ma ${b.signs} z ${SIGNS.length}: jedzie idealnie prosto i równo, klika dokładnie w środek i nie trzyma przycisku.</p>` : ` Kliknij „Puść bota”, żeby porównać.</p>`)
      + `<p>Sprytniejsze boty dodają losowe drgania i krzywe przyspieszenia, dlatego prawdziwe zabezpieczenia patrzą na wiele cech naraz.</p>`;
    return `<p>Your movement shows <strong>${h.signs} of ${SIGNS.length}</strong> bot signs, so it ${h.signs>=3?"<strong>looks like a bot</strong> (interesting!)":"<strong>looks human</strong>"}.`
      + (b ? ` The bot shows ${b.signs} of ${SIGNS.length}: it moves perfectly straight and evenly, clicks the exact centre and doesn't hold the button.</p>` : ` Click “Release the bot” to compare.</p>`)
      + `<p>Smarter bots add random jitter and acceleration curves, which is why real protection looks at many features at once.</p>`; };
  SHOW.bot = () => draw();
  LEAVE.bot = () => { if(S && !anim){ S=null; } };
  LANGHOOKS.push(() => { status(st); if(!anim) draw(); });
  return self;
})();

export { Bot };
