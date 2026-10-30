// Zakładka Wyniki: porównanie eksportów i karta PNG
import { VERSION } from "../changelog.js";
import { REPO } from "../config.js";
import { LANGHOOKS } from "../core/registry.js";
import { $, css, esc } from "../core/utils.js";
import { D, L, LANG } from "../i18n/index.js";
import { TASKS, cardStats } from "../main.js";

// =====================================================================
// WYNIKI: porównanie dwóch eksportów (lokalnie) i karta wyniku PNG
// =====================================================================
const Compare = (() => { const files={a:null, b:null};
  function load(which, input){ const f=input.files && input.files[0]; if(!f) return;
    const r=new FileReader(); r.onload=()=>{ try{ files[which]={name:f.name, data:JSON.parse(r.result)}; }catch(_){ files[which]={name:f.name, error:true}; } render(); }; r.readAsText(f); }
  function render(){ const out=$("cmp-out"), A=files.a, B=files.b;
    if(!A && !B){ out.innerHTML=`<p class="lead">${LANG==="pl"?"Wybierz dwa pliki JSON wyeksportowane z tej strony.":"Choose two JSON files exported from this page."}</p>`; return; }
    const bad = [A,B].find(x=>x && (x.error || !x.data || !x.data.stages)); if(bad){ out.innerHTML=`<p class="note">${LANG==="pl"?`Plik ${esc(bad.name)} nie jest eksportem z tej strony.`:`${esc(bad.name)} is not an export from this page.`}</p>`; return; }
    const sa=A?A.data.stages:{}, sb=B?B.data.stages:{}, keys=[...new Set([...Object.keys(sa),...Object.keys(sb)])];
    const head=x=>x?`${esc(x.name)}<br><small>${esc((x.data.exported||"").slice(0,16).replace("T"," "))} · v${esc(x.data.version||"?")}</small>`:"—";
    let h=`<table><thead><tr><th>${LANG==="pl"?"Miara":"Measure"}</th><th>A: ${head(A)}</th><th>B: ${head(B)}</th></tr></thead><tbody>`;
    for(const k of keys){ const x=sa[k], y=sb[k]; h+=`<tr class="grp"><td colspan="3">${esc((x||y).title||k)}</td></tr>`;
      const cards=[...new Set([...Object.keys((x&&x.stats)||{}),...Object.keys((y&&y.stats)||{})])];
      for(const c of cards){ const cx=(x&&x.stats&&x.stats[c])||{}, cy=(y&&y.stats&&y.stats[c])||{};
        for(const f of [...new Set([...Object.keys(cx),...Object.keys(cy)])]){ const v1=cx[f], v2=cy[f], s=v=>v===undefined?"—":esc(Array.isArray(v)?v.join(", "):v);
          h+=`<tr${String(v1)!==String(v2)?' class="diff"':""}><td>${esc(c)}${f==="value"?"":` · ${esc(f)}`}</td><td>${s(v1)}</td><td>${s(v2)}</td></tr>`; } } }
    out.innerHTML = h+"</tbody></table>"; }
  $("cmp-a").addEventListener("change", e=>load("a",e.target)); $("cmp-b").addEventListener("change", e=>load("b",e.target));
  LANGHOOKS.push(render); return { render };
})();

const Card = (() => { let blob=null, url=null;
  // wybór testów na kartę: odznaczone klucze (tylko w pamięci karty); odcisk przeglądarki domyślnie odznaczony
  const off = new Set(["odcisk-przegladarki"]), keyOf = t => t.key || t.tab;
  function pick(){ const done=TASKS.filter(t=>t.R), box=$("png-pick"); if(!box) return; box.hidden = !done.length;
    $("png-pick-list").innerHTML = done.map(t => `<label><input type="checkbox" value="${esc(keyOf(t))}"${off.has(keyOf(t))?"":" checked"}> <span>${esc(L(t.title))}</span></label>`).join(""); }
  $("png-pick-list").addEventListener("change", e => { const c=e.target; if(c.type!=="checkbox") return; if(c.checked) off.delete(c.value); else off.add(c.value); });
  const setAll = on => { TASKS.filter(t=>t.R).forEach(t => on ? off.delete(keyOf(t)) : off.add(keyOf(t))); pick(); };
  $("png-all").addEventListener("click", () => setAll(true)); $("png-none").addEventListener("click", () => setAll(false));
  function make(){ const all=TASKS.filter(t=>t.R); if(!all.length){ $("png-status").textContent = LANG==="pl"?"Najpierw ukończ co najmniej jeden test.":"Finish at least one test first."; return; }
    const done=all.filter(t=>!off.has(keyOf(t))); if(!done.length){ $("png-status").textContent = LANG==="pl"?"Zaznacz co najmniej jeden test.":"Tick at least one test."; return; }
    $("png-status").textContent = LANG==="pl" ? "Tworzę kartę…" : "Creating the card…";
    const W=1200, H=630, cv=document.createElement("canvas"); cv.width=W; cv.height=H; const g=cv.getContext("2d");
    const C={bg:"#eef0ec", ink:"#1b2320", muted:"#5d6863", acc:"#2b48c9", line:"#cfd5cf", warn:"#b07413"}, FB=css("--font-body"), FM=css("--font-mono");
    g.fillStyle=C.bg; g.fillRect(0,0,W,H); g.fillStyle=C.acc; g.fillRect(0,0,W,10);
    g.fillStyle=C.acc; g.font=`500 18px ${FM}`; g.fillText(D[LANG].tag, 60, 66);
    g.fillStyle=C.ink; g.font=`600 46px ${FB}`; g.fillText(D[LANG].title, 60, 120);
    g.fillStyle=C.muted; g.font=`18px ${FM}`; g.fillText(`v${VERSION} · ${new Date().toLocaleDateString(LANG==="pl"?"pl-PL":"en-GB")}`, 60, 156);
    const MAX=28, rows=done.map(t=>{ if(t.card){ const [k,v]=t.card(t.R); return [L(t.title), v, k]; }
      const st=cardStats(t), first=Object.values(st)[0]||{}, k=Object.keys(st)[0]||"";
      return [L(t.title), first.value ? `${first.value}` : (Object.entries(first)[0]||["",""]).join(": "), k]; });
    const extra=Math.max(0, rows.length-MAX), shown=rows.slice(0, extra ? MAX-1 : MAX);
    const cols=shown.length>21?4:shown.length>12?3:2, colW=(W-120-(cols-1)*20)/cols, perCol=Math.ceil(shown.length/cols), RH=perCol>6?48:56;
    const fit=(s,w)=>{ s=String(s); if(g.measureText(s).width<=w) return s; while(s.length>1 && g.measureText(s+"…").width>w) s=s.slice(0,-1); return s+"…"; };
    shown.forEach((r,i)=>{ const c=Math.floor(i/perCol), x=60+c*(colW+20), y=215+(i%perCol)*RH;
      g.fillStyle=C.muted; g.font=`${cols===4?13:15}px ${FB}`; g.fillText(fit(r[0]===r[2] ? r[0] : `${r[0]} · ${r[2]}`, colW-20), x, y);
      g.fillStyle=C.ink; g.font=`500 ${cols===4?16:cols===3?19:22}px ${FM}`; g.fillText(fit(r[1], colW-20), x, y+26);
      g.fillStyle=C.line; g.fillRect(x,y+36,colW-20,1); });
    if(extra){ const i=shown.length, c=Math.floor(i/perCol), x=60+c*(colW+20), y=215+(i%perCol)*RH;
      g.fillStyle=C.muted; g.font=`15px ${FB}`; g.fillText(LANG==="pl"?`+ ${extra+1} kolejnych testów w eksporcie JSON`:`+ ${extra+1} more tests in the JSON export`, x, y+14); }
    g.fillStyle=C.warn; g.font=`15px ${FB}`; g.fillText(LANG==="pl"?"Amatorski projekt: wyniki orientacyjne, to nie jest diagnoza.":"Amateur project: results are rough, this is not a diagnosis.", 60, H-56);
    g.fillStyle=C.muted; g.font=`15px ${FM}`; g.fillText(REPO.replace("https://github.com/","").replace("/behavioral-biometrics","")+".github.io/behavioral-biometrics", 60, H-30);
    cv.toBlob(b=>{ blob=b; if(url) URL.revokeObjectURL(url); url=URL.createObjectURL(b); $("png-prev").src=url; $("png-prev").hidden=false; $("png-dl").disabled=false;
      $("png-status").textContent = LANG==="pl"?"Karta gotowa. Obrazek jest tylko na Twoim urządzeniu.":"Card ready. The image stays on your device."; }, "image/png"); }
  function download(){ if(!url) return; const a=document.createElement("a"); a.href=url; a.download=(LANG==="pl"?"karta-wyniku-":"result-card-")+new Date().toISOString().slice(0,10)+".png"; document.body.appendChild(a); a.click(); a.remove(); }
  $("png-go").addEventListener("click", make); LANGHOOKS.push(pick); $("png-dl").addEventListener("click", download);
  return { pick };
})();

export { Compare, Card };
