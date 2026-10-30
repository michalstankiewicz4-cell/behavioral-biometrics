# Plan rozwoju

Stan: ☐ do zrobienia · ☑ zrobione. Każdy punkt to osobna wersja (szczegóły w [CHANGELOG.md](CHANGELOG.md)).

## Grupy zakładek

Zakładki są podzielone na grupy. Grupa z wynikami, które mogą być nieprawdziwe (ciekawostki zdrowotne), ma inny kolor i ostrzeżenie.

| Grupa | Zakładki |
|-------|----------|
| Biometria behawioralna | Pisanie, Klikanie celów, Śledzenie punktu, Przeciąganie, Rysowanie po śladzie, Podwójne kliknięcie, Hasło, Podpis myszką, Człowiek czy bot, Odcisk przeglądarki |
| Testy psychomotoryczne | Stroop, Czas reakcji (Hick), Prawo Fittsa, Tapping, Pamięć |
| ⚠️ Ciekawostki zdrowotne – wynik może być nieprawdziwy | Litery i błędy, Wzrok |
| Wyniki i narzędzia | Wyniki (zestawienie, eksport, porównanie eksportów, karta PNG) |

## Kolejność prac

1. ☑ **Grupy zakładek** z wyróżnieniem grupy „wynik może być nieprawdziwy” (v0.10.0)
2. ☑ **Podpis myszką** – podpis 3 razy jako wzorzec, potem weryfikacja kolejnego podpisu (kształt, tempo, rytm) (v0.11.0)
3. ☑ **Człowiek czy bot** – jak zabezpieczenia w stylu CAPTCHA odróżniają człowieka od bota po ruchu myszki; przycisk „puść bota” do porównania (v0.12.0)
4. ☑ **Odcisk przeglądarki (jawny)** – co strona wie bez pytania o zgodę (ekran, strefa czasowa, języki, czcionki, karta graficzna…), z wyjaśnieniem śledzenia bez ciasteczek; wszystko lokalnie (v0.13.0)
5. ☑ **Mapa cieplna klawiatury** w zakładce Pisanie – kolor klawisza według czasu przytrzymania lub liczby błędów (v0.14.0)
6. ☐ **Test Stroopa** – kolor napisu kontra treść słowa
7. ☐ **Czas reakcji i prawo Hicka** – reakcja na 1, 2, 4 i 8 możliwych bodźców, wykres
8. ☐ **Prawo Fittsa** – cele różnej wielkości i odległości, dopasowanie wzoru
9. ☐ **Tapping** – 10 s stukania osobno lewą i prawą ręką
10. ☐ **Pamięć** – ciąg cyfr (digit span) i bloki Corsiego
11. ☐ **Wzrok: tarcza astygmatyczna i wrażliwość na kontrast** (z ostrzeżeniami)
12. ☐ **Porównanie dwóch eksportów** w zakładce Wyniki (pliki JSON wczytywane lokalnie)
13. ☐ **Karta wyniku jako obrazek PNG** generowana lokalnie

## Odrzucone

- „Kto to pisze?” (rozpoznawanie jednej z kilku osób) – wymaga zaangażowania kilku osób.
