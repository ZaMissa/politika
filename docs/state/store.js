const SAVE_KEY = 'nbr:save:v0';

const defaultState = () => ({
  resources: { dp: 0, st: 0, pr: 0, ii: 0, pop: 0 },
  institutions: { parliament: 0, presidency: 0, courts: 0 },
  policies: { parties: [], rights: [], ministries: [] },
  adminSystem: 'centralized',
  era: 'archaic',
  unlocked: { tutorials: [], scenarios: [] },
  settings: { language: 'sr', a11y: { contrast: false, fontScale: 1.0 } },
  meta: { version: 0 }
});

export function createStore(){
  let state = defaultState();
  const listeners = new Set();
  const api = {
    getState: () => state,
    setState: (next) => { state = next; listeners.forEach(l=>l(state)); },
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); }
  };
  return api;
}

export function loadGame(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return null;
    const parsed = JSON.parse(raw);
    return migrate(parsed);
  }catch(e){
    console.warn('Load failed', e);
    return null;
  }
}

export function saveGame(state){
  try{
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }catch(e){
    console.warn('Save failed', e);
  }
}

export function resetGame(store){
  const fresh = defaultState();
  store.setState(fresh);
  try{ localStorage.removeItem(SAVE_KEY);}catch(_){/* noop */}
}

function migrate(state){
  return state;
}


