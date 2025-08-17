## Tasklista — Nation Builder: Republic Edition

Referentni dokument: `DEVELOPMENTPLAN.md`

Legenda:
- [ ] nije započeto
- [~] u toku
- [x] završeno

### Globalna organizacija i repo
- [x] Inicijalizovati repozitorijum i granu `main`
- [x] Dodati `README.md` sa uputstvima
- [x] Struktura za GitHub Pages u `docs/`
  - [x] `docs/index.html`
  - [x] `docs/styles.css`
  - [x] `docs/main.js`
  - [x] `docs/state/store.js`
  - [x] `docs/config/{balance,eras,features}.json`
  - [x] `docs/i18n/sr.json`
  - [x] `docs/.nojekyll`
- [x] Postaviti remote `origin` i prvi push
- [ ] Podesiti GitHub Pages: Settings → Pages → Deploy from a branch → `main`/`docs/`

### Faza 1 — Core mehanika (2–3 nedelje)
- [x] Game loop u `docs/main.js` (raf + simulacioni TICK)
- [x] Centralni store i autosave u `docs/state/store.js`
- [x] Sistem resursa i osnovna proizvodnja (POP, DP, ST, PR)
- [x] Minimalni HUD u `docs/index.html` (DP/ST/PR/II/POP)
- [x] Osnovni balans i konfiguracija u `docs/config/balance.json`
- [x] Kupovina prvog nivoa Parlamenta u `docs/main.js`
- [x] Events feed panel (UI + logika događaja)
- [ ] Tutorijal „Democracy 101” (osnovni onboarding panel)
- [ ] Minimalni stil dizajn tokeni u `styles.css` (sekcija tokens)

Acceptance (DoD Faza 1)
- [ ] Jedinični testovi za logiku resursa i cene (planirano; alat TBA)
- [x] Autosave i load rade pouzdano (LocalStorage)
- [ ] Lighthouse: a11y ≥ 90, performance ≥ 80 (desktop)
- [x] Ažurirani `README.md` i `DEVELOPMENTPLAN.md`

### Faza 2 — Institucije i upgrade stabla (3–4 nedelje)
- [~] Zakonodavna grana — proširenje nivoa, efekata i cena (`balance.json` + UI u `index.html`/`main.js`)
- [x] Simple Law akcija (cena/efekti iz konfiguracije)
- [ ] Constitutional Amendment akcija (konfigurabilno)
- [ ] International Treaty akcija (konfigurabilno)
- [~] Izvršna grana — predsedništvo + ministarstva (`main.js` + `balance.json`)
- [~] Sudska grana — sudovi + pravni okviri (`main.js` + `balance.json`)
- [ ] UI paneli: `InstitutionsView` i `PoliciesView` (DOM sekcije u `index.html` + logika u `main.js`)
- [ ] Bulk/auto upgrade opcije (heuristika + UI)

### Događaji (Events)
- [x] Events feed panel i logovi
- [x] Elections event (periodični, sa buff/debuff i countdown)

Acceptance (DoD Faza 2)
- [ ] Tri panela funkcionalna; osnovni balans bez deadlock-ova
- [ ] i18n ključevi za nove pojmove (`docs/i18n/sr.json`)
- [ ] A11y: tastatura/fokus i ARIA atribute za nove komponente

### Faza 3 — Edukativni sadržaji i scenariji (2–3 nedelje)
- [ ] Mikro-tekstovi za sve pojmove (mapa u `docs/i18n/sr.json` → content-only update)
- [ ] Interaktivni tutorijali (4 glavne teme)
- [ ] Istorijski scenariji (min. 3) sa specifičnim modifikatorima
- [ ] Quiz sistem sa lokalnim praćenjem rezultata

Acceptance (DoD Faza 3)
- [ ] ≥ 20 mikro-tekstova; 4 tutorijala; ≥ 3 scenarija
- [ ] Quiz rezultati čuvani lokalno (LocalStorage)

### Faza 4 — Polish, balans i performanse (2–3 nedelje)
- [ ] UX poboljšanja (animacije, tranzicije; bez narušavanja performansi)
- [ ] Fino podešavanje balansa i scaling krivih (`balance.json`)
- [ ] Optimizacije rendera (throttling, memoizacija)
- [ ] Pristupačnost: kontrast, tastatura, ARIA
- [ ] Sistem dostignuća (min. 10) — UI + logika
- [ ] Smart upgrade preporuke (heuristike; AI posle MVP)

Acceptance (DoD Faza 4)
- [ ] Performance budžeti: TTI < 2.5s na mid-range telefonu; 60fps za osnovne animacije
- [ ] Dostignuća ≥ 10 i vidljiva u UI

### Faza 5 — Deploy i dokumentacija (1 nedelja)
- [ ] Verifikovati GitHub Pages build i javni URL
- [ ] Dodati link u `README.md`
- [ ] Ažurirati `DEVELOPMENTPLAN.md` statusima i eventualnim pivotima

Acceptance (DoD Faza 5)
- [ ] Pages produkcija i (opciono) staging zelen
- [ ] Release notes i changelog ažurirani

### CI i kvalitet (dopuna)
- [ ] GitHub Actions: lint/format, HTML validator
- [ ] Link-check (lychee) 
- [ ] Lighthouse CI (performance/a11y/SEO budžeti) na Pages pregledu

### Konfiguracija i i18n
- [x] Config-driven balans (`docs/config/*.json`)
- [x] Feature flags (`docs/config/features.json`)
- [x] i18n osnova (`docs/i18n/sr.json`)
- [ ] Validacija duplikata i i18n workflow (script TBA)

### Obeležavanje zadataka i proces
- Preporučene issue labele: `phase:1-core`, `phase:2-institutions`, `phase:3-education`, `a11y`, `balance`, `docs`, `deploy`.
- PR-ovi treba eksplicitno da navedu koje fajlove menjaju (npr. `docs/state/store.js`, `docs/main.js`, `docs/config/balance.json`).


