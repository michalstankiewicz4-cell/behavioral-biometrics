"use strict";
/*
 * Odcisk klawiatury i myszki — jawne demo biometrii behawioralnej.
 * Wszystko działa lokalnie: brak fetch/XHR/WebSocket, brak ciasteczek i localStorage.
 */
(() => {
const $ = id => document.getElementById(id);
const REPO = "https://github.com/michalstankiewicz4-cell/behavioral-biometrics";

// ---------- wersja i lista zmian (najnowsza na górze; to samo w CHANGELOG.md) ----------
const VERSION = "0.13.0";
const CHANGELOG = [
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

// ---------- język ----------
function detectLang(){
  const list = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || "en"];
  for(const l of list){ const s = String(l).toLowerCase(); if(s.startsWith("pl")) return "pl"; if(s.startsWith("en")) return "en"; }
  return "en";
}
let LANG = detectLang();
const L = o => (o && typeof o === "object" && "pl" in o) ? o[LANG] : o;

const D = {
pl:{
  title:"Odcisk klawiatury i myszki", doc_title:"Odcisk klawiatury i myszki · biometria behawioralna – demo",
  meta_desc:"Jawne demo biometrii behawioralnej: sprawdź, jak strona rozpoznaje cię po pisaniu na klawiaturze i ruchach myszki. Test pisania, zadania z myszką, rytm hasła. Wszystko liczy się lokalnie w przeglądarce.",
  tag:"BIOMETRIA BEHAWIORALNA",
  lang_btn:"English", lang_label:"Przełącz na angielski",
  lead:"Biometria behawioralna rozpoznaje ludzi po tym, <strong>jak</strong> coś robią: jak piszą, jak ruszają myszką, jak klikają. Zwykle działa ukryta w tle (np. w bankowości). Tutaj jest <strong>jawna</strong>: wykonujesz krótkie zadania, a strona pokazuje, co zmierzyła i jak to policzyła.",
  amateur_h:"Amatorski projekt",
  amateur_p:"To hobbystyczne demo, które pokazuje, jak działa biometria behawioralna. <strong>Nie jest narzędziem naukowym ani medycznym.</strong> Progi w ocenach są orientacyjne, a wyniki mocno zależą od sprzętu (klawiatura, myszka czy touchpad), zmęczenia i wprawy. <strong>Nie sugeruj się wynikiem</strong>: nie wyciągaj z niego wniosków o sobie ani o innych i nie podejmuj na jego podstawie żadnych decyzji.",
  data_h:"Gdzie trafiają dane",
  data_list:`<li><strong>Nigdzie, wszystko działa lokalnie.</strong> Pomiary (czasy klawiszy, ruchy myszki) zbiera i liczy JavaScript w Twojej przeglądarce. Są tylko w pamięci tej karty i znikają po odświeżeniu lub zamknięciu strony.</li>
<li><strong>Nic nie jest wysyłane na GitHub.</strong> Strona to statyczne pliki na GitHub Pages: GitHub tylko je dostarcza, nie ma tu serwera, który mógłby cokolwiek odebrać.</li>
<li>Kod nie zawiera <code>fetch</code>, <code>XMLHttpRequest</code>, WebSocketów, formularzy, ciasteczek, <code>localStorage</code> ani analityki. Możesz to sprawdzić w <a href="${REPO}">kodzie źródłowym</a> albo w zakładce Sieć (Network) w narzędziach deweloperskich.</li>
<li>Jak przy każdej stronie: przy wczytaniu GitHub (hosting, także czcionek) widzi standardowe dane żądania, np. adres IP i typ przeglądarki. Nie widzi niczego z tego, co wpisujesz ani jak ruszasz myszką. Innych serwerów strona nie używa.</li>
<li><strong>Eksport profilu</strong> zapisuje plik tylko na Twoim dysku. Nic nie jest przy tym wysyłane.</li>`,
  tab_type:"Pisanie", tab_click:"Klikanie celów", tab_track:"Śledzenie punktu", tab_drag:"Przeciąganie", tab_draw:"Rysowanie po śladzie", tab_dbl:"Podwójne kliknięcie", tab_res:"Wyniki",
  type_h:"Pisanie", type_desc:"Przepisz tekst. Mierzę, jak długo trzymasz klawisze, ile trwają przerwy między nimi, gdzie się mylisz i jak poprawiasz.",
  type_label:"Pisz tutaj. Wklejanie jest zablokowane, kursor zawsze stoi na końcu.",
  pos_legend:"Tekst wzorcowy:", pos_above:"nad polem", pos_under:"jako podkładka", pos_below:"pod polem",
  mobile:"Wygląda na to, że używasz ekranu dotykowego. Klawiatury ekranowe podają niedokładne czasy klawiszy, a zadania z myszką mierzą palec zamiast ręki na myszce. Najlepiej użyć komputera.",
  live_time:"czas", live_chars:"znaki", live_err:"błędy",
  finish:"Zakończ teraz", restart:"Od nowa", start:"Start",
  hint:"Doszedłeś do końca, ale w tekście zostały błędy. Popraw je albo kliknij „Zakończ teraz”.",
  click_h:"Klikanie celów", click_desc:"Kółka pojawiają się w losowych miejscach. Klikaj je jak najszybciej i najcelniej. Mierzę czas reakcji, prostoliniowość ruchu, przestrzelenia i przytrzymanie przycisku.",
  track_h:"Śledzenie punktu", track_desc:"Przez 15 sekund trzymaj kursor na poruszającej się kropce. Mierzę odległość od kropki, opóźnienie i płynność ruchu ręki.",
  drag_h:"Przeciąganie", drag_desc:"Przeciągnij kwadrat do ramki, i tak 6 razy. Mierzę stabilność ręki przy wciśniętym przycisku i precyzję upuszczenia.",
  draw_h:"Rysowanie po śladzie", draw_desc:"Obrysuj okrąg, a potem linię, trzymając wciśnięty przycisk. Mierzę odchylenie od wzoru i drżenie.",
  dbl_h:"Podwójne kliknięcie", dbl_desc:"Kliknij dwukrotnie każde z 8 kółek. Mierzę odstęp między kliknięciami, przytrzymanie i to, czy kursor przy tym drgnął.",
  next_click:"Dalej: klikanie celów →", next_track:"Dalej: śledzenie punktu →", next_drag:"Dalej: przeciąganie →", next_draw:"Dalej: rysowanie →", next_dbl:"Dalej: podwójne kliknięcie →", next_res:"Zobacz wyniki →",
  tab_pass:"Hasło", next_pass:"Dalej: hasło →",
  pass_h:"Hasło", pass_desc:"Wymyśl hasło i wpisz je 5 razy. Z rytmu tych wpisań powstaje profil. Potem w trybie testu każde wpisanie jest porównywane z profilem: to samo hasło wpisane innym rytmem (np. przez inną osobę) powinno zostać odrzucone.",
  pass_warn:"Nie wpisuj prawdziwego hasła, wymyśl coś na potrzeby testu. Hasło jest tylko w pamięci tej karty, znika po jej zamknięciu i nie trafia do eksportu.",
  pass_reset:"Nowe hasło",
  pass_chart:"Pasmo to średnia ± odchylenie z profilu, szare kropki to wpisania próbne, kolorowa kropka to ostatni test (zielona w granicach 2 odchyleń, czerwona poza nimi). Na osi są numery klawiszy, a nie znaki hasła.",
  tab_let:"Litery i błędy", next_let:"Dalej: litery i błędy →",
  let_h:"Litery i błędy",
  let_warn_h:"To nie jest test na dysleksję",
  let_warn:"Strona nie ma żadnego modelu ani danych od osób z diagnozą, więc <strong>niczego nie wykrywa, nie diagnozuje i nie ocenia ryzyka</strong>. Pokazuje tylko, jakie błędy zrobiłeś i ile czasu ci to zajęło. Wyniki zależą od klawiatury, wprawy, zmęczenia i tego, czy piszesz w swoim języku. Jeśli masz obawy dotyczące czytania lub pisania (swoje albo dziecka), porozmawiaj ze specjalistą, np. w poradni psychologiczno-pedagogicznej.",
  let_res_h:"Co mówią badania",
  let_res:`Badacze pisania nagrywają każdy klawisz (tzw. keystroke logging) i analizują pauzy oraz poprawki; tą metodą bada się m.in. osoby z dysleksją (<a href="https://www.inputlog.net/research/">Inputlog</a>, <a href="https://journals.openedition.org/lidil/13303">badanie studentów z dysleksją</a>). Gra przeglądarkowa Dytective (Rello i in., 2016) mierzyła kliknięcia, czasy i błędy w zadaniach językowych; model uczony na 243 osobach, w tym 95 z diagnozą dysleksji, osiągnął 83% trafności (<a href="https://eudl.eu/doi/10.4108/eai.16-5-2016.2263338">publikacja</a>, <a href="https://repositori.upf.edu/items/0852171e-cb93-481e-a492-a490ddba578d">nowsza praca</a>). Zadania poniżej są tylko <strong>inspirowane</strong> takimi ćwiczeniami (pseudosłowa, rozróżnianie podobnych liter), nie są ich kopią i nie były sprawdzane naukowo.`,
  ps_h:"Przepisywanie pseudosłów", ps_desc:"Przepisz słowa, które nic nie znaczą. Mierzę tempo, czas na każde słowo i rodzaje błędów, a jeśli zrobiłeś etap 1, porównuję to ze zwykłym tekstem.",
  ls_h:"Szukanie liter", ls_desc:"Po kliknięciu „Start” pojawi się siatka liter b, d, p i q. Zaznacz wszystkie „b” i kliknij „Gotowe”. Mierzę czas, trafienia, pominięcia i to, które litery wziąłeś za „b”.",
  ls_done:"Gotowe",
  tab_vis:"Wzrok", next_vis:"Dalej: wzrok →",
  vis_h:"Wzrok",
  vis_warn_h:"To nie jest badanie wzroku",
  vis_warn:"Te zadania <strong>nie zastępują badania u optometrysty ani okulisty</strong> i niczego nie diagnozują. Wynik zależy od kalibracji, odległości, oświetlenia, jasności i kolorów ekranu (tryb nocny, Night Shift, filtry), a strona nie zna Twojego ekranu. Nie używaj wyniku do decyzji o okularach, prowadzeniu samochodu ani leczeniu. Jeśli widzisz gorzej niż kiedyś, masz bóle głowy, podwójne widzenie lub nagłe zmiany widzenia, idź do lekarza. Badanie wzroku u dzieci zostaw specjalistom.",
  cal_h:"Kalibracja ekranu", cal_desc:"Przyłóż do ekranu kartę w standardowym rozmiarze (np. płatniczą, legitymację lub kartę lojalnościową, 85,6 × 54 mm) i przesuń suwak, aż prostokąt będzie dokładnie jej wielkości. Potem wpisz, z jakiej odległości będziesz patrzeć. Nie zmieniaj powiększenia strony po kalibracji.",
  cal_card:"dopasuj do karty", cal_size:"Rozmiar prostokąta", cal_dist:"Odległość od ekranu (m)",
  sn_h:"Tablica Snellena", sn_desc:"Usiądź lub stań w podanej odległości, z oczami na wysokości ekranu. Zwykle bada się każde oko osobno, więc możesz powtórzyć test, zasłaniając jedno oko (bez naciskania na nie). Wariant z literami: wpisujesz literę (C, D, H, K, N, O, V, Z). Wariant z obracanym E: odpowiadasz strzałką, w którą stronę są skierowane ramiona E. Znaki maleją, dopóki rozpoznajesz 3 z 5.",
  sn_start_a:"Start: litery", sn_start_b:"Start: obracane E",
  ish_h:"Tablice barwne (w stylu Ishihary)", ish_desc:"Strona generuje tablice z kolorowych kropek z ukrytą liczbą. Wpisz liczbę, którą widzisz, albo kliknij „Nie widzę liczby”. Ustaw pełną jasność, wyłącz tryb nocny i filtry kolorów. Kolory na ekranie nie są takie jak na drukowanych tablicach, więc to tylko ciekawostka.",
  ish_start:"Start", ish_label:"Jaką liczbę widzisz?", ish_ok:"Zatwierdź", ish_none:"Nie widzę liczby",
  grp_bio:"Biometria behawioralna", grp_psy:"Testy psychomotoryczne", grp_health:"⚠ Ciekawostki zdrowotne · wynik może być nieprawdziwy", grp_tools:"Wyniki i narzędzia",
  tab_sig:"Podpis myszką", next_podpis:"Dalej: podpis myszką →",
  sig_h:"Podpis myszką", sig_desc:"Podpisz się myszką 3 razy, trzymając wciśnięty przycisk (możesz odrywać, jak przy prawdziwym podpisie). Z tych podpisów powstaje wzorzec. Potem każdy kolejny podpis jest porównywany z wzorcem pod względem kształtu, tempa i rytmu. Podpis jest tylko w pamięci karty i nie trafia do eksportu; eksportowane są wyłącznie liczby.",
  sig_clear:"Wyczyść", sig_ok:"Zatwierdź", sig_reset:"Nowy wzorzec",
  tab_bot:"Człowiek czy bot", next_bot:"Dalej: człowiek czy bot →",
  bot_h:"Człowiek czy bot", bot_desc:"Zabezpieczenia w stylu CAPTCHA często nie pytają o nic, tylko patrzą, jak ruszasz myszką. Zrób 5 zwykłych ruchów (kliknij szare kółko, potem niebieskie), a potem puść prostego bota, który robi to samo. Strona porówna Wasze ruchy pod względem cech, po których da się odróżnić człowieka od skryptu.",
  bot_run:"Puść bota",
  tab_fp:"Odcisk przeglądarki", next_odcisk:"Dalej: odcisk przeglądarki →",
  fp_h:"Odcisk przeglądarki", fp_desc:"Każda strona może bez pytania o zgodę odczytać wiele cech Twojej przeglądarki i komputera. Razem tworzą „odcisk palca”, który pozwala rozpoznać Cię przy kolejnych wizytach, nawet bez ciasteczek i po wyczyszczeniu historii. Kliknij przycisk, żeby zobaczyć, co widzi ta strona.",
  fp_local:"Liczone tylko lokalnie, nic nie jest wysyłane.", fp_go:"Pokaż mój odcisk",
  news_h:"Co nowego", ver_label:"Wersja {v}: zobacz, co nowego",
  res_h:"Wyniki", res_empty:"Nie ukończyłeś jeszcze żadnego zadania.",
  export_btn:"Eksportuj profil (JSON)",
  export_info:"Eksport zapisuje do pliku JSON wszystkie ukończone etapy: ocenę, statystyki z kart i surowe pomiary (bez wpisanego tekstu). W Chrome i Edge okno zapisu otwiera się domyślnie na Pulpicie. Firefox i Safari nie pozwalają stronom wybrać folderu, więc tam plik trafi do folderu Pobrane.",
  export_ok:"Zapisano: {f}", export_dl:"Pobrano {f} do folderu pobierania przeglądarki.", export_cancel:"Anulowano zapis.", export_err:"Nie udało się zapisać pliku: {e}",
  res_note:"Przypomnienie: to amatorski projekt. Wyniki są orientacyjne, nie sugeruj się nimi.",
  sum_empty:"Ocena pojawi się po wykonaniu zadania. Poniżej już teraz widać, co i jak będzie mierzone.",
  sum_fine:"Progi są orientacyjne. Wynik z jednego krótkiego testu to profil, a nie diagnoza.",
  how:"Jak to liczę",
  idle:"Kliknij „Start”",
  done_canvas:"Gotowe — wyniki poniżej",
  footer_code:`Kod źródłowy: <a href="${REPO}">${REPO.replace("https://","")}</a>. Strona nie używa bibliotek, a czcionki (IBM Plex, licencja SIL OFL) są w repozytorium.`,
  author:"autor: Michał Stankiewicz · stworzone przy użyciu vibecodingu"
},
en:{
  title:"Keyboard and mouse fingerprint", doc_title:"Keyboard and mouse fingerprint · behavioral biometrics demo",
  meta_desc:"An open behavioral biometrics demo: see how a page can recognise you by your typing and mouse movements. Typing test, mouse tasks, password rhythm. Everything is computed locally in your browser.",
  tag:"BEHAVIORAL BIOMETRICS",
  lang_btn:"Polski", lang_label:"Switch to Polish",
  lead:"Behavioral biometrics recognises people by <strong>how</strong> they do things: how they type, move the mouse and click. It usually runs hidden in the background (e.g. in banking). Here it is <strong>out in the open</strong>: you do a few short tasks and the page shows what it measured and how it calculated it.",
  amateur_h:"Amateur project",
  amateur_p:"This is a hobby demo showing how behavioral biometrics works. <strong>It is not a scientific or medical tool.</strong> The thresholds in the evaluations are rough, and the results depend heavily on your hardware (keyboard, mouse or touchpad), tiredness and practice. <strong>Don't take the results seriously</strong>: don't draw conclusions about yourself or others from them and don't base any decisions on them.",
  data_h:"Where your data goes",
  data_list:`<li><strong>Nowhere, everything runs locally.</strong> The measurements (key timings, mouse movements) are collected and computed by JavaScript in your browser. They live only in this tab's memory and disappear when you refresh or close the page.</li>
<li><strong>Nothing is sent to GitHub.</strong> The page is static files on GitHub Pages: GitHub only delivers them, and there is no server here that could receive anything.</li>
<li>The code contains no <code>fetch</code>, <code>XMLHttpRequest</code>, WebSockets, forms, cookies, <code>localStorage</code> or analytics. You can check this in the <a href="${REPO}">source code</a> or in the Network tab of your browser's developer tools.</li>
<li>As with any website: when the page loads, GitHub (hosting, fonts included) sees standard request data such as your IP address and browser type. It sees nothing of what you type or how you move the mouse. The page uses no other servers.</li>
<li><strong>Profile export</strong> saves a file only to your own disk. Nothing is sent.</li>`,
  tab_type:"Typing", tab_click:"Target clicking", tab_track:"Dot tracking", tab_drag:"Dragging", tab_draw:"Tracing shapes", tab_dbl:"Double click", tab_res:"Results",
  type_h:"Typing", type_desc:"Retype the text. I measure how long you hold keys, the gaps between them, where you make mistakes and how you correct them.",
  type_label:"Type here. Pasting is blocked and the caret always stays at the end.",
  pos_legend:"Reference text:", pos_above:"above the field", pos_under:"as underlay", pos_below:"below the field",
  mobile:"It looks like you're using a touch screen. On-screen keyboards report inaccurate key timings, and the mouse tasks would measure a finger instead of a hand on a mouse. A computer works best.",
  live_time:"time", live_chars:"chars", live_err:"errors",
  finish:"Finish now", restart:"Restart", start:"Start",
  hint:"You reached the end, but there are errors left in the text. Fix them or click “Finish now”.",
  click_h:"Target clicking", click_desc:"Circles appear at random spots. Click them as fast and as accurately as you can. I measure reaction time, path straightness, overshoots and button hold time.",
  track_h:"Dot tracking", track_desc:"For 15 seconds keep the cursor on a moving dot. I measure distance from the dot, lag and how smooth your hand movement is.",
  drag_h:"Dragging", drag_desc:"Drag the square into the frame, 6 times. I measure hand steadiness while the button is held and how precisely you drop.",
  draw_h:"Tracing shapes", draw_desc:"Trace a circle and then a line while holding the button. I measure deviation from the shape and tremor.",
  dbl_h:"Double click", dbl_desc:"Double-click each of 8 circles. I measure the interval between clicks, hold time and whether the cursor moved in between.",
  next_click:"Next: target clicking →", next_track:"Next: dot tracking →", next_drag:"Next: dragging →", next_draw:"Next: tracing →", next_dbl:"Next: double click →", next_res:"See results →",
  tab_pass:"Password", next_pass:"Next: password →",
  pass_h:"Password", pass_desc:"Make up a password and type it 5 times. The rhythm of these entries becomes a profile. Then, in test mode, every entry is compared with the profile: the same password typed with a different rhythm (e.g. by another person) should be rejected.",
  pass_warn:"Don't use a real password, make one up for the test. The password lives only in this tab's memory, disappears when you close it and is never exported.",
  pass_reset:"New password",
  pass_chart:"The band is the profile mean ± deviation, grey dots are enrollment entries and the coloured dot is the last test (green within 2 deviations, red outside). The axis shows key numbers, not the password's characters.",
  tab_let:"Letters & errors", next_let:"Next: letters & errors →",
  let_h:"Letters & errors",
  let_warn_h:"This is not a dyslexia test",
  let_warn:"The page has no model and no data from diagnosed people, so it <strong>detects nothing, diagnoses nothing and estimates no risk</strong>. It only shows which errors you made and how long it took. Results depend on your keyboard, practice, tiredness and whether you type in your own language. If you have concerns about reading or writing (your own or a child's), talk to a specialist such as an educational psychologist.",
  let_res_h:"What research says",
  let_res:`Writing researchers record every key press (keystroke logging) and analyse pauses and revisions; this method is also used to study people with dyslexia (<a href="https://www.inputlog.net/research/">Inputlog</a>, <a href="https://journals.openedition.org/lidil/13303">a study of dyslexic university students</a>). The browser game Dytective (Rello et al., 2016) measured clicks, times and errors in language tasks; a model trained on 243 people, 95 of them diagnosed with dyslexia, reached 83% accuracy (<a href="https://eudl.eu/doi/10.4108/eai.16-5-2016.2263338">paper</a>, <a href="https://repositori.upf.edu/items/0852171e-cb93-481e-a492-a490ddba578d">later work</a>). The tasks below are only <strong>inspired</strong> by such exercises (pseudowords, telling similar letters apart); they are not copies and have not been scientifically validated.`,
  ps_h:"Retyping pseudowords", ps_desc:"Retype words that mean nothing. I measure your pace, time per word and error types, and if you did stage 1, I compare it with normal text.",
  ls_h:"Letter search", ls_desc:"After clicking “Start”, a grid of the letters b, d, p and q appears. Mark every “b” and click “Done”. I measure time, hits, misses and which letters you took for “b”.",
  ls_done:"Done",
  tab_vis:"Vision", next_vis:"Next: vision →",
  vis_h:"Vision",
  vis_warn_h:"This is not an eye test",
  vis_warn:"These tasks <strong>do not replace an examination by an optometrist or ophthalmologist</strong> and diagnose nothing. The result depends on calibration, distance, lighting, screen brightness and colours (night mode, Night Shift, filters), and the page doesn't know your screen. Don't use the result for decisions about glasses, driving or treatment. If you see worse than before, have headaches, double vision or sudden changes in vision, see a doctor. Leave children's eye tests to specialists.",
  cal_h:"Screen calibration", cal_desc:"Hold a standard-size card against the screen (e.g. a bank, ID or loyalty card, 85.6 × 54 mm) and move the slider until the rectangle matches it exactly. Then enter how far from the screen you will be. Don't change the page zoom after calibrating.",
  cal_card:"match to a card", cal_size:"Rectangle size", cal_dist:"Distance from screen (m)",
  sn_h:"Snellen chart", sn_desc:"Sit or stand at the given distance with your eyes level with the screen. Each eye is usually tested separately, so you can repeat the test covering one eye (without pressing on it). Letters variant: type the letter (C, D, H, K, N, O, V, Z). Tumbling E variant: answer with the arrow pointing where the E's arms point. Symbols shrink as long as you get 3 of 5 right.",
  sn_start_a:"Start: letters", sn_start_b:"Start: tumbling E",
  ish_h:"Colour plates (Ishihara style)", ish_desc:"The page generates plates of coloured dots with a hidden number. Type the number you see or click “I can't see a number”. Set full brightness and turn off night mode and colour filters. Screen colours are not like printed plates, so this is just a curiosity.",
  ish_start:"Start", ish_label:"What number do you see?", ish_ok:"Submit", ish_none:"I can't see a number",
  grp_bio:"Behavioral biometrics", grp_psy:"Psychomotor tests", grp_health:"⚠ Health curiosities · results may be wrong", grp_tools:"Results & tools",
  tab_sig:"Mouse signature", next_podpis:"Next: mouse signature →",
  sig_h:"Mouse signature", sig_desc:"Sign with the mouse 3 times while holding the button (you may lift it, as with a real signature). These signatures become a template. Every later signature is compared with it by shape, tempo and rhythm. The signature stays in the tab's memory and is never exported; only numbers are exported.",
  sig_clear:"Clear", sig_ok:"Submit", sig_reset:"New template",
  tab_bot:"Human or bot", next_bot:"Next: human or bot →",
  bot_h:"Human or bot", bot_desc:"CAPTCHA-style protection often asks nothing; it just watches how you move the mouse. Make 5 normal movements (click the grey circle, then the blue one), then release a simple bot that does the same. The page compares your movements by the features that tell a human from a script.",
  bot_run:"Release the bot",
  tab_fp:"Browser fingerprint", next_odcisk:"Next: browser fingerprint →",
  fp_h:"Browser fingerprint", fp_desc:"Any website can read many features of your browser and computer without asking. Together they form a “fingerprint” that lets a site recognise you on later visits, even without cookies and after clearing your history. Click the button to see what this page can see.",
  fp_local:"Computed locally only, nothing is sent.", fp_go:"Show my fingerprint",
  news_h:"What's new", ver_label:"Version {v}: see what's new",
  res_h:"Results", res_empty:"You haven't finished any task yet.",
  export_btn:"Export profile (JSON)",
  export_info:"Export saves all finished stages to a JSON file: the evaluation, the card statistics and the raw measurements (without the typed text). In Chrome and Edge the save dialog opens on your Desktop by default. Firefox and Safari don't let pages choose a folder, so there the file goes to Downloads.",
  export_ok:"Saved: {f}", export_dl:"Downloaded {f} to your browser's download folder.", export_cancel:"Save cancelled.", export_err:"Couldn't save the file: {e}",
  res_note:"Reminder: this is an amateur project. The results are rough, don't take them seriously.",
  sum_empty:"The evaluation appears after you finish the task. Below you can already see what will be measured and how.",
  sum_fine:"Thresholds are rough. A result from one short test is a profile, not a diagnosis.",
  how:"How I calculate it",
  idle:"Click “Start”",
  done_canvas:"Done — results below",
  footer_code:`Source code: <a href="${REPO}">${REPO.replace("https://","")}</a>. The page uses no libraries, and the fonts (IBM Plex, SIL OFL licence) are hosted in the repository.`,
  author:"author: Michał Stankiewicz · made with vibe coding"
}};

// ---------- statystyka i formatowanie ----------
const mean = a => a.length ? a.reduce((s,x)=>s+x,0)/a.length : NaN;
const median = a => { if(!a.length) return NaN; const b=[...a].sort((x,y)=>x-y), m=b.length>>1; return b.length%2?b[m]:(b[m-1]+b[m])/2; };
const sd = a => { if(a.length<2) return NaN; const m=mean(a); return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)); };
const nf = (x,d=0) => Number.isFinite(x) ? x.toLocaleString(LANG==="pl"?"pl-PL":"en-US",{minimumFractionDigits:d,maximumFractionDigits:d}) : "—";
const ms = x => Number.isFinite(x) ? nf(x)+" ms" : "—";
const px = (x,d=1) => Number.isFinite(x) ? nf(x,d)+" px" : "—";
const pct = (x,d=0) => Number.isFinite(x) ? nf(100*x,d)+" %" : "—";
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const hyp = (ax,ay,bx,by) => Math.hypot(ax-bx, ay-by);
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

// Drżenie: odchylenie punktów od średniej kroczącej (okno 2h+1 próbek), zwraca sumę kwadratów i liczbę
function tremorAcc(seg, h=3){
  let sum=0, n=0;
  for(let i=h;i<seg.length-h;i++){
    let mx=0,my=0; for(let j=i-h;j<=i+h;j++){ mx+=seg[j].x; my+=seg[j].y; }
    mx/=2*h+1; my/=2*h+1;
    sum += (seg[i].x-mx)**2 + (seg[i].y-my)**2; n++;
  }
  return {sum,n};
}
const tremorRMS = segs => { let s=0,n=0; for(const seg of segs){ const r=tremorAcc(seg); s+=r.sum; n+=r.n; } return n ? Math.sqrt(s/n) : NaN; };
// Zatrzymania: odcinki z prędkością < 20 px/s trwające ≥ 150 ms
function countPauses(seg){
  let c=0, a=null, b=null;
  for(let i=1;i<seg.length;i++){
    const dt=seg[i].t-seg[i-1].t; if(dt<=0) continue;
    const v=hyp(seg[i].x,seg[i].y,seg[i-1].x,seg[i-1].y)/(dt/1000);
    if(v<20){ if(a==null) a=seg[i-1].t; b=seg[i].t; }
    else { if(a!=null && b-a>=150) c++; a=null; }
  }
  if(a!=null && b-a>=150) c++;
  return c;
}
const pathLen = pts => { let s=0; for(let i=1;i<pts.length;i++) s+=hyp(pts[i].x,pts[i].y,pts[i-1].x,pts[i-1].y); return s; };

// ---------- karty miar ----------
const UNITS = {};
function buildCards(gridId, specs){
  $(gridId).innerHTML = specs.map(c => {
    UNITS[c.id] = c.unit;
    return `<article class="card"><h3>${L(c.title)}</h3>`
      + (c.unit ? `<div class="val" id="v-${c.id}">—<small> ${L(c.unit)}</small></div>` : "")
      + (c.rows ? `<div class="rows">${c.rows.map(([k,l])=>`<div><span>${L(l)}</span><span id="v-${c.id}-${k}">—</span></div>`).join("")}</div>` : "")
      + (c.chips||[]).map(([k,l])=>`${l?`<div class="sub">${L(l)}</div>`:""}<div class="chips" id="v-${c.id}-${k}"><span class="chip">—</span></div>`).join("")
      + `<details><summary>${D[LANG].how}</summary><p>${L(c.how)}</p></details></article>`;
  }).join("");
}
const setMain = (id,v) => { const e=$("v-"+id); if(e) e.innerHTML = `${v}<small> ${L(UNITS[id])}</small>`; };
const setRow = (id,k,v) => { const e=$(`v-${id}-${k}`); if(e) e.textContent = v; };
const setHTML = (id,k,v) => { const e=$(`v-${id}-${k}`); if(e) e.innerHTML = v; };
function setSummary(task){
  const e=$(task.sumId);
  if(!task.R){ e.classList.add("empty"); e.innerHTML = `<p>${D[LANG].sum_empty}</p>`; return; }
  e.classList.remove("empty");
  e.innerHTML = task.summary(task.R) + `<p class="fine">${D[LANG].sum_fine}</p>`;
}
const U = { ms_med:{pl:"ms (mediana)",en:"ms (median)"} };
const R_MEAN = ["mean",{pl:"średnia",en:"mean"}], R_SD = ["sd",{pl:"odchylenie std.",en:"std. deviation"}], R_N = ["n",{pl:"liczba pomiarów",en:"samples"}];

// ---------- pole zadania (canvas) ----------
class Arena{
  constructor(id){ this.c=$(id); this.ctx=this.c.getContext("2d"); this.w=0; this.h=0; }
  fit(){ const r=this.c.getBoundingClientRect(); if(!r.width) return; const d=window.devicePixelRatio||1;
    this.w=r.width; this.h=r.height; this.c.width=Math.round(r.width*d); this.c.height=Math.round(r.height*d); this.ctx.setTransform(d,0,0,d,0,0); }
  pos(e){ const r=this.c.getBoundingClientRect(); return {x:e.clientX-r.left, y:e.clientY-r.top, t:e.timeStamp}; }
  moves(e){ const l = e.getCoalescedEvents ? e.getCoalescedEvents() : []; return (l.length?l:[e]).map(x=>this.pos(x)); }
  clear(){ this.ctx.clearRect(0,0,this.w,this.h); }
  dot(x,y,r,color,fill=true,lw=1.5){ const g=this.ctx; g.beginPath(); g.arc(x,y,r,0,Math.PI*2);
    if(fill){ g.fillStyle=color; g.fill(); } else { g.strokeStyle=color; g.lineWidth=lw; g.stroke(); } }
  label(s,y){ const g=this.ctx; g.fillStyle=css("--muted"); g.font="15px "+css("--font-body"); g.textAlign="center"; g.textBaseline="middle"; g.fillText(s,this.w/2,y??this.h/2); }
  rnd(m){ return {x:m+Math.random()*(this.w-2*m), y:m+Math.random()*(this.h-2*m)}; }
}

// Wspólny szkielet zadań z myszką
function mouseTask(o){
  const A = new Arena(o.canvas);
  const t = { tab:o.tab, grid:o.grid, sumId:o.sumId, specs:o.specs, R:null, S:null, A, st:null, title:o.title,
    summary:o.summary, render:o.render };
  t.status = obj => { t.st = obj; $(o.statusId).textContent = L(obj) || ""; };
  t.idle = () => { A.fit(); A.clear(); A.label(t.R ? D[LANG].done_canvas : D[LANG].idle); };
  t.abort = () => { if(t.S && t.S.raf) cancelAnimationFrame(t.S.raf); if(t.S && t.S.phase!=="done"){ t.S=null; t.status(null); } t.idle(); };
  t.redraw = () => { if(t.S && t.S.phase!=="done" && o.draw) o.draw(t); else t.idle(); };
  t.finish = () => { t.S.phase="done"; t.R = o.analyse(t); t.render(t.R); setSummary(t); t.status({pl:"Gotowe.",en:"Done."}); t.idle(); markDone(t.tab); };
  $(o.go).addEventListener("click", () => { t.abort(); A.fit(); o.start(t); });
  const c = A.c;
  c.addEventListener("pointerdown", e => { if(t.S && t.S.phase!=="done"){ e.preventDefault(); o.down && o.down(t, A.pos(e), e); } });
  c.addEventListener("pointermove", e => { if(t.S && t.S.phase!=="done") o.move && o.move(t, A.moves(e), e); });
  c.addEventListener("pointerup", e => { if(t.S && t.S.phase!=="done") o.up && o.up(t, A.pos(e), e); });
  c.addEventListener("dblclick", e => e.preventDefault());
  c.addEventListener("contextmenu", e => e.preventDefault());
  return t;
}

// ---------- rodzaje błędów (opis, nie ocena) ----------
const ERR_CATS = [
  ["space", {pl:"spacje",en:"spaces"}],
  ["case",  {pl:"wielka / mała litera",en:"upper / lower case"}],
  ["mirror",{pl:"litery lustrzane (b/d/p/q)",en:"mirror letters (b/d/p/q)"}],
  ["orth",  {pl:"ortografia (ó/u, rz/ż, ch/h, om/ą)",en:"Polish spelling (ó/u, rz/ż, ch/h, om/ą)"}],
  ["diac",  {pl:"ogonki (ą→a, ł→l…)",en:"diacritics (ą→a, ł→l…)"}],
  ["swap",  {pl:"przestawione litery",en:"swapped letters"}],
  ["skip",  {pl:"pominięta litera",en:"skipped letter"}],
  ["double",{pl:"podwojona litera",en:"doubled letter"}],
  ["adj",   {pl:"sąsiedni klawisz",en:"neighbouring key"}],
  ["other", {pl:"inne",en:"other"}]
];
const MIRROR = new Set(["bd","db","pq","qp","bp","pb","dq","qd"]);
const ORTH = new Set(["óu","uó","żr","rż","ch","hc","oą","ąo"]);
const BASE = {"ą":"a","ć":"c","ę":"e","ł":"l","ń":"n","ó":"o","ś":"s","ź":"z","ż":"z"};
const base = c => BASE[c] || c;
const KEYPOS = (() => { const m={}; [["1234567890",0],["qwertyuiop",0.5],["asdfghjkl",0.75],["zxcvbnm",1.25]]
  .forEach(([row,off],y) => [...row].forEach((k,x) => m[k]={x:x+off,y})); return m; })();
const adjacent = (a,b) => { const p=KEYPOS[base(a)], q=KEYPOS[base(b)]; return !!(p && q && p!==q && Math.hypot(p.x-q.x,p.y-q.y)<=1.3); };
// ins: lista wstawionych znaków w kolejności {pos, ch}; T: tekst wzorcowy
function classifyErrors(ins, T){
  const counts={}; ERR_CATS.forEach(([k])=>counts[k]=0); const examples=[];
  const sh = x => x===" " ? "␣" : x;
  const add = (k,ex) => { counts[k]++; if(examples.length<10) examples.push({k, ex}); };
  let prevErrPos = -9;
  for(let i=0;i<ins.length;i++){
    const {pos,ch}=ins[i], exp=T[pos];
    if(exp===undefined || ch===exp){ prevErrPos=-9; continue; }
    if(pos===prevErrPos+1){ prevErrPos=pos; continue; }   // kaskada po przesunięciu: liczę tylko pierwszy błąd w ciągu
    prevErrPos=pos;
    const e=exp.toLowerCase(), c=ch.toLowerCase(), nx=ins[i+1];
    if(exp===" " || ch===" ") add("space", `${sh(exp)}→${sh(ch)}`);
    else if(c===e) add("case", `${exp}→${ch}`);
    else if(MIRROR.has(e+c)) add("mirror", `${exp}→${ch}`);
    else if(ORTH.has(e+c)) add("orth", `${exp}→${ch}`);
    else if(base(e)===base(c)) add("diac", `${exp}→${ch}`);
    else if(ch===T[pos+1] && nx && nx.pos===pos+1 && nx.ch===exp){ add("swap", `${exp}${T[pos+1]}→${ch}${nx.ch}`); i++; prevErrPos=-9; }
    else if(ch===T[pos+1]) add("skip", `−${exp}`);
    else if(pos>0 && ch===T[pos-1]) add("double", `${T[pos-1]}${exp}→${T[pos-1]}${ch}`);
    else if(adjacent(e,c)) add("adj", `${exp}→${ch}`);
    else add("other", `${exp}→${ch}`);
  }
  return { counts, examples, total:Object.values(counts).reduce((a,b)=>a+b,0) };
}
const errTypesSpec = id => ({ id, title:{pl:"Rodzaje błędów",en:"Error types"}, unit:{pl:"sklasyfikowanych",en:"classified"},
  rows: ERR_CATS.map(([k,l]) => [k,l]), chips:[["ex",{pl:"przykłady (oczekiwane → wpisane)",en:"examples (expected → typed)"}]],
  how:{pl:"Każdy błędnie wpisany znak porównuję ze znakiem wzorca i sprawdzam po kolei: spacja, wielkość litery, litery lustrzane b/d/p/q, polska ortografia (ó/u, rz/ż, ch/h, om/ą), brak lub nadmiar ogonka, przestawienie dwóch liter, pominięcie litery, podwojenie poprzedniej litery, sąsiedni klawisz na klawiaturze QWERTY. Z ciągu kolejnych błędów liczę tylko pierwszy, bo następne są zwykle skutkiem przesunięcia. To opis, a nie ocena.",
       en:"Each wrongly typed character is compared with the reference and checked in order: space, letter case, mirror letters b/d/p/q, Polish spelling (ó/u, rz/ż, ch/h, om/ą), missing or extra diacritic, two swapped letters, skipped letter, doubled previous letter, neighbouring key on a QWERTY keyboard. In a run of consecutive errors only the first counts, as the rest usually come from the shift. This is a description, not an assessment."} });
function renderErrTypes(id, et){
  setMain(id, et.total);
  ERR_CATS.forEach(([k]) => setRow(id, k, et.counts[k]));
  setHTML(id, "ex", et.examples.length ? et.examples.map(x=>`<span class="chip">${esc(x.ex)}</span>`).join("") : `<span class="chip">${LANG==="pl"?"brak błędów":"no errors"}</span>`);
}
const topErr = et => { let best=null; for(const [k,l] of ERR_CATS) if(et.counts[k] && (!best || et.counts[k]>et.counts[best[0]])) best=[k,l]; return best ? L(best[1]) : null; };

// Rejestry dla nowych zakładek: SHOW[hash] po pokazaniu / zmianie rozmiaru, LEAVE[hash] po opuszczeniu, LANGHOOKS po zmianie języka
const SHOW = {}, LEAVE = {}, LANGHOOKS = [];

// =====================================================================
// 1. PISANIE
// =====================================================================
const TEXT = {
  pl:"Każdy człowiek pisze na klawiaturze w nieco inny sposób. Jedni przytrzymują klawisze dłużej, inni szybciej przeskakują między literami. Ten rytm jest prawie tak charakterystyczny jak podpis, a wszystkie pomiary na tej stronie odbywają się wyłącznie w Twojej przeglądarce.",
  en:"Everyone types on a keyboard in a slightly different way. Some people hold the keys longer, others jump between letters faster. This rhythm is almost as distinctive as a signature, and every measurement on this page happens only in your browser."
};
const Typing = (() => {
  const PAUSE = 1000;
  const ta=$("input"), tgt=$("target");
  let S, TARGET;
  const self = { tab:"pisanie", grid:"cards-type", sumId:"sum-type", R:null, title:{pl:"Pisanie",en:"Typing"}, specs:[
    {id:"t-speed", title:{pl:"Prędkość",en:"Speed"}, unit:{pl:"słów/min",en:"words/min"},
     rows:[["cpm",{pl:"znaków na minutę",en:"characters per minute"}],["dur",{pl:"czas całkowity",en:"total time"}]],
     how:{pl:"Czas biegnie od pierwszego wciśnięcia klawisza do ostatniej zmiany tekstu. Słowa na minutę to przyjęta konwencja <code>(liczba znaków ÷ 5) ÷ minuty</code>, czyli „słowo” to 5 znaków razem ze spacjami.",
          en:"Time runs from the first key press to the last change of the text. Words per minute follows the usual convention <code>(characters ÷ 5) ÷ minutes</code>, so a “word” is 5 characters including spaces."}},
    {id:"t-dwell", title:{pl:"Czas przytrzymania",en:"Dwell time"}, unit:U.ms_med, rows:[R_MEAN,R_SD,R_N],
     how:{pl:"Dla każdego klawisza znakowego: <code>keyup − keydown</code>, czyli jak długo palec trzymał klawisz. Pomijam Shift, Alt, Backspace i automatyczne powtórzenia. Czasy pochodzą z <code>performance.now()</code>.",
          en:"For every character key: <code>keyup − keydown</code>, i.e. how long the finger held the key. Shift, Alt, Backspace and auto-repeat are skipped. Times come from <code>performance.now()</code>."}},
    {id:"t-flight", title:{pl:"Czas przelotu",en:"Flight time"}, unit:U.ms_med, rows:[R_MEAN,["neg",{pl:"nakładanie klawiszy",en:"key overlap"}],R_N],
     how:{pl:"Dla dwóch kolejnych klawiszy znakowych: <code>keydown(następny) − keyup(poprzedni)</code>. Wartość ujemna oznacza, że następny klawisz wcisnąłeś, zanim puściłeś poprzedni; „nakładanie” to odsetek takich par. Pomijam pary rozdzielone pauzą powyżej 1 s.",
          en:"For two consecutive character keys: <code>keydown(next) − keyup(previous)</code>. A negative value means you pressed the next key before releasing the previous one; “overlap” is the share of such pairs. Pairs separated by a pause over 1 s are skipped."}},
    {id:"t-cv", title:{pl:"Równomierność rytmu",en:"Rhythm consistency"}, unit:{pl:"CV",en:"CV"}, rows:[["mean",{pl:"średni odstęp",en:"mean interval"}],R_SD],
     how:{pl:"Biorę odstępy <code>keydown → keydown</code> między kolejnymi znakami (bez pauz powyżej 1 s) i liczę współczynnik zmienności <code>CV = odchylenie ÷ średnia</code>. Im mniejszy, tym równiej piszesz. Orientacyjnie: poniżej 0,35 rytm równy, 0,35–0,6 umiarkowany, powyżej 0,6 nierówny.",
          en:"I take the <code>keydown → keydown</code> intervals between consecutive characters (no pauses over 1 s) and compute the coefficient of variation <code>CV = std ÷ mean</code>. Lower means a steadier rhythm. Roughly: below 0.35 steady, 0.35–0.6 moderate, above 0.6 uneven."}},
    {id:"t-err", title:{pl:"Błędy",en:"Errors"}, unit:{pl:"wpisanych błędnie",en:"typed wrong"}, rows:[["rate",{pl:"odsetek błędnych znaków",en:"share of wrong characters"}],["left",{pl:"niepoprawione na końcu",en:"left uncorrected"}]],
     how:{pl:"Każdy wstawiony znak porównuję z tekstem wzorcowym na tej samej pozycji. Niezgodny znak to błąd, nawet jeśli później go poprawisz. Odsetek to <code>błędne ÷ wszystkie wpisane znaki</code>.",
          en:"Each inserted character is compared with the reference text at the same position. A mismatch counts as an error even if you fix it later. The share is <code>wrong ÷ all typed characters</code>."}},
    {id:"t-del", title:{pl:"Poprawki",en:"Corrections"}, unit:{pl:"usuniętych znaków",en:"characters deleted"},
     rows:[["imm",{pl:"natychmiastowe",en:"immediate"}],["late",{pl:"opóźnione",en:"delayed"}],["lag",{pl:"średnie opóźnienie",en:"average delay"}],["none",{pl:"usunięcia poprawnego tekstu",en:"deleting correct text"}]],
     how:{pl:"Ciąg kolejnych usunięć to jedna poprawka. W chwili jej rozpoczęcia sprawdzam, gdzie jest pierwszy błąd. Jeśli to ostatni wpisany znak, poprawka jest natychmiastowa. Jeśli po błędzie napisałeś jeszcze <i>n</i> znaków, jest opóźniona o <i>n</i>. Jeśli błędu nie było, to usunięcie poprawnego tekstu.",
          en:"A run of consecutive deletions is one correction. When it starts I look for the first error. If it is the last typed character, the correction is immediate. If you typed <i>n</i> more characters after the error, it is delayed by <i>n</i>. If there was no error, it counts as deleting correct text."}},
    {id:"t-pause", title:{pl:"Pauzy",en:"Pauses"}, unit:{pl:"pauz ≥ 1 s",en:"pauses ≥ 1 s"}, rows:[["max",{pl:"najdłuższa",en:"longest"}],["sum",{pl:"łącznie",en:"total"}]], chips:[["list",null]],
     how:{pl:"Pauza to odstęp <code>keydown → keydown</code> dłuższy niż 1 s. Przy każdej pokazuję słowo, przed którym (lub w którym) wystąpiła.",
          en:"A pause is a <code>keydown → keydown</code> gap longer than 1 s. For each one I show the word it happened before (or inside)."}},
    {id:"t-pairs", title:{pl:"Pary liter",en:"Letter pairs"}, chips:[["slow",{pl:"najwolniejsze",en:"slowest"}],["fast",{pl:"najszybsze",en:"fastest"}]],
     how:{pl:"Dla dwóch kolejnych, poprawnie wpisanych liter mierzę odstęp <code>keydown → keydown</code> i grupuję po parze (np. „sz”). Pokazuję średnią dla par, które wystąpiły co najmniej 2 razy; w nawiasie liczba wystąpień.",
          en:"For two consecutive correctly typed letters I measure the <code>keydown → keydown</code> gap and group by pair (e.g. “th”). I show the mean for pairs that occurred at least twice; the number in brackets is the count."}},
    errTypesSpec("t-types")
  ]};

  const fresh = () => ({ strokes:[], ins:[], startT:null, lastT:null, errTyped:0, typed:0, deletions:0, inDelete:false,
    corr:{imm:0, late:0, lags:[], none:0}, done:false, timer:null, prevLen:0 });
  const firstMismatch = v => { for(let i=0;i<v.length;i++) if(v[i]!==TARGET[i]) return i; return -1; };
  const isCharKey = e => e.key.length === 1;
  function wordAt(p){
    if(p>=TARGET.length) p=TARGET.length-1;
    while(p<TARGET.length-1 && TARGET[p]===" ") p++;
    let a=p, b=p;
    while(a>0 && TARGET[a-1]!==" ") a--;
    while(b<TARGET.length && TARGET[b]!==" ") b++;
    return TARGET.slice(a,b).replace(/[.,]/g,"");
  }
  function renderTarget(){
    const v = ta.value; let html = "";
    for(let i=0;i<TARGET.length;i++){
      const ch = TARGET[i]===" " ? "&nbsp;" : esc(TARGET[i]);
      let cls = "";
      if(i < v.length) cls = v[i]===TARGET[i] ? "done" : "bad";
      else if(i === v.length) cls = "cur";
      html += `<span class="${cls}">${ch}</span>` + (TARGET[i]===" " ? "<wbr>" : "");
    }
    tgt.innerHTML = html;
    // podkładka: wpisana część (niewidoczna, z zaznaczeniem błędów) + reszta wzorca
    let g = "";
    for(let i=0;i<v.length;i++) g += `<span class="typed${v[i]!==TARGET[i]?" bad":""}">${esc(v[i])}</span>`;
    if(v.length < TARGET.length) g += `<span class="cur">${esc(TARGET[v.length])}</span>` + esc(TARGET.slice(v.length+1));
    $("ghost").innerHTML = g;
  }
  // położenie tekstu wzorcowego: nad polem / jako podkładka / pod polem
  document.querySelectorAll('input[name="txtpos"]').forEach(r => r.addEventListener("change", () => {
    const v = r.value, box = $("typebox");
    box.classList.toggle("under", v==="under");
    tgt.classList.toggle("hidden", v==="under");
    if(v==="below") box.after(tgt); else $("txtpos").after(tgt);
    if(!ta.disabled){ ta.focus(); toEndSoon(); }
  }));
  const toEndSoon = () => setTimeout(() => { const n=ta.value.length; ta.setSelectionRange(n,n); }, 0);
  function renderLive(){
    const t = S.startT==null ? 0 : ((S.done?S.lastT:performance.now()) - S.startT)/1000;
    $("l-time").textContent = nf(t,1)+" s";
    $("l-chars").textContent = ta.value.length + " / " + TARGET.length;
    $("l-err").textContent = S.errTyped;
  }

  ta.addEventListener("keydown", e => {
    if(S.done) return;
    const nav = ["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End","PageUp","PageDown","Enter"];
    if(nav.includes(e.key)){ e.preventDefault(); return; }
    if(e.repeat) return;
    const t = performance.now();
    if(S.startT==null && (isCharKey(e) || e.key==="Backspace")){
      S.startT = t; $("finish").disabled = false; S.timer = setInterval(renderLive, 100);
    }
    const pos = ta.value.length;
    S.strokes.push({ code:e.code, key:e.key, down:t, up:null, pos, isChar:isCharKey(e), isBack:e.key==="Backspace",
      correct: isCharKey(e) && e.key===TARGET[pos] });
  });
  ta.addEventListener("keyup", e => {
    const t = performance.now();
    for(let i=S.strokes.length-1;i>=0;i--){ const s=S.strokes[i]; if(s.code===e.code && s.up==null){ s.up=t; break; } }
  });
  ta.addEventListener("beforeinput", e => {
    if(S.done){ e.preventDefault(); return; }
    if(["insertFromPaste","insertFromDrop","insertLineBreak","insertParagraph"].includes(e.inputType)){ e.preventDefault(); return; }
    if(e.inputType.startsWith("delete")){
      if(!S.inDelete){
        S.inDelete = true;
        const v = ta.value, fm = firstMismatch(v);
        if(fm === -1) S.corr.none++;
        else { const lag = v.length-1-fm; if(lag===0) S.corr.imm++; else { S.corr.late++; S.corr.lags.push(lag); } }
      }
    } else if(e.inputType.startsWith("insert")) S.inDelete = false;
  });
  ta.addEventListener("input", e => {
    S.lastT = performance.now();
    const v = ta.value;
    if(e.inputType && e.inputType.startsWith("insert") && e.data){
      const start = v.length - e.data.length;
      for(let i=0;i<e.data.length;i++){ S.typed++; S.ins.push({pos:start+i, ch:e.data[i]}); if(e.data[i] !== TARGET[start+i]) S.errTyped++; }
    } else if(e.inputType && e.inputType.startsWith("delete")){
      S.deletions += Math.max(0, S.prevLen - v.length);
    }
    S.prevLen = v.length;
    renderTarget(); renderLive();
    if(v === TARGET) finish();
    else $("hint").classList.toggle("hidden", v.length < TARGET.length);
  });
  const toEnd = () => { const n=ta.value.length; ta.setSelectionRange(n,n); };
  ["click","focus","select","mouseup"].forEach(ev => ta.addEventListener(ev, toEnd));
  ta.addEventListener("paste", e => e.preventDefault());
  ta.addEventListener("drop", e => e.preventDefault());
  $("finish").addEventListener("click", () => { if(S.startT!=null) finish(); });
  $("reset").addEventListener("click", reset);

  function finish(){
    if(S.done) return;
    S.done = true; clearInterval(S.timer);
    if(S.lastT==null) S.lastT = performance.now();
    ta.disabled = true; $("finish").disabled = true; $("hint").classList.add("hidden");
    renderLive();
    self.R = analyse(); self.render(self.R); setSummary(self); markDone("pisanie");
  }
  function analyse(){
    const v = ta.value, dur = (S.lastT - S.startT)/1000;
    const chars = S.strokes.filter(s=>s.isChar);
    const dwell = chars.filter(s=>s.up!=null).map(s=>s.up-s.down);
    const seq = S.strokes.filter(s=>s.isChar||s.isBack);
    const flight=[], dd=[], pauses=[], pairs={};
    for(let i=1;i<seq.length;i++){
      const a=seq[i-1], b=seq[i], gap=b.down-a.down;
      if(gap >= PAUSE) pauses.push({ms:gap, word:wordAt(b.pos)});
      if(!(a.isChar && b.isChar) || gap >= PAUSE) continue;
      dd.push(gap);
      if(a.up!=null) flight.push(b.down - a.up);
      if(a.correct && b.correct && b.pos===a.pos+1){
        const p = TARGET.substr(a.pos,2).toLowerCase();
        if(/^\p{L}{2}$/u.test(p)) (pairs[p] ||= []).push(gap);
      }
    }
    const ranked = Object.entries(pairs).filter(([,a])=>a.length>=2).map(([p,a])=>({p,m:mean(a),n:a.length})).sort((x,y)=>y.m-x.m);
    return { wpm:(v.length/5)/(dur/60), cpm:v.length/(dur/60), dur, dwell, flight, dd, pauses, ranked,
      errTyped:S.errTyped, errRate:S.typed?S.errTyped/S.typed:NaN, errTypes:classifyErrors(S.ins, TARGET),
      left:[...v].filter((c,i)=>c!==TARGET[i]).length, missing:Math.max(0,TARGET.length-v.length),
      deletions:S.deletions, corr:{...S.corr} };
  }
  self.render = R => {
    setMain("t-speed", nf(R.wpm)); setRow("t-speed","cpm",nf(R.cpm)); setRow("t-speed","dur",nf(R.dur,1)+" s");
    setMain("t-dwell", nf(median(R.dwell))); setRow("t-dwell","mean",ms(mean(R.dwell))); setRow("t-dwell","sd",ms(sd(R.dwell))); setRow("t-dwell","n",R.dwell.length);
    setMain("t-flight", nf(median(R.flight))); setRow("t-flight","mean",ms(mean(R.flight)));
    setRow("t-flight","neg", R.flight.length ? pct(R.flight.filter(x=>x<0).length/R.flight.length) : "—"); setRow("t-flight","n",R.flight.length);
    setMain("t-cv", nf(sd(R.dd)/mean(R.dd),2)); setRow("t-cv","mean",ms(mean(R.dd))); setRow("t-cv","sd",ms(sd(R.dd)));
    setMain("t-err", R.errTyped); setRow("t-err","rate",pct(R.errRate,1));
    setRow("t-err","left", R.left + (R.missing ? (LANG==="pl"?` (+${R.missing} niedopisanych)`:` (+${R.missing} not typed)`) : ""));
    setMain("t-del", R.deletions); setRow("t-del","imm",R.corr.imm); setRow("t-del","late",R.corr.late);
    setRow("t-del","lag", R.corr.lags.length ? nf(mean(R.corr.lags),1)+(LANG==="pl"?" znaku":" chars") : "—"); setRow("t-del","none",R.corr.none);
    setMain("t-pause", R.pauses.length);
    setRow("t-pause","max", R.pauses.length ? nf(Math.max(...R.pauses.map(p=>p.ms))/1000,1)+" s" : "—");
    setRow("t-pause","sum", R.pauses.length ? nf(R.pauses.reduce((s,p)=>s+p.ms,0)/1000,1)+" s" : "—");
    setHTML("t-pause","list", R.pauses.map(p=>`<span class="chip">${nf(p.ms/1000,1)} s · ${esc(p.word)}</span>`).join(""));
    const chip = (r,c) => `<span class="chip ${c}">${esc(r.p)} ${nf(r.m)} ms (${r.n})</span>`;
    const none = `<span class="chip">${LANG==="pl"?"za mało danych":"not enough data"}</span>`;
    setHTML("t-pairs","slow", R.ranked.length ? R.ranked.slice(0,5).map(r=>chip(r,"slow")).join("") : none);
    setHTML("t-pairs","fast", R.ranked.length ? R.ranked.slice(-5).reverse().map(r=>chip(r,"fast")).join("") : none);
    renderErrTypes("t-types", R.errTypes);
  };
  self.summary = R => {
    const cv = sd(R.dd)/mean(R.dd), w = R.wpm;
    const overlap = R.flight.length ? R.flight.filter(x=>x<0).length/R.flight.length : 0;
    const tot = R.corr.imm + R.corr.late;
    if(LANG==="pl"){
      const speed = w<25?"powoli":w<40?"w umiarkowanym tempie":w<60?"szybko":"bardzo szybko";
      const rhythm = !Number.isFinite(cv)?"":cv<0.35?"Rytm masz równy, odstępy między klawiszami są podobne.":cv<0.6?"Rytm masz umiarkowanie zmienny: niektóre fragmenty idą płynnie, inne wolniej.":"Rytm masz nierówny: tempo wyraźnie skacze między fragmentami.";
      const corr = tot===0 ? (R.errTyped?"Błędów nie poprawiałeś.":"Nie musiałeś niczego poprawiać.") : R.corr.imm>=R.corr.late ? "Błędy poprawiasz zwykle od razu, zaraz po ich zrobieniu." : "Błędy wychwytujesz zwykle z opóźnieniem, po napisaniu kolejnych znaków.";
      const roll = overlap>0.25 ? " Często wciskasz kolejny klawisz, zanim puścisz poprzedni, co jest typowe dla wprawnych osób." : "";
      return `<p>Piszesz <strong>${speed}</strong> (${nf(w)} słów/min; przeciętny wynik dorosłej osoby to ok. 35–45). ${rhythm}</p><p>${corr} Błędnie wpisałeś ${pct(R.errRate||0,1)} znaków.${roll}</p>`;
    }
    const speed = w<25?"slowly":w<40?"at a moderate pace":w<60?"fast":"very fast";
    const rhythm = !Number.isFinite(cv)?"":cv<0.35?"Your rhythm is steady: the gaps between keys are similar.":cv<0.6?"Your rhythm is moderately variable: some parts flow, others are slower.":"Your rhythm is uneven: the pace clearly jumps between parts.";
    const corr = tot===0 ? (R.errTyped?"You didn't correct your errors.":"You didn't need to correct anything.") : R.corr.imm>=R.corr.late ? "You usually fix errors immediately, right after making them." : "You usually catch errors late, after typing more characters.";
    const roll = overlap>0.25 ? " You often press the next key before releasing the previous one, which is typical of practised typists." : "";
    return `<p>You type <strong>${speed}</strong> (${nf(w)} words/min; a typical adult scores about 35–45). ${rhythm}</p><p>${corr} You typed ${pct(R.errRate||0,1)} of characters wrong.${roll}</p>`;
  };
  function reset(){
    if(S && S.timer) clearInterval(S.timer);
    S = fresh(); TARGET = TEXT[LANG];
    ta.maxLength = TARGET.length; ta.value = ""; ta.disabled = false;
    $("finish").disabled = true; $("hint").classList.add("hidden");
    renderTarget(); renderLive();
  }
  self.reset = reset;
  self.onLang = () => { if(!S.done) reset(); else renderLive(); };
  return self;
})();

// =====================================================================
// 2. KLIKANIE CELÓW
// =====================================================================
const Click = (() => { const N=12, RAD=20;
  const newTarget = (t, from) => { const A=t.A; let p, k=0;
    do{ p=A.rnd(RAD+12); k++; } while(hyp(p.x,p.y,from.x,from.y)<160 && k<200);
    t.S.cur = { tx:p.x, ty:p.y, from:{x:from.x,y:from.y}, t0:performance.now(), path:[], onset:null, down:null, up:null };
    t.status({pl:`Cel ${t.S.trials.length+1} z ${N}`, en:`Target ${t.S.trials.length+1} of ${N}`}); draw(t); };
  const draw = t => { const A=t.A, S=t.S; A.clear();
    if(S.phase==="ready") A.dot(A.w/2, A.h/2, RAD, css("--muted"));
    else if(S.cur) A.dot(S.cur.tx, S.cur.ty, RAD, css("--accent")); };
  return mouseTask({ tab:"klikanie", grid:"cards-click", sumId:"sum-click", canvas:"cv-click", statusId:"st-click", go:"go-click",
    title:{pl:"Klikanie celów",en:"Target clicking"},
    specs:[
      {id:"k-rt", title:{pl:"Czas reakcji",en:"Reaction time"}, unit:U.ms_med, rows:[R_MEAN,R_SD],
       how:{pl:"Od pojawienia się celu do pierwszego ruchu kursora o więcej niż 4 px. W tym czasie oko zauważa cel, a mózg wysyła polecenie do ręki.",
            en:"From the moment the target appears to the first cursor movement of more than 4 px. In that time your eye spots the target and your brain sends the command to your hand."}},
      {id:"k-mt", title:{pl:"Czas ruchu",en:"Movement time"}, unit:U.ms_med, rows:[R_MEAN,["spd",{pl:"średnia prędkość",en:"average speed"}]],
       how:{pl:"Od pierwszego ruchu do wciśnięcia przycisku na celu. Średnia prędkość to <code>odległość do celu ÷ czas ruchu</code>.",
            en:"From the first movement to pressing the button on the target. Average speed is <code>distance to target ÷ movement time</code>."}},
      {id:"k-str", title:{pl:"Prostoliniowość",en:"Straightness"}, unit:{pl:"% (mediana)",en:"% (median)"}, rows:[["min",{pl:"najbardziej kręty ruch",en:"most curved movement"}]],
       how:{pl:"<code>odległość w linii prostej ÷ długość faktycznej drogi kursora</code>. 100 % to idealnie prosta linia; im więcej łuków i zakrętów, tym mniej.",
            en:"<code>straight-line distance ÷ length of the actual cursor path</code>. 100 % is a perfectly straight line; the more arcs and turns, the lower."}},
      {id:"k-ovr", title:{pl:"Przestrzelenie",en:"Overshoot"}, unit:{pl:`celów z ${N}`,en:`of ${N} targets`}, rows:[["mean",{pl:"średnio o",en:"on average by"}]],
       how:{pl:"Rzutuję drogę kursora na kierunek start → cel. Jeśli przed kliknięciem kursor wyszedł dalej niż daleka krawędź celu, liczy się to jako przestrzelenie.",
            en:"I project the cursor path onto the start → target direction. If the cursor went beyond the far edge of the target before the click, it counts as an overshoot."}},
      {id:"k-hold", title:{pl:"Przytrzymanie przycisku",en:"Button hold"}, unit:U.ms_med, rows:[R_SD],
       how:{pl:"<code>pointerup − pointerdown</code> przy trafionym kliknięciu, czyli jak długo trzymasz wciśnięty przycisk.",
            en:"<code>pointerup − pointerdown</code> for a hit, i.e. how long you keep the button pressed."}},
      {id:"k-miss", title:{pl:"Pudła",en:"Misses"}, unit:{pl:"kliknięć obok",en:"clicks outside"}, rows:[["rate",{pl:"na cel",en:"per target"}]],
       how:{pl:"Kliknięcia poza kółkiem. Cel nie znika, dopóki go nie trafisz.", en:"Clicks outside the circle. The target stays until you hit it."}}
    ],
    start(t){ t.S={phase:"ready", trials:[], misses:0, cur:null}; t.status({pl:"Kliknij szare kółko na środku, żeby zacząć.",en:"Click the grey circle in the middle to begin."}); draw(t); },
    draw,
    move(t, pts){ const c=t.S.cur; if(!c || c.down) return;
      for(const p of pts){ c.path.push(p); if(c.onset==null && hyp(p.x,p.y,c.from.x,c.from.y)>4) c.onset=p.t; } },
    down(t, p){ const S=t.S, A=t.A;
      if(S.phase==="ready"){ if(hyp(p.x,p.y,A.w/2,A.h/2)<=RAD+4){ S.phase="run"; newTarget(t,p); } return; }
      const c=S.cur; if(!c || c.down) return;
      if(hyp(p.x,p.y,c.tx,c.ty)<=RAD) c.down=p; else S.misses++; },
    up(t, p){ const S=t.S, c=S.cur; if(!c || !c.down || c.up!=null) return;
      c.up=p.t; S.trials.push(c);
      if(S.trials.length>=N) t.finish(); else newTarget(t, c.down); },
    analyse(t){ const S=t.S; const rt=[],mt=[],str=[],ovr=[],hold=[],spd=[];
      for(const c of S.trials){
        hold.push(c.up-c.down.t);
        if(c.onset==null) continue;
        rt.push(c.onset-c.t0);
        const m=c.down.t-c.onset; mt.push(m);
        const D=hyp(c.tx,c.ty,c.from.x,c.from.y); if(m>0) spd.push(D/(m/1000));
        const pts=[c.from, ...c.path.filter(p=>p.t<=c.down.t), c.down];
        const Lp=pathLen(pts), st=hyp(c.down.x,c.down.y,c.from.x,c.from.y);
        str.push(Lp>0?Math.min(1,st/Lp):1);
        const ux=(c.tx-c.from.x)/D, uy=(c.ty-c.from.y)/D; let mx=-Infinity;
        for(const p of pts) mx=Math.max(mx,(p.x-c.from.x)*ux+(p.y-c.from.y)*uy);
        if(mx-(D+RAD)>0) ovr.push(mx-(D+RAD));
      }
      return {rt,mt,str,ovr,hold,spd,misses:S.misses,n:S.trials.length}; },
    render(R){
      setMain("k-rt",nf(median(R.rt))); setRow("k-rt","mean",ms(mean(R.rt))); setRow("k-rt","sd",ms(sd(R.rt)));
      setMain("k-mt",nf(median(R.mt))); setRow("k-mt","mean",ms(mean(R.mt))); setRow("k-mt","spd",Number.isFinite(mean(R.spd))?nf(mean(R.spd))+" px/s":"—");
      setMain("k-str",nf(100*median(R.str))); setRow("k-str","min",pct(Math.min(...R.str)));
      setMain("k-ovr",R.ovr.length); setRow("k-ovr","mean",px(mean(R.ovr)));
      setMain("k-hold",nf(median(R.hold))); setRow("k-hold","sd",ms(sd(R.hold)));
      setMain("k-miss",R.misses); setRow("k-miss","rate",nf(R.misses/R.n,2)); },
    summary(R){ return LANG==="pl"
      ? `<p>Czas reakcji (mediana) wynosi <strong>${ms(median(R.rt))}</strong>, a dojście do celu zajmuje ci ${ms(median(R.mt))}. Kursor prowadzisz w ${pct(median(R.str))} prosto (100 % to linia prosta).</p><p>Przestrzeliłeś ${R.ovr.length} z ${R.n} celów i kliknąłeś obok ${R.misses} razy. Przycisk przytrzymujesz zwykle przez ${ms(median(R.hold))}.</p>`
      : `<p>Your median reaction time is <strong>${ms(median(R.rt))}</strong>, and reaching the target takes ${ms(median(R.mt))}. Your cursor path is ${pct(median(R.str))} straight (100 % is a straight line).</p><p>You overshot ${R.ovr.length} of ${R.n} targets and clicked outside ${R.misses} times. You usually hold the button for ${ms(median(R.hold))}.</p>`; }
  });
})();

// =====================================================================
// 3. ŚLEDZENIE PUNKTU
// =====================================================================
const Track = (() => { const DUR=15, RAD=10, ZONE=25;
  const f = (S, s) => ({
    x: S.w/2 + S.w*0.36*(0.65*Math.sin(2*Math.PI*0.11*s) + 0.35*Math.sin(2*Math.PI*0.29*s+1.3)),
    y: S.h/2 + S.h*0.36*(0.60*Math.sin(2*Math.PI*0.14*s+0.5) + 0.40*Math.sin(2*Math.PI*0.37*s+2.1)) });
  const draw = (t, s=0) => { const A=t.A, S=t.S, p=f(S,s); A.clear();
    A.dot(p.x,p.y,ZONE,css("--line"),false,1);
    A.dot(p.x,p.y,RAD,S.phase==="ready"?css("--muted"):css("--accent")); };
  function loop(t){ const S=t.S; if(!S || S.phase!=="run") return;
    const now=performance.now(), s=(now-S.t0)/1000;
    if(s>=DUR){ t.finish(); return; }
    const p=f(S,s); S.samples.push({t:now, s, tx:p.x, ty:p.y, cx:S.cur.x, cy:S.cur.y});
    draw(t,s); $("st-track").textContent = (LANG==="pl"?"Pozostało ":"Remaining ")+nf(DUR-s,1)+" s";
    S.raf = requestAnimationFrame(()=>loop(t)); }
  return mouseTask({ tab:"sledzenie", grid:"cards-track", sumId:"sum-track", canvas:"cv-track", statusId:"st-track", go:"go-track",
    title:{pl:"Śledzenie punktu",en:"Dot tracking"},
    specs:[
      {id:"s-dist", title:{pl:"Odległość od kropki",en:"Distance from the dot"}, unit:{pl:"px (średnio)",en:"px (mean)"}, rows:[["med",{pl:"mediana",en:"median"}]],
       how:{pl:"W każdej klatce animacji (ok. 60 razy na sekundę) liczę odległość kursora od środka kropki i uśredniam.",
            en:"In every animation frame (about 60 times per second) I measure the distance from the cursor to the dot's centre and average it."}},
      {id:"s-zone", title:{pl:"Czas w strefie",en:"Time in zone"}, unit:{pl:"% czasu",en:"% of time"},
       how:{pl:`Odsetek klatek, w których kursor był nie dalej niż ${ZONE} px od środka kropki (cienki okrąg wokół niej).`,
            en:`Share of frames in which the cursor was within ${ZONE} px of the dot's centre (the thin ring around it).`}},
      {id:"s-lag", title:{pl:"Opóźnienie",en:"Lag"}, unit:{pl:"ms",en:"ms"}, rows:[["d",{pl:"odległość po korekcie",en:"distance after correction"}]],
       how:{pl:"Sprawdzam przesunięcia czasowe od 0 do 800 ms co 10 ms: dla każdego porównuję kursor z miejscem, w którym kropka była tyle wcześniej. Opóźnienie to przesunięcie, przy którym średnia odległość jest najmniejsza.",
            en:"I try time shifts from 0 to 800 ms in 10 ms steps: for each I compare the cursor with where the dot was that much earlier. The lag is the shift with the smallest mean distance."}},
      {id:"s-jerk", title:{pl:"Płynność",en:"Smoothness"}, unit:{pl:"zrywów/s",en:"jerks/s"}, rows:[["n",{pl:"zrywów łącznie",en:"jerks in total"}]],
       how:{pl:"Liczę prędkość kursora w każdej klatce, wygładzam ją średnią z 7 klatek i liczę lokalne szczyty powyżej 40 px/s. Każdy szczyt to osobny „zryw” ręki. Mniej zrywów na sekundę oznacza płynniejszy ruch.",
            en:"I compute cursor speed in every frame, smooth it with a 7-frame average and count local peaks above 40 px/s. Each peak is a separate hand “jerk”. Fewer jerks per second means smoother movement."}}
    ],
    start(t){ const A=t.A; t.S={phase:"ready", w:A.w, h:A.h, samples:[], cur:null, raf:0};
      t.status({pl:"Kliknij kropkę, a potem trzymaj na niej kursor przez 15 s.",en:"Click the dot, then keep the cursor on it for 15 s."}); draw(t,0); },
    draw:(t)=>draw(t, t.S.phase==="run" ? (performance.now()-t.S.t0)/1000 : 0),
    move(t, pts){ t.S.cur = pts[pts.length-1]; },
    down(t, p){ const S=t.S; if(S.phase!=="ready") return; const q=f(S,0);
      if(hyp(p.x,p.y,q.x,q.y)<=RAD+8){ S.phase="run"; S.cur=p; S.t0=performance.now(); loop(t); } },
    analyse(t){ const S=t.S, sm=S.samples;
      const d = sm.map(s=>hyp(s.cx,s.cy,s.tx,s.ty));
      let lag=0, lagD=Infinity;
      for(let tau=0; tau<=800; tau+=10){ let s=0,c=0;
        for(const x of sm){ const ss=x.s-tau/1000; if(ss<0) continue; const q=f(S,ss); s+=hyp(x.cx,x.cy,q.x,q.y); c++; }
        if(c && s/c<lagD){ lagD=s/c; lag=tau; } }
      const v=[]; for(let i=1;i<sm.length;i++){ const dt=(sm[i].t-sm[i-1].t)/1000; v.push(dt>0?hyp(sm[i].cx,sm[i].cy,sm[i-1].cx,sm[i-1].cy)/dt:0); }
      const vs=v.map((_,i)=>{ let s=0,c=0; for(let j=Math.max(0,i-3);j<=Math.min(v.length-1,i+3);j++){ s+=v[j]; c++; } return s/c; });
      let peaks=0; for(let i=1;i<vs.length-1;i++) if(vs[i]>vs[i-1] && vs[i]>=vs[i+1] && vs[i]>40) peaks++;
      return { mean:mean(d), med:median(d), zone:d.filter(x=>x<=ZONE).length/d.length, lag, lagD, peaks, pps:peaks/DUR }; },
    render(R){ setMain("s-dist",nf(R.mean,1)); setRow("s-dist","med",px(R.med));
      setMain("s-zone",nf(100*R.zone)); setMain("s-lag",nf(R.lag)); setRow("s-lag","d",px(R.lagD));
      setMain("s-jerk",nf(R.pps,1)); setRow("s-jerk","n",R.peaks); },
    summary(R){ return LANG==="pl"
      ? `<p>Kursor był średnio <strong>${px(R.mean)}</strong> od kropki, a w strefie ${ZONE} px trzymałeś go przez ${pct(R.zone)} czasu.</p><p>Twój ruch spóźniał się za kropką o ok. ${ms(R.lag)}, a ręka robiła ${nf(R.pps,1)} zrywów na sekundę.</p>`
      : `<p>On average the cursor was <strong>${px(R.mean)}</strong> from the dot, and you kept it within the ${ZONE} px zone ${pct(R.zone)} of the time.</p><p>Your movement lagged behind the dot by about ${ms(R.lag)}, and your hand made ${nf(R.pps,1)} jerks per second.</p>`; }
  });
})();

// =====================================================================
// 4. PRZECIĄGANIE
// =====================================================================
const Drag = (() => { const N=6, SQ=40, FR=64, TOL=(FR-SQ)/2+6;
  const newTrial = t => { const A=t.A; const sq=A.rnd(SQ); let fr, k=0;
    do{ fr=A.rnd(FR); k++; } while(hyp(sq.x,sq.y,fr.x,fr.y)<220 && k<200);
    t.S.cur={sq, fr, grabs:0, first:null, segs:[], drag:false, off:null};
    t.status({pl:`Przeciągnięcie ${t.S.trials.length+1} z ${N}`, en:`Drag ${t.S.trials.length+1} of ${N}`}); draw(t); };
  const draw = t => { const A=t.A, c=t.S.cur, g=A.ctx; A.clear(); if(!c) return;
    g.setLineDash([6,4]); g.strokeStyle=css("--muted"); g.lineWidth=2; g.strokeRect(c.fr.x-FR/2, c.fr.y-FR/2, FR, FR); g.setLineDash([]);
    g.fillStyle=css("--accent"); g.globalAlpha=c.drag?0.85:1; g.fillRect(c.sq.x-SQ/2, c.sq.y-SQ/2, SQ, SQ); g.globalAlpha=1; };
  return mouseTask({ tab:"przeciaganie", grid:"cards-drag", sumId:"sum-drag", canvas:"cv-drag", statusId:"st-drag", go:"go-drag",
    title:{pl:"Przeciąganie",en:"Dragging"},
    specs:[
      {id:"d-time", title:{pl:"Czas przeciągnięcia",en:"Drag time"}, unit:U.ms_med, rows:[R_MEAN],
       how:{pl:"Od pierwszego chwycenia kwadratu do udanego upuszczenia w ramce.", en:"From first grabbing the square to a successful drop in the frame."}},
      {id:"d-err", title:{pl:"Precyzja upuszczenia",en:"Drop precision"}, unit:{pl:"px (średnio)",en:"px (mean)"}, rows:[["max",{pl:"najgorsze",en:"worst"}]],
       how:{pl:"Odległość środka upuszczonego kwadratu od środka ramki. Upuszczenie jest udane, gdy kwadrat mieści się w ramce (z małym zapasem).",
            en:"Distance from the dropped square's centre to the frame's centre. A drop succeeds when the square fits in the frame (with a small margin)."}},
      {id:"d-trem", title:{pl:"Drżenie",en:"Tremor"}, unit:{pl:"px (RMS)",en:"px (RMS)"},
       how:{pl:"Dla każdego punktu drogi przy wciśniętym przycisku liczę, jak daleko odstaje od średniej z 7 sąsiednich punktów, i biorę średnią kwadratową. To mierzy drobne, szybkie drgania, a nie sam kształt ruchu.",
            en:"For every path point while the button is held I measure how far it sits from the average of the 7 neighbouring points, then take the root mean square. This captures small, fast wobble rather than the overall shape."}},
      {id:"d-pause", title:{pl:"Zatrzymania",en:"Stops"}, unit:{pl:"zatrzymań",en:"stops"}, rows:[["per",{pl:"na przeciągnięcie",en:"per drag"}]],
       how:{pl:"Momenty w trakcie przeciągania, gdy kursor zwalnia poniżej 20 px/s na co najmniej 150 ms, np. żeby się poprawić.",
            en:"Moments during a drag when the cursor slows below 20 px/s for at least 150 ms, e.g. to adjust."}},
      {id:"d-regrab", title:{pl:"Ponowne chwyty",en:"Re-grabs"}, unit:{pl:"razy",en:"times"},
       how:{pl:"Ile razy upuściłeś kwadrat poza ramką i musiałeś złapać go jeszcze raz.", en:"How many times you dropped the square outside the frame and had to grab it again."}}
    ],
    start(t){ t.S={phase:"run", trials:[], cur:null}; newTrial(t); },
    draw,
    down(t, p, e){ const c=t.S.cur; if(!c) return;
      if(Math.abs(p.x-c.sq.x)<=SQ/2 && Math.abs(p.y-c.sq.y)<=SQ/2){
        c.drag=true; c.grabs++; if(c.first==null) c.first=p.t; c.off={x:c.sq.x-p.x, y:c.sq.y-p.y}; c.segs.push([p]);
        try{ t.A.c.setPointerCapture(e.pointerId); }catch(_){} draw(t); } },
    move(t, pts){ const c=t.S.cur, A=t.A; if(!c || !c.drag) return; const seg=c.segs[c.segs.length-1];
      for(const p of pts){ seg.push(p); c.sq={ x:Math.max(SQ/2,Math.min(A.w-SQ/2,p.x+c.off.x)), y:Math.max(SQ/2,Math.min(A.h-SQ/2,p.y+c.off.y)) }; }
      draw(t); },
    up(t, p){ const S=t.S, c=S.cur; if(!c || !c.drag) return; c.drag=false;
      const dx=c.sq.x-c.fr.x, dy=c.sq.y-c.fr.y;
      if(Math.abs(dx)<=TOL && Math.abs(dy)<=TOL){
        S.trials.push({ time:p.t-c.first, err:Math.hypot(dx,dy), segs:c.segs, grabs:c.grabs, pauses:c.segs.reduce((s,g)=>s+countPauses(g),0) });
        if(S.trials.length>=N) t.finish(); else newTrial(t);
      } else { t.status({pl:"Poza ramką, złap kwadrat jeszcze raz.",en:"Outside the frame, grab the square again."}); draw(t); } },
    analyse(t){ const T=t.S.trials;
      return { time:T.map(x=>x.time), err:T.map(x=>x.err), trem:tremorRMS(T.flatMap(x=>x.segs)),
        pauses:T.reduce((s,x)=>s+x.pauses,0), regrab:T.reduce((s,x)=>s+x.grabs-1,0), n:T.length }; },
    render(R){ setMain("d-time",nf(median(R.time))); setRow("d-time","mean",ms(mean(R.time)));
      setMain("d-err",nf(mean(R.err),1)); setRow("d-err","max",px(Math.max(...R.err)));
      setMain("d-trem",nf(R.trem,2)); setMain("d-pause",R.pauses); setRow("d-pause","per",nf(R.pauses/R.n,1));
      setMain("d-regrab",R.regrab); },
    summary(R){ return LANG==="pl"
      ? `<p>Przeciągnięcie trwa u ciebie zwykle <strong>${ms(median(R.time))}</strong>, a kwadrat upuszczasz średnio ${px(mean(R.err))} od środka ramki.</p><p>Drżenie przy wciśniętym przycisku: ${px(R.trem,2)}. Zatrzymania w trakcie: ${R.pauses}, ponowne chwyty: ${R.regrab}.</p>`
      : `<p>A drag usually takes you <strong>${ms(median(R.time))}</strong>, and you drop the square on average ${px(mean(R.err))} from the frame's centre.</p><p>Tremor while holding the button: ${px(R.trem,2)}. Stops during dragging: ${R.pauses}, re-grabs: ${R.regrab}.</p>`; }
  });
})();

// =====================================================================
// 5. RYSOWANIE PO ŚLADZIE
// =====================================================================
const Draw = (() => {
  const geom = A => ({ circle:{cx:A.w/2, cy:A.h/2, r:Math.min(A.w,A.h)*0.36},
                       line:{x1:A.w*0.15, y1:A.h*0.8, x2:A.w*0.85, y2:A.h*0.2} });
  const devC = (g,p) => Math.abs(hyp(p.x,p.y,g.cx,g.cy)-g.r);
  const projL = (g,p) => { const dx=g.x2-g.x1, dy=g.y2-g.y1; return ((p.x-g.x1)*dx+(p.y-g.y1)*dy)/(dx*dx+dy*dy); };
  const devL = (g,p) => { const u=Math.max(0,Math.min(1,projL(g,p))); return hyp(p.x,p.y,g.x1+u*(g.x2-g.x1),g.y1+u*(g.y2-g.y1)); };
  const shape = S => S.round===0 ? "circle" : "line";
  const dev = (S,p) => shape(S)==="circle" ? devC(S.g.circle,p) : devL(S.g.line,p);
  const instr = S => shape(S)==="circle"
    ? {pl:"Wciśnij przycisk na szarym okręgu i obrysuj go jednym ruchem dookoła.",en:"Press the button on the grey circle and trace it all the way round in one go."}
    : {pl:"Teraz linia: wciśnij przycisk przy jednym końcu i prowadź do drugiego.",en:"Now the line: press the button near one end and trace it to the other."};
  const draw = t => { const A=t.A, S=t.S, g=A.ctx; A.clear();
    g.lineCap="round"; g.strokeStyle=css("--line"); g.lineWidth=22; g.beginPath();
    if(shape(S)==="circle"){ const c=S.g.circle; g.arc(c.cx,c.cy,c.r,0,Math.PI*2); }
    else { const l=S.g.line; g.moveTo(l.x1,l.y1); g.lineTo(l.x2,l.y2); }
    g.stroke(); g.strokeStyle=css("--muted"); g.lineWidth=1.5; g.stroke();
    if(S.pts.length>1){ g.strokeStyle=css("--accent"); g.lineWidth=2; g.beginPath(); g.moveTo(S.pts[0].x,S.pts[0].y);
      for(const p of S.pts) g.lineTo(p.x,p.y); g.stroke(); } };
  function endRound(t){ const S=t.S; S.drawing=false;
    const pts=S.pts, sh=shape(S);
    if(pts.length<15){ S.pts=[]; t.status({pl:"Za krótko. Spróbuj jeszcze raz.",en:"Too short. Try again."}); draw(t); return; }
    const devs=pts.map(p=>dev(S,p));
    let cover;
    if(sh==="circle") cover=Math.min(1,Math.abs(S.cum)/(2*Math.PI));
    else { const u=pts.map(p=>Math.max(0,Math.min(1,projL(S.g.line,p)))); cover=Math.max(...u)-Math.min(...u); }
    const time=pts[pts.length-1].t-pts[0].t;
    S.res[sh]={ mean:mean(devs), max:Math.max(...devs), trem:tremorRMS([pts]), cover, time, speed:pathLen(pts)/(time/1000) };
    S.round++; S.pts=[];
    if(S.round>=2) t.finish(); else { t.status(instr(S)); draw(t); } }
  return mouseTask({ tab:"rysowanie", grid:"cards-draw", sumId:"sum-draw", canvas:"cv-draw", statusId:"st-draw", go:"go-draw",
    title:{pl:"Rysowanie po śladzie",en:"Tracing shapes"},
    specs:[
      {id:"r-dev", title:{pl:"Odchylenie od wzoru",en:"Deviation from shape"}, unit:{pl:"px (koło / linia)",en:"px (circle / line)"},
       rows:[["maxc",{pl:"maksymalne, koło",en:"maximum, circle"}],["maxl",{pl:"maksymalne, linia",en:"maximum, line"}]],
       how:{pl:"Dla każdego punktu narysowanej drogi liczę odległość od wzoru: dla okręgu <code>|odległość od środka − promień|</code>, dla linii odległość prostopadłą do odcinka. Pokazuję średnią i maksimum.",
            en:"For every point of the drawn path I measure the distance to the shape: for the circle <code>|distance from centre − radius|</code>, for the line the perpendicular distance to the segment. I show the mean and the maximum."}},
      {id:"r-trem", title:{pl:"Drżenie",en:"Tremor"}, unit:{pl:"px RMS (koło / linia)",en:"px RMS (circle / line)"},
       how:{pl:"Tak samo jak przy przeciąganiu: odchylenie każdego punktu od średniej z 7 sąsiednich, średnia kwadratowa. Mierzy drobne drgania niezależnie od tego, jak dobrze trzymasz się wzoru.",
            en:"Same as in dragging: each point's offset from the average of its 7 neighbours, root mean square. It measures small wobble regardless of how well you follow the shape."}},
      {id:"r-cover", title:{pl:"Pokrycie wzoru",en:"Shape coverage"}, unit:{pl:"% (koło / linia)",en:"% (circle / line)"},
       how:{pl:"Okrąg: jaki kąt obiegłeś wokół środka (360° = 100 %, wtedy rysowanie kończy się samo). Linia: jaką część długości odcinka pokryła rzutowana droga.",
            en:"Circle: the angle you went round the centre (360° = 100 %, drawing then stops by itself). Line: how much of the segment's length the projected path covered."}},
      {id:"r-speed", title:{pl:"Tempo rysowania",en:"Drawing speed"}, unit:{pl:"px/s (koło / linia)",en:"px/s (circle / line)"},
       rows:[["tc",{pl:"czas, koło",en:"time, circle"}],["tl",{pl:"czas, linia",en:"time, line"}]],
       how:{pl:"<code>długość narysowanej drogi ÷ czas rysowania</code>.", en:"<code>length of drawn path ÷ drawing time</code>."}}
    ],
    start(t){ const A=t.A; t.S={phase:"run", g:geom(A), round:0, pts:[], drawing:false, res:{}, cum:0, prevA:0}; t.status(instr(t.S)); draw(t); },
    draw,
    down(t, p, e){ const S=t.S;
      if(dev(S,p)>30){ t.status({pl:"Zacznij na wzorze (szary pas).",en:"Start on the shape (the grey band)."}); return; }
      S.drawing=true; S.pts=[p]; S.cum=0; const c=S.g.circle; S.prevA=Math.atan2(p.y-c.cy,p.x-c.cx);
      try{ t.A.c.setPointerCapture(e.pointerId); }catch(_){} t.status(instr(S)); },
    move(t, pts){ const S=t.S; if(!S.drawing) return; const c=S.g.circle;
      for(const p of pts){ S.pts.push(p);
        if(shape(S)==="circle"){ const a=Math.atan2(p.y-c.cy,p.x-c.cx); let d=a-S.prevA;
          if(d>Math.PI) d-=2*Math.PI; if(d<-Math.PI) d+=2*Math.PI; S.cum+=d; S.prevA=a;
          if(Math.abs(S.cum)>=2*Math.PI){ draw(t); endRound(t); return; } } }
      draw(t); },
    up(t){ if(t.S.drawing) endRound(t); },
    analyse(t){ return t.S.res; },
    render(R){ const c=R.circle, l=R.line;
      setMain("r-dev",`${nf(c.mean,1)} / ${nf(l.mean,1)}`); setRow("r-dev","maxc",px(c.max)); setRow("r-dev","maxl",px(l.max));
      setMain("r-trem",`${nf(c.trem,2)} / ${nf(l.trem,2)}`);
      setMain("r-cover",`${nf(100*c.cover)} / ${nf(100*l.cover)}`);
      setMain("r-speed",`${nf(c.speed)} / ${nf(l.speed)}`); setRow("r-speed","tc",nf(c.time/1000,1)+" s"); setRow("r-speed","tl",nf(l.time/1000,1)+" s"); },
    summary(R){ const c=R.circle, l=R.line; return LANG==="pl"
      ? `<p>Okrąg obrysowałeś ze średnim odchyleniem <strong>${px(c.mean)}</strong>, a linię z odchyleniem <strong>${px(l.mean)}</strong>.</p><p>Drżenie: ${px(c.trem,2)} przy okręgu i ${px(l.trem,2)} przy linii. Okrąg zajął ci ${nf(c.time/1000,1)} s, linia ${nf(l.time/1000,1)} s.</p>`
      : `<p>You traced the circle with a mean deviation of <strong>${px(c.mean)}</strong> and the line with <strong>${px(l.mean)}</strong>.</p><p>Tremor: ${px(c.trem,2)} on the circle and ${px(l.trem,2)} on the line. The circle took you ${nf(c.time/1000,1)} s, the line ${nf(l.time/1000,1)} s.</p>`; }
  });
})();

// =====================================================================
// 6. PODWÓJNE KLIKNIĘCIE
// =====================================================================
const Dbl = (() => { const N=8, RAD=26, SLOW=500;
  const newTrial = (t, from) => { const A=t.A; let p, k=0;
    do{ p=A.rnd(RAD+12); k++; } while(from && hyp(p.x,p.y,from.x,from.y)<150 && k<200);
    t.S.cur={x:p.x, y:p.y, downs:[], ups:[]};
    t.status({pl:`Kółko ${t.S.trials.length+1} z ${N}: kliknij dwukrotnie`, en:`Circle ${t.S.trials.length+1} of ${N}: double-click`}); draw(t); };
  const draw = t => { const A=t.A, c=t.S.cur; A.clear(); if(!c) return;
    A.dot(c.x,c.y,RAD,css("--accent")); if(c.downs.length===1) A.dot(c.x,c.y,RAD+6,css("--accent"),false,2); };
  return mouseTask({ tab:"dwuklik", grid:"cards-dbl", sumId:"sum-dbl", canvas:"cv-dbl", statusId:"st-dbl", go:"go-dbl",
    title:{pl:"Podwójne kliknięcie",en:"Double click"},
    specs:[
      {id:"p-int", title:{pl:"Odstęp między kliknięciami",en:"Click interval"}, unit:U.ms_med, rows:[R_MEAN,R_SD],
       how:{pl:"Czas od pierwszego do drugiego wciśnięcia przycisku (<code>pointerdown → pointerdown</code>).",
            en:"Time from the first to the second button press (<code>pointerdown → pointerdown</code>)."}},
      {id:"p-hold", title:{pl:"Przytrzymanie",en:"Hold"}, unit:U.ms_med, rows:[["first",{pl:"pierwsze kliknięcie",en:"first click"}],["second",{pl:"drugie kliknięcie",en:"second click"}]],
       how:{pl:"<code>pointerup − pointerdown</code> osobno dla pierwszego i drugiego kliknięcia w parze.",
            en:"<code>pointerup − pointerdown</code> separately for the first and second click in each pair."}},
      {id:"p-move", title:{pl:"Drgnięcie kursora",en:"Cursor drift"}, unit:{pl:"px (średnio)",en:"px (mean)"}, rows:[["max",{pl:"największe",en:"largest"}]],
       how:{pl:"O ile przesunął się kursor między pierwszym a drugim wciśnięciem. Systemy uznają kliknięcia za podwójne tylko wtedy, gdy kursor prawie się nie ruszył.",
            en:"How far the cursor moved between the first and second press. Systems only treat clicks as a double click when the cursor barely moved."}},
      {id:"p-slow", title:{pl:"Za wolne",en:"Too slow"}, unit:{pl:`z ${N}`,en:`of ${N}`},
       how:{pl:`Pary z odstępem powyżej ${SLOW} ms. To domyślny próg w Windows: wolniejsze kliknięcia system potraktowałby jako dwa pojedyncze.`,
            en:`Pairs with an interval above ${SLOW} ms. That is the Windows default threshold: slower clicks would be treated by the system as two single clicks.`}}
    ],
    start(t){ t.S={phase:"run", trials:[], cur:null}; newTrial(t, null); },
    draw,
    down(t, p){ const c=t.S.cur; if(!c) return; if(hyp(p.x,p.y,c.x,c.y)<=RAD+4){ c.downs.push(p); draw(t); } },
    up(t, p){ const S=t.S, c=S.cur; if(!c || c.ups.length>=c.downs.length) return; c.ups.push(p.t);
      if(c.ups.length===2){ const [a,b]=c.downs;
        S.trials.push({ int:b.t-a.t, h1:c.ups[0]-a.t, h2:c.ups[1]-b.t, move:hyp(a.x,a.y,b.x,b.y) });
        if(S.trials.length>=N) t.finish(); else newTrial(t, b); } },
    analyse(t){ const T=t.S.trials; return { int:T.map(x=>x.int), h1:T.map(x=>x.h1), h2:T.map(x=>x.h2), move:T.map(x=>x.move), slow:T.filter(x=>x.int>SLOW).length, n:T.length }; },
    render(R){ setMain("p-int",nf(median(R.int))); setRow("p-int","mean",ms(mean(R.int))); setRow("p-int","sd",ms(sd(R.int)));
      setMain("p-hold",nf(median([...R.h1,...R.h2]))); setRow("p-hold","first",ms(median(R.h1))); setRow("p-hold","second",ms(median(R.h2)));
      setMain("p-move",nf(mean(R.move),1)); setRow("p-move","max",px(Math.max(...R.move))); setMain("p-slow",R.slow); },
    summary(R){ return LANG==="pl"
      ? `<p>Odstęp między kliknięciami wynosi u ciebie zwykle <strong>${ms(median(R.int))}</strong> (Windows domyślnie uznaje kliknięcia za podwójne do ${SLOW} ms). Za wolnych par: ${R.slow} z ${R.n}.</p><p>Kursor przesuwał się przy tym średnio o ${px(mean(R.move))}.</p>`
      : `<p>Your interval between clicks is usually <strong>${ms(median(R.int))}</strong> (by default Windows treats clicks as a double click up to ${SLOW} ms). Too slow pairs: ${R.slow} of ${R.n}.</p><p>The cursor moved on average ${px(mean(R.move))} in between.</p>`; }
  });
})();

// =====================================================================
// 7. HASŁO — profil rytmu wpisywania hasła i test zgodności
// =====================================================================
const Pass = (() => { const N=5, MINLEN=6, FLOOR=10;
  const inp=$("pass-input"), A=new Arena("cv-pass");
  let P, cur, st=null;
  const self = { tab:"haslo", grid:"cards-pass", sumId:"sum-pass", R:null, title:{pl:"Hasło",en:"Password"}, specs:[
    {id:"h-last", title:{pl:"Ostatni test",en:"Last test"}, unit:{pl:"odległość",en:"distance"},
     rows:[["th",{pl:"próg zgodności",en:"match threshold"}],["ver",{pl:"werdykt",en:"verdict"}]],
     how:{pl:"Każde wpisanie zamieniam na wektor cech: czas przytrzymania każdego klawisza i odstęp <code>keydown → keydown</code> między kolejnymi klawiszami. Odległość to skalowana odległość Manhattan: średnia z <code>|wartość − średnia z profilu| ÷ średnie odchylenie z profilu</code>. 0 oznacza wpisanie identyczne ze średnią z profilu, 1 to typowe odchylenie.",
          en:"Each entry becomes a feature vector: how long each key is held and the <code>keydown → keydown</code> gap between consecutive keys. The distance is a scaled Manhattan distance: the mean of <code>|value − profile mean| ÷ profile mean deviation</code>. 0 means identical to the profile average, 1 is a typical deviation."}},
    {id:"h-tests", title:{pl:"Testy",en:"Tests"}, unit:{pl:"zgodnych",en:"matching"},
     rows:[["all",{pl:"wszystkich testów",en:"tests in total"}],["rej",{pl:"odrzuconych",en:"rejected"}]],
     how:{pl:"Test zgadza się z profilem, gdy jego odległość nie przekracza progu. Możesz dać wpisać hasło komuś innemu i sprawdzić, czy zostanie odrzucony.",
          en:"A test matches the profile when its distance does not exceed the threshold. You can let someone else type your password and see whether they get rejected."}},
    {id:"h-cons", title:{pl:"Powtarzalność",en:"Consistency"}, unit:{pl:"ms (średnie odchylenie)",en:"ms (mean deviation)"},
     rows:[["loo",{pl:"odległości wpisań próbnych",en:"enrollment distances"}]],
     how:{pl:`Średnie odchylenie bezwzględne każdej cechy w ${N} wpisaniach próbnych (minimum ${FLOOR} ms, żeby nie dzielić przez prawie zero). Mniej oznacza bardziej powtarzalne pisanie. Próg: każde wpisanie próbne porównuję z profilem zbudowanym z pozostałych. Próg to większa z dwóch wartości: najgorszy wynik tych porównań albo średnia + 2 odchylenia.`,
          en:`The mean absolute deviation of each feature over the ${N} enrollment entries (at least ${FLOOR} ms, to avoid dividing by almost zero). Lower means more repeatable typing. Threshold: each enrollment entry is compared with a profile built from the others. The threshold is the larger of: the worst of those results, or mean + 2 standard deviations.`}},
    {id:"h-feat", title:{pl:"Cechy",en:"Features"}, unit:{pl:"cech czasowych",en:"timing features"},
     rows:[["dw",{pl:"przytrzymania",en:"hold times"}],["dd",{pl:"odstępy",en:"intervals"}],["en",{pl:"wpisań w profilu",en:"entries in profile"}]],
     how:{pl:"Hasło o <i>n</i> znakach daje <i>n</i> czasów przytrzymania i <i>n</i>−1 odstępów. Wpisanie z poprawkami (Backspace, strzałki), wklejeniem lub innym tekstem jest odrzucane i nie trafia do profilu. Samo hasło nie jest nigdzie zapisywane ani eksportowane.",
          en:"A password of <i>n</i> characters gives <i>n</i> hold times and <i>n</i>−1 intervals. Entries with corrections (Backspace, arrows), pasting or different text are rejected and don't enter the profile. The password itself is never stored or exported."}}
  ]};
  const status = o => { st=o; $("pass-status").textContent = L(o) || ""; };
  const newAttempt = () => { cur={keys:[], dirty:false}; inp.value=""; };

  function label(){
    $("pass-label").textContent = P.prof
      ? (LANG==="pl" ? "Test: wpisz hasło i naciśnij Enter." : "Test: type the password and press Enter.")
      : (LANG==="pl" ? `Wpisanie ${P.enroll.length+1} z ${N}: ${P.enroll.length?"wpisz to samo hasło":`wymyśl hasło (min. ${MINLEN} znaków)`} i naciśnij Enter.`
                     : `Entry ${P.enroll.length+1} of ${N}: ${P.enroll.length?"type the same password":`make up a password (min. ${MINLEN} characters)`} and press Enter.`);
    $("pass-steps").innerHTML = Array.from({length:N},(_,i)=>`<span class="${i<P.enroll.length?"ok":(i===P.enroll.length&&!P.prof?"now":"")}">${i+1}</span>`).join("")
      + `<span class="${P.prof?"now":""}">test</span>`;
  }

  inp.addEventListener("keydown", e => {
    if(e.key==="Enter"){ e.preventDefault(); submit(); return; }
    if(e.repeat) return;
    if(["Backspace","Delete","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(e.key)){ cur.dirty=true; return; }
    if(e.key.length===1) cur.keys.push({code:e.code, key:e.key, down:performance.now(), up:null});
  });
  inp.addEventListener("keyup", e => { const t=performance.now();
    for(let i=cur.keys.length-1;i>=0;i--){ const k=cur.keys[i]; if(k.code===e.code && k.up==null){ k.up=t; break; } } });
  inp.addEventListener("beforeinput", e => {
    if(["insertFromPaste","insertFromDrop"].includes(e.inputType)){ e.preventDefault(); cur.dirty=true; }
    else if(!e.inputType.startsWith("insertText") && e.inputType!=="insertCompositionText") cur.dirty=true; });
  inp.addEventListener("paste", e => e.preventDefault());
  inp.addEventListener("drop", e => e.preventDefault());
  $("pass-reset").addEventListener("click", reset);

  const vec = () => { const k=cur.keys; if(k.some(x=>x.up==null)) return null;
    return k.map(x=>x.up-x.down).concat(k.slice(1).map((x,i)=>x.down-k[i].down)); };
  function stats(vs){ const mu=[], a=[];
    for(let i=0;i<vs[0].length;i++){ const col=vs.map(v=>v[i]), m=mean(col); mu.push(m); a.push(Math.max(FLOOR, mean(col.map(c=>Math.abs(c-m))))); }
    return {mu,a}; }
  const dist = (x,mu,a) => { let s=0; for(let i=0;i<x.length;i++) s+=Math.abs(x[i]-mu[i])/a[i]; return s/x.length; };
  function build(){ const {mu,a}=stats(P.enroll);
    const loo=P.enroll.map((v,j)=>{ const o=stats(P.enroll.filter((_,k)=>k!==j)); return dist(v,o.mu,o.a); });
    P.prof={mu, a, loo, th:Math.max(Math.max(...loo), mean(loo)+2*sd(loo))}; }

  function submit(){
    const v=inp.value, typed=cur.keys.map(x=>x.key).join("");
    if(!P.pw && v.length<MINLEN){ status({pl:`Hasło musi mieć co najmniej ${MINLEN} znaków.`,en:`The password needs at least ${MINLEN} characters.`}); newAttempt(); return; }
    if(P.pw && v!==P.pw){ status({pl:"To nie jest to samo hasło. Spróbuj jeszcze raz.",en:"That's not the same password. Try again."}); newAttempt(); return; }
    if(cur.dirty || typed!==v){ status({pl:"Wpisanie z poprawką albo wklejeniem nie liczy się. Wpisz hasło jeszcze raz, bez poprawek.",en:"Entries with corrections or pasting don't count. Type the password again without corrections."}); newAttempt(); return; }
    const x=vec();
    if(!x){ status({pl:"Puść wszystkie klawisze przed naciśnięciem Enter i spróbuj jeszcze raz.",en:"Release all keys before pressing Enter and try again."}); newAttempt(); return; }
    if(!P.prof){
      if(!P.pw) P.pw=v;
      P.enroll.push(x);
      if(P.enroll.length>=N){ build(); update();
        status({pl:"Profil gotowy. Teraz wpisz hasło w trybie testu albo daj spróbować komuś innemu.",en:"Profile ready. Now type the password in test mode, or let someone else try."}); }
      else status({pl:`Zapisano wpisanie ${P.enroll.length} z ${N}.`,en:`Saved entry ${P.enroll.length} of ${N}.`});
    } else {
      const d=dist(x,P.prof.mu,P.prof.a), ok=d<=P.prof.th;
      P.tests.push({d, ok, x}); update();
      status(ok ? {pl:`Zgadza się z profilem (odległość ${nf(d,2)}, próg ${nf(P.prof.th,2)}).`,en:`Matches the profile (distance ${nf(d,2)}, threshold ${nf(P.prof.th,2)}).`}
                : {pl:`Nie zgadza się z profilem (odległość ${nf(d,2)}, próg ${nf(P.prof.th,2)}).`,en:`Does not match the profile (distance ${nf(d,2)}, threshold ${nf(P.prof.th,2)}).`});
    }
    label(); newAttempt(); chart(); history();
  }
  function update(){
    // w wyniku nie ma hasła, są tylko czasy
    self.R = { length:P.enroll[0] ? (P.enroll[0].length+1)/2 : 0, enroll:P.enroll, mean:P.prof.mu, deviation:P.prof.a, enrollDistances:P.prof.loo,
      threshold:P.prof.th, tests:P.tests.map(t=>({distance:t.d, match:t.ok, timings:t.x})) };
    self.render(self.R); setSummary(self); markDone("haslo");
  }
  function history(){
    $("pass-history").innerHTML = P.tests.map((t,i)=>`<span class="chip ${t.ok?"ok":"no"}">#${i+1} ${nf(t.d,2)} ${t.ok?"✓":"✗"}</span>`).join("");
  }
  self.render = R => { const last=R.tests[R.tests.length-1], acc=R.tests.filter(t=>t.match).length;
    setMain("h-last", last ? nf(last.distance,2) : "—"); setRow("h-last","th",nf(R.threshold,2));
    setRow("h-last","ver", last ? (last.match ? (LANG==="pl"?"zgodne":"match") : (LANG==="pl"?"niezgodne":"no match")) : "—");
    setMain("h-tests", acc); setRow("h-tests","all",R.tests.length); setRow("h-tests","rej",R.tests.length-acc);
    setMain("h-cons", nf(mean(R.deviation))); setRow("h-cons","loo", R.enrollDistances.map(d=>nf(d,2)).join(" · "));
    setMain("h-feat", R.mean.length); setRow("h-feat","dw",R.length); setRow("h-feat","dd",R.length-1); setRow("h-feat","en",R.enroll.length); };
  self.summary = R => { const last=R.tests[R.tests.length-1], acc=R.tests.filter(t=>t.match).length;
    if(LANG==="pl") return `<p>Profil powstał z ${R.enroll.length} wpisań hasła (${R.length} znaków, ${R.mean.length} cech czasowych). Próg zgodności wynosi <strong>${nf(R.threshold,2)}</strong>.</p>`
      + (last ? `<p>Ostatni test: odległość <strong>${nf(last.distance,2)}</strong>, więc wpisanie <strong>${last.match?"zgadza się":"nie zgadza się"}</strong> z profilem. Zgodnych testów: ${acc} z ${R.tests.length}.</p>` : `<p>Nie było jeszcze żadnego testu.</p>`);
    return `<p>The profile was built from ${R.enroll.length} password entries (${R.length} characters, ${R.mean.length} timing features). The match threshold is <strong>${nf(R.threshold,2)}</strong>.</p>`
      + (last ? `<p>Last test: distance <strong>${nf(last.distance,2)}</strong>, so the entry <strong>${last.match?"matches":"does not match"}</strong> the profile. Matching tests: ${acc} of ${R.tests.length}.</p>` : `<p>No test yet.</p>`); };

  // Wykres: dla każdej cechy pasmo średnia ± odchylenie, kropki wpisań próbnych i ostatni test
  function chart(){
    A.fit(); if(!A.w) return; A.clear(); const g=A.ctx;
    if(!P.enroll.length){ A.label(LANG==="pl"?"Wykres pojawi się po pierwszym wpisaniu hasła":"The chart appears after the first password entry"); return; }
    const m=P.enroll[0].length, n=(m+1)/2, {mu,a}=P.prof||stats(P.enroll);
    const last=P.tests[P.tests.length-1];
    let ymax=0; for(let i=0;i<m;i++){ ymax=Math.max(ymax,mu[i]+2*a[i]); for(const v of P.enroll) ymax=Math.max(ymax,v[i]); if(last) ymax=Math.max(ymax,last.x[i]); }
    const step = ymax>800?200:ymax>400?100:ymax>150?50:25; ymax=Math.ceil(ymax*1.05/step)*step;
    const L0=48, R0=12, T0=12, B0=40, W=A.w-L0-R0, H=A.h-T0-B0, cw=W/m;
    const y = v => T0+H-(Math.max(0,v)/ymax)*H, x = i => L0+cw*(i+0.5);
    g.font="11px "+css("--font-mono"); g.fillStyle=css("--muted"); g.textAlign="right"; g.textBaseline="middle";
    g.strokeStyle=css("--line"); g.lineWidth=1;
    for(let v=0; v<=ymax; v+=step){ g.beginPath(); g.moveTo(L0,y(v)); g.lineTo(A.w-R0,y(v)); g.stroke(); g.fillText(v+" ms",L0-6,y(v)); }
    g.beginPath(); g.moveTo(L0+cw*n, T0); g.lineTo(L0+cw*n, T0+H); g.setLineDash([4,4]); g.stroke(); g.setLineDash([]);
    const acc=css("--accent");
    for(let i=0;i<m;i++){
      const bw=Math.min(28,cw*0.6);
      g.globalAlpha=0.18; g.fillStyle=acc; g.fillRect(x(i)-bw/2, y(mu[i]+a[i]), bw, Math.max(1,y(mu[i]-a[i])-y(mu[i]+a[i]))); g.globalAlpha=1;
      g.strokeStyle=acc; g.lineWidth=2; g.beginPath(); g.moveTo(x(i)-bw/2,y(mu[i])); g.lineTo(x(i)+bw/2,y(mu[i])); g.stroke();
      for(const v of P.enroll) A.dot(x(i), y(v[i]), 2.2, css("--muted"));
      if(last){ const off=Math.abs(last.x[i]-mu[i])<=2*a[i]; A.dot(x(i), y(last.x[i]), 4.5, off?css("--ok"):css("--err")); }
      g.fillStyle=css("--muted"); g.textAlign="center"; g.textBaseline="top";
      g.fillText(i<n ? String(i+1) : `${i-n+1}→${i-n+2}`, x(i), T0+H+5);
    }
    g.font="12px "+css("--font-body"); g.fillStyle=css("--ink");
    g.fillText(LANG==="pl"?"przytrzymanie klawisza nr":"hold time of key no.", L0+cw*n/2, T0+H+22);
    g.fillText(LANG==="pl"?"odstęp między klawiszami":"interval between keys", L0+cw*n+cw*(m-n)/2, T0+H+22);
  }
  function reset(){
    P={pw:null, enroll:[], prof:null, tests:[]}; self.R=null; newAttempt(); status(null);
    const tab=document.querySelector('#tabs a[data-tab="haslo"]'); if(tab) tab.classList.remove("done");
    if($(self.grid).children.length){ buildCards(self.grid, self.specs); setSummary(self); renderResults(); }
    label(); history(); chart();
  }
  self.reset = reset; self.chart = chart;
  self.onLang = () => { label(); status(st); history(); chart(); };
  P={pw:null, enroll:[], prof:null, tests:[]}; newAttempt();
  return self;
})();

// =====================================================================
// 8a. PSEUDOSŁOWA — przepisywanie słów bez znaczenia
// =====================================================================
const PSEUDO = {
  pl:"brodwiel klepsa żumoch dryzgot szawiłka pąbro chrzęsk dziwolik bezgrot ółmica",
  en:"blorft drimple quazzle snepto grawlish thrumb ploddit vexrin bidquor fendrel"
};
const Pseudo = (() => {
  const ta=$("ps-input"), tgt=$("ps-target"); let S, T;
  const self = { tab:"litery", key:"pseudoslowa", grid:"cards-ps", sumId:"sum-ps", R:null, title:{pl:"Pseudosłowa",en:"Pseudowords"}, specs:[
    {id:"ps-speed", title:{pl:"Tempo",en:"Pace"}, unit:{pl:"znaków/min",en:"chars/min"},
     rows:[["real",{pl:"zwykły tekst (etap 1)",en:"normal text (stage 1)"}],["ratio",{pl:"pseudosłowa ÷ zwykły tekst",en:"pseudowords ÷ normal text"}],["dur",{pl:"czas całkowity",en:"total time"}]],
     how:{pl:"<code>znaki ÷ minuty</code>, od pierwszego znaku do ostatniej zmiany tekstu. Jeśli zrobiłeś etap 1, porównuję z tempem zwykłego tekstu. Znane słowa piszemy z pamięci całymi kawałkami, a pseudosłowa trzeba składać litera po literze, więc zwykle idą wolniej. Badacze pisania porównują właśnie takie zadania o różnym stopniu „słowności”.",
          en:"<code>characters ÷ minutes</code>, from the first character to the last change of the text. If you did stage 1, I compare with your normal-text pace. Familiar words are typed from memory in whole chunks, while pseudowords must be built letter by letter, so they are usually slower. Writing researchers compare exactly such tasks with different levels of “wordness”."}},
    {id:"ps-word", title:{pl:"Czas na słowo",en:"Time per word"}, unit:U.ms_med,
     rows:[["slow",{pl:"najwolniejsze",en:"slowest"}],["fast",{pl:"najszybsze",en:"fastest"}]],
     how:{pl:"Od wpisania pierwszej litery słowa do wpisania jego ostatniej litery (pierwsze podejście, bez poprawek).",
          en:"From typing a word's first letter to typing its last letter (first attempt, before corrections)."}},
    {id:"ps-err", title:{pl:"Błędy",en:"Errors"}, unit:{pl:"wpisanych błędnie",en:"typed wrong"},
     rows:[["rate",{pl:"odsetek błędnych znaków",en:"share of wrong characters"}],["left",{pl:"niepoprawione na końcu",en:"left uncorrected"}]],
     how:{pl:"Jak w etapie 1: każdy wstawiony znak porównuję ze znakiem wzorca na tej samej pozycji.",
          en:"As in stage 1: every inserted character is compared with the reference character at the same position."}},
    errTypesSpec("ps-types")
  ]};
  const fresh = () => ({ ins:[], startT:null, lastT:null, typed:0, err:0, prevLen:0, done:false, timer:null });
  function renderTarget(){ const v=ta.value; let h="";
    for(let i=0;i<T.length;i++){ const cls = i<v.length ? (v[i]===T[i]?"done":"bad") : (i===v.length?"cur":"");
      h += `<span class="${cls}">${T[i]===" "?"&nbsp;":esc(T[i])}</span>` + (T[i]===" "?"<wbr>":""); }
    tgt.innerHTML=h; }
  function renderLive(){ const t = S.startT==null ? 0 : ((S.done?S.lastT:performance.now())-S.startT)/1000;
    $("ps-time").textContent = nf(t,1)+" s"; $("ps-err").textContent = S.err; }
  ta.addEventListener("keydown", e => { if(S.done) return;
    if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End","PageUp","PageDown","Enter"].includes(e.key)){ e.preventDefault(); return; }
    if(S.startT==null && e.key.length===1){ S.startT=performance.now(); $("ps-finish").disabled=false; S.timer=setInterval(renderLive,100); } });
  ta.addEventListener("beforeinput", e => { if(S.done || ["insertFromPaste","insertFromDrop","insertLineBreak","insertParagraph"].includes(e.inputType)) e.preventDefault(); });
  ta.addEventListener("input", e => { const v=ta.value, t=performance.now(); S.lastT=t;
    if(e.inputType && e.inputType.startsWith("insert") && e.data){ const st=v.length-e.data.length;
      for(let i=0;i<e.data.length;i++){ S.typed++; S.ins.push({pos:st+i, ch:e.data[i], t}); if(e.data[i]!==T[st+i]) S.err++; } }
    S.prevLen=v.length; renderTarget(); renderLive(); if(v===T) finish(); });
  const toEnd = () => { const n=ta.value.length; ta.setSelectionRange(n,n); };
  ["click","focus","select","mouseup"].forEach(ev => ta.addEventListener(ev, toEnd));
  ta.addEventListener("paste", e => e.preventDefault()); ta.addEventListener("drop", e => e.preventDefault());
  $("ps-finish").addEventListener("click", () => { if(S.startT!=null) finish(); });
  $("ps-reset").addEventListener("click", reset);
  function finish(){ if(S.done) return; S.done=true; clearInterval(S.timer); if(S.lastT==null) S.lastT=performance.now();
    ta.disabled=true; $("ps-finish").disabled=true; renderLive();
    const v=ta.value, dur=(S.lastT-S.startT)/1000;
    const first={}; for(const x of S.ins) if(!(x.pos in first)) first[x.pos]=x.t;
    const words=[]; let a=0;
    for(const w of T.split(" ")){ const b=a+w.length-1; if(first[a]!=null && first[b]!=null) words.push({w, ms:first[b]-first[a]}); a=b+2; }
    self.R = { cpm:v.length/(dur/60), dur, realCpm: Typing.R ? Typing.R.cpm : null,
      words, err:S.err, errRate:S.typed?S.err/S.typed:NaN, left:[...v].filter((c,i)=>c!==T[i]).length+Math.max(0,T.length-v.length),
      errTypes:classifyErrors(S.ins, T) };
    self.render(self.R); setSummary(self); markDone("litery"); }
  self.render = R => {
    setMain("ps-speed", nf(R.cpm)); setRow("ps-speed","real", R.realCpm ? nf(R.realCpm) : (LANG==="pl"?"brak (zrób etap 1)":"none (do stage 1)"));
    setRow("ps-speed","ratio", R.realCpm ? nf(R.cpm/R.realCpm,2)+"×" : "—"); setRow("ps-speed","dur", nf(R.dur,1)+" s");
    const ws=[...R.words].sort((x,y)=>y.ms-x.ms);
    setMain("ps-word", nf(median(R.words.map(w=>w.ms))));
    setRow("ps-word","slow", ws.length ? `${ws[0].w} · ${ms(ws[0].ms)}` : "—"); setRow("ps-word","fast", ws.length ? `${ws[ws.length-1].w} · ${ms(ws[ws.length-1].ms)}` : "—");
    setMain("ps-err", R.err); setRow("ps-err","rate", pct(R.errRate,1)); setRow("ps-err","left", R.left);
    renderErrTypes("ps-types", R.errTypes); };
  self.summary = R => { const ws=[...R.words].sort((x,y)=>y.ms-x.ms), top=topErr(R.errTypes);
    if(LANG==="pl") return `<p>Pseudosłowa przepisałeś w tempie <strong>${nf(R.cpm)} znaków/min</strong>`
      + (R.realCpm ? `, a zwykły tekst z etapu 1 w tempie ${nf(R.realCpm)} znaków/min (stosunek ${nf(R.cpm/R.realCpm,2)}).` : ". Zrób etap 1, żeby porównać to ze zwykłym tekstem.")
      + (ws.length ? ` Najdłużej pisałeś słowo „${esc(ws[0].w)}” (${ms(ws[0].ms)}).` : "") + `</p>`
      + `<p>Błędnie wpisanych znaków: ${R.err}` + (top ? `, najczęstszy rodzaj błędu: ${top}.` : ".") + ` To opis tego, co zrobiłeś, a nie ocena.</p>`;
    return `<p>You retyped the pseudowords at <strong>${nf(R.cpm)} chars/min</strong>`
      + (R.realCpm ? `, and the normal text from stage 1 at ${nf(R.realCpm)} chars/min (ratio ${nf(R.cpm/R.realCpm,2)}).` : ". Do stage 1 to compare it with normal text.")
      + (ws.length ? ` The word that took longest was “${esc(ws[0].w)}” (${ms(ws[0].ms)}).` : "") + `</p>`
      + `<p>Characters typed wrong: ${R.err}` + (top ? `, most common error type: ${top}.` : ".") + ` This describes what you did; it is not an assessment.</p>`; };
  function reset(){ if(S && S.timer) clearInterval(S.timer); S=fresh(); T=PSEUDO[LANG];
    ta.maxLength=T.length; ta.value=""; ta.disabled=false; $("ps-finish").disabled=true; renderTarget(); renderLive(); }
  self.reset=reset; self.onLang = () => { if(!S.done) reset(); else renderLive(); };
  S=fresh(); T=PSEUDO[LANG];
  return self;
})();

// =====================================================================
// 8b. SZUKANIE LITER — zaznacz wszystkie „b” wśród d/p/q
// =====================================================================
const Search = (() => { const ROWS=7, COLS=12, NT=21, TGT="b", OTH=["d","p","q"];
  const grid=$("ls-grid"); let S=null, st=null;
  const self = { tab:"litery", key:"szukanie-liter", grid:"cards-ls", sumId:"sum-ls", R:null, title:{pl:"Szukanie liter",en:"Letter search"}, specs:[
    {id:"ls-time", title:{pl:"Czas",en:"Time"}, unit:{pl:"s",en:"s"}, rows:[["per",{pl:"na znak siatki",en:"per grid character"}]],
     how:{pl:`Od kliknięcia „Start” do „Gotowe”. Siatka ma ${ROWS*COLS} znaków, w tym ${NT} liter „${TGT}”.`,
          en:`From clicking “Start” to “Done”. The grid has ${ROWS*COLS} characters, ${NT} of them “${TGT}”.`}},
    {id:"ls-hit", title:{pl:"Trafienia",en:"Hits"}, unit:{pl:`z ${NT}`,en:`of ${NT}`}, rows:[["miss",{pl:"pominięte",en:"missed"}]],
     how:{pl:`Ile liter „${TGT}” zaznaczyłeś i ile przeoczyłeś. Po zakończeniu przeoczone mają pomarańczową ramkę.`,
          en:`How many “${TGT}” letters you marked and how many you missed. After finishing, missed ones get an orange outline.`}},
    {id:"ls-fa", title:{pl:"Pomyłki",en:"False marks"}, unit:{pl:"innych liter",en:"other letters"},
     rows:OTH.map(o=>[o,{pl:`„${o}” zamiast „${TGT}”`,en:`“${o}” instead of “${TGT}”`}]),
     how:{pl:`Zaznaczone litery inne niż „${TGT}”, z podziałem na to, którą literę wzięto za „${TGT}”. Litery b, d, p i q są swoimi odbiciami lustrzanymi lub obrotami. Po zakończeniu mają czerwoną ramkę.`,
          en:`Marked letters other than “${TGT}”, split by which letter was taken for “${TGT}”. The letters b, d, p and q are mirror images or rotations of each other. After finishing they get a red outline.`}}
  ]};
  const status = o => { st=o; $("st-ls").textContent = L(o)||""; };
  function idle(){ grid.innerHTML = Array.from({length:ROWS*COLS},()=>`<button type="button" disabled>·</button>`).join(""); }
  function start(){
    const pos=new Set(); while(pos.size<NT) pos.add(Math.floor(Math.random()*ROWS*COLS));
    const letters=Array.from({length:ROWS*COLS},(_,i)=>pos.has(i)?TGT:OTH[Math.floor(Math.random()*OTH.length)]);
    S={letters, marked:new Set(), t0:performance.now(), done:false};
    grid.innerHTML = letters.map((l,i)=>`<button type="button" data-i="${i}" aria-pressed="false">${l}</button>`).join("");
    $("ls-done").disabled=false;
    status({pl:`Zaznacz wszystkie litery „${TGT}”, potem kliknij „Gotowe”.`,en:`Mark every “${TGT}”, then click “Done”.`});
  }
  grid.addEventListener("click", e => { const b=e.target.closest("button[data-i]"); if(!b || !S || S.done) return;
    const i=+b.dataset.i; if(S.marked.has(i)) S.marked.delete(i); else S.marked.add(i);
    b.classList.toggle("on", S.marked.has(i)); b.setAttribute("aria-pressed", S.marked.has(i)); });
  function finish(){ if(!S || S.done) return; S.done=true; const t=(performance.now()-S.t0)/1000;
    let hits=0; const fa={}; OTH.forEach(o=>fa[o]=0);
    S.letters.forEach((l,i)=>{ const m=S.marked.has(i), b=grid.querySelector(`[data-i="${i}"]`);
      if(l===TGT){ if(m) hits++; else b.classList.add("miss"); } else if(m){ fa[l]++; b.classList.add("fa"); } b.disabled=true; });
    $("ls-done").disabled=true;
    self.R = { time:t, n:ROWS*COLS, targets:NT, hits, missed:NT-hits, falseMarks:fa, falseTotal:Object.values(fa).reduce((a,b)=>a+b,0) };
    self.render(self.R); setSummary(self); markDone("litery"); status({pl:"Gotowe.",en:"Done."}); }
  $("ls-go").addEventListener("click", start); $("ls-done").addEventListener("click", finish);
  self.render = R => { setMain("ls-time", nf(R.time,1)); setRow("ls-time","per", ms(1000*R.time/R.n));
    setMain("ls-hit", R.hits); setRow("ls-hit","miss", R.missed);
    setMain("ls-fa", R.falseTotal); OTH.forEach(o=>setRow("ls-fa",o,R.falseMarks[o])); };
  self.summary = R => LANG==="pl"
    ? `<p>Przejrzenie siatki zajęło ci <strong>${nf(R.time,1)} s</strong>. Zaznaczyłeś ${R.hits} z ${R.targets} liter „${TGT}”, pominąłeś ${R.missed}, a innych liter zaznaczyłeś ${R.falseTotal} (${OTH.map(o=>`${o}: ${R.falseMarks[o]}`).join(", ")}).</p><p>To opis tego, co zrobiłeś, a nie ocena.</p>`
    : `<p>Scanning the grid took you <strong>${nf(R.time,1)} s</strong>. You marked ${R.hits} of ${R.targets} “${TGT}” letters, missed ${R.missed} and marked ${R.falseTotal} other letters (${OTH.map(o=>`${o}: ${R.falseMarks[o]}`).join(", ")}).</p><p>This describes what you did; it is not an assessment.</p>`;
  self.onLang = () => status(st);
  idle();
  return self;
})();

// =====================================================================
// 9. WZROK — kalibracja, tablica Snellena (litery / obracane E), tablice barwne
// =====================================================================
const SLOAN = "CDHKNOVZ";
const SN_LEVELS = [200,100,70,50,40,30,25,20,15,10];
const snMm = (x, distM) => distM*1000*Math.tan((5/60)*(Math.PI/180)*x/20);   // wysokość znaku 20/x w mm
const snMetric = x => { const v=x*6/20; return "6/"+(Number.isInteger(v)?v:nf(v,1)); };

// Litery w stylu Sloan: siatka 5 × 5, grubość kreski = 1/5 wysokości
function drawSloan(g, ch, x, y, h){
  g.save(); g.beginPath(); g.rect(x,y,h,h); g.clip(); g.translate(x,y); g.scale(h/5,h/5);
  g.lineWidth=1; g.lineCap="butt"; g.lineJoin="miter"; g.miterLimit=10; g.beginPath();
  const P = pts => { g.moveTo(pts[0],pts[1]); for(let i=2;i<pts.length;i+=2) g.lineTo(pts[i],pts[i+1]); };
  switch(ch){
    case "H": P([.5,0,.5,5]); P([4.5,0,4.5,5]); P([.5,2.5,4.5,2.5]); break;
    case "N": P([.5,5.5,.5,.2,4.5,4.8,4.5,-.5]); break;
    case "V": P([.4,-.5,2.5,4.6,4.6,-.5]); break;
    case "Z": P([0,.5,4.3,.5,.7,4.5,5,4.5]); break;
    case "K": P([.5,0,.5,5]); P([4.7,-.1,1,3]); P([2.1,2.1,4.8,5.2]); break;
    case "O": g.arc(2.5,2.5,2,0,2*Math.PI); break;
    case "C": g.arc(2.5,2.5,2,0.27,2*Math.PI-0.27); break;
    case "D": P([2.5,.5,.5,.5,.5,4.5,2.5,4.5]); g.moveTo(2.5,.5); g.arc(2.5,2.5,2,-Math.PI/2,Math.PI/2); break;
  }
  g.stroke(); g.restore();
}
// Obracane E: siatka 5 × 5, ramiona skierowane w stronę `dir`
function drawE(g, dir, x, y, h){
  const u=h/5, rot={right:0, down:Math.PI/2, left:Math.PI, up:-Math.PI/2}[dir];
  g.save(); g.translate(x+h/2,y+h/2); g.rotate(rot); g.translate(-h/2,-h/2);
  g.fillRect(0,0,u,h); g.fillRect(0,0,h,u); g.fillRect(0,2*u,h,u); g.fillRect(0,4*u,h,u);
  g.restore();
}

const Cal = (() => {
  const r=$("cal-size"), d=$("cal-dist");
  r.value = Math.round(85.6*96/25.4);
  const dist = () => Math.min(6, Math.max(0.5, parseFloat(String(d.value).replace(",", ".")) || 2));
  const ppm = () => (+r.value)/85.6;
  function upd(){ const w=+r.value, c=$("cal-card"); c.style.width=w+"px"; c.style.height=(w*53.98/85.6)+"px";
    $("cal-mm").textContent = nf(ppm(),2)+" px/mm";
    const h=snMm(20,dist()); $("cal-info").textContent = (LANG==="pl"?"znak 20/20 będzie miał ":"a 20/20 symbol will be ")+`${nf(h,1)} mm = ${nf(h*ppm(),1)} px`; }
  r.addEventListener("input", upd); d.addEventListener("input", upd);
  return { ppm, dist, upd };
})();

function snSpecs(p){ return [
  {id:p+"-acu", title:{pl:"Ostrość wzroku",en:"Visual acuity"}, unit:{pl:"(zapis Snellena)",en:"(Snellen notation)"},
   rows:[["metric",{pl:"zapis metryczny",en:"metric notation"}],["dec",{pl:"zapis dziesiętny",en:"decimal"}],["start",{pl:"poziom startowy",en:"starting level"}]],
   how:{pl:"Znak poziomu 20/x ma wysokość odpowiadającą kątowi 5′ × x/20 z Twojej odległości: <code>wysokość = odległość × tan(5′ × x / 20)</code>. Na każdym poziomie pokazuję do 5 znaków; poziom jest zaliczony przy 3 poprawnych, niezaliczony przy 3 błędnych. Wynik to najmniejszy zaliczony poziom. 20/20 (6/6, 1,0) to tzw. pełna ostrość. Strona pokazuje pojedyncze znaki, a nie całe rzędy jak na tablicy, co zwykle trochę ułatwia zadanie.",
        en:"A 20/x symbol subtends 5′ × x/20 at your distance: <code>height = distance × tan(5′ × x / 20)</code>. Each level shows up to 5 symbols; it is passed at 3 correct and failed at 3 wrong. The result is the smallest passed level. 20/20 (6/6, 1.0) is so-called normal acuity. The page shows single symbols, not whole rows as on a chart, which usually makes the task a little easier."}},
  {id:p+"-lev", title:{pl:"Poziomy",en:"Levels"}, chips:[["list",null]],
   how:{pl:"Każdy pokazany poziom: liczba poprawnych odpowiedzi / pokazanych znaków.",en:"Each level shown: correct answers / symbols shown."}},
  {id:p+"-rt", title:{pl:"Czas odpowiedzi",en:"Response time"}, unit:U.ms_med, rows:[R_MEAN],
   how:{pl:"Od pokazania znaku do odpowiedzi.",en:"From showing a symbol to your answer."}},
  {id:p+"-cal", title:{pl:"Kalibracja",en:"Calibration"}, unit:{pl:"m od ekranu",en:"m from screen"},
   rows:[["ppm",{pl:"skala ekranu",en:"screen scale"}],["h20",{pl:"znak 20/20",en:"20/20 symbol"}]],
   how:{pl:"Skala pochodzi z dopasowania prostokąta do karty (85,6 mm), a odległość podajesz sam. Błąd kalibracji albo odległości przekłada się wprost na wynik: 10% za blisko to wynik o ok. 10% za dobry.",
        en:"The scale comes from matching the rectangle to a card (85.6 mm), and you enter the distance yourself. Calibration or distance errors go straight into the result: sitting 10% too close makes it about 10% too good."}}
];}
function snTask(mode){ const p = mode==="a" ? "sn-a" : "sn-b";
  const self = { tab:"wzrok", key: mode==="a" ? "snellen-litery" : "snellen-e", grid:"cards-"+p, sumId:"sum-"+p, R:null,
    title: mode==="a" ? {pl:"Tablica Snellena: litery",en:"Snellen chart: letters"} : {pl:"Tablica Snellena: obracane E",en:"Snellen chart: tumbling E"},
    specs: snSpecs(p) };
  self.render = R => {
    setMain(p+"-acu", R.best ? "20/"+R.best : `< 20/${R.startLevel}`);
    setRow(p+"-acu","metric", R.best ? snMetric(R.best) : "—"); setRow(p+"-acu","dec", R.best ? nf(20/R.best,2) : "—"); setRow(p+"-acu","start","20/"+R.startLevel);
    setHTML(p+"-lev","list", R.levels.map(l=>`<span class="chip ${l.pass?"ok":"no"}">20/${l.x} · ${l.ok}/${l.n} ${l.pass?"✓":"✗"}</span>`).join(""));
    setMain(p+"-rt", nf(median(R.rts))); setRow(p+"-rt","mean", ms(mean(R.rts)));
    setMain(p+"-cal", nf(R.distanceM,1)); setRow(p+"-cal","ppm", nf(R.pxPerMm,2)+" px/mm"); setRow(p+"-cal","h20", `${nf(R.h20mm,1)} mm · ${nf(R.h20px,1)} px`); };
  self.summary = R => { const what = mode==="a" ? (LANG==="pl"?"litery":"letters") : (LANG==="pl"?"znaki E":"E symbols");
    const lim = R.limited ? (LANG==="pl" ? " Ekran nie pokaże mniejszych znaków z tej odległości, więc wynik może być zaniżony; usiądź dalej i powtórz." : " The screen can't show smaller symbols at this distance, so the result may be underestimated; sit further away and repeat.") : "";
    if(LANG==="pl") return (R.best
      ? `<p>Z odległości ${nf(R.distanceM,1)} m najmniejsze ${what}, które rozpoznałeś (3 z 5), odpowiadają ostrości <strong>20/${R.best}</strong> (${snMetric(R.best)}, dziesiętnie ${nf(20/R.best,2)}). Dla porównania 20/20 to tzw. pełna ostrość.${lim}</p>`
      : `<p>Nie zaliczyłeś nawet poziomu startowego 20/${R.startLevel}. Sprawdź kalibrację i odległość.</p>`)
      + `<p><strong>To nie jest badanie wzroku.</strong> Wynik z ekranu jest przybliżony; jeśli masz wątpliwości co do wzroku, idź do optometrysty lub okulisty.</p>`;
    return (R.best
      ? `<p>From ${nf(R.distanceM,1)} m the smallest ${what} you recognised (3 of 5) correspond to <strong>20/${R.best}</strong> acuity (${snMetric(R.best)}, decimal ${nf(20/R.best,2)}). For comparison, 20/20 is so-called normal acuity.${lim}</p>`
      : `<p>You didn't pass even the starting level 20/${R.startLevel}. Check the calibration and distance.</p>`)
      + `<p><strong>This is not an eye test.</strong> A screen result is approximate; if you have any doubts about your eyesight, see an optometrist or ophthalmologist.</p>`; };
  return self;
}
const SnA = snTask("a"), SnB = snTask("b");

const SnRun = (() => {
  const A = new Arena("cv-sn"); let S=null, st=null;
  const ARROW = {right:"→", down:"↓", left:"←", up:"↑"};
  const opts = m => m==="a" ? [...SLOAN] : ["right","down","left","up"];
  const status = o => { st=o; $("st-sn").textContent = L(o)||""; };
  function answersUI(){ $("sn-answers").innerHTML = S
      ? opts(S.m).map(o=>`<button type="button" data-a="${o}">${S.m==="a"?o:ARROW[o]}</button>`).join("") + `<button type="button" data-a="?">${LANG==="pl"?"Nie widzę":"Can't see"}</button>`
      : ""; }
  function blank(){ A.fit(); const g=A.ctx; g.fillStyle="#fff"; g.fillRect(0,0,A.w,A.h); return g; }
  function idle(){ const g=blank(); g.fillStyle="#555"; g.font="15px "+css("--font-body"); g.textAlign="center"; g.textBaseline="middle";
    g.fillText(LANG==="pl"?"Skalibruj ekran powyżej i wybierz Start":"Calibrate the screen above and choose Start", A.w/2, A.h/2); }
  function draw(){ const g=blank(), h=S.lv[S.li].px, x=(A.w-h)/2, y=(A.h-h)/2;
    g.fillStyle="#000"; g.strokeStyle="#000"; if(S.m==="a") drawSloan(g,S.cur,x,y,h); else drawE(g,S.cur,x,y,h); }
  function start(m){ A.fit(); const ppm=Cal.ppm(), d=Cal.dist();
    const lv = SN_LEVELS.map(x => ({x, px:snMm(x,d)*ppm}));
    let li = lv.findIndex(l => l.px <= A.h*0.8); if(li<0) li=lv.length-1;
    S = {m, lv, li, startLi:li, k:0, ok:0, bad:0, res:[], rts:[], prev:null, cur:null, t0:0, d, ppm, limited:false};
    if(lv[li].px < 5){ S=null; status({pl:"Z tej odległości ekran nie pokaże nawet największych znaków poprawnie. Sprawdź kalibrację.",en:"At this distance the screen can't show even the largest symbols correctly. Check the calibration."}); return; }
    answersUI(); next(); }
  function next(){ const o=opts(S.m).filter(x=>x!==S.prev); S.cur=o[Math.floor(Math.random()*o.length)]; S.prev=S.cur; S.t0=performance.now(); draw();
    const x=S.lv[S.li].x; status({pl:`Poziom 20/${x} · znak ${S.k+1} z maks. 5 · odpowiadaj klawiaturą lub przyciskami`, en:`Level 20/${x} · symbol ${S.k+1} of max. 5 · answer with the keyboard or the buttons`}); }
  function answer(a){ if(!S) return; S.rts.push(performance.now()-S.t0);
    if(a===S.cur) S.ok++; else S.bad++; S.k++;
    if(S.ok>=3 || S.bad>=3){ const pass=S.ok>=3; S.res.push({x:S.lv[S.li].x, ok:S.ok, n:S.k, pass});
      if(!pass) return finish();
      const ni=S.li+1; if(ni>=S.lv.length) return finish();
      if(S.lv[ni].px < 5){ S.limited=true; return finish(); }
      S.li=ni; S.k=0; S.ok=0; S.bad=0; }
    next(); }
  function finish(){ const passed=S.res.filter(r=>r.pass), task = S.m==="a" ? SnA : SnB;
    task.R = { mode:S.m, distanceM:S.d, pxPerMm:S.ppm, best: passed.length ? passed[passed.length-1].x : null, startLevel:S.lv[S.startLi].x,
      levels:S.res, limited:S.limited, rts:S.rts, h20mm:snMm(20,S.d), h20px:snMm(20,S.d)*S.ppm };
    S=null; answersUI(); task.render(task.R); setSummary(task); markDone("wzrok"); status({pl:"Gotowe. Wynik poniżej.",en:"Done. Result below."}); idle(); }
  $("sn-go-a").addEventListener("click", () => start("a"));
  $("sn-go-b").addEventListener("click", () => start("b"));
  $("sn-answers").addEventListener("click", e => { const b=e.target.closest("button[data-a]"); if(b) answer(b.dataset.a); });
  document.addEventListener("keydown", e => {
    if(!S || $("tab-wzrok").hidden || /^(INPUT|TEXTAREA)$/.test(document.activeElement && document.activeElement.tagName)) return;
    const k=e.key;
    if(S.m==="a" && k.length===1 && /[a-z]/i.test(k)){ e.preventDefault(); answer(k.toUpperCase()); }
    else if(S.m==="b"){ const m={ArrowRight:"right",ArrowLeft:"left",ArrowUp:"up",ArrowDown:"down"}[k]; if(m){ e.preventDefault(); answer(m); } }
  });
  return { show(){ if(S) draw(); else idle(); }, onLang(){ status(st); answersUI(); if(!S) idle(); } };
})();

// Tablice barwne w stylu Ishihary — generowane na nowo przy każdym starcie
const Plates = (() => {
  const A = new Arena("cv-ish"), N=6, inp=$("ish-input");
  const NUMS = [2,3,5,6,7,8,9,15,16,26,29,35,42,45,57,73,74,96,97];
  let S=null, st=null;
  const self = { tab:"wzrok", key:"tablice-barwne", grid:"cards-ish", sumId:"sum-ish", R:null, title:{pl:"Tablice barwne",en:"Colour plates"}, specs:[
    {id:"ish-score", title:{pl:"Rozpoznane tablice",en:"Plates read"}, unit:{pl:`z ${N} testowych`,en:`of ${N} test plates`},
     rows:[["demo",{pl:"tablica pokazowa",en:"demonstration plate"}]],
     how:{pl:"Każda tablica jest generowana na nowo: losowo rozmieszczone kropki różnej wielkości. Kropki liczby mają odcienie pomarańczowo-czerwone, tło jest zielono-oliwkowe, a jasność obu grup losuję z tego samego zakresu, więc liczbę odróżnia tylko odcień. To pary barw, które osoby z najczęstszymi zaburzeniami widzenia barw (czerwono-zielonymi) odbierają jako podobne. Pierwsza tablica jest pokazowa: ciemna liczba na jasnym tle, którą powinien przeczytać każdy.",
          en:"Every plate is generated fresh: randomly placed dots of different sizes. The number's dots are orange-red, the background is green-olive, and the lightness of both groups is drawn from the same range, so only hue separates the number. These are colour pairs that people with the most common (red-green) colour vision deficiencies see as similar. The first plate is a demonstration: a dark number on a light background that everyone should read."}},
    {id:"ish-list", title:{pl:"Tablice",en:"Plates"}, chips:[["list",null]],
     how:{pl:"Pokazana liczba → Twoja odpowiedź. „—” oznacza „nie widzę liczby”.",en:"Number shown → your answer. “—” means “I can't see a number”."}},
    {id:"ish-rt", title:{pl:"Czas odpowiedzi",en:"Response time"}, unit:U.ms_med, rows:[R_MEAN],
     how:{pl:"Od pokazania tablicy do zatwierdzenia odpowiedzi.",en:"From showing a plate to submitting your answer."}}
  ]};
  const status = o => { st=o; $("st-ish").textContent = L(o)||""; };
  const rnd = (a,b) => a + Math.random()*(b-a);
  function plate(num, demo){
    A.fit(); const g=A.ctx, W=A.w, cx=W/2, cy=W/2, R=W/2-3, sc=W/380;
    g.clearRect(0,0,W,W); g.fillStyle="#f3eee4"; g.beginPath(); g.arc(cx,cy,R,0,2*Math.PI); g.fill();
    const m=document.createElement("canvas"); m.width=m.height=Math.ceil(W); const mg=m.getContext("2d");
    mg.font=`700 ${Math.round(W*(String(num).length>1?0.46:0.56))}px ${css("--font-body")}`; mg.textAlign="center"; mg.textBaseline="middle";
    mg.fillText(String(num), W/2, W/2+W*0.02); const md=mg.getImageData(0,0,m.width,m.height).data;
    const inFig = (x,y) => { const xi=Math.round(x), yi=Math.round(y); return xi>=0 && yi>=0 && xi<m.width && yi<m.height && md[(yi*m.width+xi)*4+3]>110; };
    const CELL=20*sc, grid=new Map(), dots=[], key=(i,j)=>i+","+j;
    for(let t=0; t<40000 && dots.length<2600; t++){
      const r=(2.4+Math.random()*Math.random()*7.5)*sc, a=Math.random()*2*Math.PI, rr=Math.sqrt(Math.random())*(R-r-2);
      const x=cx+rr*Math.cos(a), y=cy+rr*Math.sin(a), ci=Math.floor(x/CELL), cj=Math.floor(y/CELL);
      let ok=true;
      for(let i=ci-1;i<=ci+1&&ok;i++) for(let j=cj-1;j<=cj+1&&ok;j++){ const c=grid.get(key(i,j)); if(c) for(const d of c) if(Math.hypot(d.x-x,d.y-y) < d.r+r+1.2*sc){ ok=false; break; } }
      if(!ok) continue;
      const d={x,y,r}; dots.push(d); const k=key(ci,cj); if(!grid.has(k)) grid.set(k,[]); grid.get(k).push(d);
    }
    for(const d of dots){
      const fig = inFig(d.x,d.y);
      let col;
      if(demo) col = fig ? `hsl(220 22% ${rnd(28,38)}%)` : `hsl(${rnd(32,46)} 70% ${rnd(62,74)}%)`;
      else col = fig ? `hsl(${rnd(12,30)} ${rnd(52,66)}% ${rnd(48,64)}%)` : `hsl(${rnd(72,98)} ${rnd(28,42)}% ${rnd(48,64)}%)`;
      g.fillStyle=col; g.beginPath(); g.arc(d.x,d.y,d.r,0,2*Math.PI); g.fill();
    }
  }
  function idle(){ A.fit(); if(!A.w) return; const g=A.ctx, W=A.w; g.clearRect(0,0,W,W); g.fillStyle=css("--bg"); g.beginPath(); g.arc(W/2,W/2,W/2-3,0,2*Math.PI); g.fill();
    g.fillStyle=css("--muted"); g.font="14px "+css("--font-body"); g.textAlign="center"; g.textBaseline="middle"; g.fillText(LANG==="pl"?"Kliknij „Start”":"Click “Start”", W/2, W/2); }
  const setForm = on => { inp.disabled=!on; $("ish-ok").disabled=!on; $("ish-none").disabled=!on; if(on){ inp.value=""; inp.focus(); } };
  function start(){
    const pool=[...NUMS].sort(()=>Math.random()-0.5);
    S = { plates:[{num:12, demo:true}, ...pool.slice(0,N).map(n=>({num:n, demo:false}))], i:0, ans:[], t0:0 };
    show(); }
  function show(){ const p=S.plates[S.i]; plate(p.num, p.demo); S.t0=performance.now(); setForm(true);
    status(p.demo ? {pl:`Tablica 1 z ${S.plates.length} (pokazowa): jaką liczbę widzisz?`,en:`Plate 1 of ${S.plates.length} (demonstration): what number do you see?`}
                  : {pl:`Tablica ${S.i+1} z ${S.plates.length}: jaką liczbę widzisz?`,en:`Plate ${S.i+1} of ${S.plates.length}: what number do you see?`}); }
  function submit(a){ if(!S) return; const p=S.plates[S.i];
    S.ans.push({ demo:p.demo, shown:p.num, answer:a, correct:a===String(p.num), rt:performance.now()-S.t0 });
    S.i++; if(S.i<S.plates.length) return show();
    const test=S.ans.filter(x=>!x.demo);
    self.R = { plates:S.ans, testCorrect:test.filter(x=>x.correct).length, testN:test.length, demoCorrect:S.ans[0].correct, rts:S.ans.map(x=>x.rt) };
    S=null; setForm(false); idle(); self.render(self.R); setSummary(self); markDone("wzrok"); status({pl:"Gotowe. Wynik poniżej.",en:"Done. Result below."}); }
  $("ish-go").addEventListener("click", start);
  $("ish-ok").addEventListener("click", () => submit(inp.value.trim()));
  $("ish-none").addEventListener("click", () => submit(""));
  inp.addEventListener("keydown", e => { if(e.key==="Enter"){ e.preventDefault(); submit(inp.value.trim()); } });
  self.render = R => {
    setMain("ish-score", R.testCorrect); setRow("ish-score","demo", R.demoCorrect ? (LANG==="pl"?"odczytana":"read") : (LANG==="pl"?"nieodczytana":"not read"));
    setHTML("ish-list","list", R.plates.map(x=>`<span class="chip ${x.correct?"ok":"no"}">${x.demo?(LANG==="pl"?"pokaz ":"demo "):""}${x.shown} → ${x.answer===""?"—":esc(x.answer)} ${x.correct?"✓":"✗"}</span>`).join(""));
    setMain("ish-rt", nf(median(R.rts))); setRow("ish-rt","mean", ms(mean(R.rts))); };
  self.summary = R => LANG==="pl"
    ? `<p>Odczytałeś <strong>${R.testCorrect} z ${R.testN}</strong> tablic testowych.${R.demoCorrect ? "" : " Nie odczytałeś tablicy pokazowej, którą powinien widzieć każdy, więc wynik jest niewiarygodny: sprawdź jasność, tryb nocny i kolory ekranu."}</p><p><strong>To nie jest badanie widzenia barw.</strong> Tablice są generowane przez stronę, nie są oryginalnymi tablicami Ishihary i nie zostały sprawdzone na osobach z zaburzeniami widzenia barw, a kolory na ekranie różnią się od drukowanych. Jeśli chcesz rzetelnie sprawdzić widzenie barw, zrób to u okulisty lub optometrysty.</p>`
    : `<p>You read <strong>${R.testCorrect} of ${R.testN}</strong> test plates.${R.demoCorrect ? "" : " You didn't read the demonstration plate that everyone should see, so the result is unreliable: check brightness, night mode and screen colours."}</p><p><strong>This is not a colour vision test.</strong> The plates are generated by the page, are not original Ishihara plates and have not been checked with people who have colour vision deficiencies, and screen colours differ from printed ones. For a reliable colour vision check, see an ophthalmologist or optometrist.</p>`;
  self.show = () => { if(!S) idle(); };
  self.onLang = () => { status(st); if(!S) idle(); };
  return self;
})();

// =====================================================================
// PODPIS MYSZKĄ — 3 podpisy jako wzorzec, potem weryfikacja (kształt, tempo, rytm)
// =====================================================================
const Sig = (() => { const N=3, TH=2, RS=64, BINS=16;
  const A=new Arena("cv-sig"); let P, cur, st=null, drawing=false, overlay=null;
  const self = { tab:"podpis", key:"podpis", grid:"cards-sig", sumId:"sum-sig", R:null, title:{pl:"Podpis myszką",en:"Mouse signature"}, specs:[
    {id:"sig-last", title:{pl:"Ostatnia weryfikacja",en:"Last verification"}, unit:{pl:`wynik (próg ${TH})`,en:`score (threshold ${TH})`},
     rows:[["ver",{pl:"werdykt",en:"verdict"}],["shape",{pl:"kształt",en:"shape"}],["tempo",{pl:"tempo",en:"tempo"}],["rhythm",{pl:"rytm",en:"rhythm"}]],
     how:{pl:`Każdy z trzech wskaźników mówi, ile razy podpis różni się od wzorców bardziej niż Twoje wzorce różnią się między sobą (1 = tak samo jak zwykle). <b>Kształt</b>: podpis przesuwam do środka, skaluję do tej samej wielkości, próbkuję w ${RS} punktach i porównuję algorytmem DTW (dopasowanie dynamiczne, które wybacza drobne przesunięcia w czasie). <b>Tempo</b>: różnica logarytmu czasu podpisu od średniej wzorców, w jednostkach ich rozrzutu (min. 8%). <b>Rytm</b>: profil prędkości w ${BINS} odcinkach czasu, porównany korelacją. Wynik = średnia trzech wskaźników; podpis jest zgodny, gdy wynik ≤ ${TH}.`,
          en:`Each of the three measures says how many times more the signature differs from your templates than your templates differ from each other (1 = as usual). <b>Shape</b>: the signature is centred, scaled to the same size, resampled to ${RS} points and compared with DTW (dynamic time warping, which forgives small timing shifts). <b>Tempo</b>: difference of the log of signing time from the templates' mean, in units of their spread (min. 8%). <b>Rhythm</b>: speed profile over ${BINS} time slices, compared by correlation. Score = mean of the three; the signature matches when score ≤ ${TH}.`}},
    {id:"sig-tests", title:{pl:"Weryfikacje",en:"Verifications"}, unit:{pl:"zgodnych",en:"matching"},
     rows:[["all",{pl:"wszystkich",en:"total"}],["rej",{pl:"odrzuconych",en:"rejected"}]],
     how:{pl:"Daj podpisać się komuś innemu, kto widział Twój podpis, i sprawdź, czy zostanie odrzucony. Nawet dobra kopia kształtu zwykle różni się tempem i rytmem.",
          en:"Let someone who has seen your signature try to copy it and check whether they get rejected. Even a good copy of the shape usually differs in tempo and rhythm."}},
    {id:"sig-ref", title:{pl:"Twoje wzorce",en:"Your templates"}, unit:{pl:"podpisy",en:"signatures"},
     rows:[["dur",{pl:"średni czas",en:"mean time"}],["strokes",{pl:"kresek (średnio)",en:"strokes (mean)"}],["rs",{pl:"rozrzut kształtu (DTW)",en:"shape spread (DTW)"}],["rt",{pl:"rozrzut tempa",en:"tempo spread"}]],
     how:{pl:"Kreska to fragment narysowany bez puszczania przycisku. Rozrzut kształtu to średnia odległość DTW między parami wzorców (w jednostkach rozmiaru podpisu), rozrzut tempa to odchylenie standardowe logarytmu czasu.",
          en:"A stroke is a part drawn without releasing the button. Shape spread is the mean DTW distance between pairs of templates (in signature-size units); tempo spread is the standard deviation of the log of signing time."}}
  ]};
  const status = o => { st=o; $("st-sig").textContent = L(o)||""; };
  const fresh = () => { cur={strokes:[]}; overlay=null; };
  function feats(sig){
    const pts=sig.strokes.flat(); const t0=pts[0].t, dur=pts[pts.length-1].t-t0;
    let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity; for(const p of pts){ x0=Math.min(x0,p.x); x1=Math.max(x1,p.x); y0=Math.min(y0,p.y); y1=Math.max(y1,p.y); }
    const sc=Math.max(x1-x0,y1-y0)||1, mx=mean(pts.map(p=>p.x)), my=mean(pts.map(p=>p.y));
    const n=pts.map(p=>({x:(p.x-mx)/sc, y:(p.y-my)/sc, t:p.t-t0}));
    const cum=[0]; for(let i=1;i<n.length;i++) cum.push(cum[i-1]+Math.hypot(n[i].x-n[i-1].x,n[i].y-n[i-1].y));
    const total=cum[cum.length-1]||1, res=[]; let j=0;
    for(let k=0;k<RS;k++){ const d=total*k/(RS-1); while(j<cum.length-2 && cum[j+1]<d) j++; const seg=(cum[j+1]-cum[j])||1, f=Math.min(1,Math.max(0,(d-cum[j])/seg));
      res.push({x:n[j].x+f*((n[j+1]||n[j]).x-n[j].x), y:n[j].y+f*((n[j+1]||n[j]).y-n[j].y)}); }
    const prof=new Array(BINS).fill(0), cnt=new Array(BINS).fill(0);
    for(let i=1;i<n.length;i++){ const dt=n[i].t-n[i-1].t; if(dt<=0) continue; const b=Math.min(BINS-1,Math.floor(BINS*n[i].t/(dur||1)));
      prof[b]+=Math.hypot(n[i].x-n[i-1].x,n[i].y-n[i-1].y)/dt; cnt[b]++; }
    for(let b=0;b<BINS;b++) prof[b]=cnt[b]?prof[b]/cnt[b]:0;
    return { res, prof, dur, strokes:sig.strokes.length, box:{x0,y0,x1,y1,sc,mx,my} };
  }
  function dtw(a,b){ const n=a.length, m=b.length, D=new Float64Array((n+1)*(m+1)).fill(Infinity); D[0]=0;
    for(let i=1;i<=n;i++) for(let j=1;j<=m;j++){ const c=Math.hypot(a[i-1].x-b[j-1].x,a[i-1].y-b[j-1].y);
      D[i*(m+1)+j]=c+Math.min(D[(i-1)*(m+1)+j],D[i*(m+1)+j-1],D[(i-1)*(m+1)+j-1]); }
    return D[n*(m+1)+m]/n; }
  const corrDist = (p,q) => { const mp=mean(p), mq=mean(q); let s=0,a=0,b=0; for(let i=0;i<p.length;i++){ s+=(p[i]-mp)*(q[i]-mq); a+=(p[i]-mp)**2; b+=(q[i]-mq)**2; } return (a&&b) ? 1-s/Math.sqrt(a*b) : 1; };
  const pairs = arr => { const o=[]; for(let i=0;i<arr.length;i++) for(let j=i+1;j<arr.length;j++) o.push([arr[i],arr[j]]); return o; };
  function ref(){ const E=P.enroll;
    return { rS:Math.max(0.02, mean(pairs(E).map(([a,b])=>dtw(a.res,b.res)))), rR:Math.max(0.05, mean(pairs(E).map(([a,b])=>corrDist(a.prof,b.prof)))),
             mu:mean(E.map(e=>Math.log(e.dur))), sT:Math.max(0.08, sd(E.map(e=>Math.log(e.dur)))) }; }
  function compare(f){ const E=P.enroll, r=ref();
    const ds=E.map(e=>dtw(f.res,e.res)), shape=mean(ds)/r.rS, tempo=Math.abs(Math.log(f.dur)-r.mu)/r.sT, rhythm=mean(E.map(e=>corrDist(f.prof,e.prof)))/r.rR;
    const score=(shape+tempo+rhythm)/3; return { score, shape, tempo, rhythm, ok:score<=TH, best:ds.indexOf(Math.min(...ds)), dur:f.dur, strokes:f.strokes }; }

  function draw(){ A.fit(); if(!A.w) return; const g=A.ctx; A.clear();
    g.strokeStyle=css("--line"); g.lineWidth=1; g.setLineDash([5,5]); g.beginPath(); g.moveTo(30,A.h*0.72); g.lineTo(A.w-30,A.h*0.72); g.stroke(); g.setLineDash([]);
    g.lineCap="round"; g.lineJoin="round";
    if(overlay){ const e=overlay.e, b=overlay.box; g.strokeStyle=css("--muted"); g.globalAlpha=0.55; g.lineWidth=2; g.beginPath();
      e.res.forEach((p,i)=>{ const x=b.mx+p.x*b.sc, y=b.my+p.y*b.sc; if(i) g.lineTo(x,y); else g.moveTo(x,y); }); g.stroke(); g.globalAlpha=1; }
    g.strokeStyle=css("--accent"); g.lineWidth=2.5;
    for(const s of cur.strokes){ g.beginPath(); s.forEach((p,i)=> i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y)); if(s.length===1) g.arc(s[0].x,s[0].y,1,0,7); g.stroke(); }
    if(!cur.strokes.length && !overlay) A.label(LANG==="pl"?"Podpisz się tutaj, trzymając wciśnięty przycisk myszy":"Sign here while holding the mouse button", A.h*0.4);
  }
  function steps(){
    $("sig-steps").innerHTML = Array.from({length:N},(_,i)=>`<span class="${i<P.enroll.length?"ok":(i===P.enroll.length?"now":"")}">${i+1}</span>`).join("")
      + `<span class="${P.enroll.length>=N?"now":""}">${LANG==="pl"?"weryfikacja":"verify"}</span>`;
    $("sig-history").innerHTML = P.tests.map((t,i)=>`<span class="chip ${t.ok?"ok":"no"}">#${i+1} ${nf(t.score,2)} ${t.ok?"✓":"✗"}</span>`).join("");
  }
  const prompt = () => status(P.enroll.length<N
    ? {pl:`Wzorzec ${P.enroll.length+1} z ${N}: podpisz się i kliknij „Zatwierdź”.`,en:`Template ${P.enroll.length+1} of ${N}: sign and click “Submit”.`}
    : {pl:"Weryfikacja: podpisz się (albo daj spróbować komuś innemu) i kliknij „Zatwierdź”.",en:"Verification: sign (or let someone else try) and click “Submit”."});
  A.c.addEventListener("pointerdown", e => { e.preventDefault(); if(overlay){ overlay=null; cur={strokes:[]}; }
    const p=A.pos(e); cur.strokes.push([p]); drawing=true; try{ A.c.setPointerCapture(e.pointerId); }catch(_){} draw(); });
  A.c.addEventListener("pointermove", e => { if(!drawing) return; cur.strokes[cur.strokes.length-1].push(...A.moves(e)); draw(); });
  A.c.addEventListener("pointerup", () => { drawing=false; });
  A.c.addEventListener("contextmenu", e => e.preventDefault());
  $("sig-clear").addEventListener("click", () => { fresh(); draw(); prompt(); });
  $("sig-reset").addEventListener("click", () => { P={enroll:[], tests:[]}; self.R=null; fresh();
    const tab=document.querySelector('#tabs a[data-tab="podpis"]'); if(tab) tab.classList.remove("done");
    buildCards(self.grid,self.specs); setSummary(self); renderResults(); steps(); prompt(); draw(); });
  $("sig-ok").addEventListener("click", () => {
    const pts=cur.strokes.flat();
    if(pts.length<20 || overlay){ status({pl:"Za krótki podpis. Podpisz się jeszcze raz.",en:"Signature too short. Sign again."}); fresh(); draw(); return; }
    const f=feats(cur);
    if(P.enroll.length<N){ P.enroll.push(f); fresh(); if(P.enroll.length===N){ update(); status({pl:"Wzorce gotowe. Teraz podpisz się jeszcze raz do weryfikacji.",en:"Templates ready. Now sign again to verify."}); } else prompt(); }
    else { const c=compare(f); P.tests.push(c); overlay={e:P.enroll[c.best], box:f.box}; update();
      status(c.ok ? {pl:`Zgodny z wzorcem (wynik ${nf(c.score,2)}). Szary ślad to najbliższy wzorzec.`,en:`Matches the templates (score ${nf(c.score,2)}). The grey trace is the closest template.`}
                  : {pl:`Niezgodny z wzorcem (wynik ${nf(c.score,2)}). Szary ślad to najbliższy wzorzec.`,en:`Does not match (score ${nf(c.score,2)}). The grey trace is the closest template.`}); }
    steps(); draw(); });
  function update(){ const r=ref(), E=P.enroll;
    self.R = { templates:E.map(e=>({durationMs:e.dur, strokes:e.strokes})), shapeSpread:r.rS, tempoSpread:r.sT, rhythmSpread:r.rR, threshold:TH,
      tests:P.tests.map(t=>({score:t.score, shape:t.shape, tempo:t.tempo, rhythm:t.rhythm, match:t.ok, durationMs:t.dur, strokes:t.strokes})) };
    self.render(self.R); setSummary(self); markDone("podpis"); }
  self.render = R => { const l=R.tests[R.tests.length-1], acc=R.tests.filter(t=>t.match).length;
    setMain("sig-last", l?nf(l.score,2):"—"); setRow("sig-last","ver", l?(l.match?(LANG==="pl"?"zgodny":"match"):(LANG==="pl"?"niezgodny":"no match")):"—");
    setRow("sig-last","shape", l?nf(l.shape,2)+"×":"—"); setRow("sig-last","tempo", l?nf(l.tempo,2)+"×":"—"); setRow("sig-last","rhythm", l?nf(l.rhythm,2)+"×":"—");
    setMain("sig-tests", acc); setRow("sig-tests","all", R.tests.length); setRow("sig-tests","rej", R.tests.length-acc);
    setMain("sig-ref", R.templates.length); setRow("sig-ref","dur", nf(mean(R.templates.map(t=>t.durationMs))/1000,2)+" s");
    setRow("sig-ref","strokes", nf(mean(R.templates.map(t=>t.strokes)),1)); setRow("sig-ref","rs", nf(R.shapeSpread,3)); setRow("sig-ref","rt", pct(R.tempoSpread)); };
  self.summary = R => { const l=R.tests[R.tests.length-1], acc=R.tests.filter(t=>t.match).length;
    if(LANG==="pl") return `<p>Wzorzec powstał z ${R.templates.length} podpisów (średnio ${nf(mean(R.templates.map(t=>t.durationMs))/1000,2)} s).</p>`
      + (l ? `<p>Ostatni podpis: wynik <strong>${nf(l.score,2)}</strong> przy progu ${TH}, więc jest <strong>${l.match?"zgodny":"niezgodny"}</strong> z wzorcem. Zgodnych weryfikacji: ${acc} z ${R.tests.length}.</p>` : "<p>Nie było jeszcze weryfikacji.</p>");
    return `<p>The template was built from ${R.templates.length} signatures (mean ${nf(mean(R.templates.map(t=>t.durationMs))/1000,2)} s).</p>`
      + (l ? `<p>Last signature: score <strong>${nf(l.score,2)}</strong> with threshold ${TH}, so it <strong>${l.match?"matches":"does not match"}</strong> the template. Matching verifications: ${acc} of ${R.tests.length}.</p>` : "<p>No verification yet.</p>"); };
  P={enroll:[], tests:[]}; fresh();
  SHOW.podpis = () => { steps(); if(!st) prompt(); draw(); };
  LANGHOOKS.push(() => { steps(); status(st); draw(); });
  return self;
})();

// =====================================================================
// CZŁOWIEK CZY BOT — cechy ruchu myszki, po których zabezpieczenia odróżniają ludzi od skryptów
// =====================================================================
const Bot = (() => { const N=5, RAD=22;
  const A=new Arena("cv-bot"); let S=null, st=null, human=null, bot=null, anim=null;
  const SIGNS = [
    ["straight", {pl:"prostoliniowość",en:"straightness"}, v=>v>0.995, ">0,995"],
    ["speedCV",  {pl:"zmienność prędkości (CV)",en:"speed variability (CV)"}, v=>v<0.15, "<0,15"],
    ["tremor",   {pl:"drżenie",en:"tremor"}, v=>v<0.15, "<0,15 px"],
    ["offset",   {pl:"odległość kliknięcia od środka",en:"click distance from centre"}, v=>v<1, "<1 px"],
    ["hold",     {pl:"przytrzymanie przycisku",en:"button hold"}, v=>v<5, "<5 ms"]
  ];
  const fmt = (k,v) => !Number.isFinite(v) ? "—" : k==="straight"||k==="speedCV" ? nf(v,3) : k==="hold" ? ms(v) : px(v,2);
  const self = { tab:"bot", key:"czlowiek-czy-bot", grid:"cards-bot", sumId:"sum-bot", R:null, title:{pl:"Człowiek czy bot",en:"Human or bot"}, specs:[
    {id:"bot-v", title:{pl:"Oznaki bota",en:"Bot signs"}, unit:{pl:`z ${SIGNS.length} (Ty)`,en:`of ${SIGNS.length} (you)`}, rows:[["bot",{pl:"bot",en:"bot"}],["ver",{pl:"werdykt dla Ciebie",en:"verdict for you"}]],
     how:{pl:"Każda miara ma próg, poniżej lub powyżej którego ruch wygląda „nieludzko”. Werdykt „bot” zapada przy co najmniej 3 oznakach. Prawdziwe systemy (np. zabezpieczenia logowania) łączą dziesiątki takich cech i uczą się na milionach sesji, a do tego sprawdzają przeglądarkę, sieć i historię; ta zakładka pokazuje tylko zasadę.",
          en:"Each measure has a threshold beyond which movement looks “inhuman”. The verdict is “bot” with at least 3 signs. Real systems (e.g. login protection) combine dozens of such features learned from millions of sessions and also check the browser, network and history; this tab only shows the principle."}},
    {id:"bot-m", title:{pl:"Ty kontra bot",en:"You vs bot"}, rows:SIGNS.map(([k,l])=>[k,l]),
     how:{pl:"Średnie z 5 ruchów: prostoliniowość = odległość prosta ÷ długość drogi; zmienność prędkości = odchylenie ÷ średnia prędkości między kolejnymi próbkami (człowiek przyspiesza i zwalnia, prosty bot jedzie równo); drżenie = odchylenie punktów od średniej z 7 sąsiednich; odległość kliknięcia od środka celu; czas trzymania przycisku. Format: Ty / bot.",
          en:"Means over 5 movements: straightness = straight distance ÷ path length; speed variability = std ÷ mean of speed between samples (people accelerate and slow down, a simple bot moves evenly); tremor = points' offset from the mean of 7 neighbours; click distance from the target centre; button hold time. Format: you / bot."}}
  ]};
  const status = o => { st=o; $("st-bot").textContent = L(o)||""; };
  function metrics(trials){
    const per = trials.map(t => {
      const pts=t.path, D=hyp(t.to.x,t.to.y,t.from.x,t.from.y), len=pathLen(pts);
      const v=[]; for(let i=1;i<pts.length;i++){ const dt=pts[i].t-pts[i-1].t; if(dt>0) v.push(hyp(pts[i].x,pts[i].y,pts[i-1].x,pts[i-1].y)/dt); }
      return { straight: len>0 ? Math.min(1,D/len) : 1, speedCV: sd(v)/mean(v), tremor: tremorRMS([pts]), offset: hyp(t.click.x,t.click.y,t.tx,t.ty), hold: t.hold };
    });
    const m={}; SIGNS.forEach(([k])=>m[k]=mean(per.map(p=>p[k]).filter(Number.isFinite)));
    m.signs = SIGNS.filter(([k,,f])=>f(m[k])).length; return m;
  }
  function target(from){ let p,k=0; do{ p=A.rnd(RAD+20); k++; } while(hyp(p.x,p.y,from.x,from.y)<250 && k<200); return p; }
  function draw(cursor){ A.fit(); if(!A.w) return; A.clear();
    if(S && S.cur){ A.dot(S.cur.from.x,S.cur.from.y,RAD,css("--muted"),!S.cur.started,2); if(S.cur.started) A.dot(S.cur.tx,S.cur.ty,RAD,css("--accent")); }
    if(cursor){ const g=A.ctx; g.fillStyle=css("--err"); g.beginPath(); g.moveTo(cursor.x,cursor.y); g.lineTo(cursor.x,cursor.y+18); g.lineTo(cursor.x+5,cursor.y+13); g.lineTo(cursor.x+12,cursor.y+13); g.closePath(); g.fill(); }
    if(!S) A.label(LANG==="pl"?"Kliknij „Start” i rób to, co zwykle: klikaj kółka":"Click “Start” and just click the circles as usual");
  }
  function newTrial(){ const from={x:A.w*0.15+Math.random()*A.w*0.1, y:A.h*(0.25+Math.random()*0.5)}, t=target(from);
    S.cur={from, tx:t.x, ty:t.y, to:t, path:[], started:false}; draw();
    status({pl:`Ruch ${S.trials.length+1} z ${N}: kliknij szare kółko, potem niebieskie.`,en:`Movement ${S.trials.length+1} of ${N}: click the grey circle, then the blue one.`}); }
  A.c.addEventListener("pointerdown", e => { if(!S||!S.cur||anim) return; e.preventDefault(); const p=A.pos(e), c=S.cur;
    if(!c.started){ if(hyp(p.x,p.y,c.from.x,c.from.y)<=RAD){ c.started=true; c.path=[p]; draw(); } return; }
    if(hyp(p.x,p.y,c.tx,c.ty)<=RAD){ c.click=p; c.down=p.t; } });
  A.c.addEventListener("pointermove", e => { if(S && S.cur && S.cur.started && !S.cur.click) S.cur.path.push(...A.moves(e)); });
  A.c.addEventListener("pointerup", e => { if(!S||!S.cur||!S.cur.click) return; const c=S.cur; c.hold=A.pos(e).t-c.down; c.path.push(c.click);
    S.trials.push(c); if(S.trials.length<N) newTrial(); else { human=metrics(S.trials); S=null; done(); draw();
      status({pl:"Gotowe. Teraz kliknij „Puść bota” i porównaj.",en:"Done. Now click “Release the bot” and compare."}); } });
  A.c.addEventListener("contextmenu", e => e.preventDefault());
  $("bot-go").addEventListener("click", () => { if(anim) return; A.fit(); S={trials:[]}; newTrial(); });
  // Bot: idealnie prosta linia, stała prędkość, próbki co 16 ms, kliknięcie dokładnie w środek, bez przytrzymania
  $("bot-run").addEventListener("click", () => { if(anim) return; A.fit(); S={trials:[]};
    const trials=[]; let k=0;
    const one = () => { if(k>=N){ bot=metrics(trials); S=null; anim=null; done(); draw(); status({pl:"Bot skończył. Porównanie poniżej.",en:"The bot is done. Comparison below."}); return; }
      const from={x:A.w*0.15+Math.random()*A.w*0.1, y:A.h*(0.25+Math.random()*0.5)}, t=target(from);
      S.cur={from, tx:t.x, ty:t.y, to:t, started:true}; const D=hyp(t.x,t.y,from.x,from.y), steps=Math.max(2,Math.round(D/9)), path=[];
      for(let i=0;i<=steps;i++) path.push({x:from.x+(t.x-from.x)*i/steps, y:from.y+(t.y-from.y)*i/steps, t:i*16});
      let i=0; status({pl:`Bot: ruch ${k+1} z ${N}`,en:`Bot: movement ${k+1} of ${N}`});
      anim = setInterval(() => { draw(path[i]); i++; if(i>path.length-1){ clearInterval(anim);
        trials.push({from, to:t, tx:t.x, ty:t.y, path, click:{x:t.x,y:t.y}, hold:0}); k++; setTimeout(one, 250); } }, 16); };
    one(); });
  function done(){ const R = { human, bot, thresholds:Object.fromEntries(SIGNS.map(([k,,,th])=>[k,th])) }; self.render(R); if(human){ self.R=R; setSummary(self); markDone("bot"); } }
  self.render = R => { const h=R.human||{}, b=R.bot||{};
    setMain("bot-v", R.human ? h.signs : "—"); setRow("bot-v","bot", R.bot ? `${b.signs} / ${SIGNS.length}` : (LANG==="pl"?"jeszcze nie puszczony":"not released yet"));
    setRow("bot-v","ver", R.human ? (h.signs>=3 ? (LANG==="pl"?"wyglądasz na bota":"you look like a bot") : (LANG==="pl"?"wyglądasz na człowieka":"you look human")) : "—");
    SIGNS.forEach(([k,,f,th]) => setRow("bot-m",k, `${fmt(k,h[k])} / ${fmt(k,b[k])}  (${LANG==="pl"?"bot":"bot"} ${th})`)); };
  self.summary = R => { const h=R.human, b=R.bot;
    if(LANG==="pl") return `<p>Twój ruch ma <strong>${h.signs} z ${SIGNS.length}</strong> oznak bota, więc ${h.signs>=3?"<strong>wygląda na bota</strong> (ciekawe!)":"<strong>wygląda na ludzki</strong>"}.`
      + (b ? ` Bot ma ${b.signs} z ${SIGNS.length}: jedzie idealnie prosto i równo, klika dokładnie w środek i nie trzyma przycisku.</p>` : ` Kliknij „Puść bota”, żeby porównać.</p>`)
      + `<p>Sprytniejsze boty dodają losowe drgania i krzywe przyspieszenia, dlatego prawdziwe zabezpieczenia patrzą na wiele cech naraz.</p>`;
    return `<p>Your movement shows <strong>${h.signs} of ${SIGNS.length}</strong> bot signs, so it ${h.signs>=3?"<strong>looks like a bot</strong> (interesting!)":"<strong>looks human</strong>"}.`
      + (b ? ` The bot shows ${b.signs} of ${SIGNS.length}: it moves perfectly straight and evenly, clicks the exact centre and doesn't hold the button.</p>` : ` Click “Release the bot” to compare.</p>`)
      + `<p>Smarter bots add random jitter and acceleration curves, which is why real protection looks at many features at once.</p>`; };
  SHOW.bot = () => draw();
  LEAVE.bot = () => { if(S && !anim){ S=null; } };
  LANGHOOKS.push(() => { status(st); if(!anim) draw(); });
  return self;
})();

// =====================================================================
// ODCISK PRZEGLĄDARKI — co strona wie bez pytania; liczone lokalnie, nic nie jest wysyłane
// =====================================================================
const FP = (() => {
  const cyrb = (str, seed=0) => { let h1=0xdeadbeef^seed, h2=0x41c6ce57^seed;
    for(let i=0;i<str.length;i++){ const c=str.charCodeAt(i); h1=Math.imul(h1^c,2654435761); h2=Math.imul(h2^c,1597334677); }
    h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909); h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
    return (h2>>>0).toString(16).padStart(8,"0")+(h1>>>0).toString(16).padStart(8,"0"); };
  const FONTS = ["Arial","Arial Black","Calibri","Cambria","Candara","Comic Sans MS","Consolas","Constantia","Corbel","Courier New","Georgia","Impact","Lucida Console","Lucida Sans Unicode","Palatino Linotype","Segoe UI","Tahoma","Times New Roman","Trebuchet MS","Verdana","Helvetica","Helvetica Neue","Menlo","Monaco","Avenir","Futura","Gill Sans","Optima","Baskerville","Didot","San Francisco","SF Pro Text","Ubuntu","DejaVu Sans","Liberation Sans","Noto Sans","Roboto","Open Sans","Fira Sans","Cantarell"];
  function fonts(){ const c=document.createElement("canvas").getContext("2d"), s="mmmmmmmmmlli1WQ@#ąęż", base=["monospace","serif","sans-serif"];
    const w = f => { c.font=`72px ${f}`; return c.measureText(s).width; }; const bw=base.map(w);
    return FONTS.filter(f => base.some((b,i) => w(`"${f}",${b}`)!==bw[i])); }
  function canvasHash(){ const cv=document.createElement("canvas"); cv.width=280; cv.height=60; const g=cv.getContext("2d");
    g.textBaseline="top"; g.font="16px Arial"; g.fillStyle="#f60"; g.fillRect(100,5,80,30); g.fillStyle="#069"; g.fillText("Odcisk ąęż 🖐 1.0",4,8);
    g.fillStyle="rgba(102,204,0,.7)"; g.font="18px Georgia"; g.fillText("fingerprint",30,30); g.beginPath(); g.arc(240,30,20,0,Math.PI*2); g.strokeStyle="#c0c"; g.stroke();
    try{ return cyrb(cv.toDataURL()); }catch(_){ return "—"; } }
  function webgl(){ try{ const gl=document.createElement("canvas").getContext("webgl"); if(!gl) return "—";
    const ext=gl.getExtension("WEBGL_debug_renderer_info"); return ext ? `${gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)} · ${gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)}` : `${gl.getParameter(gl.VENDOR)} · ${gl.getParameter(gl.RENDERER)}`; }catch(_){ return "—"; } }
  const mq = q => matchMedia(q).matches;
  function collect(){ const n=navigator, tz=Intl.DateTimeFormat().resolvedOptions().timeZone, f=fonts();
    return [
      ["ua", {pl:"Przeglądarka i system (User-Agent)",en:"Browser and system (User-Agent)"}, n.userAgent, {pl:"Wersja przeglądarki i systemu; wysyłana z każdym żądaniem.",en:"Browser and OS version; sent with every request."}],
      ["platform", {pl:"Platforma",en:"Platform"}, (n.userAgentData && n.userAgentData.platform) || n.platform || "—", {pl:"System operacyjny.",en:"Operating system."}],
      ["lang", {pl:"Języki",en:"Languages"}, (n.languages||[n.language]).join(", "), {pl:"Kolejność języków z ustawień; rzadsze zestawy mocno wyróżniają.",en:"Language order from settings; unusual sets stand out."}],
      ["tz", {pl:"Strefa czasowa",en:"Time zone"}, `${tz} (UTC${-new Date().getTimezoneOffset()/60>=0?"+":""}${-new Date().getTimezoneOffset()/60})`, {pl:"Zdradza przybliżony region, nawet przez VPN.",en:"Reveals your approximate region, even behind a VPN."}],
      ["screen", {pl:"Ekran",en:"Screen"}, `${screen.width} × ${screen.height}, ${screen.colorDepth}-bit, ×${window.devicePixelRatio}`, {pl:"Rozdzielczość, głębia kolorów i skalowanie.",en:"Resolution, colour depth and scaling."}],
      ["viewport", {pl:"Okno przeglądarki",en:"Browser window"}, `${innerWidth} × ${innerHeight}`, {pl:"Zmienia się przy zmianie rozmiaru okna, ale w krótkim czasie też pomaga śledzić.",en:"Changes when you resize, but helps tracking over short periods."}],
      ["cpu", {pl:"Rdzenie procesora",en:"CPU cores"}, String(n.hardwareConcurrency||"—"), {pl:"Liczba wątków procesora.",en:"Number of CPU threads."}],
      ["mem", {pl:"Pamięć RAM (przybliżona)",en:"RAM (approximate)"}, n.deviceMemory ? n.deviceMemory+" GB" : "—", {pl:"Tylko w przeglądarkach opartych na Chromium, zaokrąglona.",en:"Chromium-based browsers only, rounded."}],
      ["touch", {pl:"Punkty dotyku",en:"Touch points"}, String(n.maxTouchPoints??"—"), {pl:"Czy ekran jest dotykowy.",en:"Whether the screen is a touch screen."}],
      ["prefs", {pl:"Preferencje systemu",en:"System preferences"}, [mq("(prefers-color-scheme: dark)")?"dark":"light", mq("(prefers-reduced-motion: reduce)")?"reduced-motion":"motion", mq("(prefers-contrast: more)")?"high-contrast":"normal-contrast"].join(", "), {pl:"Motyw, ograniczenie animacji, kontrast.",en:"Theme, reduced motion, contrast."}],
      ["privacy", {pl:"Ustawienia prywatności",en:"Privacy settings"}, `cookies: ${n.cookieEnabled?"on":"off"}, DNT: ${n.doNotTrack??"—"}, GPC: ${n.globalPrivacyControl??"—"}`, {pl:"Paradoksalnie włączone „nie śledź” też jest cechą, która wyróżnia.",en:"Ironically, turning on “do not track” is itself a distinguishing feature."}],
      ["webgl", {pl:"Karta graficzna (WebGL)",en:"Graphics card (WebGL)"}, webgl(), {pl:"Producent i model GPU oraz sterownik.",en:"GPU vendor, model and driver."}],
      ["canvas", {pl:"Odcisk płótna (canvas)",en:"Canvas fingerprint"}, canvasHash(), {pl:"Skrót obrazka narysowanego w tle: drobne różnice w czcionkach, wygładzaniu i GPU dają inny wynik na różnych komputerach.",en:"Hash of an image drawn in the background: tiny differences in fonts, antialiasing and GPU give different results on different computers."}],
      ["fonts", {pl:`Wykryte czcionki (${f.length} z ${FONTS.length} sprawdzanych)`,en:`Detected fonts (${f.length} of ${FONTS.length} checked)`}, f.join(", ")||"—", {pl:"Wykrywane po szerokości tekstu; zestaw czcionek zależy od systemu i zainstalowanych programów.",en:"Detected by text width; the font set depends on the OS and installed software."}]
    ]; }
  let items=null;
  const self = { tab:"odcisk", key:"odcisk-przegladarki", grid:"cards-fp", sumId:"sum-fp", R:null, title:{pl:"Odcisk przeglądarki",en:"Browser fingerprint"}, specs:[
    {id:"fp-hash", title:{pl:"Twój odcisk",en:"Your fingerprint"}, unit:{pl:"(skrót wszystkich cech)",en:"(hash of all features)"},
     rows:[["n",{pl:"liczba cech",en:"features"}],["canvas",{pl:"odcisk canvas",en:"canvas fingerprint"}],["fonts",{pl:"wykryte czcionki",en:"detected fonts"}]],
     how:{pl:"Wartości wszystkich cech łączę w jeden tekst i liczę z niego 64-bitowy skrót (funkcja cyrb53). Ta sama przeglądarka zwykle daje ten sam skrót przy każdej wizycie, bez żadnych ciasteczek. Strona nie zna innych odwiedzających, więc nie wie, jak rzadki jest Twój odcisk; serwisy reklamowe i antyfraudowe to wiedzą.",
          en:"All feature values are joined into one text and hashed to 64 bits (cyrb53). The same browser usually gives the same hash on every visit, without any cookies. The page doesn't know other visitors, so it can't tell how rare your fingerprint is; advertising and anti-fraud services can."}}
  ]};
  function compute(){ items=collect(); const all=items.map(i=>i[0]+"="+i[2]).join("|");
    self.R = { hash:cyrb(all), features:Object.fromEntries(items.map(i=>[i[0], i[2]])) }; render(); self.render(self.R); setSummary(self); markDone("odcisk"); }
  function render(){ if(!items) return;
    $("fp-table").innerHTML = `<table><thead><tr><th>${LANG==="pl"?"Cecha":"Feature"}</th><th>${LANG==="pl"?"Wartość":"Value"}</th><th>${LANG==="pl"?"Co mówi":"What it reveals"}</th></tr></thead><tbody>`
      + items.map(i=>`<tr><td>${L(i[1])}</td><td><code>${esc(i[2])}</code></td><td>${L(i[3])}</td></tr>`).join("") + "</tbody></table>"; }
  self.render = R => { setMain("fp-hash", R.hash); setRow("fp-hash","n", Object.keys(R.features).length); setRow("fp-hash","canvas", R.features.canvas);
    setRow("fp-hash","fonts", R.features.fonts==="—" ? 0 : R.features.fonts.split(", ").length); };
  self.summary = R => LANG==="pl"
    ? `<p>Twój odcisk przeglądarki to <strong><code>${R.hash}</code></strong>, policzony z ${Object.keys(R.features).length} cech, które każda strona może odczytać bez pytania o zgodę. Ta sama kombinacja przy kolejnych wizytach pozwala rozpoznać przeglądarkę bez ciasteczek.</p><p>Ta strona niczego nie wysyła. Mniej wyróżniać się pomagają przeglądarki z ochroną przed fingerprintingiem (np. Tor Browser, Brave, Firefox z <code>privacy.resistFingerprinting</code>), które ujednolicają te wartości.</p>`
    : `<p>Your browser fingerprint is <strong><code>${R.hash}</code></strong>, computed from ${Object.keys(R.features).length} features any website can read without asking. The same combination on later visits lets a site recognise your browser without cookies.</p><p>This page sends nothing. Browsers with fingerprinting protection (e.g. Tor Browser, Brave, Firefox with <code>privacy.resistFingerprinting</code>) help you stand out less by unifying these values.</p>`;
  $("fp-go").addEventListener("click", compute);
  LANGHOOKS.push(() => { if(items){ items=collect(); render(); } });
  return self;
})();

// =====================================================================
// zakładki, wyniki, język
// =====================================================================
const TASKS = [Typing, Click, Track, Drag, Draw, Dbl, Pass, Pseudo, Search, SnA, SnB, Plates, Sig, Bot, FP];
const MOUSE = [Click, Track, Drag, Draw, Dbl];
const TABS = ["pisanie","klikanie","sledzenie","przeciaganie","rysowanie","dwuklik","haslo","litery","wzrok","podpis","bot","odcisk","wyniki"];

function markDone(tab){ document.querySelector(`#tabs a[data-tab="${tab}"]`).classList.add("done"); renderResults(); }
function renderResults(){
  const done = TASKS.filter(t=>t.R);
  $("results").innerHTML = done.length
    ? done.map(t=>`<article><h3>${L(t.title)}</h3>${t.summary(t.R)}</article>`).join("")
    : `<p class="lead">${D[LANG].res_empty}</p>`;
  $("export").disabled = !done.length;
}

// Statystyki z kart dokładnie tak, jak są pokazane na stronie
function cardStats(t){
  const out = {};
  for(const card of $(t.grid).querySelectorAll(".card")){
    const title = card.querySelector("h3").textContent.trim();
    const o = {};
    const val = card.querySelector(".val"); if(val) o.value = val.textContent.replace(/\s+/g," ").trim();
    card.querySelectorAll(".rows div").forEach(r => { const [a,b] = r.querySelectorAll("span"); if(b && b.textContent.trim()) o[a.textContent.trim()] = b.textContent.trim(); });
    card.querySelectorAll(".chips").forEach(c => { const lbl = c.previousElementSibling && c.previousElementSibling.classList.contains("sub") ? c.previousElementSibling.textContent.trim() : "list";
      o[lbl] = [...c.querySelectorAll(".chip")].map(x=>x.textContent.trim()); });
    out[title] = o;
  }
  return out;
}

// ---------- eksport profilu (tylko zapis na dysk użytkownika) ----------
async function exportProfile(){
  const done = TASKS.filter(t=>t.R); if(!done.length) return;
  const strip = h => { const d=document.createElement("div"); d.innerHTML=h; return d.textContent.replace(/\s+/g," ").trim(); };
  const now = new Date(), pad = n => String(n).padStart(2,"0");
  const stamp = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  const fname = (LANG==="pl" ? "profil-biometryczny-" : "biometric-profile-") + stamp + ".json";
  const data = {
    app: D[LANG].title, version: VERSION, source: REPO, exported: now.toISOString(), language: LANG,
    note: strip(D[LANG].amateur_p),
    stages: Object.fromEntries(done.map(t => [t.key || t.tab, {
      title: L(t.title),
      result: strip(t.summary(t.R)),
      stats: cardStats(t),
      measurements: t.R }]))
  };
  const json = JSON.stringify(data, null, 2);
  const st = $("export-status");
  const download = () => {
    const url = URL.createObjectURL(new Blob([json], {type:"application/json"}));
    const a = document.createElement("a"); a.href = url; a.download = fname;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
    st.textContent = D[LANG].export_dl.replace("{f}", fname);
  };
  if(window.showSaveFilePicker){
    try{
      const h = await window.showSaveFilePicker({ suggestedName:fname, startIn:"desktop",
        types:[{ description:"JSON", accept:{"application/json":[".json"]} }] });
      const w = await h.createWritable(); await w.write(json); await w.close();
      st.textContent = D[LANG].export_ok.replace("{f}", h.name);
    }catch(e){
      if(e && e.name==="AbortError") st.textContent = D[LANG].export_cancel;
      else { try{ download(); }catch(e2){ st.textContent = D[LANG].export_err.replace("{e}", e2.message); } }
    }
  } else download();
}
$("export").addEventListener("click", exportProfile);
function showTab(){
  let h = location.hash.slice(1); if(!TABS.includes(h)) h = "pisanie";
  document.querySelectorAll("[data-panel]").forEach(p => p.hidden = p.dataset.panel !== h);
  document.querySelectorAll("#tabs a").forEach(a => { if(a.dataset.tab===h) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  MOUSE.forEach(t => { if(t.tab !== h) t.abort(); });
  if(h==="haslo") requestAnimationFrame(() => Pass.chart());
  if(h==="wzrok") requestAnimationFrame(() => { Cal.upd(); SnRun.show(); Plates.show(); });
  Object.keys(LEAVE).forEach(k => { if(k !== h) LEAVE[k](); });
  if(SHOW[h]) requestAnimationFrame(SHOW[h]);
  const cur = MOUSE.find(t => t.tab === h);
  if(cur){ requestAnimationFrame(() => { cur.A.fit(); cur.redraw(); }); }
}
function applyLang(){
  document.documentElement.lang = LANG;
  document.title = D[LANG].doc_title;
  document.querySelector('meta[name="description"]').setAttribute("content", D[LANG].meta_desc);
  document.querySelectorAll("[data-i18n]").forEach(el => { el.innerHTML = D[LANG][el.dataset.i18n]; });
  const b=$("lang"); b.textContent = D[LANG].lang_btn; b.setAttribute("aria-label", D[LANG].lang_label);
  $("tabs").setAttribute("aria-label", LANG==="pl" ? "Etapy" : "Stages");
  TASKS.forEach(t => { buildCards(t.grid, t.specs); if(t.R) t.render(t.R); setSummary(t); });
  MOUSE.forEach(t => { t.status(t.st); if(t.A.w) t.redraw(); });
  Typing.onLang();
  Pass.onLang();
  Pseudo.onLang();
  Search.onLang();
  Cal.upd(); SnRun.onLang(); Plates.onLang();
  LANGHOOKS.forEach(f => f());
  renderResults();
  renderNews();
  renderTheme();
}
function renderNews(){
  const b=$("ver"); b.textContent = "v"+VERSION; b.setAttribute("aria-label", D[LANG].ver_label.replace("{v}",VERSION));
  $("news-list").innerHTML = CHANGELOG.map(c => `<article><h3>v${c.v} <time datetime="${c.date}">${c.date}</time></h3><ul>${c[LANG].map(x=>`<li>${x}</li>`).join("")}</ul></article>`).join("");
}
$("ver").addEventListener("click", () => $("news").scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"}));
$("lang").addEventListener("click", () => { LANG = LANG==="pl" ? "en" : "pl"; applyLang(); });

// dzień / noc: domyślnie motyw systemu, przycisk przełącza ręcznie (bez zapisywania)
const isDark = () => { const t=document.documentElement.dataset.theme; return t ? t==="dark" : matchMedia("(prefers-color-scheme: dark)").matches; };
function renderTheme(){ const b=$("theme"), d=isDark();
  b.textContent = d ? (LANG==="pl"?"☀ Dzień":"☀ Day") : (LANG==="pl"?"☾ Noc":"☾ Night");
  b.setAttribute("aria-label", d ? (LANG==="pl"?"Włącz jasny motyw":"Switch to light theme") : (LANG==="pl"?"Włącz ciemny motyw":"Switch to dark theme")); }
$("theme").addEventListener("click", () => {
  document.documentElement.dataset.theme = isDark() ? "light" : "dark";
  renderTheme(); MOUSE.forEach(t => { if(t.A.w) t.redraw(); });
});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { renderTheme(); MOUSE.forEach(t => { if(t.A.w) t.redraw(); }); });
window.addEventListener("hashchange", showTab);
window.addEventListener("resize", () => { const hh=location.hash.slice(1); if(SHOW[hh]) SHOW[hh](); if(!$("tab-haslo").hidden) Pass.chart(); if(!$("tab-wzrok").hidden){ SnRun.show(); Plates.show(); } const cur = MOUSE.find(t => !$( "tab-"+t.tab).hidden); if(cur){ cur.A.fit(); cur.redraw(); } });
if(matchMedia("(pointer: coarse)").matches) $("mobile").classList.remove("hidden");

Typing.reset();
applyLang();
showTab();
})();
