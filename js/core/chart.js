// Wykres punktowy i regresja liniowa
import { css, mean, nf } from "./utils.js";

// ---------- prosty wykres punktowy z linią dopasowania (dla Hicka, Fittsa, tappingu) ----------
function linfit(xs, ys){ const mx=mean(xs), my=mean(ys); let sxy=0, sxx=0, syy=0;
  for(let i=0;i<xs.length;i++){ sxy+=(xs[i]-mx)*(ys[i]-my); sxx+=(xs[i]-mx)**2; syy+=(ys[i]-my)**2; }
  const b=sxx?sxy/sxx:NaN, a=my-b*mx; return { a, b, r2: (sxx&&syy) ? (sxy*sxy)/(sxx*syy) : NaN }; }
function plotXY(A, o){ A.fit(); if(!A.w) return; const g=A.ctx; A.clear();
  const xs=o.pts.map(p=>p.x), ys=o.pts.map(p=>p.y); if(!xs.length){ A.label(o.empty||""); return; }
  let x0=o.x0??Math.min(...xs), x1=Math.max(...xs), y0=o.y0??0, y1=Math.max(...ys);
  if(o.line){ y1=Math.max(y1, o.line.a+o.line.b*x1); } if(x1===x0) x1=x0+1; x1+=(x1-x0)*0.04; y1=y1*1.1||1;
  const L0=58, R0=14, T0=14, B0=40, W=A.w-L0-R0, H=A.h-T0-B0, X=v=>L0+(v-x0)/(x1-x0)*W, Y=v=>T0+H-(v-y0)/(y1-y0)*H;
  g.font="11px "+css("--font-mono"); g.fillStyle=css("--muted"); g.strokeStyle=css("--line"); g.lineWidth=1;
  const step=(()=>{ const r=(y1-y0)/5, p=Math.pow(10,Math.floor(Math.log10(r))); return [1,2,5,10].map(k=>k*p).find(s=>s>=r); })();
  g.textAlign="right"; g.textBaseline="middle";
  for(let v=Math.ceil(y0/step)*step; v<=y1; v+=step){ g.beginPath(); g.moveTo(L0,Y(v)); g.lineTo(A.w-R0,Y(v)); g.stroke(); g.fillText(nf(v)+(o.yu||""), L0-6, Y(v)); }
  g.textAlign="center"; g.textBaseline="top"; (o.xticks||[...new Set(xs)]).forEach(v=>g.fillText(o.xfmt?o.xfmt(v):nf(v,1), X(v), T0+H+6));
  g.fillStyle=css("--ink"); g.font="12px "+css("--font-body"); g.fillText(o.xl||"", L0+W/2, T0+H+22);
  if(o.line && Number.isFinite(o.line.b)){ g.save(); g.beginPath(); g.rect(L0,T0,W,H); g.clip(); g.strokeStyle=css("--accent"); g.lineWidth=2; g.beginPath(); g.moveTo(X(x0),Y(o.line.a+o.line.b*x0)); g.lineTo(X(x1),Y(o.line.a+o.line.b*x1)); g.stroke(); g.restore(); }
  if(o.connect){ g.strokeStyle=css("--accent"); g.lineWidth=1.5; g.beginPath(); o.pts.forEach((p,i)=> i?g.lineTo(X(p.x),Y(p.y)):g.moveTo(X(p.x),Y(p.y))); g.stroke(); }
  for(const p of o.pts) A.dot(X(p.x), Y(p.y), p.r||3.5, p.c||css("--accent"));
}

export { linfit, plotXY };
