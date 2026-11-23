/* Startet die CPU-Visualisierung. Einstellungen per URL-Parameter:
   ?format=bin|hex|dec|sdec   Standard-Zahlenformat
   &assembler=0               Assembler-Editor ausblenden
   &editable=0                Speicherzellen sperren
   &task=Text                 Aufgabentext oberhalb des Prozessors
   &asm=Zeile 1|Zeile 2|...   Startprogramm, "|" trennt die Zeilen ("#" weglassen) */
(function () {
  var q = new URLSearchParams(window.location.search);
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
