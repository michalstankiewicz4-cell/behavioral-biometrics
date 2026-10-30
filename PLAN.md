# Plan rozwoju

Stan: ☐ do zrobienia · ☑ zrobione. Każdy punkt to osobna wersja (szczegóły w [CHANGELOG.md](CHANGELOG.md)).

## Grupy zakładek

Zakładki są podzielone na grupy. Grupa z wynikami, które mogą być nieprawdziwe (ciekawostki zdrowotne), ma inny kolor i ostrzeżenie.

| Grupa | Zakładki |
|-------|----------|
| Biometria behawioralna | Pisanie, Klikanie celów, Śledzenie punktu, Przeciąganie, Rysowanie po śladzie, Podwójne kliknięcie, Hasło, Podpis myszką, Człowiek czy bot, Odcisk przeglądarki |
| Testy psychomotoryczne | Stroop, Czas reakcji (Hick), Prawo Fittsa, Tapping, Pamięć |
| ⚠️ Ciekawostki zdrowotne – wynik może być nieprawdziwy | Litery i błędy, Wzrok |
| Cechy stałe | Osobowość, Ręczność, Chronotyp, Rotacja umysłowa |
| Wyniki i narzędzia | Wyniki (zestawienie, eksport, porównanie eksportów, karta PNG) |

## Kolejność prac

1. ☑ **Grupy zakładek** z wyróżnieniem grupy „wynik może być nieprawdziwy” (v0.10.0)
2. ☑ **Podpis myszką** – podpis 3 razy jako wzorzec, potem weryfikacja kolejnego podpisu (kształt, tempo, rytm) (v0.11.0)
3. ☑ **Człowiek czy bot** – jak zabezpieczenia w stylu CAPTCHA odróżniają człowieka od bota po ruchu myszki; przycisk „puść bota” do porównania (v0.12.0)
4. ☑ **Odcisk przeglądarki (jawny)** – co strona wie bez pytania o zgodę (ekran, strefa czasowa, języki, czcionki, karta graficzna…), z wyjaśnieniem śledzenia bez ciasteczek; wszystko lokalnie (v0.13.0)
5. ☑ **Mapa cieplna klawiatury** w zakładce Pisanie – kolor klawisza według czasu przytrzymania lub liczby błędów (v0.14.0)
6. ☑ **Test Stroopa** – kolor napisu kontra treść słowa (v0.15.0)
7. ☑ **Czas reakcji i prawo Hicka** – reakcja na 1, 2, 4 i 8 możliwych bodźców, wykres (v0.16.0)
8. ☑ **Prawo Fittsa** – cele różnej wielkości i odległości, dopasowanie wzoru (v0.17.0)
9. ☑ **Tapping** – 10 s stukania osobno lewą i prawą ręką (v0.18.0)
10. ☑ **Pamięć** – ciąg cyfr (digit span) i bloki Corsiego (v0.19.0)
11. ☑ **Wzrok: tarcza astygmatyczna i wrażliwość na kontrast** (z ostrzeżeniami) (v0.20.0)
12. ☑ **Porównanie dwóch eksportów** w zakładce Wyniki (pliki JSON wczytywane lokalnie) (v0.21.0)
13. ☑ **Karta wyniku jako obrazek PNG** generowana lokalnie (v0.21.0)
14. ☑ **Linki do Wikipedii** (polskiej i angielskiej) przy testach, tam gdzie jest artykuł (v0.23.0)
15. ☑ **Nowa nazwa strony**: „Cyfrowy odcisk człowieka” (wcześniej „Odcisk klawiatury i myszki”) (v0.24.0)
16. ☑ **Rozdzielenie wyników od interpretacji** w zakładce Wyniki oraz **interpretacje łączone** (wnioski z kilku testów naraz) (v0.25.0)
17. ☑ **Frazy kluczowe i opis** dla wyszukiwarek po polsku i angielsku, dopasowane do wszystkich zakładek (v0.26.0)

18. ☑ **Podział projektu na pliki i foldery** jak w profesjonalnym projekcie (moduły JS, style, dane, testy) – wykonywany zaraz po punkcie 13 (v0.22.0)
19. ☑ **Osobowość – Wielka Piątka**, pełny kwestionariusz IPIP-NEO (300 pytań z otwartej bazy IPIP, 5 cech i 30 pod-cech), w nowej grupie „Cechy stałe” (v0.27.0)
20. ☑ **Ręczność** – kwestionariusz w stylu Edynburskiego, wskaźnik lateralizacji, porównanie z tappingiem (v0.28.0)
21. ☑ **Oko dominujące** – test „okienka z dłoni” z instrukcją, w zakładce Wzrok (v0.29.0)
22. ☐ **Chronotyp** – skowronek czy sowa: własne pytania o godziny snu, wynik metodą punktu środka snu w dni wolne (bez kopiowania kwestionariuszy MEQ/MCTQ, które wymagają zgody)
23. ☐ **Rotacja umysłowa** – czy obrócona figura to ta sama, czy odbicie lustrzane; czas i trafność zależnie od kąta

## Odrzucone

- „Kto to pisze?” (rozpoznawanie jednej z kilku osób) – wymaga zaangażowania kilku osób.
