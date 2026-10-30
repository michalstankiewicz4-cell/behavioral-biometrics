# Dokumentacja techniczna

Wersja dokumentu odpowiada wersji strony **0.29.0**. Historia zmian: [CHANGELOG.md](../CHANGELOG.md).

## 1. Założenia

- **Jawność.** Każda miara ma na stronie opis „Jak to liczę”, a cały kod jest w trzech plikach bez bibliotek.
- **Lokalność.** Nic nie opuszcza przeglądarki. Brak `fetch`, `XMLHttpRequest`, WebSocketów, formularzy, ciasteczek, `localStorage` i analityki. Stan żyje wyłącznie w pamięci karty.
- **Statyczny hosting.** GitHub Pages serwuje pliki z gałęzi `main` (workflow `.github/workflows/static.yml`). Czcionki są w `fonts/`, więc przy wczytaniu strona łączy się tylko z GitHubem.
- **Amatorski charakter.** Progi w ocenach są orientacyjne; wynik nie jest diagnozą.

## 2. Struktura plików

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
  tests/                   jeden plik na test (typing, target-clicking, …, vision, memory, personality, handedness, dominant-eye)
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

Strona nie ma kroku budowania: przeglądarka wczytuje moduły ES (`<script type="module" src="js/main.js">`) bezpośrednio. Moduły nie działają z adresu `file://`, więc lokalnie stronę otwiera się przez serwer: `npm start` (albo `python3 -m http.server`) i adres `http://localhost:8000/`.

## 3. Budowa kodu

- **`js/main.js`** importuje wszystkie testy, trzyma listę `TASKS` (testy z wynikiem), obsługuje zakładki (`showTab`, routing po `location.hash`), zestawienie wyników, eksport, motyw i język (`applyLang`), a na końcu inicjalizuje stronę.
- **Język:** `detectLang()` wybiera `pl` lub `en` według `navigator.languages`; `setLang()` przełącza. `LANG` jest eksportowane jako żywe powiązanie, więc każdy moduł widzi bieżący język. Teksty statyczne są w `js/i18n/pl.js` i `en.js` (wstawiane do elementów z atrybutem `data-i18n`), a teksty testów są obiektami `{pl, en}` w plikach testów; `L(obiekt)` zwraca wersję w bieżącym języku.
- **Karty miar** (`core/cards.js`): `buildCards(grid, specs)` buduje karty z definicji (`id`, `title`, `unit`, `rows`, `chips`, `how` – opis metody). Wartości wpisują `setMain`, `setRow`, `setHTML`; `setSummary(task)` wstawia ocenę słowną.
- **`Arena`** (`core/arena.js`): obsługa `<canvas>` (skalowanie do `devicePixelRatio`, współrzędne zdarzeń, `getCoalescedEvents()` dla gęstszego próbkowania). **`mouseTask(o)`**: szkielet zadań z myszką (start, `down`/`move`/`up`, `draw`, `analyse`, `render`, `summary`).
- **Rejestry** (`core/registry.js`): test może dopisać funkcję do `SHOW[hash]` (pokazanie zakładki / zmiana rozmiaru okna), `LEAVE[hash]` (opuszczenie zakładki) i `LANGHOOKS` (zmiana języka).
- **Test** to obiekt z polami `tab` (zakładka), `key` (nazwa w eksporcie), `grid`, `sumId`, `specs`, `title`, `R` (wynik) oraz metodami `render(R)` i `summary(R)`. Zakładki są w grupach (`<div class="tgroup">`); grupa `warn` (ciekawostki zdrowotne) i jej panele (`panel warn`) mają kolor ostrzegawczy.

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

**Mapa klawiatury** (pod kartami): dla każdego klawisza układu QWERTY średni czas przytrzymania albo liczba błędów, w których ten klawisz był oczekiwany. Polskie litery są liczone do klawisza bazowego (ą → a). Kolor: czas przytrzymania skalowany od najkrótszego do najdłuższego klawisza, błędy od 0 do maksimum. Dane trafiają do eksportu jako `measurements.keys`.

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

## 5f. Odcisk przeglądarki

Po kliknięciu „Pokaż mój odcisk” strona odczytuje lokalnie 14 cech: User-Agent, platformę, języki, strefę czasową, ekran (rozdzielczość, głębia, skalowanie), rozmiar okna, liczbę wątków CPU, przybliżoną pamięć RAM, punkty dotyku, preferencje systemu (motyw, animacje, kontrast), ustawienia prywatności (ciasteczka, DNT, GPC), kartę graficzną (WebGL, `WEBGL_debug_renderer_info`), odcisk canvas (skrót obrazka z tekstem, emoji i kształtami) i wykryte czcionki (40 popularnych czcionek sprawdzanych przez porównanie szerokości tekstu z czcionkami bazowymi).

Odcisk to 64-bitowy skrót `cyrb53` z połączonych wartości wszystkich cech. Strona nie zna innych odwiedzających, więc nie ocenia, jak rzadki jest odcisk. Nic nie jest wysyłane; jeśli wyeksportujesz profil, cechy trafią do pliku na Twoim dysku.

## 5g. Test Stroopa

24 próby: każdy z 4 kolorów (czerwony, zielony, niebieski, żółty) 6 razy jako kolor napisu; połowa prób zgodna (słowo = kolor), połowa niezgodna (losowe inne słowo). Kolejność losowa, przed każdym słowem krzyżyk przez 400–800 ms. Odpowiedź klawiszami 1–4 lub przyciskami z próbkami kolorów. Słowa są wyświetlane na ciemnym tle, żeby żółty był czytelny.

Efekt Stroopa = mediana czasu poprawnych odpowiedzi (niezgodne) − mediana (zgodne). Liczone są też błędy i to, ile razy wybrano kolor nazwany przez słowo.

## 5h. Czas reakcji i prawo Hicka

Cztery bloki po 8 prób z n = 1, 2, 4 i 8 możliwymi klawiszami (F; F J; D F J K; A S D F J K L ;). Bodziec (podświetlony kwadrat) pojawia się po losowej przerwie 0,7–1,8 s; naciśnięcie wcześniej to falstart i próba się powtarza. Można też klikać kwadraty.

Dla każdego bloku mediana czasu poprawnych odpowiedzi. Do median dopasowana jest prosta metodą najmniejszych kwadratów: `RT = a + b · log₂(n + 1)` (prawo Hicka–Hymana). Pokazywane są a, b (ms/bit), R² i przepustowość `1000 / b` (bit/s) oraz wykres.

## 5i. Prawo Fittsa

Ruchy dyskretne: kliknięcie punktu startowego (promień 12 px), potem trafienie w cel. 3 szerokości celu (16, 32, 64 px) × 3 odległości (120, 240, 400 px, zmniejszane proporcjonalnie na wąskich ekranach), każda kombinacja 2 razy, w losowej kolejności. Start i cel są losowo obracane wokół środka pola.

Dla każdego ruchu `ID = log₂(D/W + 1)` (wersja Shannona) i czas ruchu MT (od kliknięcia startu do trafienia, z pudłami). Dopasowanie `MT = a + b · ID` metodą najmniejszych kwadratów, R² i przepustowość = średnia `ID ÷ MT` (bit/s). Wykres punktowy z linią dopasowania.

## 5j. Tapping

Dwie rundy po 10 s: lewa ręka (klawisz F) i prawa (klawisz J); czas liczony od pierwszego uderzenia, automatyczne powtórzenia klawisza są ignorowane. Dla każdej ręki: liczba uderzeń, tempo (uderzenia/s), średni odstęp i jego CV, średnie przytrzymanie klawisza, zmęczenie = (tempo w 7–10 s − tempo w 0–3 s) ÷ tempo w 0–3 s. Różnica rąk = (prawa − lewa) ÷ średnia. Wykres odstępów w czasie dla obu rąk.

## 5k. Pamięć

**Ciąg cyfr (digit span):** cyfry (bez dwóch takich samych z rzędu) pokazywane po kolei: 800 ms widoczna, 200 ms przerwy. Potem użytkownik wpisuje ciąg. Start od 3 cyfr, maks. 12.

**Bloki Corsiego:** 9 bloków w stałych miejscach; sekwencja (bez powtórzeń bloków) zapala się po kolei: 700 ms + 250 ms przerwy. Użytkownik klika w tej samej kolejności. Start od 2 bloków, maks. 9.

W obu: poprawna odpowiedź wydłuża ciąg o 1, na każdej długości są 2 szanse, dwa błędy z rzędu kończą test. Zakres = najdłuższy poprawnie powtórzony ciąg.

## 5l. Wzrok: tarcza astygmatyczna i wrażliwość na kontrast

**Tarcza astygmatyczna:** 12 kierunków jak na zegarze (6 linii przez środek), każda linia jako 3 równoległe kreski, czarne na białym. Dwie rundy: lewe i prawe oko. Użytkownik zaznacza numery linii, które wyglądają na ciemniejsze lub ostrzejsze, albo „Wszystkie jednakowe”. Strona tylko zapisuje odpowiedzi.

**Wrażliwość na kontrast:** litery Sloan o stałej wysokości (do 180 px), szare na białym tle. Poziomy kontrastu Webera `10^(−0,15·i)`, i = 0…14 (100% do ok. 0,8%), jak na tablicy Pelli-Robsona. Odcień szarości `round(255·(1 − C))`; rzeczywisty kontrast po zaokrągleniu jest zapisywany w wyniku. Na poziomie 3 litery, zaliczony przy 2 poprawnych. Wynik `log CS = log₁₀(1 ÷ najniższy zaliczony kontrast)`.

## 5m. Linki do Wikipedii

`js/wiki.js` zawiera mapę `WIKI` (zakładka → lista artykułów) i wstawia pod nagłówkiem każdej zakładki linijkę „Więcej w Wikipedii”, z oznaczeniem języka (PL/EN). Linki są tylko tam, gdzie artykuł istnieje (sprawdzone ręcznie); polskich artykułów brakuje m.in. dla prawa Hicka, CAPTCHA i tappingu. Linki otwierają się w nowej karcie, a strona nic nie wysyła przy ich wyświetleniu.

## 5n. Osobowość: Wielka Piątka (IPIP-NEO-300)

Grupa zakładek „Cechy stałe”. Pełny kwestionariusz IPIP-NEO: 300 pozycji z International Personality Item Pool (domena publiczna, ipip.ori.org), po 10 na każdą z 30 pod-cech (6 na każdą z 5 cech). Tekst angielski za pakietem `@alheimsins/b5-costa-mccrae-300-ipip-neo-pi-r` (MIT), polskie tłumaczenie własne – niewystandaryzowane. Dane: `js/data/ipip-neo-300.js`, wiersz = `[pod-cecha, klucz ±1, EN, PL]`.

- Kolejność pokazywania jak w IPIP-NEO: k-ta pozycja kolejnych 30 pod-cech na przemian, 10 pozycji na stronę, 30 stron. Przejście dalej wymaga odpowiedzi na całej stronie.
- Skala 1–5 („zupełnie nie pasuje” … „bardzo pasuje”); pozycje z kluczem ujemnym odwracane: 6 − odpowiedź.
- Pod-cecha = średnia 10 pozycji; cecha = średnia 6 pod-cech (czyli 60 pozycji). Opis: < 2,5 niski, > 3,5 wysoki, pomiędzy średni.
- **Brak norm populacyjnych**: wynik to położenie na skali odpowiedzi, nie centyl.
- Odpowiedzi są tylko w pamięci karty (przejście do innej zakładki ich nie kasuje, zamknięcie karty – tak). Ponowny „Start” w trakcie wymaga drugiego kliknięcia w ciągu 4 s.
- Eksport (`osobowosc`): średnie cech i pod-cech, czas wypełniania w minutach i wszystkie 300 odpowiedzi.

## 5o. Ręczność

10 codziennych czynności (pisanie, rysowanie, rzucanie, nożyczki, szczoteczka, nóż bez widelca, łyżka, zapałka, młotek, słoik) – pytania własne, wzorowane na Inwentarzu Edynburskim (Oldfield, 1971). Odpowiedź −2 (zawsze lewa) … +2 (zawsze prawa).

- LQ = suma ÷ (2 × 10) × 100, zakres −100 … +100.
- Kategorie jak w krótkiej wersji EHI (Veale, 2014): LQ ≥ 60 praworęczność, ≤ −60 leworęczność, pomiędzy ręczność mieszana.
- Porównanie z tappingiem (jeśli wykonany): asymetria tempa (prawa − lewa) ÷ średnia; poniżej 3% remis. Liczone przy każdym pokazaniu zakładki, więc tapping może być zrobiony przed albo po.
- Eksport (`recznosc`): odpowiedzi, LQ, kategoria, liczba czynności lewą / prawą / obiema.

## 5p. Oko dominujące

W zakładce Wzrok. Test „okienka z dłoni” (metoda Milesa) prowadzony w 3 krokach: (1) obojgiem oczu ustaw okienko ze złożonych dłoni na czarnym punkcie, (2) zamknij lewe oko – czy punkt jest w okienku?, (3) zamknij prawe oko – czy punkt jest w okienku?

- Punkt zostaje tylko przy prawym oku → prawe dominujące; tylko przy lewym → lewe; przy obu albo przy żadnym → próba niejasna.
- Każdy „Start” to nowa próba; wynik to oko z większości prób (remis = niejasne).
- Eksport (`oko-dominujace`): wynik, lista prób, liczba zgodnych prób.

## 6. Format eksportu

Przycisk w zakładce „Wyniki”. W Chrome i Edge używa `showSaveFilePicker({ startIn: "desktop" })`, czyli okna zapisu otwartego na Pulpicie. W pozostałych przeglądarkach (albo gdy API jest niedostępne) plik jest zwykłym pobraniem i trafia do folderu Pobrane.

```json
{
  "app": "Cyfrowy odcisk człowieka",
  "version": "0.29.0",
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
- Klucze `stages`: `pisanie`, `klikanie`, `sledzenie`, `przeciaganie`, `rysowanie`, `dwuklik`, `haslo`, `pseudoslowa`, `szukanie-liter`, `snellen-litery`, `snellen-e`, `tablice-barwne`, `astygmatyzm`, `kontrast`, `pamiec-cyfry`, `pamiec-corsi`, `tapping`, `prawo-fittsa`, `reakcja-hick`, `stroop`, `odcisk-przegladarki`, `czlowiek-czy-bot`, `podpis`; obecne są tylko ukończone etapy.
- Wpisany tekst nie jest eksportowany.

## 6a. Porównanie eksportów i karta PNG

**Porównanie:** dwa pola wyboru pliku w zakładce Wyniki. Pliki są czytane przez `FileReader` i `JSON.parse` lokalnie. Tabela pokazuje, dla każdego etapu obecnego w którymkolwiek pliku, wszystkie wartości z `stats` (A i B obok siebie); różniące się wartości są wyróżnione. Plik bez pola `stages` jest odrzucany z komunikatem.

**Karta PNG:** płótno 1200 × 630 z nazwą, wersją, datą i główną wartością pierwszej karty każdego ukończonego testu (maks. 12, w dwóch kolumnach), z dopiskiem, że to amatorski projekt. Obraz powstaje przez `canvas.toBlob`, podgląd pokazuje się na stronie, a przycisk „Pobierz PNG” zapisuje go jako plik (`karta-wyniku-RRRR-MM-DD.png`).

## 6b. Zakładka Wyniki: liczby, interpretacja, interpretacje łączone

1. **Wyniki (liczby):** tabela z główną wartością każdej karty każdego ukończonego testu (z `cardStats`), bez komentarza.
2. **Interpretacja testów:** ocena słowna każdego testu osobno (`task.summary`).
3. **Interpretacje łączone** (`js/results/combined.js`): cztery opisowe zestawienia z kilku testów. Każde pokazuje, na jakich testach się opiera i których brakuje; potrzebuje co najmniej dwóch ukończonych testów.
   - *Szybkość ogólna:* prosta reakcja (Hick, n = 1), reakcja przy klikaniu, tempo pisania, tapping. Porównanie z orientacyjnymi wartościami: prosta reakcja ok. 200–300 ms, pisanie ok. 35–45 słów/min.
   - *Szybkość kontra precyzja:* pisanie (tempo, odsetek błędów), Fitts (przepustowość, pudła), klikanie (pudła, przestrzelenia), przeciąganie (precyzja). Szybko = ≥ 45 słów/min lub ≥ 5 bit/s; dużo błędów = ≥ 5% znaków, ≥ 15% pudeł lub ≥ 40% przestrzeleń. Progi ustalone na potrzeby strony.
   - *Stabilność ręki i rytmu:* drżenie (przeciąganie, rysowanie), CV tappingu (< 0,15 = równo), CV rytmu pisania (< 0,35 = równo).
   - *Uwaga i pamięć:* efekt Stroopa (> 150 ms silny, < 20 ms słaby), szukanie liter, zakres cyfr kontra Corsi.

## 7. Wersjonowanie

Numeracja [SemVer](https://semver.org/lang/pl/): `MAJOR.MINOR.PATCH`. Dopóki projekt jest w fazie 0.x, nowa funkcja podnosi MINOR, poprawka PATCH.

Przy każdej zmianie:
1. Podnieś `VERSION` w `js/changelog.js` (i `version` w `package.json`).
2. Dodaj wpis na górze tablicy `CHANGELOG` w `js/changelog.js` (PL i EN).
3. Dodaj ten sam wpis na górze `CHANGELOG.md`.
4. Zaktualizuj numer wersji w `README.md`, na początku tej dokumentacji i w `softwareVersion` (JSON-LD w `index.html`).
5. Przy zmianach wyglądu wygeneruj ponownie `assets/img/og-image.png` (sekcja 9).

## 8. Dodawanie nowego zadania z myszką

1. W `index.html` skopiuj panel istniejącego zadania i nadaj nowe id (`tab-…`, `cv-…`, `st-…`, `go-…`, `sum-…`, `cards-…`), dodaj zakładkę w `<nav id="tabs">`.
2. Utwórz plik w `js/tests/` i w nim zadanie przez `mouseTask({...})` (z `core/arena.js`) z definicją kart (`specs`) i funkcjami `start`, `down`/`move`/`up`, `draw`, `analyse`, `render`, `summary`.
3. Zaimportuj je w `js/main.js` i dopisz do tablic `TASKS`, `MOUSE` oraz nazwę zakładki do `TABS`.
4. Dodaj teksty do `js/i18n/pl.js` i `en.js`.
5. Uruchom `npm test` (test dymny).

## 9. Wyszukiwarki, favicon i miniatura

- **`<head>` w `index.html`:** tytuł, opis (`description`, po polsku; wersję angielską JS wstawia po zmianie języka), frazy kluczowe po polsku i angielsku (`keywords` oraz `keywords` w JSON-LD, obejmujące wszystkie zakładki), adres kanoniczny, `theme-color`, ikony, znaczniki Open Graph i Twitter (miniatura `assets/img/og-image.png`), dane strukturalne JSON-LD typu `WebApplication`.
- **Treść dla robotów:** nagłówek i opis są wpisane w HTML po polsku, więc są widoczne nawet bez uruchamiania JavaScriptu; JS podmienia je po wybraniu języka. Przy zmianie języka JS aktualizuje też `document.title` i opis.
- **`sitemap.xml`:** jeden adres. `robots.txt` nie ma sensu na stronie projektu GitHub Pages (`…github.io/behavioral-biometrics/`), bo roboty czytają go tylko z katalogu głównego domeny.
- **Google Search Console:** żeby przyspieszyć indeksowanie, dodaj w Search Console właściwość z prefiksem URL `https://michalstankiewicz4-cell.github.io/behavioral-biometrics/`, zweryfikuj ją plikiem HTML (wrzuć go do repo) i zgłoś `sitemap.xml`.
- **Odświeżanie miniatury:** `og-image.png` to zrzut górnej części strony 1200 × 630 w jasnym motywie. Przy większych zmianach wyglądu warto go wygenerować ponownie (`npm run images`).
