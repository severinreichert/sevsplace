var H5P = H5P || {};

/**
 * CPU-Visualisierung: vereinfachter 8-Bit-Prozessor mit 16 x 8 Bit RAM.
 * Befehlssatz: siehe Core.ISA (entspricht Instruction_Set.xlsx).
 */
H5P.CPUVisualizer = (function ($, EventDispatcher) {
  'use strict';

  /* =====================================================================
   * Core: Befehlssatz, Assembler, ALU und Prozessor-Zustandsmaschine
   * (ohne DOM-Abhängigkeit, daher einzeln testbar)
   * ===================================================================== */
  var Core = (function () {
    var MEM_SIZE = 16;

    var ALU_LABEL = {
      add: 'A + B', sub: 'A − B', nand: 'A NAND B',
      inc: 'A + 1', dec: 'A − 1', shl: 'A << 1', shr: 'A >> 1',
      neg: '−A', movs: 'A'
    };

    var MNEMONICS = {
      add: 'rr', sub: 'rr', nand: 'rr',
      inc: 'r', dec: 'r', shl: 'r', shr: 'r', neg: 'r', movs: 'r',
      nop: 'none', halt: 'none',
      jmp: 'addr', jmp_n: 'addr', jmp_o: 'addr',
      ldr: 'ra', str: 'ra'
    };
    var ALIAS = { jmpn: 'jmp_n', jmpo: 'jmp_o' };

    /* Referenztabelle für die Oberfläche: [Opcode, Mnemonic, Wirkung] */
    var ISA = [
      ['0000xxyy', 'add Rx, Ry', 'Rx + Ry → Rx'],
      ['0001xxyy', 'sub Rx, Ry', 'Rx − Ry → Rx'],
      ['0010xxyy', 'nand Rx, Ry', 'Rx NAND Ry → Rx'],
      ['001100xx', 'inc Rx', 'Rx + 1 → Rx'],
      ['001101xx', 'dec Rx', 'Rx − 1 → Rx'],
      ['001110xx', 'shl Rx', 'Rx um 1 Bit nach links schieben → Rx'],
      ['001111xx', 'shr Rx', 'Rx um 1 Bit nach rechts schieben → Rx'],
      ['010000xx', 'neg Rx', 'Zweierkomplement: −Rx → Rx'],
      ['010001xx', 'movs Rx', 'Rx → Rx (setzt die Flags neu)'],
      ['010010nn', 'NOP', 'Keine Operation (nn ohne Bedeutung)'],
      ['010011nn', 'HALT', 'Programm beenden (nn ohne Bedeutung)'],
      ['0101aaaa', 'jmp addr', 'Springe zu Adresse aaaa'],
      ['0110aaaa', 'jmp_n addr', 'Springe zu Adresse aaaa, wenn Flag N gesetzt ist'],
      ['0111aaaa', 'jmp_o addr', 'Springe zu Adresse aaaa, wenn Flag O gesetzt ist'],
      ['10xxaaaa', 'ldr Rx, addr', 'RAM[aaaa] → Rx'],
      ['11xxaaaa', 'str Rx, addr', 'Rx → RAM[aaaa]']
    ];

    function pad(s, n) { s = String(s); while (s.length < n) { s = '0' + s; } return s; }
    function padRight(s, n) { s = String(s); while (s.length < n) { s += ' '; } return s; }
    function bits(v, n) { return pad((v & ((1 << n) - 1)).toString(2), n); }
    function displayName(name) { return (name === 'nop' || name === 'halt') ? name.toUpperCase() : name; }

    function decode(b) {
      b &= 255;
      var d = { byte: b, name: '', kind: '', x: 0, y: 0, a: 0, opBits: '' };
      var top2 = b >> 6, n4 = b >> 4, s2 = (b >> 2) & 3;

      if (top2 >= 2) {
        d.name = top2 === 2 ? 'ldr' : 'str';
        d.kind = 'ra'; d.x = (b >> 4) & 3; d.a = b & 15; d.opBits = bits(top2, 2);
      } else if (top2 === 0) {
        if (n4 < 3) {
          d.name = ['add', 'sub', 'nand'][n4];
          d.kind = 'rr'; d.x = (b >> 2) & 3; d.y = b & 3; d.opBits = bits(n4, 4);
        } else {
          d.name = ['inc', 'dec', 'shl', 'shr'][s2];
          d.kind = 'r'; d.x = b & 3; d.opBits = bits(b >> 2, 6);
        }
      } else {
        if (n4 === 4) {
          d.name = ['neg', 'movs', 'nop', 'halt'][s2];
          d.kind = s2 < 2 ? 'r' : 'none'; d.x = b & 3; d.opBits = bits(b >> 2, 6);
        } else {
          d.name = ['jmp', 'jmp_n', 'jmp_o'][n4 - 5];
          d.kind = 'addr'; d.a = b & 15; d.opBits = bits(n4, 4);
        }
      }

      d.label = displayName(d.name);
      var parts = ['Opcode ' + d.opBits + ' = ' + d.label];
      switch (d.kind) {
        case 'rr':
          d.text = d.label + ' R' + d.x + ', R' + d.y;
          parts.push('x = ' + bits(d.x, 2) + ' → R' + d.x, 'y = ' + bits(d.y, 2) + ' → R' + d.y);
          break;
        case 'r':
          d.text = d.label + ' R' + d.x;
          parts.push('x = ' + bits(d.x, 2) + ' → R' + d.x);
          break;
        case 'none':
          d.text = d.label;
          parts.push('nn = ' + bits(b & 3, 2) + ' (ohne Bedeutung)');
          break;
        case 'addr':
          d.text = d.label + ' ' + d.a;
          parts.push('Adresse = ' + bits(d.a, 4) + ' → ' + d.a);
          break;
        default: // ra
          d.text = d.label + ' R' + d.x + ', ' + d.a;
          parts.push('x = ' + bits(d.x, 2) + ' → R' + d.x, 'Adresse = ' + bits(d.a, 4) + ' → ' + d.a);
      }
      d.explain = parts.join(', ');
      return d;
    }

    function encode(name, x, y, a) {
      x = x || 0; y = y || 0; a = a || 0;
      switch (name) {
        case 'add': return (x << 2) | y;
        case 'sub': return 0x10 | (x << 2) | y;
        case 'nand': return 0x20 | (x << 2) | y;
        case 'inc': return 0x30 | x;
        case 'dec': return 0x34 | x;
        case 'shl': return 0x38 | x;
        case 'shr': return 0x3C | x;
        case 'neg': return 0x40 | x;
        case 'movs': return 0x44 | x;
        case 'nop': return 0x48;
        case 'halt': return 0x4C;
        case 'jmp': return 0x50 | a;
        case 'jmp_n': return 0x60 | a;
        case 'jmp_o': return 0x70 | a;
        case 'ldr': return 0x80 | (x << 4) | a;
        case 'str': return 0xC0 | (x << 4) | a;
      }
      return null;
    }

    /* ALU: Ergebnis (8 Bit) und Flags. N = höchstes Bit des Ergebnisses,
       O = Überlauf im Zweierkomplement. */
    function alu(op, a, b) {
      var res, o = false;
      a &= 255; b = (b || 0) & 255;
      switch (op) {
        case 'add': res = (a + b) & 255; o = ((a ^ res) & (b ^ res) & 0x80) !== 0; break;
        case 'sub': res = (a - b) & 255; o = ((a ^ b) & (a ^ res) & 0x80) !== 0; break;
        case 'nand': res = (~(a & b)) & 255; break;
        case 'inc': res = (a + 1) & 255; o = a === 0x7F; break;
        case 'dec': res = (a - 1) & 255; o = a === 0x80; break;
        case 'shl': res = (a << 1) & 255; o = ((a ^ res) & 0x80) !== 0; break;
        case 'shr': res = a >>> 1; break;
        case 'neg': res = (-a) & 255; o = a === 0x80; break;
        default: res = a; // movs
      }
      return { res: res, n: (res & 0x80) !== 0, o: o };
    }

    /* ---------------- Assembler ---------------- */
    function parseNumber(tok) {
      tok = String(tok).trim();
      var neg = false, v;
      if (tok.charAt(0) === '-') { neg = true; tok = tok.slice(1); }
      if (/^0x[0-9a-f]+$/i.test(tok)) { v = parseInt(tok.slice(2), 16); }
      else if (/^0b[01]+$/i.test(tok)) { v = parseInt(tok.slice(2), 2); }
      else if (/^\d+$/.test(tok)) { v = parseInt(tok, 10); }
      else { return null; }
      return neg ? -v : v;
    }

    function trim(s) { return s.trim(); }

    // Entfernt Kommentare und liefert den Code zeilenweise (die Zeilennummern bleiben erhalten).
    // Kommentare: "#" bis zum Zeilenende oder Blockkommentare zwischen Slash-Stern und Stern-Slash.
    // Die alten Schreibweisen (";", "//" und "#" vor Zahlen) werden mit einem Hinweis als Fehler gemeldet.
    function prepare(src) {
      src = String(src || '').replace(/\r\n?/g, '\n');
      var texts = [''], errors = [], oldComment = [], hashNumber = [];
      var line = 1, i = 0, inBlock = false, blockLine = 0, c, c2, end;

      while (i < src.length) {
        c = src.charAt(i); c2 = src.substr(i, 2);
        if (inBlock) {
          if (c2 === '*/') { inBlock = false; texts[line - 1] += ' '; i += 2; }
          else { if (c === '\n') { line++; texts.push(''); } i++; }
          continue;
        }
        if (c2 === '/*') { inBlock = true; blockLine = line; i += 2; continue; }
        if (c === '\n') { line++; texts.push(''); i++; continue; }
        end = src.indexOf('\n', i);
        if (end < 0) { end = src.length; }
        if (c === '#') {
          var rest = src.slice(i + 1, end), code = texts[line - 1].trim();
          if (/^\d/.test(rest) && /(,|\b(jmp|jmp_n|jmp_o|jmpn|jmpo)|\.(org|byte|db))$/i.test(code)) {
            hashNumber.push(line);   // altes "#13": Zahl trotzdem weiterlesen, damit keine Folgefehler entstehen
            i++;
            continue;
          }
          i = end;
          continue;
        }
        if (c === ';' || c2 === '//') { oldComment.push(line); i = end; continue; }
        texts[line - 1] += c;
        i++;
      }

      function lineList(a) {
        var u = a.filter(function (v, k) { return a.indexOf(v) === k; });
        return (u.length > 1 ? 'Zeilen ' : 'Zeile ') + u.join(', ');
      }
      if (inBlock) {
        errors.push({ line: blockLine, message: 'Zeile ' + blockLine + ': Der Kommentar „/*“ wird nie mit „*/“ geschlossen.' });
      }
      if (hashNumber.length) {
        errors.push({ line: hashNumber[0], message: lineList(hashNumber) +
          ': Zahlen und Adressen werden ohne „#“ geschrieben (Dezimalzahl, 0x… oder 0b…). „#“ beginnt einen Kommentar.' });
      }
      if (oldComment.length) {
        errors.push({ line: oldComment[0], message: lineList(oldComment) +
          ': Kommentare beginnen mit „#“ (bis zum Zeilenende) oder stehen zwischen /* und */. „;“ und „//“ sind nicht mehr erlaubt.' });
      }
      return { texts: texts, errors: errors };
    }

    function assemble(src) {
      var prep = prepare(src);
      var lines = prep.texts;
      var errors = prep.errors.slice(), labels = {}, items = [], addr = 0, i, m, text;

      function err(line, msg) { errors.push({ line: line, message: 'Zeile ' + line + ': ' + msg }); }

      for (i = 0; i < lines.length; i++) {
        var ln = i + 1;
        text = lines[i].trim();

        while ((m = /^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*/.exec(text))) {
          var lname = m[1].toLowerCase();
          if (labels.hasOwnProperty(lname)) { err(ln, 'Das Label „' + m[1] + '“ ist doppelt vergeben.'); }
          else { labels[lname] = addr; }
          text = text.slice(m[0].length);
        }
        if (!text) { continue; }

        if (text.charAt(0) === '.') {
          var dm = /^\.([A-Za-z]+)\s*(.*)$/.exec(text);
          if (!dm) { err(ln, 'Ungültige Direktive „' + text + '“.'); continue; }
          var dir = dm[1].toLowerCase(), args = dm[2].trim();
          if (dir === 'org') {
            var ov = parseNumber(args);
            if (ov === null || ov < 0 || ov >= MEM_SIZE) { err(ln, '.org erwartet eine Adresse von 0 bis 15.'); }
            else { addr = ov; }
          } else if (dir === 'byte' || dir === 'db') {
            if (!args) { err(ln, '.byte erwartet mindestens einen Wert.'); continue; }
            var parts = args.split(',');
            for (var k = 0; k < parts.length; k++) {
              var tok = parts[k].trim(), bv = parseNumber(tok);
              if (bv === null || bv < -128 || bv > 255) {
                err(ln, 'Ungültiger Byte-Wert „' + tok + '“ (erlaubt: −128 bis 255).');
                continue;
              }
              if (addr >= MEM_SIZE) { err(ln, 'Der Speicher hat nur 16 Zellen (Adresse 0 bis 15).'); break; }
              items.push({ line: ln, addr: addr, kind: 'byte', value: bv & 255 });
              addr++;
            }
          } else {
            err(ln, 'Unbekannte Direktive „.' + dm[1] + '“.');
          }
          continue;
        }

        var mm = /^([A-Za-z_][A-Za-z0-9_]*)\s*(.*)$/.exec(text);
        if (!mm) { err(ln, 'Der Befehl „' + text + '“ ist nicht lesbar.'); continue; }
        var name = mm[1].toLowerCase();
        if (ALIAS[name]) { name = ALIAS[name]; }
        if (!MNEMONICS.hasOwnProperty(name)) { err(ln, 'Unbekannter Befehl „' + mm[1] + '“.'); continue; }
        if (addr >= MEM_SIZE) { err(ln, 'Der Speicher hat nur 16 Zellen – der Befehl passt nicht mehr hinein.'); continue; }
        items.push({
          line: ln, addr: addr, kind: 'ins', name: name,
          ops: mm[2].trim() ? mm[2].split(',').map(trim) : []
        });
        addr++;
      }

      function parseReg(tok, ln) {
        var r = /^r([0-3])$/i.exec(tok);
        if (!r) { err(ln, '„' + tok + '“ ist kein Register (erlaubt: R0 bis R3).'); return null; }
        return +r[1];
      }
      function parseAddr(tok, ln) {
        var v = parseNumber(tok);
        if (v === null) {
          var key = tok.trim().toLowerCase();
          if (labels.hasOwnProperty(key)) { v = labels[key]; }
          else {
            err(ln, '„' + tok + '“ ist keine gültige Adresse (erlaubt: Dezimalzahl, 0x… oder 0b…) und kein bekanntes Label.');
            return null;
          }
        }
        if (v < 0 || v >= MEM_SIZE) { err(ln, 'Die Adresse „' + tok + '“ liegt außerhalb von 0 bis 15.'); return null; }
        return v;
      }

      var mem = [], used = {}, usedCount = 0;
      for (i = 0; i < MEM_SIZE; i++) { mem.push(0); }

      items.forEach(function (it) {
        var val = null;
        if (it.kind === 'byte') {
          val = it.value;
        } else {
          var kind = MNEMONICS[it.name], ops = it.ops;
          var need = { rr: 2, r: 1, none: 0, addr: 1, ra: 2 }[kind];
          if (ops.length !== need) {
            err(it.line, '„' + it.name + '“ erwartet ' + need + ' Operand' + (need === 1 ? '' : 'en') +
              ', gefunden: ' + ops.length + '.');
            return;
          }
          var x = 0, y = 0, a = 0;
          if (kind === 'rr') { x = parseReg(ops[0], it.line); y = parseReg(ops[1], it.line); }
          else if (kind === 'r') { x = parseReg(ops[0], it.line); }
          else if (kind === 'addr') { a = parseAddr(ops[0], it.line); }
          else if (kind === 'ra') { x = parseReg(ops[0], it.line); a = parseAddr(ops[1], it.line); }
          if (x === null || y === null || a === null) { return; }
          val = encode(it.name, x, y, a);
        }
        if (used[it.addr]) {
          err(it.line, 'Adresse ' + it.addr + ' ist bereits belegt (Zeile ' + used[it.addr] + ').');
          return;
        }
        used[it.addr] = it.line;
        usedCount++;
        mem[it.addr] = val;
      });

      errors.sort(function (a, b) { return a.line - b.line; });
      return { mem: mem, errors: errors, used: usedCount };
    }

    /* Speicherinhalt als Assembler-Text. Nicht eindeutig darstellbare Bytes
       (z. B. NOP mit nn ≠ 0) werden als .byte ausgegeben, damit der Text
       beim erneuten Assemblieren exakt denselben Speicher ergibt. */
    function disassemble(mem) {
      var out = [];
      for (var i = 0; i < MEM_SIZE; i++) {
        var b = mem[i] & 255, d = decode(b);
        var canonical = encode(d.name, d.x, d.y, d.a) === b;
        var code = canonical ? d.text : '.byte 0x' + pad(b.toString(16).toUpperCase(), 2);
        out.push(padRight(code, 18) + '# ' + pad(i, 2) + ': ' + bits(b, 8));
      }
      return out.join('\n');
    }

    /* ---------------- Prozessor ---------------- */
    function CPU() {
      this.mem = [];
      for (var i = 0; i < MEM_SIZE; i++) { this.mem.push(0); }
      this.fmt = {
        f8: function (v) { return bits(v, 8); },
        f4: function (v) { return bits(v, 4); }
      };
      this.reset();
    }

    CPU.prototype.reset = function () {
      this.regs = [0, 0, 0, 0];
      this.pc = 0; this.ar = 0; this.ir = 0;
      this.n = false; this.o = false;
      this.alu = { op: '', a: null, b: null, res: null };
      this.decoded = null;
      this.halted = false;
      this.queue = [];
      this.phase = 'idle';
      this.ticks = 0;
      this.instrs = 0;
    };

    CPU.prototype.f8 = function (v) { return this.fmt.f8(v); };
    CPU.prototype.f4 = function (v) { return this.fmt.f4(v); };

    /* Liefert den nächsten Mikroschritt (oder null, wenn gehalten).
       op = { phase, text, moves[{from,to,label}], read, write, pulse[], commit(), last } */
    CPU.prototype.nextOp = function () {
      if (this.halted) { return null; }
      if (!this.queue.length) { this.queue = this.fetchOps(); }
      var factory = this.queue.shift();
      var op = factory.call(this);
      var self = this;
      var apply = op.apply;
      if (op.last === undefined) { op.last = this.queue.length === 0; }
      op.commit = function () {
        apply.call(self);
        self.phase = op.phase;
        self.ticks++;
        if (op.last) { self.instrs++; }
      };
      return op;
    };

    CPU.prototype.fetchOps = function () {
      var self = this;
      return [
        function () {
          var pc = this.pc;
          return {
            phase: 'fetch',
            text: 'Fetch 1/3: Der Programmzähler (PC = ' + this.f4(pc) + ') wird ins Adressregister (AR) kopiert.',
            moves: [{ from: 'pc', to: 'ar', label: this.f4(pc) }],
            apply: function () { self.ar = pc; }
          };
        },
        function () {
          var ar = this.ar, v = this.mem[ar];
          return {
            phase: 'fetch',
            text: 'Fetch 2/3: Der RAM liefert den Inhalt von Adresse ' + this.f4(ar) + ' (' + this.f8(v) +
              ') ins Instruktionsregister (IR).',
            moves: [{ from: 'ram:' + ar, to: 'ir', label: this.f8(v) }],
            read: ar,
            apply: function () { self.ir = v; self.decoded = null; }
          };
        },
        function () {
          var pc = this.pc, next = (pc + 1) & 15;
          return {
            phase: 'fetch',
            text: 'Fetch 3/3: Der Programmzähler wird um 1 erhöht (' + this.f4(pc) + ' → ' + this.f4(next) + ').',
            pulse: ['pc'],
            apply: function () { self.pc = next; }
          };
        },
        function () {
          var d = decode(this.ir);
          return {
            phase: 'decode',
            text: 'Decode: Das Steuerwerk liest das Instruktionsregister (' + this.f8(this.ir) + ') und erkennt: ' +
              d.text + '.',
            pulse: ['dec'],
            last: false,
            apply: function () {
              self.decoded = d;
              Array.prototype.push.apply(self.queue, self.execOps(d));
            }
          };
        }
      ];
    };

    CPU.prototype.execOps = function (d) {
      var self = this, x = d.x, y = d.y, name = d.name;
      var rn = function (i) { return 'R' + i; };

      function loadAlu(binary) {
        return function () {
          var a = this.regs[x], b = binary ? this.regs[y] : null;
          var moves = [{ from: 'r' + x, to: 'aluA', label: this.f8(a) }];
          var text = 'Execute 1/3: ' + rn(x);
          if (binary) {
            moves.push({ from: 'r' + y, to: 'aluB', label: this.f8(b) });
            text += ' und ' + rn(y) + ' werden in die ALU geladen (A = ' + this.f8(a) + ', B = ' + this.f8(b) + ').';
          } else {
            text += ' wird in die ALU geladen (A = ' + this.f8(a) + ').';
          }
          return {
            phase: 'execute', text: text, moves: moves,
            apply: function () { self.alu = { op: name, a: a, b: b, res: null }; }
          };
        };
      }
      function compute() {
        return function () {
          var A = this.alu.a, B = this.alu.b, r = alu(name, A, B);
          return {
            phase: 'execute',
            text: 'Execute 2/3: Die ALU berechnet ' + ALU_LABEL[name] + ' = ' + this.f8(r.res) +
              '. Flags: N = ' + (r.n ? 1 : 0) + ', O = ' + (r.o ? 1 : 0) + '.',
            pulse: ['alu', 'flags'],
            apply: function () { self.alu.res = r.res; self.n = r.n; self.o = r.o; }
          };
        };
      }
      function writeBack() {
        return function () {
          var res = this.alu.res;
          return {
            phase: 'execute',
            text: 'Execute 3/3: Das Ergebnis (' + this.f8(res) + ') wird in ' + rn(x) + ' gespeichert.',
            moves: [{ from: 'aluR', to: 'r' + x, label: this.f8(res) }],
            apply: function () { self.regs[x] = res; }
          };
        };
      }
      function jump(flag) {
        return function () {
          var a = d.a;
          var cond = flag ? (flag === 'n' ? this.n : this.o) : true;
          if (cond) {
            return {
              phase: 'execute',
              text: 'Execute: ' + (flag ? 'Flag ' + flag.toUpperCase() + ' ist gesetzt – ' : '') +
                'die Zieladresse aus dem IR (' + this.f4(a) + ') wird in den Programmzähler geschrieben.',
              moves: [{ from: 'ir', to: 'pc', label: this.f4(a) }],
              apply: function () { self.pc = a; }
            };
          }
          return {
            phase: 'execute',
            text: 'Execute: Flag ' + flag.toUpperCase() + ' ist nicht gesetzt – es wird nicht gesprungen, der Programmzähler bleibt unverändert.',
            pulse: ['flags'],
            apply: function () {}
          };
        };
      }
      function loadAr() {
        return function () {
          return {
            phase: 'execute',
            text: 'Execute 1/2: Die Adresse aus dem IR (' + this.f4(d.a) + ') wird ins Adressregister (AR) geladen.',
            moves: [{ from: 'ir', to: 'ar', label: this.f4(d.a) }],
            apply: function () { self.ar = d.a; }
          };
        };
      }

      switch (d.kind) {
        case 'rr': return [loadAlu(true), compute(), writeBack()];
        case 'r': return [loadAlu(false), compute(), writeBack()];
        case 'none':
          if (name === 'halt') {
            return [function () {
              return {
                phase: 'execute',
                text: 'Execute: HALT – der Prozessor hält an.',
                apply: function () { self.halted = true; }
              };
            }];
          }
          return [function () {
            return { phase: 'execute', text: 'Execute: NOP – es passiert nichts.', apply: function () {} };
          }];
        case 'addr':
          return [jump(name === 'jmp' ? null : (name === 'jmp_n' ? 'n' : 'o'))];
        default:
          if (name === 'ldr') {
            return [loadAr(), function () {
              var ar = this.ar, v = this.mem[ar];
              return {
                phase: 'execute',
                text: 'Execute 2/2: Der RAM-Inhalt an Adresse ' + this.f4(ar) + ' (' + this.f8(v) + ') wird in ' + rn(x) + ' geladen.',
                moves: [{ from: 'ram:' + ar, to: 'r' + x, label: this.f8(v) }],
                read: ar,
                apply: function () { self.regs[x] = v; }
              };
            }];
          }
          return [loadAr(), function () {
            var ar = this.ar, v = this.regs[x];
            return {
              phase: 'execute',
              text: 'Execute 2/2: Der Inhalt von ' + rn(x) + ' (' + this.f8(v) + ') wird in den RAM an Adresse ' + this.f4(ar) + ' geschrieben.',
              moves: [{ from: 'r' + x, to: 'ram:' + ar, label: this.f8(v) }],
              write: ar,
              apply: function () { self.mem[ar] = v; }
            };
          }];
      }
    };

    return {
      MEM_SIZE: MEM_SIZE, ISA: ISA, ALU_LABEL: ALU_LABEL,
      decode: decode, encode: encode, alu: alu,
      assemble: assemble, disassemble: disassemble, parseNumber: parseNumber, prepare: prepare,
      bits: bits, pad: pad, CPU: CPU
    };
  })();

  /* =====================================================================
   * Oberfläche
   * ===================================================================== */
  var DEFAULT_ASM = [
    '/* Beispiel: 4 x 3 durch wiederholte Addition',
    '   R0 = Zähler, R1 = Summe, R2 = Summand */',
    'ldr R0, 13      # Zähler laden',
    'ldr R2, 14      # Summand laden',
    'sub R1, R1      # R1 = 0 (Summe)',
    'loop:',
    'add R1, R2      # Summe += Summand',
    'dec R0          # Zähler -= 1',
    'jmp_n ende      # Zähler < 0 ? Dann fertig',
    'jmp loop',
    'ende:',
    'str R1, 15      # Ergebnis speichern',
    'HALT',
    '.org 13',
    '.byte 3         # Zähler (3 ergibt 4 Durchläufe)',
    '.byte 3         # Summand'
  ].join('\n');

  var FORMATS = [
    { id: 'bin', label: 'Binär' },
    { id: 'hex', label: 'Hexadezimal' },
    { id: 'dec', label: 'Dezimal' },
    { id: 'sdec', label: 'Dezimal (Zweierkomplement)' }
  ];
  var FORMAT_HINT = {
    bin: 'Binär: bis zu 8 Ziffern aus 0 und 1',
    hex: 'Hexadezimal: 1 bis 2 Ziffern (0–9, A–F)',
    dec: 'Dezimal: Zahl von 0 bis 255',
    sdec: 'Dezimal: Zahl von −128 bis 127'
  };
  var DURATIONS = [1400, 900, 550, 280, 0];
  var GAPS = [700, 450, 250, 100, 0];
  var PHASES = [
    { id: 'fetch', label: 'Fetch (Holen)' },
    { id: 'decode', label: 'Decode (Dekodieren)' },
    { id: 'execute', label: 'Execute (Ausführen)' }
  ];
  var IDLE_TEXT = 'Bereit. „Takt“ führt einen Mikroschritt aus, „Befehl“ einen ganzen Befehl, „Start“ lässt das Programm laufen.';

  function el(tag, cls, text, attrs) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (text !== undefined && text !== null) { e.textContent = text; }
    if (attrs) { for (var k in attrs) { if (attrs.hasOwnProperty(k)) { e.setAttribute(k, attrs[k]); } } }
    return e;
  }

  function delay(ms) {
    return ms > 0 ? new Promise(function (r) { setTimeout(r, ms); }) : Promise.resolve();
  }

  function fmtValue(v, nbits, kind) {
    v &= (1 << nbits) - 1;
    switch (kind) {
      case 'hex': return '0x' + Core.pad(v.toString(16).toUpperCase(), nbits / 4);
      case 'dec': return String(v);
      case 'sdec': return String(nbits === 8 && v > 127 ? v - 256 : v);
      default:
        var s = Core.pad(v.toString(2), nbits);
        return nbits === 8 ? s.slice(0, 4) + ' ' + s.slice(4) : s;
    }
  }

  function parseInput(str, kind) {
    var s = String(str).replace(/[\s_]/g, '');
    var v;
    if (!s) { return null; }
    switch (kind) {
      case 'bin':
        s = s.replace(/^0b/i, '');
        return /^[01]{1,8}$/.test(s) ? parseInt(s, 2) : null;
      case 'hex':
        s = s.replace(/^0x/i, '');
        return /^[0-9a-f]{1,2}$/i.test(s) ? parseInt(s, 16) : null;
      case 'dec':
        if (!/^\d{1,3}$/.test(s)) { return null; }
        v = parseInt(s, 10);
        return v <= 255 ? v : null;
      default: // sdec
        if (!/^-?\d{1,3}$/.test(s)) { return null; }
        v = parseInt(s, 10);
        return (v >= -128 && v <= 255) ? (v & 255) : null;
    }
  }

  function box(key, label, sub) {
    var b = el('div', 'cpuv-box');
    b.setAttribute('data-key', key);
    b.appendChild(el('span', 'cpuv-lab', label));
    if (sub) { b.appendChild(el('span', 'cpuv-sub', sub)); }
    var v = el('output', 'cpuv-val', '');
    b.appendChild(v);
    b._val = v;
    return b;
  }

  /**
   * @param {object} options  Inhaltsparameter (siehe semantics.json)
   * @param {number} contentId
   */
  function C(options, contentId) {
    EventDispatcher.call(this);
    var o = options || {};
    this.opts = {
      taskText: o.taskText || '',
      assembly: typeof o.assembly === 'string' ? o.assembly : DEFAULT_ASM,
      defaultFormat: o.defaultFormat || 'bin',
      showAssembler: o.showAssembler !== false,
      memoryEditable: o.memoryEditable !== false
    };
    this.contentId = contentId;
    this.cpu = new Core.CPU();
    this.format = 'bin';
    for (var i = 0; i < FORMATS.length; i++) {
      if (FORMATS[i].id === this.opts.defaultFormat) { this.format = FORMATS[i].id; }
    }
    this.speed = 3;
    this.running = false;
    this.busy = false;
    this.token = 0;
    this.nodes = {};
    this.rows = [];
    this.btn = {};
    this.pills = {};
    this.startMem = null;
    this.setFormatInternal(this.format);
  }
  C.prototype = Object.create(EventDispatcher.prototype);
  C.prototype.constructor = C;

  C.prototype.setFormatInternal = function (kind) {
    var self = this;
    this.format = kind;
    this.cpu.fmt = {
      f8: function (v) { return fmtValue(v, 8, self.format); },
      f4: function (v) { return fmtValue(v, 4, self.format); }
    };
  };

  C.prototype.fmt8 = function (v) { return this.cpu.fmt.f8(v); };
  C.prototype.fmt4 = function (v) { return this.cpu.fmt.f4(v); };

  C.prototype.attach = function ($container) {
    var self = this;
    var root = $container[0];
    $container.addClass('h5p-cpu-visualizer');
    root.innerHTML = '';
    this.root = root;
    this.canAnimate = typeof Element !== 'undefined' && typeof Element.prototype.animate === 'function' &&
      !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    this.activeAnims = [];

    this.build(root);
    this.applyInitialProgram();
    this.render();
    this.setNarration(IDLE_TEXT);

    if (typeof window.ResizeObserver === 'function') {
      new window.ResizeObserver(function () { self.trigger('resize'); }).observe(root);
    }
    this.trigger('resize');
  };

  /* ---------------- Aufbau ---------------- */
  var SVG_NS = 'http://www.w3.org/2000/svg';

  /* V-förmiges ALU-Symbol: zwei Eingänge oben, Ausgang an der unteren Spitze */
  function aluShape() {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'cpuv-alu-shape');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    var poly = document.createElementNS(SVG_NS, 'polygon');
    poly.setAttribute('points', '0.5,0.5 38,0.5 50,26 62,0.5 99.5,0.5 82,99.5 18,99.5');
    svg.appendChild(poly);
    return svg;
  }

  function flagItem(letter, text, title) {
    var item = el('span', 'cpuv-flag-item');
    var flag = el('span', 'cpuv-flag', letter, { title: title });
    item.appendChild(flag);
    item.appendChild(el('span', 'cpuv-flag-text', text));
    return { item: item, flag: flag };
  }

  C.prototype.build = function (root) {
    var self = this;

    if (this.opts.taskText) {
      root.appendChild(el('p', 'cpuv-task', this.opts.taskText));
    }

    /* Werkzeugleiste */
    var bar = el('div', 'cpuv-toolbar', null, { role: 'toolbar', 'aria-label': 'Steuerung des Prozessors' });
    this.btn.step = el('button', 'cpuv-btn', 'Takt', { type: 'button', title: 'Einen Mikroschritt ausführen' });
    this.btn.instr = el('button', 'cpuv-btn', 'Befehl', { type: 'button', title: 'Den aktuellen Befehl vollständig ausführen' });
    this.btn.run = el('button', 'cpuv-btn cpuv-btn-primary', 'Start', { type: 'button', title: 'Programm automatisch ablaufen lassen' });
    this.btn.reset = el('button', 'cpuv-btn', 'Zurücksetzen', { type: 'button', title: 'Prozessor zurücksetzen (Speicher bleibt erhalten)' });
    bar.appendChild(this.btn.step);
    bar.appendChild(this.btn.instr);
    bar.appendChild(this.btn.run);
    bar.appendChild(this.btn.reset);

    var speedWrap = el('label', 'cpuv-ctl');
    speedWrap.appendChild(el('span', null, 'Tempo'));
    this.speedInput = el('input', null, null, { type: 'range', min: '1', max: '5', step: '1', value: String(this.speed) });
    speedWrap.appendChild(this.speedInput);
    bar.appendChild(speedWrap);

    var fmtWrap = el('label', 'cpuv-ctl');
    fmtWrap.appendChild(el('span', null, 'Zahlenformat'));
    this.fmtSelect = el('select');
    FORMATS.forEach(function (f) {
      var opt = el('option', null, f.label, { value: f.id });
      if (f.id === self.format) { opt.selected = true; }
      self.fmtSelect.appendChild(opt);
    });
    fmtWrap.appendChild(this.fmtSelect);
    bar.appendChild(fmtWrap);
    root.appendChild(bar);

    /* Statuszeile */
    var status = el('div', 'cpuv-status');
    var pills = el('div', 'cpuv-pills');
    PHASES.forEach(function (p) {
      var pill = el('span', 'cpuv-pill', p.label, { 'data-phase': p.id });
      self.pills[p.id] = pill;
      pills.appendChild(pill);
    });
    status.appendChild(pills);
    this.counters = el('span', 'cpuv-counters', '');
    status.appendChild(this.counters);
    root.appendChild(status);
    this.narration = el('p', 'cpuv-narration', '', { 'aria-live': 'polite' });
    root.appendChild(this.narration);

    /* Diagramm */
    var diagram = el('div', 'cpuv-diagram');
    this.diagram = diagram;

    var cpuFrame = el('section', 'cpuv-frame cpuv-cpu', null, { 'aria-label': 'Prozessor' });
    cpuFrame.appendChild(el('h3', 'cpuv-title', 'Prozessor'));

    /* Steuerwerk: ein zusammenhängender Block */
    var ctl = el('section', 'cpuv-block cpuv-hue-control cpuv-control', null, { 'aria-label': 'Steuerwerk' });
    ctl.appendChild(el('h4', 'cpuv-block-title', 'Steuerwerk'));
    var ctlGrid = el('div', 'cpuv-grid cpuv-grid-2');
    this.nodes.pc = box('pc', 'Programmzähler (PC)', '4 Bit');
    this.nodes.ar = box('ar', 'Adressregister (AR)', '4 Bit');
    this.nodes.ir = box('ir', 'Instruktionsregister (IR)', '8 Bit');
    var dec = el('div', 'cpuv-box cpuv-dec');
    dec.setAttribute('data-key', 'dec');
    dec.appendChild(el('span', 'cpuv-lab', 'Decoder'));
    this.nodes.decText = el('output', 'cpuv-dec-text', '–');
    this.nodes.decExplain = el('span', 'cpuv-sub cpuv-dec-explain', '');
    dec.appendChild(this.nodes.decText);
    dec.appendChild(this.nodes.decExplain);
    this.nodes.dec = dec;
    ctlGrid.appendChild(this.nodes.pc);
    ctlGrid.appendChild(this.nodes.ar);
    ctlGrid.appendChild(this.nodes.ir);
    ctlGrid.appendChild(dec);
    ctl.appendChild(ctlGrid);
    cpuFrame.appendChild(ctl);

    var body = el('div', 'cpuv-cpu-body');

    /* Registersatz */
    var regs = el('section', 'cpuv-block cpuv-hue-regs cpuv-regs', null, { 'aria-label': 'Registersatz' });
    regs.appendChild(el('h4', 'cpuv-block-title', 'Registersatz (je 8 Bit)'));
    var regGrid = el('div', 'cpuv-grid cpuv-grid-regs');
    for (var r = 0; r < 4; r++) {
      this.nodes['r' + r] = box('r' + r, 'Register ' + r + ' (R' + r + ')', '');
      regGrid.appendChild(this.nodes['r' + r]);
    }
    regs.appendChild(regGrid);
    body.appendChild(regs);

    /* ALU im V-Format */
    var aluGroup = el('section', 'cpuv-block cpuv-hue-alu cpuv-alu-block', null, { 'aria-label': 'Arithmetisch-logische Einheit' });
    aluGroup.appendChild(el('h4', 'cpuv-block-title', 'Arithmetisch-logische Einheit (ALU)'));
    var aluBox = el('div', 'cpuv-alu');
    this.nodes.alu = aluBox;
    aluBox.appendChild(aluShape());
    this.nodes.aluA = box('aluA', 'Eingang A', '');
    this.nodes.aluB = box('aluB', 'Eingang B', '');
    this.nodes.aluR = box('aluR', 'Ergebnis', '');
    this.nodes.aluA.classList.add('cpuv-alu-a');
    this.nodes.aluB.classList.add('cpuv-alu-b');
    this.nodes.aluR.classList.add('cpuv-alu-r');
    var aluMid = el('div', 'cpuv-alu-op');
    aluMid.appendChild(el('span', 'cpuv-sub', 'Operation'));
    this.nodes.aluOp = el('output', 'cpuv-aluop', '–');
    aluMid.appendChild(this.nodes.aluOp);
    aluBox.appendChild(this.nodes.aluA);
    aluBox.appendChild(this.nodes.aluB);
    aluBox.appendChild(aluMid);
    aluBox.appendChild(this.nodes.aluR);
    aluGroup.appendChild(aluBox);

    var flags = el('div', 'cpuv-flags');
    this.nodes.flags = flags;
    var fn = flagItem('N', 'Negativ-Flag (N)', 'Negativ: höchstes Bit des Ergebnisses');
    var fo = flagItem('O', 'Überlauf-Flag (O)', 'Overflow: Überlauf im Zweierkomplement');
    this.nodes.flagN = fn.flag;
    this.nodes.flagO = fo.flag;
    flags.appendChild(el('span', 'cpuv-flags-title', 'Flags'));
    flags.appendChild(fn.item);
    flags.appendChild(fo.item);
    aluGroup.appendChild(flags);
    body.appendChild(aluGroup);
    cpuFrame.appendChild(body);

    var bus = el('div', 'cpuv-bus', null, { 'aria-hidden': 'true' });
    bus.appendChild(el('span', 'cpuv-bus-label', 'Bus'));
    this.busEl = bus;

    /* Arbeitsspeicher */
    var ramFrame = el('section', 'cpuv-block cpuv-hue-ram cpuv-ram', null, { 'aria-label': 'Arbeitsspeicher' });
    var ramHead = el('div', 'cpuv-ram-head');
    ramHead.appendChild(el('h3', 'cpuv-title', 'Arbeitsspeicher (RAM), 16 × 8 Bit'));
    if (this.opts.memoryEditable) {
      var ramBtns = el('div', 'cpuv-ram-btns');
      this.btn.clear = el('button', 'cpuv-btn cpuv-btn-small', 'Speicher leeren', { type: 'button' });
      ramBtns.appendChild(this.btn.clear);
      if (!this.opts.showAssembler) {
        // ohne Assembler-Block bleibt das Zurückholen des Startprogramms hier erreichbar
        this.btn.startup = el('button', 'cpuv-btn cpuv-btn-small', 'Startprogramm laden', { type: 'button' });
        ramBtns.appendChild(this.btn.startup);
      }
      ramHead.appendChild(ramBtns);
    }
    ramFrame.appendChild(ramHead);

    var cols = el('div', 'cpuv-row cpuv-row-head');
    cols.appendChild(el('span', null, 'Adresse'));
    cols.appendChild(el('span', null, 'Inhalt'));
    cols.appendChild(el('span', null, 'Als Befehl gelesen'));
    cols.appendChild(el('span', null, ''));
    ramFrame.appendChild(cols);

    for (var i = 0; i < Core.MEM_SIZE; i++) {
      this.rows.push(this.buildRow(i, ramFrame));
    }

    if (this.opts.showAssembler) {
      var ramFoot = el('div', 'cpuv-ram-foot');
      this.btn.dump = el('button', 'cpuv-btn', 'Speicher als Assembler anzeigen', { type: 'button' });
      ramFoot.appendChild(this.btn.dump);
      ramFrame.appendChild(ramFoot);
    }
    this.ramMsg = el('p', 'cpuv-ram-msg', '', { role: 'status' });
    ramFrame.appendChild(this.ramMsg);

    diagram.appendChild(cpuFrame);
    diagram.appendChild(bus);
    diagram.appendChild(ramFrame);
    root.appendChild(diagram);

    /* Assembler (mit aufklappbarer Befehlssatz-Referenz) */
    if (this.opts.showAssembler) {
      this.buildAssembler(root);
    } else {
      var refOnly = el('section', 'cpuv-block cpuv-hue-asm cpuv-asm');
      refOnly.appendChild(this.buildReference());
      root.appendChild(refOnly);
    }

    /* Ereignisse */
    this.btn.step.addEventListener('click', function () { if (self.canInteract()) { self.doStep(); } });
    this.btn.instr.addEventListener('click', function () { if (self.canInteract()) { self.doInstruction(); } });
    this.btn.run.addEventListener('click', function () { self.toggleRun(); });
    this.btn.reset.addEventListener('click', function () { self.resetCPU(); });
    this.speedInput.addEventListener('input', function () { self.speed = +self.speedInput.value; });
    this.fmtSelect.addEventListener('change', function () {
      self.setFormatInternal(self.fmtSelect.value);
      self.setRamMsg('');
      self.render();
    });
    if (this.btn.clear) {
      this.btn.clear.addEventListener('click', function () {
        for (var k = 0; k < Core.MEM_SIZE; k++) { self.cpu.mem[k] = 0; }
        self.resetCPU();
        self.setNarration('Der Speicher wurde geleert.');
      });
    }
    if (this.btn.startup) { this.btn.startup.addEventListener('click', function () { self.restoreStartProgram(); }); }
    if (this.btn.dump) { this.btn.dump.addEventListener('click', function () { self.dumpToAssembler(); }); }
  };

  C.prototype.buildRow = function (i, parent) {
    var self = this;
    var row = el('div', 'cpuv-row');
    var addr = el('span', 'cpuv-addr', '');
    var cell = el('input', 'cpuv-cell', null, {
      type: 'text', spellcheck: 'false', autocomplete: 'off', autocapitalize: 'off',
      'aria-label': 'RAM-Zelle an Adresse ' + i
    });
    if (!this.opts.memoryEditable) { cell.readOnly = true; }
    var dis = el('span', 'cpuv-dis', '');
    var tags = el('span', 'cpuv-tags');
    row.appendChild(addr);
    row.appendChild(cell);
    row.appendChild(dis);
    row.appendChild(tags);
    parent.appendChild(row);

    cell.addEventListener('focus', function () { cell.select(); });
    cell.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { cell.blur(); }
      else if (e.key === 'Escape') { cell.value = self.fmt8(self.cpu.mem[i]); cell.blur(); }
    });
    cell.addEventListener('change', function () {
      var v = parseInput(cell.value, self.format);
      if (v === null) {
        cell.classList.add('is-invalid');
        self.setRamMsg('Ungültige Eingabe in Adresse ' + i + '. ' + FORMAT_HINT[self.format] + '.', 'error');
        setTimeout(function () { cell.classList.remove('is-invalid'); }, 900);
      } else {
        self.setRamMsg('');
        self.cpu.mem[i] = v;
      }
      cell.value = self.fmt8(self.cpu.mem[i]);
      self.render();
    });
    cell.addEventListener('blur', function () { cell.value = self.fmt8(self.cpu.mem[i]); });

    return { root: row, addr: addr, cell: cell, dis: dis, tags: tags };
  };

  C.prototype.setRamMsg = function (text, kind) {
    this.ramMsg.textContent = text;
    this.ramMsg.className = 'cpuv-ram-msg' + (kind ? ' is-' + kind : '');
  };

  C.prototype.buildAssembler = function (root) {
    var self = this;
    var sec = el('section', 'cpuv-block cpuv-hue-asm cpuv-asm', null, { 'aria-label': 'Assembler' });
    sec.appendChild(el('h3', 'cpuv-title', 'Assembler-Programm'));
    sec.appendChild(this.buildReference());

    this.asmArea = el('textarea', 'cpuv-asm-text', null, {
      rows: '13', spellcheck: 'false', autocomplete: 'off', autocapitalize: 'off',
      'aria-label': 'Assembler-Programm'
    });
    this.asmArea.value = this.opts.assembly;
    sec.appendChild(this.asmArea);

    var btns = el('div', 'cpuv-asm-btns');
    var load = el('button', 'cpuv-btn cpuv-btn-primary', 'In den Speicher laden', { type: 'button' });
    this.btn.startup = el('button', 'cpuv-btn', 'Startprogramm laden', { type: 'button' });
    btns.appendChild(load);
    btns.appendChild(this.btn.startup);
    sec.appendChild(btns);

    this.asmMsg = el('div', 'cpuv-asm-msg', '', { role: 'status' });
    sec.appendChild(this.asmMsg);
    root.appendChild(sec);

    load.addEventListener('click', function () { self.loadAssembly(); });
  };

  C.prototype.buildReference = function () {
    var self = this;
    var det = el('details', 'cpuv-ref');
    det.appendChild(el('summary', null, 'Befehlssatz und Assembler-Syntax'));
    var wrap = el('div', 'cpuv-ref-wrap');
    var table = el('table', 'cpuv-ref-table');
    var head = el('tr');
    ['Opcode', 'Mnemonic', 'Wirkung'].forEach(function (t) { head.appendChild(el('th', null, t)); });
    table.appendChild(head);
    Core.ISA.forEach(function (row) {
      var tr = el('tr');
      tr.appendChild(el('td', 'cpuv-mono', row[0]));
      tr.appendChild(el('td', 'cpuv-mono', row[1]));
      tr.appendChild(el('td', null, row[2]));
      table.appendChild(tr);
    });
    wrap.appendChild(table);
    det.appendChild(wrap);
    det.appendChild(el('p', null,
      'x und y wählen ein Register (00 = R0 bis 11 = R3), aaaa ist eine RAM-Adresse. Programmcode und Daten liegen im selben Speicher. ' +
      'Flag N wird gesetzt, wenn das höchste Bit des ALU-Ergebnisses 1 ist. Flag O wird gesetzt, wenn die Rechnung im Zweierkomplement überläuft. ' +
      'Nur ALU-Befehle ändern die Flags.'));
    det.appendChild(el('p', null,
      'Syntax: ein Befehl pro Zeile. Kommentare beginnen mit „#“ (bis zum Zeilenende) oder stehen zwischen /* und */ (auch über mehrere Zeilen). ' +
      'Adressen und Zahlen schreibst du als Dezimalzahl (13), hexadezimal (0xD) oder binär (0b1101), ohne „#“. ' +
      'Sprungziele können auch Labels sein: „name:“ definiert eins, „jmp name“ springt dorthin. ' +
      '„.org n“ setzt die nächste Speicheradresse, „.byte wert, …“ legt Datenbytes ab.'));
    det.addEventListener('toggle', function () { self.trigger('resize'); });
    return det;
  };

  /* ---------------- Assembler-Anbindung ---------------- */
  C.prototype.showAsmMessage = function (kind, text, errors) {
    if (!this.asmMsg) { return; }
    this.asmMsg.innerHTML = '';
    this.asmMsg.className = 'cpuv-asm-msg ' + (kind === 'error' ? 'is-error' : 'is-ok');
    this.asmMsg.appendChild(el('p', null, text));
    if (errors && errors.length) {
      var ul = el('ul');
      errors.forEach(function (e) { ul.appendChild(el('li', null, e.message)); });
      this.asmMsg.appendChild(ul);
    }
    this.trigger('resize');
  };

  C.prototype.applyInitialProgram = function () {
    var res = Core.assemble(this.opts.assembly);
    if (res.errors.length) {
      this.showAsmMessage('error', 'Das Startprogramm enthält Fehler und wurde nicht geladen:', res.errors);
      for (var i = 0; i < Core.MEM_SIZE; i++) { this.cpu.mem[i] = 0; }
    } else {
      this.cpu.mem = res.mem.slice();
      if (this.asmMsg) { this.asmMsg.innerHTML = ''; this.asmMsg.className = 'cpuv-asm-msg'; }
    }
    if (!this.startMem) { this.startMem = this.cpu.mem.slice(); }
  };

  C.prototype.restoreStartProgram = function () {
    if (this.asmArea) { this.asmArea.value = this.opts.assembly; }
    this.applyInitialProgram();
    this.resetCPU();
    this.setNarration('Das Startprogramm wurde in den Speicher geladen.');
  };

  C.prototype.dumpToAssembler = function () {
    if (!this.asmArea) { return; }
    this.asmArea.value = Core.disassemble(this.cpu.mem);
    this.showAsmMessage('ok', 'Der aktuelle Speicherinhalt wird als Befehlsfolge dargestellt. Zellen, die Daten enthalten, erscheinen dabei ebenfalls als Befehle.', []);
    this.setRamMsg('Der Speicherinhalt steht jetzt im Assembler-Editor.', 'ok');
  };

  C.prototype.loadAssembly = function () {
    var res = Core.assemble(this.asmArea.value);
    if (res.errors.length) {
      this.showAsmMessage('error', 'Das Programm wurde nicht geladen. Bitte diese Fehler beheben:', res.errors);
      return;
    }
    this.cpu.mem = res.mem.slice();
    this.resetCPU();
    this.showAsmMessage('ok', 'Programm geladen: ' + res.used + ' von 16 Speicherzellen belegt.', []);
    this.setNarration('Das Programm wurde in den Speicher geladen. Der Prozessor wurde zurückgesetzt.');
  };

  /* ---------------- Darstellung ---------------- */
  C.prototype.render = function () {
    var cpu = this.cpu, n = this.nodes, i;
    n.pc._val.textContent = this.fmt4(cpu.pc);
    n.ar._val.textContent = this.fmt4(cpu.ar);
    n.ir._val.textContent = this.fmt8(cpu.ir);
    for (i = 0; i < 4; i++) { n['r' + i]._val.textContent = this.fmt8(cpu.regs[i]); }
    n.aluA._val.textContent = cpu.alu.a === null ? '–' : this.fmt8(cpu.alu.a);
    n.aluB._val.textContent = cpu.alu.b === null ? '–' : this.fmt8(cpu.alu.b);
    n.aluR._val.textContent = cpu.alu.res === null ? '–' : this.fmt8(cpu.alu.res);
    n.aluOp.textContent = cpu.alu.op ? Core.ALU_LABEL[cpu.alu.op] : '–';
    n.flagN.classList.toggle('is-on', cpu.n);
    n.flagO.classList.toggle('is-on', cpu.o);
    n.flagN.setAttribute('aria-label', 'Flag N: ' + (cpu.n ? 1 : 0));
    n.flagO.setAttribute('aria-label', 'Flag O: ' + (cpu.o ? 1 : 0));
    n.decText.textContent = cpu.decoded ? cpu.decoded.text : '–';
    n.decExplain.textContent = cpu.decoded ? cpu.decoded.explain : 'Noch kein Befehl dekodiert.';

    for (i = 0; i < Core.MEM_SIZE; i++) {
      var row = this.rows[i];
      row.addr.textContent = this.fmt4(i);
      if (this.diagram.ownerDocument.activeElement !== row.cell) { row.cell.value = this.fmt8(cpu.mem[i]); }
      row.dis.textContent = Core.decode(cpu.mem[i]).text;
      row.tags.innerHTML = '';
      if (cpu.pc === i) { row.tags.appendChild(el('span', 'cpuv-tag cpuv-tag-pc', 'PC')); }
      if (cpu.ar === i) { row.tags.appendChild(el('span', 'cpuv-tag cpuv-tag-ar', 'AR')); }
    }

    this.setPhaseIndicator(cpu.phase);
    this.counters.textContent = 'Takte: ' + cpu.ticks + '   Befehle: ' + cpu.instrs;
    this.updateButtons();
  };

  C.prototype.setPhaseIndicator = function (phase) {
    for (var id in this.pills) {
      if (this.pills.hasOwnProperty(id)) { this.pills[id].classList.toggle('is-active', id === phase); }
    }
  };

  C.prototype.setNarration = function (text) { this.narration.textContent = text; };

  C.prototype.canInteract = function () {
    return !this.running && !this.busy && !this.cpu.halted;
  };

  C.prototype.updateButtons = function () {
    var free = this.canInteract();
    this.btn.step.disabled = !free;
    this.btn.instr.disabled = !free;
    this.btn.run.disabled = this.cpu.halted || (this.busy && !this.running);
    this.btn.run.textContent = this.running ? 'Pause' : 'Start';
  };

  /* ---------------- Ablaufsteuerung ---------------- */
  C.prototype.moveDuration = function () { return DURATIONS[this.speed - 1]; };

  C.prototype.nodeFor = function (key) {
    if (key.indexOf('ram:') === 0) { return this.rows[+key.slice(4)].cell; }
    return this.nodes[key];
  };

  C.prototype.centerOf = function (node) {
    var d = this.diagram.getBoundingClientRect(), r = node.getBoundingClientRect();
    return { x: r.left - d.left + r.width / 2, y: r.top - d.top + r.height / 2 };
  };

  C.prototype.useBus = function () {
    return window.getComputedStyle(this.busEl).display !== 'none';
  };

  C.prototype.animateChip = function (m, dur) {
    var self = this;
    if (dur <= 0 || !this.canAnimate) { return Promise.resolve(); }
    var a = this.centerOf(this.nodeFor(m.from)), b = this.centerOf(this.nodeFor(m.to));
    var pts = [a];
    if (this.useBus()) {
      var bc = this.centerOf(this.busEl);
      pts.push({ x: bc.x, y: a.y }, { x: bc.x, y: b.y });
    }
    pts.push(b);

    var total = 0, acc = [0], k;
    for (k = 1; k < pts.length; k++) {
      total += Math.abs(pts[k].x - pts[k - 1].x) + Math.abs(pts[k].y - pts[k - 1].y);
      acc.push(total);
    }
    var frames = pts.map(function (p, idx) {
      return {
        transform: 'translate(' + p.x + 'px,' + p.y + 'px) translate(-50%,-50%)',
        offset: total > 0 ? acc[idx] / total : idx / (pts.length - 1)
      };
    });

    var chip = el('div', 'cpuv-chip', m.label);
    chip.style.transform = frames[0].transform;
    this.diagram.appendChild(chip);

    return new Promise(function (resolve) {
      var anim = chip.animate(frames, { duration: dur, easing: 'ease-in-out', fill: 'forwards' });
      self.activeAnims.push(anim);
      var done = function () {
        var idx = self.activeAnims.indexOf(anim);
        if (idx >= 0) { self.activeAnims.splice(idx, 1); }
        if (chip.parentNode) { chip.parentNode.removeChild(chip); }
        resolve();
      };
      anim.onfinish = done;
      anim.oncancel = done;
    });
  };

  C.prototype.clearVisuals = function () {
    var anims = this.activeAnims.slice();
    anims.forEach(function (a) { try { a.cancel(); } catch (e) { /* ignorieren */ } });
    this.activeAnims = [];
    var chips = this.diagram.querySelectorAll('.cpuv-chip');
    for (var i = 0; i < chips.length; i++) { chips[i].parentNode.removeChild(chips[i]); }
    var marked = this.diagram.querySelectorAll('.is-src, .is-dst, .is-read, .is-write, .is-pulse, .is-active');
    for (var j = 0; j < marked.length; j++) {
      marked[j].classList.remove('is-src', 'is-dst', 'is-read', 'is-write', 'is-pulse', 'is-active');
    }
  };

  C.prototype.execOp = function (op, tok) {
    var self = this, dur = this.moveDuration(), moves = op.moves || [];

    this.setNarration(op.text);
    this.setPhaseIndicator(op.phase);

    moves.forEach(function (m) {
      self.nodeFor(m.from).classList.add('is-src');
      self.nodeFor(m.to).classList.add('is-dst');
    });
    if (moves.length && dur > 0 && this.useBus()) { this.busEl.classList.add('is-active'); }
    if (op.read !== undefined) { this.rows[op.read].root.classList.add('is-read'); }
    if (op.write !== undefined) { this.rows[op.write].root.classList.add('is-write'); }
    (op.pulse || []).forEach(function (key) { self.nodes[key].classList.add('is-pulse'); });

    var travel = Promise.all(moves.map(function (m) { return self.animateChip(m, dur); }));
    var hold = delay(moves.length ? 0 : Math.round(dur * 0.6));

    return Promise.all([travel, hold]).then(function () {
      if (tok !== self.token) { return false; }
      op.commit();
      self.clearVisuals();
      self.render();
      return true;
    });
  };

  C.prototype.doStep = function () {
    var self = this;
    if (this.busy) { return Promise.resolve(false); }
    var op = this.cpu.nextOp();
    if (!op) { this.onHalted(); return Promise.resolve(false); }
    this.busy = true;
    this.updateButtons();
    var tok = this.token;
    return this.execOp(op, tok).then(function (ok) {
      if (tok === self.token) {
        self.busy = false;
        if (self.cpu.halted) { self.onHalted(); }
        self.updateButtons();
      }
      return ok;
    });
  };

  C.prototype.doInstruction = function () {
    var self = this, tok = this.token;
    function loop() {
      return self.doStep().then(function (ok) {
        if (ok && tok === self.token && !self.cpu.halted && self.cpu.queue.length > 0) { return loop(); }
        return ok;
      });
    }
    return loop();
  };

  C.prototype.toggleRun = function () {
    var self = this;
    if (this.running) { this.running = false; this.updateButtons(); return; }
    if (this.busy || this.cpu.halted) { return; }
    this.running = true;
    this.updateButtons();
    var tok = this.token;
    (function loop() {
      if (!self.running || tok !== self.token) { return; }
      self.doStep().then(function (ok) {
        if (tok !== self.token) { return; }
        if (!self.running || !ok || self.cpu.halted) {
          self.running = false;
          self.updateButtons();
          return;
        }
        setTimeout(loop, GAPS[self.speed - 1]);
      });
    })();
  };

  C.prototype.onHalted = function () {
    this.running = false;
    this.setNarration('Programm beendet: Der Prozessor hat HALT ausgeführt. Mit „Zurücksetzen“ kann das Programm erneut gestartet werden.');
    this.updateButtons();
  };

  C.prototype.resetCPU = function () {
    this.token++;
    this.running = false;
    this.busy = false;
    this.clearVisuals();
    this.cpu.reset();
    this.render();
    this.setNarration(IDLE_TEXT);
  };

  C.Core = Core;
  C.DEFAULT_ASM = DEFAULT_ASM;
  return C;
})(H5P.jQuery, H5P.EventDispatcher);
