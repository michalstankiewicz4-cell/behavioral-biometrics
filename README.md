# Odcisk klawiatury i myszki · Keyboard and mouse fingerprint

Jawne demo **biometrii behawioralnej**: sześć krótkich zadań (pisanie, klikanie celów, śledzenie punktu, przeciąganie, rysowanie po śladzie, podwójne kliknięcie), po których strona pokazuje, co zmierzyła i jak to policzyła. Strona ma wersję polską i angielską; język wybiera się automatycznie według przeglądarki.

An open demo of **behavioral biometrics**: six short tasks (typing, target clicking, dot tracking, dragging, tracing shapes, double click), after which the page shows what it measured and how. Available in Polish and English; the language is picked from your browser.

## ⚠️ Amatorski projekt · Amateur project

To hobbystyczne demo, a nie narzędzie naukowe ani medyczne. Progi w ocenach są orientacyjne, a wyniki zależą od sprzętu, zmęczenia i wprawy. **Nie sugeruj się wynikiem** i nie podejmuj na jego podstawie żadnych decyzji.

This is a hobby demo, not a scientific or medical tool. Thresholds are rough and results depend on hardware, tiredness and practice. **Don't take the results seriously** or base any decisions on them.

## Gdzie trafiają dane · Where data goes

- **Nigdzie.** Wszystkie pomiary zbiera i liczy JavaScript w przeglądarce. Są tylko w pamięci karty i znikają po jej odświeżeniu lub zamknięciu.
- **Nic nie jest wysyłane na GitHub.** GitHub Pages tylko dostarcza statyczne pliki; nie ma serwera, który mógłby coś odebrać.
- Kod nie zawiera `fetch`, `XMLHttpRequest`, WebSocketów, formularzy, ciasteczek, `localStorage` ani analityki. Sprawdź w `app.js` albo w zakładce Network w DevTools.
- Przy wczytaniu strony GitHub (hosting) i Google (czcionki) widzą standardowe dane żądania (IP, przeglądarka), ale nic z tego, co wpisujesz ani jak ruszasz myszką.

---

- **Nowhere.** All measurements are collected and computed by JavaScript in your browser, kept only in the tab's memory and gone on refresh or close.
- **Nothing is sent to GitHub.** GitHub Pages only serves static files; there is no server to receive anything.
- The code has no `fetch`, `XMLHttpRequest`, WebSockets, forms, cookies, `localStorage` or analytics. Check `app.js` or the Network tab in DevTools.
- On page load GitHub (hosting) and Google (fonts) see standard request data (IP, browser), but nothing of what you type or how you move the mouse.

## Pliki · Files

- `index.html` – struktura strony / page structure
- `style.css` – wygląd / styles
- `app.js` – pomiary, obliczenia, teksty PL/EN / measurements, maths, PL/EN texts

Uruchomienie lokalne: otwórz `index.html` w przeglądarce. · To run locally, open `index.html` in a browser.

---

<sub>autor: michał stankiewicz · stworzone przy użyciu vibecodingu · made with vibe coding</sub>
