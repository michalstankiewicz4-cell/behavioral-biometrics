// Generuje ikony z assets/img/favicon.svg oraz miniaturę linku (og-image.png, 1200 × 630, zrzut strony).
// Uruchomienie: npm run images
import { chromium } from "playwright";
import { readFile } from "node:fs/promises";
import { serve } from "./serve.mjs";

const IMG = new URL("../assets/img/", import.meta.url);
const svg = await readFile(new URL("favicon.svg", IMG), "utf8");
const browser = await chromium.launch();
for (const [size, name] of [[32, "favicon-32.png"], [180, "apple-touch-icon.png"], [512, "icon-512.png"]]) {
  const p = await browser.newPage({ viewport: { width: size, height: size } });
  await p.setContent(`<body style="margin:0;background:transparent">${svg.replace("<svg ", `<svg width="${size}" height="${size}" `)}</body>`);
  await p.screenshot({ path: new URL(name, IMG).pathname, omitBackground: true });
  await p.close();
}
const server = await serve(8766);
const page = await (await browser.newContext({ locale: "pl-PL", viewport: { width: 1200, height: 630 }, colorScheme: "light" })).newPage();
await page.goto("http://localhost:8766/");
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
await page.screenshot({ path: new URL("og-image.png", IMG).pathname });
await browser.close(); server.close();
console.log("OK");
