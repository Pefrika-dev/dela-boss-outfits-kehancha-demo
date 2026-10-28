/*
 * DE LA BOSS OUTFITS — store photography gallery
 * Reveals a photograph when it exists, and keeps a labelled placeholder
 * when it does not. No build step, no dependency.
 */
(function () {
  'use strict';

  function init() {
    var slots = document.querySelectorAll('[data-store-gallery] .store-shot[data-photo]');
    if (!slots.length) return;

    Array.prototype.forEach.call(slots, function (figure) {
      var img = figure.querySelector('img');
      var src = figure.getAttribute('data-photo');
      if (!img || !src) return;

      img.addEventListener('load', function () {
        figure.classList.remove('is-pending');
        figure.classList.add('is-ready');
      });

      img.addEventListener('error', function () {
        figure.classList.add('is-pending');
        figure.classList.remove('is-ready');
        img.removeAttribute('src');
      });

      img.src = src;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
