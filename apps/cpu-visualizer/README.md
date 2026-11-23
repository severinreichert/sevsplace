# CPU-Visualisierung (Rechnerarchitektur)

Vereinfachter 8-Bit-Prozessor mit 16 × 8 Bit RAM, Fetch-Decode-Execute-Animation,
Assembler und manuell editierbarem Speicher. Reine statische Webseite ohne Abhängigkeiten.

## Adresse
Die Anwendung liegt im Repository `sevsplace` unter `apps/cpu-visualizer/` und ist erreichbar unter
`https://severinreichert.github.io/sevsplace/apps/cpu-visualizer/`.
Diese Adresse steht in Moodle-Aktivitäten (H5P Iframe Embedder). Ordner daher nicht umbenennen oder verschieben.

## Einstellungen per URL-Parameter
| Parameter | Wirkung | Beispiel |
|---|---|---|
| `format` | Standard-Zahlenformat: `bin`, `hex`, `dec`, `sdec` | `?format=hex` |
| `assembler=0` | Assembler-Editor ausblenden | `?assembler=0` |
| `editable=0` | Speicherzellen sperren | `?editable=0` |
| `task` | Aufgabentext über dem Prozessor | `?task=Berechne 3+4` |
| `asm` | Startprogramm, Zeilen mit `\|` getrennt, ohne `#` vor Adressen | `?asm=ldr R0, 13 \| inc R0 \| HALT \| .org 13 \| .byte 5` |

Mehrere Parameter mit `&` verbinden. So kann jede Moodle-Aktivität eine eigene Aufgabe bekommen,
ohne dass die Seite neu veröffentlicht werden muss.
