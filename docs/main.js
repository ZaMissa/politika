import { createStore, loadGame, saveGame, resetGame, pushEvent } from './state/store.js';

let balanceConfig = {
  tickSeconds: 1,
  baseRates: { popPerSec: 1, dpPerPop: 0.12, stPerInstitution: 0.05, prPerPop: 0.11, iiPerAgreement: 0.01 },
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

function bulkBuyInstitution(kind, count){
  const s = store.getState();
  let bought = 0;
  while (bought < count) {
    let next, cfg;
    if (kind === 'parliament'){
      next = (s.institutions.parliament||0) + 1;
      cfg = balanceConfig?.institutions?.parliament?.levels?.[next];
      if (!cfg) break;
      if (s.resources.dp < cfg.costDP) break;
      s.resources.dp -= cfg.costDP;
      s.institutions.parliament = next;
      applyParliamentEffects(cfg, s);
    } else if (kind === 'courts'){
      next = (s.institutions.courts||0) + 1;
      cfg = balanceConfig?.judicial?.courts?.levels?.[next];
      if (!cfg) break;
      if (s.resources.dp < cfg.costDP) break;
      s.resources.dp -= cfg.costDP;
      s.institutions.courts = next;
      s.resources.st += cfg.effects?.st ?? 0;
    } else {
      break;
    }
    bought++;
  }
  if (bought > 0){ pushEvent(s, `Bulk kupovina (${kind}): ${bought}`); store.setState(s); updateUI(); }
}

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
  // per-second rates (approx based on current multipliers)
  const dpPs = (balanceConfig.baseRates.dpPerPop * s.resources.pop * (1 + (s.policies?.ministries?.includes('education') ? (balanceConfig?.executive?.ministries?.education?.effects?.dpMultiplier ?? 0) : 0) + ((s.meta.constAmend||0) > 0 ? (balanceConfig?.laws?.constitutionalAmendment?.effects?.dpMultiplier ?? 0) : 0) + (s.elections?.active && s.elections.buff==='high' ? (balanceConfig?.events?.elections?.effects?.high?.dpMultiplier ?? 0) : 0)));
  const stPs = (balanceConfig.baseRates.stPerInstitution * ((s.institutions.parliament>0?1:0)+(s.institutions.presidency>0?1:0)+(s.institutions.courts>0?1:0))) + (balanceConfig?.judicial?.courts?.levels?.[s.institutions.courts || 0]?.effects?.stPerSec ?? 0);
  const prPs = (balanceConfig.baseRates.prPerPop * s.resources.pop * (1 + ((s.policies?.rights||[]).reduce((acc,k)=> acc + ((balanceConfig?.rights?.[k]?.effects?.prMultiplier)||0),0))));
  const iiPs = ((s.meta.intlTreaties||0) * (balanceConfig?.laws?.internationalTreaty?.effects?.iiPerSec ?? 0));
  const popPs = balanceConfig.baseRates.popPerSec;
  document.getElementById('dp-ps').textContent = `(+${dpPs.toFixed(2)}/s)`;
  document.getElementById('st-ps').textContent = `(+${stPs.toFixed(2)}/s)`;
  document.getElementById('pr-ps').textContent = `(+${prPs.toFixed(2)}/s)`;
  document.getElementById('ii-ps').textContent = `(+${iiPs.toFixed(2)}/s)`;
  document.getElementById('pop-ps').textContent = `(+${popPs.toFixed(2)}/s)`;
  el.parliamentLevel.textContent = s.institutions.parliament;
  const presidencyLevelEl = document.getElementById('presidency-level');
  if (presidencyLevelEl) presidencyLevelEl.textContent = s.institutions.presidency || 0;
  const courtsLevelEl = document.getElementById('courts-level');
  if (courtsLevelEl) courtsLevelEl.textContent = s.institutions.courts || 0;
  const electionCountdown = document.getElementById('election-countdown');
  const electionStatus = document.getElementById('election-status');
  if (electionCountdown) electionCountdown.textContent = `${Math.max(0, Math.ceil(s.elections?.active ? s.elections.timeLeft : s.elections?.nextIn || 0))}s`;
  if (electionStatus) electionStatus.textContent = s.elections?.active ? (s.elections.buff === 'high' ? 'visoka izlaznost' : 'niska izlaznost') : 'van ciklusa';

  // Tooltips
  const tooltips = [
    ['btn-buy-parliament','parliament'], ['btn-buy-presidency','presidency'], ['btn-buy-courts','courts'],
    ['btn-simple-law','simple_law'], ['btn-const-amend','constitutional_amendment'], ['btn-intl-treaty','international_treaty']
  ];
  tooltips.forEach(([id,key]) => { const elx = document.getElementById(id); if (elx && i18n?.concepts?.[key]) elx.title = i18n.concepts[key]; });
  const cost = nextParliamentCost(s);
  el.parliamentCost.textContent = cost ? `Cena: ${format(cost)} DP` : 'Maksimalan nivo';
  el.btnBuyParliament.disabled = !cost || !canAffordDP(s, cost);
  const lawCount = document.getElementById('simple-law-count');
  if (lawCount) lawCount.textContent = (s.meta.simpleLaws || 0).toString();
  const lawDp = document.getElementById('simple-law-dp');
  if (lawDp) lawDp.textContent = (balanceConfig?.laws?.simple?.costDP ?? 10).toString();
  const lawCost = document.getElementById('simple-law-cost');
  if (lawCost) lawCost.textContent = `Cena: ${(balanceConfig?.laws?.simple?.costDP ?? 10)} DP`;
  const caCost = balanceConfig?.laws?.constitutionalAmendment?.costDP ?? 100;
  const itCost = balanceConfig?.laws?.internationalTreaty?.costDP ?? 500;
  const caCostEl = document.getElementById('const-amend-cost');
  const itCostEl = document.getElementById('intl-treaty-cost');
  if (caCostEl) caCostEl.textContent = `(Cena: ${caCost} DP)`;
  if (itCostEl) itCostEl.textContent = `(Cena: ${itCost} DP)`;
  const btnCA = document.getElementById('btn-const-amend');
  const btnIT = document.getElementById('btn-intl-treaty');
  if (btnCA) btnCA.disabled = (store.getState().meta.constAmend || 0) >= 1 || store.getState().resources.dp < caCost;
  if (btnIT) btnIT.disabled = false && store.getState().resources.dp < itCost;

  // Executive UI
  const presCostExec = balanceConfig?.executive?.presidency?.levels?.[1]?.costDP ?? 25;
  const presCostEl = document.getElementById('presidency-cost');
  if (presCostEl) presCostEl.textContent = `Cena: ${presCostExec} DP`;
  const btnPres = document.getElementById('btn-buy-presidency');
  if (btnPres) btnPres.disabled = (s.institutions.presidency || 0) >= 1 || s.resources.dp < presCostExec;

  const minEduCostExec = balanceConfig?.executive?.ministries?.education?.costDP ?? 100;
  const minEduCostEl = document.getElementById('min-edu-cost');
  if (minEduCostEl) minEduCostEl.textContent = `Cena: ${minEduCostExec} DP`;
  const minEduStatus = document.getElementById('min-edu-status');
  if (minEduStatus) minEduStatus.textContent = s.policies?.ministries?.includes('education') ? 'osnovano (+20% DP)' : 'nije osnovano';
  const btnMinEdu = document.getElementById('btn-buy-min-education');
  if (btnMinEdu) btnMinEdu.disabled = s.policies?.ministries?.includes('education') || s.resources.dp < minEduCostExec;

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

  // Render concepts
  const clist = document.getElementById('concepts-list');
  if (clist) {
    clist.innerHTML = '';
    const unlocked = getUnlockedConcepts(s);
    unlocked.forEach(key => {
      const li = document.createElement('li');
      li.textContent = (i18n?.concepts?.[key]) || key;
      clist.appendChild(li);
    });
  }

  // Render overview
  const instList = document.getElementById('inst-list');
  if (instList) {
    instList.innerHTML='';
    const items = [
      ['Parlament', s.institutions.parliament],
      ['Predsedništvo', s.institutions.presidency],
      ['Sudovi', s.institutions.courts]
    ];
    items.forEach(([name, lvl]) => { const li = document.createElement('li'); li.textContent = `${name}: lvl ${lvl||0}`; instList.appendChild(li); });
  }
  const polList = document.getElementById('policies-list');
  if (polList){
    polList.innerHTML='';
    const rights = (s.policies?.rights||[]).map(r=>r).join(', ');
    const ministries = (s.policies?.ministries||[]).map(m=>m).join(', ');
    const ul = polList;
    const li1 = document.createElement('li'); li1.textContent = `Prava: ${rights || '—'}`; ul.appendChild(li1);
    const li2 = document.createElement('li'); li2.textContent = `Ministarstva: ${ministries || '—'}`; ul.appendChild(li2);
  }
  // Overview shortcuts
  const shortcuts = [
    ['inst-list','Parlament','panel-legislative'],
    ['inst-list','Predsedništvo','panel-executive'],
    ['inst-list','Sudovi','panel-judicial']
  ];
  // Convert items to anchors for quick jump
  const instUl = document.getElementById('inst-list');
  if (instUl){
    [...instUl.children].forEach(li => {
      const t = li.textContent || '';
      const map = { 'Parlament': 'panel-legislative', 'Predsedništvo': 'panel-executive', 'Sudovi': 'panel-judicial' };
      const key = Object.keys(map).find(k => t.startsWith(k));
      if (key){
        const a = document.createElement('a'); a.href = `#${map[key]}`; a.textContent = t; a.style.color = 'inherit'; a.style.textDecoration = 'underline';
        li.textContent = '';
        li.appendChild(a);
      }
    });
  }

  // Control hub state (disable when not affordable/already owned)
  const s2 = s;
  const presCostHub = balanceConfig?.executive?.presidency?.levels?.[1]?.costDP ?? 25;
  const minEduCostHub = balanceConfig?.executive?.ministries?.education?.costDP ?? 100;
  const parlNext = (s2.institutions.parliament||0)+1; const parlCfg = balanceConfig?.institutions?.parliament?.levels?.[parlNext];
  const courtNext = (s2.institutions.courts||0)+1; const courtCfg = balanceConfig?.judicial?.courts?.levels?.[courtNext];
  const setD = (id,dis)=>{ const b=document.getElementById(id); if(b) b.disabled=!!dis; };
  setD('hub-parl-1', !parlCfg || s2.resources.dp < (parlCfg?.costDP||Infinity));
  setD('hub-parl-10', !parlCfg || s2.resources.dp < (parlCfg?.costDP||Infinity));
  setD('hub-parl-max', !parlCfg || s2.resources.dp < (parlCfg?.costDP||Infinity));
  setD('hub-pres-1', (s2.institutions.presidency||0) >= 1 || s2.resources.dp < presCostHub);
  setD('hub-court-1', !courtCfg || s2.resources.dp < (courtCfg?.costDP||Infinity));
  setD('hub-court-10', !courtCfg || s2.resources.dp < (courtCfg?.costDP||Infinity));
  setD('hub-court-max', !courtCfg || s2.resources.dp < (courtCfg?.costDP||Infinity));
  setD('hub-min-edu', (s2.policies?.ministries||[]).includes('education') || s2.resources.dp < minEduCostHub);
  const rkeys=['civil','human','social','economic','environmental'];
  rkeys.forEach(k=>{ const cost=balanceConfig?.rights?.[k]?.costDP??0; setD(`hub-rights-${k}`, (s2.policies?.rights||[]).includes(k) || s2.resources.dp < cost); });
  const caCost = balanceConfig?.laws?.constitutionalAmendment?.costDP ?? 100;
  const itCost = balanceConfig?.laws?.internationalTreaty?.costDP ?? 500;
  setD('hub-law-simple', s2.resources.dp < (balanceConfig?.laws?.simple?.costDP ?? 10));
  setD('hub-law-const', (s2.meta.constAmend||0)>=1 || s2.resources.dp < caCost);
  setD('hub-law-treaty', s2.resources.dp < itCost);

  // Titles/tooltips and aria-disabled mirroring
  const setTitle = (id, text) => { const b=document.getElementById(id); if(b) b.title=text; };
  const mirrorAriaDisabled = (id) => { const b=document.getElementById(id); if (b) b.setAttribute('aria-disabled', b.disabled ? 'true':'false'); };
  ['hub-parl-1','hub-parl-10','hub-parl-max'].forEach(id=>{ if (parlCfg) setTitle(id, `Parlament: sledeći nivo košta ${parlCfg.costDP} DP`); mirrorAriaDisabled(id); });
  setTitle('hub-pres-1', i18n?.concepts?.presidency || 'Predsedništvo'); mirrorAriaDisabled('hub-pres-1');
  ['hub-court-1','hub-court-10','hub-court-max'].forEach(id=>{ if (courtCfg) setTitle(id, `Sudovi: sledeći nivo košta ${courtCfg.costDP} DP`); mirrorAriaDisabled(id); });
  setTitle('hub-min-edu', (i18n?.concepts?.presidency||'') + ` — Ministarstvo obrazovanja (+${(balanceConfig?.executive?.ministries?.education?.effects?.dpMultiplier??0)*100}% DP)`);
  mirrorAriaDisabled('hub-min-edu');
  rkeys.forEach(k=>{ const cost=balanceConfig?.rights?.[k]?.costDP??0; setTitle(`hub-rights-${k}`, `${(i18n?.concepts?.[`${k}_rights`]||k)} — ${cost} DP`); mirrorAriaDisabled(`hub-rights-${k}`); });
  setTitle('hub-law-simple', `${i18n?.concepts?.simple_law||'Simple Law'} — ${(balanceConfig?.laws?.simple?.costDP ?? 10)} DP`); mirrorAriaDisabled('hub-law-simple');
  setTitle('hub-law-const', `${i18n?.concepts?.constitutional_amendment||'Constitutional Amendment'} — ${caCost} DP`); mirrorAriaDisabled('hub-law-const');
  setTitle('hub-law-treaty', `${i18n?.concepts?.international_treaty||'International Treaty'} — ${itCost} DP`); mirrorAriaDisabled('hub-law-treaty');

  // Render badges (elections)
  const badges = document.getElementById('badges');
  if (badges){
    badges.innerHTML='';
    if (s.elections?.active) {
      const b = document.createElement('span'); b.className='badge'; b.textContent = s.elections.buff==='high'?'Elections: HIGH':'Elections: LOW'; badges.appendChild(b);
    }
  }

  // Render achievements
  const achUl = document.getElementById('achievements-list');
  if (achUl){
    achUl.innerHTML='';
    const defs = balanceConfig?.achievements || {};
    Object.entries(defs).forEach(([key,def]) => {
      const li = document.createElement('li');
      const achieved = (s.achievements||[]).includes(key);
      li.className = achieved ? 'achieved' : '';
      li.textContent = `${def.title} — ${def.desc}${achieved?' ✔':''}`;
      achUl.appendChild(li);
    });
  }
}

function tick(dtSeconds) {
  const s = store.getState();
  s.resources.pop += balanceConfig.baseRates.popPerSec * dtSeconds;
  const dpMult = 1 + (s.policies?.ministries?.includes('education') ? (balanceConfig?.executive?.ministries?.education?.effects?.dpMultiplier ?? 0) : 0);
  const lawDpMult = (s.meta.constAmend||0) > 0 ? (balanceConfig?.laws?.constitutionalAmendment?.effects?.dpMultiplier ?? 0) : 0;
  let totalDpMult = (dpMult + lawDpMult);
  if (s.elections?.active && s.elections.buff === 'high') totalDpMult += (balanceConfig?.events?.elections?.effects?.high?.dpMultiplier ?? 0);
  s.resources.dp += (balanceConfig.baseRates.dpPerPop * s.resources.pop * totalDpMult) * dtSeconds;
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
  // International Treaty ii gain
  const iiPerSec = (s.meta.intlTreaties||0) * (balanceConfig?.laws?.internationalTreaty?.effects?.iiPerSec ?? 0);
  s.resources.ii += iiPerSec * dtSeconds;

  // Elections timing
  const conf = balanceConfig?.events?.elections;
  if (conf) {
    if (s.elections.active) {
      s.elections.timeLeft = Math.max(0, (s.elections.timeLeft || 0) - dtSeconds);
      if (s.elections.timeLeft === 0) {
        s.elections.active = false;
        s.elections.nextIn = conf.cycleSeconds;
        s.elections.buff = null;
        pushEvent(s, 'Izborni ciklus završen');
      }
    } else {
      s.elections.nextIn = Math.max(0, (s.elections.nextIn || conf.cycleSeconds) - dtSeconds);
      if (s.elections.nextIn === 0) {
        startElectionCycle(s);
        // unlock concept on first elections
        pushEvent(s, 'Pojam otključan: Elections');
      }
    }
  }
  store.setState(s);
}

function startElectionCycle(s){
  const conf = balanceConfig?.events?.elections;
  if (!conf) return;
  // turnout influenced by stability
  const turnout = Math.min(1, conf.baseTurnout + (s.resources.st * conf.turnoutStabilityFactor));
  const high = turnout >= conf.highTurnoutThreshold;
  s.elections.active = true;
  s.elections.timeLeft = conf.durationSeconds;
  s.elections.buff = high ? 'high' : 'low';
  const eff = high ? conf.effects.high : conf.effects.low;
  s.resources.st += eff.stDelta || 0;
  pushEvent(s, high ? `Izbori: visoka izlaznost (${Math.round(turnout*100)}%)` : `Izbori: niska izlaznost (${Math.round(turnout*100)}%)`);
  if (high) checkAchievements(s);
}

let last = 0; let acc = 0; let saveAcc = 0; let uiAcc = 0; const TICK = 1/60; const UI_INTERVAL = 0.25;
function loop(t) {
  if (!last) last = t;
  let dt = (t - last) / 1000;
  last = t;
  acc += dt;
  while (acc >= TICK) {
    tick(TICK);
    acc -= TICK;
    saveAcc += TICK;
    uiAcc += TICK;
  }
  if (saveAcc >= 5) {
    saveGame(store.getState());
    el.saveStatus.textContent = 'Sačuvano';
    setTimeout(() => { el.saveStatus.textContent = ''; }, 1200);
    saveAcc = 0;
  }
  if (uiAcc >= UI_INTERVAL) { updateUI(); uiAcc = 0; }
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
  // Bulk parliament
  document.getElementById('btn-buy-parliament-10')?.addEventListener('click', () => bulkBuyInstitution('parliament', 10));
  document.getElementById('btn-buy-parliament-max')?.addEventListener('click', () => bulkBuyInstitution('parliament', Infinity));
  // Control hub bindings (delegating to existing functions)
  document.getElementById('hub-parl-1')?.addEventListener('click', buyParliament);
  document.getElementById('hub-parl-10')?.addEventListener('click', () => bulkBuyInstitution('parliament', 10));
  document.getElementById('hub-parl-max')?.addEventListener('click', () => bulkBuyInstitution('parliament', Infinity));
  document.getElementById('hub-pres-1')?.addEventListener('click', () => document.getElementById('btn-buy-presidency')?.click());
  document.getElementById('hub-court-1')?.addEventListener('click', () => document.getElementById('btn-buy-courts')?.click());
  document.getElementById('hub-court-10')?.addEventListener('click', () => bulkBuyInstitution('courts', 10));
  document.getElementById('hub-court-max')?.addEventListener('click', () => bulkBuyInstitution('courts', Infinity));
  document.getElementById('hub-min-edu')?.addEventListener('click', () => document.getElementById('btn-buy-min-education')?.click());
  ['civil','human','social','economic','environmental'].forEach(k=>{
    document.getElementById(`hub-rights-${k}`)?.addEventListener('click', () => document.getElementById(`btn-rights-${k}`)?.click());
  });
  document.getElementById('hub-law-simple')?.addEventListener('click', () => document.getElementById('btn-simple-law')?.click());
  document.getElementById('hub-law-const')?.addEventListener('click', () => document.getElementById('btn-const-amend')?.click());
  document.getElementById('hub-law-treaty')?.addEventListener('click', () => document.getElementById('btn-intl-treaty')?.click());

  // Info tooltips: show concept snippets
  const showInfo = (key, anchorId) => {
    const text = i18n?.concepts?.[key]; if (!text) return;
    const anchor = document.getElementById(anchorId); if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const tip = document.createElement('div');
    tip.className = 'tooltip-bubble';
    tip.textContent = text;
    tip.style.left = `${rect.left + window.scrollX + rect.width/2}px`;
    tip.style.top = `${rect.top + window.scrollY + rect.height + 8}px`;
    document.body.appendChild(tip);
    setTimeout(()=> tip.remove(), 3000);
  };
  document.getElementById('info-leg')?.addEventListener('click', () => showInfo('parliament','info-leg'));
  document.getElementById('info-exec')?.addEventListener('click', () => showInfo('presidency','info-exec'));
  document.getElementById('info-jud')?.addEventListener('click', () => showInfo('courts','info-jud'));
  document.getElementById('info-elect')?.addEventListener('click', () => showInfo('elections','info-elect'));
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
    checkAchievements(s);
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
    checkAchievements(s);
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
    checkAchievements(s);
    store.setState(s);
    updateUI();
  });
  // Bulk courts
  document.getElementById('btn-buy-courts-10')?.addEventListener('click', () => bulkBuyInstitution('courts', 10));
  document.getElementById('btn-buy-courts-max')?.addEventListener('click', () => bulkBuyInstitution('courts', Infinity));

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
      checkAchievements(s);
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
    checkAchievements(s);
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
  const btnForceElection = document.getElementById('btn-force-election');
  btnForceElection?.addEventListener('click', () => { const s = store.getState(); startElectionCycle(s); store.setState(s); updateUI(); });
  // Constitutional Amendment
  const btnCA2 = document.getElementById('btn-const-amend');
  btnCA2?.addEventListener('click', () => {
    const s = store.getState();
    const cost = balanceConfig?.laws?.constitutionalAmendment?.costDP ?? 100;
    if (s.resources.dp < cost || (s.meta.constAmend||0) >= 1) return;
    s.resources.dp -= cost;
    s.meta.constAmend = (s.meta.constAmend||0) + 1;
    const eff = balanceConfig?.laws?.constitutionalAmendment?.effects || {};
    s.resources.st += eff.st || 0;
    // Apply dpMultiplier persistently via meta flag; handled in dp calc
    pushEvent(s, 'Usvojena Ustavna izmena');
    store.setState(s);
    updateUI();
  });
  // International Treaty
  const btnIT2 = document.getElementById('btn-intl-treaty');
  btnIT2?.addEventListener('click', () => {
    const s = store.getState();
    const cost = balanceConfig?.laws?.internationalTreaty?.costDP ?? 500;
    if (s.resources.dp < cost) return;
    s.resources.dp -= cost;
    s.meta.intlTreaties = (s.meta.intlTreaties||0) + 1;
    pushEvent(s, 'Potpisan međunarodni sporazum');
    store.setState(s);
    updateUI();
  });
  el.btnSave.addEventListener('click', () => {
    const s = store.getState();
    pushEvent(s, 'Progres sačuvan');
    store.setState(s);
    saveGame(s);
    el.saveStatus.textContent = 'Sačuvano'; setTimeout(()=> el.saveStatus.textContent='', 1200);
  });
  el.btnReset.addEventListener('click', () => {
    // open confirm overlay
    document.getElementById('confirm-reset')?.setAttribute('aria-hidden','false');
  });
  document.getElementById('reset-cancel')?.addEventListener('click', () => { document.getElementById('confirm-reset')?.setAttribute('aria-hidden','true'); });
  document.getElementById('reset-confirm')?.addEventListener('click', () => {
    document.getElementById('confirm-reset')?.setAttribute('aria-hidden','true');
    resetGame(store);
    const s = store.getState();
    pushEvent(s, 'Reset stanja');
    store.setState(s);
    updateUI();
  });
  // Export
  document.getElementById('btn-export')?.addEventListener('click', () => {
    const data = JSON.stringify(store.getState(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'nation-builder-save.json'; a.click();
    URL.revokeObjectURL(url);
  });
  // Import
  const inputImport = document.getElementById('input-import');
  inputImport?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try{
      const text = await file.text();
      const json = JSON.parse(text);
      store.setState(json);
      pushEvent(store.getState(), 'Save importovan');
      updateUI();
    }catch(err){
      console.warn('Import failed', err);
    }finally{
      e.target.value = '';
    }
  });

  // Tutorial onboarding
  initTutorial();

  updateUI();
  requestAnimationFrame(loop);
}

function getUnlockedConcepts(s){
  const set = new Set();
  if ((s.institutions.parliament||0) > 0) { set.add('parliament'); set.add('democracy'); set.add('republic'); set.add('separation_of_powers'); }
  if ((s.institutions.presidency||0) > 0) { set.add('presidency'); }
  if ((s.institutions.courts||0) > 0) { set.add('courts'); }
  const rightsMap = {
    civil: 'civil_rights', human: 'human_rights', social: 'social_rights', economic: 'economic_rights', environmental: 'environmental_rights'
  };
  (s.policies?.rights || []).forEach(r => { const k = rightsMap[r]; if (k) set.add(k); });
  return Array.from(set);
}

function checkAchievements(s){
  const defs = balanceConfig?.achievements || {};
  const have = new Set(s.achievements||[]);
  const add = key => { if (!have.has(key)) { have.add(key); pushEvent(s, `Dostignuće: ${(defs[key]?.title)||key}`); } };
  if ((s.institutions.parliament||0) >= 1) add('first_parliament');
  if ((s.meta.simpleLaws||0) >= 1) add('first_law');
  if ((s.institutions.parliament||0) >= 1 && (s.institutions.presidency||0) >= 1 && (s.institutions.courts||0) >= 1) add('tri_vlasti');
  if ((s.policies?.ministries||[]).includes('education')) add('edu_ministry');
  if (s.elections?.buff === 'high') add('elections_high');
  if ((s.institutions.courts||0) >= 3) add('courts_lvl3');
  if ((s.policies?.rights||[]).length >= 5) add('all_rights');
  if ((s.meta.constAmend||0) >= 1) add('const_amended');
  if ((s.meta.intlTreaties||0) >= 1) add('treaty_signed');
  // rate and stock targets
  const dpPs = (balanceConfig.baseRates.dpPerPop * s.resources.pop * (1 + (s.policies?.ministries?.includes('education') ? (balanceConfig?.executive?.ministries?.education?.effects?.dpMultiplier ?? 0) : 0) + ((s.meta.constAmend||0) > 0 ? (balanceConfig?.laws?.constitutionalAmendment?.effects?.dpMultiplier ?? 0) : 0) + (s.elections?.active && s.elections.buff==='high' ? (balanceConfig?.events?.elections?.effects?.high?.dpMultiplier ?? 0) : 0)));
  if (dpPs >= 10) add('dp_rate_10');
  if (s.resources.dp >= 1000) add('dp_1000');
  if (s.resources.pop >= 1000) add('pop_1000');
  s.achievements = Array.from(have);
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


