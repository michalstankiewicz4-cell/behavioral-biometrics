// Język: wykrywanie, przełączanie, słownik tekstów

// ---------- język ----------
function detectLang(){
  const list = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || "en"];
  for(const l of list){ const s = String(l).toLowerCase(); if(s.startsWith("pl")) return "pl"; if(s.startsWith("en")) return "en"; }
  return "en";
}
let LANG = detectLang();
function setLang(l){ LANG = l; }
const L = o => (o && typeof o === "object" && "pl" in o) ? o[LANG] : o;

import pl from "./pl.js";
import en from "./en.js";
const D = { pl, en };

export { detectLang, LANG, L, D, setLang };
