// Pomocnicze: DOM, statystyka, formatowanie liczb, miary ruchu
import { LANG } from "../i18n/index.js";

const $ = id => document.getElementById(id);
// ---------- statystyka i formatowanie ----------
const mean = a => a.length ? a.reduce((s,x)=>s+x,0)/a.length : NaN;
const median = a => { if(!a.length) return NaN; const b=[...a].sort((x,y)=>x-y), m=b.length>>1; return b.length%2?b[m]:(b[m-1]+b[m])/2; };
const sd = a => { if(a.length<2) return NaN; const m=mean(a); return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)); };
const nf = (x,d=0) => Number.isFinite(x) ? x.toLocaleString(LANG==="pl"?"pl-PL":"en-US",{minimumFractionDigits:d,maximumFractionDigits:d}) : "—";
const ms = x => Number.isFinite(x) ? nf(x)+" ms" : "—";
const px = (x,d=1) => Number.isFinite(x) ? nf(x,d)+" px" : "—";
const pct = (x,d=0) => Number.isFinite(x) ? nf(100*x,d)+" %" : "—";
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const hyp = (ax,ay,bx,by) => Math.hypot(ax-bx, ay-by);
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

// Drżenie: odchylenie punktów od średniej kroczącej (okno 2h+1 próbek), zwraca sumę kwadratów i liczbę
function tremorAcc(seg, h=3){
  let sum=0, n=0;
  for(let i=h;i<seg.length-h;i++){
    let mx=0,my=0; for(let j=i-h;j<=i+h;j++){ mx+=seg[j].x; my+=seg[j].y; }
    mx/=2*h+1; my/=2*h+1;
    sum += (seg[i].x-mx)**2 + (seg[i].y-my)**2; n++;
  }
  return {sum,n};
}
const tremorRMS = segs => { let s=0,n=0; for(const seg of segs){ const r=tremorAcc(seg); s+=r.sum; n+=r.n; } return n ? Math.sqrt(s/n) : NaN; };
// Zatrzymania: odcinki z prędkością < 20 px/s trwające ≥ 150 ms
function countPauses(seg){
  let c=0, a=null, b=null;
  for(let i=1;i<seg.length;i++){
    const dt=seg[i].t-seg[i-1].t; if(dt<=0) continue;
    const v=hyp(seg[i].x,seg[i].y,seg[i-1].x,seg[i-1].y)/(dt/1000);
    if(v<20){ if(a==null) a=seg[i-1].t; b=seg[i].t; }
    else { if(a!=null && b-a>=150) c++; a=null; }
  }
  if(a!=null && b-a>=150) c++;
  return c;
}
const pathLen = pts => { let s=0; for(let i=1;i<pts.length;i++) s+=hyp(pts[i].x,pts[i].y,pts[i-1].x,pts[i-1].y); return s; };

export { $, mean, median, sd, nf, ms, px, pct, esc, hyp, css, tremorAcc, tremorRMS, countPauses, pathLen };
