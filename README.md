# Odcisk klawiatury i myszki · Keyboard and mouse fingerprint

**Wersja / version: 0.21.0** · [Co nowego / changelog](CHANGELOG.md) · [Plan](PLAN.md) · [Dokumentacja / docs](docs/DOKUMENTACJA.md)

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
| 9 | Wzrok · Vision | kalibracja ekranu, tablica Snellena (litery lub obracane E), generowane tablice barwne w stylu Ishihary, tarcza astygmatyczna, wrażliwość na kontrast; **to nie jest badanie wzroku** |
| 8 | Podpis myszką · Mouse signature | 3 podpisy jako wzorzec, weryfikacja kształtu (DTW), tempa i rytmu |
| 9 | Człowiek czy bot · Human or bot | Twoje ruchy myszki kontra prosty bot: prostoliniowość, zmienność prędkości, drżenie, celność, przytrzymanie |
| 10 | Odcisk przeglądarki · Browser fingerprint | co strona może odczytać bez pytania (14 cech) i skrót odcisku, liczone lokalnie |
| 11 | Test Stroopa · Stroop test | czas nazwania koloru napisu: słowa zgodne kontra niezgodne |
| 12 | Czas reakcji · Reaction time (Hick) | reakcja przy 1, 2, 4 i 8 możliwościach, dopasowanie prawa Hicka |
| 13 | Prawo Fittsa · Fitts's law | 18 ruchów do celów różnej wielkości i odległości, dopasowanie MT = a + b·ID, przepustowość |
| 14 | Tapping · Finger tapping | 10 s stukania lewą i prawą ręką: tempo, równomierność, zmęczenie, różnica rąk |
| 15 | Pamięć · Memory | zakres pamięci cyfr i bloki Corsiego |

Dokładne wzory: [docs/DOKUMENTACJA.md](docs/DOKUMENTACJA.md) oraz „Jak to liczę” przy każdej karcie na stronie.

## Funkcje · Features

> ⚠️ Zakładki „Litery i błędy” i „Wzrok” niczego nie diagnozują. To nie jest test na dysleksję ani badanie wzroku. · The “Letters & errors” and “Vision” tabs diagnose nothing; they are not a dyslexia test or an eye test.

- Polski i angielski, domyślnie według języka przeglądarki · Polish and English, picked from the browser language
- Motyw dzień/noc, domyślnie według systemu · Day/night theme, follows the system by default
- Tekst do przepisania nad polem, jako podkładka lub pod polem · Reference text above, under or below the field
- Hasło: wymyślone hasło nigdy nie jest zapisywane ani eksportowane · Password: the made-up password is never stored or exported
- Porównanie dwóch eksportów i karta wyniku PNG (lokalnie) · Comparing two exports and a PNG result card (locally)
- Eksport profilu (ocena + statystyki + surowe pomiary) do JSON; w Chrome/Edge domyślnie na Pulpit · Profile export to JSON; Desktop by default in Chrome/Edge

## Gdzie trafiają dane · Where data goes

- **Nigdzie.** Wszystkie pomiary zbiera i liczy JavaScript w przeglądarce. Są tylko w pamięci karty i znikają po jej odświeżeniu lub zamknięciu.
- **Nic nie jest wysyłane na GitHub.** GitHub Pages tylko dostarcza statyczne pliki; nie ma serwera, który mógłby coś odebrać.
- Kod nie zawiera `fetch`, `XMLHttpRequest`, WebSocketów, formularzy, ciasteczek, `localStorage` ani analityki. Sprawdź w `app.js` albo w zakładce Network w DevTools.
- Przy wczytaniu strony GitHub (hosting, także czcionek) widzi standardowe dane żądania (IP, przeglądarka), ale nic z tego, co wpisujesz ani jak ruszasz myszką. Innych serwerów strona nie używa.
- Eksport profilu zapisuje plik JSON tylko na Twoim dysku.

---

- **Nowhere.** All measurements are collected and computed by JavaScript in your browser, kept only in the tab's memory and gone on refresh or close.
- **Nothing is sent to GitHub.** GitHub Pages only serves static files; there is no server to receive anything.
- The code has no `fetch`, `XMLHttpRequest`, WebSockets, forms, cookies, `localStorage` or analytics. Check `app.js` or the Network tab in DevTools.
- On page load GitHub (hosting, fonts included) sees standard request data (IP, browser), but nothing of what you type or how you move the mouse. No other servers are used.
- Profile export saves a JSON file only to your own disk.

## Pliki · Files

```
index.html            struktura strony
style.css             wygląd, motywy, czcionki (@font-face)
app.js                pomiary, obliczenia, teksty PL/EN, wersja i lista zmian
fonts/                IBM Plex Sans i Mono (SIL OFL 1.1, fonts/OFL-LICENSE.txt)
img/                  favicon, ikony, miniatura do udostępniania (og-image.png)
sitemap.xml           mapa strony dla wyszukiwarek
docs/DOKUMENTACJA.md  dokumentacja techniczna
CHANGELOG.md          historia wersji
PLAN.md               plan dalszych prac
.github/workflows/    automatyczne wdrożenie na GitHub Pages po pushu do main
```

## Uruchomienie · Running

Otwórz `index.html` w przeglądarce, bez instalowania czegokolwiek. Każdy push do `main` publikuje stronę na GitHub Pages.

Open `index.html` in a browser, nothing to install. Every push to `main` publishes the page to GitHub Pages.

---

<sub>autor: michał stankiewicz · stworzone przy użyciu vibecodingu · made with vibe coding</sub>
