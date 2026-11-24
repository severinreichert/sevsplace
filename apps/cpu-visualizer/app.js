/* Startet die CPU-Visualisierung. Einstellungen per URL-Parameter:
   ?format=bin|hex|dec|sdec   Standard-Zahlenformat
   &assembler=0               Assembler-Editor ausblenden
   &editable=0                Speicherzellen sperren
   &task=Text                 Aufgabentext oberhalb des Prozessors
   &asm=Zeile 1|Zeile 2|...   Startprogramm, "|" trennt die Zeilen.
                              Kommentare nur als Blockkommentar (Slash-Stern ... Stern-Slash):
                              das Zeichen "#" beginnt in einer Adresse ein Fragment und geht dort nicht. */
(function () {
  // Parameter selbst lesen: Ein "+" bleibt ein Pluszeichen (URLSearchParams würde es zum Leerzeichen machen),
  // Leerzeichen und Umlaute dürfen direkt geschrieben werden, ein "&" im Text als %26.
  var params = {};
  window.location.search.replace(/^\?/, '').split('&').forEach(function (pair) {
    if (!pair) { return; }
    var i = pair.indexOf('=');
    var key = i < 0 ? pair : pair.slice(0, i), value = i < 0 ? '' : pair.slice(i + 1);
    try { key = decodeURIComponent(key); value = decodeURIComponent(value); } catch (e) { /* ungültige %-Folge: Text unverändert lassen */ }
    params[key] = value;
  });
  var q = { get: function (name) { return params.hasOwnProperty(name) ? params[name] : null; } };
  function flag(name, def) {
    var v = q.get(name);
    return v === null ? def : !(v === '0' || v === 'false' || v === 'nein');
  }
  var opts = {
    taskText: q.get('task') || '',
    defaultFormat: q.get('format') || 'bin',
    showAssembler: flag('assembler', true),
    memoryEditable: flag('editable', true)
  };
  var asm = q.get('asm');
  if (asm !== null) { opts.assembly = asm.split('|').join('\n'); }

  // Im Rahmen (z. B. H5P Iframe Embedder) scrollt die Seite in sich selbst,
  // weil der Rahmen eine feste Höhe hat und selbst nicht scrollt.
  if (window.self !== window.top) { document.documentElement.classList.add('cpuv-embedded'); }

  var app = document.getElementById('app');
  new H5P.CPUVisualizer(opts, 0).attach(H5P.jQuery(app));
})();
