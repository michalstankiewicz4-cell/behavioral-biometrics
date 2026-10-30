// Płótno zadań (canvas) i wspólny szkielet zadań z myszką
import { setSummary } from "./cards.js";
import { $, css } from "./utils.js";
import { D, L, LANG } from "../i18n/index.js";
import { markDone } from "../main.js";

// ---------- pole zadania (canvas) ----------
class Arena{
  constructor(id){ this.c=$(id); this.ctx=this.c.getContext("2d"); this.w=0; this.h=0; }
  fit(){ const r=this.c.getBoundingClientRect(); if(!r.width) return; const d=window.devicePixelRatio||1;
    this.w=r.width; this.h=r.height; this.c.width=Math.round(r.width*d); this.c.height=Math.round(r.height*d); this.ctx.setTransform(d,0,0,d,0,0); }
  pos(e){ const r=this.c.getBoundingClientRect(); return {x:e.clientX-r.left, y:e.clientY-r.top, t:e.timeStamp}; }
  moves(e){ const l = e.getCoalescedEvents ? e.getCoalescedEvents() : []; return (l.length?l:[e]).map(x=>this.pos(x)); }
  clear(){ this.ctx.clearRect(0,0,this.w,this.h); }
  dot(x,y,r,color,fill=true,lw=1.5){ const g=this.ctx; g.beginPath(); g.arc(x,y,r,0,Math.PI*2);
    if(fill){ g.fillStyle=color; g.fill(); } else { g.strokeStyle=color; g.lineWidth=lw; g.stroke(); } }
  label(s,y){ const g=this.ctx; g.fillStyle=css("--muted"); g.font="15px "+css("--font-body"); g.textAlign="center"; g.textBaseline="middle"; g.fillText(s,this.w/2,y??this.h/2); }
  rnd(m){ return {x:m+Math.random()*(this.w-2*m), y:m+Math.random()*(this.h-2*m)}; }
}

// Wspólny szkielet zadań z myszką
function mouseTask(o){
  const A = new Arena(o.canvas);
  const t = { tab:o.tab, grid:o.grid, sumId:o.sumId, specs:o.specs, R:null, S:null, A, st:null, title:o.title,
    summary:o.summary, render:o.render };
  t.status = obj => { t.st = obj; $(o.statusId).textContent = L(obj) || ""; };
  t.idle = () => { A.fit(); A.clear(); A.label(t.R ? D[LANG].done_canvas : D[LANG].idle); };
  t.abort = () => { if(t.S && t.S.raf) cancelAnimationFrame(t.S.raf); if(t.S && t.S.phase!=="done"){ t.S=null; t.status(null); } t.idle(); };
  t.redraw = () => { if(t.S && t.S.phase!=="done" && o.draw) o.draw(t); else t.idle(); };
  t.finish = () => { t.S.phase="done"; t.R = o.analyse(t); t.render(t.R); setSummary(t); t.status({pl:"Gotowe.",en:"Done."}); t.idle(); markDone(t.tab); };
  $(o.go).addEventListener("click", () => { t.abort(); A.fit(); o.start(t); });
  const c = A.c;
  c.addEventListener("pointerdown", e => { if(t.S && t.S.phase!=="done"){ e.preventDefault(); o.down && o.down(t, A.pos(e), e); } });
  c.addEventListener("pointermove", e => { if(t.S && t.S.phase!=="done") o.move && o.move(t, A.moves(e), e); });
  c.addEventListener("pointerup", e => { if(t.S && t.S.phase!=="done") o.up && o.up(t, A.pos(e), e); });
  c.addEventListener("dblclick", e => e.preventDefault());
  c.addEventListener("contextmenu", e => e.preventDefault());
  return t;
}

export { Arena, mouseTask };
