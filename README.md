# Cyfrowy odcisk człowieka · Human Digital Fingerprint

**Wersja / version: 0.31.0** · [Co nowego / changelog](CHANGELOG.md) · [Plan](PLAN.md) · [Dokumentacja / docs](docs/DOKUMENTACJA.md)

▶ **https://michalstankiewicz4-cell.github.io/behavioral-biometrics/**

Jawne demo **biometrii behawioralnej**. Robisz kilka krótkich zadań, a strona pokazuje, co zmierzyła i jak to policzyła. Zwykle taka biometria działa ukryta w tle (np. w bankowości); tutaj każdy może zobaczyć, jak działa.

An open demo of **behavioral biometrics**. You do a few short tasks and the page shows what it measured and how. This kind of biometrics usually runs hidden in the background (e.g. in banking); here anyone can see how it works.

## ⚠️ Amatorski projekt · Amateur project

To hobbystyczne demo, a nie narzędzie naukowe ani medyczne. Progi w ocenach są orientacyjne, a wyniki zależą od sprzętu, zmęczenia i wprawy. **Nie sugeruj się wynikiem** i nie podejmuj na jego podstawie żadnych decyzji.

This is a hobby demo, not a scientific or medical tool. Thresholds are rough and results depend on hardware, tiredness and practice. **Don't take the results seriously** or base any decisions on them.

## Zadania · Tasks

Zakładki są w grupach: biometria behawioralna, testy psychomotoryczne, ⚠️ ciekawostki zdrowotne (inny kolor: wynik może być nieprawdziwy), wyniki i narzędzia. · Tabs are grouped; the health-curiosities group is highlighted because its results may be wrong.

| # | Zadanie | Co mierzy |
|---|---------|-----------|
| 1 | Pisanie · Typing | prędkość, czas przytrzymania i przelotu klawiszy, rytm, błędy i ich rodzaje, poprawki, pauzy, pary liter, mapa cieplna klawiatury |
| 2 | Klikanie celów · Target clicking | czas reakcji i ruchu, prostoliniowość, przestrzelenia, przytrzymanie przycisku, pudła |
| 3 | Śledzenie punktu · Dot tracking | odległość od kropki, czas w strefie, opóźnienie, płynność |
| 4 | Przeciąganie · Dragging | czas, precyzja upuszczenia, drżenie, zatrzymania, ponowne chwyty |
| 5 | Rysowanie po śladzie · Tracing | odchylenie od wzoru, drżenie, pokrycie, tempo |
| 6 | Podwójne kliknięcie · Double click | odstęp, przytrzymanie, drgnięcie kursora, za wolne pary |
| 7 | Hasło · Password | profil rytmu wpisywania hasła (5 wpisań) i test zgodności z profilem |
| 8 | Litery i błędy · Letters & errors | przepisywanie pseudosłów (tempo, czas na słowo, rodzaje błędów) i szukanie liter b wśród d/p/q; **to nie jest test na dysleksję** |
| 9 | Wzrok · Vision | kalibracja ekranu, tablica Snellena (litery lub obracane E), generowane tablice barwne w stylu Ishihary, tarcza astygmatyczna, wrażliwość na kontrast, oko dominujące; **to nie jest badanie wzroku** |
| 8 | Podpis myszką · Mouse signature | 3 podpisy jako wzorzec, weryfikacja kształtu (DTW), tempa i rytmu |
| 9 | Człowiek czy bot · Human or bot | Twoje ruchy myszki kontra prosty bot: prostoliniowość, zmienność prędkości, drżenie, celność, przytrzymanie |
| 10 | Odcisk przeglądarki · Browser fingerprint | co strona może odczytać bez pytania (14 cech) i skrót odcisku, liczone lokalnie |
| 11 | Test Stroopa · Stroop test | czas nazwania koloru napisu: słowa zgodne kontra niezgodne |
| 12 | Czas reakcji · Reaction time (Hick) | reakcja przy 1, 2, 4 i 8 możliwościach, dopasowanie prawa Hicka |
| 13 | Prawo Fittsa · Fitts's law | 18 ruchów do celów różnej wielkości i odległości, dopasowanie MT = a + b·ID, przepustowość |
| 14 | Tapping · Finger tapping | 10 s stukania lewą i prawą ręką: tempo, równomierność, zmęczenie, różnica rąk |
| 15 | Pamięć · Memory | zakres pamięci cyfr i bloki Corsiego |
| 16 | Osobowość · Personality | Wielka Piątka, pełny IPIP-NEO (300 pytań): 5 cech i 30 pod-cech; bez norm, własne tłumaczenie PL |
| 17 | Ręczność · Handedness | 10 czynności w stylu Inwentarza Edynburskiego, wskaźnik lateralizacji, porównanie z tappingiem |
| 18 | Chronotyp · Chronotype | godziny snu w dni robocze i wolne → środek snu w dni wolne (MSFsc, Roenneberg), społeczny jet lag |
| 19 | Rotacja umysłowa · Mental rotation | 30 par figur: ta sama czy odbicie; trafność, czas, nachylenie czasu względem kąta (ms/°) |

Dokładne wzory: [docs/DOKUMENTACJA.md](docs/DOKUMENTACJA.md) oraz „Jak to liczę” przy każdej karcie na stronie.

## Funkcje · Features

> ⚠️ Zakładki „Litery i błędy” i „Wzrok” niczego nie diagnozują. To nie jest test na dysleksję ani badanie wzroku. · The “Letters & errors” and “Vision” tabs diagnose nothing; they are not a dyslexia test or an eye test.

- Polski i angielski, domyślnie według języka przeglądarki · Polish and English, picked from the browser language
- Motyw dzień/noc, domyślnie według systemu · Day/night theme, follows the system by default
- Tekst do przepisania nad polem, jako podkładka lub pod polem · Reference text above, under or below the field
- Hasło: wymyślone hasło nigdy nie jest zapisywane ani eksportowane · Password: the made-up password is never stored or exported
- Linki do polskiej i angielskiej Wikipedii przy testach · Links to Polish and English Wikipedia next to the tests
- Wyniki osobno od interpretacji oraz interpretacje łączone z kilku testów · Results separate from interpretation, plus combined interpretations
- Porównanie dwóch eksportów i karta wyniku PNG (lokalnie) · Comparing two exports and a PNG result card (locally)
- Eksport profilu (ocena + statystyki + surowe pomiary) do JSON; w Chrome/Edge domyślnie na Pulpit · Profile export to JSON; Desktop by default in Chrome/Edge

## Gdzie trafiają dane · Where data goes

- **Nigdzie.** Wszystkie pomiary zbiera i liczy JavaScript w przeglądarce. Są tylko w pamięci karty i znikają po jej odświeżeniu lub zamknięciu.
- **Nic nie jest wysyłane na GitHub.** GitHub Pages tylko dostarcza statyczne pliki; nie ma serwera, który mógłby coś odebrać.
- Kod nie zawiera `fetch`, `XMLHttpRequest`, WebSocketów, formularzy, ciasteczek, `localStorage` ani analityki. Sprawdź w kodzie (`js/`) albo w zakładce Network w DevTools.
- Przy wczytaniu strony GitHub (hosting, także czcionek) widzi standardowe dane żądania (IP, przeglądarka), ale nic z tego, co wpisujesz ani jak ruszasz myszką. Innych serwerów strona nie używa.
- Eksport profilu zapisuje plik JSON tylko na Twoim dysku.

---

- **Nowhere.** All measurements are collected and computed by JavaScript in your browser, kept only in the tab's memory and gone on refresh or close.
- **Nothing is sent to GitHub.** GitHub Pages only serves static files; there is no server to receive anything.
- The code has no `fetch`, `XMLHttpRequest`, WebSockets, forms, cookies, `localStorage` or analytics. Check the code (`js/`) or the Network tab in DevTools.
- On page load GitHub (hosting, fonts included) sees standard request data (IP, browser), but nothing of what you type or how you move the mouse. No other servers are used.
- Profile export saves a JSON file only to your own disk.

## Pliki · Files

```
index.html                 szkielet strony (zakładki, panele, meta dla wyszukiwarek)
css/style.css              wygląd, motywy jasny/ciemny, @font-face
js/
  main.js                  punkt wejścia: lista testów, zakładki, wyniki, eksport, motyw, język
  config.js                stałe (adres repozytorium)
  changelog.js             VERSION i lista zmian (dział „Co nowego”)
  i18n/
    index.js               wykrywanie i przełączanie języka, L(), słownik D
    pl.js, en.js           teksty interfejsu
  core/
    utils.js               DOM, statystyka, formatowanie, miary ruchu (drżenie, zatrzymania)
    cards.js               karty miar i podsumowania
    arena.js               płótno (canvas) i szkielet zadań z myszką
    chart.js               wykres punktowy, regresja liniowa
    errors.js              rodzaje błędów pisania
    registry.js            zdarzenia zakładek: SHOW, LEAVE, LANGHOOKS
  tests/                   jeden plik na test (typing, target-clicking, …, vision, memory, personality, handedness, dominant-eye, chronotype, mental-rotation)
  data/ipip-neo-300.js     300 pozycji IPIP-NEO (EN z pakietu MIT, PL – własne tłumaczenie)
  results/tools.js         porównanie eksportów, karta PNG
  results/combined.js      interpretacje łączone
  wiki.js                  linki do Wikipedii przy testach
assets/fonts/              IBM Plex Sans i Mono (SIL OFL 1.1)
assets/img/                favicon, ikony, miniatura linku
tests/smoke.mjs            test dymny (Playwright): zakładki, test pisania, karta PNG, czy każdy moduł z js/ jest wczytany
tools/serve.mjs            lokalny serwer plików
tools/make-images.mjs      generowanie ikon i miniatury
docs/DOKUMENTACJA.md       dokumentacja techniczna
CHANGELOG.md, PLAN.md      historia wersji, plan prac
sitemap.xml                mapa strony
.github/workflows/         wdrożenie na GitHub Pages po pushu do main
```

## Uruchomienie · Running

Strona to zwykłe pliki statyczne bez budowania, ale używa modułów ES, które nie działają po dwukliku w `index.html` (`file://`). Lokalnie uruchom serwer:

```bash
npm start                 # albo: python3 -m http.server 8000
# potem otwórz http://localhost:8000/
```

Testy i narzędzia (wymagają Node.js): `npm install`, `npx playwright install chromium`, potem `npm test` (test dymny) i `npm run images` (ikony i miniatura linku). Każdy push do `main` publikuje stronę na GitHub Pages.

The site is plain static files with no build step, but it uses ES modules, which don't work from `file://`. Run `npm start` (or `python3 -m http.server 8000`) and open `http://localhost:8000/`. Every push to `main` publishes the site to GitHub Pages.

---

<sub>autor: michał stankiewicz · stworzone przy użyciu vibecodingu · made with vibe coding</sub>
