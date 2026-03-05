export const appStyles = `
:root {
  --font-display: "Sora", "Segoe UI", Tahoma, sans-serif;
  --font-body: "Manrope", "Segoe UI", Tahoma, sans-serif;
  --bg-main: #06090f;
  --bg-surface: #121823;
  --bg-surface-alt: #1a2231;
  --bg-accent: #2e66ff;
  --text-main: #e8f0ff;
  --text-muted: #97a9c8;
  --text-strong: #ffffff;
  --line-soft: #2b3750;
  --line-strong: #44567d;
  --ok: #5bd39a;
  --warning: #ffc466;
  --danger: #ff6f7f;
  --radius-card: 16px;
  --radius-pill: 999px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --shadow-soft: 0 16px 32px rgba(0, 0, 0, 0.35);
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  min-height: 100vh;
  color: var(--text-main);
  font-family: var(--font-body);
  background: radial-gradient(120% 120% at 10% 0%, #121d33 0%, #06090f 55%, #04060a 100%);
}

a { color: inherit; text-decoration: none; }

.shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 280px 1fr;
}

.shell__sidebar {
  border-right: 1px solid var(--line-soft);
  background: linear-gradient(180deg, #0f1520 0%, #0c1019 100%);
  padding: var(--space-6);
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.shell__brand {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin-bottom: var(--space-6);
}

.shell__section-title {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: var(--space-5) 0 var(--space-3);
}

.shell__menu {
  display: grid;
  gap: var(--space-2);
}

.shell__menu-link {
  border: 1px solid transparent;
  border-radius: 12px;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: 42px;
  padding: 0 var(--space-3);
}

.shell__menu-link:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: var(--line-soft);
}

.shell__menu-link.is-active {
  background: linear-gradient(90deg, rgba(46, 102, 255, 0.25) 0%, rgba(46, 102, 255, 0.12) 100%);
  border-color: rgba(97, 151, 255, 0.45);
}

.shell__content {
  min-width: 0;
  display: grid;
  grid-template-rows: auto 1fr;
}

.shell__topbar {
  border-bottom: 1px solid var(--line-soft);
  background: rgba(11, 16, 25, 0.85);
  backdrop-filter: blur(12px);
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: 0 var(--space-6);
}

.shell__topbar-title {
  font-family: var(--font-display);
  font-size: 24px;
  margin: 0;
}

.shell__topbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.shell__viewport {
  padding: var(--space-6);
}

.ui-card {
  border: 1px solid var(--line-soft);
  background: linear-gradient(180deg, rgba(17, 24, 36, 0.97) 0%, rgba(11, 16, 25, 0.97) 100%);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  padding: var(--space-5);
}

.ui-card + .ui-card {
  margin-top: var(--space-5);
}

.ui-card__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 20px;
}

.ui-card__subtitle {
  margin: var(--space-2) 0 0;
  color: var(--text-muted);
}

.ui-card__body {
  margin-top: var(--space-4);
}

.ui-button {
  border: 1px solid transparent;
  border-radius: 12px;
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  padding: 0 var(--space-4);
  cursor: pointer;
}

.ui-button--primary {
  background: linear-gradient(90deg, #2e66ff 0%, #4f8cff 100%);
  color: #ffffff;
}

.ui-button--secondary {
  background: rgba(255, 255, 255, 0.03);
  border-color: var(--line-strong);
  color: var(--text-main);
}

.ui-button--ghost {
  background: transparent;
  border-color: var(--line-soft);
  color: var(--text-muted);
}

.ui-badge {
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-pill);
  border: 1px solid var(--line-strong);
  min-height: 28px;
  padding: 0 var(--space-3);
  font-size: 12px;
  font-weight: 700;
}

.ui-badge--success { color: var(--ok); border-color: rgba(91, 211, 154, 0.5); }
.ui-badge--warning { color: var(--warning); border-color: rgba(255, 196, 102, 0.5); }
.ui-badge--info { color: #7bc1ff; border-color: rgba(123, 193, 255, 0.5); }
.ui-badge--neutral { color: var(--text-main); }

.ui-field {
  display: grid;
  gap: var(--space-2);
}

.ui-field__label {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.ui-input {
  width: 100%;
  min-height: 40px;
  border: 1px solid var(--line-soft);
  border-radius: 10px;
  background: var(--bg-surface-alt);
  color: var(--text-main);
  padding: 0 var(--space-3);
  font-size: 14px;
}

.ui-input:focus {
  outline: 2px solid rgba(87, 142, 255, 0.6);
  outline-offset: 1px;
}

.ui-empty-state,
.ui-error-state {
  border: 1px dashed var(--line-strong);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  padding: var(--space-5);
}

.ui-empty-state h3,
.ui-error-state h3 {
  margin: 0;
  font-family: var(--font-display);
}

.ui-empty-state p,
.ui-error-state p {
  margin: var(--space-2) 0 var(--space-4);
  color: var(--text-muted);
}

.ui-skeleton {
  display: grid;
  gap: var(--space-2);
}

.ui-skeleton__line {
  display: block;
  height: 12px;
  border-radius: var(--radius-pill);
  background: linear-gradient(90deg, rgba(74, 97, 142, 0.2) 0%, rgba(74, 97, 142, 0.45) 50%, rgba(74, 97, 142, 0.2) 100%);
}

.ui-skeleton__line--1 { width: 92%; }
.ui-skeleton__line--2 { width: 78%; }
.ui-skeleton__line--3 { width: 67%; }
.ui-skeleton__line--4 { width: 84%; }

.stack {
  display: grid;
  gap: var(--space-4);
}

.grid-2 {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.text-muted {
  color: var(--text-muted);
}

.metric {
  margin: 0;
  font-size: 36px;
  font-family: var(--font-display);
  line-height: 1.1;
}

.is-positive {
  color: var(--ok);
  font-weight: 700;
}

.is-negative {
  color: #ff8f98;
  font-weight: 700;
}

.dashboard-filters {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  border: 1px solid var(--line-soft);
  border-radius: 12px;
  padding: var(--space-2);
  background: rgba(255, 255, 255, 0.02);
}

.dashboard-filter {
  border: 1px solid transparent;
  border-radius: 10px;
  min-width: 56px;
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-weight: 700;
}

.dashboard-filter.is-active {
  color: var(--text-strong);
  border-color: rgba(130, 172, 255, 0.45);
  background: rgba(46, 102, 255, 0.22);
}

.dashboard-filter.is-disabled {
  pointer-events: none;
  opacity: 0.45;
}

.list-plain {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: var(--space-3);
}

.list-plain li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  border-bottom: 1px solid rgba(70, 84, 110, 0.35);
  padding-bottom: var(--space-3);
}

.list-plain li:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.list-plain p {
  margin: var(--space-1) 0 0;
}

.connection-row {
  border: 1px solid var(--line-soft);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  padding: var(--space-3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.connection-row p {
  margin: var(--space-1) 0 0;
}

.connection-row__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.transactions-filter-form {
  border: 1px solid var(--line-soft);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  padding: var(--space-4);
  display: grid;
  gap: var(--space-4);
}

.transactions-toolbar-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.transactions-table-wrapper {
  overflow-x: auto;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.transactions-table th,
.transactions-table td {
  text-align: left;
  border-bottom: 1px solid rgba(70, 84, 110, 0.35);
  padding: var(--space-3) var(--space-2);
  vertical-align: top;
}

.transactions-table th {
  color: var(--text-muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.transactions-table tr:last-child td {
  border-bottom: 0;
}

.row-action-form {
  display: grid;
  gap: var(--space-2);
  min-width: 180px;
}

.transactions-pagination {
  margin-top: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.module-tabs {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  border: 1px solid var(--line-soft);
  border-radius: 12px;
  padding: var(--space-2);
  background: rgba(255, 255, 255, 0.02);
}

.progress-ring {
  --progress: 0;
  width: 200px;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  background: conic-gradient(#ffbe55 calc(var(--progress) * 1%), rgba(255, 255, 255, 0.1) 0);
  display: grid;
  place-items: center;
}

.progress-ring__inner {
  width: calc(100% - 38px);
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  background: rgba(13, 18, 27, 0.94);
  border: 1px solid var(--line-soft);
  display: grid;
  place-items: center;
  text-align: center;
}

.progress-ring__inner strong {
  font-family: var(--font-display);
  font-size: 30px;
  line-height: 1;
}

.progress-ring__inner span {
  color: var(--text-muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.recurrents-group {
  border: 1px solid var(--line-soft);
  border-radius: 12px;
  padding: var(--space-4);
  background: rgba(255, 255, 255, 0.02);
}

.recurrents-group__header h3 {
  margin: 0 0 var(--space-3);
  font-family: var(--font-display);
  font-size: 16px;
  text-transform: capitalize;
}

.recurrents-row {
  align-items: flex-start !important;
}

.recurrents-row__meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.cashflow-timeline {
  border-top: 1px solid rgba(70, 84, 110, 0.35);
  padding-top: var(--space-4);
  display: grid;
  gap: var(--space-3);
}

.cashflow-timeline__row {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr) minmax(0, 1fr) 120px;
  align-items: center;
  gap: var(--space-3);
}

.cashflow-timeline__row span {
  color: var(--text-muted);
  text-transform: capitalize;
  font-size: 13px;
}

.cashflow-bar {
  min-height: 10px;
  border-radius: var(--radius-pill);
}

.cashflow-bar--income {
  background: linear-gradient(90deg, rgba(91, 211, 154, 0.7) 0%, rgba(91, 211, 154, 1) 100%);
}

.cashflow-bar--expense {
  background: linear-gradient(90deg, rgba(255, 111, 127, 0.7) 0%, rgba(255, 111, 127, 1) 100%);
}

.cashflow-timeline__row strong {
  text-align: right;
}

.invoices-breakdown > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  border-bottom: 1px solid rgba(70, 84, 110, 0.35);
  padding-bottom: var(--space-2);
}

.invoices-breakdown > div:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.invoices-breakdown span {
  color: var(--text-muted);
}

.dashboard-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(3, 6, 10, 0.78);
  display: grid;
  place-items: center;
  padding: var(--space-4);
}

.dashboard-modal-card {
  width: min(460px, 100%);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-card);
  background: linear-gradient(180deg, rgba(18, 24, 36, 1) 0%, rgba(11, 16, 25, 1) 100%);
  box-shadow: var(--shadow-soft);
  padding: var(--space-5);
  display: grid;
  gap: var(--space-4);
}

.dashboard-modal-card h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 26px;
}

.dashboard-modal-card p {
  margin: 0;
}

.dashboard-modal-progress {
  display: grid;
  gap: var(--space-2);
}

.dashboard-modal-progress strong {
  font-size: 40px;
  line-height: 1;
}

.progress-track {
  height: 12px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.progress-fill {
  display: block;
  height: 100%;
  border-radius: var(--radius-pill);
  background: linear-gradient(90deg, #7a37ff 0%, #a33bff 100%);
}

.dashboard-modal-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: var(--space-6);
}

.login-page__panel {
  width: min(480px, 100%);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-card);
  background: rgba(12, 18, 28, 0.95);
  padding: var(--space-6);
}

.login-page__panel h1 {
  margin: 0 0 var(--space-3);
  font-family: var(--font-display);
  font-size: 28px;
}

.login-page__panel p {
  margin: 0 0 var(--space-5);
  color: var(--text-muted);
}

@media (max-width: 1140px) {
  .shell {
    grid-template-columns: 88px 1fr;
  }

  .shell__section-title,
  .shell__menu-label {
    display: none;
  }

  .shell__brand {
    font-size: 14px;
    margin-bottom: var(--space-4);
  }

  .shell__menu-link {
    justify-content: center;
    padding: 0;
  }
}

@media (max-width: 768px) {
  .shell {
    grid-template-columns: 1fr;
  }

  .shell__sidebar {
    position: static;
    height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--line-soft);
    padding: var(--space-4);
  }

  .shell__menu {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-2);
  }

  .shell__section-title {
    display: block;
  }

  .shell__menu-label {
    display: inline;
    font-size: 12px;
  }

  .shell__topbar {
    min-height: 64px;
    padding: 0 var(--space-4);
  }

  .shell__topbar-title {
    font-size: 20px;
  }

  .shell__viewport {
    padding: var(--space-4);
  }

  .grid-2 {
    grid-template-columns: 1fr;
  }

  .progress-ring {
    width: 160px;
  }

  .cashflow-timeline__row {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }

  .cashflow-timeline__row strong {
    text-align: left;
  }

  .dashboard-modal-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
`;
