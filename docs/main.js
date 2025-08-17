import { createStore, loadGame, saveGame, resetGame } from './state/store.js';

let balanceConfig = {
  tickSeconds: 1,
  baseRates: { popPerSec: 1, dpPerPop: 0.1, stPerInstitution: 0.05, prPerPop: 0.1, iiPerAgreement: 0.01 },
  institutions: {
    parliament: {
      levels: {
        1: { costDP: 10, effects: { pop: 5, dpPerSecFlat: 0 } },
        2: { costDP: 50, effects: { pop: 15, dpPerSecFlat: 0.1 } }
      }
    }
  }
};

let i18n = {
  title: 'Nation Builder: Republic Edition',
  resources: { dp: 'DP', st: 'ST', pr: 'PR', ii: 'II', pop: 'POP' },
  actions: { buyParliament: 'Kupi Parlament (sledeći nivo)', save: 'Sačuvaj', reset: 'Reset' }
};

async function tryLoadConfig() {
  try {
    const [balanceRes, i18nRes] = await Promise.all([
      fetch('./config/balance.json'),
      fetch('./i18n/sr.json')
    ]);
    if (balanceRes.ok) balanceConfig = await balanceRes.json();
    if (i18nRes.ok) i18n = await i18nRes.json();
  } catch (err) {
    console.warn('Config load failed, using defaults', err);
  }
}

const store = createStore();

const el = {
  title: document.getElementById('title'),
  dp: document.getElementById('dp'),
  st: document.getElementById('st'),
  pr: document.getElementById('pr'),
  ii: document.getElementById('ii'),
  pop: document.getElementById('pop'),
  parliamentLevel: document.getElementById('parliament-level'),
  parliamentCost: document.getElementById('parliament-cost'),
  btnBuyParliament: document.getElementById('btn-buy-parliament'),
  btnSave: document.getElementById('btn-save'),
  btnReset: document.getElementById('btn-reset'),
  saveStatus: document.getElementById('save-status')
};

// Tutorial elements
const tut = {
  root: document.getElementById('tutorial'),
  text: document.getElementById('tutorial-text'),
  next: document.getElementById('tutorial-next'),
  close: document.getElementById('tutorial-close')
};

function format(num) { return Math.floor(num).toLocaleString('sr-RS'); }

function nextParliamentCost(state) {
  const next = (state.institutions.parliament || 0) + 1;
  const cfg = balanceConfig?.institutions?.parliament?.levels?.[next];
  return cfg ? cfg.costDP : null;
}

function applyParliamentEffects(levelCfg, state) {
  const effects = levelCfg?.effects || {};
  if (effects.pop) state.resources.pop += effects.pop;
}

function canAffordDP(state, cost) { return state.resources.dp >= cost; }

function buyParliament() {
  const state = store.getState();
  const next = (state.institutions.parliament || 0) + 1;
  const levelCfg = balanceConfig?.institutions?.parliament?.levels?.[next];
  if (!levelCfg) return;
  const cost = levelCfg.costDP;
  if (!canAffordDP(state, cost)) return;
  state.resources.dp -= cost;
  state.institutions.parliament = next;
  applyParliamentEffects(levelCfg, state);
  store.setState(state);
}

function updateUI() {
  const s = store.getState();
  el.title.textContent = i18n.title;
  el.dp.textContent = format(s.resources.dp);
  el.st.textContent = format(s.resources.st);
  el.pr.textContent = format(s.resources.pr);
  el.ii.textContent = format(s.resources.ii);
  el.pop.textContent = format(s.resources.pop);
  el.parliamentLevel.textContent = s.institutions.parliament;
  const cost = nextParliamentCost(s);
  el.parliamentCost.textContent = cost ? `Cena: ${format(cost)} DP` : 'Maksimalan nivo';
  el.btnBuyParliament.disabled = !cost || !canAffordDP(s, cost);

  // Simple Law button state and tutorial highlight
  const btnSimpleLaw = document.getElementById('btn-simple-law');
  const canBuyLaw = s.resources.dp >= 10;
  btnSimpleLaw.disabled = !canBuyLaw;
  const step = s.meta.tutorialStep || 0;
  if (!s.meta.tutorialDone && step === 2) {
    btnSimpleLaw.classList.add('highlight');
    tut.root.setAttribute('aria-hidden','true'); // do not block interaction when action is expected
  } else {
    btnSimpleLaw.classList.remove('highlight');
  }
}

function tick(dtSeconds) {
  const s = store.getState();
  s.resources.pop += balanceConfig.baseRates.popPerSec * dtSeconds;
  s.resources.dp += (balanceConfig.baseRates.dpPerPop * s.resources.pop) * dtSeconds;
  s.resources.st += (balanceConfig.baseRates.stPerInstitution * (
    (s.institutions.parliament > 0 ? 1 : 0) + (s.institutions.presidency > 0 ? 1 : 0) + (s.institutions.courts > 0 ? 1 : 0)
  )) * dtSeconds;
  s.resources.pr += (balanceConfig.baseRates.prPerPop * s.resources.pop) * dtSeconds;
  store.setState(s);
}

let last = 0; let acc = 0; let saveAcc = 0; const TICK = 1/60;
function loop(t) {
  if (!last) last = t;
  let dt = (t - last) / 1000;
  last = t;
  acc += dt;
  while (acc >= TICK) {
    tick(TICK);
    acc -= TICK;
    saveAcc += TICK;
  }
  if (saveAcc >= 5) {
    saveGame(store.getState());
    el.saveStatus.textContent = 'Sačuvano';
    setTimeout(() => { el.saveStatus.textContent = ''; }, 1200);
    saveAcc = 0;
  }
  updateUI();
  requestAnimationFrame(loop);
}

async function init() {
  await tryLoadConfig();
  document.getElementById('label-dp').textContent = i18n.resources.dp;
  document.getElementById('label-st').textContent = i18n.resources.st;
  document.getElementById('label-pr').textContent = i18n.resources.pr;
  document.getElementById('label-ii').textContent = i18n.resources.ii;
  document.getElementById('label-pop').textContent = i18n.resources.pop;
  document.getElementById('btn-buy-parliament').textContent = i18n.actions.buyParliament;
  document.getElementById('btn-save').textContent = i18n.actions.save;
  document.getElementById('btn-reset').textContent = i18n.actions.reset;

  const loaded = loadGame();
  if (loaded) store.setState(loaded);

  el.btnBuyParliament.addEventListener('click', buyParliament);
  const btnSimpleLaw = document.getElementById('btn-simple-law');
  btnSimpleLaw.addEventListener('click', () => {
    const s = store.getState();
    const cost = 10;
    if (s.resources.dp < cost) return;
    s.resources.dp -= cost;
    s.meta.simpleLaws = (s.meta.simpleLaws || 0) + 1;
    // Advance tutorial if on step 2
    if (!s.meta.tutorialDone && (s.meta.tutorialStep||0) === 2) {
      s.meta.tutorialStep = 3;
      s.meta.tutorialDone = true;
      tut.root.setAttribute('aria-hidden','true');
    }
    store.setState(s);
  });
  el.btnSave.addEventListener('click', () => { saveGame(store.getState()); el.saveStatus.textContent = 'Sačuvano'; setTimeout(()=> el.saveStatus.textContent='', 1200); });
  el.btnReset.addEventListener('click', () => { resetGame(store); updateUI(); });

  // Tutorial onboarding
  initTutorial();

  updateUI();
  requestAnimationFrame(loop);
}

function initTutorial(){
  const s = store.getState();
  if (s.meta.tutorialDone) return;
  s.meta.tutorialStep = s.meta.tutorialStep || 0;
  store.setState(s);
  renderTutorial();
  tut.next.addEventListener('click', () => {
    const st = store.getState();
    st.meta.tutorialStep++;
    if (st.meta.tutorialStep > 2){ st.meta.tutorialDone = true; tut.root.setAttribute('aria-hidden','true'); }
    store.setState(st);
    renderTutorial();
  });
  tut.close.addEventListener('click', () => { tut.root.setAttribute('aria-hidden','true'); const st = store.getState(); st.meta.tutorialDone = true; store.setState(st); });
}

function renderTutorial(){
  const s = store.getState();
  if (s.meta.tutorialDone){ tut.root.setAttribute('aria-hidden','true'); return; }
  tut.root.setAttribute('aria-hidden','false');
  const step = s.meta.tutorialStep || 0;
  if (step === 0){
    tut.text.textContent = 'Dobrodošli! Ovo je HUD. Resursi se pasivno povećavaju.';
  } else if (step === 1){
    tut.text.textContent = 'Kupite Parlament da otključate dodatne efekte.';
  } else if (step === 2){
    tut.text.textContent = 'Donesite Simple Law (10 DP) za prvi zakonodavni čin.';
  }
}

init();


