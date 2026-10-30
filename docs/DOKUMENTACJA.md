# Dokumentacja techniczna

Wersja dokumentu odpowiada wersji strony **0.12.0**. Historia zmian: [CHANGELOG.md](../CHANGELOG.md).

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
| `img/` | `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` (180 px), `icon-512.png`, `og-image.png` (1200 × 630, miniatura linku). |
| `sitemap.xml` | Mapa strony dla wyszukiwarek. |
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
8. **Zadania**: `Typing`, `Click`, `Track`, `Drag`, `Draw`, `Dbl`, `Pass`, `Pseudo`, `Search`, `SnA`, `SnB`, `Plates` (plus `Cal` – kalibracja, `SnRun` – przebieg tablicy Snellena).
9. **Zakładki, wyniki, eksport, motyw, język**: zakładki są w grupach (`<div class="tgroup">` w `index.html`); grupa `warn` (ciekawostki zdrowotne) i jej panele (`panel warn`) mają kolor ostrzegawczy. Routing po `location.hash` (`#pisanie`, `#klikanie`, `#sledzenie`, `#przeciaganie`, `#rysowanie`, `#dwuklik`, `#haslo`, `#litery`, `#wzrok`, `#wyniki`).

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

## 5a. Hasło: profil i test zgodności

To klasyczne uwierzytelnianie dynamiką pisania: system sprawdza nie tylko, *czy* hasło jest poprawne, ale też, *jak* zostało wpisane.

1. **Wpisania próbne (5).** Pierwsze wpisanie ustala hasło (min. 6 znaków), kolejne muszą być identyczne. Wpisanie z Backspace, strzałkami, wklejeniem lub tekstem innym niż hasło jest odrzucane.
2. **Wektor cech.** Dla hasła o *n* znakach: *n* czasów przytrzymania (`keyup − keydown`) i *n*−1 odstępów (`keydown → keydown`), razem 2*n*−1 liczb.
3. **Profil.** Dla każdej cechy: średnia μᵢ i średnie odchylenie bezwzględne aᵢ (minimum 10 ms).
4. **Odległość** (skalowana odległość Manhattan): `d = (1/m) · Σ |xᵢ − μᵢ| / aᵢ`.
5. **Próg.** Każde wpisanie próbne porównuję z profilem zbudowanym z pozostałych czterech (leave-one-out). Próg = max(największa z tych odległości, średnia + 2 odchylenia).
6. **Test.** Wpisanie zgadza się z profilem, gdy `d ≤ próg`.

Hasło jest przechowywane wyłącznie w zmiennej w pamięci karty, żeby porównać tekst. Nie trafia do wyniku `R`, eksportu ani na ekran: pole maskuje znaki, a oś wykresu pokazuje numery klawiszy. Eksport zawiera tylko czasy, profil, próg i wyniki testów.

## 5b. Litery i błędy

Zakładka **nie jest testem na dysleksję** i mówi o tym na samej górze. Nie ma modelu ani danych porównawczych od osób z diagnozą, więc wyniki są wyłącznie opisem. Ramka „Co mówią badania” odsyła do prac o zapisie klawiszy i dysleksji (Inputlog, Dytective).

**Rodzaje błędów** (funkcja `classifyErrors`, używana w teście pisania i w pseudosłowach). Każdy błędnie wstawiony znak porównywany jest ze znakiem wzorca na tej samej pozycji, a kategorie sprawdzane są w tej kolejności:

| Kategoria | Warunek |
|-----------|---------|
| spacje | oczekiwana lub wpisana jest spacja |
| wielka / mała litera | te same litery, inna wielkość |
| litery lustrzane | para z b, d, p, q |
| ortografia | ó↔u, rz↔ż (r↔ż), ch↔h (c↔h), om↔ą (o↔ą) |
| ogonki | ta sama litera bazowa (ą→a, ł→l, a→ą…) |
| przestawione litery | wpisano następną literę wzorca, a zaraz potem oczekiwaną |
| pominięta litera | wpisano następną literę wzorca |
| podwojona litera | wpisano poprzednią literę wzorca |
| sąsiedni klawisz | klawisze odległe o ≤ 1,3 szerokości klawisza na układzie QWERTY |
| inne | pozostałe |

Z ciągu kolejnych błędów na sąsiednich pozycjach liczony jest tylko pierwszy, bo następne zwykle są skutkiem przesunięcia.

**Pseudosłowa:** 10 słów bez znaczenia (PL lub EN). Tempo `znaki ÷ minuty`, czas na słowo od pierwszego wpisania jego pierwszej litery do pierwszego wpisania ostatniej, porównanie z tempem z etapu 1 (`pseudosłowa ÷ zwykły tekst`).

**Szukanie liter:** siatka 7 × 12 = 84 znaki, w tym 21 liter „b”, reszta losowo z d, p, q. Mierzony jest czas od „Start” do „Gotowe”, trafienia, pominięcia i pomyłki z podziałem na literę wziętą za „b”.

## 5c. Wzrok

Zakładka **nie jest badaniem wzroku ani widzenia barw**; mówi o tym ramka na górze oraz każda ocena.

**Kalibracja.** Użytkownik dopasowuje prostokąt do karty o standardowym rozmiarze ID-1 (85,6 × 53,98 mm), co daje skalę `px/mm` w pikselach CSS, i podaje odległość od ekranu (0,5–6 m, domyślnie 2 m). Zmiana powiększenia strony po kalibracji ją psuje.

**Tablica Snellena.** Wysokość znaku poziomu 20/x: `h = odległość × tan(5′ × x / 20)` (przy 2 m znak 20/20 ma ok. 2,9 mm). Poziomy: 20/200, 100, 70, 50, 40, 30, 25, 20, 15, 10. Start od największego poziomu, który mieści się w 80% wysokości pola. Na poziomie pokazywane są pojedyncze znaki (do 5): 3 poprawne = zaliczony, 3 błędne = koniec. Wynik = najmniejszy zaliczony poziom, podany też jako 6/x i dziesiętnie (20/x). Test kończy się też, gdy kolejny znak miałby mniej niż 5 px (wtedy wynik może być zaniżony).

- Litery: C, D, H, K, N, O, V, Z rysowane na siatce 5 × 5 (grubość kreski = 1/5 wysokości, jak w literach Sloan); odpowiedź klawiszem litery lub przyciskiem.
- Obracane E: ten sam rozmiar, ramiona w jednym z 4 kierunków; odpowiedź strzałką lub przyciskiem.
- Znaki są czarne na białym tle niezależnie od motywu strony.

**Tablice barwne w stylu Ishihary.** To nie są oryginalne tablice Ishihary (chronione prawem autorskim), tylko tablice generowane przez stronę. Kropki (promień ok. 2,4–10 px) są rozmieszczane losowo bez nakładania się. Maska liczby to tekst narysowany na niewidocznym płótnie. Kolory w HSL: liczba – odcienie 12–30° (pomarańczowo-czerwone), tło – 72–98° (zielono-oliwkowe), jasność obu grup losowana z tego samego zakresu 48–64%, więc liczbę odróżnia głównie odcień. Pierwsza tablica (liczba 12) jest pokazowa: ciemnoniebieska liczba na jasnopomarańczowym tle. Potem 6 tablic testowych z losowymi liczbami. Wynik: liczba odczytanych tablic testowych i informacja, czy odczytano tablicę pokazową.

## 5d. Podpis myszką

Trzy podpisy tworzą wzorzec, kolejne są weryfikowane. Dla każdego podpisu: punkty wszystkich kresek (z czasem), przesunięte do środka ciężkości i przeskalowane do większego boku prostokąta otaczającego, przepróbkowane po długości drogi do 64 punktów; profil prędkości w 16 równych odcinkach czasu.

- **Kształt:** średnia odległość DTW podpisu od wzorców ÷ średnia odległość DTW między parami wzorców (min. 0,02).
- **Tempo:** `|ln(czas) − średnia ln(czasów wzorców)| ÷ odchylenie ln(czasów wzorców)` (min. 0,08).
- **Rytm:** średnia `1 − korelacja` profilu prędkości z profilami wzorców ÷ ta sama miara między parami wzorców (min. 0,05).
- **Wynik** = średnia trzech wskaźników; zgodny, gdy ≤ 2. Po weryfikacji na płótnie widać najbliższy wzorzec (szary) przeskalowany do nowego podpisu.

Sam podpis nie jest eksportowany, tylko liczby (czasy, liczba kresek, wskaźniki).

## 5e. Człowiek czy bot

Użytkownik robi 5 ruchów (kliknięcie szarego kółka, potem niebieskiego celu), a potem może „puścić bota”: skrypt rysuje na płótnie kursor, który jedzie od startu do celu idealnie prosto, ze stałą prędkością (krok ok. 9 px co 16 ms), klika dokładnie w środek i nie trzyma przycisku. Bot nie steruje prawdziwym kursorem; jego ślad jest generowany i analizowany tą samą funkcją co ruch człowieka.

| Oznaka bota | Miara | Próg |
|-------------|-------|------|
| prostoliniowość | odległość prosta ÷ długość drogi | > 0,995 |
| zmienność prędkości | odchylenie ÷ średnia prędkości między próbkami | < 0,15 |
| drżenie | RMS odchylenia od średniej z 7 sąsiednich punktów | < 0,15 px |
| odległość kliknięcia od środka celu | | < 1 px |
| przytrzymanie przycisku | `pointerup − pointerdown` | < 5 ms |

Werdykt „bot” przy ≥ 3 oznakach (średnie z 5 ruchów). Progi są dobrane ręcznie na potrzeby pokazu; prawdziwe systemy łączą wiele cech i modele uczone na dużych danych.

## 6. Format eksportu

Przycisk w zakładce „Wyniki”. W Chrome i Edge używa `showSaveFilePicker({ startIn: "desktop" })`, czyli okna zapisu otwartego na Pulpicie. W pozostałych przeglądarkach (albo gdy API jest niedostępne) plik jest zwykłym pobraniem i trafia do folderu Pobrane.

```json
{
  "app": "Odcisk klawiatury i myszki",
  "version": "0.12.0",
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
- Klucze `stages`: `pisanie`, `klikanie`, `sledzenie`, `przeciaganie`, `rysowanie`, `dwuklik`, `haslo`, `pseudoslowa`, `szukanie-liter`, `snellen-litery`, `snellen-e`, `tablice-barwne`, `czlowiek-czy-bot`, `podpis`; obecne są tylko ukończone etapy.
- Wpisany tekst nie jest eksportowany.

## 7. Wersjonowanie

Numeracja [SemVer](https://semver.org/lang/pl/): `MAJOR.MINOR.PATCH`. Dopóki projekt jest w fazie 0.x, nowa funkcja podnosi MINOR, poprawka PATCH.

Przy każdej zmianie:
1. Podnieś `VERSION` w `app.js`.
2. Dodaj wpis na górze tablicy `CHANGELOG` w `app.js` (PL i EN).
3. Dodaj ten sam wpis na górze `CHANGELOG.md`.
4. Zaktualizuj numer wersji w `README.md`, na początku tej dokumentacji i w `softwareVersion` (JSON-LD w `index.html`).
5. Przy zmianach wyglądu wygeneruj ponownie `img/og-image.png` (sekcja 9).

## 8. Dodawanie nowego zadania z myszką

1. W `index.html` skopiuj panel istniejącego zadania i nadaj nowe id (`tab-…`, `cv-…`, `st-…`, `go-…`, `sum-…`, `cards-…`), dodaj zakładkę w `<nav id="tabs">`.
2. W `app.js` utwórz zadanie przez `mouseTask({...})` z definicją kart (`specs`) i funkcjami `start`, `down`/`move`/`up`, `draw`, `analyse`, `render`, `summary`.
3. Dopisz je do tablic `TASKS`, `MOUSE` i nazwę zakładki do `TABS`.
4. Dodaj teksty do słownika `D` (oba języki).

## 9. Wyszukiwarki, favicon i miniatura

- **`<head>` w `index.html`:** tytuł i opis (`description`), adres kanoniczny, `theme-color`, ikony, znaczniki Open Graph i Twitter (miniatura `img/og-image.png`), dane strukturalne JSON-LD typu `WebApplication`.
- **Treść dla robotów:** nagłówek i opis są wpisane w HTML po polsku, więc są widoczne nawet bez uruchamiania JavaScriptu; JS podmienia je po wybraniu języka. Przy zmianie języka JS aktualizuje też `document.title` i opis.
- **`sitemap.xml`:** jeden adres. `robots.txt` nie ma sensu na stronie projektu GitHub Pages (`…github.io/behavioral-biometrics/`), bo roboty czytają go tylko z katalogu głównego domeny.
- **Google Search Console:** żeby przyspieszyć indeksowanie, dodaj w Search Console właściwość z prefiksem URL `https://michalstankiewicz4-cell.github.io/behavioral-biometrics/`, zweryfikuj ją plikiem HTML (wrzuć go do repo) i zgłoś `sitemap.xml`.
- **Odświeżanie miniatury:** `og-image.png` to zrzut górnej części strony 1200 × 630 w jasnym motywie. Przy większych zmianach wyglądu warto go wygenerować ponownie (np. Playwright: `page.setViewportSize({width:1200,height:630})`, `page.screenshot()`).
