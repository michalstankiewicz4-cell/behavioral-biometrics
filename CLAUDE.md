# Zasady dla tego repo

- Strona po polsku i angielsku: każdy nowy tekst dodawaj w obu językach (teksty statyczne w `js/i18n/pl.js` i `en.js`, teksty testów jako obiekty `{pl, en}`).
- Nic nie może opuszczać przeglądarki: żadnych `fetch`/XHR/WebSocket, ciasteczek, `localStorage`, analityki ani zasobów z zewnętrznych serwerów.
- Przy każdej zmianie na bieżąco aktualizuj wszystkie pliki .md, których zmiana dotyczy. Podnieś `VERSION` w `js/changelog.js` i `version` w `package.json`, dodaj wpis (PL i EN) na górze `CHANGELOG` w `js/changelog.js` i w `CHANGELOG.md`, zaktualizuj numer wersji w `README.md`, `docs/DOKUMENTACJA.md` i `softwareVersion` w `index.html`. Szczegóły: `docs/DOKUMENTACJA.md`, sekcja 7.
- Nie dodawaj własnych pomysłów bez pytania; proponuj je autorowi.
- Struktura: jeden test = jeden plik w `js/tests/`; wspólny kod w `js/core/`. Przed wypchnięciem uruchom `npm test`.
