/* Minimale Nachbildung der H5P-Schnittstelle, damit cpu-visualizer.js
   auch ohne H5P als eigenständige Webseite läuft. */
var H5P = H5P || {};
H5P.jQuery = function (el) {
  return { 0: el, addClass: function (c) { el.classList.add(c); return this; } };
};
H5P.EventDispatcher = function () { this._listeners = {}; };
H5P.EventDispatcher.prototype.on = function (type, fn) {
  (this._listeners[type] = this._listeners[type] || []).push(fn);
};
H5P.EventDispatcher.prototype.trigger = function (type) {
  var list = (this._listeners || {})[type] || [];
  for (var i = 0; i < list.length; i++) { list[i].call(this); }
};
