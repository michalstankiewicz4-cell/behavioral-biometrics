// Karty miar i podsumowania
import { $, mean, median, ms, sd } from "./utils.js";
import { D, L, LANG } from "../i18n/index.js";

// ---------- karty miar ----------
const UNITS = {};
function buildCards(gridId, specs){
  $(gridId).innerHTML = specs.map(c => {
    UNITS[c.id] = c.unit;
    return `<article class="card"><h3>${L(c.title)}</h3>`
      + (c.unit ? `<div class="val" id="v-${c.id}">—<small> ${L(c.unit)}</small></div>` : "")
      + (c.rows ? `<div class="rows">${c.rows.map(([k,l])=>`<div><span>${L(l)}</span><span id="v-${c.id}-${k}">—</span></div>`).join("")}</div>` : "")
      + (c.chips||[]).map(([k,l])=>`${l?`<div class="sub">${L(l)}</div>`:""}<div class="chips" id="v-${c.id}-${k}"><span class="chip">—</span></div>`).join("")
      + `<details><summary>${D[LANG].how}</summary><p>${L(c.how)}</p></details></article>`;
  }).join("");
}
const setMain = (id,v) => { const e=$("v-"+id); if(e) e.innerHTML = `${v}<small> ${L(UNITS[id])}</small>`; };
const setRow = (id,k,v) => { const e=$(`v-${id}-${k}`); if(e) e.textContent = v; };
const setHTML = (id,k,v) => { const e=$(`v-${id}-${k}`); if(e) e.innerHTML = v; };
function setSummary(task){
  const e=$(task.sumId);
  if(!task.R){ e.classList.add("empty"); e.innerHTML = `<p>${D[LANG].sum_empty}</p>`; return; }
  e.classList.remove("empty");
  e.innerHTML = task.summary(task.R) + `<p class="fine">${D[LANG].sum_fine}</p>`;
}
const U = { ms_med:{pl:"ms (mediana)",en:"ms (median)"} };
const R_MEAN = ["mean",{pl:"średnia",en:"mean"}], R_SD = ["sd",{pl:"odchylenie std.",en:"std. deviation"}], R_N = ["n",{pl:"liczba pomiarów",en:"samples"}];

export { UNITS, buildCards, setMain, setRow, setHTML, setSummary, U, R_MEAN, R_SD, R_N };
