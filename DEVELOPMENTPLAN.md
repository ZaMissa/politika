## DEVELOPMENT PLAN — Nation Builder: Republic Edition

> Ovaj dokument služi kao jedinstveni izvor istine (SSOT) za planiranje, praćenje i ažuriranje razvoja. Redovno ga ažuriramo kroz faze i koristimo ga kao referencu u issue-ima, PR-ovima i sprintovima.

### Vizija i cilj
- Edukativna idle/progressive web igra o razvoju republike i objašnjavanju političkih pojmova kroz interaktivne mehanike.
- Fokus: jasno objašnjenje pojmova (institucije, procesi, prava) kroz igru, sa smislenim progresom i modernim UX-om.
- Target platforma: GitHub Pages (client-only, bez servera).

### Ne-ciljevi (za prvu verziju)
- Bez backend-a i naloga/ulogovanja.
- Bez PVP/multiplayer mehanika u MVP-u.
- Bez kompleksnih 3D grafika i teških asseta.

## Osnovni stubovi igre
- Idle loop sa jasnim povratnim informacijama.
- Edukativni mikro-tekstovi i interaktivni tutorijali.
- Stabilan sistem resursa, balansa i napredovanja.
- Događaji (izbori/krize/reforme) koji izazovno remete rutinu.

## Core mehanike (high-level)
- Građani proizvode resurse → resursi otključavaju institucije → institucije otključavaju nove mehanike → progres donosi nove ere i pojmove.
- Resursi: Democracy Points (DP), Stability (ST), Prosperity (PR), International Influence (II), Population (POP).

### Stope proizvodnje (po sekundi, početne vrednosti)
- POP: +1 POP/s (skalarisano po bonusima)
- DP: +0.1 × POP
- ST: +0.05 × broj aktivnih institucija + sudska grana bonusi
- PR: +0.1 × POP + ekonomski bonusi
- II: +0.01 × broj sporazuma/odnosa

## Institucije i sistemi

### Zakonodavna vlast (Legislative)
- Parliament nivoi (primer efekata i cena):
  - 1: Village Council — 10 DP → +5 POP
  - 2: City Assembly — 50 DP → +15 POP, +0.1 DP/s
  - 3: Regional Parliament — 200 DP → +50 POP, +0.2 DP/s
  - 4: National Assembly — 1000 DP → +200 POP, +0.5 DP/s
  - 5: Federal Parliament — 5000 DP → +1000 POP, +1.0 DP/s
- Zakonodavni procesi (akcije):
  - Simple Laws (10 DP), Constitutional Amendments (100 DP), International Treaties (500 DP), Emergency Decrees (50 DP, −10 ST)
- Političke partije (trajni modifikatori):
  - Centrist (+10% ST, +5% PR), Progressive (+15% PR, −5% ST), Conservative (+15% ST, −5% PR), Libertarian (+20% PR, −10% ST)

### Izvršna vlast (Executive)
- Presidency nivoi:
  - 1: Elected Mayor — 25 DP → +10 ST
  - 2: Regional Governor — 100 DP → +25 ST, +0.1 ST/s
  - 3: President — 500 DP → +100 ST, +0.3 ST/s
  - 4: Executive Council — 2500 DP → +500 ST, +0.8 ST/s
  - 5: Global Leader — 10000 DP → +2000 ST, +2.0 ST/s
- Ministarstva (permanentni departmani): Education (+20% DP), Economy (+20% PR), Foreign Affairs (+20% II), Internal Affairs (+20% ST), Defense (+50% ST, −10% PR), Culture (+15% DP, +15% PR)
- Administrativni sistemi: Centralized (+30% ST, −20% PR), Decentralized (+30% PR, −20% ST), Federal (+20% ST/PR/II), Confederal (+40% II, −30% ST)

### Sudska vlast (Judicial)
- Court nivoi:
  - 1: Local Court — 15 DP → +5 ST
  - 2: District Court — 75 DP → +20 ST, +0.1 ST/s
  - 3: Supreme Court — 300 DP → +75 ST, +0.2 ST/s
  - 4: Constitutional Court — 1500 DP → +300 ST, +0.5 ST/s
  - 5: International Court — 7500 DP → +1500 ST, +1.5 ST/s
- Pravni okviri (politikе prava): Civil (+25% ST, +15% DP), Human (+30% ST, +20% DP), Social (+20% ST, +25% PR), Economic (+15% ST, +30% PR), Environmental (+10% ST, +35% PR)

## Ere razvoja (progression)
- Arhaična Republika: start, fokus na stabilnost i osnovne zakone.
- Klasična Republika: partije, ministarstva, obrazovanje/ekonomija.
- Moderna Republika: međunarodni odnosi, napredne tehnologije i reforme.
- Globalna Republika: globalno upravljanje, univerzalna prava, održivost.

## Edukativni sadržaj
- Mikro-tekst uz svaki upgrade (pojam + jednostavno objašnjenje + primer iz prakse).
- Interaktivni tutorijali: Democracy 101, Lawmaking, Checks & Balances, Elections.
- Scenariji: Roman Republic, American Revolution, French Revolution, Modern Democracy.
- Quiz mod: kratki testovi razumevanja nakon značajnih otključavanja.

## Događaji i izazovi
- Periodični izbori (buffovi/penali po ishodu i izlaznosti).
- Ekonomijske/političke/socijalne krize sa izborom odgovora (trade-off).
- Međunarodni događaji: trgovinski sporazumi, UN sednice, sankcije.

## Dostignuća i prestiž
- Dostignuća (Achievements): sistemi nagrada za ključne akcije (npr. „Prvi predsednik”, „Ustavna reforma”, „Međunarodni sporazum”).
- Prestiž (Prestige): reset progresije uz trajne bonuse za ponovnu igru i brži napredak.

### Mapa dostignuća (primeri)
- Prvi zakon: donesi prvi Simple Law (+5% DP)
- Prvi izbori: održi izbore sa >50% izlaznosti (+5% ST)
- Trodelna vlast: otključa sve tri grane vlasti (+5% svih resursa)
- Ustavna reforma: usvoji Constitutional Amendment (+10% ST)
- Međunarodni sporazum: potpiši prvi International Treaty (+10% II)
- Obrazovna reforma: otvori Ministry of Education (+10% DP)
- Ekonomski bum: postigni ciljnu PR/s vrednost (+10% PR)
- Stabilna nacija: održi ST > 80 tokom 5 min (+5% ST)
- Globalni uticaj: dostigni ciljnu II vrednost (+10% II)
- Prvi prestiž: izvrši jedan prestige reset (+5% svih resursa)

## UX/UI smernice
- Jasna hijerarhija informacija (Resources HUD, Institutions panel, Events feed).
- Pristupačnost: kontrast, navigacija tastaturom, skaliranje fonta, ARIA oznake.
- Responsivnost: desktop full, tablet touch-friendly, mobile simplifikovan layout.
- Vizuelni stil: paleta boja (plava—demokratija, zelena—progres, crvena—stabilnost), čitljiv sans-serif font, konzistentna ikonografija, suptilne animacije i tranzicije.
 - Dizajn sistem: `styles/tokens.css` za boje, spacing, tipografiju; bazne komponente (panel, kartica, dugme, indikator resursa).
 - Onboarding cilj: igrač do prve kupovine i prvog zakona u 3–4 minute.

## Tehnologije i arhitektura
- Stack: HTML5, CSS3, JavaScript (ES6+) bez framework-a za MVP; opcionalno kasnije prelazak na React/Vite.
- Arhitektura: modularni JS moduli, centralizovano stanje, event bus, autosave (LocalStorage), mogućnost PWA kasnije.

### Performanse
- requestAnimationFrame game loop; throttling UI osvežavanja i batch renderi.
- Memoizacija kalkulacija; object pooling za učestale entitete.
- Lazy loading ne-kritičnih modula; opcioni PWA za offline cache.
 - Performance budžeti (MVP): TTI < 2.5s na mid-range telefonu, inicijalni bundle < 150KB gzip, 60fps za jednostavne animacije.

### Predlog strukture repozitorijuma (neobavezno, za kasnije)
- `src/index.html` — ulazna tačka (GitHub Pages servisira ovaj fajl)
- `src/styles.css` — stilovi
- `src/main.js` — bootstrap i game loop
- `src/state/store.js` — centralni state i persistence
- `src/modules/` — mehanike (resources, institutions, events, tutorial, ui)
- `assets/` — ikonice, ilustracije (optimizovano)
- `docs/` — dokumentacija (ovaj plan može ostati u korenu ili u `docs/`)

### Konfiguracija i održavanje
- Config-driven balans: `config/balance.json`, `config/eras.json` za vrednosti (cene, multiplikatori, pragovi).
- Feature flags: `config/features.json` za eksperimentalne module (achievements, smart-upgrades).
- i18n workflow: `i18n/sr.json` sa ključevima, validacija duplikata; content-only PR-ovi bez menjanja koda.
- Save verzionisanje i migracije: `save.version` + migraciona funkcija pri učitavanju starog sejva.

## Model stanja (skica)
```json
{
  "resources": {"dp": 0, "st": 0, "pr": 0, "ii": 0, "pop": 0},
  "institutions": {"parliament": 0, "presidency": 0, "courts": 0},
  "policies": {"parties": [], "rights": [], "ministries": []},
  "adminSystem": "centralized",
  "era": "archaic",
  "unlocked": {"tutorials": [], "scenarios": []},
  "settings": {"language": "sr", "a11y": {"contrast": false, "fontScale": 1.0}}
}
```

## Balans i progresija
- Rani gejm: brza progresija, česta otključavanja i tutorijali.
- Srednji gejm: strateški izbori, diverzifikacija bonusa.
- Kasni gejm: sporiji rast, optimizacija i prestiž (reset sa trajnim bonusima).

## Metrike i analitika (client-only, anonimizovano)
- Engagement: session length, povratak, završetak tutorijala.
- Edukativno: pre/post mini-quiz skorovi (lokalno, bez slanja).
- Znanje i zadržavanje: kratki testovi kasnije u sesiji radi merenja retencije.
- Kritičko mišljenje: scenariji sa višestrukim ishodima i kvalitativnim izborima.
- Građanski angažman: interesovanje za dodatne edukativne sadržaje u igri.

## Testiranje
- Jedinični testovi: čista logika resursa, skaliranja cena i efekata (bez DOM-a).
- Store testovi: inicijalizacija, save/load, migracije verzija.
- E2E smoke (opciono): osnovni tok (početak → prva kupovina → save/load) na Pages preview-u.
- A11y testovi: fokus, kontrast (Lighthouse/axe), tastatura.

## Internacionalizacija
- Primarni jezik: sr (lat/ćir opcionalno kasnije).
- Svi edukativni tekstovi idu kroz i18n mapu radi lakše lokalizacije.

## Privatnost i bezbednost
- Bez prikupljanja ličnih podataka; save lokalno (LocalStorage).
- Opcioni export/import save fajla (JSON) od strane igrača.

## Deploy (GitHub Pages)
- Staticki sajt: dovoljno je imati `index.html` na granama `main` ili `docs/` folder kao Pages source.
- Preporuka: `Settings → Pages → Source: Deploy from a branch` i odabrati `main /(root)` ili `main /docs`.
- SEO: minimalni `meta` tagovi i manifest (ako PWA kasnije).

## Release i verzionisanje
- Semver (0.x tokom MVP): nedeljni minor izdanja, hotfix po potrebi.
- Staging okruženje: `docs/` ili posebna grana za pregled pre produkcije.
- Release notes: kratki changelog u `DEVELOPMENTPLAN.md` i GitHub Releases.

---

## Roadmap i taskliste (ne označavati kao završeno dok nije zaista gotovo)

### Faza 1 — Core mehanika (2–3 nedelje)
- [ ] Kreirati skeleton projekta: `src/index.html`, `src/styles.css`, `src/main.js`
- [ ] Implementirati game loop (raf) i tick sistem u `src/main.js`
- [ ] Centralni store sa autosave u `src/state/store.js` (LocalStorage)
- [ ] Sistem resursa i proizvodnje (POP, DP, ST, PR, II)
- [ ] Minimalni HUD (prikaz resursa) i osnovne akcije (kupovina lvl 1 institucija)
- [ ] Basic balans (početne stope, cene, scaling)
- [ ] Osnovni tutorijal „Democracy 101”

### Faza 2 — Institucije i upgrade stabla (3–4 nedelje)
- [ ] Zakonodavna grana (nivoisanje parlamenta + procesi zakonodavstva)
- [ ] Izvršna grana (predsedništvo + ministarstva + administrativni sistemi)
- [ ] Sudska grana (sudovi + pravni okviri)
- [ ] UI paneli: `InstitutionsView`, `PoliciesView`
- [ ] Bulk/auto upgrade opcije (QoL)

### Faza 3 — Edukativni sadržaji i scenariji (2–3 nedelje)
- [ ] Mikro-tekstovi za sve otključane pojmove (i18n mapa u `src/i18n/sr.js`)
- [ ] Interaktivni tutorijali (4 glavne teme)
- [ ] Istorijski scenariji (min. 3) sa specifičnim modifikatorima
- [ ] Quiz sistem sa lokalnim praćenjem rezultata

### Faza 4 — Polish, balans i performanse (2–3 nedelje)
- [ ] UX poboljšanja, animacije i tranzicije
- [ ] Fino podešavanje balansa i scaling krivih
- [ ] Optimizacije rendera i memoizacija kalkulacija
- [ ] Pristupačnost: kontrast, tastatura, font scale
- [ ] Sistem dostignuća (UI + logika, min. 10 achievements)
- [ ] Smart upgrade preporuke (heuristike; AI preporuke u kasnijoj fazi)

### Faza 5 — Deploy i dokumentacija (1 nedelja)
- [ ] GitHub Pages setap i verifikacija rada
- [ ] README s uputstvom i linkom na produkciju
- [ ] Ažuriranje `DEVELOPMENTPLAN.md` sa realnim statusima

---

## Milestones i kriterijumi prihvatanja

### Milestone M1 — MVP loop
- Kriterijumi:
  - [ ] Idle proizvodnja 3 osnovna resursa i kupovina prve institucije
  - [ ] Save/load radi pouzdano (osim inkognito)
  - [ ] Tutorijal za početak

### Milestone M2 — Tri grane vlasti
- Kriterijumi:
  - [ ] Sva tri panela funkcionalna (kupovina i efekti)
  - [ ] Bar 1 politika iz svake kategorije (partije/ministries/rights)
  - [ ] Balans bez „mekih“ deadlock-ova

### Milestone M3 — Edukativni paket
- Kriterijumi:
  - [ ] 20+ mikro-tekstova pojmova
  - [ ] 4 tutorijala + 3 scenarija
  - [ ] Quiz i lokalno praćenje

### Milestone M4 — Release na GitHub Pages
- Kriterijumi:
  - [ ] Stabilna build verzija na Pages
  - [ ] README sa korisničkim uputstvom
  - [ ] Osnovni SEO meta tagovi
  - [ ] Lighthouse pragovi zadovoljeni (performance/a11y/SEO)

## Definition of Done (po fazama)
- Faza 1 (Core):
  - [ ] Jedinični testovi za resurse i cene
  - [ ] Autosave i load pouzdani
  - [ ] Lighthouse: a11y ≥ 90, performance ≥ 80 (desktop)
  - [ ] Dokumentacija ažurirana (README + ovaj dokument)
- Faza 2 (Institucije):
  - [ ] Sva tri panela funkcionalna + osnovni balans
  - [ ] i18n ključevi za nove pojmove
  - [ ] A11y tastatura/fokus pokriveni
- Faza 3 (Edukacija):
  - [ ] 20+ mikro-tekstova, 4 tutorijala, 3 scenarija
  - [ ] Quiz rezultati čuvani lokalno
- Faza 4 (Polish/Perf):
  - [ ] Performance budžeti ispunjeni
  - [ ] Dostignuća min. 10, smart-upgrade heuristike
- Faza 5 (Deploy):
  - [ ] Pages produkcija i staging zelen
  - [ ] Release notes i changelog ažurirani

---

## Rizici i mitigacije
- Prevelika kompleksnost balansa → inkrementalno uvoditi sisteme, A/B podešavanje parametara.
- Obim edukativnih tekstova → batchevi po erama; pregled i konsistentnost termina.
- Performanse na mobilnim uređajima → minimalni DOM, throttling UI update-a, jednostavne animacije.
 - Scope creep → MoSCoW prioritizacija, zaključavanje scope-a po fazi.
 - Nedovoljna a11y pokrivenost → obavezni a11y acceptance kriterijumi u DoD.

## Obeležavanje zadataka i proces
- Issue labeli: `phase:1-core`, `phase:2-institutions`, `phase:3-education`, `a11y`, `balance`, `docs`, `deploy`.
- PR template treba da referencira relevantne sekcije ovog dokumenta i konkretne fajlove (npr. „Menja `src/state/store.js` i `src/modules/resources.js`”).
 - Branching: GitHub Flow (feature grana → PR → review → merge u `main`).
 - Konvencije commit-a: Conventional Commits (feat, fix, chore, docs, refactor, perf, test).
 - GitHub Projects tabla: `Backlog → In Progress → Review → Done`, automatsko povezivanje sa issue-ima.

## Kontinuirana integracija (CI)
- GitHub Actions pipeline:
  - Lint/format (ESLint/Prettier) i HTML validator.
  - Build/preview (ako uvedemo bundler) i link-check (lychee).
  - Lighthouse CI (performance, a11y, SEO budžeti) na Pages preview-u.

## Buduća proširenja
- Multiplayer kooperacija ili asinhrona saradnja nacija.
- Modding podrška (konfigurabilni parametri, korisnički scenariji).
- Mobilna aplikacija (kasnije), deljeni kod i PWA kao prelazno rešenje.
- VR/AR varijante za demonstracije u učionicama.

## Inovativne funkcije
- Real-Time Democracy: live izbori unutar zajednice igrača (za buduće online izdanje), policy debates, community votes, crowdsourced laws.
- AI Integracija: smart preporuke za upgrade-ove, dinamički događaji, personalizovano učenje, prediktivna analitika za balans (sve kao post-MVP ciljevi).

## Ažuriranja dokumenta
- Ovaj dokument se ažurira pri svakom većem pomaku ili promeni opsega.
- Sažetak promena beležiti ispod.

### Changelog (sažetak promena)
- v0.2 — Dodate sekcije: Dostignuća i prestiž, Performanse, Buduća proširenja, Inovativne funkcije; proširene metrike i UX smernice.
- v0.1 — Inicijalni plan i roadmap.

---

## Dodatak A — Glossary (primeri definicija)
- Demokratija: sistem vlasti gde građani učestvuju u donošenju odluka, direktno ili preko predstavnika.
- Republika: država bez monarha, sa izabranim predstavnicima i ograničenom vlašću.
- Podela vlasti (Separation of Powers): razdvajanje na zakonodavnu, izvršnu i sudsku granu radi kontrole i balansa.
- Referendum: direktno izjašnjavanje građana o konkretnom pitanju.
- Impeachment: proces razrešenja visokog zvaničnika zbog teških povreda zakona ili dužnosti.


