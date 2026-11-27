# CPU-Visualisierung – Übergabedokumentation

Stand: 26.11.2026 · Repository: `severinreichert/sevsplace` · Ordner: `apps/cpu-visualizer/`
Live-Adresse: `https://severinreichert.github.io/sevsplace/apps/cpu-visualizer/`

Dieses Dokument erklärt die Anwendung so, dass eine Person ohne Vorwissen sie betreiben, verstehen und weiterentwickeln kann. Es enthält eine vollständige Liste aller Funktionen und Datenstrukturen mit ihren Abhängigkeiten (Abschnitte 7 und 8). Die Abhängigkeitsangaben in Abschnitt 8 wurden aus dem Quelltext abgeleitet und von Hand nachgeprüft; sie stimmen mit dem Stand der Datei `cpu-visualizer.js` zum oben genannten Datum überein.

## Inhaltsverzeichnis

- [1. Überblick](#1-überblick)
  - [1.1 Was ist das?](#11-was-ist-das)
  - [1.2 Technische Eckdaten](#12-technische-eckdaten)
  - [1.3 Entstehung und Vorgaben des Auftraggebers](#13-entstehung-und-vorgaben-des-auftraggebers)
- [2. Schnellstart](#2-schnellstart)
  - [2.1 Lokal ansehen](#21-lokal-ansehen)
  - [2.2 Veröffentlichen (GitHub Pages)](#22-veröffentlichen-github-pages)
  - [2.3 In Moodle einbinden](#23-in-moodle-einbinden)
  - [2.4 URL-Parameter](#24-url-parameter)
- [3. Repository-Struktur](#3-repository-struktur)
- [4. Architektur](#4-architektur)
  - [4.1 Schichten](#41-schichten)
  - [4.2 Grundprinzipien](#42-grundprinzipien)
  - [4.3 Startablauf](#43-startablauf)
  - [4.4 Ablauf eines Mikroschritts („Takt“)](#44-ablauf-eines-mikroschritts-takt)
  - [4.5 Darstellung im Rahmen (Iframe Embedder)](#45-darstellung-im-rahmen-iframe-embedder)
  - [4.6 Wer besitzt welchen Zustand?](#46-wer-besitzt-welchen-zustand)
- [5. Fachlicher Hintergrund: der simulierte Prozessor](#5-fachlicher-hintergrund-der-simulierte-prozessor)
  - [5.1 Bausteine](#51-bausteine)
  - [5.2 Befehlssatz](#52-befehlssatz)
  - [5.3 Flags](#53-flags)
  - [5.4 Mikroschritte je Befehl](#54-mikroschritte-je-befehl)
  - [5.5 Getroffene Annahmen](#55-getroffene-annahmen)
- [6. Assembler-Sprache](#6-assembler-sprache)
  - [6.1 Syntax](#61-syntax)
  - [6.2 Ablauf der Übersetzung (assemble)](#62-ablauf-der-übersetzung-assemble)
  - [6.3 Fehlermeldungen](#63-fehlermeldungen)
  - [6.4 Bekannte Eigenheiten](#64-bekannte-eigenheiten)
- [7. Datenstrukturen](#7-datenstrukturen)
  - [7.1 Konstanten und Tabellen](#71-konstanten-und-tabellen)
  - [7.2 Befehlsbeschreibung (Ergebnis von decode)](#72-befehlsbeschreibung-ergebnis-von-decode)
  - [7.3 Strukturen des Assemblers](#73-strukturen-des-assemblers)
  - [7.4 Prozessorzustand (Felder von Core.CPU)](#74-prozessorzustand-felder-von-corecpu)
  - [7.5 Mikroschritt, Datenbewegung, Fabrik](#75-mikroschritt-datenbewegung-fabrik)
  - [7.6 Zustand der Oberfläche (Felder von H5P.CPUVisualizer)](#76-zustand-der-oberfläche-felder-von-h5pcpuvisualizer)
  - [7.7 Optionen (Parameter)](#77-optionen-parameter)
  - [7.8 Öffentliche Schnittstelle](#78-öffentliche-schnittstelle)
- [8. Funktionsreferenz](#8-funktionsreferenz)
  - [8.1 Core: Hilfsfunktionen](#81-core-hilfsfunktionen)
  - [8.2 Core: Befehlssatz und ALU](#82-core-befehlssatz-und-alu)
  - [8.3 Core: Assembler](#83-core-assembler)
  - [8.4 Core: Prozessor (Klasse Core.CPU)](#84-core-prozessor-klasse-corecpu)
  - [8.5 Oberfläche: Hilfsfunktionen](#85-oberfläche-hilfsfunktionen)
  - [8.6 Oberfläche: Aufbau und Konfiguration (Klasse H5P.CPUVisualizer)](#86-oberfläche-aufbau-und-konfiguration-klasse-h5pcpuvisualizer)
  - [8.7 Oberfläche: Darstellung und Programmverwaltung](#87-oberfläche-darstellung-und-programmverwaltung)
  - [8.8 Oberfläche: Ablaufsteuerung und Animation](#88-oberfläche-ablaufsteuerung-und-animation)
  - [8.9 Startcode und H5P-Nachbildung](#89-startcode-und-h5p-nachbildung)
- [9. Ereignisbehandlung](#9-ereignisbehandlung)
- [10. Oberfläche und CSS](#10-oberfläche-und-css)
  - [10.1 Aufbau des DOM](#101-aufbau-des-dom)
  - [10.2 Farben und Gestaltungsvariablen](#102-farben-und-gestaltungsvariablen)
  - [10.3 Zustandsklassen](#103-zustandsklassen)
  - [10.4 Anpassung an die Breite](#104-anpassung-an-die-breite)
  - [10.5 Klassenverzeichnis](#105-klassenverzeichnis)
  - [10.6 Browser-Anforderungen](#106-browser-anforderungen)
- [11. Typische Änderungen](#11-typische-änderungen)
  - [11.1 Befehlssatz ändern](#111-befehlssatz-ändern)
  - [11.2 Flag-Regeln ändern](#112-flag-regeln-ändern)
  - [11.3 Speichergröße ändern](#113-speichergröße-ändern)
  - [11.4 Zahlenformat hinzufügen](#114-zahlenformat-hinzufügen)
  - [11.5 URL-Parameter hinzufügen](#115-url-parameter-hinzufügen)
  - [11.6 Farben anpassen](#116-farben-anpassen)
  - [11.7 Texte ändern oder übersetzen](#117-texte-ändern-oder-übersetzen)
  - [11.8 Weitere Anwendung ins Repository aufnehmen](#118-weitere-anwendung-ins-repository-aufnehmen)
- [12. Tests und Qualitätssicherung](#12-tests-und-qualitätssicherung)
  - [12.1 Kern ohne Browser prüfen](#121-kern-ohne-browser-prüfen)
  - [12.2 Manuelle Prüfliste](#122-manuelle-prüfliste)
- [13. Bekannte Einschränkungen und offene Punkte](#13-bekannte-einschränkungen-und-offene-punkte)
- [14. Glossar](#14-glossar)
- [15. Anhang: Aufbau der Moodle-Datei CPU-Visualisierung-Iframe.h5p](#15-anhang-aufbau-der-moodle-datei-cpu-visualisierung-iframeh5p)


---

## 1. Überblick

### 1.1 Was ist das?

Eine interaktive Lernanwendung für den Kurs „Rechnerarchitektur“. Sie zeigt einen **stark vereinfachten 8-Bit-Prozessor** mit 16 Byte Arbeitsspeicher und führt Programme Schritt für Schritt vor. Man sieht, wie der Prozessor einen Befehl **holt** (Fetch), **entschlüsselt** (Decode) und **ausführt** (Execute): Daten wandern als kleine Pakete zwischen Programmzähler, Registern, ALU und Speicher. Jeder Schritt wird in einem Satz erklärt.

Wichtige Funktionen für Lernende:

- Programme im Einzelschritt (ein „Takt“ = ein Mikroschritt), befehlsweise oder automatisch ausführen, Tempo einstellbar.
- Jede der 16 Speicherzellen lässt sich **von Hand überschreiben** (binär, hexadezimal oder dezimal).
- Ein **Assembler** übersetzt Programmtext in den Speicher; umgekehrt kann der Speicher als Assembler-Text angezeigt werden.
- Die Anwendung erklärt sich selbst: Erklärtext zu jedem Schritt, aufklappbare Befehlssatz-Tabelle.

### 1.2 Technische Eckdaten

- Reine statische Webseite: **HTML, CSS und JavaScript**, keine Bibliotheken, kein Build-Schritt, keine Server-Komponente.
- Läuft **eigenständig** im Browser und **eingebettet** in Moodle über den H5P-Inhaltstyp „Iframe Embedder“.
- Gehostet über **GitHub Pages** aus dem Repository `sevsplace` (Branch `main`).
- Alle sichtbaren Texte sind Deutsch und im JavaScript fest hinterlegt.

### 1.3 Entstehung und Vorgaben des Auftraggebers

- **Auftraggeber:** Dozent des Hochschulkurses „Rechnerarchitektur“.
- **Vorbild:** `tinycpu.com/coredumped`. Diese Seite wird per JavaScript aufgebaut und konnte bei der Entwicklung **nicht ausgelesen werden**. Das Layout ist daher ein eigener Entwurf nach den Vorgaben des Auftraggebers und üblichen Blockschaltbildern, **keine exakte Kopie**.
- **Eckdaten laut Auftraggeber:** 4 Mehrzweckregister zu je 8 Bit, Programmzähler 4 Bit, Instruktionsregister 8 Bit, RAM 16 × 8 Bit, Befehlssatz aus der Datei `Instruction_Set.xlsx`.
- **Entwicklungsverlauf:** Zuerst entstand ein eigener H5P-Inhaltstyp (eine H5P-Bibliothek). Das erforderte Admin-Rechte in Moodle und wurde verworfen. Seither liegt die Anwendung als normale Webseite auf GitHub Pages und wird per Iframe Embedder eingebunden. Die alte H5P-Bibliothek (`CPU-Visualisierung.h5p`) wird **nicht mehr gepflegt**; sie enthält einen älteren Stand mit der inzwischen abgeschafften Assembler-Syntax.

---

## 2. Schnellstart

### 2.1 Lokal ansehen

Die Seite braucht keinen Server und keinen Build. Entweder `apps/cpu-visualizer/index.html` per Doppelklick im Browser öffnen oder einen lokalen Server starten:

```bash
cd sevsplace
python3 -m http.server 8000
# danach im Browser: http://localhost:8000/apps/cpu-visualizer/
```

### 2.2 Veröffentlichen (GitHub Pages)

1. Änderungen committen und auf den Branch `main` pushen.
2. GitHub startet automatisch den Lauf „pages build and deployment“ (Reiter *Actions*). Nach etwa 1 bis 2 Minuten ist die Seite aktualisiert.
3. Browser dürfen Dateien bis zu **10 Minuten** zwischenspeichern. Wer nach dem Push noch den alten Stand sieht, lädt hart neu (Strg+F5 bzw. Cmd+Shift+R) oder wartet kurz.
4. Die leere Datei `.nojekyll` im Hauptverzeichnis verhindert, dass GitHub die Dateien mit dem Generator „Jekyll“ verarbeitet (sonst würden z. B. Ordner mit führendem Unterstrich nicht veröffentlicht).

Einstellung in GitHub: *Settings → Pages → Source: Deploy from a branch → `main` / `(root)`*.

### 2.3 In Moodle einbinden

Die Einbindung geschieht über eine H5P-Aktivität vom Typ **„Iframe Embedder“**. Die Datei `CPU-Visualisierung-Iframe.h5p` enthält fertigen Inhalt, den man in Moodle importiert (Inhaltsspeicher bzw. H5P-Aktivität). Der Inhalt hat folgende Felder:

| Feld | Wert | Bedeutung |
|---|---|---|
| `source` (Source) | `https://severinreichert.github.io/sevsplace/apps/cpu-visualizer/` | Adresse der Seite, ggf. mit URL-Parametern (2.4) |
| `width` | `100%` | Breite des Rahmens |
| `height` | `900px` | Feste Höhe des Rahmens |
| `minWidth` | `300px` | Mindestbreite |
| `resizeSupported` | aus | Der Rahmen passt seine Höhe nicht automatisch an |

Was man dazu wissen muss:

- Das `.h5p`-Paket enthält **keinen Anwendungscode**, nur die Adresse. **Änderungen am Code erfordern deshalb kein neues `.h5p`**: Sobald sie auf GitHub Pages liegen, sehen auch die eingebetteten Aktivitäten sie.
- Der Iframe Embedder erzeugt einen Rahmen mit fester Größe und ohne Scrollbalken (`scrolling="no"`). Damit trotzdem alles erreichbar ist, erkennt die Seite, dass sie in einem Rahmen läuft, und scrollt dann **in sich selbst** (Abschnitt 4.5).
- Der Iframe Embedder wandelt die eingetragene Adresse mit `encodeURI` um. Dadurch wird ein `%` zu `%25`; **Prozentkodierung funktioniert in der Source-Adresse nicht**. Leerzeichen, Umlaute und `+` dürfen direkt geschrieben werden.
- Für verschiedene Aufgaben legt man mehrere H5P-Aktivitäten mit unterschiedlicher Source-Adresse (Parameter, 2.4) an.

### 2.4 URL-Parameter

Verarbeitet von `app.js`. Mehrere Parameter werden mit `&` verbunden.

| Parameter | Wirkung | Beispiel |
|---|---|---|
| `format` | Standard-Zahlenformat: `bin`, `hex`, `dec`, `sdec` | `?format=hex` |
| `assembler=0` | Assembler-Block ausblenden (die Befehlssatz-Referenz bleibt) | `?assembler=0` |
| `editable=0` | Speicherzellen sperren | `?editable=0` |
| `task` | Aufgabentext über dem Prozessor | `?task=Berechne 3+4` |
| `asm` | Startprogramm, Zeilen durch `\|` getrennt | `?asm=ldr R0, 13 \| inc R0 \| HALT \| .org 13 \| .byte 5` |

Besonderheiten und Grenzen:

- Die Parameter werden **selbst** gelesen (nicht mit `URLSearchParams`): ein `+` bleibt ein Pluszeichen.
- Die Zeichen `&` (trennt Parameter), `#` (beginnt ein Fragment) und `%` (siehe 2.3) lassen sich in Texten **nicht** übergeben.
- Im Parameter `asm` sind deshalb `#`-Kommentare nicht möglich; dort `/* … */` verwenden.
- Wert `0`, `false` oder `nein` schaltet die Ja/Nein-Parameter aus, jeder andere Wert (auch leer) ein.

---

## 3. Repository-Struktur

```
sevsplace/
├─ index.html, styles.css          Startseite des Repositorys (nicht Teil der Anwendung)
├─ .nojekyll                       verhindert die Jekyll-Verarbeitung durch GitHub Pages
├─ .gitignore, .gitattributes      Git-Konfiguration (LF-Zeilenenden, .idea ignoriert)
└─ apps/
   └─ cpu-visualizer/              ← diese Anwendung
      ├─ index.html                Einstiegsseite
      ├─ h5p-shim.js               Nachbildung der H5P-Schnittstelle für den Standalone-Betrieb
      ├─ cpu-visualizer.js         gesamte Logik (Kern, Assembler, Oberfläche)
      ├─ cpu-visualizer.css        gesamtes Aussehen
      ├─ app.js                    liest URL-Parameter, startet die Anwendung
      ├─ README.md                 Kurzanleitung
      └─ DOKUMENTATION.md          dieses Dokument
```

| Datei | Aufgabe | Abhängig von |
|---|---|---|
| `index.html` | Lädt Stylesheet und die drei Skripte, enthält die Zeile `<div id="app">` und einen kleinen Inline-Stil für den Rahmenbetrieb | alle anderen Dateien |
| `h5p-shim.js` | Stellt `H5P.jQuery` und `H5P.EventDispatcher` bereit | – |
| `cpu-visualizer.js` | Definiert `H5P.CPUVisualizer` samt `.Core` | `H5P.jQuery`, `H5P.EventDispatcher` (aus dem Shim oder von H5P) |
| `cpu-visualizer.css` | Alle Regeln, begrenzt auf `.h5p-cpu-visualizer` | – |
| `app.js` | Wertet `window.location.search` aus, erzeugt und hängt die Anwendung ein | `H5P.CPUVisualizer`, `H5P.jQuery` |

**Ladereihenfolge in `index.html` (wichtig):** `cpu-visualizer.css` → `h5p-shim.js` → `cpu-visualizer.js` → `app.js`. Der Shim muss vor `cpu-visualizer.js` stehen, weil diese Datei `H5P.jQuery` und `H5P.EventDispatcher` schon beim Laden einliest. `app.js` muss zuletzt kommen, weil es die fertige Klasse braucht.

> **Hinweis zum Namen „H5P“:** Der Code ist so geschrieben, dass er unverändert auch als H5P-Inhaltstyp laufen würde (daher `H5P.CPUVisualizer`, `attach($container)`, `EventDispatcher`). Im aktuellen Betrieb ist H5P nur der Rahmen von außen (Iframe Embedder); die Anwendung selbst nutzt von H5P nichts außer dem Shim.

---

## 4. Architektur

### 4.1 Schichten

```
 Host-Seite   index.html ─ app.js ─ h5p-shim.js
     │          liest URL-Parameter, erzeugt Instanz, ruft attach() auf
     ▼
 Oberfläche   H5P.CPUVisualizer  (im Code: Klasse „C“)
     │          baut das DOM, zeigt den Zustand, steuert Ablauf und Animation, nimmt Eingaben entgegen
     │ benutzt
     ▼
 Kern         H5P.CPUVisualizer.Core   (kennt weder DOM noch Browser)
                ├─ Befehlssatz:  decode · encode · alu
                ├─ Assembler:    prepare · assemble · disassemble · parseNumber
                └─ Prozessor:    Klasse CPU  (Zustand + Mikroschritte)
```

Die Abhängigkeit zeigt nur nach unten: Der Kern weiß nichts von der Oberfläche. Deshalb lässt er sich auch ohne Browser testen (Abschnitt 12).

### 4.2 Grundprinzipien

1. **Kern ohne DOM.** Alles Fachliche (Befehle, Rechenwerk, Assembler, Ablauf) steckt im Kern. Die Oberfläche zeigt nur an.
2. **Ein Mikroschritt ist eine Beschreibung mit „Anwenden“-Funktion.** `cpu.nextOp()` ändert den Zustand nicht. Es liefert ein Objekt, das beschreibt, was geschieht (Erklärtext, Datenbewegungen, Hervorhebungen), und eine Funktion `commit()`. Die Oberfläche spielt zuerst die Animation ab und ruft **danach** `commit()`. So bleibt der angezeigte Zustand stets in sich stimmig, und eine Animation kann abgebrochen werden, ohne den Prozessor zu verändern.
3. **Fabriken statt fertiger Schritte.** Die Warteschlange `cpu.queue` enthält Funktionen, die einen Schritt erst **beim Ausführen** berechnen. Dadurch sehen sie immer den aktuellen Zustand (etwa die Register nach dem vorigen Schritt).
4. **Zahlenformat ist reine Darstellung.** Der Prozessor speichert Zahlen 0–255. Binär/Hex/Dezimal entsteht erst bei der Anzeige über `cpu.fmt`, das die Oberfläche einhängt.
5. **Abbruch über ein Token.** `token` wird bei jedem Reset erhöht. Laufende Schritte (Promises) merken sich den Wert und verwerfen ihr Ergebnis, wenn er sich geändert hat.
6. **Begrenzte CSS-Reichweite.** Alle Regeln beginnen mit `.h5p-cpu-visualizer` und alle Klassen mit `cpuv-`. Die Klasse setzt `attach`. So stört die Anwendung nie die Seite, in die sie eingebettet ist.

### 4.3 Startablauf

1. Der Browser lädt `index.html` und nacheinander CSS, `h5p-shim.js`, `cpu-visualizer.js`, `app.js`.
2. `cpu-visualizer.js` definiert `H5P.CPUVisualizer` (mit `Core` darin).
3. `app.js` liest die URL-Parameter und bildet daraus das Optionenobjekt (7.7). Läuft die Seite in einem Rahmen, setzt es die Klasse `cpuv-embedded` auf `<html>`.
4. `app.js` ruft `new H5P.CPUVisualizer(opts, 0)`. Der Konstruktor legt den Prozessor (`new Core.CPU()`) an und setzt Anfangswerte, baut aber noch nichts.
5. `app.js` ruft `attach(H5P.jQuery(app))`. Darin: Klasse setzen → Animationsfähigkeit prüfen → `build` (DOM aufbauen, Ereignisse verdrahten) → `applyInitialProgram` (Startprogramm assemblieren und laden) → `render` (alles anzeigen) → Erklärtext „Bereit …“ → Größenüberwachung starten.

### 4.4 Ablauf eines Mikroschritts („Takt“)

1. Klick → Handler prüft `canInteract()` → `doStep()`.
2. `doStep` holt mit `cpu.nextOp()` den nächsten Schritt (bei leerer Warteschlange beginnt ein neuer Befehl) und setzt `busy`.
3. `execOp(op, token)` zeigt Erklärtext und Phase an, hebt Quellen, Ziele, RAM-Zeile und Bus hervor und startet für jede Datenbewegung ein Datenpaket (`animateChip`).
4. Nach Ende der Animation (und nur, wenn das Token noch stimmt): `op.commit()` ändert den Prozessorzustand, `clearVisuals()` räumt die Hervorhebungen weg, `render()` zeichnet den neuen Zustand.
5. `doStep` setzt `busy` zurück, meldet bei HALT `onHalted()` und aktualisiert die Schaltflächen.

„Befehl“ (`doInstruction`) wiederholt `doStep`, bis die Warteschlange leer ist. „Start“ (`toggleRun`) wiederholt `doStep` mit Pausen, bis HALT, Pause oder Reset.

### 4.5 Darstellung im Rahmen (Iframe Embedder)

Ein Iframe Embedder-Rahmen hat feste Höhe und keine Scrollbalken. `app.js` erkennt den Rahmen (`window.self !== window.top`) und setzt `cpuv-embedded` auf `<html>`. Der Inline-Stil in `index.html` sperrt dann das Scrollen von `<html>`/`<body>` und macht stattdessen `#app` (Höhe 100 %, `overflow: auto`) scrollbar. Ergebnis: Die Seite scrollt in sich selbst; außerhalb eines Rahmens verhält sie sich wie eine normale Seite.

### 4.6 Wer besitzt welchen Zustand?

| Zustand | Besitzer | Gelesen von |
|---|---|---|
| Prozessor (Register, PC, AR, IR, Flags, ALU-Anzeige, Speicher, Warteschlange, Zähler) | `this.cpu` (Instanz von `Core.CPU`) | `render`, Mikroschritt-Fabriken |
| Zahlenformat | `this.format` | `cpu.fmt` (über Closures), `render`, RAM-Zellen |
| Tempo | `this.speed` | `moveDuration`, `toggleRun` |
| Läuft/beschäftigt | `this.running`, `this.busy` | `canInteract`, `updateButtons`, `toggleRun`, `doStep` |
| Abbruch-Marke | `this.token` | `execOp`, `doStep`, `doInstruction`, `toggleRun` |
| Anzeige-Elemente | `this.nodes`, `this.rows`, `this.btn`, `this.pills` | `render` und alle Anzeige-Funktionen |

---

## 5. Fachlicher Hintergrund: der simulierte Prozessor

### 5.1 Bausteine

| Baustein | Breite | Aufgabe | Name im Code |
|---|---|---|---|
| Programmzähler (PC) | 4 Bit | Adresse des nächsten Befehls | `cpu.pc` |
| Adressregister (AR) | 4 Bit | Adresse, die gerade an den Speicher angelegt wird | `cpu.ar` |
| Instruktionsregister (IR) | 8 Bit | Der gerade bearbeitete Befehl | `cpu.ir` |
| Decoder | – | Zerlegt das IR in Befehl und Operanden | `Core.decode`, `cpu.decoded` |
| Register R0–R3 | je 8 Bit | Vier frei nutzbare Register | `cpu.regs[0..3]` |
| ALU | 8 Bit | Rechenwerk mit zwei Eingängen A, B und Ergebnis | `Core.alu`, `cpu.alu` |
| Flags N, O | je 1 Bit | Negativ- und Überlauf-Flag | `cpu.n`, `cpu.o` |
| Arbeitsspeicher (RAM) | 16 × 8 Bit | Programm **und** Daten im selben Speicher | `cpu.mem[0..15]` |
| Bus | – | Rein darstellerisch: Datenpakete laufen über ihn | `busEl` |

Programm und Daten liegen im selben Speicher (Von-Neumann-Prinzip). Der Prozessor unterscheidet nicht, ob eine Zelle Befehl oder Datum ist: Landet der Programmzähler auf einer Datenzelle, wird sie als Befehl ausgeführt.

### 5.2 Befehlssatz

Jeder Befehl ist ein Byte. `xx`/`yy` wählen ein Register (`00` = R0 … `11` = R3), `aaaa` ist eine Speicheradresse, `nn` hat keine Bedeutung. **Alle 256 Bitmuster sind belegt.**

| Opcode | Mnemonic | Art (`kind`) | Wirkung | Flags |
|---|---|---|---|---|
| `0000xxyy` | `add Rx, Ry` | `rr` | Rx + Ry → Rx | N, O |
| `0001xxyy` | `sub Rx, Ry` | `rr` | Rx − Ry → Rx | N, O |
| `0010xxyy` | `nand Rx, Ry` | `rr` | Rx NAND Ry → Rx | N, O (O immer 0) |
| `001100xx` | `inc Rx` | `r` | Rx + 1 → Rx | N, O |
| `001101xx` | `dec Rx` | `r` | Rx − 1 → Rx | N, O |
| `001110xx` | `shl Rx` | `r` | Rx um 1 Bit nach links schieben | N, O |
| `001111xx` | `shr Rx` | `r` | Rx um 1 Bit nach rechts schieben | N, O (O immer 0) |
| `010000xx` | `neg Rx` | `r` | Zweierkomplement: −Rx → Rx | N, O |
| `010001xx` | `movs Rx` | `r` | Rx → Rx, setzt die Flags neu | N, O (O immer 0) |
| `010010nn` | `NOP` | `none` | Keine Operation | – |
| `010011nn` | `HALT` | `none` | Prozessor hält an | – |
| `0101aaaa` | `jmp addr` | `addr` | PC ← aaaa | – |
| `0110aaaa` | `jmp_n addr` | `addr` | PC ← aaaa, wenn N gesetzt | – |
| `0111aaaa` | `jmp_o addr` | `addr` | PC ← aaaa, wenn O gesetzt | – |
| `10xxaaaa` | `ldr Rx, addr` | `ra` | RAM[aaaa] → Rx | – |
| `11xxaaaa` | `str Rx, addr` | `ra` | Rx → RAM[aaaa] | – |

Die Spalte „Art“ ist die interne Einteilung nach Operandenform (siehe `MNEMONICS`): `rr` zwei Register, `r` ein Register, `none` kein Operand, `addr` eine Adresse, `ra` Register und Adresse.

### 5.3 Flags

Nur ALU-Befehle verändern die Flags; `ldr`, `str`, Sprünge, `NOP` und `HALT` lassen sie unverändert (auch ein genommener Sprung löscht sie nicht).

| Befehl | N (Negativ) | O (Überlauf) |
|---|---|---|
| alle ALU-Befehle | Bit 7 des 8-Bit-Ergebnisses | – (siehe unten) |
| `add` | | Vorzeichen von A und B gleich, Vorzeichen des Ergebnisses anders |
| `sub` | | Vorzeichen von A und B verschieden, Vorzeichen des Ergebnisses ≠ Vorzeichen von A |
| `nand` | | immer 0 |
| `inc` | | A = 127 (0x7F), Ergebnis wäre −128 |
| `dec` | | A = −128 (0x80), Ergebnis wäre +127 |
| `shl` | | das Vorzeichenbit ändert sich beim Schieben |
| `shr` | | immer 0 (`shr` schiebt logisch, von links kommt eine 0; N ist daher immer 0) |
| `neg` | | A = −128 (0x80) |
| `movs` | | immer 0 |

### 5.4 Mikroschritte je Befehl

Jeder Befehl beginnt mit denselben vier Schritten; danach folgt die Ausführung. Ein „Takt“ in der Anwendung ist genau ein Mikroschritt.

| Phase | Schritt | Was geschieht | Datenbewegung (Quelle → Ziel) |
|---|---|---|---|
| Fetch | 1/3 | AR ← PC | `pc → ar` |
| Fetch | 2/3 | IR ← RAM[AR] (Zeile wird als „gelesen“ markiert; Decoder-Anzeige wird geleert) | `ram:<AR> → ir` |
| Fetch | 3/3 | PC ← (PC + 1) mod 16 | – (PC pulsiert) |
| Decode | 1 | Befehl aus dem IR bestimmen, Ausführungsschritte einreihen | – (Decoder pulsiert) |
| Execute (`add`, `sub`, `nand`) | 1/3 | A ← Rx, B ← Ry | `rX → aluA`, `rY → aluB` |
| | 2/3 | ALU rechnet, Ergebnis und Flags setzen | – (ALU und Flags pulsieren) |
| | 3/3 | Rx ← Ergebnis | `aluR → rX` |
| Execute (`inc` … `movs`) | 1/3 | A ← Rx | `rX → aluA` |
| | 2/3, 3/3 | wie oben | |
| Execute (`NOP`) | 1/1 | nichts | – |
| Execute (`HALT`) | 1/1 | `halted` setzen | – |
| Execute (`jmp`) | 1/1 | PC ← Adressfeld des IR | `ir → pc` |
| Execute (`jmp_n`, `jmp_o`) | 1/1 | Flag gesetzt: wie `jmp`; sonst nur Hinweis, nichts ändert sich | `ir → pc` bzw. – (Flags pulsieren) |
| Execute (`ldr`) | 1/2 | AR ← Adressfeld des IR | `ir → ar` |
| | 2/2 | Rx ← RAM[AR] (Zeile „gelesen“) | `ram:<AR> → rX` |
| Execute (`str`) | 1/2 | AR ← Adressfeld des IR | `ir → ar` |
| | 2/2 | RAM[AR] ← Rx (Zeile „geschrieben“) | `rX → ram:<AR>` |

Mikroschritte je Befehl insgesamt: `add`/`sub`/`nand` und alle Ein-Register-Befehle **7**, `ldr`/`str` **6**, `NOP`/`HALT`/Sprünge **5**. Das Beispielprogramm (4 × 3) braucht 20 Befehle und 121 Takte.

### 5.5 Getroffene Annahmen

Einige Punkte waren im Auftrag nicht festgelegt und wurden bei der Entwicklung so entschieden. Sie sind **mit dem Auftraggeber nicht im Einzelnen abgestimmt**; bei Abweichungen vom Vorbild hier ansetzen.

1. **Flags:** N = höchstes Bit des Ergebnisses; O = Zweierkomplement-Überlauf (Regeln in 5.3). Die Regel für `shl` ist eine Festlegung.
2. **`shr` schiebt logisch**, nicht arithmetisch.
3. **Programmzähler und Adressregister sind getrennt.** Die Vorgabe nannte den Programmzähler „Address Register“. Da `ldr`/`str` eine Datenadresse an den Speicher legen müssen, während der PC schon auf den nächsten Befehl zeigt, werden beide Register getrennt dargestellt.
4. **Nur ALU-Befehle ändern Flags.** `movs` setzt N neu und löscht O.
5. **Der Programmzähler läuft modulo 16:** Nach Adresse 15 folgt 0.
6. **`NOP` und `HALT` ignorieren die Bits `nn`.**
7. **Tippfehler in `Instruction_Set.xlsx`:** Bei den Zwei-Register-Befehlen steht „yy is index of Rx“. Gelesen wurde das als „Ry“.
8. **Nach dem Zurücksetzen** ist das IR 0 (`0000 0000`), der Decoder zeigt „–“, bis zum ersten Dekodieren steht dort „Noch kein Befehl dekodiert“.

---

## 6. Assembler-Sprache

### 6.1 Syntax

- **Ein Befehl pro Zeile**, Befehlsnamen und Registernamen unabhängig von Groß-/Kleinschreibung (`ldr`, `LDR`, `r1`).
- **Register:** `R0` bis `R3`.
- **Zahlen und Adressen:** Dezimalzahl (`13`), hexadezimal (`0xD`), binär (`0b1101`), **ohne** `#`. Adressen liegen im Bereich 0 bis 15.
- **Labels:** `name:` definiert eine Sprungmarke auf die aktuelle Adresse (mehrere Labels vor einem Befehl sind möglich). Labels sind überall erlaubt, wo eine Adresse stehen kann (`jmp loop`, `ldr R0, zaehler`). Groß-/Kleinschreibung zählt nicht.
- **Kommentare:** `#` bis zum Zeilenende **oder** `/* … */` (auch über mehrere Zeilen oder mitten in einer Zeile). **`;` und `//` sind nicht mehr erlaubt.**
- **Direktiven:** `.org n` setzt die nächste Speicheradresse (0–15); `.byte wert, …` (auch `.db`) legt Datenbytes ab, erlaubt sind −128 bis 255.
- **Kurzformen:** `jmpn` für `jmp_n`, `jmpo` für `jmp_o`.

```
/* 4 x 3 durch wiederholte Addition
   R0 = Zähler, R1 = Summe, R2 = Summand */
ldr R0, 13      # Zähler laden
ldr R2, 14      # Summand laden
sub R1, R1      # R1 = 0 (Summe)
loop:
add R1, R2      # Summe += Summand
dec R0          # Zähler -= 1
jmp_n ende      # Zähler < 0 ? Dann fertig
jmp loop
ende:
str R1, 15      # Ergebnis speichern
HALT
.org 13
.byte 3         # Zähler (3 ergibt 4 Durchläufe)
.byte 3         # Summand
```

### 6.2 Ablauf der Übersetzung (`assemble`)

1. **`prepare`:** Kommentare entfernen, Code zeilenweise liefern (Zeilennummern bleiben erhalten), alte Schreibweisen als Fehler melden.
2. **Stufe 1:** Zeile für Zeile Labels und Direktiven auswerten, Befehle und Datenbytes mit ihrer Adresse als Einträge (`items`) merken.
3. **Stufe 2:** Für jeden Eintrag Operandenzahl prüfen, Register und Adressen (Zahl oder Label) auflösen, mit `encode` das Byte bilden, Doppelbelegung einer Adresse prüfen, ins Speicherabbild schreiben.
4. Fehler nach Zeilennummer sortieren und zusammen mit Abbild und Anzahl belegter Zellen zurückgeben.

### 6.3 Fehlermeldungen

Alle beginnen mit „Zeile N:“ (bzw. „Zeilen N, M:“ bei zusammengefassten Hinweisen). Bei Fehlern wird **nichts** in den Speicher geladen.

| Meldung (Kern) | Ursache |
|---|---|
| Zahlen und Adressen werden ohne „#“ geschrieben … | alte Schreibweise `ldr R0, #13` (Zusammenfassung über alle betroffenen Zeilen) |
| Kommentare beginnen mit „#“ … „;“ und „//“ sind nicht mehr erlaubt | alte Kommentarzeichen (Zusammenfassung) |
| Der Kommentar „/*“ wird nie mit „*/“ geschlossen | Blockkommentar ohne Ende (Zeile des Beginns) |
| Das Label „x“ ist doppelt vergeben | Label zweimal definiert |
| Unbekannter Befehl „x“ | Befehlsname nicht im Befehlssatz |
| „x“ erwartet N Operanden, gefunden: M | falsche Operandenzahl |
| „x“ ist kein Register (erlaubt: R0 bis R3) | Registername ungültig |
| „x“ ist keine gültige Adresse (erlaubt: Dezimalzahl, 0x… oder 0b…) und kein bekanntes Label | Adresse unlesbar oder Label unbekannt |
| Die Adresse „x“ liegt außerhalb von 0 bis 15 | Adresse zu groß oder negativ |
| Adresse n ist bereits belegt (Zeile m) | zwei Einträge auf derselben Zelle |
| Der Speicher hat nur 16 Zellen … | zu viele Befehle/Datenbytes |
| .org erwartet eine Adresse von 0 bis 15 / .byte erwartet mindestens einen Wert / Ungültiger Byte-Wert / Unbekannte Direktive | Fehler bei Direktiven |
| Der Befehl „x“ ist nicht lesbar | Zeile folgt keiner bekannten Form |

### 6.4 Bekannte Eigenheiten

- Steht ein Label in derselben Zeile **vor** `.org`, erhält es noch die Adresse vor dem `.org`.
- Pro Zeile ist nur ein Befehl möglich (`NOP /* x */ HALT` ergibt einen Fehler).
- Beim Anzeigen des Speichers als Assembler erscheinen Daten als Befehle; Bytes, die sich nicht eindeutig als Befehl schreiben lassen, erscheinen als `.byte 0x..`. Der Text lässt sich immer wieder exakt einlesen.

---

## 7. Datenstrukturen

Die Angaben „verwendet von“ in 7.1 stammen aus der automatischen Auswertung des Quelltextes (siehe Abschnitt 8).

### 7.1 Konstanten und Tabellen

| Name | Modul | Inhalt | Verwendet von |
|---|---|---|---|
| `MEM_SIZE` | Core | Zahl `16`: Größe des Speichers | `assemble`, `disassemble`, `CPU`, `C.build`, `C.applyInitialProgram`, `C.render`; als `Core.MEM_SIZE` exportiert |
| `ALU_LABEL` | Core | Objekt Operation → Anzeigetext, z. B. `add: "A + B"`, `shl: "A << 1"`, `neg: "−A"` | `CPU.execOps`, `C.render`; als `Core.ALU_LABEL` exportiert |
| `MNEMONICS` | Core | Objekt Befehlsname → Art (`rr`, `r`, `none`, `addr`, `ra`) | `assemble` |
| `ALIAS` | Core | Objekt Kurzform → Befehlsname (`jmpn` → `jmp_n`, `jmpo` → `jmp_o`) | `assemble` |
| `ISA` | Core | Array aus 16 Zeilen `[Opcode-Muster, Mnemonic, Wirkung]` für die Referenztabelle | `C.buildReference`; als `Core.ISA` exportiert |
| `DEFAULT_ASM` | Oberfläche | Text des Beispielprogramms (4 × 3) | `C`; als `H5P.CPUVisualizer.DEFAULT_ASM` exportiert |
| `FORMATS` | Oberfläche | Array aus `{id, label}`: `bin`/Binär, `hex`/Hexadezimal, `dec`/Dezimal, `sdec`/Dezimal (Zweierkomplement) | `C`, `C.build` |
| `FORMAT_HINT` | Oberfläche | Objekt Format-ID → Eingabehinweis für Fehlermeldungen | `C.buildRow` |
| `DURATIONS` | Oberfläche | `[1400, 900, 550, 280, 0]`: Animationsdauer je Tempostufe in ms | `C.moveDuration` |
| `GAPS` | Oberfläche | `[700, 450, 250, 100, 0]`: Pause zwischen Schritten im Dauerlauf in ms | `C.toggleRun` |
| `PHASES` | Oberfläche | Array aus `{id, label}` für die drei Phasen-Etiketten | `C.build` |
| `IDLE_TEXT` | Oberfläche | Erklärtext im Ruhezustand („Bereit. …“) | `C.attach`, `C.resetCPU` |
| `SVG_NS` | Oberfläche | Namensraum-Adresse für SVG-Elemente | `aluShape` |

### 7.2 Befehlsbeschreibung (Ergebnis von `decode`)

Erzeugt von `decode`, verwendet von `CPU.fetchOps` (Decode-Schritt, Ergebnis landet in `cpu.decoded`), `CPU.execOps` (Parameter `d`), `disassemble` und `C.render` (Spalte „Als Befehl gelesen“, Decoder-Anzeige).

| Feld | Typ | Bedeutung |
|---|---|---|
| `byte` | Zahl | Das dekodierte Byte (0–255) |
| `name` | Text | Interner Name: `add sub nand inc dec shl shr neg movs nop halt jmp jmp_n jmp_o ldr str` |
| `kind` | Text | Operandenform: `rr`, `r`, `none`, `addr`, `ra` |
| `x` | Zahl | Registernummer Rx (0–3); bei `nop`/`halt` die bedeutungslosen Bits `nn` |
| `y` | Zahl | Registernummer Ry (0–3), nur bei `rr` |
| `a` | Zahl | Adresse (0–15), nur bei `addr` und `ra` |
| `opBits` | Text | Die Opcode-Bits als Binärtext (2, 4 oder 6 Stellen je nach Befehl) |
| `label` | Text | Anzeigename (`NOP`/`HALT` groß, sonst klein) |
| `text` | Text | Assembler-Schreibweise, z. B. `ldr R0, 13`, `jmp_n 5`, `HALT` |
| `explain` | Text | Erklärung der Bitfelder, z. B. „Opcode 0000 = add, x = 01 → R1, y = 10 → R2“ |

### 7.3 Strukturen des Assemblers

| Struktur | Aufbau | Erzeugt von → verwendet von |
|---|---|---|
| **Fehlerobjekt** | `{line: Zahl, message: Text}`; `message` beginnt mit „Zeile N:“ | `prepare`, `assemble` → `C.showAsmMessage` (Liste im Assembler-Block) |
| **Ergebnis von `prepare`** | `{texts: Text[], errors: Fehlerobjekt[]}`; `texts[i]` ist der kommentarfreie Code von Zeile `i + 1` | `prepare` → `assemble` |
| **Eintrag (`items`)**, nur intern | `{line, addr, kind: "ins"\|"byte", name, ops: Text[]}` bzw. `{line, addr, kind: "byte", value}` | Stufe 1 von `assemble` → Stufe 2 |
| **Labels**, nur intern | Objekt Label (klein geschrieben) → Adresse | Stufe 1 → `parseAddr` |
| **Belegung (`used`)**, nur intern | Objekt Adresse → Zeilennummer des belegenden Eintrags | Stufe 2 (Doppelbelegung prüfen) |
| **Ergebnis von `assemble`** | `{mem: Zahl[16], errors: Fehlerobjekt[], used: Zahl}` | `assemble` → `C.applyInitialProgram`, `C.loadAssembly` |

### 7.4 Prozessorzustand (Felder von `Core.CPU`)

| Feld | Typ | Bedeutung | Gesetzt von |
|---|---|---|---|
| `mem` | Zahl[16] | Arbeitsspeicher, 0–255 je Zelle | Oberfläche (Laden, Eingabe), Schritt von `str` |
| `fmt` | `{f8, f4}` | Formatierer für Erklärtexte; Standard Binär | Konstruktor; Oberfläche ersetzt ihn (`C.setFormatInternal`) |
| `regs` | Zahl[4] | Register R0–R3 | `reset`; Schritte `writeBack`, `ldr` |
| `pc` | Zahl | Programmzähler (0–15) | `reset`; Fetch 3/3; Sprünge |
| `ar` | Zahl | Adressregister (0–15) | `reset`; Fetch 1/3; `ldr`/`str` Schritt 1 |
| `ir` | Zahl | Instruktionsregister (0–255) | `reset`; Fetch 2/3 |
| `n`, `o` | Boolean | Flags Negativ und Überlauf | `reset`; ALU-Schritt `compute` |
| `alu` | `{op, a, b, res}` | Anzeigezustand der ALU; `a`, `b`, `res` sind `null`, solange nichts anliegt | `reset`; `loadAlu` (a, b), `compute` (res) |
| `decoded` | Befehlsbeschreibung oder `null` | Ergebnis des letzten Decode-Schritts | `reset`; Fetch 2/3 (löscht); Decode |
| `halted` | Boolean | Prozessor angehalten | `reset`; Schritt von `HALT` |
| `queue` | Funktion[] | Wartende Schritt-Fabriken | `reset`; `nextOp`; Decode-Schritt |
| `phase` | Text | `idle`, `fetch`, `decode` oder `execute` | `reset`; `commit` |
| `ticks` | Zahl | Zahl ausgeführter Mikroschritte | `reset`; `commit` |
| `instrs` | Zahl | Zahl vollständig ausgeführter Befehle | `reset`; `commit` des letzten Schritts |

### 7.5 Mikroschritt, Datenbewegung, Fabrik

**Mikroschritt (`op`)**, erzeugt von `nextOp` aus einer Fabrik, verbraucht von `C.execOp`:

| Feld | Typ | Bedeutung |
|---|---|---|
| `phase` | Text | `fetch`, `decode` oder `execute` |
| `text` | Text | Erklärsatz für die Anzeige |
| `moves` | Datenbewegung[] (optional) | Datenpakete, die animiert werden |
| `read` | Zahl (optional) | RAM-Adresse, die als „gelesen“ markiert wird |
| `write` | Zahl (optional) | RAM-Adresse, die als „geschrieben“ markiert wird |
| `pulse` | Text[] (optional) | Schlüssel von Knoten, die pulsieren (`pc`, `dec`, `alu`, `flags`) |
| `apply` | Funktion | Die eigentliche Zustandsänderung (wird von `commit` aufgerufen) |
| `last` | Boolean | `true`, wenn dies der letzte Schritt des Befehls ist (Decode setzt `false`) |
| `commit` | Funktion | Wird von `nextOp` ergänzt: ruft `apply`, setzt `phase`, erhöht `ticks` und ggf. `instrs` |

**Datenbewegung (`move`):** `{from, to, label}` mit Schlüsseln als `from`/`to` und dem angezeigten Wert als `label`. Erlaubte Schlüssel: `pc`, `ar`, `ir`, `r0`–`r3`, `aluA`, `aluB`, `aluR` sowie `ram:<Adresse>` (z. B. `ram:5`). `C.nodeFor` löst sie in DOM-Elemente auf.

**Fabrik:** Funktion, die mit `this` = Prozessor aufgerufen wird und den `op` erst dann berechnet. Die Warteschlange `cpu.queue` besteht aus Fabriken. `fetchOps` liefert vier davon, der Decode-Schritt hängt bei `commit` die von `execOps` gelieferten an.

### 7.6 Zustand der Oberfläche (Felder von `H5P.CPUVisualizer`)

| Feld | Gesetzt in | Bedeutung |
|---|---|---|
| `opts` | Konstruktor | Ausgewertete Optionen (7.7) |
| `contentId` | Konstruktor | H5P-Inhalts-ID; **wird nur abgelegt, nirgends verwendet** |
| `cpu` | Konstruktor | Der Prozessor (`Core.CPU`) |
| `format` | Konstruktor, `setFormatInternal` | Aktuelles Zahlenformat |
| `speed` | Konstruktor, Tempo-Regler | Tempostufe 1–5 (Standard 3) |
| `running` | `toggleRun`, `onHalted`, `resetCPU` | Dauerlauf aktiv |
| `busy` | `doStep`, `resetCPU` | Ein Mikroschritt läuft gerade |
| `token` | `resetCPU` | Zähler zum Verwerfen laufender Schritte |
| `nodes` | `build` | Objekt Schlüssel → DOM-Element der Anzeigekästen (siehe unten) |
| `rows` | `build` | Array von 16 Zeilenobjekten (siehe unten) |
| `btn` | `build`, `buildAssembler` | Schaltflächen: `step`, `instr`, `run`, `reset`, `clear`, `startup`, `dump` |
| `pills` | `build` | Phasen-Etiketten: `fetch`, `decode`, `execute` |
| `startMem` | `applyInitialProgram` | Kopie des Start-Speichers; **wird nur gesetzt, nirgends ausgewertet** |
| `root`, `canAnimate`, `activeAnims` | `attach` | Wurzelelement; Animationen möglich?; laufende Animationen |
| `speedInput`, `fmtSelect`, `counters`, `narration`, `diagram`, `busEl`, `ramMsg` | `build` | Bedienelemente und Anzeigebereiche |
| `asmArea`, `asmMsg` | `buildAssembler` | Textfeld und Meldebereich des Assemblers (fehlen ohne Assembler) |

**`nodes`:** `pc`, `ar`, `ir`, `dec` (Decoder-Kasten), `decText`, `decExplain`, `r0`–`r3`, `alu` (ALU-Behälter), `aluA`, `aluB`, `aluR`, `aluOp`, `flags` (Flag-Streifen), `flagN`, `flagO`. Die Kästen aus der Funktion `box` tragen ihr Wertfeld als `_val`.

**`rows[i]`:** `{root, addr, cell, dis, tags}`: Zeilenelement, Adresstext, Eingabefeld, „Als Befehl gelesen“-Text, Behälter für die Marken PC/AR.

### 7.7 Optionen (Parameter)

Der Konstruktor erwartet ein Objekt; `app.js` füllt es aus den URL-Parametern (2.4).

| Option | Typ | Standard | URL-Parameter | Wirkung |
|---|---|---|---|---|
| `taskText` | Text | leer | `task` | Aufgabentext oberhalb des Prozessors |
| `assembly` | Text | `DEFAULT_ASM` | `asm` | Startprogramm; leerer Text = leerer Speicher |
| `defaultFormat` | Text | `bin` | `format` | Anfangs-Zahlenformat (`bin`, `hex`, `dec`, `sdec`) |
| `showAssembler` | Boolean | `true` | `assembler` | Assembler-Block anzeigen |
| `memoryEditable` | Boolean | `true` | `editable` | Speicherzellen editierbar; sonst gesperrt, ohne „Speicher leeren“ |

Dieselben fünf Optionen gab es als Eingabefelder in der früheren H5P-Bibliothek.

### 7.8 Öffentliche Schnittstelle

- **`H5P.CPUVisualizer`**: Konstruktor `(options, contentId)`, Methode `attach($container)`; erbt von `H5P.EventDispatcher`.
- **`H5P.CPUVisualizer.Core`**: Objekt mit `MEM_SIZE`, `ISA`, `ALU_LABEL`, `decode`, `encode`, `alu`, `assemble`, `disassemble`, `parseNumber`, `prepare`, `bits`, `pad`, `CPU`. Von der Oberfläche werden `MEM_SIZE`, `ISA`, `ALU_LABEL`, `decode`, `assemble`, `disassemble`, `pad` und `CPU` genutzt; `encode`, `alu`, `parseNumber`, `prepare` und `bits` sind für Tests und Erweiterungen exportiert.
- **`H5P.CPUVisualizer.DEFAULT_ASM`**: Text des Beispielprogramms.
- **Erwartet vom Host** (liefert H5P bzw. `h5p-shim.js`): `H5P.jQuery(element)` mit Index `[0]` und `addClass`; `H5P.EventDispatcher` mit `trigger`.

## 8. Funktionsreferenz

Alle benannten Funktionen von `cpu-visualizer.js` (58 Stück) sowie die Startfunktion in `app.js` und die Nachbildungen in `h5p-shim.js`, gruppiert nach Aufgabe und in der Reihenfolge des Quelltextes.

**Schreibweise der Namen:**

- Ohne Präfix: Hilfsfunktion im Modul **Core** (`decode`, `assemble` …) bzw. in der Oberfläche (`el`, `box` …). Die Gruppenüberschrift sagt, welches Modul gemeint ist.
- `CPU.xyz`: Methode des Prozessors (`cpu.xyz`), `CPU` allein ist der Konstruktor.
- `C.xyz`: Methode der Oberfläche (`this.xyz`), `C` allein ist der Konstruktor.
- „**Lokale Hilfsfunktionen**“ sind innerhalb einer Funktion definiert und von außen nicht erreichbar.
- Anonyme Ereignis-Handler sind in Abschnitt 9 aufgelistet.
- „Ruft auf“ und „Wird aufgerufen von“ zeigen direkte Aufrufe innerhalb von `cpu-visualizer.js`. Bei Funktionen, die Ereignisse verdrahten, kommen die Aufrufe teils erst später durch die Handler.

### 8.1 Core: Hilfsfunktionen

#### `pad(s, n)`

**Zweck:** Füllt `s` links mit Nullen auf die Länge `n` auf.

**Parameter:** `s` Text oder Zahl, `n` Zielbreite.

**Rückgabe:** String.

**Wird aufgerufen von:** `bits`, `disassemble`, `fmtValue`

**Hinweise:** Wird für Binär- und Hexadezimalausgaben und für die Adressspalte der Assembler-Ausgabe benutzt.

#### `padRight(s, n)`

**Zweck:** Füllt `s` rechts mit Leerzeichen auf die Länge `n` auf (Spaltenausrichtung).

**Parameter:** `s` Text, `n` Zielbreite.

**Rückgabe:** String.

**Wird aufgerufen von:** `disassemble`

#### `bits(v, n)`

**Zweck:** Gibt die unteren `n` Bits von `v` als Binärtext mit führenden Nullen zurück, z. B. `bits(5, 4)` → `"0101"`.

**Parameter:** `v` Zahl, `n` Anzahl Bits.

**Rückgabe:** String.

**Ruft auf:** `pad`  
**Wird aufgerufen von:** `decode`, `disassemble`, `CPU`

**Hinweise:** Auch als Standard-Formatierer des Prozessors (`CPU.fmt`) und für die Erklärtexte in `decode` im Einsatz.

#### `displayName(name)`

**Zweck:** Anzeigename eines Befehls. `nop` und `halt` werden großgeschrieben (`NOP`, `HALT`), alle anderen bleiben klein.

**Parameter:** `name` interner Befehlsname.

**Rückgabe:** String.

**Wird aufgerufen von:** `decode`

#### `trim(s)`

**Zweck:** Kurzform von `s.trim()`, damit sie als Callback für `Array.map` übergeben werden kann.

**Parameter:** `s` Text.

**Rückgabe:** String.

**Wird aufgerufen von:** `assemble`

### 8.2 Core: Befehlssatz und ALU

#### `decode(b)`

**Zweck:** Zerlegt ein Byte nach dem Befehlssatz in seine Bestandteile. Das ist die einzige Stelle, an der Bitmuster in Befehle übersetzt werden. Sie wird vom Prozessor beim Dekodieren und von der Oberfläche für die Spalte „Als Befehl gelesen“ benutzt.

**Parameter:** `b` Byte (wird auf 0–255 begrenzt).

**Rückgabe:** **Befehlsbeschreibung** (siehe Abschnitt 7.2): `{byte, name, kind, x, y, a, opBits, label, text, explain}`.

**Ruft auf:** `bits`, `displayName`  
**Wird aufgerufen von:** `disassemble`, `CPU.fetchOps`, `C.render`

**Hinweise:** Jedes der 256 möglichen Bytes ergibt einen gültigen Befehl. Bei `NOP` und `HALT` stehen in `x` die bedeutungslosen Bits `nn`. Die Entscheidung läuft über die obersten Bits: `10`/`11` → `ldr`/`str`; `00` → `add`/`sub`/`nand` oder (Bits 7–4 = `0011`) `inc`/`dec`/`shl`/`shr`; `01` → (Bits 7–4 = `0100`) `neg`/`movs`/`NOP`/`HALT` oder `jmp`/`jmp_n`/`jmp_o`.

#### `encode(name, x, y, a)`

**Zweck:** Gegenstück zu `decode`: baut aus Befehlsname und Operanden das Byte.

**Parameter:** `name` interner Befehlsname, `x`/`y` Registernummern 0–3, `a` Adresse 0–15 (nicht benötigte dürfen fehlen).

**Rückgabe:** Zahl 0–255, bei unbekanntem Namen `null`.

**Wird aufgerufen von:** `assemble`, `disassemble`

**Hinweise:** `NOP` und `HALT` werden immer mit `nn = 00` kodiert. `disassemble` nutzt das, um zu erkennen, ob ein Byte eindeutig als Befehl darstellbar ist.

#### `alu(op, a, b)`

**Zweck:** Rechenwerk: berechnet Ergebnis und Flags für eine ALU-Operation. Reine Funktion ohne Zustand.

**Parameter:** `op` einer von `add sub nand inc dec shl shr neg movs`, `a` erster Operand, `b` zweiter Operand (nur für `add`, `sub`, `nand`, sonst ignoriert).

**Rückgabe:** `{res, n, o}`: `res` 8-Bit-Ergebnis, `n` Negativ-Flag (Bit 7 des Ergebnisses), `o` Überlauf-Flag (Zweierkomplement-Überlauf; Regeln siehe Abschnitt 5.3).

**Wird aufgerufen von:** `CPU.execOps`

**Hinweise:** Unbekannte Operationen verhalten sich wie `movs`.

### 8.3 Core: Assembler

#### `parseNumber(tok)`

**Zweck:** Liest eine Zahl in Dezimal-, Hexadezimal- (`0x…`) oder Binärschreibweise (`0b…`), optional mit führendem `-`.

**Parameter:** `tok` Text (Leerraum wird entfernt).

**Rückgabe:** Ganzzahl (auch negativ) oder `null`, wenn der Text keine Zahl ist.

**Wird aufgerufen von:** `assemble`

**Hinweise:** Ein führendes `#` wird nicht mehr akzeptiert (es leitet in der Assembler-Sprache einen Kommentar ein). Die Bereichsprüfung (Adresse 0–15, Byte −128–255) übernehmen die Aufrufer.

#### `prepare(src)`

**Zweck:** Erster Schritt der Assemblierung: entfernt Kommentare und liefert den Code zeilenweise. Die Zeilennummern bleiben dabei erhalten, auch wenn ein Blockkommentar über mehrere Zeilen geht. Erkennt außerdem die abgeschafften Schreibweisen und meldet sie mit einem Hinweis.

**Parameter:** `src` Assembler-Text.

**Rückgabe:** `{texts, errors}`: `texts` Array mit dem kommentarfreien Text jeder Zeile (Index 0 = Zeile 1), `errors` Array von Fehlerobjekten.

**Wird aufgerufen von:** `assemble`

**Hinweise:** Zeichenweiser Durchlauf mit einem Zustand „in Blockkommentar“. `#` bis Zeilenende ist Kommentar, `/* … */` ebenfalls (ein Blockkommentar wird durch ein Leerzeichen ersetzt). **Sonderfälle:** (1) `#` direkt vor einer Ziffer, wenn der Code davor auf `,`, einen Sprungbefehl, `.org` oder `.byte` endet → alte Schreibweise `ldr R0, #13`: das `#` wird übersprungen, die Zahl weitergelesen (keine Folgefehler) und ein Hinweis gesammelt. (2) `;` oder `//` außerhalb von Kommentaren → Hinweis, Rest der Zeile wird als Kommentar behandelt. (3) Nicht geschlossener `/*` → Fehler in der Zeile, in der er beginnt. Hinweise gleicher Art werden zu **einem** Fehler zusammengefasst („Zeilen 1, 2, 5: …“).

**Lokale Hilfsfunktionen:**

- `lineList(a)`: Formatiert eine Zeilenliste für Fehlermeldungen („Zeile 3“ bzw. „Zeilen 1, 2“), entfernt dabei Doppelte.

#### `assemble(src)`

**Zweck:** Übersetzt Assembler-Text in ein 16-Byte-Speicherabbild. Zweistufig: Stufe 1 sammelt Labels und merkt sich Befehle und Datenbytes mit ihren Adressen, Stufe 2 löst Operanden auf, kodiert und prüft auf Überschneidungen.

**Parameter:** `src` Assembler-Text.

**Rückgabe:** `{mem, errors, used}`: `mem` Array mit 16 Bytes (nicht belegte Zellen = 0), `errors` nach Zeile sortierte Fehlerobjekte `{line, message}`, `used` Anzahl belegter Zellen.

**Ruft auf:** `encode`, `parseNumber`, `trim`, `prepare`  
**Wird aufgerufen von:** `C.applyInitialProgram`, `C.loadAssembly`  
**Nutzt Konstanten/Tabellen:** `ALIAS`, `MEM_SIZE`, `MNEMONICS`

**Hinweise:** Bei `errors.length > 0` darf `mem` nicht verwendet werden (die Oberfläche lädt dann nichts). Einzelne Befehle oder Datenwerte werden pro Zeile ausgewertet; Labels (`name:`, auch mehrere vor einem Befehl) gelten ab der aktuellen Adresse. `jmpn`/`jmpo` sind Kurzformen von `jmp_n`/`jmp_o`. Bekannte Eigenheit: Steht ein Label in derselben Zeile **vor** `.org`, erhält es noch die alte Adresse.

**Lokale Hilfsfunktionen:**

- `err(line, msg)`: Fügt `{line, message: "Zeile N: …"}` zur Fehlerliste hinzu.
- `parseReg(tok, ln)`: Liest `R0`–`R3` (Groß-/Kleinschreibung egal); gibt 0–3 oder `null` (mit Fehler) zurück.
- `parseAddr(tok, ln)`: Liest eine Adresse: zuerst über `parseNumber`, sonst als Label (Kleinschreibung); prüft den Bereich 0–15; gibt die Adresse oder `null` (mit Fehler) zurück.
- `forEach-Callback über items`: Stufe 2: prüft die Operandenzahl je Befehlsart, löst Register/Adressen auf, ruft `encode`, meldet „Adresse bereits belegt“ und schreibt in `mem`.

#### `disassemble(mem)`

**Zweck:** Wandelt ein Speicherabbild in Assembler-Text zurück („Speicher als Assembler anzeigen“). Pro Zelle eine Zeile: Befehl, aufgefüllt auf 18 Zeichen, dann `# <Adresse dezimal>: <8 Bit>`.

**Parameter:** `mem` Array mit 16 Bytes.

**Rückgabe:** String mit 16 Zeilen.

**Ruft auf:** `pad`, `padRight`, `bits`, `decode`, `encode`  
**Wird aufgerufen von:** `C.dumpToAssembler`  
**Nutzt Konstanten/Tabellen:** `MEM_SIZE`

**Hinweise:** Zellen, die sich nicht eindeutig als Befehl schreiben lassen (z. B. `NOP` mit `nn ≠ 00`), erscheinen als `.byte 0x..`. Dadurch ergibt `assemble(disassemble(m))` immer wieder exakt `m` (in den Tests mit 300 Zufallsspeichern geprüft). Daten erscheinen zwangsläufig als „Befehle“.

### 8.4 Core: Prozessor (Klasse `Core.CPU`)

#### `new Core.CPU()`

**Zweck:** Konstruktor des Prozessors: legt den Speicher (16 × 0) und den Standard-Formatierer `fmt` an und ruft `reset`.

**Rückgabe:** Prozessor-Objekt (Zustandsfelder siehe Abschnitt 7.4).

**Ruft auf:** `bits`, `CPU.reset`  
**Wird aufgerufen von:** `C`  
**Nutzt Konstanten/Tabellen:** `MEM_SIZE`

**Hinweise:** Der Prozessor kennt keine Oberfläche. Die Oberfläche ersetzt `fmt` (siehe `C.setFormatInternal`), damit die Erklärtexte im gewählten Zahlenformat erscheinen.

#### `cpu.reset()`

**Zweck:** Setzt Register, PC, AR, IR, Flags, ALU-Anzeige, Decoder-Ergebnis, Warteschlange, Phase und Zähler zurück.

**Wird aufgerufen von:** `CPU`, `C.resetCPU`

**Hinweise:** **Speicher (`mem`) und Formatierer (`fmt`) bleiben erhalten.** Das IR startet mit 0, `decoded` mit `null`.

#### `cpu.f8(v)`

**Zweck:** Formatiert einen 8-Bit-Wert mit dem aktuellen Formatierer (`fmt.f8`).

**Parameter:** `v` 0–255.

**Rückgabe:** String.

**Wird aufgerufen von:** `CPU.fetchOps`, `CPU.execOps`, Mikroschritt-Fabriken in `CPU.fetchOps` und `CPU.execOps`

#### `cpu.f4(v)`

**Zweck:** Formatiert einen 4-Bit-Wert (Adresse) mit dem aktuellen Formatierer (`fmt.f4`).

**Parameter:** `v` 0–15.

**Rückgabe:** String.

**Wird aufgerufen von:** `CPU.fetchOps`, `CPU.execOps`, Mikroschritt-Fabriken in `CPU.fetchOps` und `CPU.execOps`

#### `cpu.nextOp()`

**Zweck:** Liefert den nächsten **Mikroschritt** als Beschreibung (siehe Abschnitt 7.5). Ist die Warteschlange leer, beginnt ein neuer Befehl: `fetchOps` füllt sie mit den vier Fetch/Decode-Schritten.

**Rückgabe:** Mikroschritt-Objekt oder `null`, wenn der Prozessor angehalten ist (`halted`).

**Ruft auf:** `CPU.fetchOps`  
**Wird aufgerufen von:** `C.doStep`

**Hinweise:** Ändert den Zustand **nicht**. Erst `op.commit()` führt die Änderung aus, setzt `phase`, erhöht `ticks` und – beim letzten Schritt eines Befehls – `instrs`. Der Decode-Schritt trägt `last: false`, weil seine Ausführungsschritte erst beim Commit in die Warteschlange kommen.

#### `cpu.fetchOps()`

**Zweck:** Erzeugt die vier Schritt-Fabriken, mit denen jeder Befehl beginnt: Fetch 1 (PC → AR), Fetch 2 (RAM[AR] → IR), Fetch 3 (PC + 1) und Decode.

**Rückgabe:** Array aus vier Funktionen (siehe „Fabrik“ in Abschnitt 7.5).

**Ruft auf:** `decode`, `CPU.f8`, `CPU.f4`, `CPU.execOps`  
**Wird aufgerufen von:** `CPU.nextOp`

**Hinweise:** Der Decode-Schritt ruft `decode` auf dem IR und hängt beim Commit die Ergebnisse von `execOps` an die Warteschlange.

#### `cpu.execOps(d)`

**Zweck:** Erzeugt die Schritt-Fabriken für die **Ausführung** eines dekodierten Befehls. Anzahl der Schritte je Befehlsart: `rr` und `r` drei, `none` und `addr` einer, `ra` zwei.

**Parameter:** `d` Befehlsbeschreibung aus `decode`.

**Rückgabe:** Array von Fabriken.

**Ruft auf:** `alu`, `CPU.f8`, `CPU.f4`  
**Wird aufgerufen von:** `CPU.fetchOps`  
**Nutzt Konstanten/Tabellen:** `ALU_LABEL`

**Hinweise:** Hier steckt das Verhalten jedes Befehls (Abschnitt 5.4 beschreibt es als Tabelle).

**Lokale Hilfsfunktionen:**

- `loadAlu(binary)`: Schritt 1 der ALU-Befehle: Rx (und bei `binary` auch Ry) in die ALU-Eingänge laden; setzt `alu = {op, a, b, res: null}`.
- `compute()`: Schritt 2: ruft `alu`, speichert Ergebnis in `alu.res` und setzt die Flags `n`, `o`.
- `writeBack()`: Schritt 3: Ergebnis aus der ALU in Rx schreiben.
- `jump(flag)`: Sprung: `flag` ist `null` (immer), `"n"` oder `"o"`. Bei erfüllter Bedingung IR-Adresse → PC, sonst nur Hinweis ohne Änderung.
- `loadAr()`: Schritt 1 von `ldr`/`str`: Adressfeld des IR → Adressregister.

### 8.5 Oberfläche: Hilfsfunktionen

#### `el(tag, cls, text, attrs)`

**Zweck:** Erzeugt ein DOM-Element (Klasse, Text und Attribute optional). Wird für den gesamten Aufbau verwendet.

**Parameter:** `tag` Elementname, `cls` Klassenname(n) oder `null`, `text` Inhalt (`textContent`) oder `null`, `attrs` Objekt mit Attributen oder `null`.

**Rückgabe:** Das Element.

**Wird aufgerufen von:** `box`, `flagItem`, `C.build`, `C.buildRow`, `C.buildAssembler`, `C.buildReference`, `C.showAsmMessage`, `C.render`, `C.animateChip`

**Hinweise:** Setzt Text immer über `textContent`; Inhalte werden also nie als HTML interpretiert.

#### `delay(ms)`

**Zweck:** Gibt ein Promise zurück, das nach `ms` Millisekunden erfüllt wird (bei `ms ≤ 0` sofort).

**Parameter:** `ms` Wartezeit.

**Rückgabe:** Promise.

**Wird aufgerufen von:** `C.execOp`

#### `fmtValue(v, nbits, kind)`

**Zweck:** Formatiert einen Wert für die Anzeige. `bin`: Binärtext (bei 8 Bit in zwei Vierergruppen), `hex`: `0x` plus Großbuchstaben, `dec`: vorzeichenlos, `sdec`: Zweierkomplement (nur bei 8 Bit; 4-Bit-Adressen bleiben vorzeichenlos).

**Parameter:** `v` Zahl, `nbits` 4 oder 8, `kind` Format-ID.

**Rückgabe:** String.

**Ruft auf:** `pad`  
**Wird aufgerufen von:** `C.setFormatInternal`

**Hinweise:** Wird über `C.setFormatInternal` als `cpu.fmt.f4/f8` eingehängt und dadurch auch für die Erklärtexte des Kerns genutzt.

#### `parseInput(str, kind)`

**Zweck:** Gegenstück zu `fmtValue` für das Eintippen in eine RAM-Zelle. Leerzeichen und Unterstriche werden ignoriert, Präfixe `0b`/`0x` sind optional.

**Parameter:** `str` Eingabetext, `kind` Format-ID.

**Rückgabe:** Zahl 0–255 oder `null` bei ungültiger Eingabe.

**Wird aufgerufen von:** `C.buildRow`

**Hinweise:** Bereiche: `bin` bis 8 Ziffern, `hex` 1–2 Ziffern, `dec` 0–255, `sdec` −128–255 (Werte ab 128 werden akzeptiert und wie vorzeichenlose behandelt).

#### `box(key, label, sub)`

**Zweck:** Erzeugt einen beschrifteten Anzeigekasten (`.cpuv-box`) mit Wertfeld (`<output class="cpuv-val">`).

**Parameter:** `key` Schlüssel (wird zu `data-key`), `label` Titel, `sub` optionale Zusatzzeile.

**Rückgabe:** Element; das Wertfeld hängt als `element._val` daran.

**Ruft auf:** `el`  
**Wird aufgerufen von:** `C.build`

**Hinweise:** `C.render` schreibt die Zahlen über `_val.textContent`. Die Kästen werden in `C.nodes` abgelegt.

#### `aluShape()`

**Zweck:** Erzeugt das V-förmige ALU-Symbol als SVG (Polygon mit 7 Punkten in einem 100 × 100-Koordinatensystem, `preserveAspectRatio="none"`, damit es sich der Boxgröße anpasst).

**Rückgabe:** SVG-Element (`.cpuv-alu-shape`).

**Wird aufgerufen von:** `C.build`  
**Nutzt Konstanten/Tabellen:** `SVG_NS`

**Hinweise:** Farben und Linienstärke kommen aus dem CSS (`fill`, `stroke`, `vector-effect: non-scaling-stroke`). Im Zustand `is-pulse` färbt das CSS die Kontur in der Signalfarbe.

#### `flagItem(letter, text, title)`

**Zweck:** Erzeugt eine Flag-Anzeige: Kreis mit Buchstaben plus ausgeschriebene Beschriftung.

**Parameter:** `letter` `N` oder `O`, `text` Beschriftung, `title` Tooltip.

**Rückgabe:** `{item, flag}`: Behälter und der Kreis (`flag` wird zu `nodes.flagN`/`nodes.flagO`).

**Ruft auf:** `el`  
**Wird aufgerufen von:** `C.build`

### 8.6 Oberfläche: Aufbau und Konfiguration (Klasse `H5P.CPUVisualizer`)

#### `new H5P.CPUVisualizer(options, contentId)`

**Zweck:** Konstruktor der Anwendung (intern `C`). Wertet die Optionen aus, legt den Prozessor an und initialisiert den Oberflächenzustand. Baut noch **kein** DOM, das macht `attach`.

**Parameter:** `options` Objekt `{taskText, assembly, defaultFormat, showAssembler, memoryEditable}` (alle optional, Details Abschnitt 7.7), `contentId` H5P-Inhalts-ID (wird nur abgelegt, aktuell nirgends ausgewertet).

**Rückgabe:** Instanz.

**Ruft auf:** `CPU`, `C.setFormatInternal`  
**Wird aufgerufen von:** `app.js` (Standalone) bzw. die H5P-Plattform  
**Nutzt Konstanten/Tabellen:** `DEFAULT_ASM`, `FORMATS`

**Hinweise:** Erbt von `H5P.EventDispatcher` (Aufruf `EventDispatcher.call(this)`; liefert `trigger("resize")`). Setzt Standardwerte: `speed = 3`, `running = false`, `busy = false`, `token = 0`. Ohne `assembly` wird `DEFAULT_ASM` geladen; ein leerer Text ergibt leeren Speicher.

#### `setFormatInternal(kind)`

**Zweck:** Setzt das Zahlenformat (`this.format`) und hängt neue Formatierer in `cpu.fmt` ein.

**Parameter:** `kind` `bin`, `hex`, `dec` oder `sdec`.

**Ruft auf:** `fmtValue`  
**Wird aufgerufen von:** `C`, `C.build`

**Hinweise:** Die Formatierer lesen `this.format` erst beim Aufruf, ein späterer Wechsel wirkt also sofort. Zeichnet nicht neu; das macht der Aufrufer (`render`).

#### `fmt8(v)`

**Zweck:** Kurzform für `cpu.fmt.f8(v)` (8-Bit-Wert im aktuellen Format).

**Parameter:** `v` 0–255.

**Rückgabe:** String.

**Wird aufgerufen von:** `C.buildRow`, `C.render`, Ereignis-Handler der RAM-Zellen (in `C.buildRow`)

#### `fmt4(v)`

**Zweck:** Kurzform für `cpu.fmt.f4(v)` (4-Bit-Wert im aktuellen Format).

**Parameter:** `v` 0–15.

**Rückgabe:** String.

**Wird aufgerufen von:** `C.render`

#### `attach($container)`

**Zweck:** Einstiegspunkt der H5P-Schnittstelle: hängt die Anwendung in einen Container ein. Setzt die Klasse `h5p-cpu-visualizer` (Grundlage für alle CSS-Regeln), prüft, ob Animationen möglich sind (`Element.prototype.animate` vorhanden und keine „reduzierte Bewegung“ gewünscht), baut die Oberfläche, lädt das Startprogramm, zeichnet und meldet Größenänderungen per `ResizeObserver` an den Host (`trigger("resize")`).

**Parameter:** `$container` jQuery-ähnliches Objekt: es muss `[0]` (das Element) und `addClass` bieten.

**Ruft auf:** `C.build`, `C.applyInitialProgram`, `C.render`, `C.setNarration`  
**Wird aufgerufen von:** `app.js` (Standalone) bzw. die H5P-Plattform  
**Nutzt Konstanten/Tabellen:** `IDLE_TEXT`

**Hinweise:** Wird von H5P selbst aufgerufen oder von `app.js` (mit dem Shim aus `h5p-shim.js`).

#### `build(root)`

**Zweck:** Baut die komplette Oberfläche in `root` (Werkzeugleiste, Statuszeile, Prozessor mit Steuerwerk/Registersatz/ALU, Bus, Arbeitsspeicher, Assembler-Block oder alleinstehende Referenz) und verdrahtet die Ereignisse der Schaltflächen (Tabelle in Abschnitt 9).

**Parameter:** `root` Container-Element.

**Ruft auf:** `el`, `box`, `C.setFormatInternal`, `aluShape`, `flagItem`, `C.buildRow`, `C.setRamMsg`, `C.buildAssembler`, `C.buildReference`, `C.restoreStartProgram`, `C.dumpToAssembler`, `C.render`, `C.setNarration`, `C.canInteract`, `C.doStep`, `C.doInstruction`, `C.toggleRun`, `C.resetCPU`  
**Wird aufgerufen von:** `C.attach`  
**Nutzt Konstanten/Tabellen:** `FORMATS`, `MEM_SIZE`, `PHASES`

**Hinweise:** Legt alle später gebrauchten Knoten in `this.nodes`, `this.rows`, `this.btn`, `this.pills` ab. Ohne Assembler (`showAssembler: false`) entfällt der Dump-Button; „Startprogramm laden“ steht dann im Kopf des Arbeitsspeichers. **Achtung bei „Ruft auf“:** `canInteract`, `doStep`, `doInstruction`, `toggleRun`, `resetCPU`, `restoreStartProgram`, `dumpToAssembler`, `setFormatInternal`, `render`, `setRamMsg` und `setNarration` werden nicht beim Aufbau aufgerufen, sondern erst von den hier verdrahteten Ereignis-Handlern (Abschnitt 9).

#### `buildRow(i, parent)`

**Zweck:** Erzeugt eine Zeile des Arbeitsspeichers (Adresse, Eingabefeld, „Als Befehl gelesen“, Marken PC/AR) und verdrahtet die Eingabe: Fokus markiert alles, Enter übernimmt, Escape verwirft, `change` prüft mit `parseInput` und schreibt in `cpu.mem`.

**Parameter:** `i` Adresse 0–15, `parent` Elternelement.

**Rückgabe:** Zeilenobjekt `{root, addr, cell, dis, tags}`.

**Ruft auf:** `el`, `parseInput`, `C.fmt8`, `C.setRamMsg`, `C.render`  
**Wird aufgerufen von:** `C.build`  
**Nutzt Konstanten/Tabellen:** `FORMAT_HINT`

**Hinweise:** Bei ungültiger Eingabe: roter Rand für 0,9 s, Meldung über `setRamMsg`, Zelle springt auf den alten Wert zurück.

#### `setRamMsg(text, kind)`

**Zweck:** Schreibt die Statusmeldung unter dem Arbeitsspeicher.

**Parameter:** `text` Meldung (leer = löschen), `kind` `"error"`, `"ok"` oder nichts.

**Wird aufgerufen von:** `C.build`, `C.buildRow`, `C.dumpToAssembler`

#### `buildAssembler(root)`

**Zweck:** Erzeugt den Assembler-Block: Titel, aufklappbare Referenz (`buildReference`), Textfeld mit dem Startprogramm, die Schaltflächen „In den Speicher laden“ und „Startprogramm laden“ sowie den Meldebereich.

**Parameter:** `root` Container-Element.

**Ruft auf:** `el`, `C.buildReference`, `C.loadAssembly`  
**Wird aufgerufen von:** `C.build`

#### `buildReference()`

**Zweck:** Erzeugt das aufklappbare `<details>`-Element „Befehlssatz und Assembler-Syntax“: Tabelle aus `Core.ISA` und zwei Erklärabsätze (Bedeutung der Bitfelder und Flags; Syntax).

**Rückgabe:** Das `<details>`-Element (zunächst zugeklappt).

**Ruft auf:** `el`  
**Wird aufgerufen von:** `C.build`, `C.buildAssembler`  
**Nutzt Konstanten/Tabellen:** `ISA`

**Hinweise:** Das Element wird nicht selbst eingefügt: `build` hängt es in den Assembler-Block bzw. – ohne Assembler – in einen eigenen Block. Beim Auf-/Zuklappen wird `resize` an den Host gemeldet.

#### `showAsmMessage(kind, text, errors)`

**Zweck:** Zeigt im Assembler-Block eine Meldung, optional mit Fehlerliste.

**Parameter:** `kind` `"ok"` oder `"error"`, `text` Meldung, `errors` Array von Fehlerobjekten.

**Ruft auf:** `el`  
**Wird aufgerufen von:** `C.applyInitialProgram`, `C.dumpToAssembler`, `C.loadAssembly`

**Hinweise:** Tut nichts, wenn es keinen Assembler-Block gibt (`asmMsg` fehlt).

### 8.7 Oberfläche: Darstellung und Programmverwaltung

#### `applyInitialProgram()`

**Zweck:** Assembliert `opts.assembly` und lädt das Ergebnis in den Speicher. Bei Fehlern bleibt der Speicher leer und der Assembler-Block zeigt die Fehler.

**Ruft auf:** `assemble`, `C.showAsmMessage`  
**Wird aufgerufen von:** `C.attach`, `C.restoreStartProgram`  
**Nutzt Konstanten/Tabellen:** `MEM_SIZE`

**Hinweise:** Merkt sich beim ersten Aufruf zusätzlich `startMem` (aktuell ungenutzt, siehe Abschnitt 13).

#### `restoreStartProgram()`

**Zweck:** Schaltfläche „Startprogramm laden“: stellt den ursprünglichen Programmtext im Editor und im Speicher wieder her und setzt den Prozessor zurück.

**Ruft auf:** `C.applyInitialProgram`, `C.setNarration`, `C.resetCPU`  
**Wird aufgerufen von:** `C.build`

#### `dumpToAssembler()`

**Zweck:** Schaltfläche „Speicher als Assembler anzeigen“: schreibt `disassemble(cpu.mem)` in das Textfeld und meldet den Vorgang im Assembler-Block und unter dem Arbeitsspeicher.

**Ruft auf:** `disassemble`, `C.setRamMsg`, `C.showAsmMessage`  
**Wird aufgerufen von:** `C.build`

**Hinweise:** Tut nichts ohne Assembler-Block.

#### `loadAssembly()`

**Zweck:** Schaltfläche „In den Speicher laden“: assembliert den Text im Editor. Bei Fehlern: Fehlerliste, **Speicher bleibt unverändert**. Sonst: Speicher überschreiben, Prozessor zurücksetzen, Erfolgsmeldung mit Anzahl belegter Zellen.

**Ruft auf:** `assemble`, `C.showAsmMessage`, `C.setNarration`, `C.resetCPU`  
**Wird aufgerufen von:** `C.buildAssembler`

#### `render()`

**Zweck:** Zeichnet den gesamten Zustand neu: PC, AR, IR, Register, ALU-Felder und Operation, Flags (Klasse `is-on` und `aria-label`), Decoder-Text, alle 16 Speicherzeilen (Adresse, Wert, Befehlstext, PC/AR-Marken), Phasenanzeige, Zähler und Schaltflächen.

**Ruft auf:** `decode`, `el`, `C.fmt8`, `C.fmt4`, `C.setPhaseIndicator`, `C.updateButtons`  
**Wird aufgerufen von:** `C.attach`, `C.build`, `C.buildRow`, `C.execOp`, `C.resetCPU`  
**Nutzt Konstanten/Tabellen:** `ALU_LABEL`, `MEM_SIZE`

**Hinweise:** Einziger Weg, wie Zustand auf den Bildschirm kommt. Ein Eingabefeld mit Fokus wird nicht überschrieben, damit beim Tippen nichts verloren geht.

#### `setPhaseIndicator(phase)`

**Zweck:** Hebt das Etikett der aktuellen Phase hervor (`fetch`, `decode`, `execute`; bei `idle` keines).

**Parameter:** `phase` Phasenname.

**Wird aufgerufen von:** `C.render`, `C.execOp`

#### `setNarration(text)`

**Zweck:** Setzt den Erklärtext unter der Statuszeile (ein `aria-live`-Bereich, wird also von Screenreadern vorgelesen).

**Parameter:** `text` Text.

**Wird aufgerufen von:** `C.attach`, `C.build`, `C.restoreStartProgram`, `C.loadAssembly`, `C.execOp`, `C.onHalted`, `C.resetCPU`

#### `canInteract()`

**Zweck:** Prüft, ob manuelle Schritte erlaubt sind: nicht im Dauerlauf, nicht mitten in einer Animation, nicht angehalten.

**Rückgabe:** Boolean.

**Wird aufgerufen von:** `C.build`, `C.updateButtons`

#### `updateButtons()`

**Zweck:** Setzt den Aktivierungszustand der Schaltflächen und die Beschriftung von „Start“/„Pause“.

**Ruft auf:** `C.canInteract`  
**Wird aufgerufen von:** `C.render`, `C.doStep`, `C.toggleRun`, `C.onHalted`

**Hinweise:** „Takt“ und „Befehl“ sind nur bei `canInteract()` aktiv. „Start/Pause“ ist nach HALT gesperrt und während eines manuellen Schritts. „Zurücksetzen“ ist immer aktiv.

### 8.8 Oberfläche: Ablaufsteuerung und Animation

#### `moveDuration()`

**Zweck:** Animationsdauer eines Mikroschritts in Millisekunden gemäß Tempo-Regler (Tabelle `DURATIONS`; Stufe 5 = 0, also ohne Animation).

**Rückgabe:** Zahl.

**Wird aufgerufen von:** `C.execOp`  
**Nutzt Konstanten/Tabellen:** `DURATIONS`

#### `nodeFor(key)`

**Zweck:** Löst einen Schlüssel aus einer Datenbewegung in ein DOM-Element auf (`"ram:5"` → Eingabefeld der Zeile 5, sonst `nodes[key]`).

**Parameter:** `key` Schlüssel (Abschnitt 7.5).

**Rückgabe:** Element.

**Wird aufgerufen von:** `C.animateChip`, `C.execOp`

#### `centerOf(node)`

**Zweck:** Mittelpunkt eines Elements in Koordinaten relativ zum Diagramm (Grundlage der Animationspfade).

**Parameter:** `node` Element.

**Rückgabe:** `{x, y}`.

**Wird aufgerufen von:** `C.animateChip`

#### `useBus()`

**Zweck:** Prüft, ob der Bus sichtbar ist (im gestapelten, schmalen Layout ist er ausgeblendet).

**Rückgabe:** Boolean.

**Wird aufgerufen von:** `C.animateChip`, `C.execOp`

**Hinweise:** Datenpakete laufen nur dann über den Bus; sonst geradlinig.

#### `animateChip(m, dur)`

**Zweck:** Animiert ein Datenpaket („Chip“) von der Quelle zum Ziel einer Datenbewegung `m`, wenn möglich über den Bus (waagerecht zum Bus, senkrecht entlang, waagerecht zum Ziel). Nutzt die Web Animations API.

**Parameter:** `m` Datenbewegung `{from, to, label}`, `dur` Dauer in ms.

**Rückgabe:** Promise, das nach Ende (oder Abbruch) der Animation erfüllt wird.

**Ruft auf:** `el`, `C.nodeFor`, `C.centerOf`, `C.useBus`  
**Wird aufgerufen von:** `C.execOp`

**Hinweise:** Ohne Animation (`dur ≤ 0` oder `canAnimate` falsch) sofort erfüllt. Das Paket wird nach dem Ende entfernt. Laufende Animationen stehen in `activeAnims`, damit `clearVisuals` sie abbrechen kann.

#### `clearVisuals()`

**Zweck:** Bricht laufende Animationen ab, entfernt alle Datenpakete und alle Hervorhebungsklassen (`is-src`, `is-dst`, `is-read`, `is-write`, `is-pulse`, `is-active`).

**Wird aufgerufen von:** `C.execOp`, `C.resetCPU`

#### `execOp(op, tok)`

**Zweck:** Führt einen Mikroschritt sichtbar aus: Erklärtext und Phase anzeigen, Quellen/Ziele/Zeilen/Bus hervorheben, Datenpakete animieren (Schritte ohne Datenbewegung warten 60 % der Dauer), danach `op.commit()` und neu zeichnen.

**Parameter:** `op` Mikroschritt von `cpu.nextOp()`, `tok` Token zum Zeitpunkt des Starts.

**Rückgabe:** Promise<Boolean>: `true`, wenn der Schritt ausgeführt wurde; `false`, wenn er wegen eines zwischenzeitlichen Resets verworfen wurde (Token stimmt nicht mehr, der Zustand wird dann nicht verändert).

**Ruft auf:** `delay`, `C.render`, `C.setPhaseIndicator`, `C.setNarration`, `C.moveDuration`, `C.nodeFor`, `C.useBus`, `C.animateChip`, `C.clearVisuals`  
**Wird aufgerufen von:** `C.doStep`

#### `doStep()`

**Zweck:** Führt genau einen Mikroschritt aus (Schaltfläche „Takt“, auch Baustein der anderen Läufe). Setzt `busy` für die Dauer des Schritts.

**Rückgabe:** Promise<Boolean> wie `execOp`.

**Ruft auf:** `CPU.nextOp`, `C.updateButtons`, `C.execOp`, `C.onHalted`  
**Wird aufgerufen von:** `C.build`, `C.doInstruction`, `C.toggleRun`

**Hinweise:** Liefert `false`, wenn gerade ein Schritt läuft oder der Prozessor angehalten ist; löst in letzterem Fall `onHalted` aus.

#### `doInstruction()`

**Zweck:** Schaltfläche „Befehl“: führt Mikroschritte aus, bis der aktuelle Befehl fertig ist (`cpu.queue` leer), der Prozessor hält oder ein Reset dazwischenkommt.

**Rückgabe:** Promise.

**Ruft auf:** `C.doStep`  
**Wird aufgerufen von:** `C.build`

**Lokale Hilfsfunktionen:**

- `loop()`: Rekursive Hilfsfunktion: ein `doStep`, dann – falls nötig – erneut.

#### `toggleRun()`

**Zweck:** Schaltfläche „Start/Pause“. Beim Start läuft eine Schleife aus `doStep` und einer Pause (Tabelle `GAPS`, mindestens ein `setTimeout`, damit die Seite bedienbar bleibt). „Pause“ setzt nur `running = false`: der laufende Mikroschritt wird noch zu Ende geführt.

**Ruft auf:** `C.updateButtons`, `C.doStep`  
**Wird aufgerufen von:** `C.build`  
**Nutzt Konstanten/Tabellen:** `GAPS`

**Hinweise:** Die Schleife endet bei HALT, Pause, Reset oder wenn `doStep` `false` liefert.

**Lokale Hilfsfunktionen:**

- `loop()`: Schleife: Zustand prüfen, `doStep`, dann mit `setTimeout` erneut.

#### `onHalted()`

**Zweck:** Reaktion auf HALT: beendet den Dauerlauf, zeigt „Programm beendet …“ an und aktualisiert die Schaltflächen.

**Ruft auf:** `C.setNarration`, `C.updateButtons`  
**Wird aufgerufen von:** `C.doStep`

#### `resetCPU()`

**Zweck:** Schaltfläche „Zurücksetzen“ (und Teil von Laden/Leeren): erhöht das Token (verwirft laufende Schritte), beendet Dauerlauf und Sperre, räumt die Anzeige auf, setzt den Prozessor zurück (Speicher bleibt) und zeichnet neu.

**Ruft auf:** `CPU.reset`, `C.render`, `C.setNarration`, `C.clearVisuals`  
**Wird aufgerufen von:** `C.build`, `C.restoreStartProgram`, `C.loadAssembly`  
**Nutzt Konstanten/Tabellen:** `IDLE_TEXT`

### 8.9 Startcode und H5P-Nachbildung

#### `app.js` (sofort ausgeführte Funktion)

**Zweck:** Startet die Anwendung auf der Webseite. Liest die URL-Parameter, bildet daraus das Optionenobjekt, markiert den Rahmenbetrieb und erzeugt und hängt die Anwendung ein.

**Ablauf:** (1) `window.location.search` wird in Paare zerlegt und mit `decodeURIComponent` gelesen (bei ungültiger %-Folge bleibt der Text unverändert); das Ergebnis liegt im Objekt `params`. (2) Die lokale Hilfsstruktur `q` mit `q.get(name)` liefert den Wert oder `null`. (3) `flag(name, def)` macht daraus Ja/Nein (`0`, `false`, `nein` = aus, sonst ein). (4) `opts` wird gefüllt (`task`, `format`, `assembler`, `editable`, `asm`; bei `asm` wird `|` durch Zeilenumbruch ersetzt). (5) Läuft die Seite in einem Rahmen (`window.self !== window.top`), erhält `<html>` die Klasse `cpuv-embedded`. (6) `new H5P.CPUVisualizer(opts, 0).attach(H5P.jQuery(app))` mit `app = document.getElementById("app")`.

**Ruft auf:** `H5P.CPUVisualizer` (Konstruktor `C`), `C.attach`, `H5P.jQuery` (aus `h5p-shim.js`)  
**Wird aufgerufen von:** dem Browser beim Laden von `index.html` (letztes Skript)

**Hinweise:** Verwendet bewusst kein `URLSearchParams`, damit `+` ein Pluszeichen bleibt (Abschnitt 2.4).

#### `H5P.jQuery(el)` (in `h5p-shim.js`)

**Zweck:** Minimaler Ersatz für `H5P.jQuery`. Verpackt ein DOM-Element so, dass `attach` es benutzen kann.

**Parameter:** `el` Element. **Rückgabe:** `{0: el, addClass(c)}`; `addClass` setzt eine CSS-Klasse und gibt das Objekt zurück.

**Wird aufgerufen von:** `app.js`; in `cpu-visualizer.js` wird `H5P.jQuery` nur als Parameter der äußeren Funktion eingelesen und nicht selbst aufgerufen.

#### `H5P.EventDispatcher()`, `.on(type, fn)`, `.trigger(type)` (in `h5p-shim.js`)

**Zweck:** Minimaler Ersatz für die Ereignisverwaltung von H5P. Der Konstruktor legt `_listeners = {}` an; `on` registriert eine Funktion für einen Ereignistyp; `trigger` ruft alle dafür registrierten Funktionen auf (mit `this` = Objekt).

**Wird aufgerufen von:** dem Konstruktor `C` (`EventDispatcher.call(this)`), `C.prototype` erbt davon (`Object.create(EventDispatcher.prototype)`); `C.attach`, `C.showAsmMessage` und die `toggle`-Handler rufen `trigger("resize")` auf.

**Hinweise:** Im Standalone-Betrieb hört niemand auf `resize`; die Aufrufe laufen ins Leere. In echtem H5P meldet das Ereignis dem Host die neue Größe.


---

## 9. Ereignisbehandlung

Die Ereignis-Handler sind anonyme Funktionen, die in `build`, `buildRow`, `buildAssembler`, `buildReference` und `attach` verdrahtet werden. Sie rufen die benannten Funktionen aus Abschnitt 8 auf.

| Ereignis | Element | Wirkung | Ruft auf |
|---|---|---|---|
| Klick | „Takt“ | ein Mikroschritt, wenn `canInteract()` | `canInteract`, `doStep` |
| Klick | „Befehl“ | ganzen Befehl ausführen, wenn `canInteract()` | `canInteract`, `doInstruction` |
| Klick | „Start/Pause“ | Dauerlauf starten bzw. anhalten | `toggleRun` |
| Klick | „Zurücksetzen“ | Prozessor zurücksetzen, Speicher bleibt | `resetCPU` |
| Eingabe | Tempo-Regler | `speed` setzen (1–5) | – |
| Änderung | Zahlenformat | Format setzen, Meldung löschen, neu zeichnen | `setFormatInternal`, `setRamMsg`, `render` |
| Klick | „Speicher leeren“ | alle Zellen auf 0, Prozessor zurücksetzen, Erklärtext | `resetCPU`, `setNarration` |
| Klick | „Startprogramm laden“ | Programmtext und Speicher wiederherstellen | `restoreStartProgram` |
| Klick | „Speicher als Assembler anzeigen“ | Speicher in das Textfeld schreiben | `dumpToAssembler` |
| Klick | „In den Speicher laden“ | Programmtext assemblieren und laden | `loadAssembly` |
| Fokus / Taste Enter / Escape | RAM-Zelle | alles markieren / übernehmen / verwerfen | – |
| Änderung | RAM-Zelle | Eingabe prüfen und in den Speicher schreiben | `parseInput`, `setRamMsg`, `fmt8`, `render` |
| Verlassen | RAM-Zelle | Zelle im aktuellen Format neu schreiben | `fmt8` |
| Auf-/Zuklappen | Befehlssatz-Referenz | Größenänderung an den Host melden | `trigger("resize")` |
| Größenänderung | Wurzelelement (`ResizeObserver`) | Größenänderung an den Host melden | `trigger("resize")` |

---

## 10. Oberfläche und CSS

### 10.1 Aufbau des DOM

```
.h5p-cpu-visualizer                 Wurzel (Klasse setzt attach; im Standalone ist es <div id="app">)
├─ p.cpuv-task                      Aufgabentext (nur wenn gesetzt)
├─ div.cpuv-toolbar                 Takt · Befehl · Start/Pause · Zurücksetzen · Tempo · Zahlenformat
├─ div.cpuv-status                  Phasen-Etiketten (.cpuv-pill) und Zähler (.cpuv-counters)
├─ p.cpuv-narration                 Erklärtext (aria-live)
├─ div.cpuv-diagram                 Raster: Prozessor | Bus | Arbeitsspeicher; Datenpakete (.cpuv-chip) landen hier
│  ├─ section.cpuv-frame.cpuv-cpu   „Prozessor“ (neutral, ohne Farbton; Container für drei Blöcke)
│  │  ├─ section.cpuv-block.cpuv-hue-control.cpuv-control   Steuerwerk: PC, AR, IR, Decoder (.cpuv-box)
│  │  └─ div.cpuv-cpu-body
│  │     ├─ section.cpuv-block.cpuv-hue-regs.cpuv-regs       Registersatz R0–R3
│  │     └─ section.cpuv-block.cpuv-hue-alu.cpuv-alu-block   ALU (.cpuv-alu: SVG-V-Form, Eingänge, Operation, Ergebnis) und Flags
│  ├─ div.cpuv-bus                  Bus (nur im breiten Layout sichtbar)
│  └─ section.cpuv-block.cpuv-hue-ram.cpuv-ram   Arbeitsspeicher: Kopf (.cpuv-ram-head), 16 × .cpuv-row, Fuß (.cpuv-ram-foot), Meldung (.cpuv-ram-msg)
└─ section.cpuv-block.cpuv-hue-asm.cpuv-asm      Assembler: Titel, details.cpuv-ref, textarea.cpuv-asm-text, Schaltflächen (.cpuv-asm-btns), Meldung (.cpuv-asm-msg)
```

Ohne Assembler (`assembler=0`) steht statt des Assembler-Blocks ein Block `.cpuv-asm` nur mit der Referenz.

### 10.2 Farben und Gestaltungsvariablen

Alle Farben stehen als CSS-Variablen am Anfang von `cpu-visualizer.css`.

| Variable | Wert | Verwendung |
|---|---|---|
| `--ink` | `#1c2733` | Text, Rahmen des Prozessors, aktive Schaltfläche |
| `--muted` | `#465565` | Zusatztext |
| `--line` | `#c4cfdb` | neutrale Linien (Bus, Phasen-Etiketten) |
| `--paper` | `#eef2f6` | Seitenhintergrund |
| `--surface` | `#ffffff` | Hintergrund des Prozessor-Rahmens und neutraler Flächen |
| `--mono` | Schriftfamilie (Systemschrift mit fester Zeichenbreite) | Zahlen, Code, Assembler-Text |
| `--signal` | `#c2185b` | **Aktivität:** Datenpakete, Quelle/Ziel, Bus, Hervorhebungen |
| `--signal-soft`, `--signal-strong` | `#fde4ee`, `#f8b7cf` | Füllung des Ziels; Lese-/Schreib-Zeile im RAM |
| `--ok`, `--err` | `#1d6b47`, `#b3261e` | Erfolgs- und Fehlermeldungen |

Jeder große Block hat einen eigenen Farbton aus drei Werten: `--bg` (Block), `--sub` (Unterblöcke, dunkler), `--edge` (Rand). Sie werden über die Klassen `cpuv-hue-*` gesetzt.

| Block | Klasse | `--bg` | `--sub` | `--edge` |
|---|---|---|---|---|
| Steuerwerk (Blau) | `cpuv-hue-control` | `#e3ecf8` | `#c6d9ef` | `#6f98c8` |
| Registersatz (Grün) | `cpuv-hue-regs` | `#e2f2e7` | `#c3e2cd` | `#6fae85` |
| ALU (Bernstein) | `cpuv-hue-alu` | `#fbeed4` | `#f2d9a0` | `#c4953a` |
| Arbeitsspeicher (Violett) | `cpuv-hue-ram` | `#ebe5f6` | `#d6caec` | `#9480c2` |
| Assembler (Türkis) | `cpuv-hue-asm` | `#dcf0f1` | `#bde0e3` | `#5fa9b0` |

Die ALU-V-Form hat zusätzlich die lokale Variable `--alu-fill` (`#fff8e8`). Die Aktivitätsfarbe `--signal` kommt bewusst in keinem Blockton vor. **Kontrast:** Alle Text-Hintergrund-Kombinationen wurden gerechnet und liegen über 4,5 : 1. Nach Farbänderungen erneut prüfen.

Gestaltungsregeln: **Eingabefelder** (RAM-Zellen, Textfeld, Formatauswahl) wirken eingelassen (innerer Schatten), **Schaltflächen** erhaben (äußerer Schatten, sinken beim Klicken ein), gesperrte Zellen sind flach.

### 10.3 Zustandsklassen

| Klasse | Gesetzt von | Wirkung |
|---|---|---|
| `is-src` | `execOp` | Quelle einer Datenbewegung: Umriss in Signalfarbe |
| `is-dst` | `execOp` | Ziel einer Datenbewegung: Umriss und helle Füllung |
| `is-pulse` | `execOp` | Berechnung/Dekodierung: gestrichelter Umriss; bei der ALU färbt sich die V-Kontur |
| `is-read`, `is-write` | `execOp` | RAM-Zeile wird gelesen bzw. geschrieben (Hintergrund) |
| `is-active` | `execOp` (Bus), `setPhaseIndicator` (Etikett) | Bus leuchtet; aktive Phase hervorgehoben |
| `is-on` | `render` | Flag ist gesetzt |
| `is-invalid` | RAM-Zelle | Ungültige Eingabe (roter Rand, 0,9 s) |
| `is-error`, `is-ok` | `setRamMsg`, `showAsmMessage` | Farbe der Meldung |

`clearVisuals` entfernt `is-src`, `is-dst`, `is-read`, `is-write`, `is-pulse` und `is-active` im Diagramm nach jedem Schritt.

### 10.4 Anpassung an die Breite

- **Breiter als 900 px:** Prozessor, Bus und Arbeitsspeicher stehen nebeneinander.
- **Bis 900 px:** `@media (max-width: 900px)` stapelt Prozessor und Arbeitsspeicher untereinander; der Bus ist ausgeblendet (`display: none`), Datenpakete laufen dann geradlinig (`useBus()`).
- **Register:** Der Prozessor-Block ist ein „Container“ (`container: cpuv / inline-size`). Ist er schmaler als 456 px, zeigt der Registersatz zwei mal zwei statt vier nebeneinander (`@container cpuv (max-width: 456px)`).
- **Bewegungsreduktion:** Wer „Bewegung reduzieren“ eingestellt hat, sieht keine Datenpakete (`canAnimate` ist dann falsch) und keine Übergänge.
- **ALU:** Die V-Form ist höchstens 440 px breit und zentriert.

Klassen, die nur im JavaScript vorkommen (kein CSS, dienen als Anker für Tests und Erweiterungen): `cpuv-alu-block`, `cpuv-control`, `cpuv-dec`, `cpuv-regs`, `cpuv-ram`.

### 10.5 Klassenverzeichnis

Alle CSS-Klassen der Anwendung (alle mit Präfix `cpuv-`) und die Funktion, die sie erzeugt. Zustandsklassen (`is-*`) stehen in 10.3, die Wurzelklasse `h5p-cpu-visualizer` und `cpuv-embedded` in 4.5 und 10.1.

| Klasse | Bedeutung | Erzeugt in |
|---|---|---|
| `cpuv-task` | Aufgabentext oberhalb der Werkzeugleiste | `C.build` |
| `cpuv-toolbar` | Werkzeugleiste mit Schaltflächen und Reglern | `C.build` |
| `cpuv-btn` | Schaltfläche (erhaben, mit Schatten) | `C.build`, `C.buildAssembler` |
| `cpuv-btn-primary` | Dunkle Hauptschaltfläche („Start“, „In den Speicher laden“) | `C.build`, `C.buildAssembler` |
| `cpuv-btn-small` | Kleine Schaltfläche im Kopf des Arbeitsspeichers | `C.build` |
| `cpuv-ctl` | Beschriftetes Bedienelement der Werkzeugleiste (Tempo, Zahlenformat) | `C.build` |
| `cpuv-status` | Statuszeile aus Phasen-Etiketten und Zähler | `C.build` |
| `cpuv-pills`, `cpuv-pill` | Behälter und einzelnes Phasen-Etikett (aktiv: `is-active`) | `C.build` |
| `cpuv-counters` | Zähler „Takte / Befehle“ | `C.build` |
| `cpuv-narration` | Erklärtext des aktuellen Schritts (`aria-live`) | `C.build` |
| `cpuv-diagram` | Raster Prozessor ∣ Bus ∣ Arbeitsspeicher; Bezugsrahmen für die Datenpakete (`position: relative`) | `C.build` |
| `cpuv-frame` | Neutraler Rahmen mit dunklem Rand (Prozessor) | `C.build` |
| `cpuv-cpu` | Prozessor-Rahmen (Spalte) und Container `cpuv` für Container-Queries | `C.build` |
| `cpuv-cpu-body` | Behälter für Registersatz und ALU | `C.build` |
| `cpuv-title` | Überschrift (h3) eines Rahmens oder Blocks | `C.build`, `C.buildAssembler` |
| `cpuv-block` | Grundstil eines farbigen Blocks (Hintergrund `--bg`, Rand `--edge`) | `C.build`, `C.buildAssembler` |
| `cpuv-block-title` | Überschrift (h4) eines Blocks im Prozessor | `C.build` |
| `cpuv-hue-control`, `cpuv-hue-regs`, `cpuv-hue-alu`, `cpuv-hue-ram`, `cpuv-hue-asm` | Farbton eines Blocks (10.2) | `C.build`, `C.buildAssembler` |
| `cpuv-control`, `cpuv-regs`, `cpuv-alu-block`, `cpuv-ram` | Nur Anker für Tests und Erweiterungen (kein eigener Stil): Steuerwerk, Registersatz, ALU-Block, Arbeitsspeicher | `C.build` |
| `cpuv-grid`, `cpuv-grid-2`, `cpuv-grid-regs` | Raster für Anzeigekästen: allgemein, zwei Spalten (Steuerwerk), Register (vier bzw. zwei Spalten) | `C.build` |
| `cpuv-box` | Anzeigekasten (Unterblock in `--sub`) für PC, AR, IR, Decoder, Register und ALU-Felder | `box` |
| `cpuv-lab`, `cpuv-sub`, `cpuv-val` | Titel, Zusatzzeile und Wertfeld (`<output>`) eines Anzeigekastens | `box` |
| `cpuv-dec`, `cpuv-dec-text`, `cpuv-dec-explain` | Decoder-Kasten; erkannter Befehl; Erklärung der Bitfelder (`cpuv-dec` ohne eigenen Stil) | `C.build` |
| `cpuv-alu` | ALU-Behälter: Raster mit SVG-V-Form und den Feldern A, B, Operation, Ergebnis | `C.build` |
| `cpuv-alu-shape` | Das SVG der V-Form | `aluShape` |
| `cpuv-alu-a`, `cpuv-alu-b`, `cpuv-alu-r`, `cpuv-alu-op` | Plätze im ALU-Raster: Eingang A, Eingang B, Ergebnis (zentriert), Anzeige der Operation | `C.build` |
| `cpuv-aluop` | Wertfeld der Operation (z. B. „A + B“) | `C.build` |
| `cpuv-flags`, `cpuv-flags-title` | Flag-Streifen unter der ALU und das Wort „Flags“ | `C.build` |
| `cpuv-flag-item`, `cpuv-flag`, `cpuv-flag-text` | Eine Flag-Anzeige, ihr Kreis (gesetzt: `is-on`) und die Beschriftung | `flagItem` |
| `cpuv-bus`, `cpuv-bus-label` | Busstreifen zwischen Prozessor und Speicher und seine gedrehte Beschriftung | `C.build` |
| `cpuv-chip` | Datenpaket während der Animation | `C.animateChip` |
| `cpuv-ram-head`, `cpuv-ram-btns` | Kopfzeile des Arbeitsspeichers mit Titel und Schaltflächen | `C.build` |
| `cpuv-row`, `cpuv-row-head` | Zeile des Arbeitsspeichers (vier Spalten) bzw. die Spaltenüberschriften | `C.build`, `C.buildRow` |
| `cpuv-addr`, `cpuv-cell`, `cpuv-dis` | Adresse, Eingabefeld und „Als Befehl gelesen“ einer Zeile | `C.buildRow` |
| `cpuv-tags`, `cpuv-tag`, `cpuv-tag-pc`, `cpuv-tag-ar` | Behälter und Marken „PC“/„AR“ neben der Zeile, auf die sie zeigen | `C.buildRow`, `C.render` |
| `cpuv-ram-foot` | Fußzeile des Arbeitsspeichers mit „Speicher als Assembler anzeigen“ | `C.build` |
| `cpuv-ram-msg` | Meldung unter dem Arbeitsspeicher (`is-error`, `is-ok`) | `C.build` |
| `cpuv-asm` | Assembler-Block bzw. Block nur mit der Referenz | `C.build`, `C.buildAssembler` |
| `cpuv-asm-text` | Textfeld für das Assembler-Programm (eingelassen) | `C.buildAssembler` |
| `cpuv-asm-btns`, `cpuv-asm-msg` | Zeile mit den Assembler-Schaltflächen; Meldebereich (`is-error`, `is-ok`) | `C.buildAssembler` |
| `cpuv-ref`, `cpuv-ref-wrap`, `cpuv-ref-table`, `cpuv-mono` | Aufklappbare Referenz; waagerecht scrollbarer Tabellenbehälter; Tabelle; Schrift fester Breite in Tabellenzellen | `C.buildReference` |

### 10.6 Browser-Anforderungen

- **Erforderlich:** `Promise`, `classList`, `<details>`, CSS Grid und Flexbox, SVG.
- **Optional mit Rückfall:** Web Animations API (`Element.animate`; ohne sie fehlen nur die Datenpakete), `ResizeObserver` (ohne ihn meldet die Anwendung Größenänderungen nicht an den Host), CSS-Container-Queries (ohne sie bleiben immer vier Register nebeneinander).

---

## 11. Typische Änderungen

### 11.1 Befehlssatz ändern

Der Befehlssatz belegt **alle 256 Bitmuster**. Ein zusätzlicher Befehl muss ein bestehendes Muster ersetzen (z. B. die bedeutungslosen `nn`-Bits von `NOP`/`HALT` nutzen) oder die Befehlsbreite ändern. Stellen, die zu ändern sind:

1. `decode` und `encode` (Bitmuster),
2. `MNEMONICS` (Operandenform) und gegebenenfalls `ALIAS`,
3. bei ALU-Befehlen `alu` und `ALU_LABEL`, sonst die Fabriken in `CPU.execOps`,
4. `ISA` (Referenztabelle) und die Beschreibung der Flags in `buildReference`,
5. diese Dokumentation (5.2 bis 5.4).

### 11.2 Flag-Regeln ändern

Nur in `alu` (je ein Fall pro Operation). Danach 5.3 und den Text in `buildReference` anpassen.

### 11.3 Speichergröße ändern

Nicht allein über `MEM_SIZE` möglich: Die **4-Bit-Adresse ist im Befehlsformat fest verdrahtet** (`aaaa`, `& 15`, `bits(…, 4)`, Adressfelder in `decode`, Formatierung `f4`). Eine Änderung verlangt ein neues Befehlsformat.

### 11.4 Zahlenformat hinzufügen

`FORMATS` (Eintrag), `fmtValue` (Darstellung), `parseInput` (Eingabe) und `FORMAT_HINT` (Hinweistext).

### 11.5 URL-Parameter hinzufügen

In `app.js` den Parameter auslesen und ins Optionenobjekt übernehmen; im Konstruktor `C` die Option in `this.opts` aufnehmen und dort verwenden; Abschnitte 2.4 und 7.7 ergänzen.

### 11.6 Farben anpassen

Variablen am Anfang von `cpu-visualizer.css` (10.2); danach Kontrast prüfen.

### 11.7 Texte ändern oder übersetzen

Alle sichtbaren Texte stehen im JavaScript: Beschriftungen in `build`, `buildAssembler`, `buildReference`; Erklärsätze der Mikroschritte in `CPU.fetchOps` und `CPU.execOps`; Fehlermeldungen in `prepare` und `assemble`; Meldungen der Oberfläche in den Methoden von `C`. Es gibt keine Sprachdateien.

### 11.8 Weitere Anwendung ins Repository aufnehmen

1. Neuen Ordner `apps/<name>/` mit eigener `index.html` anlegen; alle Pfade **relativ** schreiben (`style.css`, nicht `/style.css`).
2. Auf der Startseite `index.html` einen Link ergänzen.
3. Ordnernamen später **nicht ändern**: Moodle-Aktivitäten enthalten die Adresse.
4. In Moodle eine eigene Iframe-Embedder-Aktivität mit der neuen Adresse anlegen.

---

## 12. Tests und Qualitätssicherung

Die bei der Entwicklung benutzten automatischen Tests (rund 1 200 Prüfungen) liegen **nicht im Repository**. Sie deckten ab: alle 256 Bytes (`decode`/`encode`), ALU-Randfälle, Assembler (Kommentare, Zahlenformate, Labels, alle Fehlerfälle, Hin- und Rückübersetzung mit 300 Zufallsspeichern), Programmläufe, Aufbau der Oberfläche und Bedienung im echten Browser bei 390 bis 1100 px Breite. Die Tests können auf Wunsch nachgeliefert werden.

### 12.1 Kern ohne Browser prüfen

Der Kern braucht kein DOM. Mit Node.js genügt ein kleiner Stub für `H5P`:

```js
// test.js – Aufruf im Repository-Hauptverzeichnis: node test.js
global.H5P = { jQuery() {}, EventDispatcher: function () { this.trigger = function () {}; } };
H5P.EventDispatcher.prototype = {};
(0, eval)(require('fs').readFileSync('apps/cpu-visualizer/cpu-visualizer.js', 'utf8'));
const { Core } = H5P.CPUVisualizer;

const r = Core.assemble('ldr R0, 13\ninc R0\nHALT\n.org 13\n.byte 5');
const cpu = new Core.CPU();
cpu.mem = r.mem.slice();
while (!cpu.halted) cpu.nextOp().commit();   // Mikroschritte, bis HALT
console.log(r.errors.length, cpu.regs[0], cpu.ticks, cpu.instrs);   // 0 6 18 3
```

### 12.2 Manuelle Prüfliste

1. Seite öffnen: Beispielprogramm steht im Speicher, Meldung „Bereit …“.
2. „Takt“ viermal: Fetch 1/3, 2/3, 3/3, Decode; Phasen-Etiketten wechseln, Datenpakete laufen.
3. „Befehl“ und „Start“ bis HALT: Ergebnis 12 (`0000 1100`) in Zelle 15, Zähler „Takte: 121, Befehle: 20“.
4. Speicherzelle von Hand überschreiben (gültig und ungültig), Format wechseln.
5. Assembler: neues Programm laden; Fehler provozieren (`;` oder `#13`): Meldung, Speicher unverändert.
6. „Speicher als Assembler anzeigen“ und „Startprogramm laden“.
7. Fenster schmal ziehen (unter 900 px): Layout stapelt sich, keine waagerechte Scrollleiste.
8. Als eingebettetes Iframe (Moodle): Seite scrollt in sich selbst.
9. URL-Parameter aus 2.4 ausprobieren.

---

## 13. Bekannte Einschränkungen und offene Punkte

- **In Moodle nicht getestet.** Die Anwendung wurde in einem Browser-Test (Chromium) geprüft; die Einbettung im Iframe Embedder von Moodle selbst wurde nicht ausprobiert.
- **Layout nur nach Vorgabe, nicht nach Vorbild:** Das Original konnte nicht eingesehen werden (1.3).
- **Annahmen** aus 5.5 sind nicht im Einzelnen abgestimmt.
- **Ungenutzte Felder:** `contentId` und `startMem` werden abgelegt, aber nirgends ausgewertet (Reste der H5P-Herkunft bzw. einer früheren Fassung). Entfernen ist gefahrlos.
- **URL-Parameter:** `&`, `#` und `%` sind in Texten nicht übergebbar (2.3, 2.4).
- **Programmgröße:** Maximal 16 Byte für Programm **und** Daten; das ist Teil der Aufgabe, aber für Lernende eine häufige Fehlerquelle (Fehlermeldung „Der Speicher hat nur 16 Zellen …“).
- **Barrierefreiheit:** Erklärtexte sind ein `aria-live`-Bereich, Flags tragen `aria-label`, Eingabefelder haben Beschriftungen; Datenpakete und Hervorhebungen sind rein visuell. Ein Test mit Screenreader steht aus.
- **Kein Speichern:** Programme und Speicherinhalt gehen beim Neuladen verloren (es wird nichts im Browser abgelegt, kein `localStorage`).
- **Zwischenspeicher:** Nach einem Push kann der Browser die alte Fassung bis zu 10 Minuten zeigen (2.2).
- **Repository-Hygiene:** Im Hauptverzeichnis liegen versehentlich eingecheckte ZIP-Dateien (`sevsplace-update_v01.zip`, `…_v02.zip`). Sie sind über die Seite öffentlich herunterladbar und sollten entfernt werden (`git rm`, `*.zip` in `.gitignore`).

---

## 14. Glossar

| Begriff | Erklärung |
|---|---|
| ALU | Arithmetisch-logische Einheit: das Rechenwerk (addieren, subtrahieren, schieben …) |
| Assembler | Programm, das lesbaren Befehlstext in Maschinencode (Bytes) übersetzt |
| Bus | Gemeinsame Datenleitung zwischen den Bausteinen |
| Decode | Phase, in der der Befehl im IR „entschlüsselt“ wird |
| Execute | Phase, in der der Befehl ausgeführt wird |
| Fetch | Phase, in der der nächste Befehl aus dem Speicher geholt wird |
| Flag | Einzelnes Bit mit Zusatzinformation über das letzte Rechenergebnis (hier N und O) |
| IR | Instruktionsregister: hält den gerade bearbeiteten Befehl |
| Label | Name für eine Speicheradresse im Assembler-Text (Sprungmarke) |
| Mikroschritt | Kleinster einzeln sichtbarer Teilschritt (ein „Takt“ der Anwendung) |
| Mnemonic | Merkname eines Befehls (`add`, `ldr` …) |
| N-Flag | Negativ-Flag: höchstes Bit des Ergebnisses (Vorzeichen im Zweierkomplement) |
| O-Flag | Überlauf-Flag: Ergebnis passt im Zweierkomplement nicht in 8 Bit |
| PC / AR | Programmzähler bzw. Adressregister |
| RAM | Arbeitsspeicher |
| Zweierkomplement | Darstellung negativer Zahlen: Bit 7 ist das Vorzeichen, −128 bis +127 in 8 Bit |
| Iframe Embedder | H5P-Inhaltstyp, der eine fremde Webseite in einem Rahmen anzeigt |
| GitHub Pages | Hosting-Dienst von GitHub für statische Webseiten aus einem Repository |

---

## 15. Anhang: Aufbau der Moodle-Datei `CPU-Visualisierung-Iframe.h5p`

Die Datei ist ein ZIP-Archiv:

```
h5p.json                      Metadaten: Titel, Sprache, Hauptbibliothek H5P.IFrameEmbed
content/content.json          die Felder aus 2.3 (source, width, minWidth, height, resizeSupported)
H5P.IFrameEmbed-1.0/          Kopie der Bibliothek „Iframe Embedder“ (Quelle: github.com/h5p/h5p-iframe-embed)
```

Die Bibliothek wird mitgeliefert, damit der Import auch dort gelingt, wo sie noch nicht installiert ist (dann ist für die Installation allerdings ein Admin nötig). Ist sie in Moodle schon vorhanden, genügt der Inhalt. Zum Ändern der Adresse in Moodle den Inhalt im H5P-Editor öffnen und das Feld „Source“ bearbeiten, ein neues `.h5p` ist dafür nicht erforderlich.
