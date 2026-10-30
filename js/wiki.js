// Linki do Wikipedii (polskiej i angielskiej) przy każdym teście – tylko tam, gdzie artykuł istnieje.
import { LANG } from "./i18n/index.js";
import { LANGHOOKS } from "./core/registry.js";

const W = (lang, title, anchor) => ({ lang, title: title.replace(/_/g, " "), url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title).replace(/%2C/g, ",")}${anchor ? "#" + anchor : ""}` });

export const WIKI = {
  pisanie:      [W("pl","Cechy_biometryczne"), W("en","Keystroke_dynamics")],
  klikanie:     [W("pl","Prawo_Fittsa"), W("en","Fitts's_law")],
  przeciaganie: [W("en","Drag_and_drop")],
  rysowanie:    [W("en","Tremor")],
  dwuklik:      [W("en","Double-click")],
  haslo:        [W("pl","Cechy_biometryczne"), W("en","Keystroke_dynamics")],
  podpis:       [W("pl","Cechy_biometryczne"), W("en","Signature_recognition"), W("en","Dynamic_time_warping")],
  bot:          [W("en","CAPTCHA")],
  odcisk:       [W("pl","HTML5_Canvas","Canvas_fingerprinting"), W("en","Device_fingerprint")],
  stroop:       [W("pl","Efekt_Stroopa"), W("en","Stroop_effect")],
  reakcja:      [W("en","Hick's_law"), W("en","Mental_chronometry")],
  fitts:        [W("pl","Prawo_Fittsa"), W("en","Fitts's_law")],
  tapping:      [W("en","Tapping_rate")],
  pamiec:       [W("pl","Pamięć_krótkotrwała"), W("en","Memory_span"), W("en","Corsi_block-tapping_test")],
  osobowosc:    [W("pl","Wielka_piątka"), W("en","Big_Five_personality_traits"), W("en","International_Personality_Item_Pool")],
  recznosc:     [W("pl","Leworęczność"), W("pl","Lateralizacja"), W("en","Handedness"), W("en","Edinburgh_Handedness_Inventory")],
  litery:       [W("pl","Dysleksja"), W("en","Dyslexia"), W("en","Pseudoword")],
  wzrok:        [W("pl","Tablica_Snellena"), W("pl","Visus"), W("pl","Tablice_Ishihary"), W("pl","Astygmatyzm_(wada_wzroku)"),
                 W("en","Snellen_chart"), W("en","Ishihara_test"), W("en","Astigmatism"), W("en","Contrast_(vision)")]
};

export function renderWiki(){
  for (const [tab, links] of Object.entries(WIKI)) {
    const panel = document.querySelector(`[data-panel="${tab}"]`); if (!panel) continue;
    let p = panel.querySelector(":scope > .wiki");
    if (!p) { p = document.createElement("p"); p.className = "wiki"; panel.querySelector("h2").after(p); }
    const label = LANG === "pl" ? "Więcej w Wikipedii:" : "More on Wikipedia:";
    p.innerHTML = `<span>${label}</span> ` + links.map(l => `<a href="${l.url}" target="_blank" rel="noopener" hreflang="${l.lang}"><abbr title="${l.lang === "pl" ? "polska Wikipedia" : "English Wikipedia"}">${l.lang.toUpperCase()}</abbr> ${l.title}</a>`).join(" · ");
  }
}
LANGHOOKS.push(renderWiki);
