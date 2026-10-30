// Wersja strony i lista zmian (to samo co CHANGELOG.md)
import { mean, median, ms } from "./core/utils.js";
import { D } from "./i18n/index.js";
import { Fitts } from "./tests/fitts.js";
import { Search } from "./tests/letter-search.js";
import { Corsi } from "./tests/memory.js";
import { Hick } from "./tests/reaction-hick.js";
import { Stroop } from "./tests/stroop.js";
import { Typing } from "./tests/typing.js";

// ---------- wersja i lista zmian (najnowsza na górze; to samo w CHANGELOG.md) ----------
const VERSION = "0.23.0";
const CHANGELOG = [
  { v:"0.23.0", date:"2026-10-30",
    pl:["Linki do polskiej i angielskiej Wikipedii pod nagłówkiem każdego testu, tam gdzie artykuł istnieje (np. efekt Stroopa, prawo Fittsa, tablica Snellena, dynamika pisania)."],
    en:["Links to Polish and English Wikipedia under each test's heading, where an article exists (e.g. Stroop effect, Fitts's law, Snellen chart, keystroke dynamics)."] },
  { v:"0.22.0", date:"2026-10-30",
    pl:["Projekt podzielony na pliki i foldery: moduły ES w js/ (core, i18n, tests, results), style w css/, czcionki i obrazy w assets/.","Teksty interfejsu w osobnych plikach js/i18n/pl.js i en.js.","Narzędzia deweloperskie: lokalny serwer (npm start), test dymny przechodzący przez wszystkie zakładki (npm test), generator ikon i miniatury (npm run images).","Zaktualizowane README i dokumentacja (struktura, uruchamianie lokalne przez serwer)."],
    en:["Project split into files and folders: ES modules in js/ (core, i18n, tests, results), styles in css/, fonts and images in assets/.","Interface texts in separate files js/i18n/pl.js and en.js.","Developer tools: local server (npm start), a smoke test that goes through every tab (npm test), an icon and preview image generator (npm run images).","Updated README and documentation (structure, running locally through a server)."] },
  { v:"0.21.0", date:"2026-10-30",
    pl:["Zakładka „Wyniki”: porównanie dwóch wyeksportowanych plików JSON obok siebie, z wyróżnieniem różnic; pliki czytane tylko lokalnie.","Zakładka „Wyniki”: karta wyniku jako obrazek PNG (1200 × 630) z najważniejszą wartością z każdego ukończonego testu, z podglądem i pobieraniem."],
    en:["“Results” tab: side-by-side comparison of two exported JSON files with differences highlighted; files are read locally only.","“Results” tab: result card as a PNG image (1200 × 630) with the key value from each finished test, with preview and download."] },
  { v:"0.20.0", date:"2026-10-30",
    pl:["Zakładka „Wzrok”: nowa tarcza astygmatyczna (osobno lewe i prawe oko, zaznaczanie kierunków, które wyglądają inaczej).","Zakładka „Wzrok”: nowy test wrażliwości na kontrast (litery o malejącym kontraście, wynik w log CS jak na tablicy Pelli-Robsona).","Oba testy z ostrzeżeniem, że to nie jest badanie wzroku."],
    en:["“Vision” tab: new astigmatism dial (left and right eye separately, marking directions that look different).","“Vision” tab: new contrast sensitivity test (letters with decreasing contrast, result in log CS as on the Pelli-Robson chart).","Both tests carry a warning that they are not an eye test."] },
  { v:"0.19.0", date:"2026-10-30",
    pl:["Nowy test „Pamięć krótkotrwała” z dwiema częściami: ciąg cyfr (digit span) i bloki Corsiego.","Ciąg wydłuża się po każdym poprawnym powtórzeniu, dwa błędy z rzędu kończą test; wynik to zakres pamięci i lista prób."],
    en:["New “Short-term memory” test with two parts: digit span and Corsi blocks.","The sequence grows after every correct repeat, two errors in a row end the test; the result is the memory span and a list of attempts."] },
  { v:"0.18.0", date:"2026-10-30",
    pl:["Nowy test „Tapping”: 10 s stukania osobno lewą (F) i prawą (J) ręką.","Tempo, równomierność odstępów, przytrzymanie klawisza, zmęczenie pod koniec rundy, różnica między rękami i wykres odstępów w czasie."],
    en:["New “Finger tapping” test: 10 s of tapping with the left (F) and right (J) hand separately.","Rate, interval regularity, key hold, end-of-round fatigue, difference between hands and a chart of intervals over time."] },
  { v:"0.17.0", date:"2026-10-30",
    pl:["Nowy test „Prawo Fittsa”: 18 ruchów do celów o 3 szerokościach i 3 odległościach.","Dopasowanie MT = a + b · ID, przepustowość w bitach na sekundę i wykres punktowy z linią dopasowania.","Poprawka wykresów: linia dopasowania nie wychodzi poza pole wykresu."],
    en:["New “Fitts's law” test: 18 movements to targets of 3 widths and 3 distances.","Fit MT = a + b · ID, throughput in bits per second and a scatter chart with the fitted line.","Chart fix: the fitted line no longer extends outside the plot area."] },
  { v:"0.16.0", date:"2026-10-30",
    pl:["Nowy test „Czas reakcji i prawo Hicka”: 4 bloki z 1, 2, 4 i 8 możliwymi klawiszami, losowa przerwa przed bodźcem, wykrywanie falstartów.","Wykres median z dopasowaną prostą RT = a + b · log₂(n + 1), nachylenie w ms na bit i przepustowość."],
    en:["New “Reaction time and Hick's law” test: 4 blocks with 1, 2, 4 and 8 possible keys, a random pause before the stimulus, false-start detection.","Chart of medians with the fitted line RT = a + b · log₂(n + 1), slope in ms per bit and throughput."] },
  { v:"0.15.0", date:"2026-10-30",
    pl:["Nowa grupa „Testy psychomotoryczne” i pierwszy test: test Stroopa (24 próby, słowa zgodne i niezgodne, odpowiedź klawiszami 1–4).","Wynik: efekt Stroopa w milisekundach, błędy i liczba pomyłek „przeczytałem słowo zamiast koloru”."],
    en:["New “Psychomotor tests” group and the first test: the Stroop test (24 trials, congruent and incongruent words, answer with keys 1–4).","Result: Stroop effect in milliseconds, errors and the number of “read the word instead of the colour” mistakes."] },
  { v:"0.14.0", date:"2026-10-30",
    pl:["Mapa cieplna klawiatury w zakładce Pisanie: kolor klawisza według średniego czasu przytrzymania albo liczby błędów, z przełącznikiem i podpowiedzią z liczbą pomiarów."],
    en:["Keyboard heat map in the Typing tab: key colour by mean hold time or number of errors, with a switch and a tooltip showing the sample count."] },
  { v:"0.13.0", date:"2026-10-30",
    pl:["Nowa zakładka „Odcisk przeglądarki”: tabela 14 cech, które każda strona może odczytać bez pytania (m.in. strefa czasowa, ekran, karta graficzna, odcisk canvas, czcionki), z opisem, co każda zdradza.","Skrót odcisku liczony lokalnie i wyjaśnienie, jak działa śledzenie bez ciasteczek."],
    en:["New “Browser fingerprint” tab: a table of 14 features any website can read without asking (incl. time zone, screen, graphics card, canvas fingerprint, fonts), with what each one reveals.","Fingerprint hash computed locally and an explanation of tracking without cookies."] },
  { v:"0.12.0", date:"2026-10-30",
    pl:["Nowa zakładka „Człowiek czy bot”: 5 Twoich ruchów myszką, potem przycisk „Puść bota”, który robi to samo idealnie prosto i równo.","Porównanie pięciu cech (prostoliniowość, zmienność prędkości, drżenie, celność kliknięcia, przytrzymanie przycisku) i werdykt według liczby oznak bota."],
    en:["New “Human or bot” tab: 5 of your mouse movements, then a “Release the bot” button that does the same perfectly straight and evenly.","Comparison of five features (straightness, speed variability, tremor, click accuracy, button hold) and a verdict based on the number of bot signs."] },
  { v:"0.11.0", date:"2026-10-30",
    pl:["Nowa zakładka „Podpis myszką” w grupie biometrii: 3 podpisy tworzą wzorzec, a każdy kolejny jest weryfikowany pod względem kształtu (DTW), tempa i rytmu.","Po weryfikacji widać najbliższy wzorzec nałożony na nowy podpis; historia weryfikacji i karty z wyjaśnieniem obliczeń."],
    en:["New “Mouse signature” tab in the biometrics group: 3 signatures form a template and every later one is verified by shape (DTW), tempo and rhythm.","After verification the closest template is overlaid on the new signature; verification history and cards explaining the maths."] },
  { v:"0.10.0", date:"2026-10-30",
    pl:["Zakładki podzielone na grupy: biometria behawioralna, testy psychomotoryczne, ciekawostki zdrowotne, wyniki i narzędzia.","Grupa „Ciekawostki zdrowotne” (Litery i błędy, Wzrok) ma inny kolor i ostrzeżenie, że wynik może być nieprawdziwy.","Plik PLAN.md z planem dalszych prac."],
    en:["Tabs split into groups: behavioral biometrics, psychomotor tests, health curiosities, results and tools.","The “Health curiosities” group (Letters & errors, Vision) has a different colour and a warning that results may be wrong.","PLAN.md file with the development plan."] },
  { v:"0.9.0", date:"2026-10-30",
    pl:["Nowa zakładka „Wzrok” z wyraźnym ostrzeżeniem, że to nie jest badanie wzroku ani widzenia barw.","Kalibracja ekranu kartą (85,6 × 54 mm) i odległością od ekranu.","Tablica Snellena w dwóch wariantach: litery (C, D, H, K, N, O, V, Z) i obracane E (odpowiedź strzałkami); wynik w zapisie 20/x, 6/x i dziesiętnym.","Tablice barwne w stylu Ishihary generowane na nowo przy każdym starcie, z tablicą pokazową."],
    en:["New “Vision” tab with a clear warning that it is not an eye or colour vision test.","Screen calibration with a card (85.6 × 54 mm) and viewing distance.","Snellen chart in two variants: letters (C, D, H, K, N, O, V, Z) and tumbling E (answer with arrows); result in 20/x, 6/x and decimal notation.","Ishihara-style colour plates generated fresh on every start, with a demonstration plate."] },
  { v:"0.8.0", date:"2026-10-30",
    pl:["Favicon (odcisk palca) i ikona dla telefonów.","Optymalizacja pod wyszukiwarki: opis strony, adres kanoniczny, dane strukturalne (schema.org), mapa strony (sitemap.xml).","Miniatura do udostępniania linku (zrzut strony) dla Facebooka, X, komunikatorów.","Poprawka eksportu: pseudosłowa i szukanie liter zapisują się pod osobnymi nazwami."],
    en:["Favicon (fingerprint) and a phone icon.","Search engine optimisation: page description, canonical URL, structured data (schema.org), sitemap (sitemap.xml).","Link preview image (page screenshot) for Facebook, X and messengers.","Export fix: pseudowords and letter search are saved under separate names."] },
  { v:"0.7.0", date:"2026-10-30",
    pl:["Nowa zakładka „Litery i błędy” z wyraźną informacją, że to nie jest test na dysleksję i niczego nie diagnozuje.","Ramka „Co mówią badania” z linkami do prac o zapisie klawiszy i dysleksji (Inputlog, Dytective).","Zadanie „Przepisywanie pseudosłów”: tempo, czas na słowo, błędy i porównanie ze zwykłym tekstem z etapu 1.","Zadanie „Szukanie liter”: zaznaczanie liter b wśród d, p i q; czas, trafienia, pominięcia i pomyłki.","Nowa karta „Rodzaje błędów” w teście pisania i w pseudosłowach: spacje, wielkość liter, litery lustrzane, polska ortografia, ogonki, przestawienia, pominięcia, podwojenia i sąsiednie klawisze."],
    en:["New “Letters & errors” tab with a clear note that it is not a dyslexia test and diagnoses nothing.","“What research says” box with links to work on keystroke logging and dyslexia (Inputlog, Dytective).","“Retyping pseudowords” task: pace, time per word, errors and comparison with the normal text from stage 1.","“Letter search” task: marking b among d, p and q; time, hits, misses and false marks.","New “Error types” card in the typing test and the pseudowords task: spaces, letter case, mirror letters, Polish spelling, diacritics, swaps, skips, doubles and neighbouring keys."] },
  { v:"0.6.0", date:"2026-10-30",
    pl:["Nowy dział „Hasło”: wpisujesz wymyślone hasło 5 razy, z rytmu powstaje profil, a w trybie testu każde wpisanie jest sprawdzane, czy zgadza się z profilem.","Wykres profilu (średnia ± odchylenie dla każdego klawisza i odstępu) z zaznaczonym ostatnim testem oraz historia testów.","Hasło jest tylko w pamięci karty i nie trafia do eksportu; eksportowane są wyłącznie czasy."],
    en:["New “Password” section: type a made-up password 5 times, its rhythm becomes a profile, and in test mode every entry is checked against the profile.","Profile chart (mean ± deviation for every key and interval) with the last test marked, plus a test history.","The password lives only in the tab's memory and is never exported; only timings are exported."] },
  { v:"0.5.0", date:"2026-10-30",
    pl:["Numer wersji przy nazwie strony.","Dział „Co nowego” z listą zmian w każdej wersji.","Dokumentacja (docs/DOKUMENTACJA.md), CHANGELOG.md i rozbudowane README.","Numer wersji zapisywany w eksportowanym profilu."],
    en:["Version number next to the page name.","“What's new” section listing the changes in every version.","Documentation (docs/DOKUMENTACJA.md), CHANGELOG.md and an expanded README.","Version number included in the exported profile."] },
  { v:"0.4.0", date:"2026-10-30",
    pl:["Czcionki IBM Plex hostowane w repozytorium zamiast Google Fonts: przy wczytaniu strona łączy się już tylko z GitHubem.","Eksport profilu do pliku JSON: ocena, statystyki z kart i surowe pomiary. W Chrome i Edge okno zapisu otwiera się domyślnie na Pulpicie."],
    en:["IBM Plex fonts hosted in the repository instead of Google Fonts: the page now only connects to GitHub when loading.","Profile export to a JSON file: evaluation, card statistics and raw measurements. In Chrome and Edge the save dialog opens on the Desktop by default."] },
  { v:"0.3.0", date:"2026-10-30",
    pl:["Trzypozycyjny przełącznik położenia tekstu do przepisania: nad polem, jako podkładka lub pod polem."],
    en:["Three-way switch for the reference text position: above the field, as an underlay or below the field."] },
  { v:"0.2.0", date:"2026-10-30",
    pl:["Przełącznik dzień/noc (domyślnie według motywu systemu)."],
    en:["Day/night switch (follows the system theme by default)."] },
  { v:"0.1.0", date:"2026-10-30",
    pl:["Pierwsza wersja: test pisania i pięć zadań z myszką (klikanie celów, śledzenie punktu, przeciąganie, rysowanie po śladzie, podwójne kliknięcie).","Przy każdej mierze opis „Jak to liczę”, ocena słowna po każdym etapie i zestawienie wyników.","Wersja polska i angielska, wybierana według języka przeglądarki.","Sekcje „Gdzie trafiają dane” i „Amatorski projekt”."],
    en:["First version: typing test and five mouse tasks (target clicking, dot tracking, dragging, tracing shapes, double click).","“How I calculate it” for every measure, a short evaluation after each stage and a results overview.","Polish and English versions, chosen from the browser language.","“Where your data goes” and “Amateur project” sections."] }
];

export { VERSION, CHANGELOG };
