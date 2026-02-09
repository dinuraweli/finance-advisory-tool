# Copilot / Agent Instructions — Fintech 2 copy

Summary
- This is a static, client-side fintech mini-site (HTML/CSS/JS). No build step or server-side code. Pages are paired with page-specific JS (e.g., loan.html ↔ js/loan.js) and shared assets live under `css/`, `js/`, `json/`, and `images/`.

Key architecture notes
- Single-page-ish pages: each HTML page (`index.html`, `loan.html`, `tax.html`, `fx.html`, etc.) wires up a page-specific script in `js/` that owns a global `state` object and initialization routines.
- Data: many pages embed domain data as JS constants (see `js/fx.js` and `js/loan.js` where `BANKS` arrays are defined). The `json/` folder contains JSON seeds (e.g., `json/fxRates.json`, `json/loanRates.json`) but the current codebase does not rely on runtime fetches — scripts use inline constants instead.
- UI patterns: scripts use direct DOM lookups by id, inline `onclick` handlers and global functions (e.g., `removeLumpSum`, `toggleBank`). They also create/destroy Chart.js instances (destroy before re-creating).

What to know when editing code
- Keep scripts global: do not convert functions to isolated modules without updating HTML references. Many HTML files reference functions by name in markup.
- Preserve `state` objects and `init()` call semantics in `js/*`. Example patterns:
  - `js/fx.js`: `state = { view: 'converter', ... }`, helper `getRate()` / `getMidRate()` and `init()` at bottom that calls `convertCurrency()` and chart updates.
  - `js/loan.js`: `calculate()` drives rendering; `calculatePayment()` returns amortization schedules.
  - `js/tax.js`: uses `document.addEventListener('DOMContentLoaded', ...)` and `calculateTaxBySlabs()`.
- Chart usage: destroy existing Chart instances before creating a new one (see `charts.buy.destroy()` style calls).

Developer workflows (how to run & debug locally)
- Quick preview: open `index.html` in the browser, but if a page tries to fetch resources via relative URLs use a static server to avoid CORS/file:// issues. Run from the project root:

  - Python 3 simple server:

    python3 -m http.server 8000

  - Then open http://localhost:8000 in your browser.
- Debugging: open DevTools console — code is plain JS and relies on DOM ids, so stack traces map directly to files under `js/`.

Project conventions & gotchas
- Page pairing: page file names map to scripts of the same base name (loan.html → js/loan.js). When adding a page follow the same naming pattern.
- Global identifiers: many functions and state vars are global; renaming requires updating HTML attributes that call them.
- Data sources: although a `json/` folder exists, do not assume runtime JSON fetches — inspect the specific `js/` file before changing data-loading behavior.
- Formatting: currency formatting uses `toLocaleString('en-LK' ...)` or Intl.NumberFormat — keep locale-aware formatting for LKR.

Integration points
- Chart.js is used heavily (included from HTML via CDN in pages). When updating charts, follow existing callback/tooltip formatting.
- Images and assets live under `images/`. CSS shared layout is in `css/base.css` and page-specific CSS may exist at root (e.g., `loan.css`).

Quick examples (copyable)
- Find mid-market rate (from `js/fx.js`):

  const mid = getMidRate('USD');

- Calculate amortization schedule (from `js/loan.js`):

  const schedule = calculatePayment(principal, rate, months, lumpSums);

If you want changes
- Prefer small, local edits that keep global API stable. If you migrate a page to modules, update the page HTML to use the module (type="module") and ensure all handlers are wired correctly.

Files to check first
- [index.html](index.html)
- [js/fx.js](js/fx.js)
- [js/loan.js](js/loan.js)
- [js/tax.js](js/tax.js)
- [css/base.css](css/base.css)
- [json/fxRates.json](json/fxRates.json)

Questions / feedback
- I created/updated this file with concrete examples. Tell me which sections need more detail or which files you want linked/expanded and I will iterate.
