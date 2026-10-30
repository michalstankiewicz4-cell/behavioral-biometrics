// Test: browser-fingerprint
import { setMain, setRow, setSummary } from "../core/cards.js";
import { base } from "../core/errors.js";
import { LANGHOOKS } from "../core/registry.js";
import { $, esc } from "../core/utils.js";
import { L, LANG } from "../i18n/index.js";
import { markDone } from "../main.js";

// =====================================================================
// ODCISK PRZEGLĄDARKI — co strona wie bez pytania; liczone lokalnie, nic nie jest wysyłane
// =====================================================================
const FP = (() => {
  const cyrb = (str, seed=0) => { let h1=0xdeadbeef^seed, h2=0x41c6ce57^seed;
    for(let i=0;i<str.length;i++){ const c=str.charCodeAt(i); h1=Math.imul(h1^c,2654435761); h2=Math.imul(h2^c,1597334677); }
    h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909); h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
    return (h2>>>0).toString(16).padStart(8,"0")+(h1>>>0).toString(16).padStart(8,"0"); };
  const FONTS = ["Arial","Arial Black","Calibri","Cambria","Candara","Comic Sans MS","Consolas","Constantia","Corbel","Courier New","Georgia","Impact","Lucida Console","Lucida Sans Unicode","Palatino Linotype","Segoe UI","Tahoma","Times New Roman","Trebuchet MS","Verdana","Helvetica","Helvetica Neue","Menlo","Monaco","Avenir","Futura","Gill Sans","Optima","Baskerville","Didot","San Francisco","SF Pro Text","Ubuntu","DejaVu Sans","Liberation Sans","Noto Sans","Roboto","Open Sans","Fira Sans","Cantarell"];
  function fonts(){ const c=document.createElement("canvas").getContext("2d"), s="mmmmmmmmmlli1WQ@#ąęż", base=["monospace","serif","sans-serif"];
    const w = f => { c.font=`72px ${f}`; return c.measureText(s).width; }; const bw=base.map(w);
    return FONTS.filter(f => base.some((b,i) => w(`"${f}",${b}`)!==bw[i])); }
  function canvasHash(){ const cv=document.createElement("canvas"); cv.width=280; cv.height=60; const g=cv.getContext("2d");
    g.textBaseline="top"; g.font="16px Arial"; g.fillStyle="#f60"; g.fillRect(100,5,80,30); g.fillStyle="#069"; g.fillText("Odcisk ąęż 🖐 1.0",4,8);
    g.fillStyle="rgba(102,204,0,.7)"; g.font="18px Georgia"; g.fillText("fingerprint",30,30); g.beginPath(); g.arc(240,30,20,0,Math.PI*2); g.strokeStyle="#c0c"; g.stroke();
    try{ return cyrb(cv.toDataURL()); }catch(_){ return "—"; } }
  function webgl(){ try{ const gl=document.createElement("canvas").getContext("webgl"); if(!gl) return "—";
    const ext=gl.getExtension("WEBGL_debug_renderer_info"); return ext ? `${gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)} · ${gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)}` : `${gl.getParameter(gl.VENDOR)} · ${gl.getParameter(gl.RENDERER)}`; }catch(_){ return "—"; } }
  const mq = q => matchMedia(q).matches;
  function collect(){ const n=navigator, tz=Intl.DateTimeFormat().resolvedOptions().timeZone, f=fonts();
    return [
      ["ua", {pl:"Przeglądarka i system (User-Agent)",en:"Browser and system (User-Agent)"}, n.userAgent, {pl:"Wersja przeglądarki i systemu; wysyłana z każdym żądaniem.",en:"Browser and OS version; sent with every request."}],
      ["platform", {pl:"Platforma",en:"Platform"}, (n.userAgentData && n.userAgentData.platform) || n.platform || "—", {pl:"System operacyjny.",en:"Operating system."}],
      ["lang", {pl:"Języki",en:"Languages"}, (n.languages||[n.language]).join(", "), {pl:"Kolejność języków z ustawień; rzadsze zestawy mocno wyróżniają.",en:"Language order from settings; unusual sets stand out."}],
      ["tz", {pl:"Strefa czasowa",en:"Time zone"}, `${tz} (UTC${-new Date().getTimezoneOffset()/60>=0?"+":""}${-new Date().getTimezoneOffset()/60})`, {pl:"Zdradza przybliżony region, nawet przez VPN.",en:"Reveals your approximate region, even behind a VPN."}],
      ["screen", {pl:"Ekran",en:"Screen"}, `${screen.width} × ${screen.height}, ${screen.colorDepth}-bit, ×${window.devicePixelRatio}`, {pl:"Rozdzielczość, głębia kolorów i skalowanie.",en:"Resolution, colour depth and scaling."}],
      ["viewport", {pl:"Okno przeglądarki",en:"Browser window"}, `${innerWidth} × ${innerHeight}`, {pl:"Zmienia się przy zmianie rozmiaru okna, ale w krótkim czasie też pomaga śledzić.",en:"Changes when you resize, but helps tracking over short periods."}],
      ["cpu", {pl:"Rdzenie procesora",en:"CPU cores"}, String(n.hardwareConcurrency||"—"), {pl:"Liczba wątków procesora.",en:"Number of CPU threads."}],
      ["mem", {pl:"Pamięć RAM (przybliżona)",en:"RAM (approximate)"}, n.deviceMemory ? n.deviceMemory+" GB" : "—", {pl:"Tylko w przeglądarkach opartych na Chromium, zaokrąglona.",en:"Chromium-based browsers only, rounded."}],
      ["touch", {pl:"Punkty dotyku",en:"Touch points"}, String(n.maxTouchPoints??"—"), {pl:"Czy ekran jest dotykowy.",en:"Whether the screen is a touch screen."}],
      ["prefs", {pl:"Preferencje systemu",en:"System preferences"}, [mq("(prefers-color-scheme: dark)")?"dark":"light", mq("(prefers-reduced-motion: reduce)")?"reduced-motion":"motion", mq("(prefers-contrast: more)")?"high-contrast":"normal-contrast"].join(", "), {pl:"Motyw, ograniczenie animacji, kontrast.",en:"Theme, reduced motion, contrast."}],
      ["privacy", {pl:"Ustawienia prywatności",en:"Privacy settings"}, `cookies: ${n.cookieEnabled?"on":"off"}, DNT: ${n.doNotTrack??"—"}, GPC: ${n.globalPrivacyControl??"—"}`, {pl:"Paradoksalnie włączone „nie śledź” też jest cechą, która wyróżnia.",en:"Ironically, turning on “do not track” is itself a distinguishing feature."}],
      ["webgl", {pl:"Karta graficzna (WebGL)",en:"Graphics card (WebGL)"}, webgl(), {pl:"Producent i model GPU oraz sterownik.",en:"GPU vendor, model and driver."}],
      ["canvas", {pl:"Odcisk płótna (canvas)",en:"Canvas fingerprint"}, canvasHash(), {pl:"Skrót obrazka narysowanego w tle: drobne różnice w czcionkach, wygładzaniu i GPU dają inny wynik na różnych komputerach.",en:"Hash of an image drawn in the background: tiny differences in fonts, antialiasing and GPU give different results on different computers."}],
      ["fonts", {pl:`Wykryte czcionki (${f.length} z ${FONTS.length} sprawdzanych)`,en:`Detected fonts (${f.length} of ${FONTS.length} checked)`}, f.join(", ")||"—", {pl:"Wykrywane po szerokości tekstu; zestaw czcionek zależy od systemu i zainstalowanych programów.",en:"Detected by text width; the font set depends on the OS and installed software."}]
    ]; }
  let items=null;
  const self = { tab:"odcisk", key:"odcisk-przegladarki", grid:"cards-fp", sumId:"sum-fp", R:null, title:{pl:"Odcisk przeglądarki",en:"Browser fingerprint"}, specs:[
    {id:"fp-hash", title:{pl:"Twój odcisk",en:"Your fingerprint"}, unit:{pl:"(skrót wszystkich cech)",en:"(hash of all features)"},
     rows:[["n",{pl:"liczba cech",en:"features"}],["canvas",{pl:"odcisk canvas",en:"canvas fingerprint"}],["fonts",{pl:"wykryte czcionki",en:"detected fonts"}]],
     how:{pl:"Wartości wszystkich cech łączę w jeden tekst i liczę z niego 64-bitowy skrót (funkcja cyrb53). Ta sama przeglądarka zwykle daje ten sam skrót przy każdej wizycie, bez żadnych ciasteczek. Strona nie zna innych odwiedzających, więc nie wie, jak rzadki jest Twój odcisk; serwisy reklamowe i antyfraudowe to wiedzą.",
          en:"All feature values are joined into one text and hashed to 64 bits (cyrb53). The same browser usually gives the same hash on every visit, without any cookies. The page doesn't know other visitors, so it can't tell how rare your fingerprint is; advertising and anti-fraud services can."}}
  ]};
  function compute(){ items=collect(); const all=items.map(i=>i[0]+"="+i[2]).join("|");
    self.R = { hash:cyrb(all), features:Object.fromEntries(items.map(i=>[i[0], i[2]])) }; render(); self.render(self.R); setSummary(self); markDone("odcisk"); }
  function render(){ if(!items) return;
    $("fp-table").innerHTML = `<table><thead><tr><th>${LANG==="pl"?"Cecha":"Feature"}</th><th>${LANG==="pl"?"Wartość":"Value"}</th><th>${LANG==="pl"?"Co mówi":"What it reveals"}</th></tr></thead><tbody>`
      + items.map(i=>`<tr><td>${L(i[1])}</td><td><code>${esc(i[2])}</code></td><td>${L(i[3])}</td></tr>`).join("") + "</tbody></table>"; }
  self.render = R => { setMain("fp-hash", R.hash); setRow("fp-hash","n", Object.keys(R.features).length); setRow("fp-hash","canvas", R.features.canvas);
    setRow("fp-hash","fonts", R.features.fonts==="—" ? 0 : R.features.fonts.split(", ").length); };
  self.summary = R => LANG==="pl"
    ? `<p>Twój odcisk przeglądarki to <strong><code>${R.hash}</code></strong>, policzony z ${Object.keys(R.features).length} cech, które każda strona może odczytać bez pytania o zgodę. Ta sama kombinacja przy kolejnych wizytach pozwala rozpoznać przeglądarkę bez ciasteczek.</p><p>Ta strona niczego nie wysyła. Mniej wyróżniać się pomagają przeglądarki z ochroną przed fingerprintingiem (np. Tor Browser, Brave, Firefox z <code>privacy.resistFingerprinting</code>), które ujednolicają te wartości.</p>`
    : `<p>Your browser fingerprint is <strong><code>${R.hash}</code></strong>, computed from ${Object.keys(R.features).length} features any website can read without asking. The same combination on later visits lets a site recognise your browser without cookies.</p><p>This page sends nothing. Browsers with fingerprinting protection (e.g. Tor Browser, Brave, Firefox with <code>privacy.resistFingerprinting</code>) help you stand out less by unifying these values.</p>`;
  $("fp-go").addEventListener("click", compute);
  LANGHOOKS.push(() => { if(items){ items=collect(); render(); } });
  return self;
})();

export { FP };
