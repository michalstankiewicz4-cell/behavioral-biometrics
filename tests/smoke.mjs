// Test dymny: wczytuje stronę, przechodzi przez wszystkie zakładki, robi test pisania,
// przełącza język i motyw. Kończy się błędem, jeśli w konsoli pojawi się błąd JS.
// Uruchomienie: npm install && npx playwright install chromium && npm test
import { chromium } from "playwright";
import { serve } from "../tools/serve.mjs";

const PORT = 8765;
const server = await serve(PORT);
const browser = await chromium.launch();
const page = await (await browser.newContext({ locale: "pl-PL" })).newPage();
const errors = [];
page.on("pageerror", e => errors.push(e.message));
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });

try {
  await page.goto(`http://localhost:${PORT}/`);
  const tabs = await page.$$eval("#tabs a[data-tab]", a => a.map(x => x.dataset.tab));
  const text = await page.$eval("#target", el => el.innerText.replace(/ /g, " "));
  await page.click("#input");
  await page.keyboard.type(text, { delay: 2 });
  const summary = await page.$eval("#sum-type", el => el.innerText);
  if (!/słów\/min/.test(summary)) throw new Error("Brak oceny testu pisania");
  for (const t of tabs) { await page.evaluate(h => { location.hash = "#" + h; }, t); await page.waitForTimeout(80); }
  await page.evaluate(() => { location.hash = "#odcisk"; });
  await page.click("#fp-go");
  await page.click("#lang");
  await page.click("#theme");
  await page.evaluate(() => { location.hash = "#wyniki"; });
  console.log(`OK: ${tabs.length} zakładek`);
} catch (e) { errors.push(e.message); }

await browser.close(); server.close();
if (errors.length) { console.error("BŁĘDY:\n" + errors.join("\n")); process.exit(1); }
