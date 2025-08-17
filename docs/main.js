import { createStore, loadGame, saveGame, resetGame, pushEvent } from './state/store.js';

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
  pushEvent(state, `Kupljen Parlament nivo ${next}`);
  store.setState(state);
  updateUI();
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
  const presidencyLevelEl = document.getElementById('presidency-level');
  if (presidencyLevelEl) presidencyLevelEl.textContent = s.institutions.presidency || 0;
  const courtsLevelEl = document.getElementById('courts-level');
  if (courtsLevelEl) courtsLevelEl.textContent = s.institutions.courts || 0;
  const cost = nextParliamentCost(s);
  el.parliamentCost.textContent = cost ? `Cena: ${format(cost)} DP` : 'Maksimalan nivo';
  el.btnBuyParliament.disabled = !cost || !canAffordDP(s, cost);
  const lawCount = document.getElementById('simple-law-count');
  if (lawCount) lawCount.textContent = (s.meta.simpleLaws || 0).toString();
  const lawDp = document.getElementById('simple-law-dp');
  if (lawDp) lawDp.textContent = (balanceConfig?.laws?.simple?.costDP ?? 10).toString();
  const lawCost = document.getElementById('simple-law-cost');
  if (lawCost) lawCost.textContent = `Cena: ${(balanceConfig?.laws?.simple?.costDP ?? 10)} DP`;

  // Executive UI
  const presCost = balanceConfig?.executive?.presidency?.levels?.[1]?.costDP ?? 25;
  const presCostEl = document.getElementById('presidency-cost');
  if (presCostEl) presCostEl.textContent = `Cena: ${presCost} DP`;
  const btnPres = document.getElementById('btn-buy-presidency');
  if (btnPres) btnPres.disabled = (s.institutions.presidency || 0) >= 1 || s.resources.dp < presCost;

  const minEduCost = balanceConfig?.executive?.ministries?.education?.costDP ?? 100;
  const minEduCostEl = document.getElementById('min-edu-cost');
  if (minEduCostEl) minEduCostEl.textContent = `Cena: ${minEduCost} DP`;
  const minEduStatus = document.getElementById('min-edu-status');
  if (minEduStatus) minEduStatus.textContent = s.policies?.ministries?.includes('education') ? 'osnovano (+20% DP)' : 'nije osnovano';
  const btnMinEdu = document.getElementById('btn-buy-min-education');
  if (btnMinEdu) btnMinEdu.disabled = s.policies?.ministries?.includes('education') || s.resources.dp < minEduCost;

  // Judicial UI
  const nextCourtLevel = (s.institutions.courts || 0) + 1;
  const courtCfg = balanceConfig?.judicial?.courts?.levels?.[nextCourtLevel];
  const courtCostEl = document.getElementById('courts-cost');
  if (courtCostEl) courtCostEl.textContent = courtCfg ? `Cena: ${courtCfg.costDP} DP` : 'Maksimalan nivo';
  const btnCourts = document.getElementById('btn-buy-courts');
  if (btnCourts) btnCourts.disabled = !courtCfg || s.resources.dp < courtCfg.costDP;

  // Rights buttons
  const rights = ['civil','human','social','economic','environmental'];
  rights.forEach(key => {
    const btn = document.getElementById(`btn-rights-${key}`);
    if (!btn) return;
    const cost = balanceConfig?.rights?.[key]?.costDP ?? 0;
    btn.textContent = `${btn.textContent.split(' (')[0]} (${cost} DP)`;
    const owned = Array.isArray(s.policies?.rights) && s.policies.rights.includes(key);
    btn.disabled = owned || s.resources.dp < cost;
  });

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

  // Render events feed
  const list = document.getElementById('events-list');
  if (list) {
    list.innerHTML = '';
    for (const evt of s.events) {
      const li = document.createElement('li');
      const time = new Date(evt.t);
      const spanTime = document.createElement('span');
      spanTime.className = 'time';
      spanTime.textContent = `[${time.toLocaleTimeString('sr-RS')}]`;
      const spanMsg = document.createElement('span');
      spanMsg.textContent = evt.m;
      li.appendChild(spanTime);
      li.appendChild(spanMsg);
      list.appendChild(li);
    }
  }
}

function tick(dtSeconds) {
  const s = store.getState();
  s.resources.pop += balanceConfig.baseRates.popPerSec * dtSeconds;
  const dpMult = 1 + (s.policies?.ministries?.includes('education') ? (balanceConfig?.executive?.ministries?.education?.effects?.dpMultiplier ?? 0) : 0);
  s.resources.dp += (balanceConfig.baseRates.dpPerPop * s.resources.pop * dpMult) * dtSeconds;
  s.resources.st += (balanceConfig.baseRates.stPerInstitution * (
    (s.institutions.parliament > 0 ? 1 : 0) + (s.institutions.presidency > 0 ? 1 : 0) + (s.institutions.courts > 0 ? 1 : 0)
  )) * dtSeconds;
  // Courts stPerSec bonus
  const courtLevel = s.institutions.courts || 0;
  if (courtLevel > 0) {
    const perSec = balanceConfig?.judicial?.courts?.levels?.[courtLevel]?.effects?.stPerSec ?? 0;
    s.resources.st += perSec * dtSeconds;
  }
  // Rights multipliers
  const rightsList = Array.isArray(s.policies?.rights) ? s.policies.rights : [];
  const rightsEffects = rightsList.map(k => balanceConfig?.rights?.[k]?.effects || {});
  const stMul = rightsEffects.reduce((acc,e)=> acc + (e.stMultiplier||0), 0);
  const prMul = rightsEffects.reduce((acc,e)=> acc + (e.prMultiplier||0), 0);
  s.resources.pr += (balanceConfig.baseRates.prPerPop * s.resources.pop * (1 + prMul)) * dtSeconds;
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
  if (loaded) { const s = store.getState(); pushEvent(s, 'Progres učitan'); store.setState(s); }

  el.btnBuyParliament.addEventListener('click', buyParliament);
  // Presidency
  const btnPres = document.getElementById('btn-buy-presidency');
  btnPres?.addEventListener('click', () => {
    const s = store.getState();
    const cost = balanceConfig?.executive?.presidency?.levels?.[1]?.costDP ?? 25;
    if (s.resources.dp < cost || (s.institutions.presidency||0) >= 1) return;
    s.resources.dp -= cost;
    s.institutions.presidency = 1;
    const stGain = balanceConfig?.executive?.presidency?.levels?.[1]?.effects?.st ?? 0;
    s.resources.st += stGain;
    pushEvent(s, 'Osnovano Predsedništvo (lvl 1)');
    store.setState(s);
    showFloatGain(`+${stGain} ST`, btnPres);
    updateUI();
  });

  // Ministry of Education
  const btnMinEdu = document.getElementById('btn-buy-min-education');
  btnMinEdu?.addEventListener('click', () => {
    const s = store.getState();
    const cost = balanceConfig?.executive?.ministries?.education?.costDP ?? 100;
    if (s.resources.dp < cost || s.policies?.ministries?.includes('education')) return;
    s.resources.dp -= cost;
    s.policies.ministries = Array.isArray(s.policies.ministries) ? s.policies.ministries : [];
    s.policies.ministries.push('education');
    pushEvent(s, 'Osnovano Ministarstvo obrazovanja (+20% DP)');
    store.setState(s);
    updateUI();
  });

  // Courts
  const btnCourts = document.getElementById('btn-buy-courts');
  btnCourts?.addEventListener('click', () => {
    const s = store.getState();
    const next = (s.institutions.courts || 0) + 1;
    const cfg = balanceConfig?.judicial?.courts?.levels?.[next];
    if (!cfg || s.resources.dp < cfg.costDP) return;
    s.resources.dp -= cfg.costDP;
    s.institutions.courts = next;
    s.resources.st += cfg.effects?.st ?? 0;
    pushEvent(s, `Unapređeni Sudovi (lvl ${next})`);
    store.setState(s);
    updateUI();
  });

  // Rights purchases
  const rights = ['civil','human','social','economic','environmental'];
  rights.forEach(key => {
    const btn = document.getElementById(`btn-rights-${key}`);
    btn?.addEventListener('click', () => {
      const s = store.getState();
      const cost = balanceConfig?.rights?.[key]?.costDP ?? 0;
      s.policies.rights = Array.isArray(s.policies.rights) ? s.policies.rights : [];
      if (s.resources.dp < cost || s.policies.rights.includes(key)) return;
      s.resources.dp -= cost;
      s.policies.rights.push(key);
      pushEvent(s, `Usvojena politika prava: ${key}`);
      store.setState(s);
      updateUI();
    });
  });
  const btnSimpleLaw = document.getElementById('btn-simple-law');
  btnSimpleLaw.addEventListener('click', () => {
    const s = store.getState();
    const cost = balanceConfig?.laws?.simple?.costDP ?? 10;
    if (s.resources.dp < cost) return;
    s.resources.dp -= cost;
    s.meta.simpleLaws = (s.meta.simpleLaws || 0) + 1;
    const stGain = balanceConfig?.laws?.simple?.effects?.st ?? 0;
    s.resources.st += stGain; // efekat iz konfiguracije
    pushEvent(s, 'Usvojen Simple Law');
    // Advance tutorial if on step 2
    if (!s.meta.tutorialDone && (s.meta.tutorialStep||0) === 2) {
      s.meta.tutorialStep = 3;
      s.meta.tutorialDone = true;
      tut.root.setAttribute('aria-hidden','true');
    }
    store.setState(s);
    // visual feedback
    showFloatGain(`+${stGain} ST`, document.getElementById('btn-simple-law'));
    updateUI();
  });
  const btnClearEvents = document.getElementById('btn-clear-events');
  btnClearEvents.addEventListener('click', () => { const s = store.getState(); s.events = []; store.setState(s); });
  el.btnSave.addEventListener('click', () => {
    const s = store.getState();
    pushEvent(s, 'Progres sačuvan');
    store.setState(s);
    saveGame(s);
    el.saveStatus.textContent = 'Sačuvano'; setTimeout(()=> el.saveStatus.textContent='', 1200);
  });
  el.btnReset.addEventListener('click', () => {
    resetGame(store);
    const s = store.getState();
    pushEvent(s, 'Reset stanja');
    store.setState(s);
    updateUI();
  });

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

// Small floating gain indicator
function showFloatGain(text, anchorEl){
  const rect = anchorEl.getBoundingClientRect();
  const div = document.createElement('div');
  div.className = 'float-gain';
  div.textContent = text;
  div.style.left = `${rect.left + rect.width/2}px`;
  div.style.top = `${rect.top}px`;
  document.body.appendChild(div);
  setTimeout(()=> div.remove(), 900);
}


