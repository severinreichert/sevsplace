# CPU-Visualisierung (Rechnerarchitektur)

Vereinfachter 8-Bit-Prozessor mit 16 × 8 Bit RAM, Fetch-Decode-Execute-Animation,
Assembler und manuell editierbarem Speicher. Reine statische Webseite ohne Abhängigkeiten.

## Adresse
Die Anwendung liegt im Repository `sevsplace` unter `apps/cpu-visualizer/` und ist erreichbar unter
`https://severinreichert.github.io/sevsplace/apps/cpu-visualizer/`.
Diese Adresse steht in Moodle-Aktivitäten (H5P Iframe Embedder). Ordner daher nicht umbenennen oder verschieben.

## Assembler-Syntax
- Ein Befehl pro Zeile, Befehlsnamen unabhängig von Groß- und Kleinschreibung (`ldr`, `LDR`).
- **Kommentare:** `#` bis zum Zeilenende oder `/* … */` (auch über mehrere Zeilen oder mitten in einer Zeile).
  `;` und `//` sind nicht mehr erlaubt und werden mit einem Hinweis gemeldet.
- **Adressen und Zahlen:** Dezimalzahl (`13`), hexadezimal (`0xD`) oder binär (`0b1101`), ohne `#`.
  `ldr R0, #13` ergibt eine Fehlermeldung mit Hinweis.
- **Labels:** `name:` definiert eine Sprungmarke, `jmp_n name` springt dorthin. Labels sind als Adresse überall erlaubt.
- **Direktiven:** `.org n` setzt die nächste Speicheradresse, `.byte wert, …` legt Datenbytes ab (−128 bis 255).

```
/* 4 x 3 durch wiederholte Addition */
ldr R0, 13      # Zähler laden
ldr R2, 14      # Summand laden
sub R1, R1      # R1 = 0
loop:
add R1, R2
dec R0
jmp_n ende
jmp loop
ende:
str R1, 15
HALT
.org 13
.byte 3, 3
```

## Einstellungen per URL-Parameter
| Parameter | Wirkung | Beispiel |
|---|---|---|
| `format` | Standard-Zahlenformat: `bin`, `hex`, `dec`, `sdec` | `?format=hex` |
| `assembler=0` | Assembler-Editor ausblenden (die Befehlssatz-Referenz bleibt) | `?assembler=0` |
| `editable=0` | Speicherzellen sperren | `?editable=0` |
| `task` | Aufgabentext über dem Prozessor | `?task=Berechne 3+4` |
| `asm` | Startprogramm, Zeilen mit `\|` getrennt | `?asm=ldr R0, 13 \| inc R0 \| HALT \| .org 13 \| .byte 5` |

Mehrere Parameter mit `&` verbinden. Leerzeichen, Umlaute und `+` können direkt geschrieben werden; ein `&` im Text als `%26`. So kann jede Moodle-Aktivität eine eigene Aufgabe bekommen,
ohne dass die Seite neu veröffentlicht werden muss.

Im Parameter `asm` funktionieren `#`-Kommentare nicht, weil `#` in einer Adresse ein Fragment einleitet.
Dort bitte `/* … */` verwenden.
