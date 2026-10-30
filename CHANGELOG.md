# Co nowego · Changelog

Format: [Keep a Changelog](https://keepachangelog.com/pl/1.1.0/), numeracja: [SemVer](https://semver.org/lang/pl/).
Ta sama lista jest na stronie w dziale „Co nowego” (stała `CHANGELOG` w `app.js`).

## [0.16.0] – 2026-10-30
- Nowy test „Czas reakcji i prawo Hicka”: 4 bloki z 1, 2, 4 i 8 możliwymi klawiszami, losowa przerwa przed bodźcem, wykrywanie falstartów.
- Wykres median z dopasowaną prostą RT = a + b · log₂(n + 1), nachylenie w ms na bit i przepustowość.

## [0.15.0] – 2026-10-30
- Nowa grupa „Testy psychomotoryczne” i pierwszy test: test Stroopa (24 próby, słowa zgodne i niezgodne, odpowiedź klawiszami 1–4).
- Wynik: efekt Stroopa w milisekundach, błędy i liczba pomyłek „przeczytałem słowo zamiast koloru”.

## [0.14.0] – 2026-10-30
- Mapa cieplna klawiatury w zakładce Pisanie: kolor klawisza według średniego czasu przytrzymania albo liczby błędów, z przełącznikiem i podpowiedzią z liczbą pomiarów.

## [0.13.0] – 2026-10-30
- Nowa zakładka „Odcisk przeglądarki”: tabela 14 cech, które każda strona może odczytać bez pytania (m.in. strefa czasowa, ekran, karta graficzna, odcisk canvas, czcionki), z opisem, co każda zdradza.
- Skrót odcisku liczony lokalnie i wyjaśnienie, jak działa śledzenie bez ciasteczek.

## [0.12.0] – 2026-10-30
- Nowa zakładka „Człowiek czy bot”: 5 Twoich ruchów myszką, potem przycisk „Puść bota”, który robi to samo idealnie prosto i równo.
- Porównanie pięciu cech (prostoliniowość, zmienność prędkości, drżenie, celność kliknięcia, przytrzymanie przycisku) i werdykt według liczby oznak bota.

## [0.11.0] – 2026-10-30
- Nowa zakładka „Podpis myszką” w grupie biometrii: 3 podpisy tworzą wzorzec, a każdy kolejny jest weryfikowany pod względem kształtu (DTW), tempa i rytmu.
- Po weryfikacji widać najbliższy wzorzec nałożony na nowy podpis; historia weryfikacji i karty z wyjaśnieniem obliczeń.

## [0.10.0] – 2026-10-30
- Zakładki podzielone na grupy: biometria behawioralna, testy psychomotoryczne, ciekawostki zdrowotne, wyniki i narzędzia.
- Grupa „Ciekawostki zdrowotne” (Litery i błędy, Wzrok) ma inny kolor i ostrzeżenie, że wynik może być nieprawdziwy.
- Plik PLAN.md z planem dalszych prac.

## [0.9.0] – 2026-10-30
- Nowa zakładka „Wzrok” z wyraźnym ostrzeżeniem, że to nie jest badanie wzroku ani widzenia barw.
- Kalibracja ekranu kartą (85,6 × 54 mm) i odległością od ekranu.
- Tablica Snellena w dwóch wariantach: litery (C, D, H, K, N, O, V, Z) i obracane E (odpowiedź strzałkami); wynik w zapisie 20/x, 6/x i dziesiętnym.
- Tablice barwne w stylu Ishihary generowane na nowo przy każdym starcie, z tablicą pokazową.

## [0.8.0] – 2026-10-30
- Favicon (odcisk palca) i ikona dla telefonów.
- Optymalizacja pod wyszukiwarki: opis strony, adres kanoniczny, dane strukturalne (schema.org), mapa strony (`sitemap.xml`).
- Miniatura do udostępniania linku (zrzut strony) dla Facebooka, X, komunikatorów.
- Poprawka eksportu: pseudosłowa i szukanie liter zapisują się pod osobnymi nazwami.

## [0.7.0] – 2026-10-30
- Nowa zakładka „Litery i błędy” z wyraźną informacją, że to nie jest test na dysleksję i niczego nie diagnozuje.
- Ramka „Co mówią badania” z linkami do prac o zapisie klawiszy i dysleksji (Inputlog, Dytective).
- Zadanie „Przepisywanie pseudosłów”: tempo, czas na słowo, błędy i porównanie ze zwykłym tekstem z etapu 1.
- Zadanie „Szukanie liter”: zaznaczanie liter b wśród d, p i q; czas, trafienia, pominięcia i pomyłki.
- Nowa karta „Rodzaje błędów” w teście pisania i w pseudosłowach: spacje, wielkość liter, litery lustrzane, polska ortografia, ogonki, przestawienia, pominięcia, podwojenia i sąsiednie klawisze.

## [0.6.0] – 2026-10-30
- Nowy dział „Hasło”: wpisujesz wymyślone hasło 5 razy, z rytmu powstaje profil, a w trybie testu każde wpisanie jest sprawdzane, czy zgadza się z profilem.
- Wykres profilu (średnia ± odchylenie dla każdego klawisza i odstępu) z zaznaczonym ostatnim testem oraz historia testów.
- Hasło jest tylko w pamięci karty i nie trafia do eksportu; eksportowane są wyłącznie czasy.

## [0.5.0] – 2026-10-30
- Numer wersji przy nazwie strony.
- Dział „Co nowego” z listą zmian w każdej wersji.
- Dokumentacja (`docs/DOKUMENTACJA.md`), `CHANGELOG.md` i rozbudowane `README.md`.
- Numer wersji zapisywany w eksportowanym profilu.

## [0.4.0] – 2026-10-30
- Czcionki IBM Plex hostowane w repozytorium zamiast Google Fonts: przy wczytaniu strona łączy się już tylko z GitHubem.
- Eksport profilu do pliku JSON: ocena, statystyki z kart i surowe pomiary. W Chrome i Edge okno zapisu otwiera się domyślnie na Pulpicie.

## [0.3.0] – 2026-10-30
- Trzypozycyjny przełącznik położenia tekstu do przepisania: nad polem, jako podkładka lub pod polem.

## [0.2.0] – 2026-10-30
- Przełącznik dzień/noc (domyślnie według motywu systemu).

## [0.1.0] – 2026-10-30
- Pierwsza wersja: test pisania i pięć zadań z myszką (klikanie celów, śledzenie punktu, przeciąganie, rysowanie po śladzie, podwójne kliknięcie).
- Przy każdej mierze opis „Jak to liczę”, ocena słowna po każdym etapie i zestawienie wyników.
- Wersja polska i angielska, wybierana według języka przeglądarki.
- Sekcje „Gdzie trafiają dane” i „Amatorski projekt”.
