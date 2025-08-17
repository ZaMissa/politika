## Nation Builder: Republic Edition

Edukativna idle/progressive igra o razvoju republike i političkim pojmovima. Radi 100% u pregledaču i spremna je za GitHub Pages (bez backend-a).

### Demo (GitHub Pages)
- Nakon podešavanja u repo `Settings → Pages` (vidi dole), ovde uneti javni URL.

### Struktura
```
docs/
  index.html
  styles.css
  main.js
  state/
    store.js
  config/
    balance.json
    eras.json
    features.json
  i18n/
    sr.json
DEVELOPMENTPLAN.md
README.md
```

### Lokalno pokretanje
Fetch se oslanja na relativne JSON fajlove, pa treba jednostavan statički server (file:// neće raditi).

Opcija 1 (Node):
```
npx serve docs
```

Opcija 2 (Python 3):
```
cd docs
python -m http.server 8080
```
Otvorite http://localhost:8080 ili adresu koju server prijavi.

### GitHub Pages deploy
1) Commit i push koda na branch `main`.
2) Repo Settings → Pages → Source: "Deploy from a branch" → `main` i folder `docs/`.
3) Sačuvati podešavanje, sačekati build, i otvoriti javni URL koji GitHub prikaže.

### Kontrole u igri (MVP)
- HUD prikazuje DP/ST/PR/II/POP.
- Dugme "Kupi Parlament" kupuje sledeći nivo (ako ima DP).
- Autosave radi na ~5s; ručni "Sačuvaj" i "Reset" su uključeni.

### Razvoj i doprinosi
- Branching: GitHub Flow (feature grana → PR → review → merge u `main`).
- Commit format: Conventional Commits (feat, fix, docs, chore, refactor, perf, test).
- Pogledati `DEVELOPMENTPLAN.md` za roadmap, DoD, CI predloge, i balans parametre.

### Licenca
Dodati licencu po potrebi (MIT preporuka za open-source).


