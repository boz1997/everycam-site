/* Sharecam home: menu state, the hand of cards and the pricing tabs. The page works fully without this file. */
(function () {
  var d = document;

  /* mobile menu: <details> works without JS; this adds aria-expanded, Escape, outside click and close-on-link */
  var menu = d.querySelector('.nav-mobile');
  if (menu) {
    var sum = menu.querySelector('summary');
    var sync = function () { sum.setAttribute('aria-expanded', menu.open ? 'true' : 'false'); };
    sync();
    menu.addEventListener('toggle', sync);
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) menu.open = false; });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.open) { menu.open = false; sum.focus(); } });
    d.addEventListener('click', function (e) { if (menu.open && !menu.contains(e.target)) menu.open = false; });
  }

  /* hand of cards (C): prev/next brings a design to the front. Without JS the fan is static. */
  var fan = d.querySelector('[data-fan]'), ctl = d.querySelector('[data-fan-controls]');
  if (fan && ctl) {
    var cards = [].slice.call(fan.querySelectorAll('.fan-card')), n = cards.length;
    var nameEl = ctl.querySelector('[data-fan-name]'), idxEl = ctl.querySelector('[data-fan-index]');
    var front = 2;
    var render = function () {
      cards.forEach(function (c, i) {
        var k = (i - front + n) % n; if (k > 2) k -= n;
        c.style.setProperty('--k', k);
        c.style.setProperty('--a', Math.abs(k));
      });
      nameEl.textContent = cards[front].getAttribute('data-name');
      idxEl.textContent = front + 1;
    };
    ctl.hidden = false;
    ctl.querySelector('[data-fan-next]').addEventListener('click', function () { front = (front + 1) % n; render(); });
    ctl.querySelector('[data-fan-prev]').addEventListener('click', function () { front = (front + n - 1) % n; render(); });
    render();
  }

  /* pricing tabs (05 §6.2): Events | Photographers. Without JS both panels show, each under its own h3.
     ARIA tabs pattern: roving tabindex, Left/Right/Home/End move and select, Events selected by default.
     /#pricing-photographers (on load, on hashchange, or any link to it) selects that tab, then scrolls to the strip:
     the panel is hidden until selected, so the browser can't scroll to it by itself. */
  var strip = d.querySelector('[data-tabs]');
  if (strip && !d.body.classList.contains('no-pro')) {
    var tabs = [].slice.call(strip.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (t) { return d.getElementById(t.getAttribute('aria-controls')); });
    var select = function (i, focus) {
      tabs.forEach(function (t, j) {
        var on = j === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        panels[j].hidden = !on;
      });
      if (focus) tabs[i].focus();
    };
    panels.forEach(function (p, j) {
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('aria-labelledby', tabs[j].id);
      p.tabIndex = 0;
    });
    strip.hidden = false;
    strip.closest('section').classList.add('tabs-on');
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, j = k === 'ArrowRight' ? (i + 1) % tabs.length : k === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : k === 'Home' ? 0 : k === 'End' ? tabs.length - 1 : -1;
        if (j < 0) return;
        e.preventDefault();
        select(j, true);
      });
    });
    var fromHash = function (scroll) {
      var i = panels.map(function (p) { return '#' + p.id; }).indexOf(location.hash);
      if (i < 0) return false;
      select(i);
      if (scroll) strip.scrollIntoView({ block: 'start' });
      return true;
    };
    select(0);
    /* on load: select now; scroll once the page has settled, after the browser's own (instant) fragment jump */
    if (fromHash(false)) window.addEventListener('load', function () {
      setTimeout(function () {
        strip.scrollIntoView({ block: 'start', behavior: 'instant' });
        /* the fragment jump focused the panel; drop the ring (Tab still continues from here) */
        if (panels.indexOf(d.activeElement) > -1) d.activeElement.blur();
      }, 60);
    });
    window.addEventListener('hashchange', function () { fromHash(true); });
    d.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#pricing-"]');
      if (!a || a.getAttribute('href') !== location.hash) return;
      e.preventDefault();  /* same hash again: no hashchange fires, so select and scroll here */
      fromHash(true);
    });
  }
  /* smooth scrolling for in-page links starts after load (see style.css) */
  window.addEventListener('load', function () { setTimeout(function () { d.documentElement.classList.add('loaded'); }, 120); });
})();
