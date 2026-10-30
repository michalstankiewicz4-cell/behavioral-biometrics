# Dokumentacja techniczna

Wersja dokumentu odpowiada wersji strony **0.5.0**. Historia zmian: [CHANGELOG.md](../CHANGELOG.md).

## 1. Założenia

- **Jawność.** Każda miara ma na stronie opis „Jak to liczę”, a cały kod jest w trzech plikach bez bibliotek.
- **Lokalność.** Nic nie opuszcza przeglądarki. Brak `fetch`, `XMLHttpRequest`, WebSocketów, formularzy, ciasteczek, `localStorage` i analityki. Stan żyje wyłącznie w pamięci karty.
- **Statyczny hosting.** GitHub Pages serwuje pliki z gałęzi `main` (workflow `.github/workflows/static.yml`). Czcionki są w `fonts/`, więc przy wczytaniu strona łączy się tylko z GitHubem.
- **Amatorski charakter.** Progi w ocenach są orientacyjne; wynik nie jest diagnozą.

## 2. Struktura plików

| Plik | Zawartość |
|------|-----------|
| `index.html` | Szkielet: nagłówek, zastrzeżenia, zakładki, panele zadań, „Co nowego”, stopka. Teksty wstawiane są z `app.js` przez atrybut `data-i18n`. |
| `style.css` | `@font-face` dla czcionek lokalnych, tokeny kolorów (jasny i ciemny motyw), układ. |
| `app.js` | Cała logika, w jednym IIFE (opis niżej). |
| `fonts/` | IBM Plex Sans i Mono (400/500/600, zakresy `latin` i `latin-ext`), licencja SIL OFL 1.1. |

## 3. Budowa `app.js`

Kolejność sekcji w pliku:

1. **`VERSION` i `CHANGELOG`**: numer wersji i lista zmian (PL/EN), z których powstaje dział „Co nowego” i plakietka przy nazwie.
2. **Język**: `detectLang()` wybiera `pl` lub `en` według `navigator.languages`. Słownik `D` zawiera teksty statyczne; `L({pl,en})` zwraca tekst w bieżącym języku.
3. **Statystyka**: `mean`, `median`, `sd` (odchylenie próbkowe, n−1), formatowanie liczb według języka.
4. **Wspólne miary ruchu**: `tremorRMS`, `countPauses`, `pathLen` (opis w p. 5).
5. **Karty miar**: `buildCards(grid, specs)` buduje karty z definicji. Każda definicja ma `id`, `title`, `unit`, `rows`, `chips` i `how` (opis metody). Wartości wpisują `setMain`, `setRow` i `setHTML`.
6. **`Arena`**: obsługa `<canvas>` (skalowanie do `devicePixelRatio`, współrzędne zdarzeń, `getCoalescedEvents()` dla gęstszego próbkowania ruchu).
7. **`mouseTask(o)`**: wspólny szkielet zadań z myszką. Zadanie dostarcza `start`, `down`, `move`, `up`, `draw`, `analyse`, `render`, `summary`; szkielet obsługuje przycisk Start, przerwanie przy zmianie zakładki i zakończenie.
8. **Zadania**: `Typing`, `Click`, `Track`, `Drag`, `Draw`, `Dbl`.
9. **Zakładki, wyniki, eksport, motyw, język**: routing po `location.hash` (`#pisanie`, `#klikanie`, `#sledzenie`, `#przeciaganie`, `#rysowanie`, `#dwuklik`, `#wyniki`).

Każde zadanie po zakończeniu zapisuje wynik analizy w `task.R`. Z `R` powstają karty (`render`), ocena słowna (`summary`), zestawienie w „Wynikach” i eksport. Przy zmianie języka karty budowane są od nowa z tego samego `R`.

Źródło czasu: `performance.now()` i `event.timeStamp`, oba liczone od tego samego punktu startu strony, z rozdzielczością poniżej milisekundy (przeglądarki celowo ją zaokrąglają, zwykle do 0,1–1 ms).

## 4. Miary: pisanie

| Miara | Wzór |
|-------|------|
| Słowa/min | `(znaki w tekście końcowym ÷ 5) ÷ minuty`, czas od pierwszego `keydown` do ostatniej zmiany tekstu |
| Czas przytrzymania (dwell) | `keyup − keydown` dla klawiszy znakowych; bez modyfikatorów, Backspace i `event.repeat` |
| Czas przelotu (flight) | `keydown(następny) − keyup(poprzedni)`; wartość ujemna = nakładanie klawiszy |
| Rytm (CV) | `odchylenie ÷ średnia` odstępów `keydown → keydown` między znakami, bez pauz ≥ 1 s. Progi: < 0,35 równy, 0,35–0,6 umiarkowany, > 0,6 nierówny |
| Błędy | wstawiony znak ≠ znak wzorca na tej pozycji (liczony, nawet jeśli później poprawiony) |
| Poprawki | ciąg usunięć = jedna poprawka. Opóźnienie = liczba znaków wpisanych po pierwszym błędzie w chwili rozpoczęcia poprawki (0 = natychmiastowa) |
| Pauzy | odstęp `keydown → keydown` ≥ 1 s, z podaniem słowa |
| Pary liter | średni odstęp `keydown → keydown` dla dwóch kolejnych poprawnych liter; pokazywane pary z ≥ 2 wystąpieniami |

Pole tekstowe blokuje wklejanie, upuszczanie, Enter i przesuwanie kursora, żeby pomiar dotyczył tylko pisania na końcu tekstu.

## 5. Miary: myszka

**Wspólne:**
- **Drżenie (RMS):** dla każdego punktu drogi odległość od średniej z 7 sąsiednich punktów (±3), potem średnia kwadratowa. Mierzy drobne drgania, a nie kształt ruchu.
- **Zatrzymanie:** fragment ruchu z prędkością < 20 px/s trwający ≥ 150 ms.

| Zadanie | Miara | Wzór |
|---------|-------|------|
| Klikanie (12 celów, r = 20 px) | czas reakcji | pojawienie się celu → pierwszy ruch > 4 px |
| | czas ruchu | pierwszy ruch → `pointerdown` na celu |
| | prostoliniowość | `odległość prosta ÷ długość drogi` |
| | przestrzelenie | rzut drogi na kierunek start → cel wyszedł poza daleką krawędź celu |
| | przytrzymanie | `pointerup − pointerdown` |
| Śledzenie (15 s) | odległość | średnia odległość kursora od kropki w każdej klatce |
| | czas w strefie | odsetek klatek z odległością ≤ 25 px |
| | opóźnienie | przesunięcie τ ∈ [0, 800] ms (krok 10 ms) minimalizujące średnią odległość kursora od pozycji kropki z chwili t − τ |
| | płynność | szczyty prędkości > 40 px/s po wygładzeniu średnią z 7 klatek, na sekundę |
| Przeciąganie (6 razy) | czas | pierwsze chwycenie → udane upuszczenie |
| | precyzja | odległość środka kwadratu od środka ramki |
| | drżenie, zatrzymania | jak wyżej, tylko przy wciśniętym przycisku |
| Rysowanie (okrąg, linia) | odchylenie | okrąg: `|odległość od środka − promień|`; linia: odległość od odcinka |
| | pokrycie | okrąg: obiegnięty kąt ÷ 360°; linia: zakres rzutu na odcinek |
| Podwójne kliknięcie (8 razy) | odstęp | `pointerdown₁ → pointerdown₂`; „za wolne” > 500 ms (domyślny próg Windows) |
| | drgnięcie | odległość między miejscami obu wciśnięć |

Ruch kursora śledzony jest przez Pointer Events. Na ekranach dotykowych strona wyświetla ostrzeżenie, bo mierzyłaby palec, a nie rękę na myszce.

## 6. Format eksportu

Przycisk w zakładce „Wyniki”. W Chrome i Edge używa `showSaveFilePicker({ startIn: "desktop" })`, czyli okna zapisu otwartego na Pulpicie. W pozostałych przeglądarkach (albo gdy API jest niedostępne) plik jest zwykłym pobraniem i trafia do folderu Pobrane.

```json
{
  "app": "Odcisk klawiatury i myszki",
  "version": "0.5.0",
  "source": "https://github.com/michalstankiewicz4-cell/behavioral-biometrics",
  "exported": "2026-10-30T20:40:00.000Z",
  "language": "pl",
  "note": "To hobbystyczne demo…",
  "stages": {
    "pisanie": {
      "title": "Pisanie",
      "result": "Piszesz szybko (52 słów/min…)",
      "stats": { "Prędkość": { "value": "52 słów/min", "znaków na minutę": "260", "…": "…" } },
      "measurements": { "wpm": 52.1, "dwell": [96.2, 88.4], "…": "…" }
    }
  }
}
```

- `result`: ocena słowna, `stats`: wartości z kart w tej postaci, w jakiej są na stronie, `measurements`: surowe dane analizy (listy czasów w ms, odległości w px).
- Klucze `stages`: `pisanie`, `klikanie`, `sledzenie`, `przeciaganie`, `rysowanie`, `dwuklik`; obecne są tylko ukończone etapy.
- Wpisany tekst nie jest eksportowany.

## 7. Wersjonowanie

Numeracja [SemVer](https://semver.org/lang/pl/): `MAJOR.MINOR.PATCH`. Dopóki projekt jest w fazie 0.x, nowa funkcja podnosi MINOR, poprawka PATCH.

Przy każdej zmianie:
1. Podnieś `VERSION` w `app.js`.
2. Dodaj wpis na górze tablicy `CHANGELOG` w `app.js` (PL i EN).
3. Dodaj ten sam wpis na górze `CHANGELOG.md`.
4. Zaktualizuj numer wersji w `README.md` i na początku tej dokumentacji.

## 8. Dodawanie nowego zadania z myszką

1. W `index.html` skopiuj panel istniejącego zadania i nadaj nowe id (`tab-…`, `cv-…`, `st-…`, `go-…`, `sum-…`, `cards-…`), dodaj zakładkę w `<nav id="tabs">`.
2. W `app.js` utwórz zadanie przez `mouseTask({...})` z definicją kart (`specs`) i funkcjami `start`, `down`/`move`/`up`, `draw`, `analyse`, `render`, `summary`.
3. Dopisz je do tablic `TASKS`, `MOUSE` i nazwę zakładki do `TABS`.
4. Dodaj teksty do słownika `D` (oba języki).
