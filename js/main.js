// Punkt wejścia: lista testów, zakładki, eksport, motyw, język, inicjalizacja
import { CHANGELOG, VERSION } from "./changelog.js";
import { renderWiki } from "./wiki.js";
import { renderCombined } from "./results/combined.js";
import "./results/tools.js";   // porównanie eksportów i karta PNG (rejestruje obsługę przycisków)
import { REPO } from "./config.js";
import { buildCards, setSummary } from "./core/cards.js";
import { LANGHOOKS, LEAVE, SHOW } from "./core/registry.js";
import { $, esc } from "./core/utils.js";
import { D, L, LANG, setLang } from "./i18n/index.js";
import { FP } from "./tests/browser-fingerprint.js";
import { Track } from "./tests/dot-tracking.js";
import { Dbl } from "./tests/double-click.js";
import { Drag } from "./tests/dragging.js";
import { Fitts } from "./tests/fitts.js";
import { Bot } from "./tests/human-or-bot.js";
import { Search } from "./tests/letter-search.js";
import { Corsi, Digits } from "./tests/memory.js";
import { Pass } from "./tests/password.js";
import { Pseudo } from "./tests/pseudowords.js";
import { Hick } from "./tests/reaction-hick.js";
import { Sig } from "./tests/signature.js";
import { Big5 } from "./tests/personality.js";
import { Stroop } from "./tests/stroop.js";
import { Tap } from "./tests/tapping.js";
import { Click } from "./tests/target-clicking.js";
import { Draw } from "./tests/tracing.js";
import { Typing, renderKbd } from "./tests/typing.js";
import { Astig, Contrast } from "./tests/vision-extra.js";
import { Cal, Plates, SnA, SnB, SnRun } from "./tests/vision.js";

// =====================================================================
// zakładki, wyniki, język
// =====================================================================
const TASKS = [Typing, Click, Track, Drag, Draw, Dbl, Pass, Pseudo, Search, SnA, SnB, Plates, Sig, Bot, FP, Stroop, Hick, Fitts, Tap, Digits, Corsi, Astig, Contrast, Big5];
const MOUSE = [Click, Track, Drag, Draw, Dbl];
const TABS = ["pisanie","klikanie","sledzenie","przeciaganie","rysowanie","dwuklik","haslo","litery","wzrok","podpis","bot","odcisk","stroop","reakcja","fitts","tapping","pamiec","osobowosc","wyniki"];

function markDone(tab){ document.querySelector(`#tabs a[data-tab="${tab}"]`).classList.add("done"); renderResults(); }
function renderResults(){
  const done = TASKS.filter(t=>t.R);
  // 1) same liczby
  $("results-num").innerHTML = done.length
    ? `<table><thead><tr><th>${LANG==="pl"?"Test":"Test"}</th><th>${LANG==="pl"?"Miara":"Measure"}</th><th>${LANG==="pl"?"Wynik":"Result"}</th></tr></thead><tbody>`
      + done.map(t => Object.entries(cardStats(t)).map(([card, o], i) => `<tr><td>${i ? "" : esc(L(t.title))}</td><td>${esc(card)}</td><td>${esc(o.value ?? Object.values(o).flat().slice(0,3).join(", "))}</td></tr>`).join("")).join("")
      + "</tbody></table>"
    : `<p class="lead">${D[LANG].res_empty}</p>`;
  // 2) interpretacja każdego testu
  $("results").innerHTML = done.length
    ? done.map(t=>`<article><h3>${L(t.title)}</h3>${t.summary(t.R)}</article>`).join("")
    : `<p class="lead">${D[LANG].res_empty}</p>`;
  // 3) interpretacje łączone
  renderCombined();
  $("export").disabled = !done.length;
}

// Statystyki z kart dokładnie tak, jak są pokazane na stronie
function cardStats(t){
  const out = {};
  for(const card of $(t.grid).querySelectorAll(".card")){
    const title = card.querySelector("h3").textContent.trim();
    const o = {};
    const val = card.querySelector(".val"); if(val) o.value = val.textContent.replace(/\s+/g," ").trim();
    card.querySelectorAll(".rows div").forEach(r => { const [a,b] = r.querySelectorAll("span"); if(b && b.textContent.trim()) o[a.textContent.trim()] = b.textContent.trim(); });
    card.querySelectorAll(".chips").forEach(c => { const lbl = c.previousElementSibling && c.previousElementSibling.classList.contains("sub") ? c.previousElementSibling.textContent.trim() : "list";
      o[lbl] = [...c.querySelectorAll(".chip")].map(x=>x.textContent.trim()); });
    out[title] = o;
  }
  return out;
}

// ---------- eksport profilu (tylko zapis na dysk użytkownika) ----------
async function exportProfile(){
  const done = TASKS.filter(t=>t.R); if(!done.length) return;
  const strip = h => { const d=document.createElement("div"); d.innerHTML=h; return d.textContent.replace(/\s+/g," ").trim(); };
  const now = new Date(), pad = n => String(n).padStart(2,"0");
  const stamp = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  const fname = (LANG==="pl" ? "profil-biometryczny-" : "biometric-profile-") + stamp + ".json";
  const data = {
    app: D[LANG].title, version: VERSION, source: REPO, exported: now.toISOString(), language: LANG,
    note: strip(D[LANG].amateur_p),
    stages: Object.fromEntries(done.map(t => [t.key || t.tab, {
      title: L(t.title),
      result: strip(t.summary(t.R)),
      stats: cardStats(t),
      measurements: t.R }]))
  };
  const json = JSON.stringify(data, null, 2);
  const st = $("export-status");
  const download = () => {
    const url = URL.createObjectURL(new Blob([json], {type:"application/json"}));
    const a = document.createElement("a"); a.href = url; a.download = fname;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
    st.textContent = D[LANG].export_dl.replace("{f}", fname);
  };
  if(window.showSaveFilePicker){
    try{
      const h = await window.showSaveFilePicker({ suggestedName:fname, startIn:"desktop",
        types:[{ description:"JSON", accept:{"application/json":[".json"]} }] });
      const w = await h.createWritable(); await w.write(json); await w.close();
      st.textContent = D[LANG].export_ok.replace("{f}", h.name);
    }catch(e){
      if(e && e.name==="AbortError") st.textContent = D[LANG].export_cancel;
      else { try{ download(); }catch(e2){ st.textContent = D[LANG].export_err.replace("{e}", e2.message); } }
    }
  } else download();
}
$("export").addEventListener("click", exportProfile);
function showTab(){
  let h = location.hash.slice(1); if(!TABS.includes(h)) h = "pisanie";
  document.querySelectorAll("[data-panel]").forEach(p => p.hidden = p.dataset.panel !== h);
  document.querySelectorAll("#tabs a").forEach(a => { if(a.dataset.tab===h) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  MOUSE.forEach(t => { if(t.tab !== h) t.abort(); });
  if(h==="haslo") requestAnimationFrame(() => Pass.chart());
  if(h==="wzrok") requestAnimationFrame(() => { Cal.upd(); SnRun.show(); Plates.show(); });
  Object.keys(LEAVE).forEach(k => { if(k !== h) LEAVE[k](); });
  if(SHOW[h]) requestAnimationFrame(SHOW[h]);
  const cur = MOUSE.find(t => t.tab === h);
  if(cur){ requestAnimationFrame(() => { cur.A.fit(); cur.redraw(); }); }
}
function applyLang(){
  document.documentElement.lang = LANG;
  document.title = D[LANG].doc_title;
  document.querySelector('meta[name="description"]').setAttribute("content", D[LANG].meta_desc);
  document.querySelectorAll("[data-i18n]").forEach(el => { el.innerHTML = D[LANG][el.dataset.i18n]; });
  const b=$("lang"); b.textContent = D[LANG].lang_btn; b.setAttribute("aria-label", D[LANG].lang_label);
  $("tabs").setAttribute("aria-label", LANG==="pl" ? "Etapy" : "Stages");
  TASKS.forEach(t => { buildCards(t.grid, t.specs); if(t.R) t.render(t.R); setSummary(t); });
  MOUSE.forEach(t => { t.status(t.st); if(t.A.w) t.redraw(); });
  Typing.onLang();
  Pass.onLang();
  Pseudo.onLang();
  Search.onLang();
  Cal.upd(); SnRun.onLang(); Plates.onLang();
  LANGHOOKS.forEach(f => f());
  renderKbd(Typing.R && Typing.R.keys);
  renderResults();
  renderNews();
  renderTheme();
}
function renderNews(){
  const b=$("ver"); b.textContent = "v"+VERSION; b.setAttribute("aria-label", D[LANG].ver_label.replace("{v}",VERSION));
  $("news-list").innerHTML = CHANGELOG.map(c => `<article><h3>v${c.v} <time datetime="${c.date}">${c.date}</time></h3><ul>${c[LANG].map(x=>`<li>${x}</li>`).join("")}</ul></article>`).join("");
}
$("ver").addEventListener("click", () => $("news").scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"}));
$("lang").addEventListener("click", () => { setLang(LANG==="pl" ? "en" : "pl"); applyLang(); });

// dzień / noc: domyślnie motyw systemu, przycisk przełącza ręcznie (bez zapisywania)
const isDark = () => { const t=document.documentElement.dataset.theme; return t ? t==="dark" : matchMedia("(prefers-color-scheme: dark)").matches; };
function renderTheme(){ const b=$("theme"), d=isDark();
  b.textContent = d ? (LANG==="pl"?"☀ Dzień":"☀ Day") : (LANG==="pl"?"☾ Noc":"☾ Night");
  b.setAttribute("aria-label", d ? (LANG==="pl"?"Włącz jasny motyw":"Switch to light theme") : (LANG==="pl"?"Włącz ciemny motyw":"Switch to dark theme")); }
$("theme").addEventListener("click", () => {
  document.documentElement.dataset.theme = isDark() ? "light" : "dark";
  renderTheme(); MOUSE.forEach(t => { if(t.A.w) t.redraw(); });
});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { renderTheme(); MOUSE.forEach(t => { if(t.A.w) t.redraw(); }); });
window.addEventListener("hashchange", showTab);
window.addEventListener("resize", () => { const hh=location.hash.slice(1); if(SHOW[hh]) SHOW[hh](); if(!$("tab-haslo").hidden) Pass.chart(); if(!$("tab-wzrok").hidden){ SnRun.show(); Plates.show(); } const cur = MOUSE.find(t => !$( "tab-"+t.tab).hidden); if(cur){ cur.A.fit(); cur.redraw(); } });
if(matchMedia("(pointer: coarse)").matches) $("mobile").classList.remove("hidden");

Typing.reset();
applyLang();
showTab();

export { TASKS, MOUSE, TABS, markDone, renderResults, cardStats, showTab, applyLang, renderNews, isDark, renderTheme };
